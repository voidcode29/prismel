import type { GeneratedAlias } from "@prismel/shared";
import { settingsService } from "../settings/settings.service";

// ── English adjectives ──────────────────────────────────────────────────────
const en_adjectives = [
  "agile", "alert", "amber", "ample", "ancient", "angular", "aqua", "arid",
  "ash", "azure", "bald", "bare", "beige", "bitter", "bland", "blazing",
  "bleak", "blind", "blond", "bloom", "blot", "blue", "bold", "bony",
  "bowed", "brass", "brave", "brief", "bright", "brisk", "broad", "bronze",
  "brown", "burnt", "calm", "char", "chill", "clean", "clear", "clever",
  "coarse", "cobalt", "cold", "cool", "copper", "coral", "coy", "creamy",
  "crisp", "crude", "cyan", "damp", "dark", "dear", "deft", "dense",
  "dim", "drab", "dry", "dull", "dust", "eager", "elm", "empty", "faded",
  "faint", "fair", "fast", "fat", "fern", "fierce", "fine", "firm",
  "flat", "flax", "fleet", "flint", "floss", "flush", "foggy", "fond",
  "frank", "frail", "free", "fresh", "frigid", "frost", "full", "fuzzy",
  "gaunt", "gay", "gentle", "glad", "gloom", "glossy", "gold", "grand",
  "gray", "green", "grim", "grit", "gusty", "harsh", "hasty", "hazy",
  "high", "hoarse", "hollow", "hot", "huge", "humble", "humid", "icy",
  "ivory", "jade", "keen", "kind", "lame", "lank", "large", "late",
  "lax", "lean", "lemon", "light", "lilac", "limp", "livid", "lofty",
  "lone", "loose", "loud", "low", "loyal", "lush", "mad", "mauve",
  "meek", "mellow", "merry", "mild", "misty", "moist", "moss", "muddy",
  "mute", "navy", "neat", "new", "nifty", "nimble", "noble", "noisy",
  "nuts", "oak", "odd", "old", "olive", "opal", "pale", "pearl",
  "peppy", "pine", "pink", "placid", "plain", "plum", "plump", "polite",
  "prone", "proud", "prune", "pure", "purple", "quick", "quiet", "rainy",
  "rapid", "rare", "raw", "red", "rich", "rigid", "ripe", "robust",
  "rose", "rough", "round", "ruby", "rude", "rust", "rustic", "sad",
  "sage", "salt", "sandy", "scarce", "shady", "sharp", "sheer", "shiny",
  "shy", "sick", "silk", "silver", "sleek", "slick", "slim", "slow",
  "small", "smart", "smoky", "smooth", "snug", "soft", "sole", "solid",
  "sour", "spare", "sparse", "spicy", "stale", "stark", "steady", "steamy",
  "steel", "steep", "stern", "stiff", "stony", "stormy", "stout", "strict",
  "strong", "sunny", "svelte", "swamp", "sweet", "swift", "tall", "tame",
  "tangy", "tawny", "teal", "tender", "tense", "terse", "thick", "thin",
  "tidy", "tiny", "tough", "true", "vast", "vibrant", "vile", "vivid",
  "vulgar", "warm", "weak", "weary", "wet", "white", "wide", "wild",
  "windy", "wise", "wispy", "wry", "young", "zany",
];

// ── French adjectives ───────────────────────────────────────────────────────
const fr_adjectives = [
  "abrupt", "acide", "actif", "adroit", "aigu", "aimable", "amer", "ample",
  "ancien", "aride", "basane", "bas", "beau", "blanc", "bleu", "blond",
  "brave", "bref", "bronze", "bruyant", "brut", "cache", "calme", "casse",
  "charmant", "chaud", "choisi", "clair", "commun", "concis", "connu", "cossu",
  "couche", "courageux", "courtois", "crasseux", "creux", "cru", "cuivre", "desert",
  "delicat", "dense", "digne", "dore", "doux", "drole", "dur", "elegant",
  "ennuyeux", "entier", "etroit", "eveille", "fade", "faible", "fier", "fin",
  "flou", "fort", "fou", "fragile", "frais", "franc", "frileux", "frise",
  "froid", "gaucher", "gauche", "glace", "grand", "gris", "gros", "hardi",
  "haut", "hideux", "honnete", "idiot", "immense", "infime", "ivre", "jaloux",
  "jaune", "joli", "joyeux", "large", "las", "leger", "lent", "leste",
  "libre", "lisse", "long", "lourd", "loyal", "luisant", "mat", "mauvais",
  "mechant", "menu", "mince", "morne", "mou", "mur", "navre", "net",
  "neuf", "noir", "noue", "obscur", "orange", "ouvert", "pale", "parfait",
  "pauvre", "percant", "petit", "plein", "poli", "proche", "propre", "prudent",
  "rapide", "rare", "rauque", "ravi", "riche", "rond", "rose", "rouge",
  "rude", "rugueux", "ruse", "sain", "sale", "sec", "simple", "sobre",
  "sombre", "souple", "sourd", "svelte", "tendre", "terne", "tiede", "timide",
  "tordu", "tranquille", "trempe", "triste", "uni", "vague", "vaillant", "vain",
  "vaste", "verdoyant", "vert", "vif", "violet", "vrai", "zebre",
];

