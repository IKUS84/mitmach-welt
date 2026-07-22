(() => {
  "use strict";

  const CONFIG_KEY = "mitmach_welt_device_sync_v1";
  const META_KEY = "mitmach_welt_device_sync_meta_v1";
  const BROKER_URL = "wss://broker.emqx.io:8084/mqtt";
  const PAIR_PREFIX = "MW2.";
  const PAIR_BOOTSTRAP_COOKIE = "mitmach_welt_pair_bootstrap_v1";
  const API = window.MitmachWelt;

  if (!API) {
    console.error("Mitmach-Welt: Die App-Schnittstelle für den Gerätesync fehlt.");
    return;
  }

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const syncButton = document.querySelector("#syncButton");
  const modalRoot = document.querySelector("#modalRoot");

  let config = normalizeConfig(readJson(CONFIG_KEY));
  let meta = normalizeMeta(readJson(META_KEY));
  let client = null;
  let topic = "";
  let publishTimer = null;
  let initialTimer = null;
  let awaitingInitialState = false;
  let status = config.enabled ? "offline" : "off";
  let statusDetail = "";
  let lastIncomingDevice = "";

  function readJson(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  function cookiePath() {
    const path = location.pathname || "/";
    return path.endsWith("/") ? path : path.slice(0, path.lastIndexOf("/") + 1) || "/";
  }

  function setPairBootstrapCookie(code, role = "child") {
    try {
      const payload = encodeURIComponent(JSON.stringify({ code, role, createdAt: Date.now() }));
      document.cookie = `${PAIR_BOOTSTRAP_COOKIE}=${payload}; Max-Age=604800; Path=${cookiePath()}; SameSite=Lax; Secure`;
    } catch (error) {
      console.warn("Mitmach-Welt: Kopplung konnte nicht für die Home-Screen-App vorgemerkt werden.", error);
    }
  }

  function readPairBootstrapCookie() {
    try {
      const entry = document.cookie.split("; ").find(item => item.startsWith(`${PAIR_BOOTSTRAP_COOKIE}=`));
      if (!entry) return null;
      return JSON.parse(decodeURIComponent(entry.slice(PAIR_BOOTSTRAP_COOKIE.length + 1)));
    } catch {
      return null;
    }
  }

  function clearPairBootstrapCookie() {
    document.cookie = `${PAIR_BOOTSTRAP_COOKIE}=; Max-Age=0; Path=${cookiePath()}; SameSite=Lax; Secure`;
  }

  function isStandaloneApp() {
    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  }

  function normalizeConfig(value) {
    const deviceId = localStorage.getItem("mitmach_welt_device_id") || randomToken(12);
    localStorage.setItem("mitmach_welt_device_id", deviceId);
    return {
      enabled: Boolean(value?.enabled && value?.groupId && value?.secret),
      groupId: String(value?.groupId || ""),
      secret: String(value?.secret || ""),
      role: ["educator", "child", "both"].includes(value?.role) ? value.role : "both",
      deviceId,
      deviceName: String(value?.deviceName || defaultDeviceName()),
      forceRemote: Boolean(value?.forceRemote),
      pairedAt: Number(value?.pairedAt || 0)
    };
  }

  function normalizeMeta(value) {
    return {
      updatedAt: Number(value?.updatedAt || 0),
      lastSyncedAt: Number(value?.lastSyncedAt || 0),
      lastRemoteAt: Number(value?.lastRemoteAt || 0),
      dirty: Boolean(value?.dirty),
      lastError: String(value?.lastError || "")
    };
  }

  function defaultDeviceName() {
    const ua = navigator.userAgent || "";
    if (/iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "Kinder-Tablet";
    if (/iPhone|Android.*Mobile/i.test(ua)) return "Diensttelefon";
    return "Dieses Gerät";
  }

  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    applyDeviceRole();
    updateStatusButton();
  }

  function saveMeta() {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    updateStatusButton();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
  }

  function randomToken(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return bytesToBase64Url(bytes);
  }

  function bytesToBase64Url(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(value) {
    const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function concatBytes(...arrays) {
    const total = arrays.reduce((sum, item) => sum + item.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    arrays.forEach(item => {
      result.set(item, offset);
      offset += item.length;
    });
    return result;
  }

  async function sha256Bytes(value) {
    const bytes = value instanceof Uint8Array ? value : textEncoder.encode(String(value));
    return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  }

  async function deriveKey() {
    const rawSecret = base64UrlToBytes(config.secret);
    const keyMaterial = await crypto.subtle.importKey("raw", rawSecret, "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({
      name: "PBKDF2",
      salt: concatBytes(textEncoder.encode("Mitmach-Welt Sync 2.1|"), base64UrlToBytes(config.groupId)),
      iterations: 180000,
      hash: "SHA-256"
    }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }

  async function compress(bytes) {
    if (!("CompressionStream" in window)) return { method: "none", bytes };
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
    return { method: "gzip", bytes: new Uint8Array(await new Response(stream).arrayBuffer()) };
  }

  async function decompress(bytes, method) {
    if (method !== "gzip") return bytes;
    if (!("DecompressionStream" in window)) throw new Error("Dieses Gerät kann die komprimierten Sync-Daten nicht öffnen.");
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function encryptState(state, timestamp) {
    const source = textEncoder.encode(JSON.stringify(state));
    const packed = await compress(source);
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const key = await deriveKey();
    const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, packed.bytes));
    return JSON.stringify({
      version: 1,
      timestamp,
      deviceId: config.deviceId,
      deviceName: config.deviceName,
      compression: packed.method,
      iv: bytesToBase64Url(iv),
      payload: bytesToBase64Url(cipher)
    });
  }

  async function decryptState(payload) {
    const envelope = JSON.parse(payload);
    if (Number(envelope.version) !== 1 || !envelope.iv || !envelope.payload) throw new Error("Unbekanntes Sync-Format.");
    const key = await deriveKey();
    const plainPacked = new Uint8Array(await crypto.subtle.decrypt({
      name: "AES-GCM",
      iv: base64UrlToBytes(envelope.iv)
    }, key, base64UrlToBytes(envelope.payload)));
    const plain = await decompress(plainPacked, envelope.compression);
    return {
      timestamp: Number(envelope.timestamp || 0),
      deviceId: String(envelope.deviceId || ""),
      deviceName: String(envelope.deviceName || "Anderes Gerät"),
      state: JSON.parse(textDecoder.decode(plain))
    };
  }

  async function buildTopic() {
    const digest = await sha256Bytes(concatBytes(
      textEncoder.encode("mitmach-welt-v2|"),
      base64UrlToBytes(config.groupId),
      base64UrlToBytes(config.secret)
    ));
    return `mitmachwelt/v2/${bytesToBase64Url(digest.subarray(0, 24))}/state`;
  }

  function encodeRemainingLength(length) {
    const result = [];
    do {
      let digit = length % 128;
      length = Math.floor(length / 128);
      if (length > 0) digit |= 0x80;
      result.push(digit);
    } while (length > 0);
    return new Uint8Array(result);
  }

  function encodeMqttString(value) {
    const bytes = textEncoder.encode(String(value));
    return concatBytes(new Uint8Array([(bytes.length >> 8) & 0xff, bytes.length & 0xff]), bytes);
  }

  function makePacket(header, body = new Uint8Array()) {
    return concatBytes(new Uint8Array([header]), encodeRemainingLength(body.length), body);
  }

  class TinyMqttClient {
    constructor(url, clientId) {
      this.url = url;
      this.clientId = clientId;
      this.socket = null;
      this.buffer = new Uint8Array();
      this.packetId = 1;
      this.connected = false;
      this.stopped = false;
      this.reconnectTimer = null;
      this.pingTimer = null;
      this.onConnect = () => {};
      this.onClose = () => {};
      this.onError = () => {};
      this.onMessage = () => {};
    }

    connect() {
      this.stopped = false;
      this.openSocket();
    }

    openSocket() {
      if (this.stopped) return;
      clearTimeout(this.reconnectTimer);
      try {
        this.socket = new WebSocket(this.url, ["mqtt"]);
        this.socket.binaryType = "arraybuffer";
        this.socket.addEventListener("open", () => this.sendConnect());
        this.socket.addEventListener("message", event => this.receive(event.data));
        this.socket.addEventListener("error", () => this.onError(new Error("Verbindung zum Sync-Dienst fehlgeschlagen.")));
        this.socket.addEventListener("close", () => {
          this.connected = false;
          clearInterval(this.pingTimer);
          this.onClose();
          if (!this.stopped) this.reconnectTimer = setTimeout(() => this.openSocket(), 4000);
        });
      } catch (error) {
        this.onError(error);
        if (!this.stopped) this.reconnectTimer = setTimeout(() => this.openSocket(), 4000);
      }
    }

    sendConnect() {
      const variableHeader = concatBytes(
        encodeMqttString("MQTT"),
        new Uint8Array([4, 2, 0, 60])
      );
      const payload = encodeMqttString(this.clientId);
      this.sendRaw(makePacket(0x10, concatBytes(variableHeader, payload)));
    }

    subscribe(destination) {
      const packetId = this.nextPacketId();
      const body = concatBytes(
        new Uint8Array([(packetId >> 8) & 0xff, packetId & 0xff]),
        encodeMqttString(destination),
        new Uint8Array([0])
      );
      this.sendRaw(makePacket(0x82, body));
    }

    publish(destination, payload, retained = true) {
      const body = concatBytes(encodeMqttString(destination), textEncoder.encode(String(payload)));
      this.sendRaw(makePacket(retained ? 0x31 : 0x30, body));
    }

    nextPacketId() {
      this.packetId = this.packetId >= 65535 ? 1 : this.packetId + 1;
      return this.packetId;
    }

    sendRaw(bytes) {
      if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(bytes);
    }

    async receive(raw) {
      try {
        const incoming = raw instanceof ArrayBuffer
          ? new Uint8Array(raw)
          : raw instanceof Blob
            ? new Uint8Array(await raw.arrayBuffer())
            : new Uint8Array(raw);
        this.buffer = concatBytes(this.buffer, incoming);
        this.parsePackets();
      } catch (error) {
        this.onError(error);
      }
    }

    parsePackets() {
      while (this.buffer.length >= 2) {
        let multiplier = 1;
        let remainingLength = 0;
        let position = 1;
        let encodedByte;
        do {
          if (position >= this.buffer.length) return;
          encodedByte = this.buffer[position++];
          remainingLength += (encodedByte & 127) * multiplier;
          multiplier *= 128;
          if (multiplier > 128 * 128 * 128 * 128) throw new Error("Ungültiges MQTT-Paket.");
        } while ((encodedByte & 128) !== 0);

        const packetLength = position + remainingLength;
        if (this.buffer.length < packetLength) return;
        const packet = this.buffer.subarray(0, packetLength);
        this.buffer = this.buffer.subarray(packetLength);
        this.handlePacket(packet, position);
      }
    }

    handlePacket(packet, bodyStart) {
      const type = packet[0] >> 4;
      if (type === 2) {
        const returnCode = packet[bodyStart + 1];
        if (returnCode !== 0) {
          this.onError(new Error(`Sync-Dienst lehnt die Verbindung ab (${returnCode}).`));
          return;
        }
        this.connected = true;
        this.pingTimer = setInterval(() => this.sendRaw(new Uint8Array([0xc0, 0x00])), 30000);
        this.onConnect();
        return;
      }
      if (type !== 3) return;

      const qos = (packet[0] >> 1) & 0x03;
      const topicLength = (packet[bodyStart] << 8) | packet[bodyStart + 1];
      const topicStart = bodyStart + 2;
      const topicEnd = topicStart + topicLength;
      const destination = textDecoder.decode(packet.subarray(topicStart, topicEnd));
      let payloadStart = topicEnd;
      if (qos > 0) payloadStart += 2;
      const payload = textDecoder.decode(packet.subarray(payloadStart));
      this.onMessage(destination, payload);
    }

    stop() {
      this.stopped = true;
      clearTimeout(this.reconnectTimer);
      clearInterval(this.pingTimer);
      try {
        if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(new Uint8Array([0xe0, 0x00]));
        this.socket?.close();
      } catch {}
      this.socket = null;
      this.connected = false;
    }
  }

  function setStatus(nextStatus, detail = "") {
    status = nextStatus;
    statusDetail = detail;
    updateStatusButton();
    const statusNode = document.querySelector("#syncLiveStatus");
    if (statusNode) statusNode.innerHTML = renderStatusLine();
  }

  function statusInfo() {
    if (!config.enabled) return { icon: "☁️", label: "Sync aus", className: "off" };
    if (status === "online") return { icon: "☁️", label: "Verbunden", className: "online" };
    if (status === "connecting") return { icon: "🔄", label: "Verbinde", className: "connecting" };
    if (status === "error") return { icon: "⚠️", label: "Sync-Fehler", className: "error" };
    return { icon: "☁️", label: "Offline", className: "offline" };
  }

  function updateStatusButton() {
    if (!syncButton) return;
    const info = statusInfo();
    syncButton.textContent = info.icon;
    syncButton.dataset.syncStatus = info.className;
    syncButton.title = `${info.label}${statusDetail ? ` – ${statusDetail}` : ""}`;
    syncButton.setAttribute("aria-label", syncButton.title);
  }

  function applyDeviceRole() {
    document.body.classList.remove("device-role-child", "device-role-educator", "device-role-both");
    document.body.classList.add(`device-role-${config.role}`);
    document.querySelectorAll('[data-nav="educator"]').forEach(node => {
      node.hidden = config.role === "child";
    });
    if (syncButton) syncButton.hidden = config.role === "child";
  }

  function formatTime(timestamp) {
    if (!timestamp) return "noch nie";
    return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(timestamp));
  }

  function renderStatusLine() {
    const info = statusInfo();
    return `<div class="sync-status-line ${info.className}"><span>${info.icon}</span><div><b>${escapeHtml(info.label)}</b><small>${escapeHtml(statusDetail || (config.enabled ? `Letzter Abgleich: ${formatTime(meta.lastSyncedAt)}` : "Nur auf diesem Gerät gespeichert"))}</small></div></div>`;
  }

  function roleLabel(role = config.role) {
    return ({ educator: "Erziehergerät", child: "Kinder-Tablet", both: "Vollzugriff" })[role] || "Vollzugriff";
  }

  function openModal(title, content) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop sync-modal-backdrop" data-sync-action="close">
        <section class="modal modal-wide" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}" data-sync-modal-stop>
          <div class="modal-head"><h2>${escapeHtml(title)}</h2><button class="modal-close" type="button" data-sync-action="close" aria-label="Schließen">×</button></div>
          <div class="modal-body">${content}</div>
        </section>
      </div>`;
  }

  function closeModal() {
    modalRoot.innerHTML = "";
  }

  function openPinPrompt() {
    openModal("Geräte & Synchronisierung", `
      <form id="syncPinForm">
        <div class="sync-intro-icon">📱</div>
        <p class="muted" style="text-align:center">Bitte zuerst die Erzieher-PIN eingeben.</p>
        <div class="form-field"><input name="pin" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="PIN" required style="text-align:center;font-size:1.45rem;letter-spacing:.25em"></div>
        <div class="modal-actions"><button class="primary-button full-button" type="submit">Öffnen</button></div>
      </form>`);
  }

  function openSettings() {
    const pairCode = config.enabled ? createPairCode() : "";
    openModal("Geräte & Synchronisierung", `
      <div id="syncLiveStatus">${renderStatusLine()}</div>
      <div class="sync-grid" style="margin-top:14px">
        <article class="card">
          <h3>📱 Dieses Gerät</h3>
          <p class="muted">${escapeHtml(config.deviceName)} · ${escapeHtml(roleLabel())}</p>
          <div class="form-grid">
            <div class="form-field"><label>Gerätename</label><input id="syncDeviceName" value="${escapeHtml(config.deviceName)}" maxlength="40"></div>
            <div class="form-field"><label>Geräteart</label><select id="syncDeviceRole"><option value="educator" ${config.role === "educator" ? "selected" : ""}>Erziehergerät</option><option value="child" ${config.role === "child" ? "selected" : ""}>Kinder-Tablet</option><option value="both" ${config.role === "both" ? "selected" : ""}>Vollzugriff</option></select></div>
          </div>
          <button class="ghost-button full-button" type="button" data-sync-action="save-device">Geräteeinstellung speichern</button>
        </article>

        ${config.enabled ? `
          <article class="card">
            <h3>🔗 Weiteres Gerät verbinden</h3>
            <p class="muted">Teile den geschützten Kopplungslink mit dem zweiten Dienstgerät.</p>
            <button class="primary-button full-button" type="button" data-sync-action="share-link">Kopplungslink teilen</button>
            <button class="ghost-button full-button" style="margin-top:8px" type="button" data-sync-action="copy-code" data-code="${escapeHtml(pairCode)}">Code kopieren</button>
          </article>
          <article class="card">
            <h3>🔄 Abgleich</h3>
            <p class="muted">Die letzte Änderung wird verschlüsselt übertragen. Bei Internetunterbrechung bleibt sie lokal vorgemerkt.</p>
            <button class="success-button full-button" type="button" data-sync-action="sync-now">Jetzt synchronisieren</button>
            <button class="ghost-button full-button" style="margin-top:8px" type="button" data-sync-action="force-upload">Daten dieses Geräts hochladen</button>
          </article>
          <article class="card">
            <h3>🧯 Verbindung lösen</h3>
            <p class="muted">Die vorhandenen Daten bleiben auf diesem Gerät erhalten. Nur der automatische Abgleich wird beendet.</p>
            <button class="danger-button full-button" type="button" data-sync-action="disconnect">Gerät trennen</button>
          </article>` : `
          <article class="card">
            <h3>🌻 Neue Gruppe verbinden</h3>
            <p class="muted">Dieses Gerät erstellt den gemeinsamen Datenstand und einen Link für das Kinder-Tablet.</p>
            <button class="primary-button full-button" type="button" data-sync-action="create-group">Sync-Gruppe erstellen</button>
          </article>
          <article class="card">
            <h3>🔗 Vorhandener Gruppe beitreten</h3>
            <p class="muted">Füge den Kopplungscode vom anderen Dienstgerät ein.</p>
            <button class="secondary-button full-button" type="button" data-sync-action="open-join">Kopplungscode eingeben</button>
          </article>`}
      </div>
      <div class="callout warning" style="margin-top:16px"><p><b>Test-Synchronisierung:</b> Der Dateninhalt wird vor der Übertragung verschlüsselt. Der Kopplungslink enthält den Schlüssel und darf nur zwischen euren Dienstgeräten geteilt werden. Gleichzeitige Änderungen auf beiden Geräten bei längerer Offline-Zeit sollten vermieden werden.</p></div>`);
  }

  function openJoinForm(prefilled = "", suggestedRole = "child") {
    openModal("Gerät verbinden", `
      <form id="syncJoinForm">
        <p class="muted">Kopplungscode einfügen. Am einfachsten ist es, den geteilten Link direkt auf diesem Gerät zu öffnen.</p>
        <div class="form-field"><label>Kopplungscode</label><textarea name="pairCode" required rows="4" autocomplete="off">${escapeHtml(prefilled)}</textarea></div>
        <div class="form-field"><label>Dieses Gerät verwenden als</label><select name="role"><option value="child" ${suggestedRole === "child" ? "selected" : ""}>Kinder-Tablet</option><option value="educator" ${suggestedRole === "educator" ? "selected" : ""}>Erziehergerät</option><option value="both" ${suggestedRole === "both" ? "selected" : ""}>Vollzugriff</option></select></div>
        <div class="modal-actions"><button class="ghost-button" type="button" data-sync-action="close">Abbrechen</button><button class="primary-button" type="submit">Verbinden</button></div>
      </form>`);
  }

  function openPairConfirmation(code) {
    let decoded;
    try {
      decoded = decodePairCode(code);
    } catch {
      API.showToast("Der Kopplungslink ist ungültig.");
      return;
    }
    openModal("Mit Mitmach-Welt verbinden", `
      <div class="sync-intro-icon">🌻📱</div>
      <h3 style="text-align:center">${escapeHtml(decoded.name || "Mitmach-Welt")}</h3>
      <p class="muted" style="text-align:center">Dieses Gerät kann jetzt denselben Datenstand verwenden.</p>
      <div class="sync-role-buttons">
        <button class="primary-button full-button" type="button" data-sync-action="accept-pair" data-code="${escapeHtml(code)}" data-role="child">Als Kinder-Tablet verbinden</button>
        <button class="secondary-button full-button" type="button" data-sync-action="accept-pair" data-code="${escapeHtml(code)}" data-role="educator">Als Erziehergerät verbinden</button>
      </div>
      <p class="muted tiny" style="margin-top:14px">Beim ersten Abgleich wird der Datenstand des bereits eingerichteten Geräts übernommen.</p>`);
  }

  function createPairCode() {
    if (!config.groupId || !config.secret) return "";
    const groupName = API.getData()?.settings?.groupName || "Mitmach-Welt";
    const payload = {
      version: 1,
      groupId: config.groupId,
      secret: config.secret,
      name: groupName
    };
    return PAIR_PREFIX + bytesToBase64Url(textEncoder.encode(JSON.stringify(payload)));
  }

  function decodePairCode(value) {
    let code = String(value || "").trim();
    const hashMatch = code.match(/[#&]mw-pair=([^&]+)/i);
    if (hashMatch) code = decodeURIComponent(hashMatch[1]);
    if (!code.startsWith(PAIR_PREFIX)) throw new Error("Falsches Format");
    const payload = JSON.parse(textDecoder.decode(base64UrlToBytes(code.slice(PAIR_PREFIX.length))));
    if (Number(payload.version) !== 1 || !payload.groupId || !payload.secret) throw new Error("Unvollständiger Code");
    base64UrlToBytes(payload.groupId);
    base64UrlToBytes(payload.secret);
    return payload;
  }

  function pairingLink() {
    const clean = `${location.origin}${location.pathname}${location.search}`;
    return `${clean}#mw-pair=${encodeURIComponent(createPairCode())}`;
  }

  async function copyText(value, successMessage = "Kopiert.") {
    try {
      await navigator.clipboard.writeText(value);
      API.showToast(successMessage);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      API.showToast(successMessage);
    }
  }

  async function sharePairingLink() {
    const url = pairingLink();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mitmach-Welt verbinden", text: "Öffne diesen Link auf dem zweiten Dienstgerät.", url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    await copyText(url, "Kopplungslink wurde kopiert.");
  }

  function createGroup() {
    if (!crypto?.subtle) {
      API.showToast("Dieses Gerät unterstützt die sichere Verschlüsselung nicht.");
      return;
    }
    config.enabled = true;
    config.groupId = randomToken(16);
    config.secret = randomToken(32);
    config.role = "educator";
    config.forceRemote = false;
    config.pairedAt = Date.now();
    meta.updatedAt = Date.now();
    meta.dirty = true;
    saveConfig();
    saveMeta();
    connectSync();
    openSettings();
    setTimeout(() => sharePairingLink(), 350);
  }

  function joinGroup(code, role = "child") {
    const decoded = decodePairCode(code);
    stopSync();
    config.enabled = true;
    config.groupId = decoded.groupId;
    config.secret = decoded.secret;
    config.role = ["child", "educator", "both"].includes(role) ? role : "child";
    config.forceRemote = true;
    config.pairedAt = Date.now();
    meta = normalizeMeta(null);
    saveConfig();
    saveMeta();
    closeModal();
    API.showToast("Gerät wird verbunden …");
    connectSync();
  }

  function disconnectSync() {
    stopSync();
    config.enabled = false;
    config.groupId = "";
    config.secret = "";
    config.forceRemote = false;
    meta = normalizeMeta(null);
    saveConfig();
    saveMeta();
    setStatus("off", "Nur lokal gespeichert");
    openSettings();
  }

  function stopSync() {
    clearTimeout(publishTimer);
    clearTimeout(initialTimer);
    publishTimer = null;
    initialTimer = null;
    awaitingInitialState = false;
    client?.stop();
    client = null;
    topic = "";
  }

  async function connectSync() {
    if (!config.enabled) {
      setStatus("off", "Nur lokal gespeichert");
      return;
    }
    if (!navigator.onLine) {
      setStatus("offline", "Keine Internetverbindung");
      return;
    }
    if (!crypto?.subtle) {
      setStatus("error", "Verschlüsselung wird nicht unterstützt");
      return;
    }

    stopSync();
    setStatus("connecting", "Sichere Verbindung wird aufgebaut");
    try {
      topic = await buildTopic();
      client = new TinyMqttClient(BROKER_URL, `mw_${config.deviceId}_${Math.random().toString(16).slice(2, 8)}`);
      client.onConnect = () => {
        setStatus("online", "Mit dem gemeinsamen Datenstand verbunden");
        awaitingInitialState = true;
        client.subscribe(topic);
        clearTimeout(initialTimer);
        initialTimer = setTimeout(() => {
          if (!awaitingInitialState) return;
          awaitingInitialState = false;
          if (config.forceRemote) {
            setStatus("online", "Noch keine Gruppendaten gefunden – bitte das erste Gerät öffnen");
          } else {
            publishCurrent({ force: true });
          }
        }, 2800);
      };
      client.onClose = () => {
        if (config.enabled) setStatus("offline", "Verbindung unterbrochen – Änderungen bleiben vorgemerkt");
      };
      client.onError = error => {
        meta.lastError = String(error?.message || error || "Unbekannter Fehler");
        saveMeta();
        setStatus("error", meta.lastError);
      };
      client.onMessage = (destination, payload) => {
        if (destination === topic) handleRemotePayload(payload);
      };
      client.connect();
    } catch (error) {
      meta.lastError = String(error?.message || error);
      saveMeta();
      setStatus("error", meta.lastError);
    }
  }

  async function handleRemotePayload(payload) {
    try {
      const remote = await decryptState(payload);
      clearTimeout(initialTimer);
      const wasInitial = awaitingInitialState;
      awaitingInitialState = false;
      lastIncomingDevice = remote.deviceName;
      meta.lastRemoteAt = Date.now();

      if (remote.deviceId === config.deviceId) {
        meta.lastSyncedAt = Date.now();
        meta.dirty = false;
        saveMeta();
        setStatus("online", `Datenstand aktuell · ${formatTime(meta.lastSyncedAt)}`);
        return;
      }

      const shouldTakeRemote = config.forceRemote || remote.timestamp > meta.updatedAt || (!meta.dirty && wasInitial);
      if (shouldTakeRemote) {
        const saved = API.replaceData(remote.state, { snapshot: true, notify: false, render: true });
        if (!saved) throw new Error("Der empfangene Datenstand konnte lokal nicht gespeichert werden.");
        meta.updatedAt = remote.timestamp;
        meta.lastSyncedAt = Date.now();
        meta.dirty = false;
        config.forceRemote = false;
        saveConfig();
        saveMeta();
        setStatus("online", `Von ${remote.deviceName} aktualisiert · ${formatTime(meta.lastSyncedAt)}`);
        API.showToast(`Daten von ${remote.deviceName} wurden übernommen.`);
        return;
      }

      if (meta.dirty && meta.updatedAt >= remote.timestamp) {
        publishCurrent({ force: true });
      } else {
        meta.lastSyncedAt = Date.now();
        saveMeta();
        setStatus("online", `Datenstand aktuell · ${formatTime(meta.lastSyncedAt)}`);
      }
    } catch (error) {
      meta.lastError = String(error?.message || error || "Entschlüsselung fehlgeschlagen");
      saveMeta();
      setStatus("error", "Empfangene Daten konnten nicht gelesen werden");
      console.error("Mitmach-Welt Sync: Empfangen fehlgeschlagen", error);
    }
  }

  function queuePublish() {
    if (!config.enabled) return;
    clearTimeout(publishTimer);
    publishTimer = setTimeout(() => publishCurrent(), 650);
  }

  async function publishCurrent({ force = false } = {}) {
    if (!config.enabled) return false;
    if (!client?.connected || !topic) {
      meta.dirty = true;
      saveMeta();
      if (navigator.onLine && status !== "connecting") connectSync();
      return false;
    }
    if (config.forceRemote && !force) return false;
    if (!meta.dirty && !force) return true;

    try {
      const timestamp = Math.max(Date.now(), meta.updatedAt + 1);
      const payload = await encryptState(API.getData(), timestamp);
      client.publish(topic, payload, true);
      meta.updatedAt = timestamp;
      meta.lastSyncedAt = Date.now();
      meta.dirty = false;
      config.forceRemote = false;
      saveConfig();
      saveMeta();
      setStatus("online", `Gesendet · ${formatTime(meta.lastSyncedAt)}`);
      return true;
    } catch (error) {
      meta.dirty = true;
      meta.lastError = String(error?.message || error);
      saveMeta();
      setStatus("error", "Daten konnten nicht übertragen werden");
      console.error("Mitmach-Welt Sync: Senden fehlgeschlagen", error);
      return false;
    }
  }

  API.subscribeToSaves(() => {
    if (!config.enabled) return;
    meta.updatedAt = Math.max(Date.now(), meta.updatedAt + 1);
    meta.dirty = true;
    saveMeta();
    queuePublish();
  });

  syncButton?.addEventListener("click", () => {
    if (config.role === "child") return;
    openPinPrompt();
  });

  document.addEventListener("click", event => {
    const target = event.target.closest("[data-sync-action]");
    if (!target) return;
    if (target.classList.contains("sync-modal-backdrop") && event.target !== target) return;
    const action = target.dataset.syncAction;

    if (action === "close") {
      closeModal();
      return;
    }
    if (action === "create-group") {
      createGroup();
      return;
    }
    if (action === "open-join") {
      openJoinForm();
      return;
    }
    if (action === "accept-pair") {
      try {
        setPairBootstrapCookie(target.dataset.code, target.dataset.role || "child");
        joinGroup(target.dataset.code, target.dataset.role);
        if (!isStandaloneApp()) API.showToast("Verbunden. Jetzt über Teilen → Zum Home-Bildschirm hinzufügen. Die Kinder-Verbindung wird übernommen.");
      } catch {
        API.showToast("Der Kopplungscode ist ungültig.");
      }
      return;
    }
    if (action === "share-link") {
      sharePairingLink();
      return;
    }
    if (action === "copy-code") {
      copyText(target.dataset.code, "Kopplungscode wurde kopiert.");
      return;
    }
    if (action === "sync-now") {
      meta.dirty = true;
      saveMeta();
      publishCurrent({ force: true }).then(ok => API.showToast(ok ? "Daten wurden synchronisiert." : "Synchronisierung ist vorgemerkt."));
      return;
    }
    if (action === "force-upload") {
      if (window.confirm("Den Datenstand dieses Geräts als gemeinsamen Stand hochladen? Änderungen des anderen Geräts können dadurch überschrieben werden.")) {
        meta.updatedAt = Math.max(Date.now(), meta.updatedAt + 1);
        meta.dirty = true;
        saveMeta();
        publishCurrent({ force: true }).then(ok => API.showToast(ok ? "Dieser Datenstand wurde hochgeladen." : "Upload ist vorgemerkt."));
      }
      return;
    }
    if (action === "save-device") {
      const name = document.querySelector("#syncDeviceName")?.value.trim();
      const role = document.querySelector("#syncDeviceRole")?.value;
      config.deviceName = name || defaultDeviceName();
      config.role = ["educator", "child", "both"].includes(role) ? role : "both";
      saveConfig();
      API.showToast("Geräteeinstellung wurde gespeichert.");
      if (config.role === "child") closeModal(); else openSettings();
      return;
    }
    if (action === "disconnect") {
      if (window.confirm("Dieses Gerät wirklich von der gemeinsamen Mitmach-Welt trennen? Die lokalen Daten bleiben erhalten.")) disconnectSync();
    }
  });

  document.addEventListener("submit", event => {
    if (event.target.id === "syncPinForm") {
      event.preventDefault();
      event.stopPropagation();
      const pin = String(new FormData(event.target).get("pin") || "");
      if (pin === API.getPin()) openSettings();
      else {
        API.showToast("PIN ist nicht richtig.");
        event.target.reset();
      }
      return;
    }
    if (event.target.id === "syncJoinForm") {
      event.preventDefault();
      event.stopPropagation();
      const formData = new FormData(event.target);
      try {
        joinGroup(formData.get("pairCode"), formData.get("role"));
      } catch {
        API.showToast("Der Kopplungscode ist ungültig.");
      }
    }
  }, true);

  window.addEventListener("online", () => connectSync());
  window.addEventListener("offline", () => setStatus("offline", "Keine Internetverbindung – Änderungen bleiben lokal"));
  window.addEventListener("beforeunload", () => client?.stop());

  function handlePairingHash() {
    const match = location.hash.match(/^#mw-pair=(.+)$/i);
    if (!match) return false;
    const code = decodeURIComponent(match[1]);
    setPairBootstrapCookie(code, "child");
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    setTimeout(() => openPairConfirmation(code), 150);
    return true;
  }

  function restorePairingInHomeScreenApp() {
    if (config.enabled || !isStandaloneApp()) return false;
    const bootstrap = readPairBootstrapCookie();
    if (!bootstrap?.code) return false;
    try {
      joinGroup(bootstrap.code, bootstrap.role || "child");
      clearPairBootstrapCookie();
      API.showToast("Kinder-Tablet wurde automatisch verbunden. Die gemeinsamen Daten werden geladen …");
      return true;
    } catch (error) {
      console.error("Mitmach-Welt: Automatische Home-Screen-Kopplung fehlgeschlagen", error);
      return false;
    }
  }

  applyDeviceRole();
  updateStatusButton();
  const openedPairLink = handlePairingHash();
  const restoredHomeScreenPairing = restorePairingInHomeScreenApp();
  if (config.enabled && !restoredHomeScreenPairing) connectSync();

  window.MitmachWeltSync = {
    version: "2.2.2",
    getStatus: () => ({ status, detail: statusDetail, enabled: config.enabled, role: config.role, deviceName: config.deviceName, lastIncomingDevice, meta: { ...meta } }),
    open: openPinPrompt,
    reconnect: connectSync
  };
})();
