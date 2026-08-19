(() => {
  "use strict";

  const VERSION = "3.0.5";
  const PIN_KEY = "childProfilePins";
  const IDLE_LOCK_MS = 2 * 60 * 1000;
  const CHILD_SCREENS = new Set(["child","tasks","missions","world","shop","achievements"]);
  const enc = new TextEncoder();

  let currentChildId = "";
  let lastActivityAt = Date.now();
  let enhancing = false;
  let locking = false;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[ch]));

  const childById = (state, id) => (state?.children || []).find(child => child.id === id) || null;
  const pinMap = state => {
    const value = state?.settings?.[PIN_KEY];
    return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
  };
  const pinRecord = (state, id) => {
    const row = pinMap(state)[id] || {};
    return {
      enabled:Boolean(row.enabled && row.hash),
      hash:String(row.hash || ""),
      updatedAt:Number(row.updatedAt || 0)
    };
  };
  const protectedProfile = (state, id) => Boolean(id && pinRecord(state, id).enabled);
  const childScreenActive = () => CHILD_SCREENS.has(document.body.dataset.screen || "");

  async function hashPin(childId, pin) {
    const bytes = enc.encode(`Mitmach-Welt|Profil-PIN|v1|${childId}|${pin}`);
    if (globalThis.crypto?.subtle) {
      const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
      return [...digest].map(byte => byte.toString(16).padStart(2, "0")).join("");
    }
    let hash = 2166136261;
    bytes.forEach(byte => { hash ^= byte; hash = Math.imul(hash, 16777619); });
    return `fallback-${(hash >>> 0).toString(16)}`;
  }

  function savePin(api, childId, enabled, hash = "") {
    const state = api.getData();
    state.settings ||= {};
    const map = pinMap(state);
    map[childId] = {
      enabled:Boolean(enabled),
      hash:enabled ? String(hash) : "",
      updatedAt:Date.now()
    };
    state.settings[PIN_KEY] = map;
    const ok = api.replaceData(state, { snapshot:true, notify:true, render:false });
    if (ok) setTimeout(enhance, 0);
    return ok;
  }

  function modalRoot() { return document.querySelector("#modalRoot"); }
  function closeProfileModal() {
    const root = modalRoot();
    if (root?.querySelector("[data-mw305-modal]")) root.innerHTML = "";
  }

  function openPinSettings(api, childId) {
    const state = api.getData();
    const child = childById(state, childId);
    const rec = pinRecord(state, childId);
    const root = modalRoot();
    if (!child || !root) return;

    root.innerHTML = `
      <div class="modal-backdrop" data-mw305-modal>
        <section class="modal mw305-pin-settings" role="dialog" aria-modal="true" aria-label="Profil-PIN von ${esc(child.name)}">
          <div class="modal-head">
            <h2>🔐 Meine Profil-PIN</h2>
            <button class="modal-close" type="button" data-mw305="close" aria-label="Schließen">×</button>
          </div>
          <div class="modal-body">
            <div class="mw305-pin-owner" style="--accent:${esc(child.accent || "#f6c84d")}">
              <span>${esc(child.avatar || "🙂")}</span>
              <div><b>${esc(child.name)}</b><small>${rec.enabled ? "Dein Profil ist geschützt." : "Der PIN-Schutz ist freiwillig und derzeit aus."}</small></div>
            </div>
            <form id="mw305PinForm">
              <div class="form-grid">
                <div class="form-field"><label>${rec.enabled ? "Neue 3-stellige PIN" : "3-stellige PIN"}</label><input name="pin" inputmode="numeric" maxlength="3" pattern="[0-9]*" autocomplete="off" required></div>
                <div class="form-field"><label>PIN wiederholen</label><input name="repeat" inputmode="numeric" maxlength="3" pattern="[0-9]*" autocomplete="off" required></div>
              </div>
              <p class="tiny muted">Die PIN schützt deinen persönlichen Bereich vor neugierigen Blicken. Wenn du sie vergisst, kann ein Erzieher sie zurücksetzen.</p>
              <p class="mw305-status" role="status"></p>
              <div class="modal-actions">
                ${rec.enabled ? `<button class="danger-button" type="button" data-mw305="disable-pin" data-child-id="${esc(childId)}">PIN-Schutz ausschalten</button>` : ""}
                <span class="modal-action-spacer"></span>
                <button class="ghost-button" type="button" data-mw305="close">Abbrechen</button>
                <button class="primary-button" type="submit">${rec.enabled ? "PIN ändern" : "PIN einschalten"}</button>
              </div>
            </form>
          </div>
        </section>
      </div>`;

    const form = root.querySelector("#mw305PinForm");
    form?.addEventListener("submit", async event => {
      event.preventDefault();
      const pin = String(form.elements.pin.value || "").trim();
      const repeat = String(form.elements.repeat.value || "").trim();
      const status = form.querySelector(".mw305-status");
      if (!/^\d{3}$/.test(pin)) { status.textContent = "Die PIN muss genau 3 Ziffern haben."; return; }
      if (pin !== repeat) { status.textContent = "Die beiden PIN-Eingaben stimmen nicht überein."; return; }
      const hash = await hashPin(childId, pin);
      if (!savePin(api, childId, true, hash)) { status.textContent = "Die PIN konnte nicht gespeichert werden."; return; }
      closeProfileModal();
      lastActivityAt = Date.now();
      api.showToast?.(rec.enabled ? "Deine Profil-PIN wurde geändert." : "Dein Profil ist jetzt geschützt.");
      api.render?.();
    });
    setTimeout(() => form?.elements.pin?.focus(), 50);
  }

  function lockCurrentProfile(api, reason = "manual", showMessage = true) {
    if (locking) return false;
    const id = currentChildId;
    const isProtected = protectedProfile(api.getData(), id);
    if (!id || !isProtected) return false;
    locking = true;
    currentChildId = "";
    lastActivityAt = Date.now();
    const root = modalRoot();
    if (root) root.innerHTML = "";
    api.goHome?.();
    if (showMessage && reason === "idle") api.showToast?.("🔒 Das Profil wurde nach 2 Minuten ohne Nutzung automatisch gesperrt.");
    if (showMessage && reason === "manual") api.showToast?.("🔒 Profil gesperrt.");
    setTimeout(() => { locking = false; enhance(); }, 0);
    return true;
  }

  function enhanceHome(api) {
    if (document.body.dataset.screen !== "home") return;
    currentChildId = "";
    document.querySelectorAll(".child-card[data-action='open-child'][data-child-id]").forEach(card => {
      const child = childById(api.getData(), card.dataset.childId);
      if (!child) return;
      const locked = protectedProfile(api.getData(), child.id);
      const small = card.querySelector("small");
      if (small) {
        small.textContent = locked ? "🔒 Geschütztes Profil" : "Profil öffnen";
        small.classList.toggle("mw305-protected-label", locked);
      }
      card.classList.toggle("mw305-protected-card", locked);
      card.setAttribute("aria-label", locked ? `${child.name}, geschütztes Profil öffnen` : `${child.name}, Profil öffnen`);
    });
  }

  function enhancePersonalBar(api) {
    const app = document.querySelector("#app");
    if (!app) return;
    if (!childScreenActive() || !currentChildId) {
      app.querySelector(".mw305-profile-bar")?.remove();
      return;
    }
    const child = childById(api.getData(), currentChildId);
    if (!child) return;
    const locked = protectedProfile(api.getData(), child.id);
    let bar = app.querySelector(".mw305-profile-bar");
    if (!bar) {
      bar = document.createElement("section");
      bar.className = "mw305-profile-bar";
      app.prepend(bar);
    }
    bar.style.setProperty("--accent", child.accent || "#f6c84d");
    bar.innerHTML = `
      <div class="mw305-profile-person">
        <span class="mw305-profile-avatar">${esc(child.avatar || "🙂")}</span>
        <span class="mw305-profile-name"><b>${esc(child.name)}</b><small>${locked ? "🔒 Geschützter persönlicher Bereich" : "Persönlicher Bereich"}</small></span>
      </div>
      <div class="mw305-profile-actions">
        <button type="button" class="mw305-profile-button" data-mw305="pin-settings" data-child-id="${esc(child.id)}" aria-label="Profil-PIN verwalten">${locked ? "⚙️ PIN" : "🔐 PIN"}</button>
        ${locked ? `<button type="button" class="mw305-profile-button mw305-lock-now" data-mw305="lock-now" aria-label="Profil jetzt sperren">🔒 Sperren</button>` : ""}
      </div>`;
  }

  function enhance() {
    if (enhancing) return;
    enhancing = true;
    try {
      const api = window.MitmachWelt;
      if (!api?.getData) return;
      enhanceHome(api);
      enhancePersonalBar(api);
      const label = document.querySelector(".eyebrow");
      if (label?.textContent?.includes("Projekt Sonnenblume") && !label.textContent.includes(VERSION)) label.textContent = `Projekt Sonnenblume · Version ${VERSION}`;
      document.title = `Mitmach-Welt ${VERSION}`;
    } finally {
      enhancing = false;
    }
  }

  function init() {
    const api = window.MitmachWelt;
    if (!api?.getData || !api?.replaceData || !api?.goHome) return setTimeout(init, 100);
    try { api.version = VERSION; } catch {}

    const style = document.createElement("style");
    style.id = "mw305Styles";
    style.textContent = `
      body[data-screen="child"] .mw304-profile-pin{display:none!important}
      .mw305-profile-bar{margin:0 0 14px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--accent) 25%,#dfe7e1);border-radius:20px;background:rgba(255,255,255,.92);box-shadow:0 8px 24px rgba(50,76,61,.08);display:flex;align-items:center;justify-content:space-between;gap:12px}
      .mw305-profile-person{display:flex;align-items:center;gap:10px;min-width:0}.mw305-profile-avatar{width:46px;height:46px;flex:0 0 46px;border-radius:16px;display:grid;place-items:center;font-size:1.8rem;background:color-mix(in srgb,var(--accent) 16%,#fff)}
      .mw305-profile-name{display:grid;min-width:0}.mw305-profile-name b{font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mw305-profile-name small{color:#718078;font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .mw305-profile-actions{display:flex;align-items:center;gap:7px}.mw305-profile-button{border:1px solid #dfe7e1;background:#fff;border-radius:14px;padding:9px 11px;font:inherit;font-size:.82rem;font-weight:800;color:#35483d;white-space:nowrap;cursor:pointer}.mw305-profile-button:active{transform:scale(.98)}.mw305-lock-now{background:#fff5f2;border-color:#f0d6d1;color:#91463e}
      .child-card.mw305-protected-card{box-shadow:0 0 0 1px rgba(67,97,78,.08),var(--shadow-soft)}.mw305-protected-label{font-weight:700;color:#52675a!important}.mw304-lock{right:10px!important;top:10px!important;bottom:auto!important}
      .mw305-pin-owner{display:flex;align-items:center;gap:12px;padding:12px 14px;margin-bottom:14px;border-radius:18px;background:color-mix(in srgb,var(--accent) 12%,#fff8e8)}.mw305-pin-owner>span{font-size:2.4rem}.mw305-pin-owner div{display:grid}.mw305-status{min-height:1.25em;color:#a23a45;font-weight:700}
      @media(max-width:560px){.mw305-profile-bar{padding:9px 10px}.mw305-profile-avatar{width:42px;height:42px;flex-basis:42px;font-size:1.6rem}.mw305-profile-name small{max-width:150px}.mw305-profile-button{padding:8px 9px;font-size:.76rem}.mw305-profile-actions{gap:5px}}
      @media(max-width:390px){.mw305-profile-name small{display:none}.mw305-profile-button{padding:8px}.mw305-lock-now{font-size:0}.mw305-lock-now::before{content:"🔒";font-size:1rem}}
    `;
    if (!document.querySelector("#mw305Styles")) document.head.appendChild(style);

    document.addEventListener("click", event => {
      lastActivityAt = Date.now();

      const sharedNav = event.target.closest?.('[data-nav="group"],[data-action="nav-group"]');
      if (sharedNav && childScreenActive() && protectedProfile(api.getData(), currentChildId)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        lockCurrentProfile(api, "shared", false);
        setTimeout(() => document.querySelector('[data-nav="group"]')?.click(), 30);
        return;
      }

      const open = event.target.closest?.('[data-action="open-child"][data-child-id]');
      if (open) {
        const id = String(open.dataset.childId || "");
        setTimeout(() => {
          if (childScreenActive()) {
            currentChildId = id;
            lastActivityAt = Date.now();
            enhance();
          }
        }, 0);
      }

      const button = event.target.closest?.("[data-mw305]");
      if (!button) return;
      const action = button.dataset.mw305;
      if (action === "close") { event.preventDefault(); closeProfileModal(); return; }
      if (action === "pin-settings") { event.preventDefault(); openPinSettings(api, button.dataset.childId || currentChildId); return; }
      if (action === "lock-now") { event.preventDefault(); lockCurrentProfile(api, "manual", true); return; }
      if (action === "disable-pin") {
        event.preventDefault();
        const id = button.dataset.childId || currentChildId;
        if (!confirm("PIN-Schutz für dieses Profil wirklich ausschalten?")) return;
        if (savePin(api, id, false)) {
          closeProfileModal();
          api.showToast?.("PIN-Schutz wurde ausgeschaltet.");
          api.render?.();
        }
      }
    }, true);

    ["pointerdown","keydown","touchstart"].forEach(type => document.addEventListener(type, () => { lastActivityAt = Date.now(); }, { passive:true }));

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && childScreenActive() && protectedProfile(api.getData(), currentChildId)) {
        lockCurrentProfile(api, "background", false);
      } else if (document.visibilityState === "visible") {
        lastActivityAt = Date.now();
        setTimeout(enhance, 0);
      }
    });

    window.addEventListener("pagehide", () => {
      if (childScreenActive() && protectedProfile(api.getData(), currentChildId)) lockCurrentProfile(api, "background", false);
    });

    window.setInterval(() => {
      if (document.visibilityState !== "visible" || !childScreenActive() || !currentChildId) return;
      if (!protectedProfile(api.getData(), currentChildId)) return;
      if (Date.now() - lastActivityAt >= IDLE_LOCK_MS) lockCurrentProfile(api, "idle", true);
    }, 10000);

    new MutationObserver(() => setTimeout(enhance, 0)).observe(document.body, {
      childList:true, subtree:true, attributes:true, attributeFilter:["data-screen"]
    });
    api.subscribeToSaves?.(() => setTimeout(enhance, 0));

    document.title = `Mitmach-Welt ${VERSION}`;
    const label = document.querySelector(".eyebrow");
    if (label?.textContent?.includes("Projekt Sonnenblume")) label.textContent = `Projekt Sonnenblume · Version ${VERSION}`;
    setTimeout(() => {
      try { api.version = VERSION; } catch {}
      if (window.MitmachWeltSync) try { window.MitmachWeltSync.version = VERSION; } catch {}
    }, 700);

    api.profileNavigation = {
      version:VERSION,
      idleLockMinutes:2,
      lockOnBackground:true,
      lockOnHome:true,
      lockNow:() => lockCurrentProfile(api, "manual", true)
    };
    enhance();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0), { once:true })
    : setTimeout(init, 0);
})();
