(() => {
  "use strict";

  const APP_VERSION = "2.2.0";
  const SCHEMA_VERSION = 3;
  const STORAGE_KEY = "mitmach_welt_state_v1";
  const BACKUP_KEY = "mitmach_welt_state_backup_v1";
  const PRE_V2_BACKUP_KEY = "mitmach_welt_state_pre_v2";
  const BACKUP_RING_KEY = "mitmach_welt_backup_ring_v2";
  const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const FULL_DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const MONTH_NAMES = ["", "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const GOAL_RESULTS = {
    achieved: { label: "Geschafft", icon: "🌟" },
    partial: { label: "Teilweise", icon: "🌱" },
    notYet: { label: "Heute noch nicht", icon: "🌤️" }
  };

  const AVATARS = {
    "Tiere": ["🦄","🦊","🐼","🦁","🐸","🐨","🐯","🐰","🐧","🐙","🦋","🐬","🦈","🐳","🦖","🦕","🐲","🐉","🦜","🦉","🐝","🐞","🐢","🦔","🦦","🦥","🐿️","🐘","🦒","🦓","🦘","🐆","🐺","🐻‍❄️","🐵","🐴","🦭","🐶","🐱","🐭","🐹","🐻","🐮","🐷","🐽","🐗","🐔","🐣","🐤","🐦","🦆","🦅","🦇","🐴","🫎","🫏","🐝","🪲","🦗","🕷️","🦂","🐌","🐛","🪱","🐠","🐟","🐡","🦀","🦞","🦐","🦑","🐊","🐍","🦎","🐇","🦝","🦨","🦡","🦫","🦙","🐐","🦌","🐕","🐈","🐓","🦃","🦚","🦩","🕊️","🐏","🐑","🐃","🐂","🐄","🐎","🐖","🐒","🦍","🦧"],
    "Fantasie": ["🧚‍♀️","🧚‍♂️","🧜‍♀️","🧜‍♂️","🧙‍♀️","🧙‍♂️","🦸‍♀️","🦸‍♂️","👸","🤴","👑","🌈","⭐","🌙","☀️","🌻","🍄","🔮","🏰","🪄","🐈‍⬛","🪽","🌟","✨","🌠","🌌","☄️","🧞‍♀️","🧞‍♂️","🧝‍♀️","🧝‍♂️","🧛‍♀️","🧛‍♂️","🧟‍♀️","🧟‍♂️","🧌","👼","🎅","🤶","🧑‍🎄","🪅","🧿","🪬","🗿","🪐","🌛","🌜","🌝","🌞","💫","⚡","🔥","❄️","🌊","💎","🪩","🎇","🎆","🏯","🕌","⛩️","🛕","🗼","🗽","🎪","🎠","🎡","🎢"],
    "Menschen": ["👧","👦","🧒","👩‍🚀","👨‍🚀","👩‍🎨","👨‍🎨","👩‍🚒","👨‍🚒","👩‍🔬","👨‍🔬","👩‍🍳","👨‍🍳","👩‍🌾","👨‍🌾","🥷","🤠","🧑‍🎤","🧑‍🔧","🧑‍🏫","🧑‍⚕️","🧑‍🚀","🧑‍🎨","🧑‍🍳","🧑‍🌾","🧑‍🚒","🧑‍🔬","🧑‍💻","🧑‍🎓","🧑‍⚖️","🧑‍✈️","🧑‍🚀","🧑‍🎨","🧑‍🦰","🧑‍🦱","🧑‍🦳","🧑‍🦲","👱‍♀️","👱‍♂️","🙋‍♀️","🙋‍♂️","💁‍♀️","💁‍♂️","🙆‍♀️","🙆‍♂️","🧘‍♀️","🧘‍♂️","🏃‍♀️","🏃‍♂️","🚴‍♀️","🚴‍♂️","🏊‍♀️","🏊‍♂️","🤸‍♀️","🤸‍♂️","⛹️‍♀️","⛹️‍♂️","🤾‍♀️","🤾‍♂️","🧗‍♀️","🧗‍♂️","🏄‍♀️","🏄‍♂️","⛷️","🏂","🏋️‍♀️","🏋️‍♂️","🤹‍♀️","🤹‍♂️"],
    "Spaß": ["🤖","👻","👽","🎃","⛄","🌵","🍓","🍉","🍭","⚽","🏀","🎸","🎨","🚲","🚀","🛸","⛵","🎠","🧸","🎈","🎮","🛹","🎪","🎁","🚒","🚑","🚜","🏎️","🚂","🚁","🛶","🏝️","🏕️","🗺️","🧭","🎯","🎳","🪁","🛝","🛼","🛷","🥁","🎺","🎷","🎻","🪕","🎹","🎧","📚","🔭","🔬","🧪","🧩","♟️","🎲","🪄","🧙","🍕","🍔","🍟","🌮","🍦","🧁","🍪","🍩","🍫","🍿","🥨","🥞","🍎","🍒","🍍","🥕","🌽","🥦","🫐","🥝","🥥"]
  };

  const ACCENT_COLORS = ["#e96f82","#ef9f46","#f1c64d","#72ad67","#4fae98","#55a5d5","#7088dc","#9872d4","#d070ba","#a78061","#6e927d","#ef7d61","#66b4c2","#b189d1","#d58e63","#86a75c"];
  const WORLD_THEMES = [
    { id: "meadow", icon: "🌻", title: "Blumenwiese", description: "Wiese, Bäume und Tiere" },
    { id: "magic", icon: "🦄", title: "Zauberwald", description: "Pilze, Sterne und Magie" },
    { id: "ocean", icon: "🐬", title: "Meeresbucht", description: "Strand, Wasser und Delfine" },
    { id: "space", icon: "🚀", title: "Weltraum", description: "Planeten, Sterne und Raketen" },
    { id: "dino", icon: "🦕", title: "Dinotal", description: "Dinos, Urwald und Vulkan" },
    { id: "farm", icon: "🚜", title: "Bauernhof", description: "Tiere, Felder und Scheune" }
  ];
  const TASK_ICONS = ["✅","🛏️","🍽️","🧸","🧺","🪴","🧹","🗑️","🐾","📚","🚿","👕","🍳","🧽","🪥","🥤","🧼","🧻","🪣","🌿","🥕","🛒","📦","🎒","👟","🪟","🧑‍🍳","🧑‍🤝‍🧑","🧤","🪥","🧯","🧰","🧺","🫧","🪴","🚲","🏡","🧑‍🌾"];
  const GOAL_ICONS = ["🌱","🌟","❤️","🤝","😌","👂","💬","🧠","🎒","🪥","🧸","📚","🧹","😊","🫶","⏰","🌈","🪴","🧘","🎯"];
  const COMPETENCES = ["Selbstständigkeit","Zusammenarbeit","Ordnung","Hilfsbereitschaft","Verantwortung","Konzentration","Kommunikation","Kreativität","Selbstregulation","Rücksichtnahme"];

  const WORLD_ITEMS = [
    { id:"daisy", icon:"🌼", title:"Gänseblümchen", seedCost:5, category:"Pflanzen", description:"Eine kleine helle Blüte." },
    { id:"tulip", icon:"🌷", title:"Tulpenbeet", seedCost:9, category:"Pflanzen", description:"Bunte Blumen für die Wiese." },
    { id:"sunflower", icon:"🌻", title:"Sonnenblume", seedCost:12, category:"Pflanzen", description:"Das Zeichen der Mitmach-Welt." },
    { id:"rose", icon:"🌹", title:"Rosenbusch", seedCost:16, category:"Pflanzen", description:"Duftet in der ganzen Welt." },
    { id:"tree", icon:"🌳", title:"Großer Baum", seedCost:24, category:"Natur", description:"Spendet Schatten und wächst mit." },
    { id:"pine", icon:"🌲", title:"Tannenbaum", seedCost:22, category:"Natur", description:"Bleibt das ganze Jahr grün." },
    { id:"mushroom", icon:"🍄", title:"Pilzecke", seedCost:14, category:"Natur", description:"Ein geheimnisvoller Platz." },
    { id:"butterfly", icon:"🦋", title:"Schmetterling", seedCost:18, category:"Tiere", description:"Fliegt von Blüte zu Blüte." },
    { id:"squirrel", icon:"🐿️", title:"Eichhörnchen", seedCost:28, category:"Tiere", description:"Sammelt Vorräte im Baum." },
    { id:"bird", icon:"🐦", title:"Kleiner Vogel", seedCost:20, category:"Tiere", description:"Singt morgens in der Welt." },
    { id:"rabbit", icon:"🐇", title:"Häschen", seedCost:30, category:"Tiere", description:"Hoppelt über die Wiese." },
    { id:"fox", icon:"🦊", title:"Welt-Fuchs", seedCost:38, category:"Tiere", description:"Ein neugieriger Besucher." },
    { id:"bench", icon:"🪑", title:"Gartenbank", seedCost:20, category:"Deko", description:"Ein ruhiger Platz zum Ausruhen." },
    { id:"birdhouse", icon:"🏠", title:"Vogelhaus", seedCost:24, category:"Deko", description:"Ein Zuhause für kleine Vögel." },
    { id:"swing", icon:"🎠", title:"Schaukel", seedCost:32, category:"Deko", description:"Bewegung für die Welt." },
    { id:"lantern", icon:"🏮", title:"Laterne", seedCost:18, category:"Deko", description:"Leuchtet am Abend." },
    { id:"windmill", icon:"🎡", title:"Windrad", seedCost:25, category:"Deko", description:"Dreht sich im Wind." },
    { id:"fountain", icon:"⛲", title:"Brunnen", seedCost:42, category:"Bauwerke", description:"Plätschert leise vor sich hin." },
    { id:"tent", icon:"⛺", title:"Abenteuerzelt", seedCost:34, category:"Bauwerke", description:"Für besondere Geschichten." },
    { id:"telescope", icon:"🔭", title:"Fernrohr", seedCost:36, category:"Deko", description:"Damit lässt sich viel entdecken." },
    { id:"kite", icon:"🪁", title:"Drachen", seedCost:22, category:"Deko", description:"Fliegt hoch über der Welt." },
    { id:"boat", icon:"⛵", title:"Kleines Boot", seedCost:38, category:"Bauwerke", description:"Bereit für neue Abenteuer." },
    { id:"house", icon:"🏡", title:"Kleines Haus", seedCost:58, category:"Bauwerke", description:"Ein gemütlicher Mittelpunkt." },
    { id:"treehouse", icon:"🌳", title:"Baumhaus", seedCost:80, category:"Bauwerke", description:"Ein großer Meilenstein." },
    { id:"rainbow", icon:"🌈", title:"Regenbogen", starCost:2, category:"Sternenschatz", description:"Nur mit besonderen Sternen erhältlich." },
    { id:"unicorn", icon:"🦄", title:"Zauber-Einhorn", starCost:3, category:"Sternenschatz", description:"Ein sehr seltener Gast." },
    { id:"dragon", icon:"🐉", title:"Kleiner Drache", starCost:4, category:"Sternenschatz", description:"Bewacht die persönliche Welt." },
    { id:"castle", icon:"🏰", title:"Sternenschloss", starCost:5, category:"Sternenschatz", description:"Eine besondere Auszeichnung." }
  ];

  const GROUP_MILESTONES = [
    { points:3, icon:"🌼", title:"Gemeinschaftsbeet" },
    { points:6, icon:"🪑", title:"Gemeinsame Gartenbank" },
    { points:10, icon:"🌳", title:"Großer Gruppenbaum" },
    { points:16, icon:"⛲", title:"Brunnenplatz" },
    { points:24, icon:"🎠", title:"Gruppenschaukel" },
    { points:35, icon:"🏡", title:"Gemeinschaftshaus" },
    { points:50, icon:"🌈", title:"Regenbogen über der Gruppe" }
  ];

  const DEFAULT_WISHES = [
    { id:"story", icon:"📖", title:"Gute-Nacht-Geschichte aussuchen", cost:15, active:true, note:"Gemeinsam mit einem Erzieher einlösen." },
    { id:"game", icon:"🎲", title:"Ein Spiel aussuchen", cost:20, active:true, note:"Für eine gemeinsame Spielzeit." },
    { id:"awake", icon:"🌙", title:"15 Minuten länger wach bleiben", cost:40, active:true, note:"Nur wenn es an diesem Tag pädagogisch und organisatorisch passt." },
    { id:"movie", icon:"🍿", title:"Film mitbestimmen", cost:50, active:true, note:"Für den nächsten passenden Filmabend." },
    { id:"food", icon:"🍝", title:"Wunschessen mitbestimmen", cost:70, active:true, note:"Im Rahmen des Speiseplans gemeinsam abstimmen." }
  ];

  const DEFAULTS = {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    settings: {
      groupName: "Unsere Gruppe",
      pin: "2468",
      sound: true,
      haptics: true,
      reduceMotion: false,
      allowCoinSeedExchange: true,
      exchangeCoins: 10,
      exchangeSeeds: 5,
      communitySeedThreshold: 100,
      communityCoinThreshold: 250
    },
    children: [
      { id:"lucy", name:"Lucy", avatar:"🦄", accent:"#d070ba", theme:"magic", coins:24, seeds:7, stars:0, completed:4, inventory:["lantern"], active:true, createdAt:Date.now()-86400000*10 },
      { id:"noah", name:"Noah", avatar:"🐼", accent:"#55a5d5", theme:"meadow", coins:18, seeds:5, stars:0, completed:3, inventory:[], active:true, createdAt:Date.now()-86400000*9 },
      { id:"tius", name:"Tius", avatar:"🦁", accent:"#ef9f46", theme:"dino", coins:13, seeds:4, stars:0, completed:2, inventory:[], active:true, createdAt:Date.now()-86400000*8 },
      { id:"jari", name:"Jari", avatar:"🐸", accent:"#72ad67", theme:"farm", coins:16, seeds:6, stars:0, completed:3, inventory:[], active:true, createdAt:Date.now()-86400000*7 }
    ],
    tasks: [
      { id:"bed", title:"Bett machen", icon:"🛏️", category:"Zimmer", competence:"Selbstständigkeit", coins:5, seeds:2, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"" },
      { id:"table", title:"Tisch decken", icon:"🍽️", category:"Gemeinschaft", competence:"Verantwortung", coins:6, seeds:2, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"" },
      { id:"toys", title:"Spielsachen aufräumen", icon:"🧸", category:"Ordnung", competence:"Ordnung", coins:5, seeds:2, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"" },
      { id:"plants", title:"Blumen gießen", icon:"🪴", category:"Natur", competence:"Verantwortung", coins:4, seeds:3, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,3,5], instructions:"" },
      { id:"room", title:"Zimmer aufräumen", icon:"🧹", category:"Ordnung", competence:"Ordnung", coins:8, seeds:3, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"" },
      { id:"trash", title:"Müll rausbringen", icon:"🗑️", category:"Gemeinschaft", competence:"Hilfsbereitschaft", coins:6, seeds:2, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"" },
      { id:"animals", title:"Tiere versorgen", icon:"🐾", category:"Verantwortung", competence:"Verantwortung", coins:8, seeds:4, stars:0, requiredChildren:2, repeatMode:"shared", communityPoints:1, active:true, days:[0,1,2,3,4,5,6], instructions:"Gemeinsam schauen, was die Tiere brauchen." },
      { id:"yard", title:"Hof sauber machen", icon:"🧤", category:"Teamaufgabe", competence:"Zusammenarbeit", coins:10, seeds:5, stars:0, requiredChildren:3, repeatMode:"shared", communityPoints:2, active:true, days:[0,3,6], instructions:"Aufgaben untereinander fair aufteilen." },
      { id:"commonroom", title:"Gemeinschaftsraum aufräumen", icon:"🧑‍🤝‍🧑", category:"Teamaufgabe", competence:"Zusammenarbeit", coins:9, seeds:4, stars:0, requiredChildren:2, repeatMode:"shared", communityPoints:1, active:true, days:[0,2,4,6], instructions:"Gemeinsam beginnen und gemeinsam fertig werden." }
    ],
    personalGoals: [
      { id:"goal_lucy_friendly", childId:"lucy", icon:"❤️", title:"Ich achte auf einen freundlichen Umgang.", active:true, achievedCoins:5, achievedSeeds:4, achievedStars:0, partialCoins:2, partialSeeds:1, createdAt:Date.now() },
      { id:"goal_lucy_calm", childId:"lucy", icon:"😌", title:"Ich versuche ruhig zu bleiben, wenn etwas nicht klappt.", active:true, achievedCoins:5, achievedSeeds:4, achievedStars:1, partialCoins:2, partialSeeds:1, createdAt:Date.now() }
    ],
    claims: [],
    goalEvaluations: [],
    notifications: [],
    wishRequests: [],
    wishes: DEFAULT_WISHES,
    group: {
      communityPoints: 0,
      seedProgress: 0,
      coinProgress: 0,
      totalSeedsEarned: 0,
      totalCoinsEarned: 0,
      inventory: []
    },
    rounds: [],
    lastOrders: [],
    history: []
  };

  const ui = {
    screen: "home",
    navStack: [],
    childId: null,
    shopTab: "world",
    educatorUnlocked: false,
    educatorTab: "review",
    avatarCategory: "Tiere",
    editingChildId: null,
    editingTaskId: null,
    editingGoalId: null,
    editingWishId: null,
    roundDraft: null
  };

  const app = document.querySelector("#app");
  const screenTitle = document.querySelector("#screenTitle");
  const backButton = document.querySelector("#backButton");
  const homeButton = document.querySelector("#homeButton");
  const modalRoot = document.querySelector("#modalRoot");
  const toast = document.querySelector("#toast");
  const confettiRoot = document.querySelector("#confettiRoot");
  const updateBanner = document.querySelector("#updateBanner");

  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function" ? globalThis.crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const todayKey = () => localDateKey(new Date());
  const localDateKey = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,"0");
    const day = String(date.getDate()).padStart(2,"0");
    return `${year}-${month}-${day}`;
  };
  const formatDate = key => new Intl.DateTimeFormat("de-DE", { weekday:"long", day:"2-digit", month:"2-digit", year:"numeric" }).format(new Date(`${key}T12:00:00`));
  const formatDateTime = timestamp => new Intl.DateTimeFormat("de-DE", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }).format(new Date(timestamp));
  const dayIndex = () => new Date().getDay();

  function readJson(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  function normalizeData(raw) {
    const base = clone(DEFAULTS);
    if (!raw || typeof raw !== "object") return base;

    const migratedGroup = raw.group || {};
    const merged = {
      ...base,
      ...raw,
      schemaVersion: SCHEMA_VERSION,
      appVersion: APP_VERSION,
      settings: { ...base.settings, ...(raw.settings || {}) },
      group: {
        ...base.group,
        ...migratedGroup,
        communityPoints: Number(migratedGroup.communityPoints ?? migratedGroup.points ?? 0),
        inventory: Array.isArray(migratedGroup.inventory) ? migratedGroup.inventory : []
      },
      children: Array.isArray(raw.children) ? raw.children : base.children,
      tasks: Array.isArray(raw.tasks) ? raw.tasks : base.tasks,
      personalGoals: Array.isArray(raw.personalGoals) ? raw.personalGoals : [],
      claims: Array.isArray(raw.claims) ? raw.claims : [],
      goalEvaluations: Array.isArray(raw.goalEvaluations) ? raw.goalEvaluations : [],
      notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
      wishRequests: Array.isArray(raw.wishRequests) ? raw.wishRequests : [],
      wishes: Array.isArray(raw.wishes) && raw.wishes.length ? raw.wishes : clone(DEFAULT_WISHES),
      rounds: Array.isArray(raw.rounds) ? raw.rounds : [],
      lastOrders: Array.isArray(raw.lastOrders) ? raw.lastOrders : [],
      history: Array.isArray(raw.history) ? raw.history : []
    };

    merged.children = merged.children.map((child, index) => ({
      id: child.id || uid(),
      name: child.name || `Kind ${index+1}`,
      avatar: child.avatar || "🙂",
      accent: child.accent || child.color || ACCENT_COLORS[index % ACCENT_COLORS.length],
      theme: WORLD_THEMES.some(theme => theme.id === child.theme) ? child.theme : WORLD_THEMES[index % WORLD_THEMES.length].id,
      coins: Math.max(0, Number(child.coins || 0)),
      seeds: Math.max(0, Number(child.seeds || 0)),
      stars: Math.max(0, Number(child.stars || 0)),
      completed: Math.max(0, Number(child.completed || 0)),
      inventory: Array.isArray(child.inventory) ? child.inventory : [],
      active: child.active !== false,
      deletedAt: child.deletedAt ? Number(child.deletedAt) : 0,
      worldName: child.worldName || `${child.name || `Kind ${index+1}`}s Welt`,
      companion: child.companion || "🐾",
      onboardingPending: child.onboardingPending === true,
      createdAt: Number(child.createdAt || Date.now()),
      lastFirstAt: Number(child.lastFirstAt || 0),
      birthMonth: clamp(child.birthMonth ?? 0, 0, 12),
      birthYear: (() => {
        const year = Number(child.birthYear || 0);
        const currentYear = new Date().getFullYear();
        return Number.isInteger(year) && year >= 2000 && year <= currentYear ? year : 0;
      })()
    }));

    merged.tasks = merged.tasks.map(task => ({
      id: task.id || uid(),
      title: task.title || "Aufgabe",
      icon: task.icon || "✅",
      category: task.category || "Alltag",
      competence: task.competence || "Selbstständigkeit",
      coins: clamp(task.coins ?? task.reward ?? 5, 0, 100),
      seeds: clamp(task.seeds ?? 1, 0, 100),
      stars: clamp(task.stars ?? 0, 0, 5),
      requiredChildren: clamp(task.requiredChildren ?? task.capacity ?? 1, 1, 8),
      repeatMode: ["perChild","shared"].includes(task.repeatMode)
        ? task.repeatMode
        : (((task.requiredChildren ?? task.capacity ?? 1) > 1 || /tisch|müll|blumen|tiere|gemeinschaft|hof|geschirr|wäsche/i.test(task.title || "")) ? "shared" : "perChild"),
      communityPoints: clamp(task.communityPoints ?? ((task.capacity || 1) > 1 ? 1 : 0), 0, 10),
      active: task.active !== false,
      days: Array.isArray(task.days) && task.days.length ? task.days.map(Number) : [0,1,2,3,4,5,6],
      instructions: task.instructions || "",
      minAgeSolo: clamp(task.minAgeSolo ?? 0, 0, 18),
      allowYoungerWithOlder: Boolean(task.allowYoungerWithOlder),
      minAgeWithOlder: clamp(task.minAgeWithOlder ?? 0, 0, 18),
      olderPartnerMinAge: clamp(task.olderPartnerMinAge ?? task.minAgeSolo ?? 0, 0, 18)
    }));

    merged.personalGoals = merged.personalGoals.map(goal => ({
      id: goal.id || uid(),
      childId: goal.childId,
      icon: goal.icon || "🌱",
      title: goal.title || "Mein persönliches Tagesziel",
      active: goal.active !== false,
      achievedCoins: clamp(goal.achievedCoins ?? 5, 0, 100),
      achievedSeeds: clamp(goal.achievedSeeds ?? 3, 0, 100),
      achievedStars: clamp(goal.achievedStars ?? 0, 0, 5),
      partialCoins: clamp(goal.partialCoins ?? 2, 0, 100),
      partialSeeds: clamp(goal.partialSeeds ?? 1, 0, 100),
      createdAt: Number(goal.createdAt || Date.now())
    })).filter(goal => merged.children.some(child => child.id === goal.childId));

    merged.claims = merged.claims.map(claim => ({
      id: claim.id || uid(),
      taskId: claim.taskId,
      childIds: Array.isArray(claim.childIds) ? claim.childIds : (claim.childId ? [claim.childId] : []),
      date: claim.date || todayKey(),
      source: claim.source || "solo",
      status: ["reserved","reported","approved","declined"].includes(claim.status) ? claim.status : "reserved",
      createdAt: Number(claim.createdAt || Date.now()),
      reportedAt: Number(claim.reportedAt || 0),
      reviewedAt: Number(claim.reviewedAt || 0),
      reviewNote: claim.reviewNote || "",
      rewardsApplied: Boolean(claim.rewardsApplied),
      requiredChildrenOverride: clamp(claim.requiredChildrenOverride ?? 0, 0, 8),
      ageSupportRequired: Boolean(claim.ageSupportRequired),
      olderPartnerMinAge: clamp(claim.olderPartnerMinAge ?? 0, 0, 18)
    })).filter(claim => merged.tasks.some(task => task.id === claim.taskId) && claim.childIds.length);

    // Alte v1.1-Runde als noch offene Aufgaben übernehmen, sofern vorhanden.
    if (raw.round && raw.round.assignments) {
      Object.values(raw.round.assignments).forEach(assignment => {
        const childId = assignment.childId;
        const taskId = assignment.taskId;
        if (!childId || !taskId) return;
        if (merged.claims.some(claim => claim.taskId === taskId && claim.childIds.includes(childId) && claim.date === (raw.round.day || todayKey()))) return;
        merged.claims.push({
          id: uid(), taskId, childIds:[childId], date:raw.round.day || todayKey(), source:"round",
          status:assignment.status === "done" ? "reported" : "reserved", createdAt:raw.round.date || Date.now(),
          reportedAt:assignment.status === "done" ? Date.now() : 0, reviewedAt:0, reviewNote:"", rewardsApplied:false
        });
      });
    }

    merged.wishes = merged.wishes.map(wish => ({
      id: wish.id || uid(), icon:wish.icon || "🎁", title:wish.title || "Wunsch", cost:clamp(wish.cost ?? 20,1,999), active:wish.active !== false, note:wish.note || ""
    }));

    return merged;
  }

  function migrateLegacyData() {
    const oldChildren = readJson("mw_children");
    const oldTasks = readJson("mw_tasks");
    const oldPin = localStorage.getItem("mw_pin");
    if (!Array.isArray(oldChildren) && !Array.isArray(oldTasks) && !oldPin) return null;
    const migrated = clone(DEFAULTS);
    if (Array.isArray(oldChildren)) migrated.children = oldChildren;
    if (Array.isArray(oldTasks)) migrated.tasks = oldTasks;
    if (oldPin) migrated.settings.pin = oldPin;
    return migrated;
  }

  function loadData() {
    let stored = readJson(STORAGE_KEY);
    if (!stored) stored = readJson(BACKUP_KEY);
    if (!stored) stored = migrateLegacyData();
    if (stored && Number(stored.schemaVersion || 1) < 2 && !localStorage.getItem(PRE_V2_BACKUP_KEY)) {
      try { localStorage.setItem(PRE_V2_BACKUP_KEY, JSON.stringify(stored)); } catch {}
    }
    return normalizeData(stored || DEFAULTS);
  }

  let data = loadData();
  let saveCounter = 0;
  let lastSavedSerialized = localStorage.getItem(STORAGE_KEY) || "";
  const saveListeners = new Set();

  function saveData({ snapshot = false, notify = true } = {}) {
    data.schemaVersion = SCHEMA_VERSION;
    data.appVersion = APP_VERSION;
    const serialized = JSON.stringify(data);
    const changed = serialized !== lastSavedSerialized;
    try {
      // Immer lokal sichern. Synchronisations-Listener werden aber nur bei echten
      // Inhaltsänderungen informiert, damit ein schließendes Zweitgerät keinen
      // älteren unveränderten Stand erneut überträgt.
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_KEY, serialized);
      const verified = localStorage.getItem(STORAGE_KEY);
      if (verified !== serialized) throw new Error("Speicherprüfung fehlgeschlagen");
      lastSavedSerialized = serialized;
      if (changed) {
        saveCounter += 1;
        if (snapshot || saveCounter % 12 === 0) saveSnapshot(serialized);
      }
      applyPreferences();
      if (notify && changed) {
        saveListeners.forEach(listener => {
          try { listener(clone(data)); } catch (error) { console.error("Mitmach-Welt: Speicher-Listener fehlgeschlagen", error); }
        });
      }
      return true;
    } catch (error) {
      console.error("Mitmach-Welt: Speichern fehlgeschlagen", error);
      showToast("Speichern war nicht möglich. Bitte Browser-Speicher prüfen.");
      applyPreferences();
      return false;
    }
  }

  function saveSnapshot(serialized = JSON.stringify(data)) {
    try {
      const ring = readJson(BACKUP_RING_KEY) || [];
      ring.unshift({ createdAt:Date.now(), appVersion:APP_VERSION, data:JSON.parse(serialized) });
      localStorage.setItem(BACKUP_RING_KEY, JSON.stringify(ring.slice(0,5)));
    } catch {}
  }

  function applyPreferences() {
    document.body.classList.toggle("reduce-motion", Boolean(data.settings.reduceMotion));
  }

  function childById(id) { return data.children.find(child => child.id === id); }
  function taskById(id) { return data.tasks.find(task => task.id === id); }
  function goalById(id) { return data.personalGoals.find(goal => goal.id === id); }
  function wishById(id) { return data.wishes.find(wish => wish.id === id); }
  function activeChildren() { return data.children.filter(child => child.active !== false && !child.deletedAt); }
  function tasksForToday() { return data.tasks.filter(task => task.active && task.days.includes(dayIndex())); }
  function activeGoalsForChild(childId) { return data.personalGoals.filter(goal => goal.childId === childId && goal.active); }
  function claimsForChild(childId, date = null) { return data.claims.filter(claim => claim.childIds.includes(childId) && (!date || claim.date === date)); }
  function unseenNotifications(childId) { return data.notifications.filter(note => note.childId === childId && !note.seen); }
  function itemById(id) { return WORLD_ITEMS.find(item => item.id === id); }

  function childAge(child, referenceDate = new Date()) {
    const month = Number(child?.birthMonth || 0);
    const year = Number(child?.birthYear || 0);
    if (!month || !year) return null;
    let age = referenceDate.getFullYear() - year;
    if ((referenceDate.getMonth() + 1) < month) age -= 1;
    return Math.max(0, age);
  }

  function childAgeLabel(child) {
    const age = childAge(child);
    return age === null ? "Alter noch nicht eingetragen" : `${age} Jahre`;
  }

  function childBirthLabel(child) {
    const month = Number(child?.birthMonth || 0);
    const year = Number(child?.birthYear || 0);
    return month && year ? `${MONTH_NAMES[month]} ${year}` : "Geburtsmonat und -jahr fehlen";
  }

  function taskAgeRuleLabel(task) {
    const solo = Number(task?.minAgeSolo || 0);
    if (!solo) return "Für jedes Alter";
    if (task.allowYoungerWithOlder) {
      const younger = Number(task.minAgeWithOlder || 0);
      const older = Number(task.olderPartnerMinAge || solo);
      return `Allein ab ${solo} · mit älterem Kind ab ${younger} (Begleitkind ab ${older})`;
    }
    return `Allein ab ${solo} Jahren`;
  }

  function taskAgeEligibility(child, task) {
    const minSolo = Number(task?.minAgeSolo || 0);
    if (!minSolo) return { mode:"solo", age:childAge(child), label:"Altersgerecht" };
    const age = childAge(child);
    if (age === null) return { mode:"unknown", age:null, label:"Geburtsdaten fehlen" };
    if (age >= minSolo) return { mode:"solo", age, label:`Allein möglich ab ${minSolo}` };
    const minWithOlder = Number(task.minAgeWithOlder || 0);
    if (task.allowYoungerWithOlder && age >= minWithOlder) {
      return {
        mode:"supported",
        age,
        label:"Mit älterem Kind möglich",
        olderPartnerMinAge:Number(task.olderPartnerMinAge || minSolo)
      };
    }
    return { mode:"blocked", age, label:`Erst ab ${minSolo} Jahren` };
  }

  function claimRequiredChildren(claim, task) {
    return Math.max(1, Number(task?.requiredChildren || 1), Number(claim?.requiredChildrenOverride || 0));
  }

  function claimHasOlderPartner(claim, task) {
    if (!claim?.ageSupportRequired) return true;
    const minimum = Number(claim.olderPartnerMinAge || task?.olderPartnerMinAge || task?.minAgeSolo || 0);
    return claim.childIds.some(id => {
      const age = childAge(childById(id));
      return age !== null && age >= minimum;
    });
  }

  function claimReadiness(claim, task) {
    const required = claimRequiredChildren(claim, task);
    const missingChildren = Math.max(0, required - claim.childIds.length);
    const missingOlderPartner = Boolean(claim.ageSupportRequired && !claimHasOlderPartner(claim, task));
    return {
      required,
      missingChildren,
      missingOlderPartner,
      ready:missingChildren === 0 && !missingOlderPartner
    };
  }

  saveData();

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function celebrate(count = 20) {
    if (data.settings.reduceMotion) return;
    const pieces = ["🌻","✨","🌱","⭐","🪙","🌈"];
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * .6}s`;
      piece.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
      confettiRoot.appendChild(piece);
      setTimeout(() => piece.remove(), 3400);
    }
    if (data.settings.haptics && navigator.vibrate) navigator.vibrate([35,40,35]);
  }

  function openModal(title, body, { wide = false } = {}) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal">
        <section class="modal${wide ? " modal-wide" : ""}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}" data-modal-stop>
          <div class="modal-head">
            <h2>${escapeHtml(title)}</h2>
            <button class="modal-close" type="button" data-action="close-modal" aria-label="Schließen">×</button>
          </div>
          <div class="modal-body">${body}</div>
        </section>
      </div>`;
  }

  function closeModal() { modalRoot.innerHTML = ""; }

  function confirmModal({ title, message, confirmText = "Bestätigen", confirmAction, confirmClass = "primary-button", payload = {} }) {
    const payloadAttrs = Object.entries(payload).map(([key,value]) => `data-${key}="${escapeHtml(value)}"`).join(" ");
    openModal(title, `
      <p>${message}</p>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button>
        <button class="${confirmClass}" type="button" data-action="${confirmAction}" ${payloadAttrs}>${escapeHtml(confirmText)}</button>
      </div>`);
  }

  function greetingText() {
    const hour = new Date().getHours();
    const options = hour < 11
      ? ["Schön, dass du da bist!", "Da bist du ja!", "Deine Welt freut sich auf dich."]
      : hour < 17
        ? ["Willkommen zurück!", "Schön, dass du wieder da bist!", "In deiner Welt gibt es etwas zu entdecken."]
        : hour < 21
          ? ["Schön, dass du noch einmal vorbeischaust!", "Da bist du wieder!", "Deine Welt hat auf dich gewartet."]
          : ["Schön, dass du noch einmal da bist!", "Ein kleiner Blick in deine Welt?", "Da bist du ja noch einmal!"];
    return options[Math.floor(Math.random() * options.length)];
  }

  function screenLabel(screen) {
    return ({
      home:"Mitmach-Welt", child:"Kinderbereich", tasks:"Aufgaben", missions:"Tagesmissionen", world:"Meine Welt", shop:"Mein Laden",
      achievements:"Meine Erfolge", group:"Gruppenwelt", roundSetup:"Mitmach-Runde", roundPlay:"Aufgabenwahl", roundSummary:"Mitmach-Runde", educator:"Erzieherbereich"
    })[screen] || "Mitmach-Welt";
  }

  function navigate(screen, options = {}) {
    if (options.push !== false && ui.screen !== screen) ui.navStack.push({ screen:ui.screen, childId:ui.childId });
    ui.screen = screen;
    if (Object.prototype.hasOwnProperty.call(options, "childId")) ui.childId = options.childId;
    render();
  }

  function goBack() {
    const previous = ui.navStack.pop();
    if (!previous) return navigate("home", { push:false, childId:null });
    ui.screen = previous.screen;
    ui.childId = previous.childId;
    render();
  }

  function goHome() {
    ui.screen = "home";
    ui.childId = null;
    ui.navStack = [];
    render();
  }

  function setNavActive() {
    document.querySelectorAll(".bottom-nav button").forEach(button => {
      const nav = button.dataset.nav;
      const active = (nav === "home" && ["home","child","tasks","missions","world","shop","achievements","roundSetup","roundPlay","roundSummary"].includes(ui.screen))
        || (nav === "group" && ui.screen === "group")
        || (nav === "educator" && ui.screen === "educator");
      button.classList.toggle("active", active);
    });
  }

  function render() {
    screenTitle.textContent = screenLabel(ui.screen);
    backButton.hidden = ui.screen === "home";
    homeButton.hidden = ui.screen === "home";
    setNavActive();

    const renderers = {
      home: renderHome,
      child: renderChildHub,
      tasks: renderChildTasks,
      missions: renderChildMissions,
      world: renderChildWorld,
      shop: renderChildShop,
      achievements: renderAchievements,
      group: renderGroupWorld,
      roundSetup: renderRoundSetup,
      roundPlay: renderRoundPlay,
      roundSummary: renderRoundSummary,
      educator: renderEducator
    };
    const renderer = renderers[ui.screen] || renderHome;
    app.innerHTML = renderer();
    window.scrollTo({ top:0, behavior:data.settings.reduceMotion ? "auto" : "smooth" });

    if (ui.screen === "child" && ui.childId) {
      setTimeout(() => maybeShowNotifications(ui.childId), 100);
    }
  }

  function currencyStats(child) {
    return `
      <div class="balance-chip">🪙 ${child.coins} Münzen</div>
      <div class="balance-chip">🌱 ${child.seeds} Samen</div>
      <div class="balance-chip">⭐ ${child.stars} Sterne</div>`;
  }

  function renderHome() {
    const children = activeChildren();
    const reportedCount = data.claims.filter(claim => claim.status === "reported").length;
    const missionCount = data.personalGoals.filter(goal => goal.active).length;
    return `
      <section class="hero">
        <p class="hero-kicker">${escapeHtml(data.settings.groupName)}</p>
        <h2>Wer möchte heute mitmachen?</h2>
        <p>Ein Kind kann direkt seinen Namen auswählen. Für mehrere Kinder startet ihr oben die gemeinsame Mitmach-Runde mit fairer Auslosung.</p>
      </section>

      <button class="round-launch" type="button" data-action="open-round">
        <span class="big-icon">🎡</span>
        <span>
          <h3>Mitmach-Runde für mehrere Kinder</h3>
          <p>Kinder auswählen, Reihenfolge auslosen und nacheinander Aufgaben aussuchen.</p>
        </span>
        <span class="arrow">›</span>
      </button>

      <section class="section">
        <div class="section-heading">
          <div><h2>Unsere Kinder</h2><p>Einfach den eigenen Avatar antippen.</p></div>
        </div>
        ${children.length ? `<div class="child-grid">${children.map(child => {
          const unseen = unseenNotifications(child.id).length;
          const waiting = claimsForChild(child.id, todayKey()).filter(claim => claim.status === "reported").length;
          return `
            <button class="child-card" type="button" style="--accent:${child.accent}" data-action="open-child" data-child-id="${child.id}">
              ${unseen ? `<span class="notification-dot">${unseen}</span>` : ""}
              <span class="child-avatar">${child.avatar}</span>
              <h3>${escapeHtml(child.name)}</h3>
              <small>${waiting ? `${waiting} Aufgabe${waiting === 1 ? "" : "n"} wartet${waiting === 1 ? "" : "en"}` : `${childAge(child) === null ? "Alter offen" : childAgeLabel(child)} · Meine Welt`}</small>
            </button>`;
        }).join("")}</div>` : `
          <div class="empty-state"><span class="emoji">🌱</span><h3>Noch keine Kinder angelegt</h3><p>Im Erzieherbereich können Kinder mit eigenen Avataren angelegt werden.</p></div>`}
      </section>

      <section class="section">
        <div class="admin-grid">
          <button class="card" type="button" data-action="nav-group" style="text-align:left;cursor:pointer;border:0">
            <h3>🌍 Gruppenwelt</h3>
            <p class="muted">${data.group.communityPoints} Gemeinschaftspunkte · gemeinsam wächst etwas Neues.</p>
          </button>
          <button class="card" type="button" data-action="nav-educator" style="text-align:left;cursor:pointer;border:0">
            <h3>🔒 Erzieherbereich</h3>
            <p class="muted">${reportedCount} offene Bestätigung${reportedCount === 1 ? "" : "en"} · ${missionCount} aktive Tagesmission${missionCount === 1 ? "" : "en"}.</p>
          </button>
        </div>
      </section>`;
  }

  function renderChildHub() {
    const child = childById(ui.childId);
    if (!child) return renderMissingChild();
    const openClaims = claimsForChild(child.id, todayKey()).filter(claim => ["reserved","reported"].includes(claim.status));
    const goals = activeGoalsForChild(child.id);
    return `
      <section class="profile-banner" style="--accent:${child.accent}">
        <div class="profile-avatar">${child.avatar}</div>
        <div>
          <h2>${escapeHtml(greetingText())} ${escapeHtml(child.name)}</h2>
          <p>${childAge(child) === null ? "Was möchtest du machen?" : `${childAgeLabel(child)} · Was möchtest du machen?`}</p>
          <div class="balance-strip">${currencyStats(child)}</div>
        </div>
      </section>

      <section class="profile-menu">
        <button class="profile-action main" type="button" data-action="child-tasks">
          <span class="icon">📋</span><span><h3>Aufgaben erledigen</h3><p>Aufgaben aussuchen, erledigt melden und direkt weitermachen.</p></span>
          ${openClaims.length ? `<span class="chip pending">${openClaims.length} heute ausgewählt</span>` : ""}
        </button>
        <button class="profile-action goals" type="button" data-action="child-missions">
          <span class="icon">🌱</span><span><h3>Meine Tagesmissionen</h3><p>${goals.length ? `${goals.length} persönliche Mission${goals.length === 1 ? "" : "en"} für heute.` : "Heute ist keine persönliche Mission eingetragen."}</p></span>
        </button>
        <button class="profile-action world" type="button" data-action="child-world">
          <span class="icon">🌍</span><span><h3>Meine Welt</h3><p>Schauen, was gewachsen und eingezogen ist.</p></span>
        </button>
        <button class="profile-action shop" type="button" data-action="child-shop">
          <span class="icon">🛍️</span><span><h3>Mein Laden</h3><p>Samen für die Welt, Münzen für Wünsche und Sterne für Seltenes.</p></span>
        </button>
        <button class="profile-action success" type="button" data-action="child-achievements">
          <span class="icon">🏅</span><span><h3>Meine Erfolge</h3><p>Entdecke deine Meilensteine – ohne Vergleich mit anderen.</p></span>
        </button>
      </section>`;
  }

  function renderMissingChild() {
    return `<div class="empty-state"><span class="emoji">🌻</span><h3>Dieses Kinderprofil ist nicht mehr vorhanden.</h3><button class="primary-button" data-action="go-home">Zur Startseite</button></div>`;
  }

  function findJoinableClaim(task, childId, date = todayKey(), eligibility = taskAgeEligibility(childById(childId), task)) {
    const child = childById(childId);
    const childAgeValue = childAge(child);
    return data.claims.find(claim => {
      if (claim.taskId !== task.id || claim.date !== date || claim.status !== "reserved" || claim.childIds.includes(childId)) return false;
      const readiness = claimReadiness(claim, task);

      if (eligibility.mode === "supported") {
        const olderMinimum = Number(eligibility.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo || 0);
        const hasOlder = claim.childIds.some(id => {
          const age = childAge(childById(id));
          return age !== null && age >= olderMinimum;
        });
        return hasOlder || readiness.missingChildren > 0 || claim.ageSupportRequired;
      }

      if (claim.ageSupportRequired) {
        const olderMinimum = Number(claim.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo || 0);
        if (childAgeValue !== null && childAgeValue >= olderMinimum && !claimHasOlderPartner(claim, task)) return true;
      }

      return readiness.missingChildren > 0;
    });
  }

  function hasChildDoneOrJoinedTaskToday(childId, taskId) {
    return data.claims.some(claim => claim.date === todayKey() && claim.taskId === taskId && claim.childIds.includes(childId) && ["reserved","reported","approved"].includes(claim.status));
  }

  function taskReservationState(childId, task, date = todayKey()) {
    const child = childById(childId);
    const eligibility = taskAgeEligibility(child, task);
    if (eligibility.mode === "unknown") return { canReserve:false, label:"Geburtsdaten fehlen", joinable:null, eligibility };
    if (eligibility.mode === "blocked") return { canReserve:false, label:eligibility.label, joinable:null, eligibility };
    if (hasChildDoneOrJoinedTaskToday(childId, task.id)) return { canReserve:false, label:"Heute gewählt", joinable:null, eligibility };

    const joinable = findJoinableClaim(task, childId, date, eligibility);
    if (joinable) {
      return {
        canReserve:true,
        label:eligibility.mode === "supported" ? "Mit älterem Kind mitmachen" : "Team beitreten",
        joinable,
        eligibility
      };
    }

    if (task.repeatMode === "shared") {
      const activeClaims = data.claims.filter(claim => claim.date === date && claim.taskId === task.id && ["reserved","reported","approved"].includes(claim.status));
      if (activeClaims.length) return { canReserve:false, label:"Bereits vergeben", joinable:null, eligibility };
    }

    return {
      canReserve:true,
      label:eligibility.mode === "supported" ? "Mit älterem Kind auswählen" : "Auswählen",
      joinable:null,
      eligibility
    };
  }

  function reserveTask(childId, taskId, source = "solo") {
    const child = childById(childId);
    const task = taskById(taskId);
    if (!child || !task || !task.active) return { ok:false, message:"Aufgabe nicht gefunden." };
    const reservation = taskReservationState(childId, task);
    if (!reservation.canReserve) {
      if (reservation.eligibility?.mode === "unknown") return { ok:false, message:"Bitte zuerst im Erzieherbereich Geburtsmonat und Geburtsjahr eintragen." };
      if (reservation.eligibility?.mode === "blocked") return { ok:false, message:"Diese Aufgabe ist für dein Alter noch nicht freigeschaltet." };
      return { ok:false, message:reservation.label === "Bereits vergeben" ? "Diese Gruppenaufgabe wurde heute bereits vergeben." : "Diese Aufgabe hast du heute schon ausgewählt." };
    }

    const eligibility = reservation.eligibility;
    let claim = reservation.joinable;
    if (claim) {
      claim.childIds.push(childId);
      claim.source = claim.source === "round" || source === "round" ? "round" : "solo";
      if (eligibility.mode === "supported") {
        claim.ageSupportRequired = true;
        claim.olderPartnerMinAge = Number(eligibility.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo || 0);
        claim.requiredChildrenOverride = Math.max(claimRequiredChildren(claim, task), 2, claim.childIds.length);
      }
    } else {
      const needsOlder = eligibility.mode === "supported";
      claim = {
        id:uid(), taskId, childIds:[childId], date:todayKey(), source, status:"reserved",
        createdAt:Date.now(), reportedAt:0, reviewedAt:0, reviewNote:"", rewardsApplied:false,
        requiredChildrenOverride:needsOlder ? Math.max(2, task.requiredChildren) : 0,
        ageSupportRequired:needsOlder,
        olderPartnerMinAge:needsOlder ? Number(eligibility.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo || 0) : 0
      };
      data.claims.push(claim);
    }
    data.history.push({ id:uid(), type:"task_reserved", childId, taskId, claimId:claim.id, timestamp:Date.now() });
    saveData();
    return {
      ok:true,
      claim,
      message:eligibility.mode === "supported"
        ? "Aufgabe ausgewählt. Jetzt wird noch ein älteres Kind gebraucht."
        : claimRequiredChildren(claim, task) > 1 ? "Du bist bei der Teamaufgabe dabei!" : "Aufgabe wurde ausgewählt."
    };
  }

  function leaveClaim(childId, claimId) {
    const claim = data.claims.find(item => item.id === claimId);
    if (!claim || claim.status !== "reserved" || !claim.childIds.includes(childId)) return;
    claim.childIds = claim.childIds.filter(id => id !== childId);
    if (!claim.childIds.length) {
      data.claims = data.claims.filter(item => item.id !== claimId);
    } else if (claim.ageSupportRequired) {
      const task = taskById(claim.taskId);
      const supportedStillPresent = claim.childIds.some(id => taskAgeEligibility(childById(id), task).mode === "supported");
      if (!supportedStillPresent) {
        claim.ageSupportRequired = false;
        claim.olderPartnerMinAge = 0;
        claim.requiredChildrenOverride = 0;
      }
    }
    saveData();
  }

  function reportClaim(childId, claimId) {
    const claim = data.claims.find(item => item.id === claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task || claim.status !== "reserved" || !claim.childIds.includes(childId)) return { ok:false, message:"Aufgabe konnte nicht gemeldet werden." };
    const readiness = claimReadiness(claim, task);
    if (readiness.missingOlderPartner) return { ok:false, message:`Für diese Aufgabe wird noch ein älteres Kind ab ${claim.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo} Jahren gebraucht.` };
    if (readiness.missingChildren) return { ok:false, message:`Für diese Aufgabe werden noch ${readiness.missingChildren} Kind${readiness.missingChildren === 1 ? "" : "er"} gebraucht.` };
    claim.status = "reported";
    claim.reportedAt = Date.now();
    data.history.push({ id:uid(), type:"task_reported", claimId, taskId:task.id, childIds:[...claim.childIds], timestamp:Date.now() });
    saveData({ snapshot:true });
    return { ok:true, message:"Geschafft gemeldet! Du kannst direkt eine weitere Aufgabe wählen." };
  }

  function renderChildTasks() {
    const child = childById(ui.childId);
    if (!child) return renderMissingChild();
    const todaysClaims = claimsForChild(child.id, todayKey()).filter(claim => ["reserved","reported"].includes(claim.status));
    const allToday = tasksForToday();
    const visibleTasks = allToday
      .map(task => ({ task, eligibility:taskAgeEligibility(child, task) }))
      .filter(item => ["solo","supported"].includes(item.eligibility.mode))
      .sort((a,b) => {
        const rank = { solo:0, supported:1 };
        return rank[a.eligibility.mode] - rank[b.eligibility.mode]
          || Number(a.task.minAgeSolo || 0) - Number(b.task.minAgeSolo || 0)
          || a.task.title.localeCompare(b.task.title, "de");
      });
    const hiddenAgeCount = allToday.length - visibleTasks.length;

    const selectedHtml = todaysClaims.length ? todaysClaims.map(claim => {
      const task = taskById(claim.taskId);
      if (!task) return "";
      const joined = claim.childIds.map(childById).filter(Boolean);
      const readiness = claimReadiness(claim, task);
      const waitingLabel = readiness.missingOlderPartner
        ? `Noch ein älteres Kind ab ${claim.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo} Jahren`
        : readiness.missingChildren
          ? `Noch ${readiness.missingChildren} ${readiness.missingChildren === 1 ? "Kind" : "Kinder"}`
          : "Team vollständig";
      return `
        <article class="task-card">
          <div class="task-card-head">
            <span class="task-icon">${task.icon}</span>
            <div>
              <h3>${escapeHtml(task.title)}</h3>
              <div class="task-meta">
                ${readiness.required > 1 ? `<span class="chip team">👥 ${claim.childIds.length}/${readiness.required}</span>` : ""}
                ${claim.ageSupportRequired ? `<span class="chip warning">🧒 + 🧑 älteres Kind</span>` : ""}
                <span class="chip">🪙 ${task.coins}</span><span class="chip">🌱 ${task.seeds}</span>${task.stars ? `<span class="chip">⭐ ${task.stars}</span>` : ""}
              </div>
            </div>
            <span class="chip ${claim.status === "reported" ? "pending" : "warning"}">${claim.status === "reported" ? "Wartet auf Abendrunde" : "Ausgewählt"}</span>
          </div>
          ${readiness.required > 1 || claim.ageSupportRequired ? `
            <div style="margin-top:12px">
              <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, Math.round(claim.childIds.length/readiness.required*100))}%"></div></div>
              <p class="tiny muted">Dabei: ${joined.map(member => `${member.avatar} ${escapeHtml(member.name)}`).join(", ")} · ${waitingLabel}</p>
            </div>` : ""}
          ${task.instructions ? `<p class="muted tiny">${escapeHtml(task.instructions)}</p>` : ""}
          <div class="task-card-actions">
            ${claim.status === "reserved" ? `
              <button class="success-button small-button" type="button" data-action="report-claim" data-child-id="${child.id}" data-claim-id="${claim.id}" ${readiness.ready ? "" : "disabled"}>✅ ${readiness.ready ? "Erledigt melden" : waitingLabel}</button>
              <button class="ghost-button small-button" type="button" data-action="leave-claim" data-child-id="${child.id}" data-claim-id="${claim.id}">Doch nicht</button>` : `
              <span class="callout success"><p>Die Aufgabe ist gemeldet. Ein Erzieher schaut später in Ruhe darauf.</p></span>`}
          </div>
        </article>`;
    }).join("") : `<div class="empty-state"><span class="emoji">👐</span><h3>Noch keine Aufgabe ausgewählt</h3><p>Du kannst heute mehrere kleine Aufgaben nacheinander übernehmen.</p></div>`;

    const availableHtml = visibleTasks.length ? visibleTasks.map(({ task, eligibility }) => {
      const reservation = taskReservationState(child.id, task);
      const already = !reservation.canReserve;
      const joinable = reservation.joinable;
      const activeTeamNames = joinable ? joinable.childIds.map(childById).filter(Boolean).map(member => `${member.avatar} ${escapeHtml(member.name)}`).join(", ") : "";
      return `
        <article class="task-card ${eligibility.mode === "supported" ? "age-supported-task" : ""}">
          <div class="task-card-head">
            <span class="task-icon">${task.icon}</span>
            <div>
              <h3>${escapeHtml(task.title)}</h3>
              <div class="task-meta">
                <span class="chip">${escapeHtml(task.category)}</span>
                ${task.requiredChildren > 1 ? `<span class="chip team">👥 ${task.requiredChildren} Kinder</span>` : `<span class="chip">👤 Einzelaufgabe</span>`}
                <span class="chip">${task.repeatMode === "shared" ? "🏠 einmal für die Gruppe" : "👧 pro Kind"}</span>
                <span class="chip ${eligibility.mode === "supported" ? "warning" : ""}">🎂 ${escapeHtml(taskAgeRuleLabel(task))}</span>
                <span class="chip">🪙 ${task.coins}</span><span class="chip">🌱 ${task.seeds}</span>
                ${task.communityPoints ? `<span class="chip team">🤝 +${task.communityPoints} Gemeinschaft</span>` : ""}
              </div>
            </div>
            <button class="primary-button small-button" type="button" data-action="reserve-task" data-child-id="${child.id}" data-task-id="${task.id}" ${already ? "disabled" : ""}>${reservation.label}</button>
          </div>
          ${eligibility.mode === "supported" ? `<div class="callout warning compact-callout"><p>Diese Aufgabe darfst du gemeinsam mit einem älteren Kind machen.</p></div>` : ""}
          ${joinable ? `<p class="tiny muted">Schon dabei: ${activeTeamNames}</p>` : ""}
          ${task.instructions ? `<p class="tiny muted">${escapeHtml(task.instructions)}</p>` : ""}
        </article>`;
    }).join("") : `<div class="empty-state"><span class="emoji">🌤️</span><h3>Heute sind keine passenden Aufgaben freigeschaltet.</h3><p>Ein Erzieher kann Aufgaben oder Altersregeln anpassen.</p></div>`;

    return `
      <section class="profile-banner" style="--accent:${child.accent}">
        <div class="profile-avatar">${child.avatar}</div>
        <div><h2>${escapeHtml(child.name)} hilft mit</h2><p>${childAge(child) === null ? "Dein Alter ist noch nicht eingetragen. Aufgaben mit Altersgrenze bleiben deshalb verborgen." : `${childAgeLabel(child)} · Die App zeigt dir passende Aufgaben zuerst.`}</p><div class="balance-strip">${currencyStats(child)}</div></div>
      </section>
      <div class="section">
        <div class="priority-task-block">
          <div class="section-heading"><div><h2>Meine ausgewählten Aufgaben</h2><p>Das steht jetzt zuerst: Was noch zu tun ist und was schon auf die Abendrunde wartet.</p></div>${todaysClaims.length ? `<span class="chip pending">${todaysClaims.length} offen</span>` : ""}</div>
          <div class="task-list">${selectedHtml}</div>
        </div>
        <div class="available-task-block">
          <div class="section-heading"><div><h2>Weitere passende Aufgaben</h2><p>${FULL_DAY_NAMES[dayIndex()]} · nach Alter passend sortiert${hiddenAgeCount ? ` · ${hiddenAgeCount} noch nicht passende Aufgabe${hiddenAgeCount === 1 ? "" : "n"} ausgeblendet` : ""}</p></div></div>
          <div class="task-list">${availableHtml}</div>
        </div>
      </div>`;
  }

  function renderChildMissions() {
    const child = childById(ui.childId);
    if (!child) return renderMissingChild();
    const goals = activeGoalsForChild(child.id);
    const todays = data.goalEvaluations.filter(evaluation => evaluation.childId === child.id && evaluation.date === todayKey());
    return `
      <section class="profile-banner" style="--accent:${child.accent}">
        <div class="profile-avatar">${child.avatar}</div>
        <div><h2>Meine Tagesmissionen</h2><p>Diese Ziele begleiten dich durch den Tag. Am Abend schaut ihr gemeinsam und fair darauf.</p></div>
      </section>
      <section class="section">
        ${goals.length ? `<div class="task-list">${goals.map(goal => {
          const evaluation = todays.find(item => item.goalId === goal.id);
          return `
            <article class="task-card goal-card" style="--accent:${child.accent}">
              <div class="task-card-head">
                <span class="task-icon">${goal.icon}</span>
                <div><h3>${escapeHtml(goal.title)}</h3><p class="muted tiny">Heute achte ich darauf. Es geht nicht um Perfektion, sondern um gemeinsames Nachdenken.</p></div>
                ${evaluation ? `<span class="chip success">${GOAL_RESULTS[evaluation.result]?.icon || "🌱"} Besprochen</span>` : `<span class="chip warning">Für heute</span>`}
              </div>
              <div class="task-meta"><span class="chip">Bei geschafft: 🪙 ${goal.achievedCoins}</span><span class="chip">🌱 ${goal.achievedSeeds}</span>${goal.achievedStars ? `<span class="chip">⭐ ${goal.achievedStars}</span>` : ""}</div>
            </article>`;
        }).join("")}</div>` : `<div class="empty-state"><span class="emoji">🌈</span><h3>Heute gibt es keine persönliche Tagesmission.</h3><p>Das ist völlig in Ordnung. Im Erzieherbereich können passende, positiv formulierte Ziele angelegt werden.</p></div>`}
      </section>`;
  }

  function worldTheme(child) { return WORLD_THEMES.find(theme => theme.id === child.theme) || WORLD_THEMES[0]; }

  function worldStarter(themeId) {
    return ({ meadow:"🌱 🌼 🌳 🐞", magic:"🍄 ✨ 🌲 🦋", ocean:"🐚 🌴 🐬 ⛵", space:"🪐 ⭐ 🚀 🌙", dino:"🌿 🦕 🌋 🥚", farm:"🌾 🚜 🐄 🐔" })[themeId] || "🌱 🌼 🌳";
  }

  function renderChildWorld() {
    const child = childById(ui.childId);
    if (!child) return renderMissingChild();
    const theme = worldTheme(child);
    const inventoryItems = child.inventory.map(itemById).filter(Boolean);
    const plotLevel = Math.min(6, 1 + Math.floor(child.completed / 8));
    return `
      <section class="profile-banner" style="--accent:${child.accent}">
        <div class="profile-avatar">${child.avatar}</div>
        <div><h2>${escapeHtml(child.name)}s ${escapeHtml(theme.title)}</h2><p>Alles, was mit Samen oder Sternen gekauft wurde, lebt sichtbar in dieser Welt.</p><div class="balance-strip">${currencyStats(child)}</div></div>
      </section>

      <section class="section">
        <div class="world-scene theme-${theme.id}">
          <span class="world-title">${theme.icon} ${escapeHtml(theme.title)} · Stufe ${plotLevel}</span>
          <span class="world-sun">${theme.id === "space" ? "🌙" : "☀️"}</span>
          <div class="world-ground"></div>
          ${inventoryItems.length ? `<div class="world-items">${inventoryItems.slice(-24).map((item,index) => `<span class="world-item" style="grid-column:${(index%6)+1}">${item.icon}</span>`).join("")}</div>` : `<div class="world-starter">${worldStarter(theme.id)}</div>`}
        </div>
      </section>

      <section class="section">
        <div class="admin-grid">
          <div class="card"><h3>🌱 Grundstück wächst</h3><p class="muted">Mit bestätigten Aufgaben wächst die Welt weiter. Noch ${Math.max(0, 8 - (child.completed % 8)) || 8} bestätigte Aufgaben bis zur nächsten Weltstufe.</p></div>
          <div class="card"><h3>🎒 Bereits in der Welt</h3><p class="muted">${inventoryItems.length} Gegenstand${inventoryItems.length === 1 ? "" : "e"} · Gegenstände dürfen mehrfach vorkommen.</p></div>
          <button class="card" style="text-align:left;cursor:pointer;border:0" type="button" data-action="child-shop"><h3>🛍️ Welt erweitern</h3><p class="muted">Samen im Weltenladen ausgeben oder den Sternenschatz entdecken.</p></button>
        </div>
      </section>`;
  }

  function renderChildShop() {
    const child = childById(ui.childId);
    if (!child) return renderMissingChild();
    const tabs = [
      { id:"world", label:"🌱 Weltenladen" },
      { id:"wishes", label:"🪙 Wunschladen" },
      { id:"stars", label:"⭐ Sternenschatz" },
      { id:"exchange", label:"🔄 Tauschen" }
    ];
    let content = "";
    if (ui.shopTab === "world") {
      const items = WORLD_ITEMS.filter(item => item.seedCost);
      content = `<div class="shop-grid">${items.map(item => `
        <article class="shop-card">
          <span class="shop-icon">${item.icon}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
          <div class="price"><span>🌱 ${item.seedCost}</span><button class="primary-button small-button" type="button" data-action="buy-world-item" data-item-id="${item.id}" data-child-id="${child.id}" ${child.seeds < item.seedCost ? "disabled" : ""}>Kaufen</button></div>
        </article>`).join("")}</div>`;
    } else if (ui.shopTab === "wishes") {
      const wishes = data.wishes.filter(wish => wish.active);
      const openRequests = data.wishRequests.filter(request => request.childId === child.id && request.status === "pending");
      content = `
        <div class="callout"><p>Ein Wunsch wird vorgemerkt und später mit einem Erzieher abgestimmt. Bei einer Ablehnung kommen die Münzen automatisch zurück.</p></div>
        <div class="shop-grid" style="margin-top:14px">${wishes.map(wish => {
          const pending = openRequests.some(request => request.wishId === wish.id);
          return `<article class="shop-card"><span class="shop-icon">${wish.icon}</span><h3>${escapeHtml(wish.title)}</h3><p>${escapeHtml(wish.note)}</p><div class="price"><span>🪙 ${wish.cost}</span><button class="primary-button small-button" type="button" data-action="request-wish" data-wish-id="${wish.id}" data-child-id="${child.id}" ${pending || child.coins < wish.cost ? "disabled" : ""}>${pending ? "Vorgemerkt" : "Vormerken"}</button></div></article>`;
        }).join("")}</div>`;
    } else if (ui.shopTab === "stars") {
      const items = WORLD_ITEMS.filter(item => item.starCost);
      content = `
        <div class="callout warning"><p>Sterne sind seltene Auszeichnungen. Sie werden nicht für jede Aufgabe vergeben und können besondere Dinge freischalten.</p></div>
        <div class="shop-grid" style="margin-top:14px">${items.map(item => `<article class="shop-card"><span class="shop-icon">${item.icon}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><div class="price"><span>⭐ ${item.starCost}</span><button class="primary-button small-button" type="button" data-action="buy-world-item" data-item-id="${item.id}" data-child-id="${child.id}" ${child.stars < item.starCost ? "disabled" : ""}>Freischalten</button></div></article>`).join("")}</div>`;
    } else {
      content = data.settings.allowCoinSeedExchange ? `
        <div class="panel">
          <h2>🪙 Münzen in 🌱 Samen tauschen</h2>
          <p class="muted">Die zwei Bereiche bleiben getrennt. Wer seine Welt schneller erweitern möchte, darf freiwillig Münzen in Samen tauschen.</p>
          <div class="reward-totals"><span class="reward-total">${data.settings.exchangeCoins} 🪙</span><span class="reward-total">→</span><span class="reward-total">${data.settings.exchangeSeeds} 🌱</span></div>
          <button class="primary-button full-button" type="button" data-action="exchange-coins" data-child-id="${child.id}" ${child.coins < data.settings.exchangeCoins ? "disabled" : ""}>Jetzt tauschen</button>
        </div>` : `<div class="empty-state"><span class="emoji">🔒</span><h3>Der Tausch ist derzeit ausgeschaltet.</h3><p>Ein Erzieher kann ihn in den Einstellungen freigeben.</p></div>`;
    }
    return `
      <section class="profile-banner" style="--accent:${child.accent}">
        <div class="profile-avatar">${child.avatar}</div><div><h2>Mein Laden</h2><p>Münzen, Samen und Sterne haben jeweils einen eigenen Zweck.</p><div class="balance-strip">${currencyStats(child)}</div></div>
      </section>
      <section class="section"><div class="tabbar">${tabs.map(tab => `<button type="button" class="${ui.shopTab === tab.id ? "active" : ""}" data-action="shop-tab" data-tab="${tab.id}">${tab.label}</button>`).join("")}</div>${content}</section>`;
  }

  function achievementDefinitions(child) {
    const approved = claimsForChild(child.id).filter(claim => claim.status === "approved");
    const teamApproved = approved.filter(claim => claim.childIds.length > 1);
    return [
      { icon:"🌱", title:"Erster Schritt", description:"Die erste Aufgabe wurde bestätigt.", unlocked:child.completed >= 1 },
      { icon:"🌻", title:"Fünfmal mitgemacht", description:"Fünf Aufgaben wurden bestätigt.", unlocked:child.completed >= 5 },
      { icon:"🌳", title:"Zehnmal geholfen", description:"Zehn Aufgaben wurden bestätigt.", unlocked:child.completed >= 10 },
      { icon:"🏡", title:"25 Aufgaben", description:"Ein großer persönlicher Meilenstein.", unlocked:child.completed >= 25 },
      { icon:"🤝", title:"Teamstarter", description:"Eine Aufgabe wurde gemeinsam erledigt.", unlocked:teamApproved.length >= 1 },
      { icon:"🧑‍🤝‍🧑", title:"Teamprofi", description:"Fünf Teamaufgaben wurden gemeinsam geschafft.", unlocked:teamApproved.length >= 5 },
      { icon:"⭐", title:"Erster Stern", description:"Ein besonderer Stern wurde verdient.", unlocked:child.stars >= 1 || data.history.some(entry => entry.type === "star_earned" && entry.childId === child.id) },
      { icon:"🌈", title:"Sternensammler", description:"Fünf Sterne wurden im Laufe der Zeit verdient.", unlocked:data.history.filter(entry => entry.type === "star_earned" && entry.childId === child.id).reduce((sum,entry) => sum + Number(entry.amount || 1),0) >= 5 },
      { icon:"🎒", title:"Weltenbauer", description:"Drei Dinge leben in der eigenen Welt.", unlocked:child.inventory.length >= 3 },
      { icon:"🏰", title:"Große Welt", description:"Zehn Dinge wurden für die Welt gesammelt.", unlocked:child.inventory.length >= 10 }
    ];
  }

  function renderAchievements() {
    const child = childById(ui.childId);
    if (!child) return renderMissingChild();
    const achievements = achievementDefinitions(child);
    const unlocked = achievements.filter(item => item.unlocked).length;
    return `
      <section class="profile-banner" style="--accent:${child.accent}"><div class="profile-avatar">${child.avatar}</div><div><h2>Meine Erfolge</h2><p>${unlocked} von ${achievements.length} Meilensteinen entdeckt. Es gibt keine Rangliste und keinen Vergleich.</p></div></section>
      <section class="section"><div class="badge-grid">${achievements.map(item => `<article class="badge-card ${item.unlocked ? "" : "locked"}"><div class="badge-icon">${item.unlocked ? item.icon : "🔒"}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join("")}</div></section>`;
  }

  function updateGroupMilestones() {
    GROUP_MILESTONES.forEach(milestone => {
      const id = `group_${milestone.points}`;
      if (data.group.communityPoints >= milestone.points && !data.group.inventory.includes(id)) data.group.inventory.push(id);
    });
  }

  function renderGroupWorld() {
    updateGroupMilestones();
    const next = GROUP_MILESTONES.find(item => data.group.communityPoints < item.points);
    const previousPoints = GROUP_MILESTONES.filter(item => item.points <= data.group.communityPoints).at(-1)?.points || 0;
    const nextPoints = next?.points || data.group.communityPoints;
    const percent = next ? Math.round((data.group.communityPoints - previousPoints) / Math.max(1,nextPoints - previousPoints) * 100) : 100;
    const earnedItems = GROUP_MILESTONES.filter(item => data.group.communityPoints >= item.points);
    return `
      <section class="hero group-world-banner">
        <p class="hero-kicker">Unsere gemeinsame Welt</p>
        <h2>${data.group.communityPoints} Gemeinschaftspunkte</h2>
        <p>Gemeinschaftspunkte entstehen durch echte Teamaufgaben und wenn die Gruppe gemeinsam genug Münzen oder Samen verdient hat.</p>
        <div class="hero-actions"><span class="balance-chip">🌱 ${data.group.seedProgress}/${data.settings.communitySeedThreshold} bis zum nächsten Punkt</span><span class="balance-chip">🪙 ${data.group.coinProgress}/${data.settings.communityCoinThreshold} bis zum nächsten Punkt</span></div>
      </section>

      <section class="section">
        <div class="world-scene">
          <span class="world-title">🌍 ${escapeHtml(data.settings.groupName)}</span><span class="world-sun">☀️</span><div class="world-ground"></div>
          ${earnedItems.length ? `<div class="world-items">${earnedItems.map((item,index) => `<span class="world-item" style="grid-column:${(index%6)+1}">${item.icon}</span>`).join("")}</div>` : `<div class="world-starter">🌱 🌼 🏡 🌳</div>`}
        </div>
      </section>

      <section class="section">
        <div class="panel">
          <div class="section-heading"><div><h2>Nächstes Gemeinschaftsziel</h2><p>${next ? `${next.icon} ${escapeHtml(next.title)} bei ${next.points} Punkten` : "Alle bisherigen Gemeinschaftsziele wurden erreicht."}</p></div><b>${percent}%</b></div>
          <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
        </div>
      </section>

      <section class="section">
        <div class="section-heading"><div><h2>Gemeinsam aufgebaut</h2><p>Jeder Meilenstein gehört der ganzen Gruppe.</p></div></div>
        <div class="milestone-list">${GROUP_MILESTONES.map(item => `<div class="milestone ${data.group.communityPoints >= item.points ? "done" : ""}"><span class="milestone-icon">${data.group.communityPoints >= item.points ? item.icon : "🔒"}</span><div><b>${escapeHtml(item.title)}</b><p class="muted tiny">Ab ${item.points} Gemeinschaftspunkten</p></div><span>${data.group.communityPoints >= item.points ? "Geschafft" : `${item.points - data.group.communityPoints} fehlen`}</span></div>`).join("")}</div>
      </section>`;
  }

  function renderRoundSetup() {
    const selected = ui.roundDraft?.participants || [];
    const children = activeChildren();
    return `
      <section class="hero">
        <p class="hero-kicker">Gemeinsam auswählen</p>
        <h2>Mitmach-Runde starten</h2>
        <p>Wählt alle Kinder aus, die jetzt gemeinsam Aufgaben übernehmen möchten. Danach lost die Sonnenblume eine faire Reihenfolge aus.</p>
      </section>
      <section class="section">
        <div class="child-grid">${children.map(child => {
          const isSelected = selected.includes(child.id);
          return `<button class="child-card" type="button" style="--accent:${child.accent};${isSelected ? "box-shadow:0 0 0 5px rgba(246,200,77,.45),var(--shadow-soft)" : ""}" data-action="toggle-round-child" data-child-id="${child.id}"><span class="child-avatar">${child.avatar}</span><h3>${escapeHtml(child.name)}</h3><small>${isSelected ? `✅ Dabei · ${childAgeLabel(child)}` : `${childAgeLabel(child)} · Antippen`}</small></button>`;
        }).join("")}</div>
      </section>
      <section class="section panel">
        <div class="section-heading"><div><h2>${selected.length} Kinder ausgewählt</h2><p>Mindestens zwei Kinder werden für die Auslosung benötigt.</p></div></div>
        <button class="primary-button full-button" type="button" data-action="start-round" ${selected.length < 2 ? "disabled" : ""}>🎡 Reihenfolge auslosen</button>
      </section>`;
  }

  function createFairOrder(participantIds) {
    const shuffled = [...participantIds].sort(() => Math.random() - .5);
    const lastFirst = data.lastOrders.at(-1)?.[0];
    if (shuffled.length > 1 && shuffled[0] === lastFirst) {
      const swapIndex = 1 + Math.floor(Math.random() * (shuffled.length - 1));
      [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
    }
    return shuffled;
  }

  function startRound() {
    const participants = ui.roundDraft?.participants || [];
    if (participants.length < 2) return;
    const order = createFairOrder(participants);
    ui.roundDraft = { id:uid(), participants:[...participants], order, index:0, assignments:[], startedAt:Date.now(), finished:false };
    data.lastOrders.push([...order]);
    data.lastOrders = data.lastOrders.slice(-12);
    const first = childById(order[0]);
    if (first) first.lastFirstAt = Date.now();
    saveData();
    navigate("roundPlay", { push:false });
    setTimeout(() => document.querySelector(".roulette")?.classList.add("spin"), 80);
  }

  function roundTaskAvailability(task, childId) {
    const assignedTaskIds = ui.roundDraft?.assignments.filter(item => item.childId === childId).map(item => item.taskId) || [];
    if (assignedTaskIds.includes(task.id)) return false;
    return taskReservationState(childId, task).canReserve;
  }

  function renderRoundPlay() {
    const round = ui.roundDraft;
    if (!round) return renderRoundSetup();
    if (round.index >= round.order.length) return renderRoundSummary();
    const currentChild = childById(round.order[round.index]);
    if (!currentChild) return `<div class="empty-state"><h3>Kind nicht gefunden</h3></div>`;
    const firstStep = round.index === 0 && round.assignments.length === 0;
    const tasks = tasksForToday()
      .map(task => ({ task, eligibility:taskAgeEligibility(currentChild, task) }))
      .filter(item => ["solo","supported"].includes(item.eligibility.mode))
      .sort((a,b) => {
        const rank = { solo:0, supported:1 };
        return rank[a.eligibility.mode] - rank[b.eligibility.mode]
          || Number(a.task.minAgeSolo || 0) - Number(b.task.minAgeSolo || 0)
          || a.task.title.localeCompare(b.task.title, "de");
      });
    return `
      <section class="round-stage panel">
        ${firstStep ? `<div class="roulette"><div class="roulette-inner">${currentChild.avatar}</div></div>` : `<div class="profile-avatar" style="margin:0 auto;background:${currentChild.accent}22">${currentChild.avatar}</div>`}
        <p class="hero-kicker">Platz ${round.index + 1} von ${round.order.length}</p>
        <h2>${escapeHtml(currentChild.name)} darf jetzt auswählen</h2>
        <p class="muted">${childAge(currentChild) === null ? "Altersbegrenzte Aufgaben sind verborgen, bis Geburtsmonat und Geburtsjahr eingetragen sind." : `${childAgeLabel(currentChild)} · Passende Aufgaben stehen zuerst.`}</p>
      </section>
      <section class="section">
        ${tasks.length ? `<div class="task-list">${tasks.map(({task, eligibility}) => {
          const reservation = taskReservationState(currentChild.id, task);
          const available = roundTaskAvailability(task, currentChild.id);
          const joinable = reservation.joinable;
          return `<article class="task-card ${eligibility.mode === "supported" ? "age-supported-task" : ""}"><div class="task-card-head"><span class="task-icon">${task.icon}</span><div><h3>${escapeHtml(task.title)}</h3><div class="task-meta">${task.requiredChildren > 1 ? `<span class="chip team">👥 ${task.requiredChildren} Kinder</span>` : `<span class="chip">👤 Alleine</span>`}<span class="chip ${eligibility.mode === "supported" ? "warning" : ""}">🎂 ${escapeHtml(taskAgeRuleLabel(task))}</span><span class="chip">🪙 ${task.coins}</span><span class="chip">🌱 ${task.seeds}</span>${task.communityPoints ? `<span class="chip team">🤝 ${task.communityPoints}</span>` : ""}</div>${joinable ? `<p class="tiny muted">Team begonnen von ${joinable.childIds.map(childById).filter(Boolean).map(child => `${child.avatar} ${escapeHtml(child.name)}`).join(", ")}</p>` : ""}${eligibility.mode === "supported" ? `<p class="tiny muted">Diese Aufgabe geht nur zusammen mit einem älteren Kind.</p>` : ""}</div><button class="primary-button small-button" type="button" data-action="round-choose-task" data-task-id="${task.id}" ${available ? "" : "disabled"}>${reservation.label}</button></div></article>`;
        }).join("")}</div>` : `<div class="empty-state"><span class="emoji">🌱</span><h3>Keine passende Aufgabe verfügbar</h3><p>Ein Erzieher kann später eine Altersregel anpassen oder eine neue Aufgabe anlegen.</p></div>`}
      </section>`;
  }

  function chooseRoundTask(taskId) {
    const round = ui.roundDraft;
    if (!round || round.index >= round.order.length) return;
    const childId = round.order[round.index];
    const result = reserveTask(childId, taskId, "round");
    if (!result.ok) return showToast(result.message);
    round.assignments.push({ childId, taskId, claimId:result.claim.id });
    round.index += 1;
    saveData();
    if (round.index >= round.order.length) {
      round.finished = true;
      data.rounds.push(clone(round));
      saveData({ snapshot:true });
      ui.screen = "roundSummary";
    }
    render();
  }

  function renderRoundSummary() {
    const round = ui.roundDraft;
    if (!round) return `<div class="empty-state"><span class="emoji">🌻</span><h3>Keine laufende Runde</h3><button class="primary-button" data-action="open-round">Neue Runde starten</button></div>`;
    return `
      <section class="hero">
        <p class="hero-kicker">Aufgaben sind verteilt</p>
        <h2>Jetzt können alle gleichzeitig loslegen</h2>
        <p>Niemand muss auf eine sofortige Bestätigung warten. Jede Aufgabe wird später im eigenen Kinderbereich als erledigt gemeldet.</p>
      </section>
      <section class="section"><div class="order-list">${round.assignments.map((assignment,index) => {
        const child = childById(assignment.childId); const task = taskById(assignment.taskId);
        if (!child || !task) return "";
        return `<div class="order-item"><span class="order-number">${index+1}</span><span class="order-avatar">${child.avatar}</span><div><b>${escapeHtml(child.name)}</b><p class="muted tiny">${task.icon} ${escapeHtml(task.title)}</p></div></div>`;
      }).join("")}</div></section>
      <section class="section panel"><button class="primary-button full-button" type="button" data-action="finish-round">Zur Startseite</button></section>`;
  }

  function registerGroupEarnings(coins, seeds) {
    data.group.totalCoinsEarned += coins;
    data.group.totalSeedsEarned += seeds;
    data.group.coinProgress += coins;
    data.group.seedProgress += seeds;
    let gained = 0;
    while (data.group.coinProgress >= data.settings.communityCoinThreshold) {
      data.group.coinProgress -= data.settings.communityCoinThreshold;
      data.group.communityPoints += 1;
      gained += 1;
    }
    while (data.group.seedProgress >= data.settings.communitySeedThreshold) {
      data.group.seedProgress -= data.settings.communitySeedThreshold;
      data.group.communityPoints += 1;
      gained += 1;
    }
    updateGroupMilestones();
    return gained;
  }

  function addNotification(childId, payload) {
    data.notifications.push({
      id:uid(), childId, type:payload.type || "info", title:payload.title || "Neuigkeit aus deiner Welt",
      message:payload.message || "", detail:payload.detail || "", coins:Number(payload.coins || 0), seeds:Number(payload.seeds || 0), stars:Number(payload.stars || 0),
      positive:payload.positive !== false, seen:false, createdAt:Date.now()
    });
  }

  function applyChildReward(childId, { coins = 0, seeds = 0, stars = 0 }, source = "reward") {
    const child = childById(childId);
    if (!child) return 0;
    child.coins += Number(coins || 0);
    child.seeds += Number(seeds || 0);
    child.stars += Number(stars || 0);
    if (stars > 0) data.history.push({ id:uid(), type:"star_earned", childId, amount:stars, source, timestamp:Date.now() });
    return registerGroupEarnings(Number(coins || 0), Number(seeds || 0));
  }

  function reviewClaim(claimId, decision, note = "") {
    const claim = data.claims.find(item => item.id === claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task || claim.status !== "reported") return false;
    claim.status = decision === "approve" ? "approved" : "declined";
    claim.reviewedAt = Date.now();
    claim.reviewNote = note;

    if (decision === "approve") {
      let thresholdPoints = 0;
      claim.childIds.forEach(childId => {
        const child = childById(childId);
        if (!child) return;
        child.completed += 1;
        thresholdPoints += applyChildReward(childId, { coins:task.coins, seeds:task.seeds, stars:task.stars }, "task");
        addNotification(childId, {
          type:"task-approved", title:"Deine Hilfe wurde gesehen", message:`${task.icon} ${task.title} wurde bestätigt.`,
          detail:claim.childIds.length > 1 ? "Ihr habt diese Aufgabe gemeinsam geschafft." : "Deine Welt ist dadurch ein Stück weiter gewachsen.",
          coins:task.coins, seeds:task.seeds, stars:task.stars, positive:true
        });
      });
      const teamPoints = claim.childIds.length >= 2 ? Math.max(1, task.communityPoints) : task.communityPoints;
      if (teamPoints > 0) data.group.communityPoints += teamPoints;
      updateGroupMilestones();
      claim.rewardsApplied = true;
      data.history.push({ id:uid(), type:"task_approved", claimId, taskId:task.id, childIds:[...claim.childIds], coins:task.coins, seeds:task.seeds, stars:task.stars, communityPoints:teamPoints + thresholdPoints, timestamp:Date.now() });
    } else {
      claim.childIds.forEach(childId => addNotification(childId, {
        type:"task-declined", title:"Danke, dass du mitgemacht hast", message:`Bei „${task.title}“ fehlte noch eine Kleinigkeit.`,
        detail:note || "Frag beim nächsten Mal kurz nach. Du kannst es jederzeit erneut versuchen.", positive:false
      }));
      data.history.push({ id:uid(), type:"task_declined", claimId, taskId:task.id, childIds:[...claim.childIds], note, timestamp:Date.now() });
    }
    saveData({ snapshot:true });
    return true;
  }

  function evaluateGoal({ childId, goalId, childView, result, note }) {
    const goal = goalById(goalId);
    if (!goal || goal.childId !== childId) return false;
    if (data.goalEvaluations.some(item => item.childId === childId && item.goalId === goalId && item.date === todayKey())) return false;
    const reward = result === "achieved"
      ? { coins:goal.achievedCoins, seeds:goal.achievedSeeds, stars:goal.achievedStars }
      : result === "partial"
        ? { coins:goal.partialCoins, seeds:goal.partialSeeds, stars:0 }
        : { coins:0, seeds:0, stars:0 };
    applyChildReward(childId, reward, "goal");
    data.goalEvaluations.push({ id:uid(), childId, goalId, date:todayKey(), childView, result, note:note || "", reward, createdAt:Date.now() });
    const label = GOAL_RESULTS[result]?.label || "Besprochen";
    addNotification(childId, {
      type:"goal", title:"Eure Tagesmission wurde besprochen", message:`${goal.icon} ${goal.title}`,
      detail:result === "achieved" ? "Ihr habt gemeinsam entschieden: Das ist heute gut gelungen."
        : result === "partial" ? "Es hat schon einiges geklappt. Morgen gibt es eine neue Chance."
          : "Heute war es noch schwierig. Das ist kein Verlust – morgen beginnt ein neuer Tag.",
      coins:reward.coins, seeds:reward.seeds, stars:reward.stars, positive:result !== "notYet"
    });
    data.history.push({ id:uid(), type:"goal_evaluated", childId, goalId, result, reward, timestamp:Date.now() });
    saveData({ snapshot:true });
    return true;
  }

  function maybeShowNotifications(childId) {
    const notes = unseenNotifications(childId);
    if (!notes.length || modalRoot.innerHTML) return;
    const child = childById(childId);
    if (!child) return;
    const totals = notes.reduce((sum,note) => ({ coins:sum.coins+note.coins, seeds:sum.seeds+note.seeds, stars:sum.stars+note.stars }), { coins:0,seeds:0,stars:0 });
    const positiveCount = notes.filter(note => note.positive).length;
    const headingOptions = positiveCount
      ? ["Während du weg warst, ist etwas passiert …", "Deine Welt hat Neuigkeiten für dich!", "Schau mal, was sich verändert hat!"]
      : ["Schön, dass du wieder da bist.", "Deine Welt hat eine Nachricht für dich."];
    const heading = headingOptions[Math.floor(Math.random() * headingOptions.length)];
    openModal("Neuigkeiten für dich", `
      <div class="reward-reveal">
        <span class="main-emoji">${positiveCount ? "🌻" : "🌤️"}</span>
        <h2>${escapeHtml(heading)}</h2>
        <p class="muted">${escapeHtml(child.name)}, hier ist deine Rückmeldung seit deinem letzten Besuch.</p>
        ${totals.coins || totals.seeds || totals.stars ? `<div class="reward-totals">${totals.coins ? `<span class="reward-total">🪙 +${totals.coins}</span>` : ""}${totals.seeds ? `<span class="reward-total">🌱 +${totals.seeds}</span>` : ""}${totals.stars ? `<span class="reward-total">⭐ +${totals.stars}</span>` : ""}</div>` : ""}
        <div class="task-list" style="text-align:left">${notes.map(note => `<article class="task-card"><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.message)}</p>${note.detail ? `<p class="muted tiny">${escapeHtml(note.detail)}</p>` : ""}</article>`).join("")}</div>
        <div class="modal-actions"><button class="primary-button full-button" type="button" data-action="mark-notifications-seen" data-child-id="${childId}">🌍 Meine Welt weiter entdecken</button></div>
      </div>`);
    if (positiveCount) celebrate(24);
  }

  function renderEducator() {
    if (!ui.educatorUnlocked) return renderEducatorLogin();
    const tabs = [
      ["review","🌙 Abendrunde"], ["overview","📊 Übersicht"], ["children","👧 Kinder"], ["tasks","📋 Aufgaben"],
      ["goals","🌱 Tagesmissionen"], ["wishes","🪙 Wünsche"], ["backup","💾 Datensicherung"], ["settings","⚙️ Einstellungen"]
    ];
    const content = ({
      review:renderReviewTab,
      overview:renderOverviewTab,
      children:renderChildrenAdmin,
      tasks:renderTasksAdmin,
      goals:renderGoalsAdmin,
      wishes:renderWishesAdmin,
      backup:renderBackupTab,
      settings:renderSettingsTab
    })[ui.educatorTab]?.() || renderReviewTab();
    return `
      <section class="hero"><p class="hero-kicker">Geschützter Bereich</p><h2>Erzieherbereich</h2><p>Hier werden Aufgaben gesammelt bestätigt, persönliche Tagesmissionen gemeinsam ausgewertet und alle Stammdaten verwaltet.</p></section>
      <section class="section educator-layout">
        <aside class="side-tabs">${tabs.map(([id,label]) => `<button type="button" class="${ui.educatorTab === id ? "active" : ""}" data-action="educator-tab" data-tab="${id}">${label}</button>`).join("")}<button type="button" data-action="lock-educator">🔒 Sperren</button></aside>
        <div>${content}</div>
      </section>`;
  }

  function renderEducatorLogin() {
    return `
      <section class="panel" style="max-width:520px;margin:7vh auto 0;text-align:center">
        <div style="font-size:4rem">🔒</div><h2>Erzieherbereich</h2><p class="muted">Bitte die vierstellige PIN eingeben.</p>
        <form id="pinForm"><div class="form-field"><input name="pin" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" placeholder="PIN" required style="text-align:center;font-size:1.5rem;letter-spacing:.3em"></div><button class="primary-button full-button" type="submit" style="margin-top:12px">Entsperren</button></form>
      </section>`;
  }

  function renderReviewTab() {
    const reported = data.claims.filter(claim => claim.status === "reported").sort((a,b) => a.reportedAt - b.reportedAt);
    const reserved = data.claims.filter(claim => claim.status === "reserved" && claim.date === todayKey()).sort((a,b) => a.createdAt - b.createdAt);
    const goalsToReview = activeChildren().flatMap(child => activeGoalsForChild(child.id).filter(goal => !data.goalEvaluations.some(item => item.childId === child.id && item.goalId === goal.id && item.date === todayKey())).map(goal => ({ child, goal })));
    const pendingWishes = data.wishRequests.filter(request => request.status === "pending");
    return `
      <div class="section-heading"><div><h2>🌙 Abendrunde</h2><p>Offene und erledigt gemeldete Aufgaben stehen bewusst ganz oben.</p></div>${reported.length ? `<button class="success-button small-button" type="button" data-action="approve-all-claims">Alle ${reported.length} bestätigen</button>` : ""}</div>

      <div class="panel priority-panel">
        <h3>📌 Aktuell ausgewählte Aufgaben (${reserved.length})</h3>
        <p class="muted">So ist sofort sichtbar, womit die Kinder noch beschäftigt sind.</p>
        ${reserved.length ? `<div class="task-list">${reserved.map(claim => {
          const task = taskById(claim.taskId); const children = claim.childIds.map(childById).filter(Boolean);
          if (!task) return "";
          const readiness = claimReadiness(claim, task);
          const waiting = readiness.missingOlderPartner
            ? `noch ein älteres Kind ab ${claim.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo} Jahren benötigt`
            : readiness.missingChildren
              ? `noch ${readiness.missingChildren} ${readiness.missingChildren === 1 ? "Kind" : "Kinder"} benötigt`
              : "Team vollständig";
          return `<article class="task-card active-task-card"><div class="task-card-head"><span class="task-icon">${task.icon}</span><div><h3>${escapeHtml(task.title)}</h3><p class="muted tiny">${children.map(child => `${child.avatar} ${escapeHtml(child.name)} (${childAgeLabel(child)})`).join(", ")} · ${waiting}</p><div class="task-meta"><span class="chip warning">Ausgewählt</span>${readiness.required > 1 ? `<span class="chip team">👥 ${claim.childIds.length}/${readiness.required}</span>` : ""}${claim.ageSupportRequired ? `<span class="chip warning">🧒 + 🧑 Altersbegleitung</span>` : ""}</div></div></div></article>`;
        }).join("")}</div>` : `<div class="empty-state compact"><span class="emoji">👐</span><h3>Zurzeit ist keine Aufgabe ausgewählt.</h3></div>`}
      </div>

      <div class="panel" style="margin-top:16px">
        <h3>✅ Erledigt gemeldete Aufgaben (${reported.length})</h3>
        ${reported.length ? `<div class="task-list">${reported.map(claim => {
          const task = taskById(claim.taskId); const children = claim.childIds.map(childById).filter(Boolean);
          if (!task) return "";
          return `<article class="task-card review-card"><div class="task-card-head"><span class="task-icon">${task.icon}</span><div><h3>${escapeHtml(task.title)}</h3><p class="muted tiny">${children.map(child => `${child.avatar} ${escapeHtml(child.name)} (${childAgeLabel(child)})`).join(", ")} · gemeldet ${formatDateTime(claim.reportedAt)}</p><div class="task-meta"><span class="chip">pro Kind: 🪙 ${task.coins}</span><span class="chip">🌱 ${task.seeds}</span>${task.stars ? `<span class="chip">⭐ ${task.stars}</span>` : ""}${claim.childIds.length > 1 ? `<span class="chip team">🤝 Teamaufgabe</span>` : ""}${claim.ageSupportRequired ? `<span class="chip warning">🎂 mit Altersbegleitung</span>` : ""}</div></div><div class="inline-actions"><button class="success-button small-button" type="button" data-action="approve-claim" data-claim-id="${claim.id}">Bestätigen</button><button class="danger-button small-button" type="button" data-action="decline-claim-prompt" data-claim-id="${claim.id}">Noch nicht</button></div></div></article>`;
        }).join("")}</div>` : `<div class="empty-state"><span class="emoji">✅</span><h3>Keine offenen Aufgaben</h3><p>Die Kinder können tagsüber weiter Aufgaben erledigt melden.</p></div>`}
      </div>

      <div class="panel" style="margin-top:16px">
        <h3>Persönliche Tagesmissionen (${goalsToReview.length})</h3>
        <p class="muted">Kind und Erzieher schauen gemeinsam auf den Tag. Keine Minuspunkte und kein Beschämen.</p>
        ${goalsToReview.length ? `<div class="review-grid">${goalsToReview.map(({child,goal}) => `<article class="task-card goal-card" style="--accent:${child.accent}"><div class="task-card-head"><span class="task-icon">${goal.icon}</span><div><h3>${escapeHtml(child.name)}</h3><p class="muted tiny">${escapeHtml(goal.title)}</p></div></div><button class="primary-button full-button small-button" type="button" style="margin-top:12px" data-action="open-goal-review" data-child-id="${child.id}" data-goal-id="${goal.id}">Gemeinsam auswerten</button></article>`).join("")}</div>` : `<div class="empty-state"><span class="emoji">🌙</span><h3>Alle heutigen Missionen sind besprochen.</h3></div>`}
      </div>

      <div class="panel" style="margin-top:16px">
        <h3>Vorgemerkte Wünsche (${pendingWishes.length})</h3>
        ${pendingWishes.length ? `<div class="task-list">${pendingWishes.map(request => {
          const child = childById(request.childId); const wish = wishById(request.wishId);
          if (!child || !wish) return "";
          return `<article class="task-card"><div class="task-card-head"><span class="task-icon">${wish.icon}</span><div><h3>${escapeHtml(wish.title)}</h3><p class="muted tiny">${child.avatar} ${escapeHtml(child.name)} · ${wish.cost} Münzen sind vorgemerkt</p></div><div class="inline-actions"><button class="success-button small-button" type="button" data-action="approve-wish" data-request-id="${request.id}">Annehmen</button><button class="danger-button small-button" type="button" data-action="reject-wish" data-request-id="${request.id}">Ablehnen & erstatten</button></div></div></article>`;
        }).join("")}</div>` : `<div class="empty-state"><span class="emoji">🎁</span><h3>Keine offenen Wünsche</h3></div>`}
      </div>`;
  }

  function renderOverviewTab() {
    const todayClaims = data.claims.filter(claim => claim.date === todayKey());
    const approvedToday = todayClaims.filter(claim => claim.status === "approved");
    const reported = data.claims.filter(claim => claim.status === "reported").length;
    const activeTaskCount = data.tasks.filter(task => task.active).length;
    const activeGoalCount = data.personalGoals.filter(goal => goal.active).length;
    return `
      <div class="section-heading"><div><h2>Übersicht</h2><p>Ein kompakter Blick auf den aktuellen Stand.</p></div></div>
      <div class="admin-grid">
        <div class="card"><h3>👧 ${activeChildren().length}</h3><p class="muted">aktive Kinderprofile</p></div>
        <div class="card"><h3>📋 ${activeTaskCount}</h3><p class="muted">aktive Aufgaben</p></div>
        <div class="card"><h3>⏳ ${reported}</h3><p class="muted">offene Bestätigungen</p></div>
        <div class="card"><h3>🌱 ${activeGoalCount}</h3><p class="muted">aktive Tagesmissionen</p></div>
        <div class="card"><h3>✅ ${approvedToday.length}</h3><p class="muted">heute bestätigte Aufgaben</p></div>
        <div class="card"><h3>🤝 ${data.group.communityPoints}</h3><p class="muted">Gemeinschaftspunkte</p></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <h3>So entstehen Gemeinschaftspunkte</h3>
        <div class="milestone-list">
          <div class="milestone"><span class="milestone-icon">🤝</span><div><b>Gemeinsame Aufgaben</b><p class="muted tiny">Wenn mindestens zwei Kinder dieselbe Aufgabe gemeinsam erledigen, entsteht mindestens ein Gemeinschaftspunkt.</p></div></div>
          <div class="milestone"><span class="milestone-icon">🌱</span><div><b>Gemeinsam Samen verdienen</b><p class="muted tiny">Je ${data.settings.communitySeedThreshold} verdiente Samen entsteht ein Gemeinschaftspunkt.</p></div><b>${data.group.seedProgress}/${data.settings.communitySeedThreshold}</b></div>
          <div class="milestone"><span class="milestone-icon">🪙</span><div><b>Gemeinsam Münzen verdienen</b><p class="muted tiny">Je ${data.settings.communityCoinThreshold} verdiente Münzen entsteht ein Gemeinschaftspunkt.</p></div><b>${data.group.coinProgress}/${data.settings.communityCoinThreshold}</b></div>
        </div>
      </div>`;
  }

  function renderChildrenAdmin() {
    const active = data.children.filter(child => child.active !== false && !child.deletedAt);
    const archived = data.children.filter(child => child.active === false && !child.deletedAt);
    const trashed = data.children.filter(child => child.deletedAt);
    const row = (child, mode) => {
      const age = childAge(child);
      return `<div class="admin-row"><span class="admin-row-icon" style="background:${child.accent}22">${child.avatar}</span><div><h4>${escapeHtml(child.name)}</h4><p>${mode === "active" ? "Aktiv" : mode === "archived" ? "Archiviert" : `Papierkorb seit ${formatDateTime(child.deletedAt)}`} · 🎂 ${escapeHtml(childBirthLabel(child))}${age === null ? " · Alter fehlt" : ` · ${age} Jahre`} · 🪙 ${child.coins} · 🌱 ${child.seeds} · ⭐ ${child.stars}${child.onboardingPending ? " · Einrichtung offen" : ""}</p></div><div class="inline-actions">${mode !== "trash" ? `<button class="ghost-button small-button" type="button" data-action="open-child-editor" data-child-id="${child.id}">${child.onboardingPending ? "Gemeinsam einrichten" : "Bearbeiten"}</button>` : ""}${mode === "active" ? `<button class="ghost-button small-button" type="button" data-action="archive-child" data-child-id="${child.id}">Archivieren</button><button class="danger-button small-button" type="button" data-action="trash-child" data-child-id="${child.id}">Papierkorb</button>` : mode === "archived" ? `<button class="success-button small-button" type="button" data-action="restore-child" data-child-id="${child.id}">Aktivieren</button><button class="danger-button small-button" type="button" data-action="trash-child" data-child-id="${child.id}">Papierkorb</button>` : `<button class="success-button small-button" type="button" data-action="restore-child" data-child-id="${child.id}">Wiederherstellen</button><button class="danger-button small-button" type="button" data-action="delete-child-prompt" data-child-id="${child.id}">Endgültig löschen</button>`}</div></div>`;
    };
    const missingAges = active.filter(child => childAge(child) === null).length;
    return `
      <div class="section-heading"><div><h2>Kinder verwalten</h2><p>Geburtsmonat und Geburtsjahr steuern jetzt die altersgerechten Aufgaben.</p></div><div class="inline-actions"><button class="secondary-button small-button" type="button" data-action="open-group-setup">🌟 Neue Gruppe einrichten</button><button class="primary-button small-button" type="button" data-action="open-child-editor">＋ Kind anlegen</button></div></div>
      ${missingAges ? `<div class="callout warning"><p><b>${missingAges} aktive${missingAges === 1 ? "s Kind hat" : " Kinder haben"} noch kein Alter.</b> Altersbegrenzte Aufgaben werden dort ausgeblendet, bis Monat und Jahr eingetragen sind.</p></div>` : `<div class="callout success"><p>Für alle aktiven Kinder sind Geburtsmonat und Geburtsjahr eingetragen.</p></div>`}
      <div class="panel" style="margin-top:14px"><h3>Aktive Kinder (${active.length})</h3><div class="admin-list">${active.length ? active.map(child => row(child,"active")).join("") : `<div class="empty-state"><span class="emoji">🌱</span><h3>Noch keine aktiven Kinder</h3></div>`}</div></div>
      <div class="panel" style="margin-top:16px"><h3>📦 Archiv (${archived.length})</h3>${archived.length ? `<div class="admin-list">${archived.map(child => row(child,"archived")).join("")}</div>` : `<p class="muted">Keine archivierten Kinder.</p>`}</div>
      <div class="panel" style="margin-top:16px"><h3>🗑️ Papierkorb (${trashed.length})</h3><p class="muted tiny">Profile bleiben hier, bis sie bewusst endgültig gelöscht oder wiederhergestellt werden.</p>${trashed.length ? `<div class="admin-list">${trashed.map(child => row(child,"trash")).join("")}</div>` : `<p class="muted">Der Papierkorb ist leer.</p>`}</div>`;
  }

  function renderTasksAdmin() {
    const sortedTasks = [...data.tasks].sort((a,b) => {
      const ageA = Number(a.minAgeSolo || 0);
      const ageB = Number(b.minAgeSolo || 0);
      return ageA - ageB || a.title.localeCompare(b.title, "de");
    });
    const rows = sortedTasks.map(task => {
      const linked = data.claims.filter(claim => claim.taskId === task.id);
      const open = linked.filter(claim => ["reserved","reported"].includes(claim.status)).length;
      return `<div class="admin-row"><span class="admin-row-icon">${task.icon}</span><div><h4>${escapeHtml(task.title)}</h4><p>${task.active ? "Aktiv" : "Inaktiv"} · 🎂 ${escapeHtml(taskAgeRuleLabel(task))} · 👥 ${task.requiredChildren} · ${task.repeatMode === "shared" ? "einmal für Gruppe" : "pro Kind"} · 🪙 ${task.coins} · 🌱 ${task.seeds}${task.communityPoints ? ` · 🤝 ${task.communityPoints}` : ""}${open ? ` · ⚠️ ${open} offen` : ""}</p></div><div class="inline-actions"><button class="ghost-button small-button" type="button" data-action="open-task-editor" data-task-id="${task.id}">Bearbeiten</button><button class="${task.active ? "danger-button" : "success-button"} small-button" type="button" data-action="toggle-task-active" data-task-id="${task.id}">${task.active ? "Pausieren" : "Aktivieren"}</button><button class="danger-button small-button" type="button" data-action="delete-task-prompt" data-task-id="${task.id}">Löschen</button></div></div>`;
    }).join("");
    return `
      <div class="section-heading"><div><h2>Aufgaben verwalten</h2><p>Nach Mindestalter sortiert. Jede Aufgabe kann allein oder mit einem älteren Kind freigegeben werden.</p></div><button class="primary-button small-button" type="button" data-action="open-task-editor">＋ Aufgabe anlegen</button></div>
      <div class="callout success"><p><b>Beispiel:</b> „Allein ab 10 Jahren, mit älterem Kind ab 7 Jahren, Begleitkind ab 10 Jahren.“</p></div>
      <div class="admin-list" style="margin-top:14px">${rows || `<div class="empty-state"><span class="emoji">📋</span><h3>Noch keine Aufgaben vorhanden</h3><p>Lege oben die erste Aufgabe an.</p></div>`}</div>`;
  }

  function renderGoalsAdmin() {
    return `
      <div class="section-heading"><div><h2>Persönliche Tagesmissionen</h2><p>Bitte Ziele positiv, konkret und für das Kind verständlich formulieren.</p></div><button class="primary-button small-button" type="button" data-action="open-goal-editor">＋ Mission anlegen</button></div>
      <div class="callout warning"><p>Beispiel statt „nicht weinen und nicht ärgern“: „Ich versuche ruhig zu bleiben und freundlich mit anderen umzugehen.“</p></div>
      <div class="admin-list" style="margin-top:14px">${data.personalGoals.length ? data.personalGoals.map(goal => {
        const child = childById(goal.childId); if (!child) return "";
        return `<div class="admin-row"><span class="admin-row-icon">${goal.icon}</span><div><h4>${escapeHtml(goal.title)}</h4><p>${child.avatar} ${escapeHtml(child.name)} · ${goal.active ? "Aktiv" : "Pausiert"} · geschafft: 🪙 ${goal.achievedCoins}, 🌱 ${goal.achievedSeeds}${goal.achievedStars ? `, ⭐ ${goal.achievedStars}` : ""}</p></div><div class="inline-actions"><button class="ghost-button small-button" type="button" data-action="open-goal-editor" data-goal-id="${goal.id}">Bearbeiten</button><button class="${goal.active ? "danger-button" : "success-button"} small-button" type="button" data-action="toggle-goal-active" data-goal-id="${goal.id}">${goal.active ? "Pausieren" : "Aktivieren"}</button></div></div>`;
      }).join("") : `<div class="empty-state"><span class="emoji">🌱</span><h3>Noch keine Tagesmissionen</h3></div>`}</div>`;
  }

  function renderWishesAdmin() {
    return `
      <div class="section-heading"><div><h2>Wunschladen verwalten</h2><p>Hier legt ihr fest, wofür Kinder Münzen im Gruppenalltag einsetzen können.</p></div><button class="primary-button small-button" type="button" data-action="open-wish-editor">＋ Wunsch anlegen</button></div>
      <div class="admin-list">${data.wishes.map(wish => `<div class="admin-row"><span class="admin-row-icon">${wish.icon}</span><div><h4>${escapeHtml(wish.title)}</h4><p>${wish.active ? "Aktiv" : "Inaktiv"} · 🪙 ${wish.cost} · ${escapeHtml(wish.note)}</p></div><div class="inline-actions"><button class="ghost-button small-button" type="button" data-action="open-wish-editor" data-wish-id="${wish.id}">Bearbeiten</button><button class="${wish.active ? "danger-button" : "success-button"} small-button" type="button" data-action="toggle-wish-active" data-wish-id="${wish.id}">${wish.active ? "Pausieren" : "Aktivieren"}</button></div></div>`).join("")}</div>`;
  }

  function renderBackupTab() {
    const snapshots = readJson(BACKUP_RING_KEY) || [];
    return `
      <div class="section-heading"><div><h2>Datensicherung</h2><p>Kinder, Aufgaben und Fortschritte bleiben über Updates hinweg erhalten.</p></div></div>
      <div class="admin-grid">
        <div class="card"><h3>⬇️ Daten exportieren</h3><p class="muted">Speichert eine vollständige Sicherungsdatei auf diesem Gerät.</p><button class="primary-button full-button" type="button" data-action="export-data">Sicherung herunterladen</button></div>
        <div class="card"><h3>⬆️ Daten importieren</h3><p class="muted">Stellt eine zuvor exportierte Sicherung wieder her.</p><label class="secondary-button full-button" style="cursor:pointer">Sicherung auswählen<input id="importFile" type="file" accept="application/json,.json" hidden></label></div>
        <div class="card"><h3>🛟 Vor Version 2.0</h3><p class="muted">Beim ersten Start wurde automatisch eine Kopie der alten Daten angelegt.</p><button class="ghost-button full-button" type="button" data-action="restore-pre-v2" ${localStorage.getItem(PRE_V2_BACKUP_KEY) ? "" : "disabled"}>Alte Kopie wiederherstellen</button></div>
      </div>
      <div class="panel" style="margin-top:16px"><h3>Automatische lokale Sicherungen</h3>${snapshots.length ? `<div class="admin-list">${snapshots.map((snapshot,index) => `<div class="admin-row"><span class="admin-row-icon">💾</span><div><h4>${formatDateTime(snapshot.createdAt)}</h4><p>Version ${escapeHtml(snapshot.appVersion || "unbekannt")}</p></div><button class="ghost-button small-button" type="button" data-action="restore-snapshot" data-index="${index}">Wiederherstellen</button></div>`).join("")}</div>` : `<p class="muted">Noch keine automatische Momentaufnahme vorhanden.</p>`}</div>`;
  }

  function renderSettingsTab() {
    return `
      <div class="section-heading"><div><h2>Einstellungen</h2><p>Grundlegende Regeln für eure Mitmach-Welt.</p></div></div>
      <form id="settingsForm" class="panel">
        <div class="form-grid">
          <div class="form-field full"><label>Gruppenname</label><input name="groupName" value="${escapeHtml(data.settings.groupName)}" required></div>
          <div class="form-field"><label>Neue Erzieher-PIN</label><input name="pin" inputmode="numeric" maxlength="8" value="${escapeHtml(data.settings.pin)}" required></div>
          <div class="form-field"><label>Bewegung</label><select name="reduceMotion"><option value="false" ${!data.settings.reduceMotion ? "selected" : ""}>Animationen anzeigen</option><option value="true" ${data.settings.reduceMotion ? "selected" : ""}>Bewegung reduzieren</option></select></div>
          <div class="form-field"><label>Münzen für einen Gemeinschaftspunkt</label><input name="communityCoinThreshold" type="number" min="10" max="5000" value="${data.settings.communityCoinThreshold}"></div>
          <div class="form-field"><label>Samen für einen Gemeinschaftspunkt</label><input name="communitySeedThreshold" type="number" min="10" max="5000" value="${data.settings.communitySeedThreshold}"></div>
          <div class="form-field"><label>Münzen beim Tausch</label><input name="exchangeCoins" type="number" min="1" max="500" value="${data.settings.exchangeCoins}"></div>
          <div class="form-field"><label>Samen beim Tausch</label><input name="exchangeSeeds" type="number" min="1" max="500" value="${data.settings.exchangeSeeds}"></div>
          <div class="form-field full"><label><input name="allowCoinSeedExchange" type="checkbox" ${data.settings.allowCoinSeedExchange ? "checked" : ""} style="width:auto"> Münzen dürfen freiwillig in Samen getauscht werden</label></div>
        </div>
        <div class="modal-actions"><button class="primary-button" type="submit">Einstellungen speichern</button></div>
      </form>`;
  }

  function openChildEditor(childId = null) {
    const child = childId ? childById(childId) : null;
    ui.editingChildId = childId;
    const selectedAvatar = child?.avatar || "🦄";
    const selectedAccent = child?.accent || ACCENT_COLORS[0];
    const selectedTheme = child?.theme || "meadow";
    const currentYear = new Date().getFullYear();
    openModal(child ? "Kind bearbeiten" : "Kind anlegen", `
      <form id="childForm">
        <input type="hidden" name="id" value="${escapeHtml(childId || "")}">
        <input type="hidden" name="avatar" id="childAvatarValue" value="${escapeHtml(selectedAvatar)}">
        <input type="hidden" name="accent" id="childAccentValue" value="${escapeHtml(selectedAccent)}">
        <div class="form-grid">
          <div class="form-field full"><label>Name oder Spitzname</label><input name="name" value="${escapeHtml(child?.name || "")}" required maxlength="30"></div>
          <div class="form-field"><label>Geburtsmonat</label><select name="birthMonth"><option value="0">Noch nicht eingetragen</option>${MONTH_NAMES.slice(1).map((month,index) => `<option value="${index+1}" ${Number(child?.birthMonth || 0) === index+1 ? "selected" : ""}>${month}</option>`).join("")}</select></div>
          <div class="form-field"><label>Geburtsjahr</label><select name="birthYear"><option value="0">Noch nicht eingetragen</option>${Array.from({length:currentYear-1999},(_,index)=>currentYear-index).map(year => `<option value="${year}" ${Number(child?.birthYear || 0) === year ? "selected" : ""}>${year}</option>`).join("")}</select></div>
          <div class="form-field full"><p class="tiny muted">Das Alter wird automatisch aus Monat und Jahr berechnet. Es wechselt jeweils zu Beginn des Geburtsmonats.</p></div>
          <div class="form-field"><label>Start-Münzen</label><input name="coins" type="number" min="0" max="9999" value="${child?.coins ?? 0}"></div>
          <div class="form-field"><label>Start-Samen</label><input name="seeds" type="number" min="0" max="9999" value="${child?.seeds ?? 0}"></div>
          <div class="form-field"><label>Sterne</label><input name="stars" type="number" min="0" max="999" value="${child?.stars ?? 0}"></div>
          <div class="form-field"><label>Themenwelt</label><select name="theme">${WORLD_THEMES.map(theme => `<option value="${theme.id}" ${selectedTheme === theme.id ? "selected" : ""}>${theme.icon} ${escapeHtml(theme.title)}</option>`).join("")}</select></div>
          <div class="form-field"><label>Name der eigenen Welt</label><input name="worldName" maxlength="40" value="${escapeHtml(child?.worldName || "Meine Welt")}"></div>
          <div class="form-field"><label>Erster Begleiter</label><select name="companion">${["🐾","🦊","🐼","🦁","🐸","🦄","🦖","🤖","🦉","🐺"].map(icon => `<option value="${icon}" ${(child?.companion || "🐾") === icon ? "selected" : ""}>${icon}</option>`).join("")}</select></div>
          <div class="form-field full"><label>Farbe</label><div class="color-picker">${ACCENT_COLORS.map(color => `<button type="button" class="color-option ${color === selectedAccent ? "selected" : ""}" style="background:${color}" data-action="select-child-color" data-color="${color}" aria-label="Farbe auswählen"></button>`).join("")}</div></div>
          <div class="form-field full"><label>Avatar-Kategorie</label><div class="tabbar">${Object.keys(AVATARS).map(category => `<button type="button" class="${ui.avatarCategory === category ? "active" : ""}" data-action="avatar-category" data-category="${category}">${escapeHtml(category)}</button>`).join("")}</div><div class="avatar-picker" id="avatarPicker">${renderAvatarOptions(selectedAvatar)}</div><p class="muted tiny">Derselbe Avatar darf mehreren Kindern gehören.</p></div>
        </div>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="submit">Speichern</button></div>
      </form>`, { wide:true });

    // Eigener Formular-Handler: funktioniert auch zuverlässig in iOS-PWAs
    // und verhindert, dass ein übergeordneter Klick-Handler das Speichern stört.
    const childForm = document.querySelector("#childForm");
    if (childForm) {
      childForm.addEventListener("submit", event => {
        event.preventDefault();
        event.stopPropagation();
        saveChildFromForm(childForm);
      }, { once:true });
    }
  }

  function saveChildFromForm(form) {
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const name = String(values.name || "").trim();
    if (!name) {
      showToast("Bitte einen Namen oder Spitznamen eintragen.");
      form.querySelector('[name="name"]')?.focus();
      return false;
    }

    const birthMonth = clamp(values.birthMonth, 0, 12);
    const birthYear = Number(values.birthYear || 0);
    if ((birthMonth && !birthYear) || (!birthMonth && birthYear)) {
      showToast("Bitte Geburtsmonat und Geburtsjahr zusammen eintragen.");
      return false;
    }
    const currentYear = new Date().getFullYear();
    if (birthYear && (birthYear < 2000 || birthYear > currentYear)) {
      showToast("Bitte ein gültiges Geburtsjahr auswählen.");
      return false;
    }

    const existing = values.id ? childById(values.id) : null;
    const child = existing || {
      id:uid(), completed:0, inventory:[], active:true,
      createdAt:Date.now(), lastFirstAt:0
    };
    child.name = name;
    child.avatar = values.avatar || "🙂";
    child.accent = values.accent || ACCENT_COLORS[0];
    child.theme = values.theme || "meadow";
    child.worldName = String(values.worldName || "Meine Welt").trim() || "Meine Welt";
    child.companion = values.companion || "🐾";
    child.onboardingPending = false;
    child.deletedAt = 0;
    child.coins = Math.max(0, Number(values.coins || 0));
    child.seeds = Math.max(0, Number(values.seeds || 0));
    child.stars = Math.max(0, Number(values.stars || 0));
    child.birthMonth = birthMonth;
    child.birthYear = birthYear || 0;

    if (!existing) data.children.push(child);
    if (!saveData({ snapshot:true })) {
      if (!existing) data.children = data.children.filter(item => item.id !== child.id);
      return false;
    }

    closeModal();
    showToast(existing ? "Kinderprofil wurde aktualisiert." : "Kinderprofil wurde angelegt und gespeichert.");
    render();
    return true;
  }

  function removeChildRelations(childId) {
    data.claims = data.claims.filter(claim => !claim.childIds?.includes(childId));
    data.personalGoals = data.personalGoals.filter(goal => goal.childId !== childId);
    data.goalEvaluations = data.goalEvaluations.filter(item => item.childId !== childId);
    data.notifications = data.notifications.filter(item => item.childId !== childId);
    data.wishRequests = data.wishRequests.filter(item => item.childId !== childId);
    data.rounds = data.rounds.filter(round => !round.childIds?.includes(childId));
  }

  function openGroupSetup() {
    openModal("Neue Gruppe einrichten", `
      <div class="reward-reveal"><span class="main-emoji">🌟</span><h2>Mit sechs Kindern neu starten</h2><p class="muted">Alle bisherigen Kinderprofile und deren persönliche Fortschritte werden entfernt. Aufgaben und Grundeinstellungen können erhalten bleiben.</p></div>
      <form id="groupSetupForm">
        <div class="form-field"><label><input type="checkbox" name="keepTasks" checked style="width:auto"> Vorhandene Aufgaben behalten</label></div>
        <div class="form-field"><label><input type="checkbox" name="keepWishes" checked style="width:auto"> Wunschladen behalten</label></div>
        <div class="form-field"><label>Zur Sicherheit Erzieher-PIN eingeben</label><input name="pin" inputmode="numeric" required></div>
        <p class="tiny muted">Danach entstehen sechs leere Profile „Kind 1“ bis „Kind 6“. Münzen, Samen, Sterne, Welten und Erfolge beginnen bei null. Anschließend tragt ihr gemeinsam Name, Avatar, Welt sowie Geburtsmonat und Geburtsjahr ein.</p>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="danger-button" type="submit">Gruppe jetzt neu einrichten</button></div>
      </form>`);
  }

  function setupFreshGroup({ keepTasks = true, keepWishes = true } = {}) {
    const colors = ACCENT_COLORS.slice(0,6);
    const avatars = ["🌟","🌱","🌈","🦊","🐼","🦁"];
    data.children = Array.from({length:6}, (_,i) => ({ id:uid(), name:`Kind ${i+1}`, avatar:avatars[i], accent:colors[i], theme:WORLD_THEMES[i % WORLD_THEMES.length].id, worldName:"Meine Welt", companion:"🐾", coins:0, seeds:0, stars:0, completed:0, inventory:[], active:true, deletedAt:0, onboardingPending:true, birthMonth:0, birthYear:0, createdAt:Date.now()+i, lastFirstAt:0 }));
    data.claims=[]; data.personalGoals=[]; data.goalEvaluations=[]; data.notifications=[]; data.wishRequests=[]; data.rounds=[]; data.lastOrders=[]; data.history=[];
    data.group = clone(DEFAULTS.group);
    if (!keepTasks) data.tasks = clone(DEFAULTS.tasks);
    if (!keepWishes) data.wishes = clone(DEFAULT_WISHES);
    saveData({ snapshot:true });
  }

  function renderAvatarOptions(selectedAvatar) {
    return AVATARS[ui.avatarCategory].map(avatar => `<button type="button" class="avatar-option ${avatar === selectedAvatar ? "selected" : ""}" data-action="select-avatar" data-avatar="${avatar}">${avatar}</button>`).join("");
  }

  function openTaskEditor(taskId = null) {
    const task = taskId ? taskById(taskId) : null;
    if (taskId && !task) {
      showToast("Diese Aufgabe wurde nicht gefunden. Bitte die Ansicht neu laden.");
      return;
    }
    openModal(task ? "Aufgabe bearbeiten" : "Aufgabe anlegen", `
      <form id="taskForm" novalidate><input type="hidden" name="id" value="${escapeHtml(taskId || "")}">
        <div class="form-grid">
          <div class="form-field full"><label>Aufgabenname</label><input name="title" value="${escapeHtml(task?.title || "")}" required maxlength="60" autocomplete="off"></div>
          <div class="form-field"><label>Symbol</label><select name="icon">${TASK_ICONS.map(icon => `<option value="${icon}" ${task?.icon === icon ? "selected" : ""}>${icon}</option>`).join("")}</select></div>
          <div class="form-field"><label>Kategorie</label><input name="category" value="${escapeHtml(task?.category || "Alltag")}" maxlength="30"></div>
          <div class="form-field"><label>Förderbereich</label><select name="competence">${COMPETENCES.map(item => `<option value="${escapeHtml(item)}" ${task?.competence === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></div>
          <div class="form-field"><label>Benötigte Kinder</label><select name="requiredChildren">${Array.from({length:8},(_,index)=>index+1).map(number => `<option value="${number}" ${(task?.requiredChildren || 1) === number ? "selected" : ""}>${number} ${number === 1 ? "Kind" : "Kinder"}</option>`).join("")}</select></div>
          <div class="form-field"><label>Wie oft pro Tag?</label><select name="repeatMode"><option value="shared" ${(task?.repeatMode || "shared") === "shared" ? "selected" : ""}>Einmal für die ganze Gruppe</option><option value="perChild" ${task?.repeatMode === "perChild" ? "selected" : ""}>Jedes Kind einmal</option></select></div>
          <div class="form-field"><label>Allein möglich ab</label><select name="minAgeSolo">${Array.from({length:19},(_,age)=>`<option value="${age}" ${Number(task?.minAgeSolo || 0) === age ? "selected" : ""}>${age === 0 ? "Keine Altersgrenze" : `${age} Jahren`}</option>`).join("")}</select></div>
          <div class="form-field full age-rule-box"><label><input name="allowYoungerWithOlder" type="checkbox" ${task?.allowYoungerWithOlder ? "checked" : ""} style="width:auto"> Jüngere Kinder dürfen die Aufgabe gemeinsam mit einem älteren Kind machen</label></div>
          <div class="form-field"><label>Mit älterem Kind ab</label><select name="minAgeWithOlder">${Array.from({length:19},(_,age)=>`<option value="${age}" ${Number(task?.minAgeWithOlder || 0) === age ? "selected" : ""}>${age === 0 ? "0 Jahren" : `${age} Jahren`}</option>`).join("")}</select></div>
          <div class="form-field"><label>Begleitkind mindestens</label><select name="olderPartnerMinAge">${Array.from({length:19},(_,age)=>`<option value="${age}" ${Number(task?.olderPartnerMinAge || task?.minAgeSolo || 0) === age ? "selected" : ""}>${age === 0 ? "0 Jahre" : `${age} Jahre`}</option>`).join("")}</select></div>
          <div class="form-field full"><p class="tiny muted">Beispiel: allein ab 10, mit älterem Kind ab 7, Begleitkind mindestens 10. Für eine begleitete Aufgabe werden automatisch mindestens zwei Kinder verlangt.</p></div>
          <div class="form-field"><label>Münzen pro Kind</label><input name="coins" type="number" min="0" max="100" value="${task?.coins ?? 5}"></div>
          <div class="form-field"><label>Samen pro Kind</label><input name="seeds" type="number" min="0" max="100" value="${task?.seeds ?? 2}"></div>
          <div class="form-field"><label>Sterne pro Kind</label><input name="stars" type="number" min="0" max="5" value="${task?.stars ?? 0}"></div>
          <div class="form-field"><label>Gemeinschaftspunkte nach Bestätigung</label><input name="communityPoints" type="number" min="0" max="10" value="${task?.communityPoints ?? 0}"></div>
          <div class="form-field full"><label>Kurze Hinweise</label><textarea name="instructions" maxlength="240">${escapeHtml(task?.instructions || "")}</textarea></div>
          <div class="form-field full"><label>Verfügbar an</label><div class="checkbox-grid">${DAY_NAMES.map((day,index) => `<label class="check-chip"><input type="checkbox" name="days" value="${index}" ${(task?.days || [0,1,2,3,4,5,6]).includes(index) ? "checked" : ""}><span>${day}</span></label>`).join("")}</div></div>
        </div>
        <p id="taskFormStatus" class="tiny muted" role="status" aria-live="polite"></p>
        <div class="modal-actions">${task ? `<button class="danger-button" type="button" data-action="delete-task-prompt" data-task-id="${task.id}">Aufgabe löschen</button>` : ""}<span class="modal-action-spacer"></span><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="button" data-action="save-task">Speichern</button></div>
      </form>`, { wide:true });
  }

  function setTaskFormStatus(message, isError = false) {
    const status = document.querySelector("#taskFormStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("form-error", Boolean(isError));
  }

  function saveTaskFromForm(form) {
    if (!form) return false;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const title = String(values.title || "").trim();
    const days = formData.getAll("days").map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6);
    if (!title) {
      setTaskFormStatus("Bitte einen Aufgabenname eingeben.", true);
      form.querySelector?.('[name="title"]')?.focus?.();
      return false;
    }
    if (!days.length) {
      setTaskFormStatus("Bitte mindestens einen Wochentag auswählen.", true);
      return false;
    }

    const id = String(values.id || "").trim();
    const existingIndex = id ? data.tasks.findIndex(task => task.id === id) : -1;
    if (id && existingIndex < 0) {
      setTaskFormStatus("Die Aufgabe wurde auf einem anderen Gerät verändert oder gelöscht. Bitte schließen und erneut öffnen.", true);
      return false;
    }

    const requiredChildren = clamp(values.requiredChildren, 1, 8);
    const minAgeSolo = clamp(values.minAgeSolo, 0, 18);
    const requestedAgeSupport = formData.has("allowYoungerWithOlder");
    if (requestedAgeSupport && minAgeSolo === 0) {
      setTaskFormStatus("Bitte zuerst festlegen, ab welchem Alter die Aufgabe allein möglich ist.", true);
      return false;
    }
    const allowYoungerWithOlder = requestedAgeSupport && minAgeSolo > 0;
    const minAgeWithOlder = allowYoungerWithOlder ? clamp(values.minAgeWithOlder, 0, 18) : 0;
    const olderPartnerMinAge = allowYoungerWithOlder ? clamp(values.olderPartnerMinAge, 0, 18) : 0;
    if (allowYoungerWithOlder && minAgeWithOlder >= minAgeSolo) {
      setTaskFormStatus("Das Alter mit Begleitung muss unter dem Alter für die alleinige Durchführung liegen.", true);
      return false;
    }
    if (allowYoungerWithOlder && olderPartnerMinAge < minAgeSolo) {
      setTaskFormStatus("Das Begleitkind sollte mindestens das Alter für die alleinige Durchführung haben.", true);
      return false;
    }

    const nextTask = {
      ...(existingIndex >= 0 ? data.tasks[existingIndex] : { id:uid(), active:true }),
      title,
      icon:String(values.icon || "✅"),
      category:String(values.category || "").trim() || "Alltag",
      competence:String(values.competence || "Selbstständigkeit"),
      requiredChildren,
      repeatMode:requiredChildren > 1 ? "shared" : (values.repeatMode === "perChild" ? "perChild" : "shared"),
      coins:clamp(values.coins,0,100),
      seeds:clamp(values.seeds,0,100),
      stars:clamp(values.stars,0,5),
      communityPoints:clamp(values.communityPoints,0,10),
      instructions:String(values.instructions || "").trim(),
      minAgeSolo,
      allowYoungerWithOlder,
      minAgeWithOlder,
      olderPartnerMinAge,
      days:[...new Set(days)].sort((a,b) => a-b),
      updatedAt:Date.now()
    };

    const previousTasks = clone(data.tasks);
    if (existingIndex >= 0) data.tasks.splice(existingIndex, 1, nextTask);
    else data.tasks.push(nextTask);

    setTaskFormStatus("Wird gespeichert …");
    if (!saveData({ snapshot:true })) {
      data.tasks = previousTasks;
      setTaskFormStatus("Die Aufgabe konnte nicht gespeichert werden.", true);
      return false;
    }

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const verified = Array.isArray(stored.tasks) && stored.tasks.some(task => task.id === nextTask.id && task.title === nextTask.title);
      if (!verified) throw new Error("Aufgabe fehlt nach Speicherprüfung");
    } catch (error) {
      data.tasks = previousTasks;
      saveData({ snapshot:false });
      setTaskFormStatus("Die Speicherprüfung ist fehlgeschlagen. Bitte noch einmal versuchen.", true);
      console.error("Mitmach-Welt: Aufgabenprüfung fehlgeschlagen", error);
      return false;
    }

    closeModal();
    ui.educatorTab = "tasks";
    render();
    showToast(existingIndex >= 0 ? "Aufgabe wurde gespeichert und aktualisiert." : "Neue Aufgabe wurde gespeichert.");
    return true;
  }

  function removeTask(taskId) {
    const index = data.tasks.findIndex(task => task.id === taskId);
    if (index < 0) return false;
    const previous = clone(data);
    const claimIds = new Set(data.claims.filter(claim => claim.taskId === taskId).map(claim => claim.id));
    data.tasks.splice(index, 1);
    data.claims = data.claims.filter(claim => claim.taskId !== taskId);
    data.history = data.history.filter(entry => entry.taskId !== taskId && !claimIds.has(entry.claimId));
    if (!saveData({ snapshot:true })) {
      data = previous;
      return false;
    }
    return true;
  }

  function openGoalEditor(goalId = null) {
    const goal = goalId ? goalById(goalId) : null;
    openModal(goal ? "Tagesmission bearbeiten" : "Tagesmission anlegen", `
      <form id="goalForm"><input type="hidden" name="id" value="${escapeHtml(goalId || "")}">
        <div class="form-grid">
          <div class="form-field"><label>Kind</label><select name="childId" required>${activeChildren().map(child => `<option value="${child.id}" ${goal?.childId === child.id ? "selected" : ""}>${child.avatar} ${escapeHtml(child.name)}</option>`).join("")}</select></div>
          <div class="form-field"><label>Symbol</label><select name="icon">${GOAL_ICONS.map(icon => `<option value="${icon}" ${goal?.icon === icon ? "selected" : ""}>${icon}</option>`).join("")}</select></div>
          <div class="form-field full"><label>Positiv formulierte Mission</label><textarea name="title" required maxlength="180" placeholder="Ich versuche ruhig zu bleiben und freundlich mit anderen umzugehen.">${escapeHtml(goal?.title || "")}</textarea></div>
          <div class="form-field"><label>Geschafft: Münzen</label><input name="achievedCoins" type="number" min="0" max="100" value="${goal?.achievedCoins ?? 5}"></div>
          <div class="form-field"><label>Geschafft: Samen</label><input name="achievedSeeds" type="number" min="0" max="100" value="${goal?.achievedSeeds ?? 3}"></div>
          <div class="form-field"><label>Geschafft: Sterne</label><input name="achievedStars" type="number" min="0" max="5" value="${goal?.achievedStars ?? 0}"></div>
          <div class="form-field"><label>Teilweise: Münzen</label><input name="partialCoins" type="number" min="0" max="100" value="${goal?.partialCoins ?? 2}"></div>
          <div class="form-field"><label>Teilweise: Samen</label><input name="partialSeeds" type="number" min="0" max="100" value="${goal?.partialSeeds ?? 1}"></div>
        </div>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="submit">Speichern</button></div>
      </form>`, { wide:true });
  }

  function openWishEditor(wishId = null) {
    const wish = wishId ? wishById(wishId) : null;
    openModal(wish ? "Wunsch bearbeiten" : "Wunsch anlegen", `
      <form id="wishForm"><input type="hidden" name="id" value="${escapeHtml(wishId || "")}">
        <div class="form-grid">
          <div class="form-field"><label>Symbol</label><input name="icon" value="${escapeHtml(wish?.icon || "🎁")}" maxlength="4"></div>
          <div class="form-field"><label>Kosten in Münzen</label><input name="cost" type="number" min="1" max="999" value="${wish?.cost ?? 20}"></div>
          <div class="form-field full"><label>Wunsch</label><input name="title" value="${escapeHtml(wish?.title || "")}" required maxlength="80"></div>
          <div class="form-field full"><label>Hinweis für Kind und Team</label><textarea name="note" maxlength="240">${escapeHtml(wish?.note || "")}</textarea></div>
        </div>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="submit">Speichern</button></div>
      </form>`);
  }

  function openGoalReview(childId, goalId) {
    const child = childById(childId); const goal = goalById(goalId);
    if (!child || !goal) return;
    openModal(`Tagesmission mit ${child.name}`, `
      <form id="goalReviewForm">
        <input type="hidden" name="childId" value="${child.id}"><input type="hidden" name="goalId" value="${goal.id}">
        <div class="reward-reveal"><span class="main-emoji">${goal.icon}</span><h2>${escapeHtml(goal.title)}</h2><p class="muted">Zuerst schätzt das Kind den Tag ein. Danach trefft ihr gemeinsam eine wertschätzende Entscheidung.</p></div>
        <div class="form-field"><label>So sieht das Kind seinen Tag</label><select name="childView" required><option value="">Bitte gemeinsam auswählen</option><option value="achieved">🌟 Das hat gut geklappt</option><option value="partial">🌱 Teilweise – einiges hat schon geklappt</option><option value="notYet">🌤️ Heute war es noch schwierig</option></select></div>
        <div class="form-field" style="margin-top:14px"><label>Gemeinsame Entscheidung</label><select name="result" required><option value="">Bitte gemeinsam auswählen</option><option value="achieved">🌟 Geschafft</option><option value="partial">🌱 Teilweise geschafft</option><option value="notYet">🌤️ Heute noch nicht</option></select></div>
        <div class="form-field" style="margin-top:14px"><label>Kurze wertschätzende Rückmeldung (optional)</label><textarea name="note" placeholder="Was ist heute schon gut gelungen? Was kann morgen helfen?"></textarea></div>
        <div class="callout success" style="margin-top:14px"><p><b>Belohnung:</b> Geschafft = 🪙 ${goal.achievedCoins}, 🌱 ${goal.achievedSeeds}${goal.achievedStars ? `, ⭐ ${goal.achievedStars}` : ""}. Teilweise = 🪙 ${goal.partialCoins}, 🌱 ${goal.partialSeeds}. Heute noch nicht = keine Abzüge.</p></div>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="submit">Gespräch abschließen</button></div>
      </form>`);
  }

  function openDeclineClaim(claimId) {
    const claim = data.claims.find(item => item.id === claimId); const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task) return;
    openModal("Aufgabe noch nicht bestätigen", `
      <p>Die Kinder bekommen keine Minuspunkte. Beim nächsten Öffnen erscheint eine freundliche Rückmeldung.</p>
      <div class="form-field"><label>Kurzer Hinweis (optional)</label><textarea id="declineNote" placeholder="Zum Beispiel: Ein Teil des Hofes musste noch gemeinsam fertig gemacht werden."></textarea></div>
      <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="danger-button" type="button" data-action="confirm-decline-claim" data-claim-id="${claimId}">Noch nicht bestätigen</button></div>`);
  }

  function buyWorldItem(childId, itemId) {
    const child = childById(childId); const item = itemById(itemId);
    if (!child || !item) return false;
    if (item.seedCost) {
      if (child.seeds < item.seedCost) return false;
      child.seeds -= item.seedCost;
    } else if (item.starCost) {
      if (child.stars < item.starCost) return false;
      child.stars -= item.starCost;
    }
    child.inventory.push(item.id);
    data.history.push({ id:uid(), type:"world_item_bought", childId, itemId, seedCost:item.seedCost || 0, starCost:item.starCost || 0, timestamp:Date.now() });
    saveData({ snapshot:true });
    celebrate(18);
    return true;
  }

  function requestWish(childId, wishId) {
    const child = childById(childId); const wish = wishById(wishId);
    if (!child || !wish || !wish.active || child.coins < wish.cost) return false;
    if (data.wishRequests.some(request => request.childId === childId && request.wishId === wishId && request.status === "pending")) return false;
    child.coins -= wish.cost;
    data.wishRequests.push({ id:uid(), childId, wishId, cost:wish.cost, status:"pending", createdAt:Date.now(), reviewedAt:0 });
    data.history.push({ id:uid(), type:"wish_requested", childId, wishId, cost:wish.cost, timestamp:Date.now() });
    saveData({ snapshot:true });
    return true;
  }

  function reviewWish(requestId, approved) {
    const request = data.wishRequests.find(item => item.id === requestId);
    const child = request ? childById(request.childId) : null;
    const wish = request ? wishById(request.wishId) : null;
    if (!request || !child || !wish || request.status !== "pending") return false;
    request.status = approved ? "approved" : "rejected";
    request.reviewedAt = Date.now();
    if (!approved) child.coins += request.cost;
    addNotification(child.id, {
      type:"wish", title:approved ? "Dein Wunsch ist vorgemerkt" : "Deine Münzen sind wieder da",
      message:approved ? `${wish.icon} ${wish.title} wurde angenommen.` : `${wish.icon} Der Wunsch konnte diesmal nicht angenommen werden.`,
      detail:approved ? "Sprecht gemeinsam ab, wann er gut in den Alltag passt." : `${request.cost} Münzen wurden vollständig zurückgegeben.`, positive:approved
    });
    data.history.push({ id:uid(), type:approved ? "wish_approved" : "wish_rejected", childId:child.id, wishId:wish.id, timestamp:Date.now() });
    saveData({ snapshot:true });
    return true;
  }

  function exportData() {
    saveSnapshot();
    const payload = {
      exportType:"Mitmach-Welt-Datensicherung",
      exportedAt:new Date().toISOString(),
      appVersion:APP_VERSION,
      schemaVersion:SCHEMA_VERSION,
      data
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Mitmach-Welt_Sicherung_${todayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Sicherungsdatei wurde erstellt.");
  }

  function importDataFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const incoming = parsed.data || parsed;
        if (!incoming || !Array.isArray(incoming.children) || !Array.isArray(incoming.tasks)) throw new Error("Ungültige Sicherung");
        if (!window.confirm("Die aktuellen Daten werden durch diese Sicherung ersetzt. Fortfahren?")) return;
        saveSnapshot();
        data = normalizeData(incoming);
        saveData({ snapshot:true });
        closeModal();
        render();
        showToast("Sicherung wurde wiederhergestellt.");
      } catch {
        showToast("Diese Datei ist keine gültige Mitmach-Welt-Sicherung.");
      }
    };
    reader.readAsText(file);
  }

  function restorePreV2() {
    const old = readJson(PRE_V2_BACKUP_KEY);
    if (!old) return;
    if (!window.confirm("Die automatisch gesicherte Kopie vor Version 2.0 wiederherstellen? Die aktuellen Daten werden vorher zusätzlich gesichert.")) return;
    saveSnapshot();
    data = normalizeData(old);
    saveData({ snapshot:true });
    render();
    showToast("Alte Datenkopie wurde wiederhergestellt.");
  }

  function restoreSnapshot(index) {
    const ring = readJson(BACKUP_RING_KEY) || [];
    const snapshot = ring[Number(index)];
    if (!snapshot?.data) return;
    if (!window.confirm(`Sicherung vom ${formatDateTime(snapshot.createdAt)} wiederherstellen?`)) return;
    saveSnapshot();
    data = normalizeData(snapshot.data);
    saveData({ snapshot:true });
    render();
    showToast("Momentaufnahme wurde wiederhergestellt.");
  }

  document.addEventListener("click", event => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;
    if (actionElement.classList.contains("modal-backdrop") && event.target !== actionElement) return;
    const action = actionElement.dataset.action;

    switch (action) {
      case "close-modal": closeModal(); break;
      case "go-home": goHome(); break;
      case "open-child": ui.childId = actionElement.dataset.childId; navigate("child", { childId:ui.childId }); break;
      case "child-tasks": navigate("tasks", { childId:ui.childId }); break;
      case "child-missions": navigate("missions", { childId:ui.childId }); break;
      case "child-world": navigate("world", { childId:ui.childId }); break;
      case "child-shop": navigate("shop", { childId:ui.childId }); break;
      case "child-achievements": navigate("achievements", { childId:ui.childId }); break;
      case "nav-group": navigate("group"); break;
      case "nav-educator": navigate("educator"); break;
      case "open-round":
        ui.roundDraft = { participants:[] };
        navigate("roundSetup");
        break;
      case "toggle-round-child": {
        if (!ui.roundDraft || !Array.isArray(ui.roundDraft.participants)) ui.roundDraft = { participants:[] };
        const id = actionElement.dataset.childId;
        ui.roundDraft.participants = ui.roundDraft.participants.includes(id)
          ? ui.roundDraft.participants.filter(childId => childId !== id)
          : [...ui.roundDraft.participants, id];
        render();
        break;
      }
      case "start-round": startRound(); break;
      case "round-choose-task": chooseRoundTask(actionElement.dataset.taskId); break;
      case "finish-round": ui.roundDraft = null; goHome(); break;
      case "reserve-task": {
        const result = reserveTask(actionElement.dataset.childId, actionElement.dataset.taskId, "solo");
        showToast(result.message);
        if (result.ok) render();
        break;
      }
      case "leave-claim":
        leaveClaim(actionElement.dataset.childId, actionElement.dataset.claimId);
        showToast("Aufgabe wurde wieder freigegeben.");
        render();
        break;
      case "report-claim": {
        const result = reportClaim(actionElement.dataset.childId, actionElement.dataset.claimId);
        showToast(result.message);
        if (result.ok) { celebrate(12); render(); }
        break;
      }
      case "shop-tab": ui.shopTab = actionElement.dataset.tab; render(); break;
      case "buy-world-item": {
        const child = childById(actionElement.dataset.childId); const item = itemById(actionElement.dataset.itemId);
        if (!child || !item) break;
        const price = item.seedCost ? `${item.seedCost} Samen` : `${item.starCost} Sterne`;
        confirmModal({ title:`${item.icon} ${item.title}`, message:`Möchtest du ${escapeHtml(item.title)} für ${price} in deine Welt holen?`, confirmText:"Ja, in meine Welt", confirmAction:"confirm-buy-world", payload:{"child-id":child.id,"item-id":item.id} });
        break;
      }
      case "confirm-buy-world": {
        const ok = buyWorldItem(actionElement.dataset.childId, actionElement.dataset.itemId);
        closeModal();
        showToast(ok ? "Der Gegenstand ist jetzt in deiner Welt." : "Dafür reicht dein Guthaben noch nicht.");
        render();
        break;
      }
      case "request-wish": {
        const child = childById(actionElement.dataset.childId); const wish = wishById(actionElement.dataset.wishId);
        if (!child || !wish) break;
        confirmModal({ title:`${wish.icon} Wunsch vormerken`, message:`Möchtest du „${escapeHtml(wish.title)}“ für ${wish.cost} Münzen vormerken? Ein Erzieher stimmt den Wunsch später mit dir ab.`, confirmText:"Wunsch vormerken", confirmAction:"confirm-request-wish", payload:{"child-id":child.id,"wish-id":wish.id} });
        break;
      }
      case "confirm-request-wish": {
        const ok = requestWish(actionElement.dataset.childId, actionElement.dataset.wishId);
        closeModal();
        showToast(ok ? "Dein Wunsch ist vorgemerkt." : "Der Wunsch konnte nicht vorgemerkt werden.");
        render();
        break;
      }
      case "exchange-coins":
        confirmModal({ title:"Münzen in Samen tauschen", message:`${data.settings.exchangeCoins} Münzen werden in ${data.settings.exchangeSeeds} Samen getauscht. Dieser Tausch kann nicht rückgängig gemacht werden.`, confirmText:"Jetzt tauschen", confirmAction:"confirm-exchange-coins", payload:{"child-id":actionElement.dataset.childId} });
        break;
      case "confirm-exchange-coins": {
        const child = childById(actionElement.dataset.childId);
        if (child && child.coins >= data.settings.exchangeCoins) {
          child.coins -= data.settings.exchangeCoins;
          child.seeds += data.settings.exchangeSeeds;
          data.history.push({ id:uid(), type:"coin_seed_exchange", childId:child.id, coins:data.settings.exchangeCoins, seeds:data.settings.exchangeSeeds, timestamp:Date.now() });
          saveData({ snapshot:true });
          celebrate(10);
          showToast("Samen wurden deinem Guthaben hinzugefügt.");
        }
        closeModal(); render();
        break;
      }
      case "educator-tab": ui.educatorTab = actionElement.dataset.tab; render(); break;
      case "lock-educator": ui.educatorUnlocked = false; ui.educatorTab = "review"; render(); break;
      case "approve-claim":
        if (reviewClaim(actionElement.dataset.claimId, "approve")) { showToast("Aufgabe wurde bestätigt."); celebrate(10); render(); }
        break;
      case "decline-claim-prompt": openDeclineClaim(actionElement.dataset.claimId); break;
      case "confirm-decline-claim": {
        const note = document.querySelector("#declineNote")?.value.trim() || "";
        if (reviewClaim(actionElement.dataset.claimId, "decline", note)) showToast("Freundliche Rückmeldung wurde gespeichert.");
        closeModal(); render();
        break;
      }
      case "approve-all-claims":
        confirmModal({ title:"Alle Aufgaben bestätigen?", message:"Alle derzeit offen gemeldeten Aufgaben werden bestätigt und die Belohnungen gutgeschrieben.", confirmText:"Alle bestätigen", confirmAction:"confirm-approve-all", confirmClass:"success-button" });
        break;
      case "confirm-approve-all": {
        const ids = data.claims.filter(claim => claim.status === "reported").map(claim => claim.id);
        ids.forEach(id => reviewClaim(id, "approve"));
        closeModal(); celebrate(24); showToast(`${ids.length} Aufgabe${ids.length === 1 ? "" : "n"} bestätigt.`); render();
        break;
      }
      case "open-goal-review": openGoalReview(actionElement.dataset.childId, actionElement.dataset.goalId); break;
      case "approve-wish": if (reviewWish(actionElement.dataset.requestId, true)) { showToast("Wunsch wurde angenommen."); render(); } break;
      case "reject-wish": if (reviewWish(actionElement.dataset.requestId, false)) { showToast("Münzen wurden zurückerstattet."); render(); } break;
      case "open-child-editor": openChildEditor(actionElement.dataset.childId || null); break;
      case "archive-child": { const child=childById(actionElement.dataset.childId); if(child){ child.active=false; saveData({snapshot:true}); showToast("Kinderprofil wurde archiviert."); render(); } break; }
      case "restore-child": { const child=childById(actionElement.dataset.childId); if(child){ child.active=true; child.deletedAt=0; saveData({snapshot:true}); showToast("Kinderprofil wurde wiederhergestellt."); render(); } break; }
      case "trash-child": { const child=childById(actionElement.dataset.childId); if(child){ child.active=false; child.deletedAt=Date.now(); saveData({snapshot:true}); showToast("Kinderprofil wurde in den Papierkorb verschoben."); render(); } break; }
      case "delete-child-prompt": { const child=childById(actionElement.dataset.childId); if(child) confirmModal({title:"Kinderprofil endgültig löschen?",message:`${child.name} und alle persönlichen Aufgaben, Fortschritte, Wünsche und Rückmeldungen werden unwiderruflich gelöscht.`,confirmText:"Endgültig löschen",confirmAction:"delete-child-confirm",confirmClass:"danger-button", payload:{"child-id":child.id}}); break; }
      case "delete-child-confirm": { const id=actionElement.dataset.childId; const child=childById(id); if(child){ removeChildRelations(id); data.children=data.children.filter(item=>item.id!==id); saveData({snapshot:true}); closeModal(); showToast("Kinderprofil wurde endgültig gelöscht."); render(); } break; }
      case "open-group-setup": openGroupSetup(); break;
      case "open-task-editor": openTaskEditor(actionElement.dataset.taskId || null); break;
      case "save-task": saveTaskFromForm(document.querySelector("#taskForm")); break;
      case "delete-task-prompt": {
        const task = taskById(actionElement.dataset.taskId);
        if (!task) { showToast("Diese Aufgabe wurde nicht gefunden."); break; }
        const linked = data.claims.filter(claim => claim.taskId === task.id);
        const openCount = linked.filter(claim => ["reserved","reported"].includes(claim.status)).length;
        confirmModal({
          title:"Aufgabe wirklich löschen?",
          message:`„${escapeHtml(task.title)}“ wird endgültig entfernt.${linked.length ? ` ${linked.length} zugehörige Aufgabenzuordnung${linked.length === 1 ? "" : "en"} werden ebenfalls entfernt${openCount ? `, davon ${openCount} aktuell offen` : ""}. Bereits gutgeschriebene Münzen und Samen bleiben erhalten.` : ""}`,
          confirmText:"Aufgabe löschen",
          confirmAction:"delete-task-confirm",
          confirmClass:"danger-button",
          payload:{"task-id":task.id}
        });
        break;
      }
      case "delete-task-confirm": {
        const task = taskById(actionElement.dataset.taskId);
        if (!task) { closeModal(); showToast("Die Aufgabe ist bereits gelöscht."); render(); break; }
        const title = task.title;
        if (removeTask(task.id)) {
          closeModal(); ui.educatorTab="tasks"; render(); showToast(`„${title}“ wurde gelöscht.`);
        } else showToast("Die Aufgabe konnte nicht gelöscht werden.");
        break;
      }
      case "toggle-task-active": {
        const task = taskById(actionElement.dataset.taskId); if (task) { task.active = !task.active; saveData({ snapshot:true }); render(); }
        break;
      }
      case "open-goal-editor": openGoalEditor(actionElement.dataset.goalId || null); break;
      case "toggle-goal-active": {
        const goal = goalById(actionElement.dataset.goalId); if (goal) { goal.active = !goal.active; saveData({ snapshot:true }); render(); }
        break;
      }
      case "open-wish-editor": openWishEditor(actionElement.dataset.wishId || null); break;
      case "toggle-wish-active": {
        const wish = wishById(actionElement.dataset.wishId); if (wish) { wish.active = !wish.active; saveData({ snapshot:true }); render(); }
        break;
      }
      case "avatar-category": {
        ui.avatarCategory = actionElement.dataset.category;
        document.querySelectorAll("[data-action='avatar-category']").forEach(button => button.classList.toggle("active", button.dataset.category === ui.avatarCategory));
        const selected = document.querySelector("#childAvatarValue")?.value || "🦄";
        const picker = document.querySelector("#avatarPicker"); if (picker) picker.innerHTML = renderAvatarOptions(selected);
        break;
      }
      case "select-avatar": {
        const input = document.querySelector("#childAvatarValue"); if (input) input.value = actionElement.dataset.avatar;
        document.querySelectorAll(".avatar-option").forEach(button => button.classList.toggle("selected", button === actionElement));
        break;
      }
      case "select-child-color": {
        const input = document.querySelector("#childAccentValue"); if (input) input.value = actionElement.dataset.color;
        document.querySelectorAll(".color-option").forEach(button => button.classList.toggle("selected", button === actionElement));
        break;
      }
      case "export-data": exportData(); break;
      case "restore-pre-v2": restorePreV2(); break;
      case "restore-snapshot": restoreSnapshot(actionElement.dataset.index); break;
      case "mark-notifications-seen": {
        data.notifications.forEach(note => { if (note.childId === actionElement.dataset.childId && !note.seen) note.seen = true; });
        saveData(); closeModal(); navigate("world", { push:false, childId:actionElement.dataset.childId });
        break;
      }
      default: break;
    }
  });

  document.querySelectorAll(".bottom-nav button").forEach(button => button.addEventListener("click", () => {
    if (button.dataset.nav === "home") goHome();
    if (button.dataset.nav === "group") navigate("group");
    if (button.dataset.nav === "educator") navigate("educator");
  }));
  backButton.addEventListener("click", goBack);
  homeButton.addEventListener("click", goHome);

  document.addEventListener("submit", event => {
    const form = event.target;
    event.preventDefault();

    if (form.id === "pinForm") {
      const pin = new FormData(form).get("pin");
      if (String(pin) === String(data.settings.pin)) {
        ui.educatorUnlocked = true;
        ui.educatorTab = "review";
        showToast("Erzieherbereich entsperrt.");
        render();
      } else {
        showToast("PIN ist nicht richtig.");
        form.reset();
      }
      return;
    }

    if (form.id === "childForm") {
      saveChildFromForm(form);
      return;
    }

    if (form.id === "groupSetupForm") {
      const fd = new FormData(form);
      if (String(fd.get("pin")) !== String(data.settings.pin)) { showToast("PIN ist nicht richtig."); return; }
      setupFreshGroup({ keepTasks:fd.has("keepTasks"), keepWishes:fd.has("keepWishes") });
      closeModal(); ui.educatorTab="children"; showToast("Sechs neue Kinderprofile wurden auf null angelegt."); render();
      return;
    }

    if (form.id === "taskForm") {
      saveTaskFromForm(form);
      return;
    }

    if (form.id === "goalForm") {
      const values = Object.fromEntries(new FormData(form).entries()); const existing = values.id ? goalById(values.id) : null;
      const goal = existing || { id:uid(), active:true, createdAt:Date.now() };
      Object.assign(goal, {
        childId:values.childId, icon:values.icon || "🌱", title:values.title.trim(), achievedCoins:clamp(values.achievedCoins,0,100),
        achievedSeeds:clamp(values.achievedSeeds,0,100), achievedStars:clamp(values.achievedStars,0,5), partialCoins:clamp(values.partialCoins,0,100), partialSeeds:clamp(values.partialSeeds,0,100)
      });
      if (!existing) data.personalGoals.push(goal);
      saveData({ snapshot:true }); closeModal(); showToast(existing ? "Tagesmission wurde aktualisiert." : "Tagesmission wurde angelegt."); render();
      return;
    }

    if (form.id === "wishForm") {
      const values = Object.fromEntries(new FormData(form).entries()); const existing = values.id ? wishById(values.id) : null;
      const wish = existing || { id:uid(), active:true };
      Object.assign(wish, { icon:values.icon.trim() || "🎁", title:values.title.trim(), cost:clamp(values.cost,1,999), note:values.note.trim() });
      if (!existing) data.wishes.push(wish);
      saveData({ snapshot:true }); closeModal(); showToast(existing ? "Wunsch wurde aktualisiert." : "Wunsch wurde angelegt."); render();
      return;
    }

    if (form.id === "settingsForm") {
      const formData = new FormData(form); const values = Object.fromEntries(formData.entries());
      data.settings.groupName = values.groupName.trim() || "Unsere Gruppe";
      data.settings.pin = values.pin.trim() || "2468";
      data.settings.reduceMotion = values.reduceMotion === "true";
      data.settings.communityCoinThreshold = clamp(values.communityCoinThreshold,10,5000);
      data.settings.communitySeedThreshold = clamp(values.communitySeedThreshold,10,5000);
      data.settings.exchangeCoins = clamp(values.exchangeCoins,1,500);
      data.settings.exchangeSeeds = clamp(values.exchangeSeeds,1,500);
      data.settings.allowCoinSeedExchange = formData.has("allowCoinSeedExchange");
      saveData({ snapshot:true }); showToast("Einstellungen wurden gespeichert."); render();
      return;
    }

    if (form.id === "goalReviewForm") {
      const values = Object.fromEntries(new FormData(form).entries());
      const ok = evaluateGoal({ childId:values.childId, goalId:values.goalId, childView:values.childView, result:values.result, note:values.note.trim() });
      closeModal(); showToast(ok ? "Tagesmission wurde gemeinsam ausgewertet." : "Diese Mission wurde heute schon ausgewertet."); render();
    }
  });

  document.addEventListener("change", event => {
    if (event.target.id === "importFile" && event.target.files?.[0]) importDataFile(event.target.files[0]);
  });

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register("./sw.js").then(registration => {
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) updateBanner.hidden = false;
        });
      });
    }).catch(() => {});
    navigator.serviceWorker.addEventListener("controllerchange", () => location.reload());
  }

  document.querySelector("#reloadApp")?.addEventListener("click", async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    registration?.waiting?.postMessage({ type:"SKIP_WAITING" });
    location.reload();
  });

  window.addEventListener("beforeunload", () => saveData({ notify:false }));
  applyPreferences();
  registerServiceWorker();
  render();

  // Kleine Diagnosehilfe für lokale Tests. Enthält keine personenbezogenen Daten.
  window.MitmachWelt = {
    version: APP_VERSION,
    getSummary: () => ({ children:data.children.length, tasks:data.tasks.length, claims:data.claims.length, goals:data.personalGoals.length, schemaVersion:data.schemaVersion }),
    getData: () => clone(data),
    getPin: () => String(data.settings.pin || "2468"),
    replaceData: (nextData, options = {}) => {
      data = normalizeData(nextData);
      const saved = saveData({ snapshot:Boolean(options.snapshot), notify:Boolean(options.notify) });
      if (options.render !== false) render();
      return saved;
    },
    subscribeToSaves: listener => {
      if (typeof listener !== "function") return () => {};
      saveListeners.add(listener);
      return () => saveListeners.delete(listener);
    },
    showToast,
    render,
    goHome,
    saveChildFromForm,
    saveTaskFromForm,
    removeTask,
    getChildAge: childId => childAge(childById(childId)),
    getTaskAgeEligibility: (childId, taskId) => clone(taskAgeEligibility(childById(childId), taskById(taskId))),
    reserveTask,
    reportClaim
  };
})();
