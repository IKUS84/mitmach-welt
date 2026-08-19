(() => {
  "use strict";

  const VERSION = "3.0.4";
  const PIN_KEY = "childProfilePins";
  const enc = new TextEncoder();
  const session = { childId:"", unlocked:"", bypass:false, enhancing:false };

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  const childById = (state,id) => (state?.children || []).find(child => child.id === id) || null;
  const pinMap = state => {
    const value = state?.settings?.[PIN_KEY];
    return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
  };
  const pinRecord = (state,id) => {
    const row = pinMap(state)[id] || {};
    return { enabled:Boolean(row.enabled && row.hash), hash:String(row.hash || ""), updatedAt:Number(row.updatedAt || 0) };
  };
  const protectedProfile = (state,id) => pinRecord(state,id).enabled;

  async function hashPin(childId,pin) {
    const bytes = enc.encode(`Mitmach-Welt|Profil-PIN|v1|${childId}|${pin}`);
    if (globalThis.crypto?.subtle) {
      const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
      return [...digest].map(byte => byte.toString(16).padStart(2,"0")).join("");
    }
    let hash = 2166136261;
    bytes.forEach(byte => { hash ^= byte; hash = Math.imul(hash,16777619); });
    return `fallback-${(hash >>> 0).toString(16)}`;
  }

  function mergePinMaps(local,incoming) {
    const a = pinMap(local), b = pinMap(incoming), merged = { ...b };
    new Set([...Object.keys(a),...Object.keys(b)]).forEach(id => {
      const left = pinRecord(local,id), right = pinRecord(incoming,id);
      if (!b[id] || left.updatedAt > right.updatedAt) merged[id] = a[id];
    });
    return merged;
  }

  function savePin(api,childId,enabled,hash="") {
    const state = api.getData();
    state.settings ||= {};
    const map = pinMap(state);
    map[childId] = { enabled:Boolean(enabled), hash:enabled ? String(hash) : "", updatedAt:Date.now() };
    state.settings[PIN_KEY] = map;
    state.hotfixVersion = VERSION;
    return api.replaceData(state,{snapshot:true,notify:true,render:false});
  }

  function ownModalRoot() { return document.querySelector("#modalRoot"); }
  function closeOwnModal() {
    const root = ownModalRoot();
    if (root?.querySelector("[data-mw304-modal]")) root.innerHTML = "";
  }

  function unlockPrompt(api,childId,sourceButton) {
    const state = api.getData(), child = childById(state,childId), root = ownModalRoot();
    if (!child || !root) return;
    root.innerHTML = `<div class="modal-backdrop" data-mw304-modal><section class="modal mw304-pin-modal" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>🔒 ${esc(child.name)}</h2><button class="modal-close" type="button" data-mw304="close">×</button></div>
      <div class="modal-body"><div class="mw304-pin-avatar" style="--accent:${esc(child.accent || "#f6c84d")}">${esc(child.avatar || "🙂")}</div>
      <p class="mw304-pin-intro">Gib deine <b>3-stellige Profil-PIN</b> ein.</p>
      <form id="mw304Unlock"><div class="form-field"><input name="pin" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" placeholder="•••" required class="mw304-pin-input"></div>
      <label class="mw304-educator-toggle"><input type="checkbox" name="educator"><span><b>Ich bin Erzieher/in</b><small>Erzieher-PIN statt Kinder-PIN verwenden</small></span></label>
      <p class="mw304-status" role="status"></p><div class="modal-actions"><button class="ghost-button" type="button" data-mw304="close">Abbrechen</button><button class="primary-button" type="submit">Profil öffnen</button></div></form></div></section></div>`;
    const form = root.querySelector("#mw304Unlock"), input = form.elements.pin, educator = form.elements.educator, intro = root.querySelector(".mw304-pin-intro");
    educator.addEventListener("change",()=>{
      input.value=""; input.maxLength = educator.checked ? 8 : 3; input.placeholder = educator.checked ? "Erzieher-PIN" : "•••";
      intro.innerHTML = educator.checked ? "Gib die <b>Erzieher-PIN</b> ein." : "Gib deine <b>3-stellige Profil-PIN</b> ein."; input.focus();
    });
    form.addEventListener("submit",async event=>{
      event.preventDefault();
      const pin=String(input.value || "").trim(), status=form.querySelector(".mw304-status");
      const valid = educator.checked
        ? pin.length > 0 && pin === String(api.getPin?.() || "")
        : /^\d{3}$/.test(pin) && await hashPin(childId,pin) === pinRecord(api.getData(),childId).hash;
      if (!valid) { status.textContent = educator.checked ? "Die Erzieher-PIN ist nicht richtig." : "Die Profil-PIN ist nicht richtig."; input.select(); return; }
      session.childId=childId; session.unlocked=childId; closeOwnModal(); session.bypass=true; try { sourceButton.click(); } finally { session.bypass=false; }
    });
    setTimeout(()=>input.focus(),50);
  }

  function childPinSettings(api,childId) {
    const state=api.getData(), child=childById(state,childId), rec=pinRecord(state,childId), root=ownModalRoot();
    if (!child || !root) return;
    root.innerHTML = `<div class="modal-backdrop" data-mw304-modal><section class="modal" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>🔐 Meine Profil-PIN</h2><button class="modal-close" type="button" data-mw304="close">×</button></div><div class="modal-body">
      <div class="mw304-pin-owner"><span>${esc(child.avatar || "🙂")}</span><div><b>${esc(child.name)}</b><small>${rec.enabled ? "Dein Profil ist geschützt." : "Der PIN-Schutz ist freiwillig und derzeit aus."}</small></div></div>
      <form id="mw304ChildPin"><div class="form-grid"><div class="form-field"><label>Neue 3-stellige PIN</label><input name="pin" inputmode="numeric" maxlength="3" pattern="[0-9]*" required></div><div class="form-field"><label>PIN wiederholen</label><input name="repeat" inputmode="numeric" maxlength="3" pattern="[0-9]*" required></div></div>
      <p class="tiny muted">Wenn du deine PIN vergisst, kann ein Erzieher sie zurücksetzen.</p><p class="mw304-status" role="status"></p>
      <div class="modal-actions">${rec.enabled ? `<button class="danger-button" type="button" data-mw304="child-off" data-child-id="${esc(childId)}">PIN-Schutz ausschalten</button>` : ""}<span class="modal-action-spacer"></span><button class="ghost-button" type="button" data-mw304="close">Abbrechen</button><button class="primary-button" type="submit">${rec.enabled ? "PIN ändern" : "PIN einschalten"}</button></div></form></div></section></div>`;
    const form=root.querySelector("#mw304ChildPin");
    form.addEventListener("submit",async event=>{
      event.preventDefault(); const pin=String(form.elements.pin.value||"").trim(), repeat=String(form.elements.repeat.value||"").trim(), status=form.querySelector(".mw304-status");
      if (!/^\d{3}$/.test(pin)) return status.textContent="Die PIN muss genau 3 Ziffern haben.";
      if (pin!==repeat) return status.textContent="Die beiden PIN-Eingaben stimmen nicht überein.";
      const hash=await hashPin(childId,pin); if (!savePin(api,childId,true,hash)) return status.textContent="Die PIN konnte nicht gespeichert werden.";
      session.unlocked=childId; closeOwnModal(); api.showToast?.("Deine Profil-PIN wurde gespeichert."); api.render?.();
    });
  }

  function injectChildPin(api) {
    if (document.body.dataset.screen !== "child" || !session.childId || session.unlocked !== session.childId) return;
    const menu=document.querySelector(".profile-menu"); if (!menu || menu.querySelector("[data-mw304='child-settings']")) return;
    const rec=pinRecord(api.getData(),session.childId), button=document.createElement("button");
    button.type="button"; button.className="profile-action mw304-profile-pin"; button.dataset.mw304="child-settings"; button.dataset.childId=session.childId;
    button.innerHTML=`<span class="icon">🔐</span><span><h3>Meine Profil-PIN</h3><p>${rec.enabled ? "PIN ändern oder Schutz ausschalten." : "Profil freiwillig mit einer 3-stelligen PIN schützen."}</p></span>`; menu.appendChild(button);
  }

  function injectHomeLocks(api) {
    if (document.body.dataset.screen !== "home") return;
    document.querySelectorAll(".child-card[data-action='open-child']").forEach(card=>{
      const locked=protectedProfile(api.getData(),card.dataset.childId), old=card.querySelector(".mw304-lock");
      if (!locked) return old?.remove(); if (old) return; const badge=document.createElement("span"); badge.className="mw304-lock"; badge.textContent="🔒"; badge.title="Profil mit PIN geschützt"; card.appendChild(badge);
    });
  }

  function injectAdminPin(api) {
    const form=document.querySelector("#childForm"); if (!form || form.querySelector(".mw304-admin-pin")) return;
    const childId=String(form.querySelector('input[name="id"]')?.value || ""); if (!childId) return;
    const grid=form.querySelector(".form-grid"), rec=pinRecord(api.getData(),childId); if (!grid) return;
    const panel=document.createElement("div"); panel.className="form-field full mw304-admin-pin";
    panel.innerHTML=`<div class="mw304-admin-head"><div><label>🔐 Profil-PIN</label><p class="tiny muted">${rec.enabled ? "Aktiv – beim Öffnen wird die Kinder-PIN verlangt." : "Nicht aktiv – das Profil öffnet sich ohne Kinder-PIN."}</p></div><span class="chip ${rec.enabled?"success":""}">${rec.enabled?"PIN aktiv":"Ohne PIN"}</span></div>
      <div class="mw304-admin-controls"><input inputmode="numeric" maxlength="3" pattern="[0-9]*" placeholder="Neue 3-stellige PIN" data-mw304-admin-input><button class="primary-button small-button" type="button" data-mw304="admin-save" data-child-id="${esc(childId)}">PIN setzen / ändern</button>${rec.enabled?`<button class="danger-button small-button" type="button" data-mw304="admin-reset" data-child-id="${esc(childId)}">PIN zurücksetzen</button>`:""}</div><p class="mw304-status tiny"></p>`;
    grid.appendChild(panel);
  }

  function injectQuickGoals() {
    if (document.body.dataset.screen !== "educator") return;
    document.querySelectorAll('button[data-action="open-goal-review"][data-child-id][data-goal-id]').forEach(detail=>{
      if (!/Jetzt\s+gemeinsam\s+auswerten/i.test(detail.textContent||"")) return;
      const card=detail.closest("article.task-card.goal-card"); if (!card || card.dataset.mw304Quick) return;
      card.dataset.mw304Quick="1"; card.classList.add("mw304-goal-card"); card.tabIndex=0; detail.classList.add("mw304-detail-trigger"); detail.hidden=true;
      const actions=document.createElement("div"); actions.className="mw304-quick-actions"; actions.innerHTML='<button class="success-button" type="button" data-mw304="quick-goal" data-result="achieved">✅ Geschafft</button><button class="danger-button" type="button" data-mw304="quick-goal" data-result="notYet">❌ Nicht geschafft</button>';
      const hint=document.createElement("p"); hint.className="mw304-hint"; hint.textContent="Karte antippen für Teilweise, Ablehnung oder eine Rückmeldung."; detail.before(actions,hint);
    });
  }

  function quickGoal(api,button) {
    const card=button.closest(".mw304-goal-card"), detail=card?.querySelector('button[data-action="open-goal-review"]'); if (!detail) return;
    detail.click(); const form=document.querySelector("#goalReviewForm"); if (!form) return api.showToast?.("Auswertung konnte nicht geöffnet werden.");
    if (!form.elements.childView?.value) return api.showToast?.("Bitte die Selbsteinschätzung zuerst gemeinsam prüfen.");
    form.elements.result.value=button.dataset.result; typeof form.requestSubmit === "function" ? form.requestSubmit() : form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
  }

  function installGuard(api) {
    if (api.__mw304PinGuard) return; const original=api.replaceData.bind(api);
    api.replaceData=(next,options={})=>{
      const local=api.getData(), guarded=next && typeof next==="object" ? JSON.parse(JSON.stringify(next)) : next;
      if (guarded && typeof guarded==="object") { guarded.settings ||= {}; guarded.settings[PIN_KEY]=mergePinMaps(local,guarded); guarded.hotfixVersion=VERSION; }
      const result=original(guarded,options); setTimeout(enhance,0); return result;
    };
    Object.defineProperty(api,"__mw304PinGuard",{value:true});
  }

  function styles() {
    if (document.querySelector("#mw304Styles")) return; const el=document.createElement("style"); el.id="mw304Styles"; el.textContent=`
      .mw304-pin-modal{max-width:440px}.mw304-pin-avatar{width:86px;height:86px;border-radius:28px;margin:4px auto 14px;display:grid;place-items:center;font-size:3rem;background:#fff7dc}.mw304-pin-intro{text-align:center}.mw304-pin-input{text-align:center!important;font-size:1.8rem!important;letter-spacing:.35em!important;font-weight:800}.mw304-educator-toggle{display:flex;gap:10px;padding:13px;margin-top:14px;border-radius:18px;background:#f6f8f6;border:1px solid #e3e8e3}.mw304-educator-toggle input{width:auto}.mw304-educator-toggle span{display:grid}.mw304-educator-toggle small{color:#66756b}.mw304-status{min-height:1.25em;color:#a23a45;font-weight:700}.mw304-pin-owner{display:flex;gap:12px;align-items:center;padding:12px 14px;margin-bottom:14px;border-radius:18px;background:#fff8e8}.mw304-pin-owner>span{font-size:2.4rem}.mw304-pin-owner div{display:grid}.mw304-profile-pin{border-style:dashed!important}.child-card{position:relative}.mw304-lock{position:absolute;right:10px;bottom:10px;width:31px;height:31px;display:grid;place-items:center;border-radius:50%;background:#fff;box-shadow:0 3px 12px #0002}.mw304-admin-pin{padding:14px;border-radius:18px;background:#f6f8f6}.mw304-admin-head{display:flex;justify-content:space-between;gap:10px}.mw304-admin-controls{display:grid;grid-template-columns:minmax(120px,1fr) auto auto;gap:8px;margin-top:10px}.mw304-goal-card{cursor:pointer}.mw304-goal-card:focus-visible{outline:3px solid #f6c84d;outline-offset:3px}.mw304-quick-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.mw304-quick-actions button{min-height:50px}.mw304-hint{text-align:center;margin:8px 4px 0;color:#718078;font-size:.82rem}.mw304-detail-trigger{display:none!important}@media(max-width:620px){.mw304-admin-controls{grid-template-columns:1fr}.mw304-quick-actions button{font-size:.92rem;padding-inline:8px}}
    `; document.head.appendChild(el);
  }

  function enhance() {
    if (session.enhancing) return; session.enhancing=true;
    try { const api=window.MitmachWelt; if (!api?.getData) return; if (document.body.dataset.screen==="home") { session.childId=""; session.unlocked=""; } injectHomeLocks(api); injectChildPin(api); injectAdminPin(api); injectQuickGoals(); }
    finally { session.enhancing=false; }
  }

  function init() {
    const api=window.MitmachWelt; if (!api?.getData || !api?.replaceData || !api?.getPin) return setTimeout(init,100);
    styles(); installGuard(api); try { api.version=VERSION; } catch {}
    const initial=api.getData(); initial.settings ||= {}; let changed=false; if (!initial.settings[PIN_KEY] || typeof initial.settings[PIN_KEY]!=="object" || Array.isArray(initial.settings[PIN_KEY])) { initial.settings[PIN_KEY]={}; changed=true; } if (initial.hotfixVersion!==VERSION) { initial.hotfixVersion=VERSION; changed=true; } if (changed) api.replaceData(initial,{snapshot:true,notify:true,render:false});

    document.addEventListener("click",event=>{
      const open=event.target.closest?.('[data-action="open-child"][data-child-id]');
      if (open) { const id=open.dataset.childId; session.childId=id; if (!protectedProfile(api.getData(),id)) { session.unlocked=id; return; } if (session.bypass && session.unlocked===id) return; event.preventDefault(); event.stopImmediatePropagation(); unlockPrompt(api,id,open); return; }
      const button=event.target.closest?.("[data-mw304]"); if (button) {
        const action=button.dataset.mw304;
        if (action==="close") { event.preventDefault(); closeOwnModal(); return; }
        if (action==="child-settings") { event.preventDefault(); event.stopPropagation(); childPinSettings(api,button.dataset.childId); return; }
        if (action==="child-off") { event.preventDefault(); if (savePin(api,button.dataset.childId,false)) { closeOwnModal(); api.showToast?.("Der Profil-PIN-Schutz ist ausgeschaltet."); api.render?.(); } return; }
        if (action==="admin-save") { event.preventDefault(); const panel=button.closest(".mw304-admin-pin"), input=panel?.querySelector("[data-mw304-admin-input]"), status=panel?.querySelector(".mw304-status"), pin=String(input?.value||"").trim(); if (!/^\d{3}$/.test(pin)) { status.textContent="Bitte genau 3 Ziffern eingeben."; input?.focus(); return; } hashPin(button.dataset.childId,pin).then(hash=>{ if (savePin(api,button.dataset.childId,true,hash)) { api.showToast?.("Profil-PIN wurde gesetzt bzw. geändert."); panel.remove(); injectAdminPin(api); } }); return; }
        if (action==="admin-reset") { event.preventDefault(); if (!confirm("Profil-PIN für dieses Kind wirklich zurücksetzen?")) return; if (savePin(api,button.dataset.childId,false)) { api.showToast?.("Profil-PIN wurde zurückgesetzt."); const panel=button.closest(".mw304-admin-pin"); panel.remove(); injectAdminPin(api); } return; }
        if (action==="quick-goal") { event.preventDefault(); event.stopPropagation(); quickGoal(api,button); return; }
      }
      const card=event.target.closest?.(".mw304-goal-card"); if (card && !event.target.closest("button,input,select,textarea,a,label")) card.querySelector('[data-action="open-goal-review"]')?.click();
    },true);
    document.addEventListener("keydown",event=>{ const card=event.target.closest?.(".mw304-goal-card"); if (card && ["Enter"," "].includes(event.key) && !event.target.closest("button,input,select,textarea,a,label")) { event.preventDefault(); card.querySelector('[data-action="open-goal-review"]')?.click(); } });
    new MutationObserver(()=>setTimeout(enhance,0)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["data-screen"]});
    api.subscribeToSaves?.(()=>setTimeout(enhance,0)); document.title=`Mitmach-Welt ${VERSION}`; const label=document.querySelector(".eyebrow"); if (label?.textContent?.includes("Projekt Sonnenblume")) label.textContent=`Projekt Sonnenblume · Version ${VERSION}`;
    setTimeout(()=>{ if (window.MitmachWeltSync) try { window.MitmachWeltSync.version=VERSION; } catch {} },350);
    api.profilePins={version:VERSION,digits:3,optional:true,educatorOverride:true,isProtected:id=>protectedProfile(api.getData(),id)}; api.quickGoalReview={version:VERSION,enabled:true}; enhance();
  }

  document.readyState==="loading" ? document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true}) : setTimeout(init,0);
})();