// ── Spanish adjectives ───────────────────────────────────────────────────────
const es_adjectives = [
  "abierto", "abrupto", "acido", "aereo", "agrio", "agudo", "alegre", "alto",
  "amable", "amargo", "amplio", "ancho", "antiguo", "apagado", "aspero", "bajo",
  "bello", "blanco", "blando", "breve", "brillante", "bronco", "brusco", "bueno",
  "calido", "caliente", "calido", "cambiante", "cansado", "cauto", "celeste", "ciego",
  "claro", "cobarde", "comun", "conciso", "contento", "corto", "crudo", "cuadrado",
  "curvo", "debil", "delgado", "denso", "derecho", "despierto", "docil", "dorado",
  "duro", "elegante", "enorme", "escaso", "espeso", "estrecho", "exacto", "extrano",
  "facil", "feo", "feroz", "fiel", "fijo", "fino", "firme", "flojo",
  "fragil", "franco", "frio", "fuerte", "grande", "gris", "grueso", "guapo",
  "helado", "hermoso", "hondo", "humedo", "inquieto", "joven", "justo", "largo",
  "leal", "lejano", "lento", "ligero", "liso", "listo", "lleno", "loco",
  "maduro", "manso", "marron", "mate", "menudo", "miedoso", "mismo", "mojado",
  "moreno", "naciente", "naranja", "negro", "nervioso", "neto", "noble", "nuevo",
  "obscuro", "orgulloso", "oscuro", "palpable", "pardo", "pequeno", "pesado", "picante",
  "plano", "pobre", "poderoso", "quieto", "rapido", "raro", "recto", "redondo",
  "repleto", "rigido", "robusto", "rojo", "romo", "ronco", "rosa", "rubio",
  "ruidoso", "salado", "salvaje", "seco", "seguro", "sensato", "sereno", "serio",
  "silencioso", "simple", "sobrio", "soleado", "solido", "sombrio", "suave", "sucio",
  "suelto", "templado", "tenso", "tibio", "tierno", "tieso", "timido", "tonto",
  "torpe", "tosco", "tranquilo", "triste", "valiente", "vasto", "veloz", "verde",
  "vicioso", "viejo", "vinoso", "violeta", "vivo", "volatil", "voraz", "vacio",
];

