(() => {
  "use strict";

  const VERSION = "3.0.7";
  const META_KEY = "childRosterMetaV1";
  const BACKUP_KEY = "mitmach_welt_state_backup_v1";
  const BACKUP_RING_KEY = "mitmach_welt_backup_ring_v2";
  const SEED = {
    lucy:{ name:"Lucy", avatar:"🦄", accent:"#d070ba", theme:"magic", coins:24, seeds:7, completed:4, inventory:["lantern"] },
    noah:{ name:"Noah", avatar:"🐼", accent:"#55a5d5", theme:"meadow", coins:18, seeds:5, completed:3, inventory:[] },
    tius:{ name:"Tius", avatar:"🦁", accent:"#ef9f46", theme:"dino", coins:13, seeds:4, completed:2, inventory:[] },
    jari:{ name:"Jari", avatar:"🐸", accent:"#72ad67", theme:"farm", coins:16, seeds:6, completed:3, inventory:[] }
  };
  const SEED_IDS = Object.keys(SEED).sort();
  let stamping = false;
  let lastFingerprint = "";
  let uiCorrectionPending = false;

  const api = () => window.MitmachWelt;
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const normalizedChildren = state => Array.isArray(state?.children) ? state.children : [];
  const activeChildren = state => normalizedChildren(state).filter(child => child?.active !== false && !child?.deletedAt);

  function rosterFingerprint(children) {
    return normalizedChildren({ children })
      .map(child => [
        String(child?.id || ""),
        String(child?.name || ""),
        child?.active === false ? 0 : 1,
        Number(child?.deletedAt || 0),
        Number(child?.birthMonth || 0),
        Number(child?.birthYear || 0),
        child?.onboardingPending === true ? 1 : 0
      ].join("~"))
      .sort()
      .join("||");
  }

  function rosterMeta(state) {
    const row = state?.settings?.[META_KEY];
    return row && typeof row === "object" && !Array.isArray(row)
      ? { updatedAt:Number(row.updatedAt || 0), fingerprint:String(row.fingerprint || "") }
      : { updatedAt:0, fingerprint:"" };
  }

  function legacyRosterMoment(state) {
    return normalizedChildren(state).reduce((latest, child) => Math.max(
      latest,
      Number(child?.deletedAt || 0),
      Number(child?.createdAt || 0)
    ), 0);
  }

  function withRosterMeta(state, updatedAt = 0) {
    state.settings ||= {};
    const current = rosterMeta(state);
    state.settings[META_KEY] = {
      updatedAt:Number(updatedAt || current.updatedAt || 0),
      fingerprint:rosterFingerprint(state.children)
    };
    return state;
  }

  function sameArray(left, right) {
    return JSON.stringify(Array.isArray(left) ? left : []) === JSON.stringify(Array.isArray(right) ? right : []);
  }

  function isSeedRoster(state) {
    const children = normalizedChildren(state);
    if (children.length !== SEED_IDS.length) return false;
    const ids = children.map(child => String(child?.id || "")).sort();
    if (ids.join("|") !== SEED_IDS.join("|")) return false;
    return children.every(child => {
      const expected = SEED[child.id];
      return Boolean(expected)
        && child.name === expected.name
        && child.avatar === expected.avatar
        && child.accent === expected.accent
        && child.theme === expected.theme
        && Number(child.coins || 0) === expected.coins
        && Number(child.seeds || 0) === expected.seeds
        && Number(child.stars || 0) === 0
        && Number(child.completed || 0) === expected.completed
        && sameArray(child.inventory, expected.inventory)
        && child.active !== false
        && !child.deletedAt
        && !child.birthMonth
        && !child.birthYear;
    });
  }

  function readJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function backupCandidates() {
    const result = [];
    const direct = readJson(BACKUP_KEY);
    if (direct?.children) result.push({ createdAt:0, data:direct });
    const ring = readJson(BACKUP_RING_KEY);
    if (Array.isArray(ring)) {
      ring.forEach(item => {
        if (item?.data?.children) result.push({ createdAt:Number(item.createdAt || 0), data:item.data });
      });
    }
    return result.sort((a,b) => b.createdAt - a.createdAt);
  }

  function mergeProgressOntoRoster(rosterChildren, currentChildren) {
    const current = new Map(normalizedChildren({children:currentChildren}).map(child => [child.id, child]));
    const progressFields = [
      "coins","seeds","stars","completed","inventory","worldName","companion","companionMotion",
      "companionSearchEnabled","companionSearch","companionNextSearchAt","companionRestUntil",
      "companionRestStartedAt","companionLastFood","companionLastPlayAt","interfaceStyle","lastFirstAt"
    ];
    return normalizedChildren({children:rosterChildren}).map(rosterChild => {
      const live = current.get(rosterChild.id);
      if (!live) return { ...rosterChild };
      const merged = { ...rosterChild };
      progressFields.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(live, key)) merged[key] = clone(live[key]);
      });
      return merged;
    });
  }

  function recoverSeedRosterIfPossible(mw) {
    const current = mw.getData();
    if (!isSeedRoster(current)) return false;
    const candidate = backupCandidates().find(item => !isSeedRoster(item.data) && Array.isArray(item.data.children) && item.data.children.length);
    if (!candidate) return false;
    const repaired = clone(current);
    repaired.children = mergeProgressOntoRoster(candidate.data.children, current.children);
    withRosterMeta(repaired, Date.now());
    stamping = true;
    try {
      const ok = mw.replaceData(repaired, { snapshot:true, notify:true, render:true, rosterRecovery:true });
      if (ok) mw.showToast?.("Kinderbestand wurde aus der lokalen Sicherung wiederhergestellt.");
      return Boolean(ok);
    } finally { stamping = false; }
  }

  function deviceRole() {
    return window.MitmachWeltSync?.getStatus?.().role || "both";
  }

  function controlledRosterFields(from, into = {}) {
    return {
      ...into,
      id:from.id,
      name:from.name,
      active:from.active !== false,
      deletedAt:Number(from.deletedAt || 0),
      birthMonth:Number(from.birthMonth || 0),
      birthYear:Number(from.birthYear || 0),
      onboardingPending:from.onboardingPending === true,
      createdAt:Number(from.createdAt || into.createdAt || Date.now())
    };
  }

  function preserveRoster(localState, incomingState) {
    const incomingById = new Map(normalizedChildren(incomingState).map(child => [child.id, child]));
    return normalizedChildren(localState).map(localChild => {
      const incoming = incomingById.get(localChild.id);
      if (!incoming) return { ...localChild };
      return controlledRosterFields(localChild, { ...localChild, ...incoming });
    });
  }

  function chooseIncomingRoster(localState, incomingState) {
    const localSeed = isSeedRoster(localState);
    const incomingSeed = isSeedRoster(incomingState);
    if (localSeed !== incomingSeed) return localSeed && !incomingSeed;

    const localMeta = rosterMeta(localState);
    const incomingMeta = rosterMeta(incomingState);
    if (incomingMeta.updatedAt !== localMeta.updatedAt) return incomingMeta.updatedAt > localMeta.updatedAt;

    const localFp = rosterFingerprint(localState.children);
    const incomingFp = rosterFingerprint(incomingState.children);
    if (localFp === incomingFp) return true;

    if (!localMeta.updatedAt && !incomingMeta.updatedAt) {
      const localMoment = legacyRosterMoment(localState);
      const incomingMoment = legacyRosterMoment(incomingState);
      if (Math.abs(incomingMoment - localMoment) > 1000) return incomingMoment > localMoment;
    }

    const role = deviceRole();
    if (role === "child") return true;
    if (role === "educator") return false;
    return false;
  }

  function mergeCriticalClaimStates(localState, incomingState) {
    const localClaims = new Map((localState?.claims || []).map(claim => [claim?.id, claim]).filter(([id]) => Boolean(id)));
    incomingState.claims = (incomingState.claims || []).map(incoming => {
      const local = localClaims.get(incoming?.id);
      if (!local) return incoming;
      const finalStatus = status => ["approved","declined","released"].includes(status);
      const localMoment = Math.max(Number(local.reviewedAt || 0), Number(local.reportedAt || 0), Number(local.createdAt || 0));
      const incomingMoment = Math.max(Number(incoming.reviewedAt || 0), Number(incoming.reportedAt || 0), Number(incoming.createdAt || 0));
      if (finalStatus(local.status) && !finalStatus(incoming.status) && localMoment >= incomingMoment) return { ...incoming, ...local };
      if (finalStatus(local.status) && finalStatus(incoming.status) && localMoment > incomingMoment) return { ...incoming, ...local };
      return incoming;
    });
    return incomingState;
  }

  function sanitizeOpenClaims(state) {
    const activeIds = new Set(activeChildren(state).map(child => child.id));
    state.claims = (state.claims || []).filter(claim => {
      if (!["reserved","reported"].includes(claim?.status)) return true;
      const validIds = (claim.childIds || []).filter(id => activeIds.has(id));
      if (!validIds.length) return false;
      claim.childIds = validIds;
      if (Array.isArray(claim.reservedChildIds)) claim.reservedChildIds = claim.reservedChildIds.filter(id => activeIds.has(id));
      if (Array.isArray(claim.actualParticipantIds)) claim.actualParticipantIds = claim.actualParticipantIds.filter(id => activeIds.has(id));
      if (Array.isArray(claim.rewardAllocations)) claim.rewardAllocations = claim.rewardAllocations.filter(item => activeIds.has(item?.childId));
      return true;
    });
    return state;
  }

  function installReplaceGuard(mw) {
    if (mw.__mw307RosterGuard) return;
    const original = mw.replaceData.bind(mw);
    mw.replaceData = (nextData, options = {}) => {
      const local = mw.getData();
      const incoming = clone(nextData || {});
      incoming.settings ||= {};

      const localFp = rosterFingerprint(local.children);
      const incomingFp = rosterFingerprint(incoming.children);
      if (localFp !== incomingFp) {
        if (!chooseIncomingRoster(local, incoming)) {
          incoming.children = preserveRoster(local, incoming);
          const localMeta = rosterMeta(local);
          incoming.settings[META_KEY] = { updatedAt:localMeta.updatedAt, fingerprint:localFp };
        } else {
          withRosterMeta(incoming, rosterMeta(incoming).updatedAt);
        }
      } else {
        withRosterMeta(incoming, Math.max(rosterMeta(local).updatedAt, rosterMeta(incoming).updatedAt));
      }

      mergeCriticalClaimStates(local, incoming);
      sanitizeOpenClaims(incoming);
      return original(incoming, options);
    };
    Object.defineProperty(mw, "__mw307RosterGuard", { value:true });
  }

  function correctedMissionCount(state) {
    const activeIds = new Set(activeChildren(state).map(child => child.id));
    return (state.personalGoals || []).filter(goal => goal?.active !== false && activeIds.has(goal?.childId)).length;
  }

  function scheduleUiCorrection() {
    if (uiCorrectionPending) return;
    uiCorrectionPending = true;
    setTimeout(() => {
      uiCorrectionPending = false;
      const mw = api();
      if (!mw?.getData) return;
      const state = mw.getData();
      const activeCount = activeChildren(state).length;
      const missionCount = correctedMissionCount(state);
      const reportedCount = (state.claims || []).filter(claim => claim?.status === "reported").length;

      document.querySelectorAll(".admin-grid .card").forEach(card => {
        const text = card.querySelector("p")?.textContent || "";
        const heading = card.querySelector("h3");
        if (text.includes("aktive Kinderprofile") && heading) heading.textContent = `👧 ${activeCount}`;
        if (text.includes("aktive Tagesmissionen") && heading) heading.textContent = `🌱 ${missionCount}`;
      });

      document.querySelectorAll(".panel > h3").forEach(heading => {
        if (/^Aktive Kinder\s*\(/.test(heading.textContent || "")) heading.textContent = `Aktive Kinder (${activeCount})`;
      });

      document.querySelectorAll('button[data-action="nav-educator"] p.muted').forEach(node => {
        node.textContent = `${reportedCount} offene Bestätigung${reportedCount === 1 ? "" : "en"} · ${missionCount} aktive Tagesmission${missionCount === 1 ? "" : "en"}.`;
      });
    }, 0);
  }

  function installRosterStamping(mw) {
    lastFingerprint = rosterFingerprint(mw.getData().children);
    mw.subscribeToSaves?.(() => {
      scheduleUiCorrection();
      if (stamping) return;
      const current = mw.getData();
      const fingerprint = rosterFingerprint(current.children);
      if (fingerprint === lastFingerprint) return;
      lastFingerprint = fingerprint;
      const stamped = clone(current);
      withRosterMeta(stamped, Date.now());
      stamping = true;
      try { mw.replaceData(stamped, { snapshot:true, notify:true, render:false, rosterStamp:true }); }
      finally { stamping = false; }
    });
  }

  function updateVersion(mw) {
    try { mw.version = VERSION; } catch {}
    if (window.MitmachWeltSync) try { window.MitmachWeltSync.version = VERSION; } catch {}
    document.title = `Mitmach-Welt ${VERSION}`;
    const label = document.querySelector(".eyebrow");
    if (label?.textContent?.includes("Projekt Sonnenblume")) label.textContent = `Projekt Sonnenblume · Version ${VERSION}`;
  }

  function init() {
    const mw = api();
    if (!mw?.getData || !mw?.replaceData || !mw?.subscribeToSaves) return setTimeout(init, 100);
    installReplaceGuard(mw);
    recoverSeedRosterIfPossible(mw);
    installRosterStamping(mw);
    new MutationObserver(records => {
      if (records.some(record => record.attributeName === "data-screen")) scheduleUiCorrection();
    }).observe(document.body, { attributes:true, attributeFilter:["data-screen"] });
    updateVersion(mw);
    scheduleUiCorrection();
    setTimeout(() => { updateVersion(mw); scheduleUiCorrection(); }, 700);
    mw.rosterIntegrity = {
      version:VERSION,
      activeCount:() => activeChildren(mw.getData()).length,
      activeMissionCount:() => correctedMissionCount(mw.getData()),
      fingerprint:() => rosterFingerprint(mw.getData().children),
      isSeedRoster:() => isSeedRoster(mw.getData())
    };
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
