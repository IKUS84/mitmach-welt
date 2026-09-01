(() => {
  "use strict";

  const VERSION = "3.0.9";
  const LIFECYCLE_KEY = "taskReservationLifecycleV2";
  const TOMBSTONE_KEY = "taskReservationTombstonesV1";
  const DEFAULT_RESERVATION_MINUTES = 120;
  const KEEP_MS = 45 * 24 * 60 * 60 * 1000;
  const UPDATE_CHECK_MS = 10 * 60 * 1000;
  let applying = false;
  let repairQueued = false;
  let lastUpdateCheckAt = 0;

  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const now = () => Date.now();
  const api = () => window.MitmachWelt;

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function objectMap(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function lifecycleMap(state) {
    return clone(objectMap(state?.settings?.[LIFECYCLE_KEY]));
  }

  function normalizeRecord(raw = {}) {
    return {
      taskId:String(raw.taskId || ""),
      date:String(raw.date || ""),
      selectedAtByChild:Object.fromEntries(Object.entries(objectMap(raw.selectedAtByChild)).map(([id, ts]) => [id, Number(ts || 0)])),
      removedAtByChild:Object.fromEntries(Object.entries(objectMap(raw.removedAtByChild)).map(([id, ts]) => [id, Number(ts || 0)])),
      expiresAt:Number(raw.expiresAt || 0),
      fullyReleasedAt:Number(raw.fullyReleasedAt || 0),
      lastSeenAt:Number(raw.lastSeenAt || 0)
    };
  }

  function claimMoment(claim) {
    return Math.max(
      Number(claim?.releasedAt || 0),
      Number(claim?.reviewedAt || 0),
      Number(claim?.reportedAt || 0),
      Number(claim?.createdAt || 0)
    );
  }

  function taskFor(state, taskId) {
    return (state?.tasks || []).find(task => task?.id === taskId) || null;
  }

  function reservationMinutes(state, taskId) {
    const task = taskFor(state, taskId);
    const value = Number(task?.reservationMinutes || state?.settings?.defaultReservationMinutes || DEFAULT_RESERVATION_MINUTES);
    return Math.min(720, Math.max(15, Number.isFinite(value) ? value : DEFAULT_RESERVATION_MINUTES));
  }

  function mergeLifecycle(leftState, rightState) {
    const left = lifecycleMap(leftState);
    const right = lifecycleMap(rightState);
    const merged = {};
    const cutoff = now() - KEEP_MS;
    const ids = new Set([...Object.keys(left), ...Object.keys(right)]);

    ids.forEach(claimId => {
      const a = normalizeRecord(left[claimId]);
      const b = normalizeRecord(right[claimId]);
      const rec = {
        taskId:a.taskId || b.taskId,
        date:a.date || b.date,
        selectedAtByChild:{ ...b.selectedAtByChild },
        removedAtByChild:{ ...b.removedAtByChild },
        expiresAt:Math.max(a.expiresAt, b.expiresAt),
        fullyReleasedAt:Math.max(a.fullyReleasedAt, b.fullyReleasedAt),
        lastSeenAt:Math.max(a.lastSeenAt, b.lastSeenAt)
      };
      Object.entries(a.selectedAtByChild).forEach(([childId, ts]) => {
        rec.selectedAtByChild[childId] = Math.max(Number(rec.selectedAtByChild[childId] || 0), Number(ts || 0));
      });
      Object.entries(a.removedAtByChild).forEach(([childId, ts]) => {
        rec.removedAtByChild[childId] = Math.max(Number(rec.removedAtByChild[childId] || 0), Number(ts || 0));
      });
      const newest = Math.max(
        rec.expiresAt,
        rec.fullyReleasedAt,
        rec.lastSeenAt,
        ...Object.values(rec.selectedAtByChild).map(Number),
        ...Object.values(rec.removedAtByChild).map(Number)
      );
      if (!newest || newest >= cutoff) merged[claimId] = rec;
    });
    return merged;
  }

  function foldHistory(state, map) {
    const claims = new Map((state?.claims || []).map(claim => [claim?.id, claim]).filter(([id]) => Boolean(id)));
    (state?.history || []).forEach(entry => {
      const claimId = String(entry?.claimId || "");
      if (!claimId) return;
      const claim = claims.get(claimId);
      const rec = normalizeRecord(map[claimId]);
      rec.taskId ||= String(entry?.taskId || claim?.taskId || "");
      rec.date ||= String(claim?.date || "");
      const ts = Number(entry?.timestamp || 0);

      if (entry?.type === "task_reserved" && entry?.childId && ts > 0) {
        rec.selectedAtByChild[entry.childId] = Math.max(Number(rec.selectedAtByChild[entry.childId] || 0), ts);
      }
      if (entry?.type === "reservation_left" && entry?.childId && ts > 0) {
        rec.removedAtByChild[entry.childId] = Math.max(Number(rec.removedAtByChild[entry.childId] || 0), ts);
      }
      if (["reservation_released", "reservation_auto_released"].includes(entry?.type) && ts > 0) {
        rec.fullyReleasedAt = Math.max(rec.fullyReleasedAt, ts);
      }
      map[claimId] = rec;
    });

    const tombstones = objectMap(state?.settings?.[TOMBSTONE_KEY]);
    Object.entries(tombstones).forEach(([claimId, raw]) => {
      const rec = normalizeRecord(map[claimId]);
      rec.taskId ||= String(raw?.taskId || "");
      rec.date ||= String(raw?.date || "");
      const fullRelease = Boolean(raw?.fullRelease);
      const releasedAt = Number(raw?.releasedAt || 0);
      if (fullRelease && releasedAt > 0) rec.fullyReleasedAt = Math.max(rec.fullyReleasedAt, releasedAt);
      Object.entries(objectMap(raw?.removedChildIds)).forEach(([childId, ts]) => {
        rec.removedAtByChild[childId] = Math.max(Number(rec.removedAtByChild[childId] || 0), Number(ts || 0));
      });
      map[claimId] = rec;
    });
    return map;
  }

  function inferLifecycleForClaims(state, map) {
    const currentTime = now();
    (state?.claims || []).forEach(claim => {
      if (!claim?.id || !["reserved", "reported", "released"].includes(claim.status)) return;
      const rec = normalizeRecord(map[claim.id]);
      rec.taskId ||= String(claim.taskId || "");
      rec.date ||= String(claim.date || "");
      rec.lastSeenAt = Math.max(rec.lastSeenAt, currentTime);

      const selectedHistoryTimes = Object.values(rec.selectedAtByChild).map(Number).filter(ts => ts > 0);
      const selectedAnchor = selectedHistoryTimes.length
        ? Math.min(...selectedHistoryTimes)
        : Number(claim.createdAt || 0);

      (claim.childIds || []).forEach(childId => {
        if (!(Number(rec.selectedAtByChild[childId]) > 0) && selectedAnchor > 0) {
          rec.selectedAtByChild[childId] = selectedAnchor;
        }
      });

      if (!(rec.expiresAt > 0) && claim.status === "reserved" && selectedAnchor > 0) {
        rec.expiresAt = selectedAnchor + reservationMinutes(state, claim.taskId) * 60 * 1000;
      }
      if (claim.status === "released") {
        const release = Number(claim.releasedAt || 0);
        if (release > 0) rec.fullyReleasedAt = Math.max(rec.fullyReleasedAt, release);
      }
      map[claim.id] = rec;
    });
    return map;
  }

  function enforceLifecycle(state, map, { repairExpired = true } = {}) {
    state.claims = Array.isArray(state?.claims) ? state.claims : [];
    const currentTime = now();
    const today = todayKey();
    let changed = false;

    state.claims.forEach(claim => {
      if (!claim?.id || !["reserved", "reported"].includes(claim.status)) return;
      const rec = normalizeRecord(map[claim.id]);
      if (!rec.taskId) rec.taskId = String(claim.taskId || "");
      if (!rec.date) rec.date = String(claim.date || "");

      const beforeIds = [...(claim.childIds || [])];
      claim.childIds = beforeIds.filter(childId => {
        const selectedAt = Number(rec.selectedAtByChild[childId] || claim.createdAt || 0);
        const removedAt = Number(rec.removedAtByChild[childId] || 0);
        return !(removedAt > 0 && removedAt >= selectedAt);
      });
      if (claim.childIds.length !== beforeIds.length) {
        const allowed = new Set(claim.childIds);
        if (Array.isArray(claim.reservedChildIds)) claim.reservedChildIds = claim.reservedChildIds.filter(id => allowed.has(id));
        if (Array.isArray(claim.actualParticipantIds)) claim.actualParticipantIds = claim.actualParticipantIds.filter(id => allowed.has(id));
        if (Array.isArray(claim.rewardAllocations)) claim.rewardAllocations = claim.rewardAllocations.filter(item => allowed.has(item?.childId));
        changed = true;
      }

      const fullReleaseIsNewer = rec.fullyReleasedAt > 0 && rec.fullyReleasedAt >= claimMoment(claim);
      const staleDay = claim.status === "reserved" && Boolean(claim.date) && claim.date !== today;
      const expired = repairExpired && claim.status === "reserved" && rec.expiresAt > 0 && rec.expiresAt <= currentTime;
      const noParticipants = claim.status === "reserved" && claim.childIds.length === 0;

      if (fullReleaseIsNewer || staleDay || expired || noParticipants) {
        claim.status = "released";
        const releaseAt = Math.max(rec.fullyReleasedAt, staleDay || expired || noParticipants ? currentTime : 0);
        rec.fullyReleasedAt = releaseAt || currentTime;
        rec.lastSeenAt = currentTime;
        if (!claim.childIds.length) claim.childIds = beforeIds.length ? beforeIds : Object.keys(rec.selectedAtByChild);
        map[claim.id] = rec;
        changed = true;
      }
    });
    return changed;
  }

  function prepareState(state) {
    state.settings ||= {};
    const map = inferLifecycleForClaims(state, foldHistory(state, mergeLifecycle(state, state)));
    const changed = enforceLifecycle(state, map);
    const previous = JSON.stringify(objectMap(state.settings[LIFECYCLE_KEY]));
    state.settings[LIFECYCLE_KEY] = map;
    return changed || JSON.stringify(map) !== previous;
  }

  function installReplaceGuard(mw) {
    if (mw.__mw309ReservationLifecycleGuard) return;
    const previous = mw.replaceData.bind(mw);
    mw.replaceData = (nextData, options = {}) => {
      if (applying) return previous(nextData, options);
      const local = mw.getData();
      const next = clone(nextData || {});
      next.settings ||= {};
      const merged = inferLifecycleForClaims(next, foldHistory(next, mergeLifecycle(local, next)));
      enforceLifecycle(next, merged);
      next.settings[LIFECYCLE_KEY] = merged;
      return previous(next, options);
    };
    Object.defineProperty(mw, "__mw309ReservationLifecycleGuard", { value:true });
  }

  function repairCurrentState(mw, { render = true } = {}) {
    if (applying) return false;
    const state = mw.getData();
    if (!prepareState(state)) return false;
    applying = true;
    try {
      return Boolean(mw.replaceData(state, { snapshot:true, notify:true, render, reservationLifecycleRepair:true }));
    } finally {
      applying = false;
    }
  }

  function queueRepair(mw) {
    if (repairQueued || applying) return;
    repairQueued = true;
    setTimeout(() => {
      repairQueued = false;
      repairCurrentState(mw, { render:true });
    }, 0);
  }

  function rememberSelection(mw, childId, taskId, selectedAt) {
    const state = mw.getData();
    const claim = [...(state.claims || [])]
      .filter(item => item?.taskId === taskId && item?.status === "reserved" && (item.childIds || []).includes(childId))
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))[0];
    if (!claim) return;
    state.settings ||= {};
    const map = lifecycleMap(state);
    const rec = normalizeRecord(map[claim.id]);
    rec.taskId = String(claim.taskId || rec.taskId || "");
    rec.date = String(claim.date || rec.date || todayKey());
    rec.selectedAtByChild[childId] = Math.max(Number(rec.selectedAtByChild[childId] || 0), Number(selectedAt || now()));
    rec.expiresAt = Math.max(Number(rec.expiresAt || 0), Number(claim.createdAt || selectedAt || now()) + reservationMinutes(state, claim.taskId) * 60 * 1000);
    rec.lastSeenAt = now();
    map[claim.id] = rec;
    state.settings[LIFECYCLE_KEY] = map;
    applying = true;
    try { mw.replaceData(state, { snapshot:true, notify:true, render:false, reservationSelected:true }); }
    finally { applying = false; }
  }

  function rememberLeave(mw, beforeClaim, childId, releasedAt) {
    const state = mw.getData();
    state.settings ||= {};
    const map = lifecycleMap(state);
    const rec = normalizeRecord(map[beforeClaim.id]);
    rec.taskId = String(beforeClaim.taskId || rec.taskId || "");
    rec.date = String(beforeClaim.date || rec.date || todayKey());
    const selectedAt = Number(rec.selectedAtByChild[childId] || beforeClaim.createdAt || 0);
    if (selectedAt > 0) rec.selectedAtByChild[childId] = selectedAt;
    rec.removedAtByChild[childId] = Math.max(Number(rec.removedAtByChild[childId] || 0), Number(releasedAt || now()));
    const remaining = (beforeClaim.childIds || []).filter(id => id !== childId);
    if (!remaining.length) rec.fullyReleasedAt = Math.max(rec.fullyReleasedAt, Number(releasedAt || now()));
    rec.lastSeenAt = now();
    map[beforeClaim.id] = rec;
    state.settings[LIFECYCLE_KEY] = map;

    let claim = (state.claims || []).find(item => item?.id === beforeClaim.id);
    if (!claim && !remaining.length) {
      claim = { ...clone(beforeClaim), status:"released", childIds:[...(beforeClaim.childIds || [])] };
      state.claims = [...(state.claims || []), claim];
    }
    if (claim && !remaining.length) claim.status = "released";

    applying = true;
    try { mw.replaceData(state, { snapshot:true, notify:true, render:true, reservationExplicitlyReleased:true }); }
    finally { applying = false; }
  }

  function updateVersion(mw) {
    try { mw.version = VERSION; } catch {}
    if (window.MitmachWeltSync) try { window.MitmachWeltSync.version = VERSION; } catch {}
    document.title = `Mitmach-Welt ${VERSION}`;
    const label = document.querySelector(".eyebrow");
    if (label?.textContent?.includes("Projekt Sonnenblume")) label.textContent = `Projekt Sonnenblume · Version ${VERSION}`;
  }

  function showUpdateBanner(registration) {
    const banner = document.querySelector("#updateBanner");
    if (registration?.waiting && banner) banner.hidden = false;
  }

  function watchRegistration(registration) {
    if (!registration) return;
    showUpdateBanner(registration);
    registration.addEventListener?.("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdateBanner(registration);
      });
    });
  }

  async function checkForUpdate(force = false) {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    const currentTime = now();
    if (!force && currentTime - lastUpdateCheckAt < UPDATE_CHECK_MS) return;
    lastUpdateCheckAt = currentTime;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;
      watchRegistration(registration);
      await registration.update();
      showUpdateBanner(registration);
    } catch (error) {
      console.warn("Mitmach-Welt: Update-Prüfung fehlgeschlagen", error);
    }
  }

  function init() {
    const mw = api();
    if (!mw?.getData || !mw?.replaceData || !mw?.subscribeToSaves) return setTimeout(init, 100);
    installReplaceGuard(mw);
    repairCurrentState(mw, { render:true });

    mw.subscribeToSaves?.(() => queueRepair(mw));

    document.addEventListener("click", event => {
      const leave = event.target.closest?.('[data-action="leave-claim"][data-child-id][data-claim-id]');
      if (leave && !applying) {
        const state = mw.getData();
        const beforeClaim = (state.claims || []).find(claim => claim?.id === leave.dataset.claimId);
        const childId = String(leave.dataset.childId || "");
        if (beforeClaim?.status === "reserved" && (beforeClaim.childIds || []).includes(childId)) {
          const snapshot = clone(beforeClaim);
          const releasedAt = now();
          setTimeout(() => rememberLeave(mw, snapshot, childId, releasedAt), 0);
        }
      }
    }, true);

    document.addEventListener("click", event => {
      const reserve = event.target.closest?.('[data-action="reserve-task"][data-child-id][data-task-id]');
      if (!reserve || applying) return;
      const selectedAt = now();
      const childId = String(reserve.dataset.childId || "");
      const taskId = String(reserve.dataset.taskId || "");
      setTimeout(() => rememberSelection(mw, childId, taskId, selectedAt), 0);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        queueRepair(mw);
        checkForUpdate(false);
      }
    });
    window.addEventListener("online", () => checkForUpdate(true));
    setInterval(() => checkForUpdate(false), UPDATE_CHECK_MS);

    updateVersion(mw);
    setTimeout(() => { updateVersion(mw); checkForUpdate(true); }, 800);
    mw.reservationLifecycle = {
      version:VERSION,
      repairNow:() => repairCurrentState(mw, { render:true }),
      checkForUpdate:() => checkForUpdate(true)
    };
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
