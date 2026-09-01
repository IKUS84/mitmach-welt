(() => {
  "use strict";

  const VERSION = "3.0.7";
  const ROSTER_META = "childRosterMetaV2";
  const RELEASES = "taskReservationReleaseV2";
  const BACKUP_KEY = "mitmach_welt_state_backup_v1";
  const BACKUP_RING_KEY = "mitmach_welt_backup_ring_v2";
  const KEEP_MS = 45 * 24 * 60 * 60 * 1000;
  let internal = false;
  let lastRoster = "";
  let versionQueued = false;

  const mw = () => window.MitmachWelt;
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const mapOf = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const role = () => window.MitmachWeltSync?.getStatus?.().role || "both";
  const now = () => Date.now();

  function childShape(child) {
    return [
      String(child?.id || ""), String(child?.name || ""), child?.active === false ? 0 : 1,
      Number(child?.deletedAt || 0), Number(child?.birthMonth || 0), Number(child?.birthYear || 0),
      child?.onboardingPending === true ? 1 : 0
    ];
  }

  function rosterFingerprint(children) {
    return (Array.isArray(children) ? children : []).map(childShape).sort((a,b) => a[0].localeCompare(b[0])).map(row => row.join("~")).join("||");
  }

  function rosterMeta(state) {
    const row = mapOf(state?.settings?.[ROSTER_META]);
    return { updatedAt:Number(row.updatedAt || 0), fingerprint:String(row.fingerprint || "") };
  }

  function stampRoster(state, timestamp = now()) {
    state.settings ||= {};
    state.settings[ROSTER_META] = { updatedAt:timestamp, fingerprint:rosterFingerprint(state.children) };
  }

  function keepLocalRoster(local, incoming) {
    const remote = new Map((incoming.children || []).map(child => [child?.id, child]));
    incoming.children = (local.children || []).map(localChild => {
      const merged = remote.has(localChild?.id) ? { ...clone(localChild), ...clone(remote.get(localChild.id)) } : clone(localChild);
      merged.id = localChild.id;
      merged.name = localChild.name;
      merged.active = localChild.active !== false;
      merged.deletedAt = Number(localChild.deletedAt || 0);
      merged.birthMonth = Number(localChild.birthMonth || 0);
      merged.birthYear = Number(localChild.birthYear || 0);
      merged.onboardingPending = localChild.onboardingPending === true;
      return merged;
    });
    incoming.settings ||= {};
    incoming.settings[ROSTER_META] = clone(local.settings?.[ROSTER_META] || { updatedAt:0, fingerprint:rosterFingerprint(local.children) });
  }

  function incomingRosterWins(local, incoming) {
    const localFp = rosterFingerprint(local.children);
    const remoteFp = rosterFingerprint(incoming.children);
    if (localFp === remoteFp) return true;
    const a = rosterMeta(local).updatedAt;
    const b = rosterMeta(incoming).updatedAt;
    if (b !== a) return b > a;
    return role() === "child";
  }

  function releaseMap(state) {
    const result = clone(mapOf(state?.settings?.[RELEASES]));
    const cutoff = now() - KEEP_MS;
    Object.keys(result).forEach(id => {
      const row = mapOf(result[id]);
      const newest = Math.max(Number(row.releasedAt || 0), ...Object.values(mapOf(row.removedChildIds)).map(Number));
      if (newest > 0 && newest < cutoff) delete result[id];
    });
    return result;
  }

  function mergeReleaseMaps(local, incoming) {
    const merged = releaseMap(incoming);
    Object.entries(releaseMap(local)).forEach(([claimId, raw]) => {
      const left = mapOf(raw);
      const right = mapOf(merged[claimId]);
      const removed = { ...mapOf(right.removedChildIds) };
      Object.entries(mapOf(left.removedChildIds)).forEach(([childId, ts]) => {
        removed[childId] = Math.max(Number(removed[childId] || 0), Number(ts || 0));
      });
      merged[claimId] = {
        taskId:String(left.taskId || right.taskId || ""),
        date:String(left.date || right.date || ""),
        fullRelease:Boolean(left.fullRelease || right.fullRelease),
        releasedAt:Math.max(Number(left.releasedAt || 0), Number(right.releasedAt || 0)),
        originalChildIds:[...new Set([...(right.originalChildIds || []), ...(left.originalChildIds || [])])],
        removedChildIds:removed
      };
    });
    return merged;
  }

  function claimMoment(claim) {
    return Math.max(Number(claim?.reviewedAt || 0), Number(claim?.reportedAt || 0), Number(claim?.releasedAt || 0), Number(claim?.createdAt || 0));
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function applyReleases(state, releases) {
    state.claims = Array.isArray(state.claims) ? state.claims : [];
    const current = now();
    const today = todayKey();
    state.claims.forEach(claim => {
      if (!claim?.id || !["reserved","reported"].includes(claim.status)) return;
      const row = mapOf(releases[claim.id]);
      const removed = new Set(Object.entries(mapOf(row.removedChildIds))
        .filter(([,ts]) => Number(ts || 0) >= Number(claim.createdAt || 0)).map(([id]) => id));
      if (removed.size) {
        claim.childIds = (claim.childIds || []).filter(id => !removed.has(id));
        if (Array.isArray(claim.reservedChildIds)) claim.reservedChildIds = claim.reservedChildIds.filter(id => !removed.has(id));
        if (Array.isArray(claim.actualParticipantIds)) claim.actualParticipantIds = claim.actualParticipantIds.filter(id => !removed.has(id));
        if (Array.isArray(claim.rewardAllocations)) claim.rewardAllocations = claim.rewardAllocations.filter(item => !removed.has(item?.childId));
      }
      const explicit = row.fullRelease && Number(row.releasedAt || 0) >= claimMoment(claim);
      const expired = claim.status === "reserved" && Number(claim.expiresAt || 0) > 0 && Number(claim.expiresAt) <= current;
      const oldDay = claim.status === "reserved" && Boolean(claim.date) && claim.date !== today;
      const empty = claim.status === "reserved" && !(claim.childIds || []).length;
      if (explicit || expired || oldDay || empty) {
        claim.status = "released";
        claim.releasedAt = Math.max(Number(claim.releasedAt || 0), Number(row.releasedAt || 0), current);
        if (!(claim.childIds || []).length && Array.isArray(row.originalChildIds) && row.originalChildIds.length) claim.childIds = [...row.originalChildIds];
      }
    });
  }

  function prepare(local, nextData) {
    const next = clone(nextData || {});
    next.settings ||= {};
    const releases = mergeReleaseMaps(local, next);
    next.settings[RELEASES] = releases;
    applyReleases(next, releases);
    if (!incomingRosterWins(local, next)) keepLocalRoster(local, next);
    else if (rosterFingerprint(local.children) !== rosterFingerprint(next.children) && !rosterMeta(next).updatedAt) stampRoster(next);
    return next;
  }

  function saveRelease(beforeClaim, childId, timestamp, fullRelease = false) {
    const api = mw();
    if (!api || !beforeClaim?.id) return;
    const state = api.getData();
    state.settings ||= {};
    const releases = releaseMap(state);
    const row = mapOf(releases[beforeClaim.id]);
    const removed = { ...mapOf(row.removedChildIds) };
    if (childId) removed[childId] = Math.max(Number(removed[childId] || 0), timestamp);
    const remaining = childId ? (beforeClaim.childIds || []).filter(id => id !== childId) : [];
    const shouldRelease = fullRelease || (childId && remaining.length === 0);
    releases[beforeClaim.id] = {
      taskId:String(beforeClaim.taskId || row.taskId || ""),
      date:String(beforeClaim.date || row.date || ""),
      fullRelease:Boolean(row.fullRelease || shouldRelease),
      releasedAt:shouldRelease ? Math.max(Number(row.releasedAt || 0), timestamp) : Number(row.releasedAt || 0),
      originalChildIds:[...new Set([...(row.originalChildIds || []), ...(beforeClaim.childIds || [])])],
      removedChildIds:removed
    };
    state.settings[RELEASES] = releases;
    if (shouldRelease && !(state.claims || []).some(claim => claim?.id === beforeClaim.id)) {
      state.claims = [...(state.claims || []), { ...clone(beforeClaim), status:"released", releasedAt:timestamp, reportedAt:0, reviewedAt:0 }];
    }
    internal = true;
    try { api.replaceData(state, { snapshot:true, notify:true, render:false, reservationRelease307:true }); }
    finally { internal = false; }
  }

  function clearReleaseOnRejoin(childId, taskId) {
    const api = mw();
    if (!api) return;
    const state = api.getData();
    const claim = (state.claims || []).find(item => item?.status === "reserved" && item?.taskId === taskId && (item.childIds || []).includes(childId));
    if (!claim) return;
    const releases = releaseMap(state);
    const row = mapOf(releases[claim.id]);
    if (!Object.keys(row).length) return;
    const removed = { ...mapOf(row.removedChildIds) };
    delete removed[childId];
    if (!Object.keys(removed).length) delete releases[claim.id];
    else releases[claim.id] = { ...row, fullRelease:false, releasedAt:0, removedChildIds:removed };
    state.settings ||= {};
    state.settings[RELEASES] = releases;
    internal = true;
    try { api.replaceData(state, { snapshot:true, notify:true, render:false, reservationRejoin307:true }); }
    finally { internal = false; }
  }

  function repairOldReservations() {
    const api = mw();
    if (!api) return;
    const state = api.getData();
    const before = JSON.stringify((state.claims || []).map(c => [c.id,c.status,c.releasedAt,c.childIds]));
    applyReleases(state, releaseMap(state));
    const after = JSON.stringify((state.claims || []).map(c => [c.id,c.status,c.releasedAt,c.childIds]));
    if (before === after) return;
    internal = true;
    try { api.replaceData(state, { snapshot:true, notify:true, render:true, reservationRepair307:true }); }
    finally { internal = false; }
  }

  function readJson(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  function isSeedRoster(children) {
    const ids = (Array.isArray(children) ? children : []).map(child => String(child?.id || "")).sort();
    return ids.length === 4 && ids.join("|") === "jari|lucy|noah|tius";
  }

  function recoverSeedRoster() {
    const api = mw();
    if (!api || role() === "child") return;
    const state = api.getData();
    if (!isSeedRoster(state.children)) return;
    const candidates = [];
    const direct = readJson(BACKUP_KEY);
    if (direct?.children) candidates.push({ at:0, data:direct });
    const ring = readJson(BACKUP_RING_KEY);
    if (Array.isArray(ring)) ring.forEach(item => { if (item?.data?.children) candidates.push({ at:Number(item.createdAt || 0), data:item.data }); });
    const candidate = candidates.filter(item => item.data.children.length >= 5 && !isSeedRoster(item.data.children)).sort((a,b) => b.at-a.at)[0];
    if (!candidate) return;
    const live = new Map((state.children || []).map(child => [child?.id, child]));
    const repaired = clone(state);
    repaired.children = candidate.data.children.map(saved => {
      const current = live.get(saved?.id);
      if (!current) return clone(saved);
      return { ...clone(saved), coins:current.coins, seeds:current.seeds, stars:current.stars, completed:current.completed, inventory:clone(current.inventory), companion:clone(current.companion), worldName:current.worldName, interfaceStyle:current.interfaceStyle };
    });
    stampRoster(repaired);
    internal = true;
    try {
      if (api.replaceData(repaired, { snapshot:true, notify:true, render:true, rosterRecovery307:true })) api.showToast?.("Der aktuelle Kinderbestand wurde aus der lokalen Sicherung wiederhergestellt.");
    } finally { internal = false; }
  }

  function stampRosterIfChanged() {
    const api = mw();
    if (!api || internal || role() === "child") return;
    const state = api.getData();
    const fp = rosterFingerprint(state.children);
    if (fp === lastRoster) return;
    lastRoster = fp;
    const stamped = clone(state);
    stampRoster(stamped);
    internal = true;
    try { api.replaceData(stamped, { snapshot:true, notify:true, render:false, rosterStamp307:true }); }
    finally { internal = false; }
  }

  function ensureRosterMeta() {
    const api = mw();
    if (!api || role() === "child") return;
    const state = api.getData();
    lastRoster = rosterFingerprint(state.children);
    if (rosterMeta(state).updatedAt) return;
    const stamped = clone(state);
    stampRoster(stamped);
    internal = true;
    try { api.replaceData(stamped, { snapshot:true, notify:true, render:false, rosterStamp307:true }); }
    finally { internal = false; }
  }

  function updateVersion() {
    const api = mw();
    if (!api) return;
    try { api.version = VERSION; } catch {}
    if (window.MitmachWeltSync) try { window.MitmachWeltSync.version = VERSION; } catch {}
    const label = document.querySelector(".eyebrow");
    if (label?.textContent?.includes("Projekt Sonnenblume")) label.textContent = `Projekt Sonnenblume · Version ${VERSION}`;
    document.title = `Mitmach-Welt ${VERSION}`;
  }

  function queueVersion() {
    if (versionQueued) return;
    versionQueued = true;
    setTimeout(() => { versionQueued = false; updateVersion(); }, 0);
  }

  function init() {
    const api = mw();
    if (!api?.getData || !api?.replaceData || !api?.subscribeToSaves) return setTimeout(init, 100);
    if (api.__mw307Stable) return;

    const originalReplace = api.replaceData.bind(api);
    api.replaceData = (nextData, options = {}) => internal ? originalReplace(nextData, options) : originalReplace(prepare(api.getData(), nextData), options);
    Object.defineProperty(api, "__mw307Stable", { value:true });

    recoverSeedRoster();
    ensureRosterMeta();
    repairOldReservations();

    document.addEventListener("click", event => {
      const leave = event.target.closest?.('[data-action="leave-claim"][data-child-id][data-claim-id]');
      if (leave) {
        const claim = (api.getData().claims || []).find(item => item?.id === leave.dataset.claimId);
        const childId = String(leave.dataset.childId || "");
        if (claim?.status === "reserved" && (claim.childIds || []).includes(childId)) {
          const timestamp = now();
          setTimeout(() => saveRelease(claim, childId, timestamp, false), 0);
        }
        return;
      }
      const release = event.target.closest?.('[data-action="release-reservation"][data-claim-id]');
      if (release) {
        const claim = (api.getData().claims || []).find(item => item?.id === release.dataset.claimId);
        if (claim?.status === "reserved") { const timestamp = now(); setTimeout(() => saveRelease(claim, "", timestamp, true), 0); }
        return;
      }
      const reserve = event.target.closest?.('[data-action="reserve-task"][data-child-id][data-task-id]');
      if (reserve) setTimeout(() => clearReleaseOnRejoin(String(reserve.dataset.childId || ""), String(reserve.dataset.taskId || "")), 0);
    }, true);

    api.subscribeToSaves(() => {
      if (!internal) stampRosterIfChanged();
      queueVersion();
    });

    new MutationObserver(records => {
      if (records.some(record => record.attributeName === "data-screen")) queueVersion();
    }).observe(document.body, { attributes:true, attributeFilter:["data-screen"] });

    updateVersion();
    setTimeout(updateVersion, 750);
    api.stable307 = { version:VERSION, rosterFingerprint:() => rosterFingerprint(api.getData().children), releaseCount:() => Object.keys(releaseMap(api.getData())).length };
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
