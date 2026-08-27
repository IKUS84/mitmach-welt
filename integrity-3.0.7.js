(() => {
  "use strict";

  const VERSION = "3.0.7";
  let repairing = false;

  const clone = value => JSON.parse(JSON.stringify(value));

  function cleanState(state) {
    let changed = false;
    const children = Array.isArray(state?.children) ? state.children : [];
    const childIds = new Set(children.map(child => child?.id).filter(Boolean));

    if (Array.isArray(state?.rounds)) {
      const nextRounds = state.rounds.filter(round => {
        const refs = new Set([
          ...(Array.isArray(round?.participants) ? round.participants : []),
          ...(Array.isArray(round?.order) ? round.order : []),
          ...(Array.isArray(round?.assignments) ? round.assignments.map(item => item?.childId) : [])
        ].filter(Boolean));
        return [...refs].every(id => childIds.has(id));
      });
      if (nextRounds.length !== state.rounds.length) {
        state.rounds = nextRounds;
        changed = true;
      }
    }

    if (Array.isArray(state?.lastOrders)) {
      const nextOrders = state.lastOrders
        .map(order => (Array.isArray(order) ? order.filter(id => childIds.has(id)) : []))
        .filter(order => order.length > 0);
      if (JSON.stringify(nextOrders) !== JSON.stringify(state.lastOrders)) {
        state.lastOrders = nextOrders;
        changed = true;
      }
    }

    const pinMap = state?.settings?.childProfilePins;
    if (pinMap && typeof pinMap === "object" && !Array.isArray(pinMap)) {
      const nextPins = { ...pinMap };
      Object.keys(nextPins).forEach(id => {
        if (!childIds.has(id)) {
          delete nextPins[id];
          changed = true;
        }
      });
      if (changed) {
        state.settings ||= {};
        state.settings.childProfilePins = nextPins;
      }
    }

    return changed;
  }

  function init() {
    const api = window.MitmachWelt;
    if (!api?.getData || !api?.replaceData || !api?.subscribeToSaves) return setTimeout(init, 100);
    if (api.__mw307IntegrityGuard) return;

    const original = api.replaceData.bind(api);
    api.replaceData = (nextData, options = {}) => {
      const next = clone(nextData || {});
      cleanState(next);
      return original(next, options);
    };
    Object.defineProperty(api, "__mw307IntegrityGuard", { value:true });

    const run = () => {
      if (repairing) return;
      const state = api.getData();
      if (!cleanState(state)) return;
      repairing = true;
      try { api.replaceData(state, { snapshot:true, notify:true, render:true, integrityRepair:true }); }
      finally { repairing = false; }
    };

    api.subscribeToSaves(run);
    run();
    setTimeout(run, 700);
    api.integrityCheck = { version:VERSION, runNow:run };
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
