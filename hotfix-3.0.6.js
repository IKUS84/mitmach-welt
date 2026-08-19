(() => {
  "use strict";

  const VERSION = "3.0.6";
  const IDLE_MS = 2 * 60 * 1000;
  const CHILD_SCREENS = new Set(["child","tasks","missions","world","shop","achievements"]);
  let childId = "";
  let lastActivity = Date.now();
  let lockRunning = false;
  let enhancePending = false;

  const esc = value => String(value ?? "").replace(/[&<>"\']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  const api = () => window.MitmachWelt;
  const screen = () => document.body.dataset.screen || "";
  const inChildArea = () => CHILD_SCREENS.has(screen());
  const child = id => (api()?.getData()?.children || []).find(item => item.id === id) || null;
  const protectedProfile = id => Boolean(id && api()?.profilePins?.isProtected?.(id));

  function scheduleEnhance() {
    if (enhancePending) return;
    enhancePending = true;
    setTimeout(() => {
      enhancePending = false;
      enhance();
    }, 0);
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function enhanceHome() {
    if (screen() !== "home") return;
    childId = "";
    document.querySelectorAll(".child-card[data-action='open-child'][data-child-id]").forEach(card => {
      const entry = child(card.dataset.childId);
      if (!entry) return;
      const locked = protectedProfile(entry.id);
      const small = card.querySelector("small");
      setText(small, locked ? "🔒 Geschütztes Profil" : "Profil öffnen");
      small?.classList.toggle("mw306-protected-label", locked);
      card.classList.toggle("mw306-protected-card", locked);
    });
  }

  function enhanceProfileBar() {
    const root = document.querySelector("#app");
    if (!root) return;
    if (!inChildArea() || !childId) {
      root.querySelector(".mw306-profile-bar")?.remove();
      return;
    }
    const entry = child(childId);
    if (!entry) return;
    const locked = protectedProfile(childId);
    const canEditPin = screen() === "child" && Boolean(document.querySelector(".mw304-profile-pin"));
    const signature = [entry.id, entry.name, entry.avatar, entry.accent, locked, canEditPin].join("|");
    let bar = root.querySelector(".mw306-profile-bar");
    if (!bar) {
      bar = document.createElement("section");
      bar.className = "mw306-profile-bar";
      root.prepend(bar);
    }
    if (bar.dataset.signature === signature) return;
    bar.dataset.signature = signature;
    bar.style.setProperty("--accent", entry.accent || "#f6c84d");
    bar.innerHTML = `
      <div class="mw306-person">
        <span class="mw306-avatar">${esc(entry.avatar || "🙂")}</span>
        <span class="mw306-name"><b>${esc(entry.name)}</b><small>${locked ? "🔒 Geschützter persönlicher Bereich" : "Persönlicher Bereich"}</small></span>
      </div>
      <div class="mw306-actions">
        ${canEditPin ? `<button type="button" class="mw306-button" data-mw306="pin">${locked ? "⚙️ PIN" : "🔐 PIN"}</button>` : ""}
        ${locked ? `<button type="button" class="mw306-button mw306-lock" data-mw306="lock">🔒 Sperren</button>` : ""}
      </div>`;
  }

  function enhance() {
    const mw = api();
    if (!mw?.getData) return;
    if (screen() === "home") childId = "";
    enhanceHome();
    enhanceProfileBar();
    const version = document.querySelector(".eyebrow");
    if (version?.textContent?.includes("Projekt Sonnenblume")) {
      setText(version, `Projekt Sonnenblume · Version ${VERSION}`);
    }
    if (document.title !== `Mitmach-Welt ${VERSION}`) document.title = `Mitmach-Welt ${VERSION}`;
  }

  function lockProfile(reason, showToast = false) {
    const mw = api();
    if (lockRunning || !mw?.goHome || !protectedProfile(childId)) return false;
    lockRunning = true;
    childId = "";
    lastActivity = Date.now();
    document.querySelector("#modalRoot")?.replaceChildren();
    mw.goHome();
    if (showToast && reason === "idle") mw.showToast?.("🔒 Das Profil wurde nach 2 Minuten ohne Nutzung automatisch gesperrt.");
    if (showToast && reason === "manual") mw.showToast?.("🔒 Profil gesperrt.");
    setTimeout(() => {
      lockRunning = false;
      scheduleEnhance();
    }, 0);
    return true;
  }

  function installStyles() {
    if (document.querySelector("#mw306Styles")) return;
    const style = document.createElement("style");
    style.id = "mw306Styles";
    style.textContent = `
      body[data-screen="child"] .mw304-profile-pin{display:none!important}
      .mw306-profile-bar{margin:0 0 14px;padding:10px 12px;border:1px solid #dfe7e1;border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(50,76,61,.08);display:flex;align-items:center;justify-content:space-between;gap:12px}
      .mw306-person{display:flex;align-items:center;gap:10px;min-width:0}.mw306-avatar{width:46px;height:46px;flex:0 0 46px;border-radius:16px;display:grid;place-items:center;font-size:1.8rem;background:#fff7dc}.mw306-name{display:grid;min-width:0}.mw306-name b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mw306-name small{color:#718078;font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .mw306-actions{display:flex;gap:7px}.mw306-button{border:1px solid #dfe7e1;background:#fff;border-radius:14px;padding:9px 11px;font:inherit;font-size:.82rem;font-weight:800;color:#35483d;white-space:nowrap}.mw306-lock{background:#fff5f2;border-color:#f0d6d1;color:#91463e}
      .mw306-protected-label{font-weight:700;color:#52675a!important}.child-card.mw306-protected-card{box-shadow:0 0 0 1px rgba(67,97,78,.08),var(--shadow-soft)}.mw304-lock{right:10px!important;top:10px!important;bottom:auto!important}
      @media(max-width:560px){.mw306-profile-bar{padding:9px 10px}.mw306-avatar{width:42px;height:42px;flex-basis:42px}.mw306-name small{max-width:150px}.mw306-button{padding:8px 9px;font-size:.76rem}}
      @media(max-width:390px){.mw306-name small{display:none}.mw306-lock{font-size:0}.mw306-lock::before{content:"🔒";font-size:1rem}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    const mw = api();
    if (!mw?.getData || !mw?.goHome || !mw?.profilePins) return setTimeout(init, 100);
    installStyles();
    try { mw.version = VERSION; } catch {}

    document.addEventListener("click", event => {
      lastActivity = Date.now();

      const groupNav = event.target.closest?.('[data-nav="group"],[data-action="nav-group"]');
      if (groupNav && inChildArea() && protectedProfile(childId)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (lockProfile("group", false)) {
          setTimeout(() => document.querySelector('[data-nav="group"]')?.click(), 150);
        }
        return;
      }

      const open = event.target.closest?.('[data-action="open-child"][data-child-id]');
      if (open) {
        const nextId = String(open.dataset.childId || "");
        setTimeout(() => {
          if (!inChildArea()) return;
          childId = nextId;
          lastActivity = Date.now();
          scheduleEnhance();
        }, 0);
      }

      const own = event.target.closest?.("[data-mw306]");
      if (!own) return;
      event.preventDefault();
      event.stopPropagation();
      if (own.dataset.mw306 === "lock") lockProfile("manual", true);
      if (own.dataset.mw306 === "pin") document.querySelector(".mw304-profile-pin")?.click();
    }, true);

    ["pointerdown","keydown","touchstart"].forEach(type => {
      document.addEventListener(type, () => { lastActivity = Date.now(); }, { passive:true });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && inChildArea() && protectedProfile(childId)) {
        lockProfile("background", false);
      } else if (document.visibilityState === "visible") {
        lastActivity = Date.now();
        scheduleEnhance();
      }
    });

    window.addEventListener("pagehide", () => {
      if (inChildArea() && protectedProfile(childId)) lockProfile("background", false);
    });

    setInterval(() => {
      if (document.visibilityState !== "visible" || !inChildArea() || !protectedProfile(childId)) return;
      if (Date.now() - lastActivity >= IDLE_MS) lockProfile("idle", true);
    }, 10000);

    new MutationObserver(records => {
      if (records.some(record => record.attributeName === "data-screen")) scheduleEnhance();
    }).observe(document.body, { attributes:true, attributeFilter:["data-screen"] });

    mw.subscribeToSaves?.(scheduleEnhance);
    setTimeout(() => {
      try { mw.version = VERSION; } catch {}
      if (window.MitmachWeltSync) try { window.MitmachWeltSync.version = VERSION; } catch {}
    }, 700);
    mw.profileNavigation = { version:VERSION, idleLockMinutes:2, lockOnBackground:true, lockOnHome:true, lockNow:() => lockProfile("manual", true) };
    enhance();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
