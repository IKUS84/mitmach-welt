(() => {
  "use strict";

  const HOTFIX_VERSION = "2.9.1";
  const STORAGE_KEY = "mitmach_welt_state_v1";
  const AUTO_APPROVE_DELAY_MS = 12 * 60 * 60 * 1000;
  const CHECK_INTERVAL_MS = 60 * 1000;

  // Die alte 21-Uhr-Automatik wird bereits vor dem Laden von app.js deaktiviert.
  // Version 2.9.1 arbeitet stattdessen mit "erledigt gemeldet + 12 Stunden".
  function disableLegacySameDayAutomation() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      state.settings = state.settings || {};
      if (state.settings.autoApproveAfter12hEnabled === undefined) {
        state.settings.autoApproveAfter12hEnabled = state.settings.autoApproveEnabled !== false;
      }
      state.settings.autoApproveEnabled = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Mitmach-Welt 2.9.1: alte Automatik konnte nicht vorbereitet werden", error);
    }
  }

  disableLegacySameDayAutomation();

  // Sync-Schutz: Der bisherige Geräteabgleich arbeitet überwiegend nach dem
  // Prinzip "neuester kompletter Datenstand gewinnt". Dadurch konnte eine auf
  // dem Kinder-Tablet gemeldete Aufgabe verloren gehen, wenn das Erziehergerät
  // parallel einen anderen, zeitlich neueren Stand hatte. Wir bewahren deshalb
  // lokale reservierte/erledigt gemeldete Aufgaben beim Empfang eines älteren
  // oder unvollständigen Gegenstandsstands und lassen den Sync den vereinigten
  // Stand anschließend erneut verteilen.
  function claimEventMoment(state, claim) {
    const claimId = claim?.id;
    const direct = Math.max(
      Number(claim?.reviewedAt || 0),
      Number(claim?.reportedAt || 0),
      Number(claim?.releasedAt || 0),
      Number(claim?.createdAt || 0)
    );
    if (!claimId) return direct;
    const historyMoment = (state?.history || []).reduce((latest, entry) => {
      if (entry?.claimId !== claimId) return latest;
      return Math.max(latest, Number(entry?.timestamp || 0), Number(entry?.approvedAt || 0));
    }, 0);
    return Math.max(direct, historyMoment);
  }

  function mergeClaimHistory(incomingHistory, localHistory, claimIds) {
    const result = Array.isArray(incomingHistory) ? incomingHistory.map(entry => ({ ...entry })) : [];
    const seen = new Set(result.map(entry => entry?.id).filter(Boolean));
    const signature = entry => `${entry?.type || ""}|${entry?.claimId || ""}|${Number(entry?.timestamp || 0)}|${entry?.childId || ""}`;
    const seenSignatures = new Set(result.map(signature));
    (Array.isArray(localHistory) ? localHistory : []).forEach(entry => {
      if (!entry?.claimId || !claimIds.has(entry.claimId)) return;
      if ((entry.id && seen.has(entry.id)) || seenSignatures.has(signature(entry))) return;
      result.push({ ...entry });
      if (entry.id) seen.add(entry.id);
      seenSignatures.add(signature(entry));
    });
    return result.sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0));
  }

  function mergePendingTaskClaims(localState, incomingState) {
    if (!localState || !incomingState || typeof incomingState !== "object") return { state:incomingState, changed:false };
    const incoming = { ...incomingState };
    const incomingClaims = Array.isArray(incoming.claims) ? incoming.claims.map(claim => ({ ...claim })) : [];
    const localClaims = Array.isArray(localState.claims) ? localState.claims : [];
    const validTaskIds = new Set((Array.isArray(incoming.tasks) ? incoming.tasks : (localState.tasks || [])).map(task => task?.id).filter(Boolean));
    const byId = new Map(incomingClaims.map((claim, index) => [claim.id, index]).filter(([id]) => Boolean(id)));
    const preservedClaimIds = new Set();
    let changed = false;

    localClaims.forEach(localClaim => {
      if (!localClaim?.id || !["reserved", "reported"].includes(localClaim.status)) return;
      if (validTaskIds.size && !validTaskIds.has(localClaim.taskId)) return;
      const index = byId.get(localClaim.id);

      if (index === undefined) {
        incomingClaims.push({ ...localClaim });
        byId.set(localClaim.id, incomingClaims.length - 1);
        preservedClaimIds.add(localClaim.id);
        changed = true;
        return;
      }

      const remoteClaim = incomingClaims[index];
      if (["approved", "declined"].includes(remoteClaim?.status)) return;

      const localMoment = claimEventMoment(localState, localClaim);
      const remoteMoment = claimEventMoment(incomingState, remoteClaim);
      const localIsFurther = localClaim.status === "reported" && remoteClaim?.status !== "reported";
      const localIsNewerReport = localClaim.status === "reported" && remoteClaim?.status === "reported" && localMoment > remoteMoment;
      const localIsNewerReservation = localClaim.status === "reserved" && remoteClaim?.status === "reserved" && localMoment > remoteMoment;

      if (localIsFurther || localIsNewerReport || localIsNewerReservation) {
        incomingClaims[index] = { ...remoteClaim, ...localClaim };
        preservedClaimIds.add(localClaim.id);
        changed = true;
      }
    });

    if (!changed) return { state:incomingState, changed:false };
    incoming.claims = incomingClaims;
    incoming.history = mergeClaimHistory(incoming.history, localState.history, preservedClaimIds);
    incoming.hotfixVersion = HOTFIX_VERSION;
    return { state:incoming, changed:true };
  }

  function installSyncBridge(api) {
    if (!api || api.__mw291SyncBridge || typeof api.replaceData !== "function" || typeof api.getData !== "function") return api;
    const originalReplaceData = api.replaceData.bind(api);
    api.replaceData = (nextData, options = {}) => {
      try {
        const localState = api.getData();
        const merged = mergePendingTaskClaims(localState, nextData);
        const mergedOptions = merged.changed ? { ...options, notify:true } : options;
        return originalReplaceData(merged.state, mergedOptions);
      } catch (error) {
        console.error("Mitmach-Welt 2.9.1: Aufgaben-Sync-Schutz fehlgeschlagen", error);
        return originalReplaceData(nextData, options);
      }
    };
    Object.defineProperty(api, "__mw291SyncBridge", { value:true, configurable:false, enumerable:false });
    return api;
  }

  // app.js legt window.MitmachWelt erst ganz am Ende an. Der Setter sorgt
  // dafür, dass der Schutz bereits aktiv ist, bevor sync.js die API übernimmt.
  let apiValue = window.MitmachWelt ? installSyncBridge(window.MitmachWelt) : null;
  try {
    Object.defineProperty(window, "MitmachWelt", {
      configurable:true,
      get() { return apiValue; },
      set(value) { apiValue = installSyncBridge(value); }
    });
  } catch (error) {
    console.warn("Mitmach-Welt 2.9.1: Sync-Brücke konnte nicht vorinstalliert werden", error);
  }

  function init() {
    const api = installSyncBridge(window.MitmachWelt);
    if (!api || typeof api.getData !== "function" || typeof api.reviewClaim !== "function") {
      window.setTimeout(init, 100);
      return;
    }

    try { api.version = HOTFIX_VERSION; } catch {}

    function persistHotfixSettings() {
      const state = api.getData();
      state.settings = state.settings || {};
      let changed = false;
      if (state.settings.autoApproveAfter12hEnabled === undefined) {
        state.settings.autoApproveAfter12hEnabled = true;
        changed = true;
      }
      if (state.settings.autoApproveEnabled !== false) {
        state.settings.autoApproveEnabled = false;
        changed = true;
      }
      if (state.hotfixVersion !== HOTFIX_VERSION) {
        state.hotfixVersion = HOTFIX_VERSION;
        changed = true;
      }
      if (changed) api.replaceData(state, { snapshot:false, notify:true, render:false });
    }

    function reportTimestamp(claim, state) {
      const direct = Number(claim?.reportedAt || 0);
      if (direct > 0) return direct;
      const history = [...(state.history || [])].reverse().find(entry =>
        entry?.type === "task_reported" && entry?.claimId === claim?.id && Number(entry?.timestamp || 0) > 0
      );
      return Number(history?.timestamp || claim?.createdAt || 0);
    }

    function isEligible(claim, task, state, now) {
      if (!claim || !task || claim.status !== "reported") return false;
      if (state.settings?.autoApproveAfter12hEnabled === false) return false;
      if (task.autoApprove === false || task.requiresManualReview) return false;
      if (Number(task.stars || 0) > 0) return false;

      const participants = Array.isArray(claim.childIds) ? [...new Set(claim.childIds.filter(Boolean))] : [];
      if (!participants.length) return false;

      const reportedAt = reportTimestamp(claim, state);
      return reportedAt > 0 && now - reportedAt >= AUTO_APPROVE_DELAY_MS;
    }

    function annotateAutoApproval(claimId, reportedAt) {
      const state = api.getData();
      const claim = (state.claims || []).find(item => item.id === claimId);
      if (!claim || claim.status !== "approved") return;

      claim.autoApproved = true;
      claim.autoApprovedAfterHours = 12;
      claim.autoApprovedAt = Number(claim.reviewedAt || Date.now());
      claim.autoApprovalSource = "reported-plus-12h";
      claim.reportedAt = Number(claim.reportedAt || reportedAt || 0);

      state.history = state.history || [];
      if (!state.history.some(entry => entry.type === "task_auto_approved_12h" && entry.claimId === claimId)) {
        state.history.push({
          id: (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function")
            ? globalThis.crypto.randomUUID()
            : `auto12_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          type: "task_auto_approved_12h",
          claimId,
          reportedAt: Number(reportedAt || 0),
          approvedAt: Date.now(),
          delayHours: 12,
          timestamp: Date.now()
        });
      }
      api.replaceData(state, { snapshot:true, notify:true, render:false });
    }

    let running = false;
    function run12HourAutoApproval() {
      if (running) return false;
      running = true;
      let approvedCount = 0;
      try {
        const now = Date.now();
        const state = api.getData();
        const tasks = new Map((state.tasks || []).map(task => [task.id, task]));
        const due = (state.claims || []).filter(claim => {
          const task = tasks.get(claim.taskId);
          return isEligible(claim, task, state, now);
        });

        due.forEach(claim => {
          const reportedAt = reportTimestamp(claim, state);
          const ok = api.reviewClaim(
            claim.id,
            "approve",
            "Automatisch bestätigt: 12 Stunden nach der Erledigt-Meldung ohne Erzieherentscheidung."
          );
          if (!ok) return;
          annotateAutoApproval(claim.id, reportedAt);
          approvedCount += 1;
        });

        if (approvedCount > 0) {
          api.render?.();
          api.showToast?.(`${approvedCount} erledigt gemeldete Aufgabe${approvedCount === 1 ? " wurde" : "n wurden"} nach 12 Stunden automatisch bestätigt.`);
        }
      } catch (error) {
        console.error("Mitmach-Welt 2.9.1: 12-Stunden-Automatik fehlgeschlagen", error);
      } finally {
        running = false;
      }
      return approvedCount > 0;
    }

    function refreshAutoApprovalLabels() {
      const replacements = new Map([
        ["Tagesend-Bestätigung erlauben", "Automatische Bestätigung nach 12 Stunden erlauben"],
        ["Nur erledigt gemeldete und dafür freigegebene Aufgaben werden am Tagesende automatisch bestätigt. Besondere Aufgaben können weiterhin eine manuelle Prüfung verlangen.", "Erledigt gemeldete und dafür freigegebene Aufgaben werden nach 12 Stunden automatisch bestätigt, wenn vorher kein Erzieher entscheidet. Besondere Aufgaben können weiterhin eine manuelle Prüfung verlangen."],
        ["Automatisch am Tagesende bestätigt", "Automatisch nach 12 Stunden bestätigt"],
        ["Wartet auf Abendrunde", "Wartet auf Bestätigung"]
      ]);
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        if (!node.nodeValue) return;
        replacements.forEach((next, old) => {
          if (node.nodeValue.includes(old)) node.nodeValue = node.nodeValue.replaceAll(old, next);
        });
      });
    }

    const labelObserver = new MutationObserver(() => refreshAutoApprovalLabels());
    labelObserver.observe(document.body, { childList:true, subtree:true });

    persistHotfixSettings();
    refreshAutoApprovalLabels();
    run12HourAutoApproval();
    window.setInterval(run12HourAutoApproval, CHECK_INTERVAL_MS);
    window.addEventListener("focus", run12HourAutoApproval);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") run12HourAutoApproval();
    });

    window.MitmachWelt.autoApprove12h = {
      version: HOTFIX_VERSION,
      delayHours: 12,
      runNow: run12HourAutoApproval
    };

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
