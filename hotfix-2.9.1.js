(() => {
  "use strict";

  const HOTFIX_VERSION = "2.9.1";
  const STORAGE_KEY = "mitmach_welt_state_v1";
  const AUTO_APPROVE_DELAY_MS = 12 * 60 * 60 * 1000;
  const CHECK_INTERVAL_MS = 60 * 1000;

  // Die alte 21-Uhr-Automatik in app.js wird abgeschaltet, bevor app.js den
  // gespeicherten Stand lädt. Die neue Automatik arbeitet ausschließlich mit
  // "erledigt gemeldet + 12 Stunden" und ist damit unabhängig vom Kalendertag.
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

  function init() {
    const api = window.MitmachWelt;
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
      if (changed) api.replaceData(state, { snapshot:false, notify:false, render:false });
    }

    function plannedChildren(claim, task) {
      return Math.max(
        1,
        Number(task?.requiredChildren || 1),
        Number(claim?.requiredChildrenOverride || 0),
        Number(claim?.plannedRequiredChildren || 0)
      );
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
      if (!participants.length || participants.length !== plannedChildren(claim, task)) return false;

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
        ["Automatisch am Tagesende bestätigt", "Automatisch nach 12 Stunden bestätigt"]
      ]);
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const text = node.nodeValue;
        if (!text) return;
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(init, 0), { once:true });
  } else {
    window.setTimeout(init, 0);
  }
})();
