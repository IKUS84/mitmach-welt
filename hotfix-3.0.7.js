(() => {
  "use strict";

  const VERSION = "3.0.7";
  const META_KEY = "childRosterMetaV1";
  const BACKUP_KEY = "mitmach_welt_state_backup_v1";
  const BACKUP_RING_KEY = "mitmach_welt_backup_ring_v2";
  const SEED_IDS = ["jari","lucy","noah","tius"];
  let stamping = false;
  let lastFingerprint = "";

  const api = () => window.MitmachWelt;
  const clone = value => JSON.parse(JSON.stringify(value));
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

  function withRosterMeta(state, updatedAt = 0) {
    state.settings ||= {};
    const current = rosterMeta(state);
    state.settings[META_KEY] = {
      updatedAt:Number(updatedAt || current.updatedAt || 0),
      fingerprint:rosterFingerprint(state.children)
    };
    return state;
  }

  function isSeedRoster(state) {
    const children = normalizedChildren(state);
    if (children.length !== 4) return false;
    const ids = children.map(child => String(child?.id || "")).sort();
    if (ids.join("|") !== SEED_IDS.join("|")) return false;
    const names = new Map(children.map(child => [String(child.id), String(child.name || "")]));
    return names.get("lucy") === "Lucy" && names.get("noah") === "Noah" && names.get("tius") === "Tius" && names.get("jari") === "Jari";
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

    const role = deviceRole();
    if (role === "child") return true;
    if (role === "educator") return false;
    return incomingMeta.updatedAt > 0;
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

  function installRosterStamping(mw) {
    lastFingerprint = rosterFingerprint(mw.getData().children);
    mw.subscribeToSaves?.(() => {
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
    updateVersion(mw);
    setTimeout(() => updateVersion(mw), 700);
    mw.rosterIntegrity = {
      version:VERSION,
      activeCount:() => activeChildren(mw.getData()).length,
      fingerprint:() => rosterFingerprint(mw.getData().children),
      isSeedRoster:() => isSeedRoster(mw.getData())
    };
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