// ── English nouns ────────────────────────────────────────────────────────────
const en_nouns = [
  "acorn", "aegis", "agate", "air", "alder", "alloy", "amber", "anchor",
  "angel", "arc", "arch", "armor", "arrow", "ash", "aster", "atlas",
  "aure", "aurora", "axis", "badge", "bamboo", "bank", "bard", "barley",
  "basalt", "basil", "bass", "beacon", "beam", "beech", "bell", "bend",
  "beryl", "birch", "blade", "blaze", "bliss", "bloom", "bolt", "bough",
  "boulder", "breeze", "briar", "bridge", "brine", "brook", "buck", "bulb",
  "bull", "bush", "cabin", "cage", "cairn", "camel", "candle", "canoe",
  "cape", "cave", "cedar", "chalk", "charm", "chart", "cirrus", "citadel",
  "clan", "clasp", "clay", "cleft", "cliff", "cloak", "cloud", "clover",
  "cloyster", "coal", "coast", "cobalt", "cobble", "coil", "comet", "copse",
  "coral", "cork", "cove", "crane", "creek", "crest", "crust", "crypt",
  "cube", "dahlia", "dale", "dam", "dawn", "deer", "delta", "dew",
  "diamond", "dome", "dove", "drake", "drift", "dune", "dusk", "dust",
  "eagle", "echo", "eddy", "elm", "ember", "falcon", "fawn", "feldspar",
  "fen", "fern", "ferry", "field", "fir", "flame", "flask", "flint",
  "flora", "flute", "flux", "ford", "forge", "fort", "fox", "frost",
  "gale", "garnet", "gate", "gem", "ghost", "glacier", "glade", "glen",
  "glyph", "goblet", "gorge", "granite", "grove", "gull", "gust", "harbor",
  "haven", "hawk", "haze", "heart", "heath", "hedge", "helm", "heron",
  "hill", "hollow", "horn", "horse", "ice", "ike", "iris", "iron",
  "isle", "ivy", "jade", "jasper", "jet", "jewel", "kale", "keel",
  "kelp", "kestrel", "knoll", "knot", "lagoon", "lake", "lance", "lark",
  "latch", "laurel", "lava", "leaf", "light", "lily", "loam", "lodge",
  "loom", "lotus", "lynx", "maple", "marble", "marsh", "meadow", "mercury",
  "mist", "moor", "moraine", "moss", "moth", "mound", "nebula", "needle",
  "nimbus", "nova", "oak", "oasis", "onyx", "opal", "orbit", "orchid",
  "oriole", "osprey", "owl", "palm", "pearl", "pebble", "pike", "pine",
  "plume", "pond", "pool", "poppy", "portal", "prairie", "prism", "quarry",
  "quartz", "quill", "quiver", "radar", "ravine", "reed", "reef", "rift",
  "ridge", "rill", "rune", "saber", "sage", "sapphire", "scar", "scarf",
  "scout", "scroll", "shell", "shoal", "shore", "shrine", "silk", "slate",
  "smoke", "snow", "spar", "spark", "sparrow", "sphere", "spire", "spring",
  "spruce", "star", "steppe", "stone", "storm", "stream", "summit", "surf",
  "swan", "sword", "tarn", "temple", "thorn", "thyme", "tide", "timber",
  "topaz", "torch", "torrent", "totem", "trail", "tree", "trident", "tulip",
  "tundra", "vale", "vault", "veil", "vine", "violet", "volcano", "watch",
  "wave", "willow", "wind", "wing", "winter", "wolf", "wren", "zenith",
];

// ── French nouns ─────────────────────────────────────────────────────────────
const fr_nouns = [
  "abeille", "abime", "acacia", "acier", "algue", "alize", "alouette", "ambre",
  "ancre", "ange", "arc", "ardoise", "arene", "argile", "arome", "astre",
  "aube", "aurore", "azur", "baleine", "bambou", "barque", "bastion", "belier",
  "bise", "blizzard", "bois", "braise", "brise", "bronze", "bruyere", "bulbe",
  "cairn", "canopee", "canyon", "cedre", "cerf", "chene", "chouette", "ciel",
  "cime", "citron", "cognac", "colombe", "comete", "coquille", "corail", "corbeau",
  "cote", "coulee", "cristal", "cygne", "dalle", "delta", "diamant", "digue",
  "dune", "echo", "ecrin", "ecume", "elan", "emeraude", "encens", "epave",
  "epee", "epine", "erable", "erable", "estuaire", "etang", "falaise", "faucon",
  "feu", "fleur", "flocon", "flot", "fonte", "forge", "foudre", "fougere",
  "galet", "genet", "givre", "glace", "glaive", "gouffre", "gravier", "gres",
  "grive", "grotte", "gue", "gypse", "hetre", "houle", "ile", "iris",
  "ivoire", "jade", "jonc", "lagon", "lame", "lande", "lavande", "lichen",
  "lierre", "lin", "liseron", "lotus", "lueur", "lune", "lupin", "lustre",
  "malachite", "manoir", "marais", "marbre", "meleze", "menthe", "merle", "mesange",
  "mica", "mirage", "muguet", "mure", "myrrhe", "myrtille", "nacre", "nenuphar",
  "neige", "nid", "noisette", "nuage", "nymphe", "oasis", "ocean", "ocre",
  "olivier", "onyx", "opale", "or", "orage", "orbite", "orchidee", "ours",
  "palmier", "papillon", "parfum", "pavot", "perle", "phare", "pic", "pierre",
  "pilier", "pin", "pinson", "plaine", "plume", "pollen", "pont", "pre",
  "promontoire", "prunelle", "quai", "rade", "rafale", "raisin", "recif", "refuge",
  "resine", "roche", "romarin", "ronce", "roselin", "rosee", "rubis", "ruche",
  "ruisseau", "sable", "safran", "saphir", "saule", "savane", "seigle", "sel",
  "sentier", "sequoia", "serre", "silex", "sirene", "soie", "sommet", "source",
  "spirale", "steppe", "sureau", "talus", "taniere", "taureau", "tempete", "tilleul",
  "torche", "tourbe", "trefle", "tremble", "troene", "truite", "tulipe", "vague",
  "vallee", "vanille", "verger", "velin", "voile", "volcan", "zenith",
];

