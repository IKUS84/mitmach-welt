(() => {
  "use strict";

  const APP_VERSION = "2.6.0";
  const SCHEMA_VERSION = 6;
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

  const WEATHER_LAT = 51.9413;
  const WEATHER_LON = 13.8985;
  const CATALOG_VERSION = 1;
  const TASK_CATEGORIES = ["Haushalt","Zimmer & Ordnung","Außenbereich","Schule & Lernen","Sonstiges"];
  const WISH_CATEGORIES = ["Kleine Belohnungen","Mittlere Belohnungen","Große Belohnungen"];
  const MISSION_ICON_GROUPS = [
    { title:"Verhalten & Miteinander", icons:["😊","🤝","💬","👂","🫶","❤️","🌟","🛡️","🙋","🧑‍🤝‍🧑","🚦","✋"] },
    { title:"Aufmerksamkeit & Lernen", icons:["👀","🎯","🧠","🧩","📚","✏️","🔎","💡","⏳","✅","🪜","🧭"] },
    { title:"Gefühle & Ruhe", icons:["😌","🌱","🌈","☀️","🌤️","💚","🫧","🧘","💪","🦋","🌻","⭐"] },
    { title:"Alltag & Selbstständigkeit", icons:["🧹","🛏️","🪥","🚿","👕","🎒","🍽️","🗑️","🪴","🧺","🏠","🕰️"] },
    { title:"Freizeit & Bewegung", icons:["⚽","🚲","🏃","🏊","🎨","🎵","🎲","🧸","📖","🛝","🌳","🐾"] }
  ];
  const MISSION_ICONS = [...new Set(MISSION_ICON_GROUPS.flatMap(group => group.icons))];

  const AVATARS = {
    "Tiere": ["🦄","🦊","🐼","🦁","🐸","🐨","🐯","🐰","🐧","🐙","🦋","🐬","🦈","🐳","🦖","🦕","🐲","🐉","🦜","🦉","🐝","🐞","🐢","🦔","🦦","🦥","🐿️","🐘","🦒","🦓","🦘","🐆","🐺","🐻‍❄️","🐵","🐴","🦭","🐶","🐱","🐭","🐹","🐻","🐮","🐷","🐽","🐗","🐔","🐣","🐤","🐦","🦆","🦅","🦇","🐴","🫎","🫏","🐝","🪲","🦗","🕷️","🦂","🐌","🐛","🪱","🐠","🐟","🐡","🦀","🦞","🦐","🦑","🐊","🐍","🦎","🐇","🦝","🦨","🦡","🦫","🦙","🐐","🦌","🐕","🐈","🐓","🦃","🦚","🦩","🕊️","🐏","🐑","🐃","🐂","🐄","🐎","🐖","🐒","🦍","🦧"],
    "Fantasie": ["🧚‍♀️","🧚‍♂️","🧜‍♀️","🧜‍♂️","🧙‍♀️","🧙‍♂️","🦸‍♀️","🦸‍♂️","👸","🤴","👑","🌈","⭐","🌙","☀️","🌻","🍄","🔮","🏰","🪄","🐈‍⬛","🪽","🌟","✨","🌠","🌌","☄️","🧞‍♀️","🧞‍♂️","🧝‍♀️","🧝‍♂️","🧛‍♀️","🧛‍♂️","🧟‍♀️","🧟‍♂️","🧌","👼","🎅","🤶","🧑‍🎄","🪅","🧿","🪬","🗿","🪐","🌛","🌜","🌝","🌞","💫","⚡","🔥","❄️","🌊","💎","🪩","🎇","🎆","🏯","🕌","⛩️","🛕","🗼","🗽","🎪","🎠","🎡","🎢"],
    "Menschen": ["👧","👦","🧒","👩‍🚀","👨‍🚀","👩‍🎨","👨‍🎨","👩‍🚒","👨‍🚒","👩‍🔬","👨‍🔬","👩‍🍳","👨‍🍳","👩‍🌾","👨‍🌾","🥷","🤠","🧑‍🎤","🧑‍🔧","🧑‍🏫","🧑‍⚕️","🧑‍🚀","🧑‍🎨","🧑‍🍳","🧑‍🌾","🧑‍🚒","🧑‍🔬","🧑‍💻","🧑‍🎓","🧑‍⚖️","🧑‍✈️","🧑‍🚀","🧑‍🎨","🧑‍🦰","🧑‍🦱","🧑‍🦳","🧑‍🦲","👱‍♀️","👱‍♂️","🙋‍♀️","🙋‍♂️","💁‍♀️","💁‍♂️","🙆‍♀️","🙆‍♂️","🧘‍♀️","🧘‍♂️","🏃‍♀️","🏃‍♂️","🚴‍♀️","🚴‍♂️","🏊‍♀️","🏊‍♂️","🤸‍♀️","🤸‍♂️","⛹️‍♀️","⛹️‍♂️","🤾‍♀️","🤾‍♂️","🧗‍♀️","🧗‍♂️","🏄‍♀️","🏄‍♂️","⛷️","🏂","🏋️‍♀️","🏋️‍♂️","🤹‍♀️","🤹‍♂️"],
    "Spaß": ["🤖","👻","👽","🎃","⛄","🌵","🍓","🍉","🍭","⚽","🏀","🎸","🎨","🚲","🚀","🛸","⛵","🎠","🧸","🎈","🎮","🛹","🎪","🎁","🚒","🚑","🚜","🏎️","🚂","🚁","🛶","🏝️","🏕️","🗺️","🧭","🎯","🎳","🪁","🛝","🛼","🛷","🥁","🎺","🎷","🎻","🪕","🎹","🎧","📚","🔭","🔬","🧪","🧩","♟️","🎲","🪄","🧙","🍕","🍔","🍟","🌮","🍦","🧁","🍪","🍩","🍫","🍿","🥨","🥞","🍎","🍒","🍍","🥕","🌽","🥦","🫐","🥝","🥥"]
  };

  const ACCENT_COLORS = ["#e96f82","#ef9f46","#f1c64d","#72ad67","#4fae98","#55a5d5","#7088dc","#9872d4","#d070ba","#a78061","#6e927d","#ef7d61","#66b4c2","#b189d1","#d58e63","#86a75c"];
  const DISPLAY_STYLES = [
    { id:"playful", icon:"🌈", title:"Verspielt", description:"Bunter, mit mehr Bewegung und freundlichen Formen" },
    { id:"modern", icon:"🎧", title:"Cool & modern", description:"Ruhigere Flächen, klare Kanten und weniger Dekoration" },
    { id:"neutral", icon:"◻️", title:"Neutral", description:"Schlicht, übersichtlich und ohne unnötige Animationen" }
  ];
  const WORLD_THEMES = [
    { id:"meadow", icon:"🌻", title:"Blumenwiese", description:"Wiese, Bäume und Tiere", starter:"🌱 🌼 🌳 🐞", style:"playful" },
    { id:"magic", icon:"🦄", title:"Zauberwald", description:"Pilze, Sterne und Magie", starter:"🍄 ✨ 🌲 🦋", style:"playful" },
    { id:"ocean", icon:"🐬", title:"Meeresbucht", description:"Strand, Wasser und Delfine", starter:"🐚 🌴 🐬 ⛵", style:"playful" },
    { id:"space", icon:"🚀", title:"Weltraumstation", description:"Planeten, Technik und Raketen", starter:"🪐 ⭐ 🚀 🛰️", style:"modern" },
    { id:"dino", icon:"🦕", title:"Dinotal", description:"Dinos, Urwald und Vulkan", starter:"🌿 🦕 🌋 🥚", style:"playful" },
    { id:"farm", icon:"🚜", title:"Bauernhof", description:"Tiere, Felder und Scheune", starter:"🌾 🚜 🐄 🐔", style:"playful" },
    { id:"gaming", icon:"🎮", title:"Gaming-Zimmer", description:"Konsole, Licht und eigene Ausstattung", starter:"🎮 🖥️ 🎧 🪑", style:"modern" },
    { id:"music", icon:"🎧", title:"Musikstudio", description:"Beats, Instrumente und Lautsprecher", starter:"🎧 🎹 🎤 🔊", style:"modern" },
    { id:"sport", icon:"⚽", title:"Sportarena", description:"Training, Teamgeist und neue Ausrüstung", starter:"⚽ 🏀 🏆 👟", style:"modern" },
    { id:"city", icon:"🏙️", title:"City", description:"Straßen, Gebäude und Lichter", starter:"🏙️ 🚦 🛹 🌆", style:"modern" },
    { id:"street", icon:"🛹", title:"Streetpark", description:"Skaten, Basketball und Graffiti", starter:"🛹 🏀 🎨 🧢", style:"modern" },
    { id:"tech", icon:"💻", title:"Technik-Labor", description:"Computer, Roboter und Erfindungen", starter:"💻 🤖 🔧 🛰️", style:"modern" },
    { id:"outdoor", icon:"🏕️", title:"Outdoor-Camp", description:"Zelt, Feuerstelle und Abenteuer", starter:"🏕️ 🔥 🧭 🌲", style:"neutral" },
    { id:"lounge", icon:"🛋️", title:"Chill-Lounge", description:"Ruhiger Rückzugsort mit Licht und Musik", starter:"🛋️ 💡 🎵 🪴", style:"neutral" },
    { id:"creative", icon:"🎨", title:"Kreativstudio", description:"Farben, Ideen und eigene Projekte", starter:"🎨 🖌️ 📸 ✂️", style:"neutral" },
    { id:"night", icon:"🌌", title:"Nachthimmel", description:"Sterne, Ruhe und klare Formen", starter:"🌌 🌙 ⭐ 🔭", style:"neutral" }
  ];
  const TASK_ICONS = ["✅","🥣","🍲","🌙","🍽️","🧼","✨","🧹","👟","🚿","🪜","🛏️","🧸","🧺","👕","🪣","🌿","🪨","⚽","🛖","📚","😊","🎲","🗑️","🐾","🪴","🧽","🧤","🏡","🧑‍🤝‍🧑","🫧","📦","🎒","🪟","🧑‍🍳","🧑‍🌾","🚲"];
  const GOAL_ICONS = ["🌱","🌟","❤️","🤝","😌","👂","💬","🧠","🎒","🪥","🧸","📚","🧹","😊","🫶","⏰","🌈","🪴","🧘","🎯"];
  const WISH_ICON_GROUPS = [
    { title:"Beliebt", icons:["🎁","⭐","🌟","🎉","🥳","👑","🏆","💎","❤️","🌈","✨","🎈","🎂","🪄","🏅","🥇"] },
    { title:"Spiel, Medien & Kreatives", icons:["🎮","🕹️","🎲","🧩","♟️","🎯","🎳","🎬","🍿","📺","🎧","🎵","🎤","📚","📖","🖍️"] },
    { title:"Essen & Trinken", icons:["🍕","🍔","🍟","🌭","🍝","🍜","🥞","🧇","🍦","🍨","🧁","🍪","🍫","🍓","🍉","🥤"] },
    { title:"Freizeit & Bewegung", icons:["⚽","🏀","🏓","🏸","🚲","🛴","🛼","🛝","🏊","🎨","🎸","🥁","🏕️","⛺","🎪","🪁"] },
    { title:"Zeit & besondere Erlebnisse", icons:["🌙","⏰","🕒","🛏️","🛋️","🚗","🚌","🛍️","🛒","👨‍🍳","🧑‍🤝‍🧑","🤝","🫶","🥰","😄","☀️"] },
    { title:"Tiere, Natur & Ausflüge", icons:["🐶","🐱","🐴","🦄","🦖","🐬","🦋","🌳","🌻","🏖️","🏞️","🚂","✈️","🚀","⛵","🏰"] }
  ];
  const WISH_ICONS = WISH_ICON_GROUPS.flatMap(group => group.icons);
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
    { id:"dragon", icon:"🐉", title:"Kleiner Drache", starCost:4, category:"Sternenschatz", description:"Bewacht die persönlichen Bereich." },
    { id:"castle", icon:"🏰", title:"Sternenschloss", starCost:5, category:"Sternenschatz", description:"Eine besondere Auszeichnung." },
    { id:"gaming_chair", icon:"🪑", title:"Gaming-Stuhl", seedCost:24, category:"Ausstattung", description:"Ein bequemer Platz für dein Gaming-Zimmer.", themes:["gaming","tech"] },
    { id:"monitor", icon:"🖥️", title:"Großer Monitor", seedCost:38, category:"Technik", description:"Mehr Technik für deinen Bereich.", themes:["gaming","tech"] },
    { id:"console", icon:"🎮", title:"Spielkonsole", seedCost:52, category:"Technik", description:"Ein besonderes Upgrade für den Gaming-Bereich.", themes:["gaming"] },
    { id:"headphones", icon:"🎧", title:"Kopfhörer", seedCost:28, category:"Musik", description:"Für Musik, Gaming oder Ruhe.", themes:["gaming","music","lounge"] },
    { id:"speaker", icon:"🔊", title:"Lautsprecher", seedCost:35, category:"Musik", description:"Bringt Musik in deinen Bereich.", themes:["music","lounge"] },
    { id:"keyboard", icon:"🎹", title:"Keyboard", seedCost:46, category:"Musik", description:"Ein Instrument für dein eigenes Studio.", themes:["music"] },
    { id:"skateboard", icon:"🛹", title:"Skateboard", seedCost:30, category:"Sport", description:"Passt in den Streetpark oder die City.", themes:["street","city"] },
    { id:"basketball", icon:"🏀", title:"Basketballkorb", seedCost:42, category:"Sport", description:"Ein neues Trainingsziel.", themes:["sport","street"] },
    { id:"trophy", icon:"🏆", title:"Pokalregal", seedCost:55, category:"Sport", description:"Zeigt deine persönlichen Erfolge.", themes:["sport"] },
    { id:"robot", icon:"🤖", title:"Roboter", seedCost:48, category:"Technik", description:"Ein technischer Begleiter.", themes:["tech","space"] },
    { id:"city_light", icon:"🚦", title:"City-Licht", seedCost:26, category:"City", description:"Licht und Farbe für die Stadt.", themes:["city","street"] },
    { id:"sofa", icon:"🛋️", title:"Lounge-Sofa", seedCost:40, category:"Ausstattung", description:"Ein ruhiger Platz zum Abschalten.", themes:["lounge"] },
    { id:"camera", icon:"📸", title:"Kamera", seedCost:34, category:"Kreativ", description:"Für Ideen und kreative Projekte.", themes:["creative","city"] },
    { id:"campfire", icon:"🔥", title:"Feuerstelle", seedCost:36, category:"Outdoor", description:"Macht das Camp gemütlich.", themes:["outdoor"] }
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

  const DEFAULT_TASKS = [
    { id:"task_breakfast_table", title:"Frühstückstisch eindecken", icon:"🥣", category:"Haushalt", competence:"Verantwortung", coins:3, seeds:0, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Den Frühstückstisch vollständig und ordentlich eindecken." },
    { id:"task_lunch_table", title:"Mittagstisch eindecken", icon:"🍲", category:"Haushalt", competence:"Verantwortung", coins:3, seeds:0, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Den Mittagstisch vollständig und ordentlich eindecken." },
    { id:"task_dinner_table", title:"Abendbrottisch eindecken", icon:"🌙", category:"Haushalt", competence:"Verantwortung", coins:3, seeds:0, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Den Abendbrottisch vollständig und ordentlich eindecken." },
    { id:"task_dishwasher_load", title:"Geschirrspüler einräumen", icon:"🧼", category:"Haushalt", competence:"Selbstständigkeit", coins:4, seeds:0, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Geschirr ordentlich einräumen und prüfen, ob nichts den Sprüharm blockiert." },
    { id:"task_dishwasher_unload", title:"Geschirrspüler ausräumen", icon:"✨", category:"Haushalt", competence:"Selbstständigkeit", coins:4, seeds:0, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Sauberes Geschirr an die vorgesehenen Plätze räumen." },
    { id:"task_kitchen_vacuum", title:"Nach dem Abendbrot die Küche saugen", icon:"🧹", category:"Haushalt", competence:"Ordnung", coins:5, seeds:1, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Nach dem Abendbrot den gesamten Küchenboden gründlich saugen." },
    { id:"task_shoe_cabinet", title:"Schuhschrank fegen und auswischen", icon:"👟", category:"Haushalt", competence:"Ordnung", coins:6, seeds:1, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Schuhe herausnehmen, Schrank fegen, auswischen und ordentlich einräumen." },
    { id:"task_bathrooms", title:"Bäder kontrollieren und bei Bedarf nachreinigen", icon:"🚿", category:"Haushalt", competence:"Verantwortung", coins:7, seeds:1, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Waschbecken, Spiegel, Boden und Ordnung kontrollieren; bei Bedarf nachreinigen." },
    { id:"task_inside_stairs", title:"Innentreppe fegen", icon:"🪜", category:"Haushalt", competence:"Ordnung", coins:5, seeds:1, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Die Innentreppe von oben nach unten gründlich fegen." },
    { id:"task_cellar_stairs", title:"Kellertreppe fegen", icon:"🪜", category:"Haushalt", competence:"Ordnung", coins:6, seeds:1, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Die Kellertreppe gründlich und sicher fegen." },

    { id:"task_bed_tidy", title:"Bett ordentlich machen", icon:"🛏️", category:"Zimmer & Ordnung", competence:"Selbstständigkeit", coins:2, seeds:0, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Decke und Kissen ordentlich hinlegen und das Bett sauber hinterlassen." },
    { id:"task_room_tidy", title:"Zimmer aufräumen", icon:"🧸", category:"Zimmer & Ordnung", competence:"Ordnung", coins:5, seeds:1, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Fußboden, Schreibtisch und persönliche Sachen ordentlich aufräumen." },
    { id:"task_big_room_clean", title:"Große Zimmerreinigung (mittwochs)", icon:"✨", category:"Zimmer & Ordnung", competence:"Selbstständigkeit", coins:10, seeds:2, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[3], instructions:"Mittwochs das Zimmer gründlich reinigen und anschließend gemeinsam kontrollieren." },
    { id:"task_laundry_basket", title:"Wäschekorb am Waschtag selbstständig zur Waschmaschine bringen", icon:"🧺", category:"Zimmer & Ordnung", competence:"Selbstständigkeit", coins:3, seeds:0, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Nur am persönlichen Waschtag auswählen." },
    { id:"task_laundry_fold", title:"Eigene Wäsche zusammenlegen und in den Schrank räumen", icon:"👕", category:"Zimmer & Ordnung", competence:"Selbstständigkeit", coins:7, seeds:1, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Wäsche ordentlich zusammenlegen und an die richtigen Plätze im Schrank räumen." },

    { id:"task_yard_sweep", title:"Hof kehren", icon:"🧹", category:"Außenbereich", competence:"Verantwortung", coins:6, seeds:1, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Den vereinbarten Bereich des Hofes gründlich kehren." },
    { id:"task_stones_lawn", title:"Steine von der Wiese sammeln", icon:"🪨", category:"Außenbereich", competence:"Verantwortung", coins:5, seeds:1, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Sichtbare Steine einsammeln und an den vereinbarten Platz bringen." },
    { id:"task_toys_lawn", title:"Spielzeug von der Wiese einsammeln", icon:"⚽", category:"Außenbereich", competence:"Ordnung", coins:4, seeds:0, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:0, active:true, days:[0,1,2,3,4,5,6], instructions:"Spielzeug vollständig einsammeln und ordentlich zurückräumen." },
    { id:"task_outside_strip", title:"Außenstreifen reinigen", icon:"🌿", category:"Außenbereich", competence:"Verantwortung", coins:12, seeds:3, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:1, active:true, days:[0,1,2,3,4,5,6], instructions:"Hundekot mit Handschuhen oder Greifzange aufnehmen, Müll entfernen, harken und bei Bedarf nach Freigabe die Straße fegen." },
    { id:"task_game_shed", title:"Spieleschuppen aufräumen", icon:"🛖", category:"Außenbereich", competence:"Ordnung", coins:10, seeds:2, stars:0, requiredChildren:1, repeatMode:"shared", communityPoints:1, active:true, days:[0,1,2,3,4,5,6], instructions:"Spiele und Außenspielzeug sortieren, defekte Dinge melden und den Schuppen ordentlich hinterlassen." },

    { id:"task_learning_time", title:"Tägliche Lernzeit absolvieren", icon:"📚", category:"Schule & Lernen", competence:"Konzentration", coins:5, seeds:1, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[1,2,3,4,5], instructions:"Die vereinbarte Lernzeit konzentriert und vollständig absolvieren." },
    { id:"task_school_positive", title:"Positiver Smiley oder positives Feedback aus der Schule erhalten", icon:"😊", category:"Schule & Lernen", competence:"Selbstregulation", coins:8, seeds:2, stars:0, requiredChildren:1, repeatMode:"perChild", communityPoints:0, active:true, days:[1,2,3,4,5], instructions:"Positives Feedback aus Schule oder Hort gemeinsam vorzeigen und besprechen." },

    { id:"task_board_game", title:"Gesellschaftsspiele spielen", icon:"🎲", category:"Sonstiges", competence:"Zusammenarbeit", coins:8, seeds:2, stars:0, requiredChildren:2, repeatMode:"shared", communityPoints:2, active:true, days:[0,1,2,3,4,5,6], instructions:"Ein Gesellschaftsspiel gemeinsam beginnen und fair zu Ende spielen." }
  ];

  const DEFAULT_WISHES = [
    { id:"reward_late", icon:"🌙", title:"15 Minuten länger wach bleiben", category:"Kleine Belohnungen", cost:60, seedCost:0, active:true, note:"Nur wenn es an diesem Tag pädagogisch und organisatorisch passt." },
    { id:"reward_story", icon:"📖", title:"Gute-Nacht-Geschichte auswählen", category:"Kleine Belohnungen", cost:25, seedCost:0, active:true, note:"Das Kind darf die Geschichte für den Abend auswählen." },
    { id:"reward_tonie", icon:"🎵", title:"Eine Tonie-Figur für den Abend auswählen", category:"Kleine Belohnungen", cost:30, seedCost:0, active:true, note:"Für einen passenden Abend gemeinsam auswählen." },
    { id:"reward_evening_movie", icon:"🎬", title:"Den Film am Abend bestimmen", category:"Kleine Belohnungen", cost:60, seedCost:0, active:true, note:"Im Rahmen der Altersfreigabe und des Gruppenalltags." },
    { id:"reward_group_game", icon:"🎲", title:"Ein Spiel für die Gruppe auswählen", category:"Kleine Belohnungen", cost:35, seedCost:0, active:true, note:"Das Kind wählt ein passendes Gruppenspiel aus." },
    { id:"reward_back_scratch", icon:"🤲", title:"5 Minuten Rücken kraulen", category:"Kleine Belohnungen", cost:25, seedCost:0, active:true, note:"In einem passenden ruhigen Moment einlösen." },
    { id:"reward_ice", icon:"🍦", title:"Ein Eis aus dem Tiefkühlfach", category:"Kleine Belohnungen", cost:40, seedCost:0, active:true, note:"Nach Absprache und passend zum Tagesablauf." },
    { id:"reward_wifi", icon:"📶", title:"Eine Stunde WLAN-Zugang", category:"Kleine Belohnungen", cost:60, seedCost:0, active:true, note:"Im Rahmen der geltenden Medienregeln." },
    { id:"reward_phone", icon:"📱", title:"Eine Stunde zusätzliche Handyzeit", category:"Kleine Belohnungen", cost:75, seedCost:0, active:true, note:"Im Rahmen der geltenden Medienregeln." },
    { id:"reward_switch", icon:"🎮", title:"Eine Stunde Nintendo Switch", category:"Kleine Belohnungen", cost:85, seedCost:0, active:true, note:"Nach Absprache und wenn die Switch verfügbar ist." },
    { id:"reward_sweets", icon:"🍬", title:"Einmal in die Süßigkeitenkiste greifen", category:"Kleine Belohnungen", cost:50, seedCost:0, active:true, note:"Eine vereinbarte Portion auswählen." },

    { id:"reward_room_movie", icon:"📺", title:"Einen Film im eigenen Zimmer ansehen", category:"Mittlere Belohnungen", cost:150, seedCost:0, active:true, note:"DVD, Tablet oder ein anderes freigegebenes Gerät; nur nach Absprache." },
    { id:"reward_one_to_one", icon:"🫶", title:"Eine besondere Aktivität alleine mit einem Erzieher", category:"Mittlere Belohnungen", cost:220, seedCost:5, active:true, note:"Termin, Dauer und Aktivität werden gemeinsam geplant." },
    { id:"reward_radio", icon:"📻", title:"CD-Radio für eine Nacht ausleihen", category:"Mittlere Belohnungen", cost:120, seedCost:0, active:true, note:"Nur wenn das Gerät verfügbar ist und die Nachtruhe eingehalten wird." },
    { id:"reward_room_tv", icon:"📺", title:"Fernseher für eine Nacht im eigenen Zimmer (am Wochenende)", category:"Mittlere Belohnungen", cost:200, seedCost:0, active:true, note:"Nur am Wochenende und nach gemeinsamer Absprache." },
    { id:"reward_wakeup_song", icon:"🎶", title:"Einen Musikwunsch zum Wecken auswählen", category:"Mittlere Belohnungen", cost:100, seedCost:0, active:true, note:"Für Wochenende oder Ferien; Lautstärke und Inhalt müssen passen." },

    { id:"reward_group_movie", icon:"🍿", title:"Gruppen-Filmabend mit Popcorn, Süßigkeiten und Getränken", category:"Große Belohnungen", cost:400, seedCost:10, active:true, note:"Termin und Film werden gemeinsam mit dem Team abgestimmt." },
    { id:"reward_pizza", icon:"🍕", title:"Pizzaabend für die gesamte Gruppe", category:"Große Belohnungen", cost:600, seedCost:15, active:true, note:"Termin und Auswahl werden gemeinsam geplant." },
    { id:"reward_cinema", icon:"🎟️", title:"Zwei Kinokarten", category:"Große Belohnungen", cost:900, seedCost:20, active:true, note:"Film, Begleitung, Termin und Fahrt werden vorher abgestimmt." },
    { id:"reward_sweet_money", icon:"💶", title:"5 € Süßigkeitengeld", category:"Große Belohnungen", cost:650, seedCost:10, active:true, note:"Zum Beispiel für Lidl, Rossmann oder einen anderen passenden Markt." },
    { id:"reward_toy_shopping", icon:"🛍️", title:"Mit dem eigenen Taschengeld gemeinsam Spielzeug kaufen gehen", category:"Große Belohnungen", cost:350, seedCost:5, active:true, note:"Das Kind nutzt sein eigenes Taschengeld; Termin und Begleitung werden abgestimmt." }
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
      communityCoinThreshold: 250,
      catalogVersion: CATALOG_VERSION,
      autoApproveEnabled: true,
      autoApproveTime: "21:00",
      defaultReservationMinutes: 120
    },
    children: [
      { id:"lucy", name:"Lucy", avatar:"🦄", accent:"#d070ba", theme:"magic", coins:24, seeds:7, stars:0, completed:4, inventory:["lantern"], active:true, createdAt:Date.now()-86400000*10 },
      { id:"noah", name:"Noah", avatar:"🐼", accent:"#55a5d5", theme:"meadow", coins:18, seeds:5, stars:0, completed:3, inventory:[], active:true, createdAt:Date.now()-86400000*9 },
      { id:"tius", name:"Tius", avatar:"🦁", accent:"#ef9f46", theme:"dino", coins:13, seeds:4, stars:0, completed:2, inventory:[], active:true, createdAt:Date.now()-86400000*8 },
      { id:"jari", name:"Jari", avatar:"🐸", accent:"#72ad67", theme:"farm", coins:16, seeds:6, stars:0, completed:3, inventory:[], active:true, createdAt:Date.now()-86400000*7 }
    ],
    tasks: DEFAULT_TASKS,
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
  const normalizeWishIcon = value => {
    const text = String(value ?? "").replace(/[<>&"'`]/g, "").trim();
    if (!text) return "🎁";
    try {
      if (typeof Intl?.Segmenter === "function") {
        const first = Array.from(new Intl.Segmenter("de", { granularity:"grapheme" }).segment(text))[0];
        if (first?.segment) return first.segment;
      }
    } catch {}
    return Array.from(text).slice(0,4).join("") || "🎁";
  };
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
  const minutesNow = () => { const d=new Date(); return d.getHours()*60+d.getMinutes(); };
  const timeToMinutes = value => { const m=String(value||"00:00").match(/^(\d{2}):(\d{2})$/); return m ? Number(m[1])*60+Number(m[2]) : 0; };
  const taskTimeState = task => { const now=minutesNow(); return { visible:now>=timeToMinutes(task.visibleFrom||"00:00") && now<=timeToMinutes(task.availableUntil||"23:59"), reservable:now>=timeToMinutes(task.reservableFrom||"00:00") && now<=timeToMinutes(task.availableUntil||"23:59"), reportable:now>=timeToMinutes(task.reportableFrom||task.reservableFrom||"00:00") && now<=timeToMinutes(task.availableUntil||"23:59") }; };
  const remainingReservationText = claim => { const mins=Math.max(0,Math.ceil(((claim.expiresAt||0)-Date.now())/60000)); return mins>=60 ? `${Math.floor(mins/60)} Std. ${mins%60} Min.` : `${mins} Min.`; };

  function readJson(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  function normalizedTitle(value) {
    return String(value || "").trim().toLocaleLowerCase("de-DE").replace(/\s+/g," ");
  }

  function inferWishCategory(wish) {
    if (WISH_CATEGORIES.includes(wish?.category)) return wish.category;
    const coins = Number(wish?.cost || 0);
    if (coins >= 300) return "Große Belohnungen";
    if (coins >= 100) return "Mittlere Belohnungen";
    return "Kleine Belohnungen";
  }

  function wishPriceText(item) {
    const parts = [];
    const coins = Math.max(0, Number(item?.cost || 0));
    const seeds = Math.max(0, Number(item?.seedCost || 0));
    if (coins) parts.push(`🪙 ${coins}`);
    if (seeds) parts.push(`🌱 ${seeds}`);
    return parts.length ? parts.join(" + ") : "Kostenlos";
  }

  function canAffordWish(child, wish) {
    return Boolean(child && wish && child.coins >= Number(wish.cost || 0) && child.seeds >= Number(wish.seedCost || 0));
  }

  function applyPresetCatalog(target, installedCatalogVersion = 0) {
    if (installedCatalogVersion >= CATALOG_VERSION) return;
    target.tasks = Array.isArray(target.tasks) ? target.tasks : [];
    target.wishes = Array.isArray(target.wishes) ? target.wishes : [];

    const taskPresetById = Object.fromEntries(DEFAULT_TASKS.map(item => [item.id, item]));
    const taskMappings = {
      bed:"task_bed_tidy",
      room:"task_room_tidy",
      yard:"task_yard_sweep"
    };
    Object.entries(taskMappings).forEach(([legacyId,presetId]) => {
      const legacy = target.tasks.find(item => item.id === legacyId);
      const preset = taskPresetById[presetId];
      if (legacy && preset) Object.assign(legacy, clone(preset), { id:legacy.id });
    });

    const untouchedLegacyTasks = {
      table:"Tisch decken", toys:"Spielsachen aufräumen", plants:"Blumen gießen", trash:"Müll rausbringen",
      animals:"Tiere versorgen", commonroom:"Gemeinschaftsraum aufräumen"
    };
    Object.entries(untouchedLegacyTasks).forEach(([id,title]) => {
      const legacy = target.tasks.find(item => item.id === id && normalizedTitle(item.title) === normalizedTitle(title));
      if (legacy) legacy.active = false;
    });

    DEFAULT_TASKS.forEach(preset => {
      const exists = target.tasks.some(item => item.id === preset.id || normalizedTitle(item.title) === normalizedTitle(preset.title));
      if (!exists) target.tasks.push(clone(preset));
    });

    const wishPresetById = Object.fromEntries(DEFAULT_WISHES.map(item => [item.id, item]));
    const wishMappings = {
      story:"reward_story",
      game:"reward_group_game",
      awake:"reward_late",
      movie:"reward_evening_movie"
    };
    Object.entries(wishMappings).forEach(([legacyId,presetId]) => {
      const legacy = target.wishes.find(item => item.id === legacyId);
      const preset = wishPresetById[presetId];
      if (legacy && preset) Object.assign(legacy, clone(preset), { id:legacy.id });
    });
    const legacyFood = target.wishes.find(item => item.id === "food" && normalizedTitle(item.title) === normalizedTitle("Wunschessen mitbestimmen"));
    if (legacyFood) legacyFood.active = false;

    DEFAULT_WISHES.forEach(preset => {
      const exists = target.wishes.some(item => item.id === preset.id || normalizedTitle(item.title) === normalizedTitle(preset.title));
      if (!exists) target.wishes.push(clone(preset));
    });
    target.settings = { ...(target.settings || {}), catalogVersion:CATALOG_VERSION };
  }

  function normalizeData(raw) {
    const base = clone(DEFAULTS);
    if (!raw || typeof raw !== "object") return base;
    const installedCatalogVersion = Number(raw?.settings?.catalogVersion || 0);

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
      wishes: Array.isArray(raw.wishes) ? raw.wishes : clone(DEFAULT_WISHES),
      rounds: Array.isArray(raw.rounds) ? raw.rounds : [],
      lastOrders: Array.isArray(raw.lastOrders) ? raw.lastOrders : [],
      history: Array.isArray(raw.history) ? raw.history : [],
      ledger: Array.isArray(raw.ledger) ? raw.ledger : []
    };

    applyPresetCatalog(merged, installedCatalogVersion);

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
      worldName: child.worldName || "Mein Bereich",
      companion: child.companion === "none" ? "none" : (child.companion || "none"),
      interfaceStyle: ["playful","modern","neutral"].includes(child.interfaceStyle) ? child.interfaceStyle : "neutral",
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
      readAloud: task.readAloud !== false,
      minAgeSolo: clamp(task.minAgeSolo ?? 0, 0, 18),
      allowYoungerWithOlder: Boolean(task.allowYoungerWithOlder),
      minAgeWithOlder: clamp(task.minAgeWithOlder ?? 0, 0, 18),
      olderPartnerMinAge: clamp(task.olderPartnerMinAge ?? task.minAgeSolo ?? 0, 0, 18),
      visibleFrom: /^\d{2}:\d{2}$/.test(task.visibleFrom || "") ? task.visibleFrom : "00:00",
      reservableFrom: /^\d{2}:\d{2}$/.test(task.reservableFrom || "") ? task.reservableFrom : "00:00",
      availableUntil: /^\d{2}:\d{2}$/.test(task.availableUntil || "") ? task.availableUntil : "23:59",
      reportableFrom: /^\d{2}:\d{2}$/.test(task.reportableFrom || "") ? task.reportableFrom : ( /^\d{2}:\d{2}$/.test(task.reservableFrom || "") ? task.reservableFrom : "00:00"),
      reservationMinutes: clamp(task.reservationMinutes ?? merged.settings.defaultReservationMinutes ?? 120, 15, 720),
      autoApprove: task.autoApprove !== false,
      requiresManualReview: Boolean(task.requiresManualReview)
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
      plannedRequiredChildren: clamp(claim.plannedRequiredChildren ?? 0, 0, 8),
      reservedChildIds: Array.isArray(claim.reservedChildIds) ? claim.reservedChildIds : (Array.isArray(claim.childIds) ? [...claim.childIds] : []),
      actualParticipantIds: Array.isArray(claim.actualParticipantIds) ? claim.actualParticipantIds : (claim.status === "reserved" ? [] : (Array.isArray(claim.childIds) ? [...claim.childIds] : [])),
      rewardAllocations: Array.isArray(claim.rewardAllocations) ? claim.rewardAllocations.map(item => ({ childId:item.childId, coins:clamp(item.coins,0,999), seeds:clamp(item.seeds,0,999), stars:clamp(item.stars,0,99) })).filter(item => item.childId) : [],
      completionMode: ["full-team","smaller-team","solo"].includes(claim.completionMode) ? claim.completionMode : "full-team",
      reportingChildId: claim.reportingChildId || "",
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
      id: wish.id || uid(), icon:wish.icon || "🎁", title:wish.title || "Wunsch",
      category: inferWishCategory(wish), cost:clamp(wish.cost ?? 20,0,9999), seedCost:clamp(wish.seedCost ?? 0,0,9999),
      active:wish.active !== false, note:wish.note || ""
    }));

    merged.wishRequests = merged.wishRequests.map(request => ({
      ...request,
      id:request.id || uid(),
      cost:clamp(request.cost ?? 0,0,9999),
      seedCost:clamp(request.seedCost ?? 0,0,9999),
      status:["pending","approved","rejected"].includes(request.status) ? request.status : "pending",
      createdAt:Number(request.createdAt || Date.now()),
      reviewedAt:Number(request.reviewedAt || 0)
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

  function plannedChildrenForClaim(claim, task) {
    return Math.max(1, Number(claim?.plannedRequiredChildren || 0), claimRequiredChildren(claim, task));
  }

  function groupRewardTotals(task, plannedChildren = Number(task?.requiredChildren || 1)) {
    const count = Math.max(1, Number(plannedChildren || 1));
    return {
      coins:Math.max(0, Number(task?.coins || 0)) * count,
      seeds:Math.max(0, Number(task?.seeds || 0)) * count,
      stars:Math.max(0, Number(task?.stars || 0)) * count
    };
  }

  function distributeInteger(total, participantIds) {
    const ids = [...new Set((participantIds || []).filter(Boolean))];
    if (!ids.length) return [];
    const amount = Math.max(0, Math.trunc(Number(total || 0)));
    const base = Math.floor(amount / ids.length);
    let remainder = amount % ids.length;
    return ids.map(childId => ({ childId, amount:base + (remainder-- > 0 ? 1 : 0) }));
  }

  function buildRewardAllocations(task, participantIds, plannedChildren = Number(task?.requiredChildren || 1)) {
    const ids = [...new Set((participantIds || []).filter(id => childById(id)))];
    const totals = groupRewardTotals(task, plannedChildren);
    const coins = Object.fromEntries(distributeInteger(totals.coins, ids).map(item => [item.childId,item.amount]));
    const seeds = Object.fromEntries(distributeInteger(totals.seeds, ids).map(item => [item.childId,item.amount]));
    const stars = Object.fromEntries(distributeInteger(totals.stars, ids).map(item => [item.childId,item.amount]));
    return ids.map(childId => ({ childId, coins:Number(coins[childId] || 0), seeds:Number(seeds[childId] || 0), stars:Number(stars[childId] || 0) }));
  }

  function normalizeAllocations(allocations, participantIds) {
    const ids = [...new Set((participantIds || []).filter(id => childById(id)))];
    const map = new Map((allocations || []).map(item => [item.childId, item]));
    return ids.map(childId => {
      const item = map.get(childId) || {};
      return { childId, coins:clamp(item.coins,0,999), seeds:clamp(item.seeds,0,999), stars:clamp(item.stars,0,99) };
    });
  }

  function allocationForChild(claim, task, childId) {
    const stored = (claim?.rewardAllocations || []).find(item => item.childId === childId);
    if (stored) return { coins:Number(stored.coins || 0), seeds:Number(stored.seeds || 0), stars:Number(stored.stars || 0) };
    return { coins:Number(task?.coins || 0), seeds:Number(task?.seeds || 0), stars:Number(task?.stars || 0) };
  }

  function allocationText(allocation) {
    return `🪙 ${Number(allocation?.coins || 0)} · 🌱 ${Number(allocation?.seeds || 0)}${Number(allocation?.stars || 0) ? ` · ⭐ ${Number(allocation.stars || 0)}` : ""}`;
  }

  let speakingTaskId = null;

  function taskTitleMarkup(task) {
    const speechButton = task.readAloud === false ? "" : `<button class="task-speak-button" type="button" data-action="speak-task" data-task-id="${task.id}" aria-label="Aufgabe vorlesen" aria-pressed="${speakingTaskId === task.id ? "true" : "false"}">${speakingTaskId === task.id ? "⏹️" : "🔊"}</button>`;
    return `<div class="task-title-line"><h3>${escapeHtml(task.title)}</h3>${speechButton}</div>`;
  }

  function taskSpeechText(task) {
    const parts = [task.title];
    if (task.instructions) parts.push(task.instructions);
    if (Number(task.requiredChildren || 1) > 1) {
      parts.push(`Diese Aufgabe ist für ${task.requiredChildren} Kinder vorgesehen.`);
      const totals = groupRewardTotals(task, task.requiredChildren);
      parts.push(`Der Gesamtwert beträgt ${totals.coins} Münzen und ${totals.seeds} Samen${totals.stars ? ` sowie ${totals.stars} Sterne` : ""}.`);
      parts.push("Wenn weniger Kinder die Aufgabe tatsächlich erledigen, kann die gesamte Belohnung nach der Bestätigung fair auf sie verteilt werden.");
    } else {
      parts.push(`Dafür gibt es ${task.coins} Münzen und ${task.seeds} Samen${task.stars ? ` sowie ${task.stars} Sterne` : ""}.`);
    }
    return parts.filter(Boolean).join(" ");
  }

  function updateSpeechButtons() {
    document.querySelectorAll(".task-speak-button").forEach(button => {
      const active = button.dataset.taskId === speakingTaskId;
      button.textContent = active ? "⏹️" : "🔊";
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-label", active ? "Vorlesen stoppen" : "Aufgabe vorlesen");
    });
  }

  function speakTask(taskId) {
    const task = taskById(taskId);
    if (!task) return showToast("Diese Aufgabe wurde nicht gefunden.");
    if (task.readAloud === false) return showToast("Für diese Aufgabe ist das Vorlesen ausgeschaltet.");
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance !== "function") return showToast("Vorlesen wird auf diesem Gerät nicht unterstützt.");
    if (speakingTaskId === taskId) {
      window.speechSynthesis.cancel();
      speakingTaskId = null;
      updateSpeechButtons();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(taskSpeechText(task));
    utterance.lang = "de-DE";
    utterance.rate = .9;
    utterance.pitch = 1;
    speakingTaskId = taskId;
    updateSpeechButtons();
    utterance.onend = utterance.onerror = () => {
      if (speakingTaskId === taskId) speakingTaskId = null;
      updateSpeechButtons();
    };
    window.speechSynthesis.speak(utterance);
  }

  saveData();

  function showToast(message, action = null) {
    clearTimeout(showToast.timer);
    toast.innerHTML = `<span>${escapeHtml(message)}</span>${action?.label && action?.action ? `<button type="button" data-action="${escapeHtml(action.action)}" ${action.payload ? Object.entries(action.payload).map(([key,value]) => `data-${key}="${escapeHtml(value)}"`).join(" ") : ""}>${escapeHtml(action.label)}</button>` : ""}`;
    toast.classList.toggle("has-action", Boolean(action?.label && action?.action));
    toast.classList.add("show");
    const timeout = Number(action?.timeout || 2600);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("show", "has-action");
      toast.textContent = "";
    }, timeout);
  }

  function showUndoToast(claimId) {
    showToast("Aufgabe wurde bestätigt.", { label:"Rückgängig", action:"undo-claim-now", payload:{"claim-id":claimId}, timeout:7000 });
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
      ? ["Schön, dass du da bist!", "Da bist du ja!", "Dein Bereich freut sich auf dich."]
      : hour < 17
        ? ["Willkommen zurück!", "Schön, dass du wieder da bist!", "In deinem Bereich gibt es etwas zu entdecken."]
        : hour < 21
          ? ["Schön, dass du noch einmal vorbeischaust!", "Da bist du wieder!", "Dein Bereich hat auf dich gewartet."]
          : ["Schön, dass du noch einmal da bist!", "Ein kleiner Blick in deinen Bereich?", "Da bist du ja noch einmal!"];
    return options[Math.floor(Math.random() * options.length)];
  }

  function screenLabel(screen) {
    return ({
      home:"Mitmach-Welt", child:"Kinderbereich", tasks:"Aufgaben", missions:"Tagesmissionen", world:"Mein Bereich", shop:"Mein Laden",
      achievements:"Meine Erfolge", group:"Gruppenbereich", roundSetup:"Mitmach-Runde", roundPlay:"Aufgabenwahl", roundSummary:"Mitmach-Runde", educator:"Erzieherbereich"
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
    const childScreens = ["child","tasks","missions","world","shop","achievements"];
    const styledChild = childScreens.includes(ui.screen) ? childById(ui.childId) : null;
    document.body.classList.remove("child-style-playful","child-style-modern","child-style-neutral");
    if (styledChild) document.body.classList.add(`child-style-${styledChild.interfaceStyle || "neutral"}`);
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
    if (ui.screen === "home") setTimeout(loadWeatherForecast, 0);
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
      <section class="hero home-hero">
        <p class="hero-kicker">${escapeHtml(data.settings.groupName)}</p>
        <h2>Wer möchte heute mitmachen?</h2>
        <p>Tippe auf deinen Avatar oder startet gemeinsam eine Mitmach-Runde.</p>
      </section>

      <section class="weather-strip" id="weatherStrip" aria-live="polite">
        <div class="weather-loading">🌦️ Wetter für Lübben wird geladen …</div>
      </section>

      <button class="round-launch" type="button" data-action="open-round">
        <span class="big-icon">🎡</span>
        <span>
          <h3>Mitmach-Runde</h3>
          <p>Mehrere Kinder auswählen und fair auslosen.</p>
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
              <small>${waiting ? `${waiting} Aufgabe${waiting === 1 ? "" : "n"} wartet${waiting === 1 ? "" : "en"}` : `${childAge(child) === null ? "Alter offen" : childAgeLabel(child)} · Mein Bereich`}</small>
            </button>`;
        }).join("")}</div>` : `
          <div class="empty-state"><span class="emoji">🌱</span><h3>Noch keine Kinder angelegt</h3><p>Im Erzieherbereich können Kinder mit eigenen Avataren angelegt werden.</p></div>`}
      </section>

      <section class="section">
        <div class="admin-grid">
          <button class="card" type="button" data-action="nav-group" style="text-align:left;cursor:pointer;border:0">
            <h3>🌍 Gruppenbereich</h3>
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
          <span class="icon">${worldTheme(child).icon}</span><span><h3>Mein Bereich</h3><p>${escapeHtml(worldTheme(child).title)} ansehen und weiter gestalten.</p></span>
        </button>
        <button class="profile-action shop" type="button" data-action="child-shop">
          <span class="icon">🛍️</span><span><h3>Mein Laden</h3><p>Samen für deinen Bereich, Münzen für Wünsche und Sterne für Besonderes.</p></span>
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
    const timeState = taskTimeState(task);
    if (!timeState.visible) return { canReserve:false, label:`Ab ${task.visibleFrom || "00:00"} Uhr sichtbar`, joinable:null, eligibility:{mode:"time"} };
    if (!timeState.reservable) return { canReserve:false, label:`Ab ${task.reservableFrom || "00:00"} Uhr reservierbar`, joinable:null, eligibility:{mode:"time"} };
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
        createdAt:Date.now(), expiresAt:Date.now()+clamp(task.reservationMinutes||data.settings.defaultReservationMinutes||120,15,720)*60000, reportedAt:0, reviewedAt:0, reviewNote:"", rewardsApplied:false,
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

  function participantSetHasOlderPartner(participantIds, claim, task) {
    if (!claim.ageSupportRequired) return true;
    const minimum = Number(claim.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo || 0);
    return participantIds.some(id => {
      const age = childAge(childById(id));
      return age !== null && age >= minimum;
    });
  }

  function finalizeClaimReport(claim, task, participantIds, reportingChildId = "") {
    const ids = [...new Set((participantIds || []).filter(id => childById(id)))];
    if (!ids.length) return { ok:false, message:"Bitte mindestens ein Kind auswählen." };
    if (reportingChildId && !ids.includes(reportingChildId)) return { ok:false, message:"Das meldende Kind muss als Teilnehmer ausgewählt bleiben." };
    if (!participantSetHasOlderPartner(ids, claim, task)) return { ok:false, message:`Für diese Aufgabe muss ein älteres Kind ab ${claim.olderPartnerMinAge || task.olderPartnerMinAge || task.minAgeSolo} Jahren beteiligt sein.` };
    const plannedChildren = plannedChildrenForClaim(claim, task);
    claim.reservedChildIds = Array.isArray(claim.reservedChildIds) && claim.reservedChildIds.length ? [...claim.reservedChildIds] : [...claim.childIds];
    claim.childIds = ids;
    claim.actualParticipantIds = [...ids];
    claim.plannedRequiredChildren = plannedChildren;
    claim.completionMode = ids.length === 1 ? "solo" : ids.length < plannedChildren ? "smaller-team" : "full-team";
    claim.reportingChildId = reportingChildId || claim.reportingChildId || ids[0];
    claim.rewardAllocations = buildRewardAllocations(task, ids, plannedChildren);
    claim.status = "reported";
    claim.reportedAt = Date.now();
    data.history.push({ id:uid(), type:"task_reported", claimId:claim.id, taskId:task.id, childIds:[...ids], plannedChildren, completionMode:claim.completionMode, allocations:clone(claim.rewardAllocations), timestamp:Date.now() });
    saveData({ snapshot:true });
    return { ok:true, message:ids.length === 1 && plannedChildren > 1 ? "Stark – allein geschafft! Ein Erzieher bestätigt später die gesamte Gruppenbelohnung." : ids.length < plannedChildren ? "Mit kleinerem Team geschafft! Die Belohnung wird später fair verteilt." : "Geschafft gemeldet! Du kannst direkt eine weitere Aufgabe wählen." };
  }

  function reportClaim(childId, claimId) {
    const claim = data.claims.find(item => item.id === claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task || claim.status !== "reserved" || !claim.childIds.includes(childId)) return { ok:false, message:"Aufgabe konnte nicht gemeldet werden." };
    if (!taskTimeState(task).reportable) return { ok:false, message:`Diese Aufgabe kann erst ab ${task.reportableFrom || task.reservableFrom || "00:00"} Uhr als erledigt gemeldet werden.` };
    if (Number(task.requiredChildren || 1) > 1) return { ok:false, requiresParticipantSelection:true, message:"Bitte zuerst auswählen, wer die Aufgabe tatsächlich erledigt hat." };
    return finalizeClaimReport(claim, task, [...claim.childIds], childId);
  }

  function groupReportParticipantOptions(claim, task, reportingChildId) {
    const selected = new Set(claim.childIds);
    selected.add(reportingChildId);
    return activeChildren().map(child => `<label class="participant-option ${selected.has(child.id) ? "selected" : ""}"><input type="checkbox" name="participantIds" value="${child.id}" ${selected.has(child.id) ? "checked" : ""} ${child.id === reportingChildId ? "data-reporting-child disabled" : ""}><span class="participant-avatar">${child.avatar}</span><span><b>${escapeHtml(child.name)}</b><small>${escapeHtml(childAgeLabel(child))}${child.id === reportingChildId ? " · meldet die Aufgabe" : ""}</small></span></label>`).join("");
  }

  function updateGroupReportPreview() {
    const form = document.querySelector("#groupReportForm");
    const preview = document.querySelector("#groupReportPreview");
    if (!form || !preview) return;
    const claim = data.claims.find(item => item.id === form.dataset.claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task) return;
    const ids = [...form.querySelectorAll('input[name="participantIds"]:checked')].map(input => input.value);
    form.querySelectorAll(".participant-option").forEach(label => label.classList.toggle("selected", label.querySelector("input")?.checked));
    if (!ids.length) {
      preview.innerHTML = '<p class="form-error">Bitte mindestens ein Kind auswählen.</p>';
      return;
    }
    const planned = plannedChildrenForClaim(claim, task);
    const allocations = buildRewardAllocations(task, ids, planned);
    const mode = ids.length === 1 ? "Allein erledigt" : ids.length < planned ? `Von ${ids.length} statt ${planned} Kindern erledigt` : "Mit vollständigem Team erledigt";
    preview.innerHTML = `<p><b>${mode}</b></p><div class="allocation-preview">${allocations.map(allocation => { const child=childById(allocation.childId); return `<span>${child?.avatar || "🙂"} ${escapeHtml(child?.name || "Kind")}: <b>${allocationText(allocation)}</b></span>`; }).join("")}</div><p class="tiny muted">Gesamtwert der Aufgabe bleibt erhalten: ${allocationText(groupRewardTotals(task, planned))}. Ungerade Werte werden möglichst gleichmäßig verteilt.</p>`;
  }

  function openGroupReport(claimId, reportingChildId) {
    const claim = data.claims.find(item => item.id === claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task || claim.status !== "reserved" || !claim.childIds.includes(reportingChildId)) return showToast("Aufgabe konnte nicht geöffnet werden.");
    const planned = plannedChildrenForClaim(claim, task);
    const totals = groupRewardTotals(task, planned);
    openModal("Wer hat die Aufgabe gemacht?", `
      <form id="groupReportForm" data-claim-id="${claim.id}" data-reporting-child-id="${reportingChildId}">
        <div class="reward-reveal compact-reveal"><span class="main-emoji">${task.icon}</span><h2>${escapeHtml(task.title)}</h2><p class="muted">Vorgesehen für ${planned} Kinder · Gesamtwert ${allocationText(totals)}</p></div>
        ${task.instructions ? `<div class="callout"><p>${escapeHtml(task.instructions)}</p></div>` : ""}
        <div class="form-field" style="margin-top:14px"><label>Tatsächlich beteiligt</label><div class="participant-grid">${groupReportParticipantOptions(claim, task, reportingChildId)}</div></div>
        <div id="groupReportPreview" class="callout success" style="margin-top:14px"></div>
        <p class="form-save-status" role="status" aria-live="polite"></p>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="success-button" type="button" data-action="submit-group-report">✅ Erledigt melden</button></div>
      </form>`, { wide:true });
    document.querySelector("#groupReportForm")?.addEventListener("change", updateGroupReportPreview);
    updateGroupReportPreview();
  }

  function submitGroupReport() {
    const form = document.querySelector("#groupReportForm");
    if (!form) return;
    const claim = data.claims.find(item => item.id === form.dataset.claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task) return;
    const reportingChildId = form.dataset.reportingChildId;
    const ids = [...form.querySelectorAll('input[name="participantIds"]:checked')].map(input => input.value);
    const result = finalizeClaimReport(claim, task, ids, reportingChildId);
    if (!result.ok) return setSimpleFormStatus("groupReportForm", result.message, true);
    closeModal();
    showToast(result.message);
    celebrate(12);
    render();
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
              ${taskTitleMarkup(task)}
              <div class="task-meta">
                ${readiness.required > 1 ? `<span class="chip team">👥 ${claim.childIds.length}/${readiness.required}</span>` : ""}
                ${claim.ageSupportRequired ? `<span class="chip warning">🧒 + 🧑 älteres Kind</span>` : ""}
                <span class="chip">pro Kind: 🪙 ${task.coins} · 🌱 ${task.seeds}${task.stars ? ` · ⭐ ${task.stars}` : ""}</span>${readiness.required > 1 ? `<span class="chip team">Gesamt: ${allocationText(groupRewardTotals(task, readiness.required))}</span>` : ""}
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
              <button class="success-button small-button" type="button" data-action="${readiness.required > 1 ? "open-group-report" : "report-claim"}" data-child-id="${child.id}" data-claim-id="${claim.id}" ${readiness.missingOlderPartner ? "disabled" : ""}>✅ ${readiness.missingOlderPartner ? waitingLabel : readiness.missingChildren ? "Erledigt melden – auch mit kleinerem Team" : "Erledigt melden"}</button>
              <button class="ghost-button small-button" type="button" data-action="leave-claim" data-child-id="${child.id}" data-claim-id="${claim.id}">Doch nicht</button>` : `
              <span class="callout success"><p>Die Aufgabe ist gemeldet. Ein Erzieher schaut später in Ruhe darauf.</p></span>`}
          </div>
        </article>`;
    }).join("") : `<div class="empty-state"><span class="emoji">👐</span><h3>Noch keine Aufgabe ausgewählt</h3><p>Du kannst heute mehrere kleine Aufgaben nacheinander übernehmen.</p></div>`;

    const taskCardHtml = ({ task, eligibility }) => {
      const reservation = taskReservationState(child.id, task);
      const already = !reservation.canReserve;
      const joinable = reservation.joinable;
      const activeTeamNames = joinable ? joinable.childIds.map(childById).filter(Boolean).map(member => `${member.avatar} ${escapeHtml(member.name)}`).join(", ") : "";
      return `
        <article class="task-card ${eligibility.mode === "supported" ? "age-supported-task" : ""}">
          <div class="task-card-head">
            <span class="task-icon">${task.icon}</span>
            <div>
              ${taskTitleMarkup(task)}
              <div class="task-meta">
                ${task.requiredChildren > 1 ? `<span class="chip team">👥 ${task.requiredChildren} Kinder</span>` : `<span class="chip">👤 Einzelaufgabe</span>`}
                <span class="chip">${task.repeatMode === "shared" ? "🏠 einmal für die Gruppe" : "👧 pro Kind"}</span>
                <span class="chip ${eligibility.mode === "supported" ? "warning" : ""}">🎂 ${escapeHtml(taskAgeRuleLabel(task))}</span>
                <span class="chip">pro Kind: 🪙 ${task.coins} · 🌱 ${task.seeds}</span>
                ${task.requiredChildren > 1 ? `<span class="chip team">Gesamtwert: ${allocationText(groupRewardTotals(task, task.requiredChildren))}</span>` : ""}
                ${task.communityPoints ? `<span class="chip team">🤝 +${task.communityPoints} Gemeinschaft</span>` : ""}
              </div>
            </div>
            <button class="primary-button small-button" type="button" data-action="reserve-task" data-child-id="${child.id}" data-task-id="${task.id}" ${already ? "disabled" : ""}>${reservation.label}</button>
          </div>
          ${eligibility.mode === "supported" ? `<div class="callout warning compact-callout"><p>Diese Aufgabe darfst du gemeinsam mit einem älteren Kind machen.</p></div>` : ""}
          ${joinable ? `<p class="tiny muted">Schon dabei: ${activeTeamNames}</p>` : ""}
          ${task.instructions ? `<p class="tiny muted">${escapeHtml(task.instructions)}</p>` : ""}
        </article>`;
    };
    const taskGroups = [...TASK_CATEGORIES, ...new Set(visibleTasks.map(item => item.task.category).filter(category => !TASK_CATEGORIES.includes(category)))];
    const availableHtml = visibleTasks.length ? taskGroups.map(category => {
      const entries = visibleTasks.filter(item => item.task.category === category);
      if (!entries.length) return "";
      return `<section class="task-category-section"><h3 class="task-category-title">${escapeHtml(category)}</h3><div class="task-list">${entries.map(taskCardHtml).join("")}</div></section>`;
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
        <div><h2>Meine Tagesmissionen</h2><p>Schätze selbst ein, wie es heute geklappt hat. Ein Erzieher schaut später gemeinsam mit dir darauf.</p></div>
      </section>
      <section class="section">
        ${goals.length ? `<div class="task-list">${goals.map(goal => {
          const evaluation = todays.find(item => item.goalId === goal.id);
          const assessed = evaluation?.childView;
          return `
            <article class="task-card goal-card" style="--accent:${child.accent}">
              <div class="task-card-head">
                <span class="task-icon">${goal.icon}</span>
                <div><h3>${escapeHtml(goal.title)}</h3><p class="muted tiny">Es geht nicht um Perfektion, sondern um ehrliches Nachdenken.</p></div>
                ${evaluation?.result ? `<span class="chip success">${GOAL_RESULTS[evaluation.result]?.icon || "🌱"} Bestätigt</span>` : assessed ? `<span class="chip warning">${GOAL_RESULTS[assessed]?.icon || "🌱"} Wartet auf Auswertung</span>` : `<span class="chip warning">Für heute</span>`}
              </div>
              <div class="task-meta"><span class="chip">Bei geschafft: 🪙 ${goal.achievedCoins}</span><span class="chip">🌱 ${goal.achievedSeeds}</span>${goal.achievedStars ? `<span class="chip">⭐ ${goal.achievedStars}</span>` : ""}</div>
              <div class="inline-actions" style="margin-top:12px"><button class="ghost-button small-button" type="button" data-action="speak-goal" data-goal-id="${goal.id}">🔊 Vorlesen</button>${!evaluation?.result ? `<button class="primary-button small-button" type="button" data-action="open-goal-self-assessment" data-child-id="${child.id}" data-goal-id="${goal.id}">${assessed ? "Einschätzung ändern" : "Mission einschätzen"}</button>` : ""}</div>
            </article>`;
        }).join("")}</div>` : `<div class="empty-state"><span class="emoji">🌈</span><h3>Heute gibt es keine persönliche Tagesmission.</h3></div>`}
      </section>`;
  }

  function openGoalSelfAssessment(childId, goalId) {
    const child=childById(childId), goal=goalById(goalId); if(!child||!goal) return;
    openModal("Tagesmission einschätzen", `<div class="profile-banner" style="--accent:${child.accent}"><div class="profile-avatar">${child.avatar}</div><div><h3>${escapeHtml(goal.title)}</h3><p>Wie hat es heute geklappt?</p></div></div><div class="goal-choice-grid"><button class="success-button" data-action="save-goal-self-assessment" data-child-id="${child.id}" data-goal-id="${goal.id}" data-result="achieved">🌟 Hat gut geklappt</button><button class="primary-button" data-action="save-goal-self-assessment" data-child-id="${child.id}" data-goal-id="${goal.id}" data-result="partial">🌱 Teilweise geschafft</button><button class="ghost-button" data-action="save-goal-self-assessment" data-child-id="${child.id}" data-goal-id="${goal.id}" data-result="notYet">🌤️ Heute noch schwierig</button></div>`);
  }

  function saveGoalSelfAssessment(childId, goalId, result) {
    if(!Object.keys(GOAL_RESULTS).includes(result)) return;
    let ev=data.goalEvaluations.find(x=>x.childId===childId&&x.goalId===goalId&&x.date===todayKey());
    if(ev?.result) return showToast("Diese Mission wurde bereits gemeinsam ausgewertet.");
    if(!ev){ ev={id:uid(),childId,goalId,date:todayKey(),result:"",note:"",createdAt:Date.now()}; data.goalEvaluations.push(ev); }
    ev.childView=result; ev.selfAssessedAt=Date.now(); saveData({snapshot:true}); closeModal(); render(); showToast("Deine Einschätzung wurde gespeichert.");
  }

  function speakGoal(goalId){ const goal=goalById(goalId); if(!goal||!("speechSynthesis" in window)) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(goal.title); u.lang="de-DE"; speechSynthesis.speak(u); }

  function worldTheme(child) { return WORLD_THEMES.find(theme => theme.id === child.theme) || WORLD_THEMES[0]; }

  function worldStarter(themeId) {
    return WORLD_THEMES.find(theme => theme.id === themeId)?.starter || "✨ ◻️ 🌟";
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
        <div><h2>${escapeHtml(child.worldName || "Mein Bereich")}</h2><p>${theme.icon} ${escapeHtml(theme.title)} · Alles Freigeschaltete wird hier sichtbar.</p><div class="balance-strip">${currencyStats(child)}</div></div>
      </section>

      <section class="section">
        <div class="world-scene theme-${theme.id}">
          <span class="world-title">${theme.icon} ${escapeHtml(theme.title)} · Stufe ${plotLevel}</span>
          <span class="world-sun">${theme.id === "space" ? "🌙" : "☀️"}</span>
          <div class="world-ground"></div>
          ${inventoryItems.length ? `<div class="world-items">${inventoryItems.slice(-24).map((item,index) => `<span class="world-item" style="grid-column:${(index%6)+1}">${item.icon}</span>`).join("")}</div>` : `<div class="world-starter">${worldStarter(theme.id)}</div>`}
          ${child.companion && child.companion !== "none" ? `<span class="world-companion" aria-label="Begleiter">${child.companion}</span>` : ""}
        </div>
      </section>

      <section class="section">
        <div class="admin-grid">
          <div class="card"><h3>📈 Dein Bereich entwickelt sich</h3><p class="muted">Mit bestätigten Aufgaben wird dein Bereich weiter ausgebaut. Noch ${Math.max(0, 8 - (child.completed % 8)) || 8} bestätigte Aufgaben bis zur nächsten Stufe.</p></div>
          <div class="card"><h3>🎒 Bereits im Bereich</h3><p class="muted">${inventoryItems.length} Gegenstand${inventoryItems.length === 1 ? "" : "e"} · Gegenstände dürfen mehrfach vorkommen.</p></div>
          <button class="card" style="text-align:left;cursor:pointer;border:0" type="button" data-action="child-shop"><h3>🛍️ Bereich gestalten</h3><p class="muted">Samen für passende Ausstattung ausgeben oder den Sternenschatz entdecken.</p></button>
        </div>
      </section>`;
  }

  function renderChildShop() {
    const child = childById(ui.childId);
    if (!child) return renderMissingChild();
    const tabs = [
      { id:"world", label:"🌱 Bereich gestalten" },
      { id:"wishes", label:"🪙 Wunschladen" },
      { id:"stars", label:"⭐ Sternenschatz" },
      { id:"exchange", label:"🔄 Tauschen" }
    ];
    let content = "";
    if (ui.shopTab === "world") {
      const items = WORLD_ITEMS.filter(item => item.seedCost).sort((a,b) => {
        const aMatch = Array.isArray(a.themes) && a.themes.includes(child.theme) ? 0 : 1;
        const bMatch = Array.isArray(b.themes) && b.themes.includes(child.theme) ? 0 : 1;
        return aMatch - bMatch || Number(a.seedCost || 0) - Number(b.seedCost || 0);
      });
      content = `<div class="shop-grid">${items.map(item => `
        <article class="shop-card">
          <span class="shop-icon">${item.icon}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
          <div class="price"><span>🌱 ${item.seedCost}</span><button class="primary-button small-button" type="button" data-action="buy-world-item" data-item-id="${item.id}" data-child-id="${child.id}" ${child.seeds < item.seedCost ? "disabled" : ""}>Kaufen</button></div>
        </article>`).join("")}</div>`;
    } else if (ui.shopTab === "wishes") {
      const wishes = data.wishes.filter(wish => wish.active);
      const openRequests = data.wishRequests.filter(request => request.childId === child.id && request.status === "pending");
      const wishGroups = [...WISH_CATEGORIES, ...new Set(wishes.map(wish => wish.category).filter(category => !WISH_CATEGORIES.includes(category)))];
      content = `
        <div class="callout"><p>Ein Wunsch wird vorgemerkt und später mit einem Erzieher abgestimmt. Bei einer Ablehnung werden Münzen und Samen automatisch zurückgegeben.</p></div>
        ${wishGroups.map(category => {
          const entries = wishes.filter(wish => wish.category === category);
          if (!entries.length) return "";
          return `<section class="section" style="margin-top:16px"><div class="section-heading"><div><h2>${escapeHtml(category)}</h2></div></div><div class="shop-grid">${entries.map(wish => {
            const pending = openRequests.some(request => request.wishId === wish.id);
            return `<article class="shop-card"><span class="shop-icon">${wish.icon}</span><h3>${escapeHtml(wish.title)}</h3><p>${escapeHtml(wish.note)}</p><div class="price"><span>${wishPriceText(wish)}</span><button class="primary-button small-button" type="button" data-action="request-wish" data-wish-id="${wish.id}" data-child-id="${child.id}" ${pending || !canAffordWish(child,wish) ? "disabled" : ""}>${pending ? "Vorgemerkt" : "Vormerken"}</button></div></article>`;
          }).join("")}</div></section>`;
        }).join("")}`;
    } else if (ui.shopTab === "stars") {
      const items = WORLD_ITEMS.filter(item => item.starCost);
      content = `
        <div class="callout warning"><p>Sterne sind seltene Auszeichnungen. Sie werden nicht für jede Aufgabe vergeben und können besondere Dinge freischalten.</p></div>
        <div class="shop-grid" style="margin-top:14px">${items.map(item => `<article class="shop-card"><span class="shop-icon">${item.icon}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><div class="price"><span>⭐ ${item.starCost}</span><button class="primary-button small-button" type="button" data-action="buy-world-item" data-item-id="${item.id}" data-child-id="${child.id}" ${child.stars < item.starCost ? "disabled" : ""}>Freischalten</button></div></article>`).join("")}</div>`;
    } else {
      content = data.settings.allowCoinSeedExchange ? `
        <div class="panel">
          <h2>🪙 Münzen in 🌱 Samen tauschen</h2>
          <p class="muted">Die zwei Bereiche bleiben getrennt. Wer seinen Bereich schneller erweitern möchte, darf freiwillig Münzen in Samen tauschen.</p>
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
      { icon:"🎒", title:"Bereichsgestalter", description:"Drei Dinge sind im eigenen Bereich freigeschaltet.", unlocked:child.inventory.length >= 3 },
      { icon:"🏰", title:"Gut ausgebaut", description:"Zehn Dinge wurden für den eigenen Bereich gesammelt.", unlocked:child.inventory.length >= 10 }
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
    const milestoneIds = new Set(GROUP_MILESTONES.map(milestone => `group_${milestone.points}`));
    data.group.inventory = (data.group.inventory || []).filter(id => !milestoneIds.has(id) || GROUP_MILESTONES.some(milestone => id === `group_${milestone.points}` && data.group.communityPoints >= milestone.points));
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
        <p class="hero-kicker">Unser gemeinsamer Bereich</p>
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
          return `<article class="task-card ${eligibility.mode === "supported" ? "age-supported-task" : ""}"><div class="task-card-head"><span class="task-icon">${task.icon}</span><div>${taskTitleMarkup(task)}<div class="task-meta">${task.requiredChildren > 1 ? `<span class="chip team">👥 ${task.requiredChildren} Kinder</span>` : `<span class="chip">👤 Alleine</span>`}<span class="chip ${eligibility.mode === "supported" ? "warning" : ""}">🎂 ${escapeHtml(taskAgeRuleLabel(task))}</span><span class="chip">🪙 ${task.coins}</span><span class="chip">🌱 ${task.seeds}</span>${task.communityPoints ? `<span class="chip team">🤝 ${task.communityPoints}</span>` : ""}</div>${joinable ? `<p class="tiny muted">Team begonnen von ${joinable.childIds.map(childById).filter(Boolean).map(child => `${child.avatar} ${escapeHtml(child.name)}`).join(", ")}</p>` : ""}${eligibility.mode === "supported" ? `<p class="tiny muted">Diese Aufgabe geht nur zusammen mit einem älteren Kind.</p>` : ""}</div><button class="primary-button small-button" type="button" data-action="round-choose-task" data-task-id="${task.id}" ${available ? "" : "disabled"}>${reservation.label}</button></div></article>`;
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

  function unregisterGroupEarnings(coins, seeds) {
    const coinAmount = Math.max(0, Number(coins || 0));
    const seedAmount = Math.max(0, Number(seeds || 0));
    data.group.totalCoinsEarned = Math.max(0, Number(data.group.totalCoinsEarned || 0) - coinAmount);
    data.group.totalSeedsEarned = Math.max(0, Number(data.group.totalSeedsEarned || 0) - seedAmount);
    data.group.coinProgress = Number(data.group.coinProgress || 0) - coinAmount;
    while (data.group.coinProgress < 0 && data.group.communityPoints > 0) {
      data.group.coinProgress += data.settings.communityCoinThreshold;
      data.group.communityPoints -= 1;
    }
    data.group.seedProgress = Number(data.group.seedProgress || 0) - seedAmount;
    while (data.group.seedProgress < 0 && data.group.communityPoints > 0) {
      data.group.seedProgress += data.settings.communitySeedThreshold;
      data.group.communityPoints -= 1;
    }
    data.group.coinProgress = Math.max(0, data.group.coinProgress);
    data.group.seedProgress = Math.max(0, data.group.seedProgress);
  }

  function undoApprovedClaim(claimId) {
    const claim = data.claims.find(item => item.id === claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task || claim.status !== "approved" || !claim.rewardsApplied) return { ok:false, message:"Diese Bestätigung kann nicht zurückgenommen werden." };
    const historyEntry = [...data.history].reverse().find(item => item.type === "task_approved" && item.claimId === claimId && !item.reversedAt);
    const fallbackAllocations = claim.childIds.map(childId => ({ childId, coins:Number(historyEntry?.coins ?? task.coins ?? 0), seeds:Number(historyEntry?.seeds ?? task.seeds ?? 0), stars:Number(historyEntry?.stars ?? task.stars ?? 0) }));
    const allocations = normalizeAllocations(Array.isArray(historyEntry?.allocations) && historyEntry.allocations.length ? historyEntry.allocations : fallbackAllocations, claim.childIds);
    const insufficient = allocations.find(allocation => {
      const child = childById(allocation.childId);
      return child && (child.coins < allocation.coins || child.seeds < allocation.seeds || child.stars < allocation.stars);
    });
    if (insufficient) {
      const child = childById(insufficient.childId);
      return { ok:false, message:`Bei ${child?.name || "einem Kind"} reicht das aktuelle Guthaben für die automatische Rücknahme nicht aus. Bitte nutzt die Konten-Korrektur.` };
    }

    allocations.forEach(allocation => {
      const child = childById(allocation.childId);
      if (!child) return;
      child.coins -= allocation.coins;
      child.seeds -= allocation.seeds;
      child.stars -= allocation.stars;
      child.completed = Math.max(0, Number(child.completed || 0) - 1);
      data.ledger = data.ledger || [];
      [["coins",allocation.coins],["seeds",allocation.seeds],["stars",allocation.stars]].filter(([,amount]) => amount).forEach(([currency,amount]) => data.ledger.push({ id:uid(), childId:child.id, currency, amount:-amount, reason:"Bestätigung zurückgenommen", note:task.title, claimId, timestamp:Date.now() }));
      unregisterGroupEarnings(allocation.coins, allocation.seeds);
    });
    const teamPoints = Number(historyEntry?.teamPoints ?? (claim.childIds.length >= 2 ? Math.max(1, Number(task.communityPoints || 0)) : Number(task.communityPoints || 0)));
    data.group.communityPoints = Math.max(0, Number(data.group.communityPoints || 0) - teamPoints);
    data.notifications = data.notifications.filter(note => !(note.type === "task-approved" && note.claimId === claimId));
    claim.status = "reported";
    claim.rewardsApplied = false;
    claim.reviewedAt = 0;
    claim.reviewNote = "";
    if (historyEntry) historyEntry.reversedAt = Date.now();
    data.history.push({ id:uid(), type:"task_approval_reversed", claimId, taskId:task.id, childIds:[...claim.childIds], allocations:clone(allocations), communityPoints:teamPoints, timestamp:Date.now() });
    updateGroupMilestones();
    saveData({ snapshot:true });
    return { ok:true, message:"Die Bestätigung wurde zurückgenommen und die Aufgabe ist wieder offen." };
  }

  function addNotification(childId, payload) {
    data.notifications.push({
      id:uid(), childId, claimId:payload.claimId || "", type:payload.type || "info", title:payload.title || "Neuigkeit aus deinem Bereich",
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
    data.ledger = data.ledger || [];
    [["coins",Number(coins||0)],["seeds",Number(seeds||0)],["stars",Number(stars||0)]].filter(([,amount])=>amount).forEach(([currency,amount])=>data.ledger.push({id:uid(),childId,currency,amount,reason:source === "task" ? "Aufgabe bestätigt" : source === "goal" ? "Tagesmission bewertet" : "Belohnung",timestamp:Date.now()}));
    if (stars > 0) data.history.push({ id:uid(), type:"star_earned", childId, amount:stars, source, timestamp:Date.now() });
    return registerGroupEarnings(Number(coins || 0), Number(seeds || 0));
  }

  function reviewClaim(claimId, decision, note = "", options = {}) {
    const claim = data.claims.find(item => item.id === claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task || claim.status !== "reported") return false;

    if (decision === "approve") {
      const participantIds = [...new Set((options.participantIds || claim.childIds || []).filter(id => childById(id)))];
      if (!participantIds.length || !participantSetHasOlderPartner(participantIds, claim, task)) return false;
      const plannedChildren = plannedChildrenForClaim(claim, task);
      const proposed = options.allocations || (claim.rewardAllocations?.length ? claim.rewardAllocations : buildRewardAllocations(task, participantIds, plannedChildren));
      const allocations = normalizeAllocations(proposed, participantIds);
      claim.childIds = participantIds;
      claim.actualParticipantIds = [...participantIds];
      claim.plannedRequiredChildren = plannedChildren;
      claim.rewardAllocations = clone(allocations);
      claim.completionMode = participantIds.length === 1 ? "solo" : participantIds.length < plannedChildren ? "smaller-team" : "full-team";
      claim.status = "approved";
      claim.reviewedAt = Date.now();
      claim.reviewNote = note;

      let thresholdPoints = 0;
      allocations.forEach(allocation => {
        const child = childById(allocation.childId);
        if (!child) return;
        child.completed += 1;
        thresholdPoints += applyChildReward(child.id, allocation, "task");
        addNotification(child.id, {
          type:"task-approved", claimId, title:"Deine Hilfe wurde gesehen", message:`${task.icon} ${task.title} wurde bestätigt.`,
          detail:participantIds.length === 1 && plannedChildren > 1 ? "Du hast eine Gruppenaufgabe allein geschafft und erhältst die bestätigte Gesamtbelohnung." : participantIds.length < plannedChildren ? "Ihr habt die Aufgabe mit einem kleineren Team geschafft. Die Belohnung wurde fair verteilt." : participantIds.length > 1 ? "Ihr habt diese Aufgabe gemeinsam geschafft." : "Dein Bereich ist dadurch ein Stück weitergekommen.",
          coins:allocation.coins, seeds:allocation.seeds, stars:allocation.stars, positive:true
        });
      });
      const teamPoints = participantIds.length >= 2 ? Math.max(1, Number(task.communityPoints || 0)) : Number(task.communityPoints || 0);
      if (teamPoints > 0) data.group.communityPoints += teamPoints;
      updateGroupMilestones();
      claim.rewardsApplied = true;
      data.history.push({ id:uid(), type:"task_approved", claimId, taskId:task.id, childIds:[...participantIds], plannedChildren, completionMode:claim.completionMode, allocations:clone(allocations), teamPoints, thresholdPoints, communityPoints:teamPoints + thresholdPoints, timestamp:Date.now() });
    } else {
      claim.status = "declined";
      claim.reviewedAt = Date.now();
      claim.reviewNote = note;
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
      ? ["Während du weg warst, ist etwas passiert …", "Dein Bereich hat Neuigkeiten für dich!", "Schau mal, was sich verändert hat!"]
      : ["Schön, dass du wieder da bist.", "Dein Bereich hat eine Nachricht für dich."];
    const heading = headingOptions[Math.floor(Math.random() * headingOptions.length)];
    openModal("Neuigkeiten für dich", `
      <div class="reward-reveal">
        <span class="main-emoji">${positiveCount ? "🌻" : "🌤️"}</span>
        <h2>${escapeHtml(heading)}</h2>
        <p class="muted">${escapeHtml(child.name)}, hier ist deine Rückmeldung seit deinem letzten Besuch.</p>
        ${totals.coins || totals.seeds || totals.stars ? `<div class="reward-totals">${totals.coins ? `<span class="reward-total">🪙 +${totals.coins}</span>` : ""}${totals.seeds ? `<span class="reward-total">🌱 +${totals.seeds}</span>` : ""}${totals.stars ? `<span class="reward-total">⭐ +${totals.stars}</span>` : ""}</div>` : ""}
        <div class="task-list" style="text-align:left">${notes.map(note => `<article class="task-card"><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.message)}</p>${note.detail ? `<p class="muted tiny">${escapeHtml(note.detail)}</p>` : ""}</article>`).join("")}</div>
        <div class="modal-actions"><button class="primary-button full-button" type="button" data-action="mark-notifications-seen" data-child-id="${childId}">🌍 Meinen Bereich weiter entdecken</button></div>
      </div>`);
    if (positiveCount) celebrate(24);
  }

  function renderEducator() {
    if (!ui.educatorUnlocked) return renderEducatorLogin();
    const tabs = [
      ["review","🌙 Abendrunde"], ["overview","📊 Übersicht"], ["children","👧 Kinder"], ["tasks","📋 Aufgaben"],
      ["goals","🌱 Tagesmissionen"], ["wishes","🪙 Wünsche"], ["wallet","💰 Konten"], ["backup","💾 Datensicherung"], ["settings","⚙️ Einstellungen"]
    ];
    const content = ({
      review:renderReviewTab,
      overview:renderOverviewTab,
      children:renderChildrenAdmin,
      tasks:renderTasksAdmin,
      goals:renderGoalsAdmin,
      wishes:renderWishesAdmin,
      wallet:renderWalletAdmin,
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
    const recentApproved = data.claims.filter(claim => claim.status === "approved" && claim.rewardsApplied).sort((a,b) => b.reviewedAt - a.reviewedAt).slice(0,10);
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
          return `<article class="task-card active-task-card"><div class="task-card-head"><span class="task-icon">${task.icon}</span><div><h3>${escapeHtml(task.title)}</h3><p class="muted tiny">${children.map(child => `${child.avatar} ${escapeHtml(child.name)} (${childAgeLabel(child)})`).join(", ")} · ${waiting}</p><div class="task-meta"><span class="chip warning">Ausgewählt</span><span class="chip">⏱️ ${remainingReservationText(claim)}</span>${readiness.required > 1 ? `<span class="chip team">👥 ${claim.childIds.length}/${readiness.required}</span>` : ""}${claim.ageSupportRequired ? `<span class="chip warning">🧒 + 🧑 Altersbegleitung</span>` : ""}</div></div><div class="inline-actions"><button class="success-button small-button" data-action="educator-confirm-reserved" data-claim-id="${claim.id}">Direkt bestätigen</button><button class="ghost-button small-button" data-action="extend-reservation" data-claim-id="${claim.id}">＋ 1 Std.</button><button class="danger-button small-button" data-action="release-reservation" data-claim-id="${claim.id}">Freigeben</button></div></div></article>`;
        }).join("")}</div>` : `<div class="empty-state compact"><span class="emoji">👐</span><h3>Zurzeit ist keine Aufgabe ausgewählt.</h3></div>`}
      </div>

      <div class="panel" style="margin-top:16px">
        <h3>✅ Erledigt gemeldete Aufgaben (${reported.length})</h3>
        ${reported.length ? `<div class="task-list">${reported.map(claim => {
          const task = taskById(claim.taskId); const children = claim.childIds.map(childById).filter(Boolean);
          if (!task) return "";
          const planned = plannedChildrenForClaim(claim, task);
          const allocations = claim.rewardAllocations?.length ? claim.rewardAllocations : buildRewardAllocations(task, claim.childIds, planned);
          return `<article class="task-card review-card"><div class="task-card-head"><span class="task-icon">${task.icon}</span><div><h3>${escapeHtml(task.title)}</h3><p class="muted tiny">${children.map(child => `${child.avatar} ${escapeHtml(child.name)} (${childAgeLabel(child)})`).join(", ")} · gemeldet ${formatDateTime(claim.reportedAt)}</p><div class="task-meta"><span class="chip team">Vorgesehen: ${planned} Kinder</span><span class="chip ${claim.childIds.length < planned ? "warning" : "success"}">Tatsächlich: ${claim.childIds.length}</span>${claim.ageSupportRequired ? `<span class="chip warning">🎂 mit Altersbegleitung</span>` : ""}</div><div class="allocation-preview compact">${allocations.map(allocation => { const child=childById(allocation.childId); return `<span>${child?.avatar || "🙂"} ${escapeHtml(child?.name || "Kind")}: <b>${allocationText(allocation)}</b></span>`; }).join("")}</div></div><div class="inline-actions"><button class="success-button small-button" type="button" data-action="open-claim-review" data-claim-id="${claim.id}">Prüfen & bestätigen</button><button class="danger-button small-button" type="button" data-action="decline-claim-prompt" data-claim-id="${claim.id}">Noch nicht</button></div></div></article>`;
        }).join("")}</div>` : `<div class="empty-state"><span class="emoji">✅</span><h3>Keine offenen Aufgaben</h3><p>Die Kinder können tagsüber weiter Aufgaben erledigt melden.</p></div>`}
      </div>

      <div class="panel" style="margin-top:16px">
        <h3>Persönliche Tagesmissionen (${goalsToReview.length})</h3>
        <p class="muted">Kind und Erzieher schauen gemeinsam auf den Tag. Keine Minuspunkte und kein Beschämen.</p>
        ${goalsToReview.length ? `<div class="review-grid">${goalsToReview.map(({child,goal}) => `<article class="task-card goal-card" style="--accent:${child.accent}"><div class="task-card-head"><span class="task-icon">${goal.icon}</span><div><h3>${escapeHtml(child.name)}</h3><p class="muted tiny">${escapeHtml(goal.title)}</p>${(()=>{const ev=data.goalEvaluations.find(x=>x.childId===child.id&&x.goalId===goal.id&&x.date===todayKey()); return ev?.childView?`<p class="tiny"><b>Selbsteinschätzung:</b> ${GOAL_RESULTS[ev.childView]?.icon||""} ${GOAL_RESULTS[ev.childView]?.label||""}</p>`:"";})()}</div></div><button class="primary-button full-button small-button" type="button" style="margin-top:12px" data-action="open-goal-review" data-child-id="${child.id}" data-goal-id="${goal.id}">Gemeinsam auswerten</button></article>`).join("")}</div>` : `<div class="empty-state"><span class="emoji">🌙</span><h3>Alle heutigen Missionen sind besprochen.</h3></div>`}
      </div>

      <div class="panel" style="margin-top:16px">
        <h3>Vorgemerkte Wünsche (${pendingWishes.length})</h3>
        ${pendingWishes.length ? `<div class="task-list">${pendingWishes.map(request => {
          const child = childById(request.childId); const wish = wishById(request.wishId);
          if (!child || !wish) return "";
          return `<article class="task-card"><div class="task-card-head"><span class="task-icon">${wish.icon}</span><div><h3>${escapeHtml(wish.title)}</h3><p class="muted tiny">${child.avatar} ${escapeHtml(child.name)} · ${wishPriceText(request)} ist vorgemerkt</p></div><div class="inline-actions"><button class="success-button small-button" type="button" data-action="approve-wish" data-request-id="${request.id}">Annehmen</button><button class="danger-button small-button" type="button" data-action="reject-wish" data-request-id="${request.id}">Ablehnen & erstatten</button></div></div></article>`;
        }).join("")}</div>` : `<div class="empty-state"><span class="emoji">🎁</span><h3>Keine offenen Wünsche</h3></div>`}
      </div>

      <div class="panel" style="margin-top:16px">
        <h3>↩️ Letzte Bestätigungen (${recentApproved.length})</h3>
        <p class="muted">Eine versehentliche Bestätigung kann hier vollständig zurückgenommen werden. Die Aufgabe erscheint danach wieder bei den offenen Meldungen.</p>
        ${recentApproved.length ? `<div class="task-list">${recentApproved.map(claim => { const task=taskById(claim.taskId); const children=claim.childIds.map(childById).filter(Boolean); if(!task) return ""; return `<article class="task-card"><div class="task-card-head"><span class="task-icon">${task.icon}</span><div><h3>${escapeHtml(task.title)}</h3><p class="muted tiny">${children.map(child => `${child.avatar} ${escapeHtml(child.name)}`).join(", ")} · bestätigt ${formatDateTime(claim.reviewedAt)}</p></div><button class="ghost-button small-button" type="button" data-action="undo-claim-prompt" data-claim-id="${claim.id}">Bestätigung zurücknehmen</button></div></article>`; }).join("")}</div>` : `<p class="muted">Noch keine Bestätigung zum Zurücknehmen vorhanden.</p>`}
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

  function renderWalletAdmin() {
    const rows = activeChildren().map(child => `<div class="admin-row"><span class="admin-row-icon" style="background:${child.accent}22">${child.avatar}</span><div><h4>${escapeHtml(child.name)}</h4><p>🪙 ${child.coins} · 🌱 ${child.seeds} · ⭐ ${child.stars}</p></div><button class="primary-button small-button" type="button" data-action="open-wallet-editor" data-child-id="${child.id}">Korrigieren</button></div>`).join("");
    const ledger = [...(data.ledger || [])].sort((a,b)=>b.timestamp-a.timestamp).slice(0,100);
    return `<div class="section-heading"><div><h2>Konten korrigieren</h2><p>Belohnungen können nachgetragen oder bei einer Fehlbestätigung abgezogen werden.</p></div></div>
      <div class="admin-list">${rows || `<p class="muted">Keine aktiven Kinder.</p>`}</div>
      <div class="panel" style="margin-top:16px"><h3>Letzte Kontobewegungen</h3>${ledger.length ? `<div class="admin-list">${ledger.map(entry=>{ const child=childById(entry.childId); const icon=entry.currency==="coins"?"🪙":entry.currency==="seeds"?"🌱":"⭐"; return `<div class="admin-row"><span class="admin-row-icon">${icon}</span><div><h4>${entry.amount>0?"+":""}${entry.amount} ${entry.currency==="coins"?"Münzen":entry.currency==="seeds"?"Samen":"Sterne"}</h4><p>${child?`${child.avatar} ${escapeHtml(child.name)} · `:""}${escapeHtml(entry.reason||"Korrektur")} · ${formatDateTime(entry.timestamp)}</p></div></div>`}).join("")}</div>` : `<p class="muted">Noch keine manuellen Korrekturen.</p>`}</div>`;
  }

  function openWalletEditor(childId) {
    const child=childById(childId); if(!child) return;
    openModal("Kontostand korrigieren", `<form id="walletForm"><input type="hidden" name="childId" value="${child.id}"><div class="profile-banner" style="--accent:${child.accent}"><div class="profile-avatar">${child.avatar}</div><div><h2>${escapeHtml(child.name)}</h2><p>Aktuell: 🪙 ${child.coins} · 🌱 ${child.seeds} · ⭐ ${child.stars}</p></div></div><div class="form-grid"><div class="form-field"><label>Währung</label><select name="currency"><option value="coins">🪙 Münzen</option><option value="seeds">🌱 Samen</option><option value="stars">⭐ Sterne</option></select></div><div class="form-field"><label>Änderung</label><input name="amount" type="number" min="-999" max="999" step="1" placeholder="z. B. -5 oder 5" required></div><div class="form-field full"><label>Begründung</label><select name="reason"><option>Aufgabe versehentlich bestätigt</option><option>Belohnung nachgetragen</option><option>Mission korrigiert</option><option>Pädagogische Entscheidung</option><option>Sonstige Korrektur</option></select></div><div class="form-field full"><label>Notiz (optional)</label><input name="note" maxlength="160"></div></div><p class="form-save-status" role="status"></p><div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="button" data-action="save-wallet-correction">Buchen</button></div></form>`, {wide:true});
  }

  function saveWalletCorrection() {
    const form=document.querySelector('#walletForm'); if(!form) return;
    const v=Object.fromEntries(new FormData(form).entries()); const child=childById(v.childId); const amount=Math.trunc(Number(v.amount));
    if(!child || !amount || Math.abs(amount)>999){ setSimpleFormStatus('walletForm','Bitte einen Betrag ungleich 0 eingeben.',true); return; }
    const current=Number(child[v.currency]||0); if(current+amount<0){ setSimpleFormStatus('walletForm','Der Kontostand darf nicht unter 0 fallen.',true); return; }
    const execute=()=>{ child[v.currency]=current+amount; data.ledger=data.ledger||[]; data.ledger.push({id:uid(),childId:child.id,currency:v.currency,amount,reason:v.reason,note:String(v.note||'').trim(),timestamp:Date.now()}); saveData({snapshot:true}); closeModal(); ui.educatorTab='wallet'; render(); showToast('Kontostand wurde korrigiert.'); };
    if(amount<0) confirmModal({title:'Belohnung wirklich abziehen?',message:`${Math.abs(amount)} ${v.currency==='coins'?'Münzen':v.currency==='seeds'?'Samen':'Sterne'} werden bei ${escapeHtml(child.name)} abgezogen.`,confirmText:'Jetzt abziehen',confirmAction:'confirm-wallet-correction',payload:{'child-id':child.id,'currency':v.currency,'amount':String(amount),'reason':v.reason,'note':String(v.note||'')}}); else execute();
  }

  async function loadWeatherForecast() {
    const host=document.querySelector('#weatherStrip'); if(!host) return;
    try {
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FBerlin&forecast_days=3`;
      const response=await fetch(url); if(!response.ok) throw new Error('weather'); const json=await response.json();
      const d=json.daily; const labels=['Heute','Morgen','Übermorgen'];
      host.innerHTML=d.time.slice(0,3).map((date,i)=>{ const info=weatherInfo(d.weather_code[i],d.precipitation_probability_max[i],d.temperature_2m_max[i]); const min=Math.round(d.temperature_2m_min[i]); const max=Math.round(d.temperature_2m_max[i]); const rain=Math.round(d.precipitation_probability_max[i]||0); return `<details class="weather-card"><summary><b>${labels[i]}</b><span class="weather-icon">${info.icon}</span><strong>${min}–${max}°</strong><small>💧 ${rain}%</small></summary><div class="weather-detail"><p>${escapeHtml(info.short)}</p><small>${escapeHtml(info.text)}</small></div></details>`; }).join('');
    } catch { host.innerHTML='<div class="weather-loading">🌤️ Die Wettervorschau ist gerade nicht erreichbar. Die Mitmach-Welt funktioniert trotzdem weiter.</div>'; }
  }
  function weatherInfo(code,rain,max){
    if([95,96,99].includes(code)) return {icon:'⛈️',short:'Gewitter möglich',text:'Bei dunklen Wolken bleibt ihr besser in der Nähe.'};
    if([71,73,75,77,85,86].includes(code)) return {icon:'❄️',short:'Schnee',text:'Warme Sachen nicht vergessen.'};
    if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return {icon:'🌧️',short:'Regen',text:'Eine Regenjacke ist eine gute Idee.'};
    if([1,2,3,45,48].includes(code)) return {icon:code>=45?'🌫️':'⛅',short:code>=45?'Nebel':'Sonne & Wolken',text:'Schaut gemeinsam nach draußen.'};
    return {icon:'☀️',short:'Sonnig',text:max>=25?'Trinken und Sonnenschutz sind wichtig.':'Ein guter Tag für draußen.'};
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
    const categories = [...TASK_CATEGORIES, ...new Set(sortedTasks.map(task => task.category).filter(category => !TASK_CATEGORIES.includes(category)))];
    const sections = categories.map(category => {
      const entries = sortedTasks.filter(task => task.category === category);
      if (!entries.length) return "";
      const rows = entries.map(task => {
        const linked = data.claims.filter(claim => claim.taskId === task.id);
        const open = linked.filter(claim => ["reserved","reported"].includes(claim.status)).length;
        return `<div class="admin-row"><span class="admin-row-icon">${task.icon}</span><div><h4>${escapeHtml(task.title)}</h4><p>${task.active ? "Aktiv" : "Inaktiv"} · 🎂 ${escapeHtml(taskAgeRuleLabel(task))} · 👥 ${task.requiredChildren} · ${task.repeatMode === "shared" ? "einmal für Gruppe" : "pro Kind"} · 🪙 ${task.coins} · 🌱 ${task.seeds}${task.communityPoints ? ` · 🤝 ${task.communityPoints}` : ""}${open ? ` · ⚠️ ${open} offen` : ""}</p></div><div class="inline-actions"><button class="ghost-button small-button" type="button" data-action="open-task-editor" data-task-id="${task.id}">Bearbeiten</button><button class="${task.active ? "danger-button" : "success-button"} small-button" type="button" data-action="toggle-task-active" data-task-id="${task.id}">${task.active ? "Pausieren" : "Aktivieren"}</button><button class="danger-button small-button" type="button" data-action="delete-task-prompt" data-task-id="${task.id}">Löschen</button></div></div>`;
      }).join("");
      return `<section class="panel task-admin-category" style="margin-top:14px"><h3>${escapeHtml(category)} (${entries.length})</h3><div class="admin-list">${rows}</div></section>`;
    }).join("");
    return `
      <div class="section-heading"><div><h2>Aufgaben verwalten</h2><p>Alle Aufgaben sind nach Alltagsthemen geordnet und können an die Gruppe angepasst werden.</p></div><button class="primary-button small-button" type="button" data-action="open-task-editor">＋ Aufgabe anlegen</button></div>
      <div class="callout success"><p><b>Kein Tageslimit:</b> Jedes Kind erhält die Belohnung für jede tatsächlich verfügbare und bestätigte Aufgabe. Fleiß wird nicht künstlich begrenzt.</p></div>
      ${sections || `<div class="empty-state"><span class="emoji">📋</span><h3>Noch keine Aufgaben vorhanden</h3><p>Lege oben die erste Aufgabe an.</p></div>`}`;
  }

  function renderGoalsAdmin() {
    return `
      <div class="section-heading"><div><h2>Persönliche Tagesmissionen</h2><p>Bitte Ziele positiv, konkret und für das Kind verständlich formulieren.</p></div><button class="primary-button small-button" type="button" data-action="open-goal-editor">＋ Mission anlegen</button></div>
      <div class="callout warning"><p>Beispiel statt „nicht weinen und nicht ärgern“: „Ich versuche ruhig zu bleiben und freundlich mit anderen umzugehen.“</p></div>
      <div class="admin-list" style="margin-top:14px">${data.personalGoals.length ? data.personalGoals.map(goal => {
        const child = childById(goal.childId); if (!child) return "";
        return `<div class="admin-row"><span class="admin-row-icon">${goal.icon}</span><div><h4>${escapeHtml(goal.title)}</h4><p>${child.avatar} ${escapeHtml(child.name)} · ${goal.active ? "Aktiv" : "Pausiert"} · geschafft: 🪙 ${goal.achievedCoins}, 🌱 ${goal.achievedSeeds}${goal.achievedStars ? `, ⭐ ${goal.achievedStars}` : ""}</p></div><div class="inline-actions"><button class="ghost-button small-button" type="button" data-action="open-goal-editor" data-goal-id="${goal.id}">Bearbeiten</button><button class="${goal.active ? "danger-button" : "success-button"} small-button" type="button" data-action="toggle-goal-active" data-goal-id="${goal.id}">${goal.active ? "Pausieren" : "Aktivieren"}</button><button class="danger-button small-button" type="button" data-action="delete-goal-prompt" data-goal-id="${goal.id}">Löschen</button></div></div>`;
      }).join("") : `<div class="empty-state"><span class="emoji">🌱</span><h3>Noch keine Tagesmissionen</h3></div>`}</div>`;
  }

  function renderWishesAdmin() {
    const categories = [...WISH_CATEGORIES, ...new Set(data.wishes.map(wish => wish.category).filter(category => !WISH_CATEGORIES.includes(category)))];
    const sections = categories.map(category => {
      const entries = data.wishes.filter(wish => wish.category === category);
      if (!entries.length) return "";
      return `<section class="panel" style="margin-top:14px"><h3>${escapeHtml(category)} (${entries.length})</h3><div class="admin-list">${entries.map(wish => `<div class="admin-row"><span class="admin-row-icon">${wish.icon}</span><div><h4>${escapeHtml(wish.title)}</h4><p>${wish.active ? "Aktiv" : "Inaktiv"} · ${wishPriceText(wish)} · ${escapeHtml(wish.note)}</p></div><div class="inline-actions"><button class="ghost-button small-button" type="button" data-action="open-wish-editor" data-wish-id="${wish.id}">Bearbeiten</button><button class="${wish.active ? "danger-button" : "success-button"} small-button" type="button" data-action="toggle-wish-active" data-wish-id="${wish.id}">${wish.active ? "Pausieren" : "Aktivieren"}</button><button class="danger-button small-button" type="button" data-action="delete-wish-prompt" data-wish-id="${wish.id}">Löschen</button></div></div>`).join("")}</div></section>`;
    }).join("");
    return `
      <div class="section-heading"><div><h2>Wunschladen verwalten</h2><p>Kleine, mittlere und große Belohnungen können Münzen, Samen oder beides kosten.</p></div><button class="primary-button small-button" type="button" data-action="open-wish-editor">＋ Wunsch anlegen</button></div>
      ${sections || `<div class="empty-state"><span class="emoji">🎁</span><h3>Noch keine Belohnungen vorhanden</h3></div>`}`;
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
      <div class="section-heading"><div><h2>Einstellungen</h2><p>Grundlegende Regeln für eure Mitmach-Welt und die persönlichen Bereiche.</p></div></div>
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
    const selectedInterfaceStyle = child?.interfaceStyle || "neutral";
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
          <div class="form-field"><label>Darstellung</label><select name="interfaceStyle">${DISPLAY_STYLES.map(style => `<option value="${style.id}" ${selectedInterfaceStyle === style.id ? "selected" : ""}>${style.icon} ${escapeHtml(style.title)} – ${escapeHtml(style.description)}</option>`).join("")}</select></div>
          <div class="form-field"><label>Bereich / Thema</label><select name="theme">${WORLD_THEMES.map(theme => `<option value="${theme.id}" ${selectedTheme === theme.id ? "selected" : ""}>${theme.icon} ${escapeHtml(theme.title)} – ${escapeHtml(theme.description)}</option>`).join("")}</select></div>
          <div class="form-field"><label>Name des eigenen Bereichs</label><input name="worldName" maxlength="40" value="${escapeHtml(child?.worldName || "Mein Bereich")}"></div>
          <div class="form-field"><label>Begleiter (freiwillig)</label><select name="companion"><option value="none" ${(child?.companion || "none") === "none" ? "selected" : ""}>Kein Begleiter</option>${["🐾","🦊","🐼","🦁","🐸","🦄","🦖","🤖","🦉","🐺","🚗","🛹","⚽"].map(icon => `<option value="${icon}" ${child?.companion === icon ? "selected" : ""}>${icon}</option>`).join("")}</select></div>
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
    child.worldName = String(values.worldName || "Mein Bereich").trim() || "Mein Bereich";
    child.companion = values.companion || "none";
    child.interfaceStyle = ["playful","modern","neutral"].includes(values.interfaceStyle) ? values.interfaceStyle : "neutral";
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
        <p class="tiny muted">Danach entstehen sechs leere Profile „Kind 1“ bis „Kind 6“. Münzen, Samen, Sterne, Bereiche und Erfolge beginnen bei null. Anschließend tragt ihr gemeinsam Name, Avatar, Darstellungsstil, Bereich sowie Geburtsmonat und Geburtsjahr ein.</p>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="danger-button" type="submit">Gruppe jetzt neu einrichten</button></div>
      </form>`);
  }

  function setupFreshGroup({ keepTasks = true, keepWishes = true } = {}) {
    const colors = ACCENT_COLORS.slice(0,6);
    const avatars = ["🌟","🌱","🌈","🦊","🐼","🦁"];
    data.children = Array.from({length:6}, (_,i) => ({ id:uid(), name:`Kind ${i+1}`, avatar:avatars[i], accent:colors[i], theme:WORLD_THEMES[i % WORLD_THEMES.length].id, worldName:"Mein Bereich", companion:"none", interfaceStyle:"neutral", coins:0, seeds:0, stars:0, completed:0, inventory:[], active:true, deletedAt:0, onboardingPending:true, birthMonth:0, birthYear:0, createdAt:Date.now()+i, lastFirstAt:0 }));
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
          <div class="form-field full"><label>Aufgabensymbol auswählen</label><input type="hidden" name="icon" id="taskIconValue" value="${escapeHtml(task?.icon || "✅")}"><div class="wish-symbol-current"><span id="taskIconPreview" class="wish-symbol-preview">${escapeHtml(task?.icon || "✅")}</span><div><strong>Gewähltes Symbol</strong><p class="muted tiny">Das Symbol sehen die Kinder direkt bei der Aufgabe.</p></div></div><div class="wish-symbol-grid">${TASK_ICONS.map(icon=>`<button class="wish-symbol-option ${icon===(task?.icon||"✅")?"selected":""}" type="button" data-action="select-task-icon" data-task-icon="${icon}">${icon}</button>`).join("")}</div></div>
          <div class="form-field"><label>Kategorie</label><select name="category">${[...TASK_CATEGORIES, ...(task?.category && !TASK_CATEGORIES.includes(task.category) ? [task.category] : [])].map(category => `<option value="${escapeHtml(category)}" ${category === (task?.category || "Haushalt") ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select></div>
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
          <div class="form-field full"><label><input name="readAloud" type="checkbox" ${task?.readAloud !== false ? "checked" : ""} style="width:auto"> 🔊 Vorleseschaltfläche bei dieser Aufgabe anzeigen</label><p class="tiny muted">Vorgelesen werden Titel, Hinweis, Gruppengröße und Belohnung.</p></div>
          <div class="form-field"><label>Sichtbar ab</label><input name="visibleFrom" type="time" value="${task?.visibleFrom || "00:00"}"></div>
          <div class="form-field"><label>Reservierbar ab</label><input name="reservableFrom" type="time" value="${task?.reservableFrom || "00:00"}"></div>
          <div class="form-field"><label>Erledigt meldbar ab</label><input name="reportableFrom" type="time" value="${task?.reportableFrom || task?.reservableFrom || "00:00"}"></div>
          <div class="form-field"><label>Verfügbar bis</label><input name="availableUntil" type="time" value="${task?.availableUntil || "23:59"}"></div>
          <div class="form-field"><label>Reservierung läuft ab nach</label><select name="reservationMinutes">${[30,60,90,120,180,240,360].map(m=>`<option value="${m}" ${Number(task?.reservationMinutes || 120)===m?"selected":""}>${m<60?`${m} Minuten`:`${m/60} Stunde${m===60?"":"n"}`}</option>`).join("")}</select></div>
          <div class="form-field"><label><input name="autoApprove" type="checkbox" ${task?.autoApprove !== false ? "checked" : ""} style="width:auto"> Tagesend-Bestätigung erlauben</label></div>
          <div class="form-field full"><label><input name="requiresManualReview" type="checkbox" ${task?.requiresManualReview ? "checked" : ""} style="width:auto"> Immer manuell prüfen (z. B. Gruppen-, Bonus- oder Sternaufgabe)</label></div>
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
      category:String(values.category || "").trim() || "Haushalt",
      competence:String(values.competence || "Selbstständigkeit"),
      requiredChildren,
      repeatMode:requiredChildren > 1 ? "shared" : (values.repeatMode === "perChild" ? "perChild" : "shared"),
      coins:clamp(values.coins,0,100),
      seeds:clamp(values.seeds,0,100),
      stars:clamp(values.stars,0,5),
      communityPoints:clamp(values.communityPoints,0,10),
      instructions:String(values.instructions || "").trim(),
      readAloud:formData.has("readAloud"),
      minAgeSolo,
      allowYoungerWithOlder,
      minAgeWithOlder,
      olderPartnerMinAge,
      visibleFrom:String(values.visibleFrom || "00:00"),
      reservableFrom:String(values.reservableFrom || "00:00"),
      reportableFrom:String(values.reportableFrom || values.reservableFrom || "00:00"),
      availableUntil:String(values.availableUntil || "23:59"),
      reservationMinutes:clamp(values.reservationMinutes,15,720),
      autoApprove:formData.has("autoApprove"),
      requiresManualReview:formData.has("requiresManualReview"),
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


  function setSimpleFormStatus(formId, message, isError = false) {
    const form = document.getElementById(formId);
    if (!form) return;
    let status = form.querySelector(".form-save-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-save-status";
      const actions = form.querySelector(".modal-actions");
      if (actions) actions.before(status); else form.append(status);
    }
    status.textContent = message || "";
    status.classList.toggle("error", Boolean(isError));
    status.classList.toggle("success", Boolean(message) && !isError);
  }

  function saveGoalFromForm(form) {
    if (!form) return false;
    const values = Object.fromEntries(new FormData(form).entries());
    const title = String(values.title || "").trim();
    if (!values.childId || !childById(values.childId)) { setSimpleFormStatus("goalForm", "Bitte ein gültiges Kind auswählen.", true); return false; }
    if (!title) { setSimpleFormStatus("goalForm", "Bitte eine Tagesmission eintragen.", true); return false; }
    const previous = clone(data.personalGoals);
    const existingIndex = values.id ? data.personalGoals.findIndex(item => item.id === values.id) : -1;
    if (values.id && existingIndex < 0) {
      setSimpleFormStatus("goalForm", "Diese Tagesmission wurde auf einem anderen Gerät verändert oder gelöscht. Bitte schließen und erneut öffnen.", true);
      return false;
    }
    const goal = {
      ...(existingIndex >= 0 ? data.personalGoals[existingIndex] : {}),
      id: existingIndex >= 0 ? data.personalGoals[existingIndex].id : uid(),
      active: existingIndex >= 0 ? data.personalGoals[existingIndex].active !== false : true,
      createdAt: existingIndex >= 0 ? (data.personalGoals[existingIndex].createdAt || Date.now()) : Date.now(),
      childId: values.childId, icon: values.icon || "🌱", title,
      achievedCoins: clamp(values.achievedCoins,0,100), achievedSeeds: clamp(values.achievedSeeds,0,100),
      achievedStars: clamp(values.achievedStars,0,5), partialCoins: clamp(values.partialCoins,0,100), partialSeeds: clamp(values.partialSeeds,0,100)
    };
    if (existingIndex >= 0) data.personalGoals[existingIndex] = goal; else data.personalGoals.push(goal);
    if (!saveData({ snapshot:true })) { data.personalGoals = previous; setSimpleFormStatus("goalForm", "Die Tagesmission konnte nicht gespeichert werden.", true); return false; }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (!Array.isArray(stored.personalGoals) || !stored.personalGoals.some(item => item.id === goal.id && item.title === goal.title)) throw new Error("Mission fehlt nach Speicherprüfung");
    } catch (error) {
      data.personalGoals = previous; saveData({ snapshot:false });
      setSimpleFormStatus("goalForm", "Die Speicherprüfung ist fehlgeschlagen. Bitte erneut versuchen.", true);
      console.error("Mitmach-Welt: Missionsprüfung fehlgeschlagen", error); return false;
    }
    closeModal(); ui.educatorTab = "goals"; render(); showToast(existingIndex >= 0 ? "Tagesmission wurde gespeichert." : "Tagesmission wurde angelegt."); return true;
  }

  function saveWishFromForm(form) {
    if (!form) return false;
    const values = Object.fromEntries(new FormData(form).entries());
    const title = String(values.title || "").trim();
    if (!title) { setSimpleFormStatus("wishForm", "Bitte einen Wunsch eintragen.", true); return false; }
    const previous = clone(data.wishes);
    const existingIndex = values.id ? data.wishes.findIndex(item => item.id === values.id) : -1;
    if (values.id && existingIndex < 0) {
      setSimpleFormStatus("wishForm", "Dieser Wunsch wurde auf einem anderen Gerät verändert oder gelöscht. Bitte schließen und erneut öffnen.", true);
      return false;
    }
    const cost = clamp(values.cost,0,9999);
    const seedCost = clamp(values.seedCost,0,9999);
    if (!cost && !seedCost) { setSimpleFormStatus("wishForm", "Bitte mindestens einen Preis in Münzen oder Samen eintragen.", true); return false; }
    const wish = {
      ...(existingIndex >= 0 ? data.wishes[existingIndex] : {}),
      id: existingIndex >= 0 ? data.wishes[existingIndex].id : uid(),
      active: existingIndex >= 0 ? data.wishes[existingIndex].active !== false : true,
      icon: normalizeWishIcon(values.icon), title,
      category: WISH_CATEGORIES.includes(values.category) ? values.category : "Kleine Belohnungen",
      cost, seedCost, note: String(values.note || "").trim()
    };
    if (existingIndex >= 0) data.wishes[existingIndex] = wish; else data.wishes.push(wish);
    if (!saveData({ snapshot:true })) { data.wishes = previous; setSimpleFormStatus("wishForm", "Der Wunsch konnte nicht gespeichert werden.", true); return false; }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (!Array.isArray(stored.wishes) || !stored.wishes.some(item => item.id === wish.id && item.title === wish.title)) throw new Error("Wunsch fehlt nach Speicherprüfung");
    } catch (error) {
      data.wishes = previous; saveData({ snapshot:false });
      setSimpleFormStatus("wishForm", "Die Speicherprüfung ist fehlgeschlagen. Bitte erneut versuchen.", true);
      console.error("Mitmach-Welt: Wunschprüfung fehlgeschlagen", error); return false;
    }
    closeModal(); ui.educatorTab = "wishes"; render(); showToast(existingIndex >= 0 ? "Wunsch wurde gespeichert." : "Wunsch wurde angelegt."); return true;
  }

  function removeGoal(goalId) {
    const index = data.personalGoals.findIndex(item => item.id === goalId);
    if (index < 0) return false;
    const previous = clone(data);
    data.personalGoals.splice(index,1);
    data.goalEvaluations = data.goalEvaluations.filter(item => item.goalId !== goalId);
    data.history = data.history.filter(item => item.goalId !== goalId);
    if (!saveData({ snapshot:true })) { data = previous; return false; }
    return true;
  }

  function removeWish(wishId) {
    const index = data.wishes.findIndex(item => item.id === wishId);
    if (index < 0) return false;
    const previous = clone(data);
    const pending = data.wishRequests.filter(item => item.wishId === wishId && item.status === "pending");
    pending.forEach(request => { const child = childById(request.childId); if (child) { child.coins += clamp(request.cost,0,9999); child.seeds += clamp(request.seedCost,0,9999); } });
    data.wishes.splice(index,1);
    data.wishRequests = data.wishRequests.filter(item => item.wishId !== wishId);
    data.history = data.history.filter(item => item.wishId !== wishId);
    if (!saveData({ snapshot:true })) { data = previous; return false; }
    return true;
  }

  function openGoalEditor(goalId = null) {
    const goal = goalId ? goalById(goalId) : null;
    if (goalId && !goal) {
      showToast("Diese Tagesmission wurde nicht gefunden. Bitte die Ansicht neu laden.");
      return;
    }
    openModal(goal ? "Tagesmission bearbeiten" : "Tagesmission anlegen", `
      <form id="goalForm" novalidate><input type="hidden" name="id" value="${escapeHtml(goalId || "")}">
        <div class="form-grid">
          <div class="form-field"><label>Kind</label><select name="childId" required>${activeChildren().map(child => `<option value="${child.id}" ${goal?.childId === child.id ? "selected" : ""}>${child.avatar} ${escapeHtml(child.name)}</option>`).join("")}</select></div>
          <div class="form-field full"><label>Symbol auswählen</label><input type="hidden" name="icon" id="goalIconValue" value="${escapeHtml(goal?.icon || "🌱")}"><div class="wish-symbol-current"><span id="goalIconPreview" class="wish-symbol-preview">${escapeHtml(goal?.icon || "🌱")}</span><div><strong>Gewähltes Symbol</strong><p class="muted tiny">Tippe auf ein passendes Bild.</p></div></div><div class="wish-symbol-picker">${MISSION_ICON_GROUPS.map(group=>`<section class="wish-symbol-group"><h4>${escapeHtml(group.title)}</h4><div class="wish-symbol-grid">${group.icons.map(icon=>`<button class="wish-symbol-option ${icon===(goal?.icon||"🌱")?"selected":""}" type="button" data-action="select-goal-icon" data-goal-icon="${icon}">${icon}</button>`).join("")}</div></section>`).join("")}</div></div>
          <div class="form-field full"><label>Positiv formulierte Mission</label><textarea name="title" required maxlength="180" placeholder="Ich versuche ruhig zu bleiben und freundlich mit anderen umzugehen.">${escapeHtml(goal?.title || "")}</textarea></div>
          <div class="form-field"><label>Geschafft: Münzen</label><input name="achievedCoins" type="number" min="0" max="100" value="${goal?.achievedCoins ?? 5}"></div>
          <div class="form-field"><label>Geschafft: Samen</label><input name="achievedSeeds" type="number" min="0" max="100" value="${goal?.achievedSeeds ?? 3}"></div>
          <div class="form-field"><label>Geschafft: Sterne</label><input name="achievedStars" type="number" min="0" max="5" value="${goal?.achievedStars ?? 0}"></div>
          <div class="form-field"><label>Teilweise: Münzen</label><input name="partialCoins" type="number" min="0" max="100" value="${goal?.partialCoins ?? 2}"></div>
          <div class="form-field"><label>Teilweise: Samen</label><input name="partialSeeds" type="number" min="0" max="100" value="${goal?.partialSeeds ?? 1}"></div>
        </div>
        <p class="form-save-status" role="status" aria-live="polite"></p>
        <div class="modal-actions">${goal ? `<button class="danger-button" type="button" data-action="delete-goal-prompt" data-goal-id="${goal.id}">Mission löschen</button>` : ""}<span class="modal-action-spacer"></span><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="button" data-action="save-goal">Speichern</button></div>
      </form>`, { wide:true });

    const goalForm = document.querySelector("#goalForm");
    if (goalForm) {
      goalForm.addEventListener("submit", event => {
        event.preventDefault();
        event.stopPropagation();
        saveGoalFromForm(goalForm);
      }, { once:true });
    }
  }

  function renderWishIconPicker(selectedIcon) {
    return WISH_ICON_GROUPS.map(group => `
      <section class="wish-symbol-group">
        <h4>${escapeHtml(group.title)}</h4>
        <div class="wish-symbol-grid">
          ${group.icons.map(icon => `<button class="wish-symbol-option ${icon === selectedIcon ? "selected" : ""}" type="button" data-action="select-wish-icon" data-wish-icon="${escapeHtml(icon)}" aria-label="Symbol ${escapeHtml(icon)} auswählen" title="${escapeHtml(group.title)}">${icon}</button>`).join("")}
        </div>
      </section>`).join("");
  }

  function setWishEditorIcon(value, { keepCustomText = false } = {}) {
    const icon = normalizeWishIcon(value);
    const input = document.querySelector("#wishIconValue");
    const preview = document.querySelector("#wishIconPreview");
    const customInput = document.querySelector("#wishCustomIcon");
    if (input) input.value = icon;
    if (preview) preview.textContent = icon;
    document.querySelectorAll(".wish-symbol-option").forEach(button => button.classList.toggle("selected", button.dataset.wishIcon === icon));
    if (customInput && !keepCustomText) customInput.value = WISH_ICONS.includes(icon) ? "" : icon;
    setSimpleFormStatus("wishForm", "");
    return icon;
  }

  function openWishEditor(wishId = null) {
    const wish = wishId ? wishById(wishId) : null;
    if (wishId && !wish) {
      showToast("Dieser Wunsch wurde nicht gefunden. Bitte die Ansicht neu laden.");
      return;
    }
    const selectedIcon = normalizeWishIcon(wish?.icon || "🎁");
    openModal(wish ? "Wunsch bearbeiten" : "Wunsch anlegen", `
      <form id="wishForm" novalidate><input type="hidden" name="id" value="${escapeHtml(wishId || "")}"><input type="hidden" name="icon" id="wishIconValue" value="${escapeHtml(selectedIcon)}">
        <div class="form-grid">
          <div class="form-field full">
            <label>Symbol oder Emoji auswählen</label>
            <div class="wish-symbol-current"><span id="wishIconPreview" class="wish-symbol-preview" aria-hidden="true">${escapeHtml(selectedIcon)}</span><div><strong>Gewähltes Symbol</strong><p class="muted tiny">Tippe unten auf ein Symbol. Es erscheint später im Wunschladen und bei der Freigabe.</p></div></div>
            <div class="wish-symbol-picker">${renderWishIconPicker(selectedIcon)}</div>
            <div class="wish-custom-symbol">
              <input id="wishCustomIcon" type="text" inputmode="text" maxlength="16" value="${WISH_ICONS.includes(selectedIcon) ? "" : escapeHtml(selectedIcon)}" placeholder="Eigenes Emoji, z. B. 🐉" aria-label="Eigenes Emoji eingeben">
              <button class="ghost-button small-button" type="button" data-action="use-custom-wish-icon">Eigenes Emoji übernehmen</button>
            </div>
          </div>
          <div class="form-field"><label>Kategorie</label><select name="category">${WISH_CATEGORIES.map(category => `<option value="${escapeHtml(category)}" ${category === (wish?.category || "Kleine Belohnungen") ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select></div>
          <div class="form-field"><label>Kosten in Münzen</label><input name="cost" type="number" min="0" max="9999" value="${wish?.cost ?? 20}"></div>
          <div class="form-field"><label>Kosten in Samen</label><input name="seedCost" type="number" min="0" max="9999" value="${wish?.seedCost ?? 0}"></div>
          <div class="form-field full"><p class="tiny muted">Mindestens eine der beiden Währungen muss einen Preis größer als 0 haben.</p></div>
          <div class="form-field full"><label>Wunsch</label><input name="title" value="${escapeHtml(wish?.title || "")}" required maxlength="80"></div>
          <div class="form-field full"><label>Hinweis für Kind und Team</label><textarea name="note" maxlength="240">${escapeHtml(wish?.note || "")}</textarea></div>
        </div>
        <p class="form-save-status" role="status" aria-live="polite"></p>
        <div class="modal-actions">${wish ? `<button class="danger-button" type="button" data-action="delete-wish-prompt" data-wish-id="${wish.id}">Wunsch löschen</button>` : ""}<span class="modal-action-spacer"></span><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="primary-button" type="button" data-action="save-wish">Speichern</button></div>
      </form>`, { wide:true });

    const wishForm = document.querySelector("#wishForm");
    if (wishForm) {
      wishForm.addEventListener("submit", event => {
        event.preventDefault();
        event.stopPropagation();
        saveWishFromForm(wishForm);
      }, { once:true });
    }
    const customInput = document.querySelector("#wishCustomIcon");
    if (customInput) {
      customInput.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        setWishEditorIcon(customInput.value, { keepCustomText:true });
      });
    }
  }

  function claimReviewRows(claim, task) {
    const selected = new Set(claim.childIds);
    const planned = plannedChildrenForClaim(claim, task);
    const initial = normalizeAllocations(claim.rewardAllocations?.length ? claim.rewardAllocations : buildRewardAllocations(task, claim.childIds, planned), claim.childIds);
    const map = new Map(initial.map(item => [item.childId,item]));
    return activeChildren().map(child => {
      const allocation = map.get(child.id) || { coins:0, seeds:0, stars:0 };
      const checked = selected.has(child.id);
      return `<div class="claim-review-row ${checked ? "selected" : ""}" data-review-child-id="${child.id}">
        <label class="claim-review-person"><input type="checkbox" name="reviewParticipantIds" value="${child.id}" ${checked ? "checked" : ""}><span>${child.avatar}</span><span><b>${escapeHtml(child.name)}</b><small>${escapeHtml(childAgeLabel(child))}</small></span></label>
        <label><span>🪙 Münzen</span><input name="reviewCoins_${child.id}" type="number" min="0" max="999" step="1" value="${allocation.coins}" ${checked ? "" : "disabled"}></label>
        <label><span>🌱 Samen</span><input name="reviewSeeds_${child.id}" type="number" min="0" max="999" step="1" value="${allocation.seeds}" ${checked ? "" : "disabled"}></label>
        <label><span>⭐ Sterne</span><input name="reviewStars_${child.id}" type="number" min="0" max="99" step="1" value="${allocation.stars}" ${checked ? "" : "disabled"}></label>
      </div>`;
    }).join("");
  }

  function updateClaimReviewForm({ redistribute = false } = {}) {
    const form = document.querySelector("#claimReviewForm");
    const summary = document.querySelector("#claimReviewSummary");
    if (!form || !summary) return;
    const claim = data.claims.find(item => item.id === form.dataset.claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task) return;
    const ids = [...form.querySelectorAll('input[name="reviewParticipantIds"]:checked')].map(input => input.value);
    const planned = plannedChildrenForClaim(claim, task);
    const suggestions = new Map(buildRewardAllocations(task, ids, planned).map(item => [item.childId,item]));
    form.querySelectorAll(".claim-review-row").forEach(row => {
      const id = row.dataset.reviewChildId;
      const selected = ids.includes(id);
      row.classList.toggle("selected", selected);
      ["Coins","Seeds","Stars"].forEach(currency => {
        const input = form.elements[`review${currency}_${id}`];
        if (!input) return;
        input.disabled = !selected;
        if (redistribute && selected) input.value = suggestions.get(id)?.[currency.toLowerCase()] ?? 0;
      });
    });
    const allocations = ids.map(id => ({
      childId:id,
      coins:clamp(form.elements[`reviewCoins_${id}`]?.value,0,999),
      seeds:clamp(form.elements[`reviewSeeds_${id}`]?.value,0,999),
      stars:clamp(form.elements[`reviewStars_${id}`]?.value,0,99)
    }));
    const totals = allocations.reduce((sum,item) => ({ coins:sum.coins+item.coins, seeds:sum.seeds+item.seeds, stars:sum.stars+item.stars }), { coins:0,seeds:0,stars:0 });
    const plannedTotals = groupRewardTotals(task, planned);
    const olderOkay = participantSetHasOlderPartner(ids, claim, task);
    summary.innerHTML = ids.length ? `<p><b>${ids.length === 1 && planned > 1 ? "Allein geschafft" : ids.length < planned ? `${ids.length} statt ${planned} Kinder` : "Vollständiges Team"}</b></p><p>Auszahlung gesamt: <b>${allocationText(totals)}</b></p><p class="tiny muted">Ursprünglicher Gruppenwert: ${allocationText(plannedTotals)}. Werte dürfen pädagogisch angepasst werden.</p>${olderOkay ? "" : `<p class="form-error">Es fehlt ein geeignetes älteres Kind für die Altersbegleitung.</p>`}` : '<p class="form-error">Bitte mindestens ein Kind auswählen.</p>';
  }

  function openClaimApprovalEditor(claimId) {
    const claim = data.claims.find(item => item.id === claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task || claim.status !== "reported") return showToast("Diese Meldung ist nicht mehr offen.");
    const planned = plannedChildrenForClaim(claim, task);
    openModal("Aufgabe bestätigen", `
      <form id="claimReviewForm" data-claim-id="${claim.id}">
        <div class="reward-reveal compact-reveal"><span class="main-emoji">${task.icon}</span><h2>${escapeHtml(task.title)}</h2><p class="muted">Vorgesehen für ${planned} Kinder · gemeldet von ${claim.childIds.length} ${claim.childIds.length === 1 ? "Kind" : "Kindern"}</p></div>
        <div class="callout"><p>Prüfe die tatsächlichen Teilnehmer und passe Münzen, Samen oder Sterne bei Bedarf an. Mit „Fair neu verteilen“ wird der gesamte vorgesehene Gruppenwert möglichst gleichmäßig verteilt.</p></div>
        <div class="claim-review-table" style="margin-top:14px">${claimReviewRows(claim, task)}</div>
        <div class="inline-actions" style="margin-top:12px"><button class="ghost-button small-button" type="button" data-action="redistribute-claim-reward">⚖️ Fair neu verteilen</button></div>
        <div id="claimReviewSummary" class="callout success" style="margin-top:14px"></div>
        <div class="form-field" style="margin-top:14px"><label>Notiz zur Bestätigung (optional)</label><textarea name="reviewNote" maxlength="240" placeholder="Zum Beispiel: Aufgabe allein und besonders gründlich erledigt.">${escapeHtml(claim.reviewNote || "")}</textarea></div>
        <p class="form-save-status" role="status" aria-live="polite"></p>
        <div class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Abbrechen</button><button class="success-button" type="button" data-action="save-claim-review">Bestätigen & gutschreiben</button></div>
      </form>`, { wide:true });
    const form = document.querySelector("#claimReviewForm");
    form?.addEventListener("change", event => {
      if (event.target.matches('input[name="reviewParticipantIds"]')) updateClaimReviewForm({ redistribute:true });
      else updateClaimReviewForm();
    });
    form?.addEventListener("input", event => {
      if (event.target.matches('input[type="number"]')) updateClaimReviewForm();
    });
    updateClaimReviewForm();
  }

  function saveClaimApproval() {
    const form = document.querySelector("#claimReviewForm");
    if (!form) return;
    const claim = data.claims.find(item => item.id === form.dataset.claimId);
    const task = claim ? taskById(claim.taskId) : null;
    if (!claim || !task) return;
    const participantIds = [...form.querySelectorAll('input[name="reviewParticipantIds"]:checked')].map(input => input.value);
    if (!participantIds.length) return setSimpleFormStatus("claimReviewForm", "Bitte mindestens ein Kind auswählen.", true);
    if (!participantSetHasOlderPartner(participantIds, claim, task)) return setSimpleFormStatus("claimReviewForm", "Für diese Aufgabe fehlt ein geeignetes älteres Begleitkind.", true);
    const allocations = participantIds.map(childId => ({
      childId,
      coins:clamp(form.elements[`reviewCoins_${childId}`]?.value,0,999),
      seeds:clamp(form.elements[`reviewSeeds_${childId}`]?.value,0,999),
      stars:clamp(form.elements[`reviewStars_${childId}`]?.value,0,99)
    }));
    const ok = reviewClaim(claim.id, "approve", String(form.elements.reviewNote?.value || "").trim(), { participantIds, allocations });
    if (!ok) return setSimpleFormStatus("claimReviewForm", "Die Aufgabe konnte nicht bestätigt werden. Bitte die Ansicht neu laden.", true);
    closeModal();
    celebrate(10);
    render();
    showUndoToast(claim.id);
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
    if (!child || !wish || !wish.active || !canAffordWish(child,wish)) return false;
    if (data.wishRequests.some(request => request.childId === childId && request.wishId === wishId && request.status === "pending")) return false;
    child.coins -= Number(wish.cost || 0);
    child.seeds -= Number(wish.seedCost || 0);
    data.wishRequests.push({ id:uid(), childId, wishId, cost:Number(wish.cost || 0), seedCost:Number(wish.seedCost || 0), status:"pending", createdAt:Date.now(), reviewedAt:0 });
    data.history.push({ id:uid(), type:"wish_requested", childId, wishId, cost:Number(wish.cost || 0), seedCost:Number(wish.seedCost || 0), timestamp:Date.now() });
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
    if (!approved) {
      child.coins += Number(request.cost || 0);
      child.seeds += Number(request.seedCost || 0);
    }
    addNotification(child.id, {
      type:"wish", title:approved ? "Dein Wunsch ist vorgemerkt" : "Dein Guthaben ist wieder da",
      message:approved ? `${wish.icon} ${wish.title} wurde angenommen.` : `${wish.icon} Der Wunsch konnte diesmal nicht angenommen werden.`,
      detail:approved ? "Sprecht gemeinsam ab, wann er gut in den Alltag passt." : `${wishPriceText(request)} wurde vollständig zurückgegeben.`, positive:approved
    });
    data.history.push({ id:uid(), type:approved ? "wish_approved" : "wish_rejected", childId:child.id, wishId:wish.id, cost:Number(request.cost || 0), seedCost:Number(request.seedCost || 0), timestamp:Date.now() });
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
        if (result.requiresParticipantSelection) openGroupReport(actionElement.dataset.claimId, actionElement.dataset.childId);
        else {
          showToast(result.message);
          if (result.ok) { celebrate(12); render(); }
        }
        break;
      }
      case "open-group-report": openGroupReport(actionElement.dataset.claimId, actionElement.dataset.childId); break;
      case "submit-group-report": submitGroupReport(); break;
      case "speak-task": speakTask(actionElement.dataset.taskId); break;
      case "speak-goal": speakGoal(actionElement.dataset.goalId); break;
      case "open-goal-self-assessment": openGoalSelfAssessment(actionElement.dataset.childId, actionElement.dataset.goalId); break;
      case "save-goal-self-assessment": saveGoalSelfAssessment(actionElement.dataset.childId, actionElement.dataset.goalId, actionElement.dataset.result); break;
      case "shop-tab": ui.shopTab = actionElement.dataset.tab; render(); break;
      case "buy-world-item": {
        const child = childById(actionElement.dataset.childId); const item = itemById(actionElement.dataset.itemId);
        if (!child || !item) break;
        const price = item.seedCost ? `${item.seedCost} Samen` : `${item.starCost} Sterne`;
        confirmModal({ title:`${item.icon} ${item.title}`, message:`Möchtest du ${escapeHtml(item.title)} für ${price} in deinen Bereich holen?`, confirmText:"Ja, in meinen Bereich", confirmAction:"confirm-buy-world", payload:{"child-id":child.id,"item-id":item.id} });
        break;
      }
      case "confirm-buy-world": {
        const ok = buyWorldItem(actionElement.dataset.childId, actionElement.dataset.itemId);
        closeModal();
        showToast(ok ? "Der Gegenstand ist jetzt in deinem Bereich." : "Dafür reicht dein Guthaben noch nicht.");
        render();
        break;
      }
      case "request-wish": {
        const child = childById(actionElement.dataset.childId); const wish = wishById(actionElement.dataset.wishId);
        if (!child || !wish) break;
        confirmModal({ title:`${wish.icon} Wunsch vormerken`, message:`Möchtest du „${escapeHtml(wish.title)}“ für ${wishPriceText(wish)} vormerken? Ein Erzieher stimmt den Wunsch später mit dir ab.`, confirmText:"Wunsch vormerken", confirmAction:"confirm-request-wish", payload:{"child-id":child.id,"wish-id":wish.id} });
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
      case "open-wallet-editor": openWalletEditor(actionElement.dataset.childId); break;
      case "save-wallet-correction": saveWalletCorrection(); break;
      case "confirm-wallet-correction": { const child=childById(actionElement.dataset.childId); const amount=Math.trunc(Number(actionElement.dataset.amount)); const currency=actionElement.dataset.currency; if(child && amount<0 && Number(child[currency]||0)+amount>=0){ child[currency]=Number(child[currency]||0)+amount; data.ledger=data.ledger||[]; data.ledger.push({id:uid(),childId:child.id,currency,amount,reason:actionElement.dataset.reason||"Korrektur",note:actionElement.dataset.note||"",timestamp:Date.now()}); saveData({snapshot:true}); closeModal(); ui.educatorTab="wallet"; render(); showToast("Kontostand wurde korrigiert."); } break; }
      case "lock-educator": ui.educatorUnlocked = false; ui.educatorTab = "review"; render(); break;
      case "educator-confirm-reserved": {
        const claim=data.claims.find(x=>x.id===actionElement.dataset.claimId); if(claim&&claim.status==="reserved"){ claim.status="reported"; claim.reportedAt=Date.now(); claim.actualParticipantIds=[...claim.childIds]; claim.rewardAllocations=buildRewardAllocations(taskById(claim.taskId),claim.childIds,plannedChildrenForClaim(claim,taskById(claim.taskId))); saveData({snapshot:true}); openClaimApprovalEditor(claim.id); } break;
      }
      case "extend-reservation": { const claim=data.claims.find(x=>x.id===actionElement.dataset.claimId); if(claim&&claim.status==="reserved"){ claim.expiresAt=Math.max(Date.now(),claim.expiresAt||Date.now())+3600000; data.history.push({id:uid(),type:"reservation_extended",claimId:claim.id,timestamp:Date.now()}); saveData({snapshot:true}); render(); showToast("Reservierung wurde um eine Stunde verlängert."); } break; }
      case "release-reservation": { const claim=data.claims.find(x=>x.id===actionElement.dataset.claimId); if(claim&&claim.status==="reserved"){ claim.status="released"; claim.releasedAt=Date.now(); data.history.push({id:uid(),type:"reservation_released",claimId:claim.id,timestamp:Date.now()}); saveData({snapshot:true}); render(); showToast("Aufgabe wurde wieder freigegeben."); } break; }
      case "approve-claim": {
        const claimId = actionElement.dataset.claimId;
        if (reviewClaim(claimId, "approve")) { celebrate(10); render(); showUndoToast(claimId); }
        break;
      }
      case "open-claim-review": openClaimApprovalEditor(actionElement.dataset.claimId); break;
      case "redistribute-claim-reward": updateClaimReviewForm({ redistribute:true }); break;
      case "save-claim-review": saveClaimApproval(); break;
      case "undo-claim-prompt": {
        const claim = data.claims.find(item => item.id === actionElement.dataset.claimId);
        const task = claim ? taskById(claim.taskId) : null;
        if (!claim || !task) break;
        confirmModal({ title:"Bestätigung zurücknehmen?", message:`Die Belohnung für „${escapeHtml(task.title)}“ wird bei allen beteiligten Kindern wieder abgezogen. Die Aufgabe erscheint danach erneut als erledigt gemeldet.`, confirmText:"Zurücknehmen", confirmAction:"confirm-undo-claim", confirmClass:"danger-button", payload:{"claim-id":claim.id} });
        break;
      }
      case "confirm-undo-claim": {
        const result = undoApprovedClaim(actionElement.dataset.claimId);
        closeModal();
        showToast(result.message);
        render();
        break;
      }
      case "undo-claim-now": {
        const result = undoApprovedClaim(actionElement.dataset.claimId);
        showToast(result.message);
        render();
        break;
      }
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
      case "reject-wish": if (reviewWish(actionElement.dataset.requestId, false)) { showToast("Münzen und Samen wurden zurückerstattet."); render(); } break;
      case "open-child-editor": openChildEditor(actionElement.dataset.childId || null); break;
      case "archive-child": { const child=childById(actionElement.dataset.childId); if(child){ child.active=false; saveData({snapshot:true}); showToast("Kinderprofil wurde archiviert."); render(); } break; }
      case "restore-child": { const child=childById(actionElement.dataset.childId); if(child){ child.active=true; child.deletedAt=0; saveData({snapshot:true}); showToast("Kinderprofil wurde wiederhergestellt."); render(); } break; }
      case "trash-child": { const child=childById(actionElement.dataset.childId); if(child){ child.active=false; child.deletedAt=Date.now(); saveData({snapshot:true}); showToast("Kinderprofil wurde in den Papierkorb verschoben."); render(); } break; }
      case "delete-child-prompt": { const child=childById(actionElement.dataset.childId); if(child) confirmModal({title:"Kinderprofil endgültig löschen?",message:`${child.name} und alle persönlichen Aufgaben, Fortschritte, Wünsche und Rückmeldungen werden unwiderruflich gelöscht.`,confirmText:"Endgültig löschen",confirmAction:"delete-child-confirm",confirmClass:"danger-button", payload:{"child-id":child.id}}); break; }
      case "delete-child-confirm": { const id=actionElement.dataset.childId; const child=childById(id); if(child){ removeChildRelations(id); data.children=data.children.filter(item=>item.id!==id); saveData({snapshot:true}); closeModal(); showToast("Kinderprofil wurde endgültig gelöscht."); render(); } break; }
      case "open-group-setup": openGroupSetup(); break;
      case "open-task-editor": openTaskEditor(actionElement.dataset.taskId || null); break;
      case "select-task-icon": { const input=document.querySelector("#taskIconValue"); const preview=document.querySelector("#taskIconPreview"); if(input) input.value=actionElement.dataset.taskIcon; if(preview) preview.textContent=actionElement.dataset.taskIcon; document.querySelectorAll("[data-action=\'select-task-icon\']").forEach(b=>b.classList.toggle("selected",b===actionElement)); break; }
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
      case "select-goal-icon": { const input=document.querySelector("#goalIconValue"); const preview=document.querySelector("#goalIconPreview"); if(input) input.value=actionElement.dataset.goalIcon; if(preview) preview.textContent=actionElement.dataset.goalIcon; document.querySelectorAll("[data-action=\'select-goal-icon\']").forEach(b=>b.classList.toggle("selected",b===actionElement)); break; }
      case "save-goal": saveGoalFromForm(document.querySelector("#goalForm")); break;
      case "toggle-goal-active": {
        const goal = goalById(actionElement.dataset.goalId); if (goal) { goal.active = !goal.active; saveData({ snapshot:true }); render(); }
        break;
      }
      case "delete-goal-prompt": {
        const goal = goalById(actionElement.dataset.goalId); if (!goal) break;
        confirmModal({ title:"Tagesmission löschen", message:`Möchtest du „${escapeHtml(goal.title)}“ wirklich löschen? Bereits vergebene Belohnungen bleiben erhalten.`, confirmText:"Endgültig löschen", confirmAction:"delete-goal-confirm", payload:{"goal-id":goal.id} });
        break;
      }
      case "delete-goal-confirm": {
        const goal = goalById(actionElement.dataset.goalId); const title = goal?.title || "Tagesmission";
        if (goal && removeGoal(goal.id)) { closeModal(); ui.educatorTab="goals"; render(); showToast(`„${title}“ wurde gelöscht.`); } else showToast("Die Tagesmission konnte nicht gelöscht werden.");
        break;
      }
      case "open-wish-editor": openWishEditor(actionElement.dataset.wishId || null); break;
      case "select-wish-icon": setWishEditorIcon(actionElement.dataset.wishIcon); break;
      case "use-custom-wish-icon": {
        const customInput = document.querySelector("#wishCustomIcon");
        if (!customInput?.value.trim()) { setSimpleFormStatus("wishForm", "Bitte zuerst ein eigenes Emoji eingeben.", true); break; }
        setWishEditorIcon(customInput.value, { keepCustomText:true });
        break;
      }
      case "save-wish": saveWishFromForm(document.querySelector("#wishForm")); break;
      case "toggle-wish-active": {
        const wish = wishById(actionElement.dataset.wishId); if (wish) { wish.active = !wish.active; saveData({ snapshot:true }); render(); }
        break;
      }
      case "delete-wish-prompt": {
        const wish = wishById(actionElement.dataset.wishId); if (!wish) break;
        const pending = data.wishRequests.filter(item => item.wishId === wish.id && item.status === "pending").length;
        confirmModal({ title:"Wunsch löschen", message:`Möchtest du „${escapeHtml(wish.title)}“ wirklich löschen?${pending ? ` ${pending} vorgemerkte Anfrage(n) werden entfernt und die Münzen zurückgegeben.` : ""}`, confirmText:"Endgültig löschen", confirmAction:"delete-wish-confirm", payload:{"wish-id":wish.id} });
        break;
      }
      case "delete-wish-confirm": {
        const wish = wishById(actionElement.dataset.wishId); const title = wish?.title || "Wunsch";
        if (wish && removeWish(wish.id)) { closeModal(); ui.educatorTab="wishes"; render(); showToast(`„${title}“ wurde gelöscht.`); } else showToast("Der Wunsch konnte nicht gelöscht werden.");
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

    if (form.id === "goalForm") { saveGoalFromForm(form); return; }

    if (form.id === "wishForm") { saveWishFromForm(form); return; }

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

  function runDailyAutomation() {
    let changed=false; const now=Date.now();
    data.claims.forEach(claim=>{
      if(claim.status==="reserved" && claim.expiresAt && claim.expiresAt<=now){ claim.status="released"; claim.releasedAt=now; data.history.push({id:uid(),type:"reservation_auto_released",claimId:claim.id,timestamp:now}); changed=true; }
    });
    if(data.settings.autoApproveEnabled){ const [h,m]=String(data.settings.autoApproveTime||"21:00").split(":").map(Number); const cutoff=h*60+m; if(minutesNow()>=cutoff){ data.claims.filter(c=>c.status==="reported"&&c.date===todayKey()).forEach(claim=>{ const task=taskById(claim.taskId); if(task && task.autoApprove!==false && !task.requiresManualReview && Number(task.stars||0)===0 && claim.childIds.length===plannedChildrenForClaim(claim,task)){ if(reviewClaim(claim.id,"approve")){ claim.autoApproved=true; data.history.push({id:uid(),type:"task_auto_approved",claimId:claim.id,timestamp:now}); changed=true; } } }); } }
    if(changed) saveData({snapshot:true,notify:true});
  }

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
  runDailyAutomation();
  setInterval(()=>{ runDailyAutomation(); render(); },60000);
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
    saveGoalFromForm,
    saveWishFromForm,
    removeTask,
    removeGoal,
    removeWish,
    getChildAge: childId => childAge(childById(childId)),
    getTaskAgeEligibility: (childId, taskId) => clone(taskAgeEligibility(childById(childId), taskById(taskId))),
    reserveTask,
    reportClaim,
    reviewClaim,
    undoApprovedClaim,
    requestWish,
    reviewWish
  };
})();
