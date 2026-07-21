(() => {
  "use strict";

  const STORAGE_KEY = "mitmach_welt_state_v1";
  const APP_VERSION = "1.1.0";
  const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const FULL_DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  const AVATARS = {
    Tiere: ["🦊","🐼","🦁","🐸","🐨","🐯","🐰","🐧","🐙","🦋","🐬","🦈","🐳","🦖","🦕","🐲","🐉","🦜","🦉","🐝","🐞","🐢","🦔","🦦","🦥","🐿️","🐘","🦒","🦓","🦘","🐆","🐺","🐻‍❄️","🐵","🐴","🦭"],
    Fantasie: ["🦄","🧚‍♀️","🧚‍♂️","🧜‍♀️","🧜‍♂️","🧙‍♀️","🧙‍♂️","🦸‍♀️","🦸‍♂️","👸","🤴","👑","🌈","⭐","🌙","☀️","🌻","🍄","🔮","🏰","🪄","🐈‍⬛","🪽","🌟"],
    Menschen: ["👧","👦","🧒","👩‍🚀","👨‍🚀","👩‍🎨","👨‍🎨","👩‍🚒","👨‍🚒","👩‍🔬","👨‍🔬","👩‍🍳","👨‍🍳","👩‍🌾","👨‍🌾","🥷","🤠","🧑‍🎤","🧑‍🔧","🧑‍🏫","🧑‍⚕️","🧑‍🚀","🧑‍🎨","🧑‍🍳"],
    Spaß: ["🤖","👻","👽","🎃","⛄","🌵","🍓","🍉","🍭","⚽","🏀","🎸","🎨","🚲","🚀","🛸","⛵","🎠","🧸","🎈","🎮","🛹","🎪","🎁"]
  };

  const ACCENT_COLORS = ["#e96f82","#ef9f46","#f1c64d","#72ad67","#4fae98","#55a5d5","#7088dc","#9872d4","#d070ba","#a78061","#6e927d","#ef7d61"];
  const WORLD_THEMES = [
    { id: "meadow", icon: "🌻", title: "Blumenwiese", description: "Wiese, Bäume und Tiere" },
    { id: "magic", icon: "🦄", title: "Zauberwald", description: "Pilze, Sterne und Magie" },
    { id: "ocean", icon: "🐬", title: "Meeresbucht", description: "Strand, Wasser und Delfine" },
    { id: "space", icon: "🚀", title: "Weltraum", description: "Planeten, Sterne und Raketen" },
    { id: "dino", icon: "🦕", title: "Dinotal", description: "Dinos, Urwald und Vulkan" },
    { id: "farm", icon: "🚜", title: "Bauernhof", description: "Tiere, Felder und Scheune" }
  ];

  const TASK_ICONS = ["✅","🛏️","🍽️","🧸","🧺","🪴","🧹","🗑️","🐾","📚","🚿","👕","🍳","🧽","🪥","🥤","🧼","🧻","🪣","🌿","🥕","🛒","📦","🎒","👟","🪟","🧑‍🍳","🧑‍🤝‍🧑"];
  const COMPETENCES = ["Selbstständigkeit","Zusammenarbeit","Ordnung","Hilfsbereitschaft","Verantwortung","Konzentration","Kommunikation","Kreativität"];

  const SHOP_ITEMS = [
    { id: "bench", icon: "🪑", title: "Gartenbank", cost: 18, description: "Ein ruhiger Platz zum Ausruhen." },
    { id: "birdhouse", icon: "🏠", title: "Vogelhaus", cost: 22, description: "Lockt kleine Vögel an." },
    { id: "swing", icon: "🎠", title: "Schaukel", cost: 28, description: "Bewegung für die Welt." },
    { id: "lantern", icon: "🏮", title: "Laterne", cost: 16, description: "Leuchtet am Abend." },
    { id: "windmill", icon: "🎡", title: "Windrad", cost: 24, description: "Dreht sich im Wind." },
    { id: "fountain", icon: "⛲", title: "Brunnen", cost: 36, description: "Plätschert leise vor sich hin." },
    { id: "tent", icon: "⛺", title: "Abenteuerzelt", cost: 30, description: "Für besondere Geschichten." },
    { id: "telescope", icon: "🔭", title: "Fernrohr", cost: 34, description: "Damit lässt sich viel entdecken." },
    { id: "kite", icon: "🪁", title: "Drachen", cost: 20, description: "Fliegt hoch über der Welt." },
    { id: "boat", icon: "⛵", title: "Kleines Boot", cost: 32, description: "Bereit für neue Inseln." },
    { id: "rainbow", icon: "🌈", title: "Regenbogenzauber", cost: 45, description: "Ein seltenes Leuchten am Himmel." },
    { id: "treehouse", icon: "🏡", title: "Baumhaus", cost: 55, description: "Ein großer Meilenstein." }
  ];

  const DEFAULTS = {
    version: APP_VERSION,
    settings: {
      groupName: "Unsere Gruppe",
      pin: "2468",
      sound: true,
      haptics: true,
      reduceMotion: false,
      teamBonus: true,
      showStories: true,
      weatherMode: "auto"
    },
    children: [
      { id: "lucy", name: "Lucy", avatar: "🦄", accent: "#d070ba", theme: "magic", coins: 24, seeds: 7, completed: 4, kindness: 1, inventory: ["lantern"], createdAt: Date.now() - 86400000 * 10 },
      { id: "noah", name: "Noah", avatar: "🐼", accent: "#55a5d5", theme: "meadow", coins: 18, seeds: 5, completed: 3, kindness: 0, inventory: [], createdAt: Date.now() - 86400000 * 9 },
      { id: "tius", name: "Tius", avatar: "🦁", accent: "#ef9f46", theme: "dino", coins: 13, seeds: 4, completed: 2, kindness: 0, inventory: [], createdAt: Date.now() - 86400000 * 8 },
      { id: "jari", name: "Jari", avatar: "🐸", accent: "#72ad67", theme: "farm", coins: 16, seeds: 6, completed: 3, kindness: 1, inventory: [], createdAt: Date.now() - 86400000 * 7 }
    ],
    tasks: [
      { id: "bed", title: "Bett machen", icon: "🛏️", category: "Zimmer", competence: "Selbstständigkeit", difficulty: 1, coins: 5, seeds: 1, capacity: 1, active: true, days: [0,1,2,3,4,5,6] },
      { id: "table", title: "Tisch decken", icon: "🍽️", category: "Gemeinschaft", competence: "Verantwortung", difficulty: 2, coins: 6, seeds: 1, capacity: 2, active: true, days: [0,1,2,3,4,5,6] },
      { id: "toys", title: "Spielsachen aufräumen", icon: "🧸", category: "Ordnung", competence: "Ordnung", difficulty: 1, coins: 5, seeds: 1, capacity: 1, active: true, days: [0,1,2,3,4,5,6] },
      { id: "laundry", title: "Wäsche einsammeln", icon: "🧺", category: "Zimmer", competence: "Selbstständigkeit", difficulty: 2, coins: 6, seeds: 1, capacity: 1, active: true, days: [1,3,5] },
      { id: "plants", title: "Blumen gießen", icon: "🪴", category: "Natur", competence: "Verantwortung", difficulty: 1, coins: 4, seeds: 1, capacity: 1, active: true, days: [1,3,5,0] },
      { id: "room", title: "Zimmer aufräumen", icon: "🧹", category: "Ordnung", competence: "Ordnung", difficulty: 3, coins: 8, seeds: 2, capacity: 1, active: true, days: [0,1,2,3,4,5,6] },
      { id: "trash", title: "Müll rausbringen", icon: "🗑️", category: "Gemeinschaft", competence: "Hilfsbereitschaft", difficulty: 2, coins: 6, seeds: 1, capacity: 1, active: true, days: [1,3,5,0] },
      { id: "animals", title: "Tiere versorgen", icon: "🐾", category: "Verantwortung", competence: "Verantwortung", difficulty: 3, coins: 8, seeds: 2, capacity: 2, active: true, days: [0,1,2,3,4,5,6] },
      { id: "dishes", title: "Geschirr wegräumen", icon: "🧽", category: "Gemeinschaft", competence: "Zusammenarbeit", difficulty: 2, coins: 6, seeds: 1, capacity: 2, active: true, days: [0,1,2,3,4,5,6] },
      { id: "schoolbag", title: "Schulranzen vorbereiten", icon: "🎒", category: "Schule", competence: "Selbstständigkeit", difficulty: 2, coins: 6, seeds: 1, capacity: 1, active: true, days: [0,1,2,3,4] },
      { id: "shoes", title: "Schuhe ordentlich hinstellen", icon: "👟", category: "Ordnung", competence: "Ordnung", difficulty: 1, coins: 4, seeds: 1, capacity: 2, active: true, days: [0,1,2,3,4,5,6] },
      { id: "teamroom", title: "Gemeinschaftsraum gemeinsam aufräumen", icon: "🧑‍🤝‍🧑", category: "Teamaufgabe", competence: "Zusammenarbeit", difficulty: 3, coins: 9, seeds: 2, capacity: 3, active: true, days: [0,3,6] }
    ],
    group: { points: 12, completedRounds: 1, kindnessFlowers: 2, inventory: [] },
    round: null,
    history: [],
    lastOrders: []
  };

  const ui = {
    screen: "home",
    history: [],
    selectedChildren: [],
    orderPreview: [],
    educatorUnlocked: false,
    educatorTab: "children",
    worldChildId: null,
    worldTab: "scene",
    avatarCategory: "Tiere",
    suggestedTaskId: null,
    pendingServiceWorker: null
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const app = $("#app");
  const screenTitle = $("#screenTitle");
  const backButton = $("#backButton");
  const homeButton = $("#homeButton");
  const modalRoot = $("#modalRoot");
  const toast = $("#toast");
  const confettiRoot = $("#confettiRoot");
  const updateBanner = $("#updateBanner");

  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const formatDateTime = timestamp => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
  const dayIndex = () => new Date().getDay();

  function normalizeData(raw) {
    const base = clone(DEFAULTS);
    if (!raw || typeof raw !== "object") return base;

    const merged = {
      ...base,
      ...raw,
      settings: { ...base.settings, ...(raw.settings || {}) },
      group: { ...base.group, ...(raw.group || {}) },
      children: Array.isArray(raw.children) ? raw.children : base.children,
      tasks: Array.isArray(raw.tasks) ? raw.tasks : base.tasks,
      history: Array.isArray(raw.history) ? raw.history : [],
      lastOrders: Array.isArray(raw.lastOrders) ? raw.lastOrders : []
    };

    merged.children = merged.children.map((child, index) => ({
      id: child.id || uid(),
      name: child.name || `Kind ${index + 1}`,
      avatar: child.avatar || "🙂",
      accent: child.accent || child.color || ACCENT_COLORS[index % ACCENT_COLORS.length],
      theme: WORLD_THEMES.some(theme => theme.id === child.theme) ? child.theme : WORLD_THEMES[index % WORLD_THEMES.length].id,
      coins: Number(child.coins || 0),
      seeds: Number(child.seeds || 0),
      completed: Number(child.completed || 0),
      kindness: Number(child.kindness || 0),
      inventory: Array.isArray(child.inventory) ? child.inventory : [],
      createdAt: Number(child.createdAt || Date.now())
    }));

    merged.tasks = merged.tasks.map(task => ({
      id: task.id || uid(),
      title: task.title || "Aufgabe",
      icon: task.icon || "✅",
      category: task.category || "Alltag",
      competence: task.competence || "Selbstständigkeit",
      difficulty: clamp(Number(task.difficulty || 1), 1, 3),
      coins: clamp(Number(task.coins ?? task.reward ?? 5), 1, 50),
      seeds: clamp(Number(task.seeds ?? 1), 0, 10),
      capacity: clamp(Number(task.capacity || 1), 1, 4),
      active: task.active !== false,
      days: Array.isArray(task.days) && task.days.length ? task.days.map(Number) : [0,1,2,3,4,5,6]
    }));

    if (merged.round && merged.round.assignments) {
      const oldRound = merged.round;
      const participants = Array.isArray(oldRound.participants) ? oldRound.participants : (Array.isArray(oldRound.order) ? oldRound.order : []);
      const assignments = {};
      participants.forEach(childId => {
        const rawAssignment = oldRound.assignments[childId];
        if (!rawAssignment) return;
        const oldResult = oldRound.results?.[childId];
        if (typeof rawAssignment === "string") {
          assignments[childId] = {
            childId,
            taskId: rawAssignment,
            status: oldResult ? "done" : "chosen",
            outcome: oldResult?.type || null,
            kindness: false,
            coinsAwarded: Number(oldResult?.coins || 0),
            seedsAwarded: Number(oldResult?.seeds || 0)
          };
        } else {
          assignments[childId] = {
            childId,
            taskId: rawAssignment.taskId,
            status: rawAssignment.status || "chosen",
            outcome: rawAssignment.outcome || null,
            kindness: Boolean(rawAssignment.kindness),
            coinsAwarded: Number(rawAssignment.coinsAwarded || 0),
            seedsAwarded: Number(rawAssignment.seedsAwarded || 0)
          };
        }
      });
      merged.round = {
        id: oldRound.id || uid(),
        date: oldRound.date || Date.now(),
        day: oldRound.day || todayKey(),
        participants,
        order: Array.isArray(oldRound.order) ? oldRound.order : participants,
        chooseIndex: Number(oldRound.chooseIndex ?? Object.keys(assignments).length),
        assignments,
        finished: Boolean(oldRound.finished),
        teamBonusAwarded: Boolean(oldRound.teamBonusAwarded ?? oldRound.teamBonus)
      };
    } else if (merged.round) {
      merged.round = null;
    }
    merged.version = APP_VERSION;
    return merged;
  }

  function loadData() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return normalizeData(stored);
    } catch (error) {
      return clone(DEFAULTS);
    }
  }

  let data = loadData();
  saveData();

  function saveData() {
    data.version = APP_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    applyPreferences();
  }

  function applyPreferences() {
    document.body.classList.toggle("reduce-motion", Boolean(data.settings.reduceMotion));
  }

  function childById(id) { return data.children.find(child => child.id === id); }
  function taskById(id) { return data.tasks.find(task => task.id === id); }
  function currentRound() { return data.round && !data.round.finished ? data.round : null; }
  function tasksForToday() { return data.tasks.filter(task => task.active && task.days.includes(dayIndex())); }
  function assignmentsArray() { return currentRound() ? Object.values(currentRound().assignments) : []; }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  function haptic(pattern = 35) {
    if (data.settings.haptics && navigator.vibrate) navigator.vibrate(pattern);
  }

  function playTone(type = "soft") {
    if (!data.settings.sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const settings = {
        soft: [523, .06],
        select: [659, .07],
        success: [784, .12],
        sparkle: [988, .1],
        error: [220, .1]
      }[type] || [523, .06];
      oscillator.frequency.value = settings[0];
      oscillator.type = type === "error" ? "sawtooth" : "sine";
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + settings[1]);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + settings[1] + .02);
    } catch (error) {
      // Töne sind optional.
    }
  }

  function celebrate(kind = "flowers") {
    const pieces = kind === "stars" ? ["⭐","✨","🌟"] : ["🌻","🌼","🌷","✨"];
    confettiRoot.innerHTML = "";
    const amount = data.settings.reduceMotion ? 8 : 25;
    for (let index = 0; index < amount; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.textContent = pieces[index % pieces.length];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * .7}s`;
      piece.style.animationDuration = `${2 + Math.random() * 1.3}s`;
      confettiRoot.appendChild(piece);
    }
    setTimeout(() => { confettiRoot.innerHTML = ""; }, 3800);
  }

  function navigate(screen, pushHistory = true) {
    if (pushHistory && ui.screen !== screen) ui.history.push(ui.screen);
    ui.screen = screen;
    render();
    window.scrollTo({ top: 0, behavior: data.settings.reduceMotion ? "auto" : "smooth" });
  }

  function goBack() {
    ui.screen = ui.history.pop() || "home";
    render();
  }

  function setChrome(title) {
    screenTitle.textContent = title;
    backButton.hidden = ui.screen === "home";
    $$("[data-nav]").forEach(button => {
      const route = button.dataset.nav;
      const roundScreens = ["select", "order", "choose", "round"];
      const active = route === ui.screen || (route === "round" && roundScreens.includes(ui.screen));
      button.classList.toggle("active", active);
    });
  }

  backButton.addEventListener("click", goBack);
  homeButton.addEventListener("click", () => { ui.history = []; navigate("home", false); });
  $$("[data-nav]").forEach(button => button.addEventListener("click", () => {
    const target = button.dataset.nav;
    if (target === "round" && !currentRound()) {
      startNewRound();
      return;
    }
    navigate(target);
  }));

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 11) return "Guten Morgen";
    if (hour < 18) return "Hallo";
    return "Guten Abend";
  }

  function weatherForWorld() {
    if (data.settings.weatherMode !== "auto") {
      return { sun: "sun", rain: "rain", snow: "snow", night: "night" }[data.settings.weatherMode] || "sun";
    }
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    if (hour >= 21 || hour < 6) return "night";
    if ([11,0,1].includes(month) && (now.getDate() + now.getDay()) % 3 === 0) return "snow";
    if ((now.getDate() + month) % 5 === 0) return "rain";
    return "sun";
  }

  function weatherEmoji() {
    return { sun: "☀️", rain: "🌦️", snow: "❄️", night: "🌙" }[weatherForWorld()];
  }

  function dailyVisitor() {
    const visitors = [
      ["🦔", "Igel Ida", "Ich habe heute schon eine ruhige Ecke in euren Welten entdeckt."],
      ["🐿️", "Eichhörnchen Elli", "Gemeinsam geht vieles leichter. Ich bin gespannt, was heute wächst."],
      ["🦉", "Eule Oskar", "Auch kleine Schritte sind echte Fortschritte."],
      ["🐇", "Hase Hoppel", "Heute steckt bestimmt eine Überraschung in einer Aufgabe."],
      ["🦊", "Fuchs Fina", "Freundlichkeit macht jede Welt ein bisschen heller."],
      ["🐦", "Rotkehlchen Rudi", "Ich suche schon einen schönen Platz für mein Nest."],
      ["🐢", "Schildkröte Tilda", "Es muss nicht schnell gehen. Hauptsache, ihr bleibt dran."]
    ];
    const dayNumber = Math.floor(Date.now() / 86400000);
    return visitors[dayNumber % visitors.length];
  }

  function render() {
    const routes = {
      home: renderHome,
      select: renderSelectChildren,
      order: renderOrder,
      choose: renderTaskChoice,
      round: renderRound,
      worlds: renderWorlds,
      childWorld: renderChildWorld,
      groupWorld: renderGroupWorld,
      educator: renderEducator
    };
    (routes[ui.screen] || renderHome)();
  }

  function renderHome() {
    setChrome("Mitmach-Welt");
    const round = currentRound();
    const totalCompleted = data.children.reduce((sum, child) => sum + child.completed, 0);
    const visitor = dailyVisitor();
    const doneToday = data.history.filter(entry => entry.date?.startsWith(todayKey())).length;

    app.innerHTML = `
      <section class="hero">
        <div class="hero-content">
          <div class="mascot" aria-hidden="true">🌻</div>
          <h2>${greeting()}, ${escapeHtml(data.settings.groupName)}!</h2>
          <p>Jede übernommene Aufgabe lässt eine persönliche Welt wachsen. Wenn alle mitmachen, entwickelt sich auch eure gemeinsame Welt weiter.</p>
          <div class="hero-chips">
            <span class="weather-chip">${weatherEmoji()} Weltwetter</span>
            <span class="version-chip">✨ Reifere Testversion 1.1</span>
            <span class="pill">✅ Heute ${doneToday}</span>
          </div>
          <div class="hero-actions">
            <button class="primary" id="mainRoundAction" type="button">${round ? "🌻 Laufende Runde öffnen" : "🌻 Mitmach-Runde starten"}</button>
            <button class="secondary" id="homeWorlds" type="button">🌍 Welten entdecken</button>
          </div>
        </div>
      </section>

      <section class="grid three" style="margin-top:14px">
        <article class="card stat"><div><small>Kinder</small><strong>${data.children.length}</strong></div><span class="stat-icon">🧒</span></article>
        <article class="card stat"><div><small>Geschaffte Aufgaben</small><strong>${totalCompleted}</strong></div><span class="stat-icon">✅</span></article>
        <article class="card stat"><div><small>Gruppenpunkte</small><strong>${data.group.points}</strong></div><span class="stat-icon">🏡</span></article>
      </section>

      <div class="section-head"><div><h2>Besuch in der Mitmach-Welt</h2><p>Jeden Tag kommt jemand anderes vorbei.</p></div></div>
      <article class="card visitor-card">
        <div class="visitor-avatar">${visitor[0]}</div>
        <div><h3>${visitor[1]}</h3><p>„${visitor[2]}“</p></div>
      </article>

      <div class="section-head"><div><h2>Direkt loslegen</h2><p>Die wichtigsten Bereiche auf einen Blick.</p></div></div>
      <section class="grid">
        <button class="card tap-card" id="homePersonalWorlds" type="button"><span class="avatar-large">🌱</span><strong>Persönliche Welten</strong><p class="muted">Tiere, Pflanzen, Erinnerungen und gekaufte Extras.</p></button>
        <button class="card tap-card" id="homeGroupWorld" type="button"><span class="avatar-large">🏡</span><strong>Unsere Gruppenwelt</strong><p class="muted">Sie wächst, wenn eine Runde gemeinsam geschafft wurde.</p></button>
        <button class="card tap-card" id="homeEducator" type="button"><span class="avatar-large">🔒</span><strong>Erzieherbereich</strong><p class="muted">Kinder, Aufgaben, Auswertung und Einstellungen.</p></button>
      </section>
    `;

    $("#mainRoundAction").addEventListener("click", () => round ? navigate("round") : startNewRound());
    $("#homeWorlds").addEventListener("click", () => navigate("worlds"));
    $("#homePersonalWorlds").addEventListener("click", () => navigate("worlds"));
    $("#homeGroupWorld").addEventListener("click", () => navigate("groupWorld"));
    $("#homeEducator").addEventListener("click", () => navigate("educator"));
  }

  function startNewRound() {
    if (!data.children.length) {
      showToast("Lege zuerst mindestens ein Kind an.");
      return;
    }
    if (!tasksForToday().length) {
      showToast("Für heute ist keine Aufgabe aktiviert.");
      return;
    }
    ui.selectedChildren = [];
    ui.orderPreview = [];
    ui.suggestedTaskId = null;
    data.round = null;
    saveData();
    navigate("select");
  }

  function renderSelectChildren() {
    setChrome("Wer macht heute mit?");
    app.innerHTML = `
      <div class="section-head"><div><h2>Kinder auswählen</h2><p>Mehrere Kinder können mitmachen. Avatare dürfen bewusst mehrfach vergeben werden.</p></div><div class="right-note">${ui.selectedChildren.length} ausgewählt</div></div>
      <section class="grid">
        ${data.children.map(child => `
          <button class="card tap-card child-card ${ui.selectedChildren.includes(child.id) ? "selected" : ""}" data-child-select="${child.id}" type="button">
            <span class="avatar-bubble" style="--accent:${child.accent}">${child.avatar}</span>
            <strong>${escapeHtml(child.name)}</strong>
            <small>${ui.selectedChildren.includes(child.id) ? "Ausgewählt ✓" : "Zum Auswählen antippen"}</small>
          </button>
        `).join("")}
      </section>
      <div class="actions"><button class="primary" id="drawOrder" type="button" ${ui.selectedChildren.length ? "" : "disabled"}>🌻 Faire Reihenfolge auslosen</button></div>
    `;

    $$('[data-child-select]').forEach(button => button.addEventListener("click", () => {
      const childId = button.dataset.childSelect;
      ui.selectedChildren = ui.selectedChildren.includes(childId)
        ? ui.selectedChildren.filter(id => id !== childId)
        : [...ui.selectedChildren, childId];
      playTone("select");
      haptic(20);
      renderSelectChildren();
    }));

    $("#drawOrder").addEventListener("click", () => {
      const availableSlots = tasksForToday().reduce((sum, task) => sum + task.capacity, 0);
      if (ui.selectedChildren.length > availableSlots) {
        showToast(`Für ${ui.selectedChildren.length} Kinder werden mindestens ${ui.selectedChildren.length} Aufgabenplätze benötigt.`);
        return;
      }
      ui.orderPreview = fairOrder(ui.selectedChildren);
      createRound(ui.orderPreview);
      playTone("sparkle");
      navigate("order");
    });
  }

  function fairOrder(selectedIds) {
    const selected = [...selectedIds];
    if (selected.length < 2) return selected;
    const recent = data.lastOrders.slice(-10);
    const firstCounts = Object.fromEntries(selected.map(id => [id, 0]));
    recent.forEach(order => {
      if (order[0] in firstCounts) firstCounts[order[0]] += 1;
    });
    const minimum = Math.min(...Object.values(firstCounts));
    const candidates = selected.filter(id => firstCounts[id] === minimum);
    const first = candidates[Math.floor(Math.random() * candidates.length)];
    const rest = selected.filter(id => id !== first);
    for (let index = rest.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [rest[index], rest[randomIndex]] = [rest[randomIndex], rest[index]];
    }
    return [first, ...rest];
  }

  function createRound(order) {
    data.round = {
      id: uid(),
      date: Date.now(),
      day: todayKey(),
      participants: [...order],
      order: [...order],
      chooseIndex: 0,
      assignments: {},
      finished: false,
      teamBonusAwarded: false
    };
    data.lastOrders.push([...order]);
    data.lastOrders = data.lastOrders.slice(-20);
    saveData();
  }

  function renderOrder() {
    const round = currentRound();
    if (!round) { navigate("home", false); return; }
    setChrome("Die Sonnenblume lost aus");
    app.innerHTML = `
      <section class="card sunflower-stage">
        <div class="shuffle-flower">🌻</div>
        <h2>Die faire Reihenfolge steht!</h2>
        <p class="muted">Die App merkt sich, wer zuletzt zuerst dran war. So beginnt nicht immer dasselbe Kind.</p>
      </section>
      <div class="section-head"><div><h2>Heute wählen in dieser Reihenfolge</h2><p>Alle Kinder wählen zuerst. Danach erledigen alle gleichzeitig ihre Aufgaben.</p></div></div>
      <div class="list reveal-list">
        ${round.order.map((childId, index) => {
          const child = childById(childId);
          return `<div class="list-row" style="animation-delay:${.12 * index}s"><div class="order-number">${index + 1}</div><span class="avatar-bubble" style="--accent:${child.accent};width:52px;height:52px;border-radius:18px;font-size:2rem">${child.avatar}</span><div class="list-main"><strong>${escapeHtml(child.name)}</strong><small>${index === 0 ? "Darf zuerst wählen" : "Wählt danach"}</small></div></div>`;
        }).join("")}
      </div>
      <div class="actions"><button class="primary" id="beginTaskChoice" type="button">Aufgaben auswählen</button></div>
    `;
    $("#beginTaskChoice").addEventListener("click", () => navigate("choose"));
  }

  function taskUsage(taskId) {
    const round = currentRound();
    if (!round) return 0;
    return Object.values(round.assignments).filter(assignment => assignment.taskId === taskId).length;
  }

  function availableTasks() {
    return tasksForToday().filter(task => taskUsage(task.id) < task.capacity);
  }

  function renderTaskChoice() {
    const round = currentRound();
    if (!round) { navigate("home", false); return; }
    if (round.chooseIndex >= round.order.length) { navigate("round", false); return; }
    const childId = round.order[round.chooseIndex];
    const child = childById(childId);
    const tasks = availableTasks();
    if (!tasks.length) {
      showToast("Es sind nicht genügend freie Aufgaben vorhanden.");
      navigate("round", false);
      return;
    }

    if (!ui.suggestedTaskId || !tasks.some(task => task.id === ui.suggestedTaskId)) {
      ui.suggestedTaskId = tasks[Math.floor(Math.random() * tasks.length)]?.id || null;
    }

    setChrome(`${child.name} wählt`);
    app.innerHTML = `
      <section class="hero" style="min-height:230px">
        <div class="hero-content">
          <span class="avatar-bubble" style="--accent:${child.accent};width:82px;height:82px;border-radius:27px;font-size:3.2rem">${child.avatar}</span>
          <h2>${escapeHtml(child.name)}, was möchtest du heute übernehmen?</h2>
          <p>Du kannst selbst wählen. Die Sonnenblume hat nur einen unverbindlichen Vorschlag markiert.</p>
          <div class="hero-chips"><span class="pill">${round.chooseIndex + 1} von ${round.order.length}</span><span class="pill">🌻 Vorschlag ist freiwillig</span></div>
        </div>
      </section>
      <div class="section-head"><div><h2>Aufgaben für ${FULL_DAY_NAMES[dayIndex()]}</h2><p>Aufgaben mit mehreren Plätzen können gemeinsam übernommen werden.</p></div></div>
      <section class="grid">
        ${tasks.map(task => {
          const used = taskUsage(task.id);
          const suggested = task.id === ui.suggestedTaskId;
          return `
            <button class="card tap-card task-card ${suggested ? "suggested" : ""}" data-task-choice="${task.id}" type="button">
              ${suggested ? '<span class="suggest-ribbon">Sonnenblumen-Idee</span>' : ""}
              <span class="capacity badge ${task.capacity > 1 ? "violet" : "blue"}">${used}/${task.capacity} Plätze</span>
              <div class="task-icon">${task.icon}</div>
              <h3>${escapeHtml(task.title)}</h3>
              <p class="muted">${escapeHtml(task.category)} · ${escapeHtml(task.competence)}</p>
              <div class="task-meta"><span class="badge yellow">${"⭐".repeat(task.difficulty)}</span><span class="badge">🌱 ${task.seeds}</span><span class="badge blue">🪙 ${task.coins}</span></div>
            </button>
          `;
        }).join("")}
      </section>
    `;

    $$('[data-task-choice]').forEach(button => button.addEventListener("click", () => {
      const taskId = button.dataset.taskChoice;
      round.assignments[childId] = { childId, taskId, status: "chosen", outcome: null, kindness: false, coinsAwarded: 0, seedsAwarded: 0 };
      round.chooseIndex += 1;
      ui.suggestedTaskId = null;
      saveData();
      playTone("select");
      haptic(25);
      if (round.chooseIndex >= round.order.length) navigate("round", false);
      else renderTaskChoice();
    }));
  }

  function roundProgress() {
    const round = currentRound();
    if (!round) return { done: 0, total: 0, percent: 0 };
    const assignments = Object.values(round.assignments);
    const done = assignments.filter(assignment => assignment.status === "done").length;
    const total = round.participants.length;
    return { done, total, percent: total ? Math.round(done / total * 100) : 0 };
  }

  function renderRound() {
    const round = currentRound();
    if (!round) {
      setChrome("Mitmach-Runde");
      app.innerHTML = `<section class="card empty-state"><div class="empty-icon">🌻</div><h2>Noch keine Runde gestartet</h2><p>Wählt aus, welche Kinder heute mitmachen.</p><button class="primary" id="emptyStartRound" type="button">Mitmach-Runde starten</button></section>`;
      $("#emptyStartRound").addEventListener("click", startNewRound);
      return;
    }
    if (Object.keys(round.assignments).length < round.participants.length) {
      navigate(round.chooseIndex === 0 ? "order" : "choose", false);
      return;
    }

    setChrome("Mitmach-Runde");
    const progress = roundProgress();
    app.innerHTML = `
      <section class="card card-highlight">
        <div style="display:flex;align-items:center;gap:16px">
          <div class="progress-ring" style="--progress:${progress.percent}"><strong>${progress.done}/${progress.total}</strong></div>
          <div><h2 style="margin:0 0 5px">Alle können jetzt loslegen</h2><p class="muted" style="margin:0">Ein Kind kann „Ich bin fertig“ drücken, ohne auf die anderen zu warten.</p></div>
        </div>
        <div class="progress-card"><div class="progress-label"><span>Tagesfortschritt</span><span>${progress.percent}%</span></div><div class="progress"><div style="width:${progress.percent}%"></div></div></div>
      </section>

      <div class="section-head"><div><h2>Heute übernimmt</h2><p>Gelb bedeutet: wartet auf eine Bestätigung.</p></div></div>
      <div class="round-overview">
        ${round.order.map(childId => {
          const child = childById(childId);
          const assignment = round.assignments[childId];
          const task = taskById(assignment.taskId);
          const statusText = assignment.status === "done" ? `Bestätigt · ${resultLabel(assignment.outcome)}` : assignment.status === "pending" ? "Wartet auf Erzieherbestätigung" : "Aufgabe wird erledigt";
          return `
            <article class="card assignment-card" style="--accent:${child.accent}">
              <div class="assignment-row">
                <span class="avatar-bubble" style="--accent:${child.accent};width:56px;height:56px;border-radius:19px;font-size:2.1rem">${child.avatar}</span>
                <div class="assignment-details"><strong>${escapeHtml(child.name)}</strong><div class="assignment-task">${task.icon} ${escapeHtml(task.title)}</div><span class="status ${assignment.status}">${statusText}</span></div>
              </div>
              <div class="assignment-actions">
                ${assignment.status === "done"
                  ? `<button class="soft-button" type="button" data-open-child-world="${child.id}">🌍 Welt ansehen</button>`
                  : `<button class="${assignment.status === "pending" ? "secondary" : "primary"}" type="button" data-finish-child="${child.id}">${assignment.status === "pending" ? "🔒 Jetzt bestätigen" : "✅ Ich bin fertig"}</button>`}
              </div>
            </article>
          `;
        }).join("")}
      </div>
      <div class="actions">${progress.done === progress.total ? '<button class="primary" id="completeRound" type="button">🏡 Gemeinsamen Abschluss anzeigen</button>' : ''}<button class="secondary" id="roundHome" type="button">Zwischenspeichern und zur Startseite</button></div>
    `;

    $$('[data-finish-child]').forEach(button => button.addEventListener("click", () => {
      const childId = button.dataset.finishChild;
      const assignment = round.assignments[childId];
      if (assignment.status === "chosen") {
        assignment.status = "pending";
        saveData();
        playTone("soft");
        haptic([20, 40, 20]);
      }
      openPinModal(() => openConfirmationModal(childId));
      renderRound();
    }));
    $$('[data-open-child-world]').forEach(button => button.addEventListener("click", () => { ui.worldChildId = button.dataset.openChildWorld; ui.worldTab = "scene"; navigate("childWorld"); }));
    const completeRoundButton = $("#completeRound");
    if (completeRoundButton) completeRoundButton.addEventListener("click", finishRound);
    $("#roundHome").addEventListener("click", () => navigate("home"));
  }

  function openPinModal(onSuccess) {
    let pin = "";
    const draw = () => {
      modalRoot.innerHTML = `
        <div class="modal-backdrop">
          <section class="modal" aria-modal="true" role="dialog">
            <div class="modal-head"><h2>Erzieher-PIN</h2><button class="close-button" type="button">✕</button></div>
            <p class="muted">Die Bestätigung ist geschützt, damit Kinder ihre Belohnung nicht selbst vergeben.</p>
            <div class="pin-dots">${"•".repeat(pin.length)}</div>
            <div class="keypad">${[1,2,3,4,5,6,7,8,9,"⌫",0,"✓"].map(key => `<button type="button" data-pin-key="${key}">${key}</button>`).join("")}</div>
          </section>
        </div>
      `;
      $(".close-button").addEventListener("click", closeModal);
      $$('[data-pin-key]').forEach(button => button.addEventListener("click", () => {
        const key = button.dataset.pinKey;
        if (key === "⌫") pin = pin.slice(0, -1);
        else if (key === "✓") {
          if (pin === data.settings.pin) {
            closeModal();
            onSuccess();
            return;
          }
          playTone("error");
          haptic([60,40,60]);
          pin = "";
          showToast("PIN ist nicht richtig.");
        } else if (pin.length < 4) pin += key;
        draw();
      }));
    };
    draw();
  }

  function resultLabel(result) {
    return result === "super" ? "Super gemacht" : result === "almost" ? "Fast geschafft" : result === "together" ? "Gemeinsam geschafft" : "Bestätigt";
  }

  function openConfirmationModal(childId) {
    const child = childById(childId);
    const assignment = currentRound().assignments[childId];
    const task = taskById(assignment.taskId);
    let selectedResult = "super";
    let kindness = false;

    const draw = () => {
      modalRoot.innerHTML = `
        <div class="modal-backdrop">
          <section class="modal" aria-modal="true" role="dialog">
            <div class="modal-head"><h2>Leistung bestätigen</h2><button class="close-button" type="button">✕</button></div>
            <div class="list-row"><span class="avatar-bubble" style="--accent:${child.accent};width:54px;height:54px;border-radius:18px;font-size:2rem">${child.avatar}</span><div class="list-main"><strong>${escapeHtml(child.name)}</strong><small>${task.icon} ${escapeHtml(task.title)}</small></div></div>
            <div class="section-head"><div><h2>Wie ist es gelaufen?</h2><p>Alle drei Rückmeldungen bleiben wertschätzend.</p></div></div>
            <div class="confirm-options">
              <button class="confirm-card ${selectedResult === "super" ? "selected" : ""}" type="button" data-result="super"><span>🌟</span><div><strong>Super gemacht</strong><small>Volle Belohnung für selbstständiges Erledigen.</small></div></button>
              <button class="confirm-card ${selectedResult === "almost" ? "selected" : ""}" type="button" data-result="almost"><span>🌱</span><div><strong>Fast geschafft</strong><small>Weniger Münzen, aber die Anstrengung wird gesehen.</small></div></button>
              <button class="confirm-card ${selectedResult === "together" ? "selected" : ""}" type="button" data-result="together"><span>🤝</span><div><strong>Gemeinsam geschafft</strong><small>Belohnung für eine Aufgabe mit Unterstützung.</small></div></button>
            </div>
            <div class="separator"></div>
            <div class="toggle-row"><div><strong>❤️ Herzensblume vergeben</strong><div class="muted">Für freiwillige Hilfe oder besonders freundliches Verhalten.</div></div><button class="switch ${kindness ? "on" : ""}" id="kindnessToggle" type="button"><i></i></button></div>
            <div class="actions"><button class="primary" id="approveResult" type="button">Bestätigen und Welt wachsen lassen</button></div>
          </section>
        </div>
      `;
      $(".close-button").addEventListener("click", closeModal);
      $$('[data-result]').forEach(button => button.addEventListener("click", () => { selectedResult = button.dataset.result; playTone("select"); draw(); }));
      $("#kindnessToggle").addEventListener("click", () => { kindness = !kindness; draw(); });
      $("#approveResult").addEventListener("click", () => approveAssignment(childId, selectedResult, kindness));
    };
    draw();
  }

  function achievementIds(child) {
    const ids = [];
    if (child.completed >= 1) ids.push("first-task");
    if (child.completed >= 5) ids.push("five-tasks");
    if (child.completed >= 10) ids.push("ten-tasks");
    if (child.completed >= 25) ids.push("twentyfive-tasks");
    if (child.seeds >= 5) ids.push("first-tree");
    if (child.seeds >= 10) ids.push("butterfly");
    if (child.seeds >= 18) ids.push("home");
    if (child.kindness >= 1) ids.push("kindness");
    if (child.inventory.length >= 1) ids.push("first-shop");
    return ids;
  }

  function approveAssignment(childId, result, kindness) {
    const round = currentRound();
    const assignment = round.assignments[childId];
    const child = childById(childId);
    const task = taskById(assignment.taskId);
    const beforeAchievements = achievementIds(child);
    const multiplier = result === "super" ? 1 : result === "together" ? .85 : .6;
    const coins = Math.max(1, Math.round(task.coins * multiplier));
    const seeds = result === "almost" ? 0 : task.seeds;

    child.coins += coins;
    child.seeds += seeds;
    child.completed += 1;
    if (kindness) {
      child.kindness += 1;
      data.group.kindnessFlowers += 1;
    }

    assignment.status = "done";
    assignment.outcome = result;
    assignment.kindness = kindness;
    assignment.coinsAwarded = coins;
    assignment.seedsAwarded = seeds;

    data.group.points += result === "together" ? 3 : 2;
    data.history.unshift({
      id: uid(),
      date: new Date().toISOString(),
      childId,
      childName: child.name,
      taskId: task.id,
      taskTitle: task.title,
      taskIcon: task.icon,
      category: task.category,
      competence: task.competence,
      outcome: result,
      kindness,
      coins,
      seeds
    });
    data.history = data.history.slice(0, 600);

    const afterAchievements = achievementIds(child);
    const newAchievements = afterAchievements.filter(id => !beforeAchievements.includes(id));
    saveData();
    closeModal();
    playTone("success");
    haptic([30,40,30]);
    celebrate(kindness ? "stars" : "flowers");
    showRewardModal(child, task, result, coins, seeds, kindness, newAchievements, roundProgress().done === roundProgress().total);
  }

  function achievementTitle(id) {
    return {
      "first-task": "Erste Aufgabe geschafft",
      "five-tasks": "Fünf Aufgaben geschafft",
      "ten-tasks": "Zehn Aufgaben geschafft",
      "twentyfive-tasks": "25 Aufgaben geschafft",
      "first-tree": "Erster großer Baum",
      butterfly: "Ein Schmetterling zieht ein",
      home: "Ein besonderer Ort entsteht",
      kindness: "Erste Herzensblume",
      "first-shop": "Erstes Extra für die Welt"
    }[id] || "Neue Erinnerung";
  }

  function showRewardModal(child, task, result, coins, seeds, kindness, newAchievements, allDone) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal celebration" aria-modal="true" role="dialog">
          <div class="big">${kindness ? "❤️🌸" : result === "super" ? "🌻" : "🌱"}</div>
          <h2>${escapeHtml(child.name)}, deine Welt ist gewachsen!</h2>
          <p>${task.icon} ${escapeHtml(task.title)} wurde als „${resultLabel(result)}“ bestätigt.</p>
          <div class="reward-row"><span class="reward-chip">🪙 +${coins}</span><span class="reward-chip">🌱 +${seeds}</span>${kindness ? '<span class="reward-chip">❤️ Herzensblume</span>' : ""}</div>
          ${newAchievements.length ? `<div class="note success-note"><strong>Neue Erinnerung:</strong><br>${newAchievements.map(id => `✨ ${achievementTitle(id)}`).join("<br>")}</div>` : ""}
          <div class="actions"><button class="primary" id="rewardContinue" type="button">${allDone ? "Gemeinsamen Abschluss ansehen" : "Zur Aufgabenübersicht"}</button><button class="secondary" id="rewardWorld" type="button">${escapeHtml(child.name)}s Welt ansehen</button></div>
        </section>
      </div>
    `;
    $("#rewardWorld").addEventListener("click", () => { closeModal(); ui.worldChildId = child.id; ui.worldTab = "scene"; navigate("childWorld"); });
    $("#rewardContinue").addEventListener("click", () => {
      closeModal();
      if (allDone) finishRound();
      else renderRound();
    });
  }

  function finishRound() {
    const round = currentRound();
    if (!round) return;
    const participants = round.participants.map(childById).filter(Boolean);
    let teamCoins = 0;
    if (data.settings.teamBonus && !round.teamBonusAwarded) {
      teamCoins = 3;
      participants.forEach(child => { child.coins += teamCoins; });
      data.group.points += participants.length * 3;
      data.group.completedRounds += 1;
      round.teamBonusAwarded = true;
    }
    round.finished = true;
    saveData();
    celebrate("stars");
    playTone("sparkle");
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal celebration" aria-modal="true" role="dialog">
          <div class="big">🏡🌈</div>
          <h2>Ihr habt die Runde gemeinsam geschafft!</h2>
          <p>Die Gruppenwelt ist weitergewachsen. Dabei zählt nicht, wer zuerst fertig war, sondern dass jede Aufgabe ihren Platz hatte.</p>
          ${teamCoins ? `<div class="reward-row"><span class="reward-chip">🪙 +${teamCoins} Team-Münzen pro Kind</span><span class="reward-chip">🏡 Gruppenwelt +${participants.length * 3}</span></div>` : ""}
          <div class="actions"><button class="primary" id="finishGroupWorld" type="button">Gruppenwelt ansehen</button><button class="secondary" id="finishHome" type="button">Zur Startseite</button></div>
        </section>
      </div>
    `;
    $("#finishGroupWorld").addEventListener("click", () => { closeModal(); data.round = null; saveData(); navigate("groupWorld"); });
    $("#finishHome").addEventListener("click", () => { closeModal(); data.round = null; saveData(); navigate("home"); });
  }

  function closeModal() { modalRoot.innerHTML = ""; }

  function renderWorlds() {
    setChrome("Mitmach-Welten");
    app.innerHTML = `
      <section class="hero" style="min-height:225px">
        <div class="hero-content"><div class="mascot">🌍</div><h2>Jede Welt sieht anders aus</h2><p>Auch wenn zwei Kinder denselben Avatar mögen, unterscheiden sie sich durch Farbe, Themenwelt, Pflanzen, Tiere und Extras. Derselbe Avatar darf mehrfach vergeben werden.</p></div>
      </section>
      <div class="section-head"><div><h2>Persönliche Welten</h2><p>Antippen, entdecken und gestalten.</p></div></div>
      <section class="grid">
        ${data.children.map(child => `
          <button class="card tap-card child-card" data-world-child="${child.id}" type="button">
            <span class="avatar-bubble" style="--accent:${child.accent}">${child.avatar}</span>
            <strong>${escapeHtml(child.name)}</strong>
            <div class="badge-row" style="margin-top:9px"><span class="badge">🌱 ${child.seeds}</span><span class="badge blue">🪙 ${child.coins}</span></div>
            <p class="muted" style="margin:9px 0 0">${WORLD_THEMES.find(theme => theme.id === child.theme)?.title || "Eigene Welt"}</p>
          </button>
        `).join("")}
      </section>
      <div class="section-head"><div><h2>Gemeinsame Welt</h2><p>Sie gehört der ganzen Gruppe.</p></div></div>
      <button class="card tap-card" id="openGroupWorld" type="button"><span class="avatar-large">🏡</span><strong>Unsere Gruppenwelt</strong><p class="muted">${data.group.completedRounds} gemeinsame Runden · ${data.group.points} Gruppenpunkte · ${data.group.kindnessFlowers} Herzensblumen</p></button>
    `;
    $$('[data-world-child]').forEach(button => button.addEventListener("click", () => { ui.worldChildId = button.dataset.worldChild; ui.worldTab = "scene"; navigate("childWorld"); }));
    $("#openGroupWorld").addEventListener("click", () => navigate("groupWorld"));
  }

  function worldStory(child) {
    const stories = [
      `${child.avatar} Ein kleiner Vogel schaut heute nach einem guten Nistplatz.`,
      `🦋 Zwischen den Pflanzen ist heute besonders viel Bewegung.`,
      `🌱 Ein neuer Trieb hat sich über Nacht durch die Erde geschoben.`,
      `☁️ Die Wolken ziehen langsam weiter und bringen frische Luft.`,
      `🐿️ Jemand hat eine kleine Nuss neben dem Weg versteckt.`,
      `✨ Heute glitzert etwas zwischen den Blättern.`
    ];
    const seed = [...child.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) + Math.floor(Date.now() / 86400000);
    return stories[seed % stories.length];
  }

  function worldObjects(child, group = false) {
    const level = group ? data.group.points : child.seeds;
    const completed = group ? data.group.completedRounds * 4 : child.completed;
    const inventory = group ? data.group.inventory : child.inventory;
    const theme = group ? "group" : child.theme;
    const objects = [];
    const add = (icon, left, bottom, size, extra = "") => objects.push(`<span class="world-object ${extra}" style="left:${left}%;bottom:${bottom}px;font-size:${size}rem">${icon}</span>`);

    if (theme === "space") {
      add("🪐", 14, 210, 4.3); add("🌍", 67, 118, 4.1);
      if (level >= 3) add("🚀", 48, 184, 3.4);
      if (level >= 8) add("👽", 22, 38, 2.8);
      if (level >= 14) add("🛰️", 75, 244, 2.8);
    } else if (theme === "ocean") {
      add("🐚", 12, 25, 2.5); add("🌴", 72, 28, 4.8, "static");
      if (level >= 3) add("🐠", 42, 118, 2.5);
      if (level >= 7) add("🐬", 62, 160, 3.3);
      if (level >= 13) add("🏝️", 27, 32, 4.4, "static");
    } else if (theme === "magic") {
      add("🍄", 12, 24, 2.7); add("🌳", 60, 32, 5.2, "static");
      if (level >= 3) add("✨", 42, 210, 2.8);
      if (level >= 7) add("🦋", 25, 112, 2.5);
      if (level >= 12) add("🦄", 70, 45, 3.6);
      if (level >= 18) add("🏰", 38, 34, 4.7, "static");
    } else if (theme === "dino") {
      add("🌴", 12, 28, 4.4, "static"); add("🌋", 70, 28, 4.4, "static");
      if (level >= 3) add("🦕", 38, 35, 4.3);
      if (level >= 8) add("🦖", 67, 38, 3.7);
      if (level >= 14) add("🥚", 20, 24, 2.5);
    } else if (theme === "farm") {
      add("🌾", 11, 26, 2.8); add("🚜", 62, 27, 3.8, "static");
      if (level >= 3) add("🐓", 28, 30, 2.5);
      if (level >= 7) add("🐄", 48, 36, 3.3);
      if (level >= 12) add("🏠", 76, 36, 4.2, "static");
    } else {
      add("🌼", 11, 22, 2.6); add("🌷", 31, 26, 2.5);
      if (level >= 3) add("🌻", 76, 22, 2.7);
      if (level >= 5) add("🌳", 53, 34, 5.3, "static");
      if (level >= 8) add("🦋", 21, 115, 2.5);
      if (level >= 12) add("🐦", 61, 158, 2.3);
      if (level >= 18) add("🏡", 72, 38, 4.5, "static");
    }

    if (group) {
      add("🌻", 8, 24, 2.8); add("🌳", 47, 35, 5.5, "static");
      if (data.group.points >= 15) add("🪑", 25, 25, 3.2, "static");
      if (data.group.points >= 30) add("🛝", 66, 28, 3.6, "static");
      if (data.group.points >= 50) add("🌉", 37, 25, 4.1, "static");
      if (data.group.points >= 75) add("🏡", 73, 42, 4.7, "static");
      if (data.group.kindnessFlowers >= 1) add("❤️🌸", 14, 84, 2.1);
    }

    const itemPositions = {
      bench: [24, 25, 3.2], birdhouse: [60, 145, 2.8], swing: [72, 38, 3.5], lantern: [40, 22, 2.8], windmill: [82, 30, 3.4], fountain: [46, 24, 3.5], tent: [18, 35, 3.6], telescope: [78, 48, 3.2], kite: [26, 220, 3], boat: [58, 96, 3.4], rainbow: [43, 245, 4.4], treehouse: [57, 74, 4.4]
    };
    inventory.forEach(itemId => {
      const item = SHOP_ITEMS.find(entry => entry.id === itemId);
      const position = itemPositions[itemId];
      if (item && position) add(item.icon, position[0], position[1], position[2], "static");
    });

    if (completed >= 10 && theme !== "space") add("🌈", 40, 240, 4.3);
    return objects.join("");
  }

  function worldScene(child, group = false) {
    const theme = group ? "group" : child.theme;
    const weather = weatherForWorld();
    const label = group ? "🏡 Unsere Gruppenwelt" : `${child.avatar} ${escapeHtml(child.name)}s Welt`;
    const story = group ? "Wenn alle ihren Teil beitragen, entsteht hier etwas, das niemand allein bauen könnte." : worldStory(child);
    return `
      <section class="world-scene ${group ? "group-world" : `theme-${theme}`} ${weather === "night" ? "night" : ""}">
        ${theme === "space" || weather === "night" ? '<div class="stars-layer"></div>' : ""}
        <div class="world-label">${label}</div>
        <div class="world-weather">${weatherEmoji()}</div>
        ${weather !== "night" && theme !== "space" ? '<div class="world-cloud">☁️</div><div class="world-cloud second">☁️</div>' : ""}
        ${weather === "rain" ? '<span class="world-object" style="left:45%;bottom:230px;font-size:3rem">🌧️</span>' : ""}
        ${weather === "snow" ? '<span class="world-object" style="left:38%;bottom:225px;font-size:3rem">❄️</span>' : ""}
        ${worldObjects(child, group)}
        ${data.settings.showStories ? `<div class="world-story"><span>${group ? "🌻" : child.avatar}</span><span>${story}</span></div>` : ""}
      </section>
    `;
  }

  function memoriesFor(child) {
    return [
      ["🌱","Erste Aufgabe",child.completed >= 1],
      ["🌳","Erster großer Baum",child.seeds >= 5],
      ["🦋","Schmetterling eingezogen",child.seeds >= 10],
      ["❤️🌸","Herzensblume",child.kindness >= 1],
      ["⭐","Zehn Aufgaben",child.completed >= 10],
      ["🏡","Besonderer Ort",child.seeds >= 18],
      ["🛍️","Erstes Extra",child.inventory.length >= 1],
      ["🌈","Regenbogenmoment",child.completed >= 15],
      ["🌟","25 Aufgaben",child.completed >= 25]
    ];
  }

  function renderChildWorld() {
    const child = childById(ui.worldChildId) || data.children[0];
    if (!child) { navigate("worlds", false); return; }
    ui.worldChildId = child.id;
    setChrome(`${child.name}s Welt`);
    const tabs = [["scene","Welt"],["book","Mitmach-Buch"],["shop","Weltladen"]];
    let content = "";

    if (ui.worldTab === "scene") {
      content = `${worldScene(child)}<section class="grid three" style="margin-top:13px"><article class="card stat"><div><small>Samen</small><strong>${child.seeds}</strong></div><span class="stat-icon">🌱</span></article><article class="card stat"><div><small>Münzen</small><strong>${child.coins}</strong></div><span class="stat-icon">🪙</span></article><article class="card stat"><div><small>Aufgaben</small><strong>${child.completed}</strong></div><span class="stat-icon">✅</span></article></section>`;
    } else if (ui.worldTab === "book") {
      const memories = memoriesFor(child);
      content = `<section class="memory-grid">${memories.map(memory => `<article class="memory ${memory[2] ? "" : "locked"}"><span class="memory-icon">${memory[0]}</span><strong>${memory[1]}</strong><small>${memory[2] ? "Entdeckt" : "Noch verborgen"}</small></article>`).join("")}</section>`;
    } else {
      content = `<div class="note">Extras werden mit Mitmach-Münzen gekauft. Sie verändern nur die Welt und bringen keinen Vorteil gegenüber anderen Kindern.</div><section class="shop-grid" style="margin-top:12px">${SHOP_ITEMS.map(item => {
        const owned = child.inventory.includes(item.id);
        const affordable = child.coins >= item.cost;
        return `<article class="shop-item ${owned ? "owned" : ""}"><span class="shop-icon">${item.icon}</span><strong>${item.title}</strong><small>${item.description}</small><div class="shop-price">${owned ? "✓ Gehört zur Welt" : `🪙 ${item.cost}`}</div>${owned ? "" : `<button class="mini-button" type="button" data-buy-item="${item.id}" ${affordable ? "" : "disabled"}>${affordable ? "Kaufen" : "Noch sparen"}</button>`}</article>`;
      }).join("")}</section>`;
    }

    app.innerHTML = `
      <div class="world-tabs">${tabs.map(tab => `<button class="tab ${ui.worldTab === tab[0] ? "active" : ""}" type="button" data-world-tab="${tab[0]}">${tab[1]}</button>`).join("")}</div>
      ${content}
    `;
    $$('[data-world-tab]').forEach(button => button.addEventListener("click", () => { ui.worldTab = button.dataset.worldTab; renderChildWorld(); }));
    $$('[data-buy-item]').forEach(button => button.addEventListener("click", () => buyWorldItem(child.id, button.dataset.buyItem)));
  }

  function buyWorldItem(childId, itemId) {
    const child = childById(childId);
    const item = SHOP_ITEMS.find(entry => entry.id === itemId);
    if (!child || !item || child.inventory.includes(item.id)) return;
    if (child.coins < item.cost) { showToast("Dafür fehlen noch Münzen."); return; }
    child.coins -= item.cost;
    child.inventory.push(item.id);
    saveData();
    celebrate("stars");
    playTone("sparkle");
    showToast(`${item.title} gehört jetzt zu ${child.name}s Welt.`);
    renderChildWorld();
  }

  function renderGroupWorld() {
    setChrome("Unsere Gruppenwelt");
    const nextMilestones = [15,30,50,75,100].filter(value => value > data.group.points);
    const next = nextMilestones[0] || 125;
    const previous = [0,15,30,50,75,100].filter(value => value <= data.group.points).pop() || 0;
    const progress = Math.round((data.group.points - previous) / (next - previous) * 100);
    app.innerHTML = `
      ${worldScene({ id: "group", avatar: "🌻", name: "Gruppe", seeds: data.group.points, completed: data.group.completedRounds, inventory: data.group.inventory, theme: "meadow" }, true)}
      <section class="grid three" style="margin-top:13px"><article class="card stat"><div><small>Gruppenpunkte</small><strong>${data.group.points}</strong></div><span class="stat-icon">🏡</span></article><article class="card stat"><div><small>Gemeinsame Runden</small><strong>${data.group.completedRounds}</strong></div><span class="stat-icon">🌻</span></article><article class="card stat"><div><small>Herzensblumen</small><strong>${data.group.kindnessFlowers}</strong></div><span class="stat-icon">❤️</span></article></section>
      <div class="section-head"><div><h2>Nächstes gemeinsames Bauwerk</h2><p>Bei ${next} Gruppenpunkten wird etwas Neues sichtbar.</p></div></div>
      <section class="card"><div class="progress-label"><span>${data.group.points} von ${next}</span><span>${clamp(progress,0,100)}%</span></div><div class="progress"><div style="width:${clamp(progress,0,100)}%"></div></div><p class="muted" style="margin:12px 0 0">Die Gruppenwelt belohnt das gemeinsame Gelingen – nicht den Vergleich zwischen einzelnen Kindern.</p></section>
    `;
  }

  function renderEducator() {
    setChrome("Erzieherbereich");
    if (!ui.educatorUnlocked) {
      app.innerHTML = `
        <section class="card card-highlight"><span class="avatar-large">🔒</span><h2>Geschützter Bereich</h2><p class="muted">Hier werden Kinder, Aufgaben, Runden und Einstellungen verwaltet.</p><div class="field"><label for="unlockPin">Erzieher-PIN</label><input id="unlockPin" type="password" inputmode="numeric" maxlength="4" placeholder="Vierstellige PIN"></div><div class="actions"><button class="primary" id="unlockEducator" type="button">Öffnen</button></div></section>
      `;
      $("#unlockEducator").addEventListener("click", () => {
        if ($("#unlockPin").value === data.settings.pin) {
          ui.educatorUnlocked = true;
          playTone("success");
          renderEducator();
        } else {
          playTone("error");
          showToast("PIN ist nicht richtig.");
        }
      });
      return;
    }

    const tabs = [["children","Kinder"],["tasks","Aufgaben"],["round","Runde"],["insights","Einblicke"],["settings","Einstellungen"],["data","Daten"]];
    app.innerHTML = `<div class="tabs">${tabs.map(tab => `<button class="tab ${ui.educatorTab === tab[0] ? "active" : ""}" type="button" data-educator-tab="${tab[0]}">${tab[1]}</button>`).join("")}</div><div id="educatorContent"></div>`;
    $$('[data-educator-tab]').forEach(button => button.addEventListener("click", () => { ui.educatorTab = button.dataset.educatorTab; renderEducator(); }));
    renderEducatorContent();
  }

  function renderEducatorContent() {
    const root = $("#educatorContent");
    if (!root) return;

    if (ui.educatorTab === "children") {
      root.innerHTML = `
        <div class="note success-note">Avatare dürfen mehrfach vergeben werden. Die persönliche Akzentfarbe und Themenwelt sorgen trotzdem für eine eigene Identität.</div>
        <div class="list" style="margin-top:12px">${data.children.map(child => `<div class="list-row"><span class="avatar-bubble" style="--accent:${child.accent};width:54px;height:54px;border-radius:18px;font-size:2rem">${child.avatar}</span><div class="list-main"><strong>${escapeHtml(child.name)}</strong><small>${WORLD_THEMES.find(theme => theme.id === child.theme)?.title} · 🌱 ${child.seeds} · 🪙 ${child.coins} · ✅ ${child.completed}</small></div><button class="icon-button" type="button" data-edit-child="${child.id}">✏️</button></div>`).join("")}</div>
        <div class="actions"><button class="primary" id="addChild" type="button">＋ Kind anlegen</button></div>
      `;
      $$('[data-edit-child]').forEach(button => button.addEventListener("click", () => openChildForm(button.dataset.editChild)));
      $("#addChild").addEventListener("click", () => openChildForm());
      return;
    }

    if (ui.educatorTab === "tasks") {
      root.innerHTML = `
        <div class="note">Für jeden Wochentag kann festgelegt werden, ob eine Aufgabe erscheint. Mit „Plätzen“ kann dieselbe Aufgabe von mehreren Kindern gewählt werden.</div>
        <div class="list" style="margin-top:12px">${data.tasks.map(task => `<div class="list-row"><span class="avatar-medium">${task.icon}</span><div class="list-main"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.category)} · ${escapeHtml(task.competence)} · ${"⭐".repeat(task.difficulty)} · ${task.capacity} Platz/Plätze · ${task.days.map(day => DAY_NAMES[day]).join(", ")}</small></div><button class="switch ${task.active ? "on" : ""}" type="button" data-toggle-task="${task.id}" aria-label="Aufgabe aktivieren"><i></i></button><button class="icon-button" type="button" data-edit-task="${task.id}">✏️</button></div>`).join("")}</div>
        <div class="actions"><button class="primary" id="addTask" type="button">＋ Aufgabe anlegen</button></div>
      `;
      $$('[data-toggle-task]').forEach(button => button.addEventListener("click", () => { const task = taskById(button.dataset.toggleTask); task.active = !task.active; saveData(); renderEducatorContent(); }));
      $$('[data-edit-task]').forEach(button => button.addEventListener("click", () => openTaskForm(button.dataset.editTask)));
      $("#addTask").addEventListener("click", () => openTaskForm());
      return;
    }

    if (ui.educatorTab === "round") {
      const round = currentRound();
      if (!round) {
        root.innerHTML = `<section class="card empty-state"><div class="empty-icon">🌻</div><h2>Keine laufende Runde</h2><p>Eine neue Runde wird auf der Startseite begonnen.</p><button class="primary" id="adminStartRound" type="button">Neue Runde starten</button></section>`;
        $("#adminStartRound").addEventListener("click", () => { ui.educatorUnlocked = false; startNewRound(); });
      } else {
        const progress = roundProgress();
        root.innerHTML = `<section class="card"><h2>Laufende Runde</h2><p class="muted">${progress.done} von ${progress.total} Aufgaben bestätigt.</p><div class="progress"><div style="width:${progress.percent}%"></div></div><div class="actions"><button class="primary" id="adminOpenRound" type="button">Runde öffnen</button><button class="danger-button" id="cancelRound" type="button">Runde abbrechen</button></div></section>`;
        $("#adminOpenRound").addEventListener("click", () => navigate("round"));
        $("#cancelRound").addEventListener("click", () => {
          if (confirm("Die laufende Runde wirklich abbrechen? Bereits bestätigte Belohnungen bleiben erhalten.")) {
            data.round = null;
            saveData();
            showToast("Runde wurde beendet.");
            renderEducatorContent();
          }
        });
      }
      return;
    }

    if (ui.educatorTab === "insights") {
      renderInsights(root);
      return;
    }

    if (ui.educatorTab === "settings") {
      root.innerHTML = `
        <section class="card form">
          <div class="field"><label>Gruppenname</label><input id="groupName" maxlength="35" value="${escapeHtml(data.settings.groupName)}"></div>
          <div class="field"><label>Neue vierstellige PIN</label><input id="newPin" type="password" inputmode="numeric" maxlength="4" value="${escapeHtml(data.settings.pin)}"></div>
          <div class="field"><label>Weltwetter</label><select id="weatherMode"><option value="auto" ${data.settings.weatherMode === "auto" ? "selected" : ""}>Automatisch</option><option value="sun" ${data.settings.weatherMode === "sun" ? "selected" : ""}>Immer sonnig</option><option value="rain" ${data.settings.weatherMode === "rain" ? "selected" : ""}>Regen</option><option value="snow" ${data.settings.weatherMode === "snow" ? "selected" : ""}>Schnee</option><option value="night" ${data.settings.weatherMode === "night" ? "selected" : ""}>Nacht</option></select></div>
          ${toggleSettingMarkup("sound", "Ruhige Töne", "Kurze Bestätigungs- und Belohnungstöne")}
          ${toggleSettingMarkup("haptics", "Vibration", "Dezente Rückmeldung auf unterstützten Geräten")}
          ${toggleSettingMarkup("reduceMotion", "Bewegungen reduzieren", "Weniger Animationen für empfindliche Kinder")}
          ${toggleSettingMarkup("teamBonus", "Team-Bonus", "Nach einer vollständigen Runde erhalten alle einen kleinen Bonus")}
          ${toggleSettingMarkup("showStories", "Weltgeschichten", "Kleine tägliche Geschichten in den Welten")}
          <button class="primary" id="saveSettings" type="button">Einstellungen speichern</button>
        </section>
      `;
      $$('[data-setting-toggle]').forEach(button => button.addEventListener("click", () => { const key = button.dataset.settingToggle; data.settings[key] = !data.settings[key]; saveData(); renderEducatorContent(); }));
      $("#saveSettings").addEventListener("click", () => {
        const pin = $("#newPin").value.trim();
        if (!/^\d{4}$/.test(pin)) { showToast("Die PIN muss aus vier Ziffern bestehen."); return; }
        data.settings.groupName = $("#groupName").value.trim() || "Unsere Gruppe";
        data.settings.pin = pin;
        data.settings.weatherMode = $("#weatherMode").value;
        saveData();
        showToast("Einstellungen gespeichert.");
      });
      return;
    }

    root.innerHTML = `
      <section class="card"><h2>Datenschutz und Sicherung</h2><p class="muted">Alle Angaben werden ausschließlich im Browser dieses Geräts gespeichert. Es werden keine Kinder- oder Aufgabendaten an einen Server übertragen.</p><div class="note warning-note">Beim Löschen der Browserdaten können die Welten verloren gehen. Deshalb regelmäßig eine Sicherung exportieren.</div><div class="actions"><button class="secondary" id="exportData" type="button">⬇️ Sicherung exportieren</button><label class="secondary" style="display:grid;place-items:center">⬆️ Sicherung importieren<input id="importData" type="file" accept="application/json" hidden></label><button class="danger-button" id="resetData" type="button">Alle App-Daten zurücksetzen</button></div></section>
    `;
    $("#exportData").addEventListener("click", exportData);
    $("#importData").addEventListener("change", importData);
    $("#resetData").addEventListener("click", () => {
      if (confirm("Wirklich alle Kinder, Aufgaben, Welten und Fortschritte löschen?")) {
        data = clone(DEFAULTS);
        saveData();
        ui.educatorUnlocked = false;
        showToast("App wurde zurückgesetzt.");
        navigate("home");
      }
    });
  }

  function toggleSettingMarkup(key, title, description) {
    return `<div class="toggle-row"><div><strong>${title}</strong><div class="muted">${description}</div></div><button class="switch ${data.settings[key] ? "on" : ""}" type="button" data-setting-toggle="${key}"><i></i></button></div>`;
  }

  function renderInsights(root) {
    const lastSeven = Date.now() - 7 * 86400000;
    const recent = data.history.filter(entry => new Date(entry.date).getTime() >= lastSeven);
    const categoryCounts = {};
    const competenceCounts = {};
    recent.forEach(entry => {
      categoryCounts[entry.category || "Alltag"] = (categoryCounts[entry.category || "Alltag"] || 0) + 1;
      competenceCounts[entry.competence || "Selbstständigkeit"] = (competenceCounts[entry.competence || "Selbstständigkeit"] || 0) + 1;
    });
    const maxCompetence = Math.max(1, ...Object.values(competenceCounts));
    const kindnessCount = recent.filter(entry => entry.kindness).length;

    root.innerHTML = `
      <div class="note">Diese Übersicht dient der pädagogischen Reflexion. Sie zeigt Beteiligung und geförderte Bereiche, aber keine Rangliste und keine Bewertung der Kinder.</div>
      <section class="grid three" style="margin-top:12px"><article class="card stat"><div><small>Letzte 7 Tage</small><strong>${recent.length}</strong></div><span class="stat-icon">✅</span></article><article class="card stat"><div><small>Herzensblumen</small><strong>${kindnessCount}</strong></div><span class="stat-icon">❤️</span></article><article class="card stat"><div><small>Aktive Kategorien</small><strong>${Object.keys(categoryCounts).length}</strong></div><span class="stat-icon">🧩</span></article></section>
      <div class="section-head"><div><h2>Geförderte Bereiche</h2><p>Auf Grundlage der bestätigten Aufgaben der letzten sieben Tage.</p></div></div>
      <section class="card insight-bars">${Object.keys(competenceCounts).length ? Object.entries(competenceCounts).sort((a,b) => b[1]-a[1]).map(([name,count]) => `<div class="insight-row"><span>${escapeHtml(name)}</span><div class="insight-track"><div style="width:${Math.round(count/maxCompetence*100)}%"></div></div><strong>${count}</strong></div>`).join("") : '<p class="muted">Noch keine Daten aus den letzten sieben Tagen.</p>'}</section>
      <div class="section-head"><div><h2>Letzte Aktivitäten</h2><p>Die neuesten Bestätigungen.</p></div></div>
      <div class="activity-list">${data.history.slice(0,12).map(entry => `<article class="activity"><span class="activity-icon">${entry.taskIcon || "✅"}</span><div><p><strong>${escapeHtml(entry.childName || "Kind")}</strong>: ${escapeHtml(entry.taskTitle || "Aufgabe")} · ${resultLabel(entry.outcome)}${entry.kindness ? " · ❤️ Herzensblume" : ""}</p><small>${formatDateTime(entry.date)}</small></div></article>`).join("") || '<section class="card"><p class="muted">Noch keine Aktivitäten gespeichert.</p></section>'}</div>
    `;
  }

  function openChildForm(childId = null) {
    const existing = childId ? childById(childId) : null;
    const draft = existing ? clone(existing) : { id: null, name: "", avatar: "🦄", accent: ACCENT_COLORS[0], theme: "meadow", coins: 0, seeds: 0, completed: 0, kindness: 0, inventory: [], createdAt: Date.now() };
    let selectedCategory = Object.entries(AVATARS).find(([, avatars]) => avatars.includes(draft.avatar))?.[0] || "Tiere";

    const captureDraftFields = () => {
      const nameField = $("#childName");
      if (nameField) draft.name = nameField.value;
      const coinsField = $("#childCoins");
      if (coinsField) draft.coins = Math.max(0, Number(coinsField.value) || 0);
      const seedsField = $("#childSeeds");
      if (seedsField) draft.seeds = Math.max(0, Number(seedsField.value) || 0);
    };

    const draw = () => {
      const usedAvatars = data.children.filter(child => child.id !== childId).map(child => child.avatar);
      modalRoot.innerHTML = `
        <div class="modal-backdrop">
          <section class="modal wide" aria-modal="true" role="dialog">
            <div class="modal-head"><h2>${childId ? "Kind bearbeiten" : "Kind anlegen"}</h2><button class="close-button" type="button">✕</button></div>
            <div class="form">
              <div class="field"><label>Name oder Spitzname</label><input id="childName" maxlength="24" value="${escapeHtml(draft.name)}" placeholder="z. B. Lucy"></div>
              <div class="field"><label>Avatar auswählen</label><div class="field-help">Mehrere Kinder dürfen denselben Avatar verwenden. Zur Auswahl stehen über 100 Symbole.</div></div>
              <div class="avatar-picker">
                <div class="avatar-category">${Object.keys(AVATARS).map(category => `<button class="${selectedCategory === category ? "active" : ""}" type="button" data-avatar-category="${category}">${category}</button>`).join("")}</div>
                <div class="avatar-options">${AVATARS[selectedCategory].map(avatar => `<button class="avatar-option ${draft.avatar === avatar ? "selected" : ""} ${usedAvatars.includes(avatar) ? "used" : ""}" type="button" data-avatar-option="${avatar}" aria-label="Avatar ${avatar}">${avatar}</button>`).join("")}</div>
              </div>
              <div class="field"><label>Persönliche Farbe</label><div class="color-options">${ACCENT_COLORS.map(color => `<button class="color-option ${draft.accent === color ? "selected" : ""}" style="background:${color}" type="button" data-accent-color="${color}" aria-label="Farbe auswählen"></button>`).join("")}</div></div>
              <div class="field"><label>Themenwelt</label><div class="theme-options">${WORLD_THEMES.map(theme => `<button class="theme-option ${draft.theme === theme.id ? "selected" : ""}" type="button" data-world-theme="${theme.id}"><span>${theme.icon}</span><strong>${theme.title}</strong><small>${theme.description}</small></button>`).join("")}</div></div>
              ${childId ? `<div class="form-grid"><div class="field"><label>Münzen</label><input id="childCoins" type="number" min="0" max="9999" value="${draft.coins}"></div><div class="field"><label>Samen</label><input id="childSeeds" type="number" min="0" max="9999" value="${draft.seeds}"></div></div>` : ""}
              <button class="primary" id="saveChild" type="button">Speichern</button>
              ${childId ? '<button class="danger-button" id="deleteChild" type="button">Kind löschen</button>' : ""}
            </div>
          </section>
        </div>
      `;
      $(".close-button").addEventListener("click", closeModal);
      $$('[data-avatar-category]').forEach(button => button.addEventListener("click", () => { captureDraftFields(); selectedCategory = button.dataset.avatarCategory; draw(); }));
      $$('[data-avatar-option]').forEach(button => button.addEventListener("click", () => { captureDraftFields(); draft.avatar = button.dataset.avatarOption; playTone("select"); draw(); }));
      $$('[data-accent-color]').forEach(button => button.addEventListener("click", () => { captureDraftFields(); draft.accent = button.dataset.accentColor; draw(); }));
      $$('[data-world-theme]').forEach(button => button.addEventListener("click", () => { captureDraftFields(); draft.theme = button.dataset.worldTheme; draw(); }));
      $("#saveChild").addEventListener("click", () => {
        const name = $("#childName").value.trim();
        if (!name) { showToast("Bitte einen Namen eintragen."); return; }
        draft.name = name;
        if (childId) {
          draft.coins = Math.max(0, Number($("#childCoins").value) || 0);
          draft.seeds = Math.max(0, Number($("#childSeeds").value) || 0);
          Object.assign(existing, draft);
        } else {
          draft.id = uid();
          data.children.push(draft);
        }
        saveData();
        closeModal();
        renderEducatorContent();
        showToast("Kind gespeichert.");
      });
      const deleteButton = $("#deleteChild");
      if (deleteButton) deleteButton.addEventListener("click", () => {
        if (confirm(`${existing.name} wirklich löschen? Die persönliche Welt wird ebenfalls entfernt.`)) {
          data.children = data.children.filter(child => child.id !== childId);
          data.history = data.history.filter(entry => entry.childId !== childId);
          if (data.round?.participants.includes(childId)) data.round = null;
          saveData();
          closeModal();
          renderEducatorContent();
        }
      });
    };
    draw();
  }

  function openTaskForm(taskId = null) {
    const existing = taskId ? taskById(taskId) : null;
    const draft = existing ? clone(existing) : { id: null, title: "", icon: "✅", category: "Alltag", competence: "Selbstständigkeit", difficulty: 1, coins: 5, seeds: 1, capacity: 1, active: true, days: [0,1,2,3,4,5,6] };
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal wide" aria-modal="true" role="dialog">
          <div class="modal-head"><h2>${taskId ? "Aufgabe bearbeiten" : "Aufgabe anlegen"}</h2><button class="close-button" type="button">✕</button></div>
          <div class="form">
            <div class="field"><label>Aufgabe</label><input id="taskTitle" maxlength="48" value="${escapeHtml(draft.title)}" placeholder="z. B. Tisch decken"></div>
            <div class="field"><label>Symbol</label><select id="taskIcon">${TASK_ICONS.map(icon => `<option ${icon === draft.icon ? "selected" : ""}>${icon}</option>`).join("")}</select></div>
            <div class="form-grid"><div class="field"><label>Kategorie</label><input id="taskCategory" maxlength="28" value="${escapeHtml(draft.category)}"></div><div class="field"><label>Förderbereich</label><select id="taskCompetence">${COMPETENCES.map(competence => `<option ${competence === draft.competence ? "selected" : ""}>${competence}</option>`).join("")}</select></div></div>
            <div class="form-grid"><div class="field"><label>Schwierigkeit</label><select id="taskDifficulty">${[1,2,3].map(value => `<option value="${value}" ${value === draft.difficulty ? "selected" : ""}>${"⭐".repeat(value)}</option>`).join("")}</select></div><div class="field"><label>Plätze</label><select id="taskCapacity">${[1,2,3,4].map(value => `<option value="${value}" ${value === draft.capacity ? "selected" : ""}>${value}</option>`).join("")}</select></div></div>
            <div class="form-grid"><div class="field"><label>Münzen</label><input id="taskCoins" type="number" min="1" max="50" value="${draft.coins}"></div><div class="field"><label>Samen</label><input id="taskSeeds" type="number" min="0" max="10" value="${draft.seeds}"></div></div>
            <div class="field"><label>Aktive Wochentage</label><div class="checkbox-grid">${FULL_DAY_NAMES.map((name,index) => `<label class="check-option"><input type="checkbox" data-task-day="${index}" ${draft.days.includes(index) ? "checked" : ""}>${name}</label>`).join("")}</div></div>
            <button class="primary" id="saveTask" type="button">Speichern</button>
            ${taskId ? '<button class="danger-button" id="deleteTask" type="button">Aufgabe löschen</button>' : ""}
          </div>
        </section>
      </div>
    `;
    $(".close-button").addEventListener("click", closeModal);
    $("#saveTask").addEventListener("click", () => {
      const title = $("#taskTitle").value.trim();
      if (!title) { showToast("Bitte eine Aufgabe eintragen."); return; }
      const days = $$('[data-task-day]:checked').map(input => Number(input.dataset.taskDay));
      if (!days.length) { showToast("Wähle mindestens einen Wochentag."); return; }
      Object.assign(draft, {
        title,
        icon: $("#taskIcon").value,
        category: $("#taskCategory").value.trim() || "Alltag",
        competence: $("#taskCompetence").value,
        difficulty: Number($("#taskDifficulty").value),
        capacity: Number($("#taskCapacity").value),
        coins: clamp(Number($("#taskCoins").value) || 1, 1, 50),
        seeds: clamp(Number($("#taskSeeds").value) || 0, 0, 10),
        days
      });
      if (taskId) Object.assign(existing, draft);
      else { draft.id = uid(); data.tasks.push(draft); }
      saveData();
      closeModal();
      renderEducatorContent();
      showToast("Aufgabe gespeichert.");
    });
    const deleteButton = $("#deleteTask");
    if (deleteButton) deleteButton.addEventListener("click", () => {
      if (confirm(`${existing.title} wirklich löschen?`)) {
        data.tasks = data.tasks.filter(task => task.id !== taskId);
        saveData();
        closeModal();
        renderEducatorContent();
      }
    });
  }

  function exportData() {
    const payload = { ...data, exportedAt: new Date().toISOString(), appVersion: APP_VERSION };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mitmach-welt-sicherung-${todayKey()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = normalizeData(JSON.parse(reader.result));
        if (!incoming.children || !incoming.tasks) throw new Error("invalid");
        data = incoming;
        saveData();
        showToast("Sicherung wurde importiert.");
        renderEducatorContent();
      } catch (error) {
        showToast("Die Datei ist keine gültige Mitmach-Welt-Sicherung.");
      }
    };
    reader.readAsText(file);
  }

  function setupServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js");
        if (registration.waiting) showUpdate(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdate(worker);
          });
        });
        navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
      } catch (error) {
        // Offline-Unterstützung ist optional.
      }
    });
  }

  function showUpdate(worker) {
    ui.pendingServiceWorker = worker;
    updateBanner.hidden = false;
  }

  $("#reloadApp").addEventListener("click", () => {
    ui.pendingServiceWorker?.postMessage({ type: "SKIP_WAITING" });
  });

  applyPreferences();
  render();
  setupServiceWorker();
})();
