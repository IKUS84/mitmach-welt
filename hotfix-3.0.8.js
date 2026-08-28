(() => {
  "use strict";

  const VERSION = "3.0.8";
  const TOMBSTONE_KEY = "taskReservationTombstonesV1";
  const KEEP_MS = 45 * 24 * 60 * 60 * 1000;
  let applying = false;

  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const now = () => Date.now();

  function tombstoneMap(state) {
    const value = state?.settings?.[TOMBSTONE_KEY];
    return value && typeof value === "object" && !Array.isArray(value) ? clone(value) : {};
  }

  function claimMoment(claim) {
    return Math.max(
      Number(claim?.releasedAt || 0),
      Number(claim?.reviewedAt || 0),
      Number(claim?.reportedAt || 0),
      Number(claim?.createdAt || 0)
    );
  }

  function normalizeRecord(record) {
    const removed = record?.removedChildIds && typeof record.removedChildIds === "object" && !Array.isArray(record.removedChildIds)
      ? { ...record.removedChildIds }
      : {};
    return {
      taskId:String(record?.taskId || ""),
      date:String(record?.date || ""),
      fullRelease:Boolean(record?.fullRelease),
      releasedAt:Number(record?.releasedAt || 0),
      originalChildIds:Array.isArray(record?.originalChildIds) ? [...new Set(record.originalChildIds.filter(Boolean))] : [],
      removedChildIds:removed
    };
  }

  function mergeTombstones(localState, incomingState) {
    const local = tombstoneMap(localState);
    const incoming = tombstoneMap(incomingState);
    const merged = { ...incoming };
    const cutoff = now() - KEEP_MS;

    Object.entries(local).forEach(([claimId, raw]) => {
      const left = normalizeRecord(raw);
      const right = normalizeRecord(merged[claimId]);
      const next = {
        taskId:left.taskId || right.taskId,
        date:left.date || right.date,
        fullRelease:left.fullRelease || right.fullRelease,
        releasedAt:Math.max(left.releasedAt, right.releasedAt),
        originalChildIds:[...new Set([...right.originalChildIds, ...left.originalChildIds])],
        removedChildIds:{ ...right.removedChildIds }
      };
      Object.entries(left.removedChildIds).forEach(([childId, timestamp]) => {
        next.removedChildIds[childId] = Math.max(Number(next.removedChildIds[childId] || 0), Number(timestamp || 0));
      });
      merged[claimId] = next;
    });

    Object.keys(merged).forEach(claimId => {
      const rec = normalizeRecord(merged[claimId]);
      const newest = Math.max(rec.releasedAt, ...Object.values(rec.removedChildIds).map(Number));
      if (newest > 0 && newest < cutoff) delete merged[claimId];
      else merged[claimId] = rec;
    });
    return merged;
  }

  function applyTombstonesToClaims(state, tombstones) {
    state.claims = Array.isArray(state.claims) ? state.claims : [];
    const byId = new Map(state.claims.map((claim, index) => [claim?.id, index]).filter(([id]) => Boolean(id)));

    Object.entries(tombstones).forEach(([claimId, raw]) => {
      const record = normalizeRecord(raw);
      const index = byId.get(claimId);
      if (index === undefined) return;
      const claim = state.claims[index];

      if (record.fullRelease && ["reserved","reported"].includes(claim?.status)) {
        state.claims[index] = {
          ...claim,
          status:"released",
          releasedAt:Math.max(Number(claim.releasedAt || 0), record.releasedAt || now()),
          childIds:record.originalChildIds.length ? [...record.originalChildIds] : [...(claim.childIds || [])]
        };
        return;
      }

      if (!["reserved","reported"].includes(claim?.status)) return;
      const removedIds = new Set(Object.keys(record.removedChildIds).filter(childId => Number(record.removedChildIds[childId] || 0) > 0));
      if (!removedIds.size) return;

      claim.childIds = (claim.childIds || []).filter(id => !removedIds.has(id));
      if (Array.isArray(claim.reservedChildIds)) claim.reservedChildIds = claim.reservedChildIds.filter(id => !removedIds.has(id));
      if (Array.isArray(claim.actualParticipantIds)) claim.actualParticipantIds = claim.actualParticipantIds.filter(id => !removedIds.has(id));
      if (Array.isArray(claim.rewardAllocations)) claim.rewardAllocations = claim.rewardAllocations.filter(item => !removedIds.has(item?.childId));

      if (!claim.childIds.length) {
        claim.status = "released";
        claim.releasedAt = Math.max(record.releasedAt || 0, ...Object.values(record.removedChildIds).map(Number), now());
        claim.childIds = record.originalChildIds.length ? [...record.originalChildIds] : [...removedIds];
      }
    });
    return state;
  }

  function installReplaceGuard(api) {
    if (api.__mw308ReservationGuard) return;
    const original = api.replaceData.bind(api);
    api.replaceData = (nextData, options = {}) => {
      const local = api.getData();
      const next = clone(nextData || {});
      next.settings ||= {};
      const tombstones = mergeTombstones(local, next);
      next.settings[TOMBSTONE_KEY] = tombstones;
      applyTombstonesToClaims(next, tombstones);
      return original(next, options);
    };
    Object.defineProperty(api, "__mw308ReservationGuard", { value:true });
  }

  function rememberLeave(api, beforeClaim, childId, releasedAt) {
    const state = api.getData();
    state.settings ||= {};
    const map = tombstoneMap(state);
    const current = normalizeRecord(map[beforeClaim.id]);
    const originalIds = [...new Set([...(current.originalChildIds || []), ...(beforeClaim.childIds || [])])];
    const removed = { ...current.removedChildIds, [childId]:Math.max(Number(current.removedChildIds?.[childId] || 0), releasedAt) };
    const remaining = (beforeClaim.childIds || []).filter(id => id !== childId);

    map[beforeClaim.id] = {
      taskId:beforeClaim.taskId,
      date:beforeClaim.date,
      fullRelease:current.fullRelease || remaining.length === 0,
      releasedAt:remaining.length === 0 ? Math.max(current.releasedAt, releasedAt) : current.releasedAt,
      originalChildIds:originalIds,
      removedChildIds:removed
    };
    state.settings[TOMBSTONE_KEY] = map;

    let claim = (state.claims || []).find(item => item?.id === beforeClaim.id);
    if (!claim && remaining.length === 0) {
      claim = {
        ...clone(beforeClaim),
        status:"released",
        releasedAt,
        childIds:[...(beforeClaim.childIds || [])],
        reportedAt:0,
        reviewedAt:0
      };
      state.claims = [...(state.claims || []), claim];
    }

    if (claim) {
      if (remaining.length === 0) {
        claim.status = "released";
        claim.releasedAt = Math.max(Number(claim.releasedAt || 0), releasedAt);
        claim.childIds = [...(beforeClaim.childIds || [])];
      } else {
        claim.childIds = (claim.childIds || []).filter(id => id !== childId);
        if (Array.isArray(claim.reservedChildIds)) claim.reservedChildIds = claim.reservedChildIds.filter(id => id !== childId);
        if (Array.isArray(claim.actualParticipantIds)) claim.actualParticipantIds = claim.actualParticipantIds.filter(id => id !== childId);
        if (Array.isArray(claim.rewardAllocations)) claim.rewardAllocations = claim.rewardAllocations.filter(item => item?.childId !== childId);
      }
    }

    state.history = Array.isArray(state.history) ? state.history : [];
    if (!state.history.some(entry => entry?.type === "reservation_left" && entry?.claimId === beforeClaim.id && entry?.childId === childId && Number(entry?.timestamp || 0) === releasedAt)) {
      state.history.push({
        id:`mw308_${releasedAt}_${Math.random().toString(16).slice(2)}`,
        type:"reservation_left",
        claimId:beforeClaim.id,
        taskId:beforeClaim.taskId,
        childId,
        timestamp:releasedAt
      });
    }

    applying = true;
    try {
      api.replaceData(state, { snapshot:true, notify:true, render:true, reservationRelease:true });
    } finally {
      applying = false;
    }
  }

  function clearRejoinedChildTombstone(api, childId, taskId) {
    const state = api.getData();
    const activeClaim = (state.claims || []).find(claim =>
      claim?.taskId === taskId && claim?.status === "reserved" && (claim.childIds || []).includes(childId)
    );
    if (!activeClaim) return;
    const map = tombstoneMap(state);
    const raw = map[activeClaim.id];
    if (!raw) return;
    const record = normalizeRecord(raw);
    if (!record.removedChildIds[childId]) return;
    delete record.removedChildIds[childId];
    if (!Object.keys(record.removedChildIds).length && !record.fullRelease) delete map[activeClaim.id];
    else map[activeClaim.id] = record;
    state.settings ||= {};
    state.settings[TOMBSTONE_KEY] = map;
    api.replaceData(state, { snapshot:true, notify:true, render:false, reservationRejoin:true });
  }


  function harvestReleasedClaims(api) {
    if (applying) return false;
    const state = api.getData();
    state.settings ||= {};
    const map = tombstoneMap(state);
    let changed = false;

    (state.claims || []).forEach(claim => {
      if (claim?.status !== "released" || !claim?.id) return;
      const releasedAt = Number(claim.releasedAt || claim.reviewedAt || 0);
      if (!(releasedAt > 0)) return;
      const current = normalizeRecord(map[claim.id]);
      if (current.fullRelease && current.releasedAt >= releasedAt) return;
      map[claim.id] = {
        taskId:String(claim.taskId || current.taskId || ""),
        date:String(claim.date || current.date || ""),
        fullRelease:true,
        releasedAt:Math.max(current.releasedAt, releasedAt),
        originalChildIds:[...new Set([...(current.originalChildIds || []), ...(claim.childIds || [])])],
        removedChildIds:{ ...current.removedChildIds }
      };
      changed = true;
    });

    if (!changed) return false;
    state.settings[TOMBSTONE_KEY] = map;
    applying = true;
    try {
      return Boolean(api.replaceData(state, { snapshot:true, notify:true, render:false, reservationHarvest:true }));
    } finally {
      applying = false;
    }
  }

  function init() {
    const api = window.MitmachWelt;
    if (!api?.getData || !api?.replaceData) return setTimeout(init, 100);
    installReplaceGuard(api);
    harvestReleasedClaims(api);
    api.subscribeToSaves?.(() => setTimeout(() => harvestReleasedClaims(api), 0));

    document.addEventListener("click", event => {
      const leave = event.target.closest?.('[data-action="leave-claim"][data-child-id][data-claim-id]');
      if (leave && !applying) {
        const state = api.getData();
        const beforeClaim = (state.claims || []).find(claim => claim?.id === leave.dataset.claimId);
        const childId = String(leave.dataset.childId || "");
        if (beforeClaim?.status === "reserved" && (beforeClaim.childIds || []).includes(childId)) {
          const releasedAt = now();
          setTimeout(() => rememberLeave(api, beforeClaim, childId, releasedAt), 0);
        }
        return;
      }

      const reserve = event.target.closest?.('[data-action="reserve-task"][data-child-id][data-task-id]');
      if (reserve && !applying) {
        const childId = String(reserve.dataset.childId || "");
        const taskId = String(reserve.dataset.taskId || "");
        setTimeout(() => clearRejoinedChildTombstone(api, childId, taskId), 0);
      }
    }, true);

    try { api.version = VERSION; } catch {}
    document.title = `Mitmach-Welt ${VERSION}`;
    const label = document.querySelector(".eyebrow");
    if (label?.textContent?.includes("Projekt Sonnenblume")) label.textContent = `Projekt Sonnenblume · Version ${VERSION}`;
    setTimeout(() => {
      try { api.version = VERSION; } catch {}
      if (window.MitmachWeltSync) try { window.MitmachWeltSync.version = VERSION; } catch {}
    }, 700);

    api.reservationIntegrity = {
      version:VERSION,
      tombstoneCount:() => Object.keys(tombstoneMap(api.getData())).length
    };
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