// ── Spanish nouns ────────────────────────────────────────────────────────────
const es_nouns = [
  "abeto", "abismo", "acantilado", "acebo", "acero", "aguila", "alameda", "alamo",
  "albufera", "alcazar", "aldea", "alga", "alisio", "almez", "alondra", "ambar",
  "ancla", "antilope", "arce", "arcilla", "arena", "arrecife", "arroyo", "astro",
  "aura", "avellano", "avena", "azufre", "bahia", "bambu", "barranco", "barro",
  "bergantin", "brisa", "bronce", "bruma", "buho", "buitre", "cabo", "cactus",
  "caliza", "cameo", "camino", "canal", "canela", "cana", "canon", "capullo",
  "carambano", "carbon", "cascara", "castano", "castor", "caudal", "cauce", "cayado",
  "cedro", "cenit", "centeno", "cerro", "chopo", "chubasco", "cima", "cirro",
  "cisne", "citrino", "clavel", "cobre", "condor", "coral", "cordillera", "corzo",
  "cresta", "cristal", "cuarzo", "cupula", "delta", "diamante", "dique", "duna",
  "ebano", "eco", "encina", "enebro", "escarcha", "escollo", "esmeralda", "espada",
  "espejo", "espiga", "espina", "espuma", "estanque", "estela", "estrella", "estuario",
  "faro", "feldespato", "flamenco", "flor", "fogata", "fresno", "fuente", "gacela",
  "galeon", "galerna", "gaviota", "gema", "geranio", "girasol", "glaciar", "golfo",
  "golondrina", "granito", "grulla", "guijarro", "halcon", "helecho", "hiedra", "hielo",
  "higuera", "huerto", "humo", "igneo", "isla", "istmo", "jade", "jazmin",
  "jinete", "junco", "laberinto", "lago", "laguna", "lama", "lanza", "laurel",
  "lava", "lechuza", "levante", "liana", "lirio", "llama", "llano", "lluvia",
  "loto", "luciernaga", "luna", "luz", "madera", "magnolia", "marea", "marfil",
  "margen", "matorral", "medusa", "menta", "meridiano", "mica", "mimbre", "mirador",
  "mirto", "monte", "muelle", "musgo", "nacar", "naranjo", "navio", "nectar",
  "nevero", "niebla", "niquel", "nogal", "nube", "nudo", "oasis", "obelisco",
  "oceano", "ocre", "ola", "olivo", "olmo", "onice", "opalo", "orbe",
  "orquidea", "otero", "palmera", "pantano", "paramo", "pedernal", "penasco", "perla",
  "pico", "piedra", "pinar", "pino", "plata", "playa", "pluma", "poniente",
  "portico", "pradera", "promontorio", "puente", "quebrada", "rambla", "rapido", "rayo",
  "refugio", "relampago", "resina", "ribera", "risco", "roble", "roca", "romero",
  "rosa", "rubi", "sabina", "sauce", "selva", "senda", "serpiente", "seta",
  "sierra", "silex", "sirena", "sombra", "surco", "tallo", "tempestad", "tempano",
  "templo", "tejo", "timon", "torbellino", "tormenta", "torre", "trebol", "trigal",
  "trueno", "tulipan", "turquesa", "valle", "vapor", "ventisca", "vertedero", "vid",
  "viento", "vina", "violeta", "volcan", "yunque", "zafiro", "zarza", "zumo",
];

// ── Combined lists ───────────────────────────────────────────────────────────
const adjectives = [...en_adjectives, ...fr_adjectives, ...es_adjectives];
const nouns = [...en_nouns, ...fr_nouns, ...es_nouns];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateAlias(domain: string): GeneratedAlias {
  const adj = randomItem(adjectives);
  const noun = randomItem(nouns);
  const prefix = `${adj}-${noun}`;
  const email = `${prefix}@${domain}`;
  return { prefix, domain, email };
}

export function isDomainValid(domain: string): boolean {
  return settingsService.getDomains().includes(domain);
}
