(() => {
  "use strict";

  const HOTFIX_VERSION = "3.0.3";
  const AUTO_APPROVE_DELAY_MS = 12 * 60 * 60 * 1000;
  const CHECK_INTERVAL_MS = 60 * 1000;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const STAR_MIN_DAYS = 5;
  const STAR_MAX_DAYS = 9;

  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function")
    ? globalThis.crypto.randomUUID()
    : `mw303_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  function hashText(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function starDelayMs(seed) {
    const span = STAR_MAX_DAYS - STAR_MIN_DAYS + 1;
    return (STAR_MIN_DAYS + (hashText(seed) % span)) * DAY_MS;
  }

  function uniqueIds(values) {
    return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
  }

  function sameIds(a, b) {
    const left = uniqueIds(a).sort();
    const right = uniqueIds(b).sort();
    return left.length === right.length && left.every((id, index) => id === right[index]);
  }

  function reportTimestamp(claim, state) {
    const direct = Number(claim?.reportedAt || 0);
    if (direct > 0) return direct;
    const history = [...(state?.history || [])].reverse().find(entry =>
      entry?.type === "task_reported" && entry?.claimId === claim?.id && Number(entry?.timestamp || 0) > 0
    );
    return Number(history?.timestamp || claim?.createdAt || 0);
  }

  function participantsAreClear(claim, api) {
    const participants = uniqueIds(claim?.childIds);
    if (!participants.length) return false;
    if (Array.isArray(claim?.actualParticipantIds) && claim.actualParticipantIds.length && !sameIds(participants, claim.actualParticipantIds)) return false;
    if (claim?.ageSupportRequired) {
      const minimum = Number(claim?.olderPartnerMinAge || 0);
      if (minimum > 0 && typeof api.getChildAge === "function") {
        const hasOlderPartner = participants.some(childId => {
          const age = api.getChildAge(childId);
          return age !== null && Number(age) >= minimum;
        });
        if (!hasOlderPartner) return false;
      }
    }
    return true;
  }

  function normalizeAssignments(settings) {
    const source = settings?.hiddenStarAssignments;
    return source && typeof source === "object" && !Array.isArray(source) ? { ...source } : {};
  }

  function assignmentMoment(assignment) {
    return Math.max(
      Number(assignment?.awardedAt || 0),
      Number(assignment?.cancelledAt || 0),
      Number(assignment?.assignedAt || 0)
    );
  }

  function hiddenHistoryEntries(history) {
    return (Array.isArray(history) ? history : []).filter(entry =>
      ["hidden_star_selected", "hidden_star_awarded", "hidden_star_cancelled"].includes(entry?.type)
    );
  }

  function mergeHiddenHistory(incomingHistory, localHistory) {
    const result = Array.isArray(incomingHistory) ? incomingHistory.map(entry => ({ ...entry })) : [];
    const seenIds = new Set(result.map(entry => entry?.id).filter(Boolean));
    const signature = entry => `${entry?.type || ""}|${entry?.claimId || ""}|${Number(entry?.timestamp || 0)}`;
    const seenSignatures = new Set(result.map(signature));
    hiddenHistoryEntries(localHistory).forEach(entry => {
      if ((entry.id && seenIds.has(entry.id)) || seenSignatures.has(signature(entry))) return;
      result.push({ ...entry });
      if (entry.id) seenIds.add(entry.id);
      seenSignatures.add(signature(entry));
    });
    return result.sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0));
  }

  function claimHasHiddenStarAllocation(claim, task) {
    if (!claim || !task || Number(task.stars || 0) > 0) return false;
    return (claim.rewardAllocations || []).some(item => Number(item?.stars || 0) > 0);
  }

  function recoverAssignmentsFromHistory(state) {
    const assignments = normalizeAssignments(state.settings);
    const claims = new Map((state.claims || []).map(claim => [claim.id, claim]));
    let changed = false;
    hiddenHistoryEntries(state.history).forEach(entry => {
      const claimId = entry?.claimId;
      if (!claimId || assignments[claimId]) return;
      const claim = claims.get(claimId);
      if (!claim) return;
      if (entry.type === "hidden_star_selected") {
        assignments[claimId] = {
          status:claim.status === "approved" ? "assigned" : claim.status === "declined" ? "cancelled" : "assigned",
          bonusPerChild:Number(entry.bonusPerChild || 1),
          assignedAt:Number(entry.timestamp || 0),
          reportedAt:reportTimestamp(claim, state)
        };
        changed = true;
      }
    });
    if (changed) state.settings.hiddenStarAssignments = assignments;
    return changed;
  }

  function latestTaskMoment(state) {
    return (state?.history || []).reduce((latest, entry) => {
      if (!["task_reported", "task_approved", "task_auto_approved_12h"].includes(entry?.type)) return latest;
      return Math.max(latest, Number(entry?.timestamp || 0), Number(entry?.approvedAt || 0));
    }, 0);
  }

  function prepareSettings(state, now) {
    state.settings = state.settings || {};
    let changed = false;

    // Die 3.0.2-Basisautomatik wird bewusst ausgeschaltet, damit nur die
    // korrigierte 12-Stunden-Prüfung dieses Hotfixes entscheidet. So kann ein
    // geheimer Stern niemals versehentlich automatisch freigegeben werden.
    if (state.settings.autoApproveEnabled !== false) {
      state.settings.autoApproveEnabled = false;
      changed = true;
    }
    if (state.settings.autoApproveAfter12hEnabled !== true) {
      state.settings.autoApproveAfter12hEnabled = true;
      changed = true;
    }
    if (state.settings.hiddenStarsEnabled !== true) {
      state.settings.hiddenStarsEnabled = true;
      changed = true;
    }
    if (!state.settings.hiddenStarAssignments || typeof state.settings.hiddenStarAssignments !== "object" || Array.isArray(state.settings.hiddenStarAssignments)) {
      state.settings.hiddenStarAssignments = {};
      changed = true;
    }
    if (recoverAssignmentsFromHistory(state)) changed = true;
    if (!(Number(state.settings.hiddenStarNextAt) > 0)) {
      const anchor = latestTaskMoment(state) || now;
      const groupKey = `${state.settings.groupName || "Mitmach-Welt"}|${(state.children || []).map(child => child?.id || "").join("|")}|${anchor}`;
      state.settings.hiddenStarNextAt = anchor + starDelayMs(groupKey);
      changed = true;
    }
    if (state.hotfixVersion !== HOTFIX_VERSION) {
      state.hotfixVersion = HOTFIX_VERSION;
      changed = true;
    }
    return changed;
  }

  function eligibleForAutomaticApproval(claim, task, state, api, now, assignments) {
    if (!claim || !task || claim.status !== "reported") return false;
    if (state.settings?.autoApproveAfter12hEnabled === false) return false;
    if (task.autoApprove === false || task.requiresManualReview) return false;
    if (Number(task.stars || 0) > 0) return false;
    if (assignments[claim.id] || claimHasHiddenStarAllocation(claim, task)) return false;
    if (!participantsAreClear(claim, api)) return false;
    const reportedAt = reportTimestamp(claim, state);
    return reportedAt > 0 && now - reportedAt >= AUTO_APPROVE_DELAY_MS;
  }

  function hiddenStarCandidate(claim, task, state, api, now, assignments) {
    if (!claim || !task || claim.status !== "reported") return false;
    if (state.settings?.hiddenStarsEnabled === false) return false;
    if (assignments[claim.id] || claimHasHiddenStarAllocation(claim, task)) return false;
    if (task.autoApprove === false || task.requiresManualReview || Number(task.stars || 0) > 0) return false;
    if (!participantsAreClear(claim, api)) return false;
    const reportedAt = reportTimestamp(claim, state);
    return reportedAt > 0 && reportedAt >= Number(state.settings?.hiddenStarNextAt || Infinity) && reportedAt <= now;
  }

  function pendingHiddenStarClaim(state, assignments) {
    return (state.claims || []).find(claim => {
      const assignment = assignments[claim?.id];
      return assignment && assignment.status !== "cancelled" && claim?.status === "reported";
    }) || null;
  }

  function addHiddenStarToAllocations(claim) {
    const participants = uniqueIds(claim.childIds);
    const current = Array.isArray(claim.rewardAllocations) ? claim.rewardAllocations : [];
    const map = new Map(current.map(item => [item?.childId, { ...item }]));
    claim.rewardAllocations = participants.map(childId => {
      const allocation = map.get(childId) || { childId, coins:0, seeds:0, stars:0 };
      return {
        childId,
        coins:Math.max(0, Number(allocation.coins || 0)),
        seeds:Math.max(0, Number(allocation.seeds || 0)),
        stars:Math.max(0, Number(allocation.stars || 0)) + 1
      };
    });
  }

  function maybeAssignHiddenStar(state, api, now) {
    const assignments = normalizeAssignments(state.settings);
    if (pendingHiddenStarClaim(state, assignments)) return false;
    if (now < Number(state.settings?.hiddenStarNextAt || Infinity)) return false;

    const tasks = new Map((state.tasks || []).map(task => [task.id, task]));
    const candidate = (state.claims || [])
      .filter(claim => hiddenStarCandidate(claim, tasks.get(claim.taskId), state, api, now, assignments))
      .sort((a, b) => reportTimestamp(a, state) - reportTimestamp(b, state))[0];
    if (!candidate) return false;

    addHiddenStarToAllocations(candidate);
    assignments[candidate.id] = {
      status:"assigned",
      bonusPerChild:1,
      assignedAt:now,
      reportedAt:reportTimestamp(candidate, state)
    };
    state.settings.hiddenStarAssignments = assignments;
    state.history = state.history || [];
    state.history.push({
      id:uid(), type:"hidden_star_selected", claimId:candidate.id, taskId:candidate.taskId,
      childIds:uniqueIds(candidate.childIds), bonusPerChild:1, timestamp:now
    });
    return true;
  }

  function ensureApprovedHiddenStarReward(state, claim, assignment) {
    const expectedBonus = Math.max(1, Number(assignment?.bonusPerChild || 1));
    const approval = [...(state.history || [])].reverse().find(entry =>
      entry?.type === "task_approved" && entry?.claimId === claim.id && !entry?.reversedAt
    );
    const participantIds = uniqueIds(claim.childIds);
    let changed = false;

    participantIds.forEach(childId => {
      const claimAllocation = (claim.rewardAllocations || []).find(item => item?.childId === childId);
      const approvalAllocation = (approval?.allocations || []).find(item => item?.childId === childId);
      const intendedStars = Math.max(expectedBonus, Number(claimAllocation?.stars || 0));
      const alreadyBookedStars = Math.max(0, Number(approvalAllocation?.stars || 0));
      const missing = Math.max(0, intendedStars - alreadyBookedStars);
      if (!missing) return;

      const child = (state.children || []).find(item => item.id === childId);
      if (child) child.stars = Math.max(0, Number(child.stars || 0)) + missing;
      if (claimAllocation) claimAllocation.stars = intendedStars;
      if (approvalAllocation) approvalAllocation.stars = intendedStars;
      else if (approval) {
        approval.allocations = Array.isArray(approval.allocations) ? approval.allocations : [];
        approval.allocations.push({ childId, coins:Number(claimAllocation?.coins || 0), seeds:Number(claimAllocation?.seeds || 0), stars:intendedStars });
      }
      state.ledger = state.ledger || [];
      state.ledger.push({ id:uid(), childId, currency:"stars", amount:missing, reason:"Aufgabe bestätigt", note:"Verdeckter Überraschungsstern nachgetragen", claimId:claim.id, timestamp:Number(claim.reviewedAt || Date.now()) });
      state.history = state.history || [];
      state.history.push({ id:uid(), type:"star_earned", childId, amount:missing, source:"task", claimId:claim.id, timestamp:Number(claim.reviewedAt || Date.now()) });
      changed = true;
    });
    return changed;
  }

  function revealHiddenStarAwards(state, now) {
    const assignments = normalizeAssignments(state.settings);
    const tasks = new Map((state.tasks || []).map(task => [task.id, task]));
    let changed = false;

    Object.entries(assignments).forEach(([claimId, assignment]) => {
      const claim = (state.claims || []).find(item => item.id === claimId);
      if (!claim) return;

      if (claim.status === "declined" && assignment.status !== "cancelled") {
        assignment.status = "cancelled";
        assignment.cancelledAt = Number(claim.reviewedAt || now);
        state.settings.hiddenStarNextAt = Math.min(Number(state.settings.hiddenStarNextAt || now), now);
        state.history = state.history || [];
        state.history.push({ id:uid(), type:"hidden_star_cancelled", claimId, taskId:claim.taskId, timestamp:now });
        changed = true;
        return;
      }

      if (claim.status !== "approved") return;
      const reviewedAt = Number(claim.reviewedAt || now);
      if (assignment.status === "awarded" && Number(assignment.lastReviewedAt || 0) === reviewedAt) return;

      if (ensureApprovedHiddenStarReward(state, claim, assignment)) changed = true;
      assignment.status = "awarded";
      assignment.awardedAt = reviewedAt;
      assignment.lastReviewedAt = reviewedAt;
      state.settings.hiddenStarNextAt = reviewedAt + starDelayMs(`${claim.id}|${reviewedAt}|next`);

      const task = tasks.get(claim.taskId);
      uniqueIds(claim.childIds).forEach(childId => {
        let note = (state.notifications || []).find(item => item?.claimId === claimId && item?.childId === childId && item?.type === "task-approved");
        if (!note) {
          state.notifications = state.notifications || [];
          note = { id:uid(), childId, claimId, type:"task-approved", positive:true, seen:false, createdAt:reviewedAt };
          state.notifications.push(note);
        }
        const previousDetail = String(note.detail || "").replace(/^⭐ Überraschung!\s*/, "");
        note.title = "⭐ Überraschung! Ein Stern für dich";
        note.message = `${task?.icon || "✅"} ${task?.title || "Deine Aufgabe"} war diesmal eine geheime Sternaufgabe.`;
        note.detail = `Der Stern war vorher absichtlich nicht sichtbar. ${previousDetail}`.trim();
        note.stars = Math.max(1, Number(note.stars || 0));
        note.positive = true;
        note.seen = false;
      });

      state.history = state.history || [];
      state.history.push({
        id:uid(), type:"hidden_star_awarded", claimId, taskId:claim.taskId,
        childIds:uniqueIds(claim.childIds), bonusPerChild:Number(assignment.bonusPerChild || 1), timestamp:reviewedAt
      });
      changed = true;
    });

    state.settings.hiddenStarAssignments = assignments;
    return changed;
  }

  function annotateAutoApproval(api, claimId, reportedAt) {
    const state = api.getData();
    const claim = (state.claims || []).find(item => item.id === claimId);
    if (!claim || claim.status !== "approved") return false;
    claim.autoApproved = true;
    claim.autoApprovedAfterHours = 12;
    claim.autoApprovedAt = Number(claim.reviewedAt || Date.now());
    claim.autoApprovalSource = "reported-plus-12h-v3.0.3";
    if (!claim.reportedAt && reportedAt) claim.reportedAt = Number(reportedAt);
    state.history = state.history || [];
    if (!state.history.some(entry => entry.type === "task_auto_approved_12h" && entry.claimId === claimId && !entry.reversedAt)) {
      state.history.push({
        id:uid(), type:"task_auto_approved_12h", claimId, reportedAt:Number(reportedAt || 0),
        approvedAt:Number(claim.reviewedAt || Date.now()), delayHours:12, timestamp:Date.now()
      });
    }
    api.replaceData(state, { snapshot:true, notify:true, render:false });
    return true;
  }

  function installReplaceDataGuard(api) {
    if (api.__mw303ReplaceGuard || typeof api.replaceData !== "function") return;
    const originalReplaceData = api.replaceData.bind(api);
    api.replaceData = (nextData, options = {}) => {
      const local = typeof api.getData === "function" ? api.getData() : null;
      const guarded = clone(nextData || {});
      guarded.settings = guarded.settings || {};
      guarded.settings.autoApproveEnabled = false;
      if (guarded.settings.autoApproveAfter12hEnabled === undefined) guarded.settings.autoApproveAfter12hEnabled = true;
      if (guarded.settings.hiddenStarsEnabled === undefined) guarded.settings.hiddenStarsEnabled = true;

      if (local) {
        const localAssignments = normalizeAssignments(local.settings);
        const incomingAssignments = normalizeAssignments(guarded.settings);
        Object.entries(localAssignments).forEach(([claimId, localAssignment]) => {
          const incomingAssignment = incomingAssignments[claimId];
          if (!incomingAssignment || assignmentMoment(localAssignment) > assignmentMoment(incomingAssignment)) {
            incomingAssignments[claimId] = clone(localAssignment);
          }
        });
        guarded.settings.hiddenStarAssignments = incomingAssignments;

        const localMoment = Math.max(0, ...Object.values(localAssignments).map(assignmentMoment));
        const incomingMoment = Math.max(0, ...Object.values(normalizeAssignments(nextData?.settings)).map(assignmentMoment));
        if (localMoment > incomingMoment) guarded.settings.hiddenStarNextAt = Number(local.settings?.hiddenStarNextAt || guarded.settings.hiddenStarNextAt || 0);
        else if (localMoment === incomingMoment) guarded.settings.hiddenStarNextAt = Math.max(Number(guarded.settings.hiddenStarNextAt || 0), Number(local.settings?.hiddenStarNextAt || 0));

        guarded.history = mergeHiddenHistory(guarded.history, local.history);

        const guardedClaims = new Map((guarded.claims || []).map(claim => [claim?.id, claim]));
        (local.claims || []).forEach(localClaim => {
          const assignment = incomingAssignments[localClaim?.id];
          const incomingClaim = guardedClaims.get(localClaim?.id);
          if (!assignment || !incomingClaim || !["assigned", "awarded"].includes(assignment.status)) return;
          if (!["reported", "approved"].includes(incomingClaim.status)) return;
          const localAllocations = new Map((localClaim.rewardAllocations || []).map(item => [item?.childId, item]));
          incomingClaim.rewardAllocations = (incomingClaim.rewardAllocations || []).map(item => {
            const localItem = localAllocations.get(item?.childId);
            return localItem && Number(localItem.stars || 0) > Number(item?.stars || 0)
              ? { ...item, stars:Number(localItem.stars || 0) }
              : item;
          });
          const incomingIds = new Set((incomingClaim.rewardAllocations || []).map(item => item?.childId));
          (localClaim.rewardAllocations || []).forEach(item => {
            if (item?.childId && !incomingIds.has(item.childId) && Number(item.stars || 0) > 0) incomingClaim.rewardAllocations.push({ ...item });
          });
        });
      }
      return originalReplaceData(guarded, options);
    };
    Object.defineProperty(api, "__mw303ReplaceGuard", { value:true, enumerable:false, configurable:false });
  }

  function init() {
    const api = window.MitmachWelt;
    if (!api || typeof api.getData !== "function" || typeof api.replaceData !== "function" || typeof api.reviewClaim !== "function") {
      window.setTimeout(init, 100);
      return;
    }

    installReplaceDataGuard(api);
    try { api.version = HOTFIX_VERSION; } catch {}

    let running = false;
    let scheduled = false;

    function processState() {
      if (running) return false;
      running = true;
      let changed = false;
      let approvedCount = 0;
      try {
        const now = Date.now();
        let state = api.getData();

        if (prepareSettings(state, now)) changed = true;
        if (maybeAssignHiddenStar(state, api, now)) changed = true;
        if (revealHiddenStarAwards(state, now)) changed = true;

        if (changed) {
          api.replaceData(state, { snapshot:true, notify:true, render:false });
          state = api.getData();
        }

        const assignments = normalizeAssignments(state.settings);
        const tasks = new Map((state.tasks || []).map(task => [task.id, task]));
        const due = (state.claims || []).filter(claim =>
          eligibleForAutomaticApproval(claim, tasks.get(claim.taskId), state, api, now, assignments)
        );

        due.forEach(claim => {
          const reportedAt = reportTimestamp(claim, state);
          const ok = api.reviewClaim(
            claim.id,
            "approve",
            "Automatisch bestätigt: 12 Stunden nach der Erledigt-Meldung ohne Erzieherentscheidung."
          );
          if (!ok) return;
          annotateAutoApproval(api, claim.id, reportedAt);
          approvedCount += 1;
        });

        if (approvedCount > 0) {
          api.render?.();
          api.showToast?.(`${approvedCount} erledigt gemeldete Aufgabe${approvedCount === 1 ? " wurde" : "n wurden"} nach 12 Stunden automatisch bestätigt.`);
        } else if (changed) {
          api.render?.();
        }
      } catch (error) {
        console.error("Mitmach-Welt 3.0.3: Automatik/Überraschungsstern fehlgeschlagen", error);
      } finally {
        running = false;
      }
      return approvedCount > 0 || changed;
    }

    function scheduleProcess() {
      if (scheduled || running) return;
      scheduled = true;
      window.setTimeout(() => {
        scheduled = false;
        processState();
      }, 0);
    }

    if (typeof api.subscribeToSaves === "function") api.subscribeToSaves(scheduleProcess);

    processState();
    window.setInterval(processState, CHECK_INTERVAL_MS);
    window.addEventListener("focus", processState);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") processState();
    });

    window.MitmachWelt.autoApprove12h = {
      version:HOTFIX_VERSION,
      delayHours:12,
      runNow:processState
    };
    window.MitmachWelt.hiddenStars = {
      version:HOTFIX_VERSION,
      hiddenUntilApproval:true,
      minDays:STAR_MIN_DAYS,
      maxDays:STAR_MAX_DAYS,
      runNow:processState
    };

    document.title = `Mitmach-Welt ${HOTFIX_VERSION}`;
    const versionLabel = document.querySelector(".eyebrow");
    if (versionLabel?.textContent?.includes("Projekt Sonnenblume")) versionLabel.textContent = `Projekt Sonnenblume · Version ${HOTFIX_VERSION}`;

    window.setTimeout(() => {
      if (window.MitmachWeltSync) {
        try { window.MitmachWeltSync.version = HOTFIX_VERSION; } catch {}
      }
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(init, 0), { once:true });
  } else {
    window.setTimeout(init, 0);
  }
})();
