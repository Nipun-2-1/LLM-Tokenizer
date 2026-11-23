/* ═══════════════════════════════════════════════════════════════════════════
   TokenLab — Multi-Screen & Menubar Application Controller
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Application State ──
let activeScreenId = "screen-vocab";
let vocabulary = []; // { word: string, id: number, category?: string }
let lastTokenizedWords = []; // array of token objects { text, id, isUnk }
let detectedCycles = [];
let highlightCyclesActive = false;

// Meaning vs. Spelling Tool State
let focusWord = "";
let similarityThreshold = 0.55;
let toolOverlayMode = "both";

// 3D Camera States for Canvases
const msCamera = {
  rotX: 0.35,  // pitch
  rotY: 0.65,  // yaw
  zoom: 1.0,
  panX: 0,
  panY: 0,
  autoRotate: false,
  dragging: false,
  panning: false,
  startX: 0,
  startY: 0,
  animId: null
};

const structCamera = {
  rotX: 0.45,  // pitch
  rotY: 0.35,  // yaw
  zoom: 1.0,
  panX: 0,
  panY: 0,
  autoRotate: false,
  dragging: false,
  panning: false,
  startX: 0,
  startY: 0,
  animId: null
};

// ── DOM References ──
// Navigation
const navBtns         = document.querySelectorAll(".nav-btn");
const screens         = document.querySelectorAll(".screen-view");
const navVocabCount   = document.getElementById("nav-vocab-count");
const menubarNextId   = document.getElementById("menubar-next-id");
const btnGotoTokenizer= document.getElementById("btn-goto-tokenizer");
const btnGotoGraphs   = document.getElementById("btn-goto-graphs");
const themeToggleBtn  = document.getElementById("theme-toggle-btn");
const themeIcon       = document.getElementById("theme-icon");
const themeText       = document.getElementById("theme-text");

function isLightMode() {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light";
}

// Screen 1: Vocab Builder
const tokenForm       = document.getElementById("token-form");
const wordInput       = document.getElementById("word-input");
const idInput         = document.getElementById("id-input");
const nextIdHint      = document.getElementById("next-id-hint");
const autoSuggestIdBtn= document.getElementById("auto-suggest-id-btn");
const sentenceIn      = document.getElementById("sentence-input");
const startIdIn       = document.getElementById("start-id-input");
const bulkBtn         = document.getElementById("bulk-btn");
const vocabBody       = document.getElementById("vocab-body");
const vocabCount      = document.getElementById("vocab-count");
const searchInput     = document.getElementById("search-input");
const clearBtn        = document.getElementById("clear-btn");
const btnLoad1000     = document.getElementById("btn-load-1000");
const preset1000      = document.getElementById("preset-1000");
const presetNlp       = document.getElementById("preset-nlp");
const presetSemantic  = document.getElementById("preset-semantic");
const presetSubwords  = document.getElementById("preset-subwords");
const presetCode      = document.getElementById("preset-code");
const statTotal       = document.getElementById("stat-total");
const statUnique      = document.getElementById("stat-unique");
const statAvgLen      = document.getElementById("stat-avg-len");
const statMaxId       = document.getElementById("stat-max-id");

// Screen 2: Tokenizer
const tokenizerMode   = document.getElementById("tokenizer-mode");
const tokenizeTextIn  = document.getElementById("tokenize-text-input");
const runTokenizeBtn  = document.getElementById("run-tokenize-btn");
const autoIndexToggle = document.getElementById("auto-index-toggle");
const autoIndexAllBtn = document.getElementById("auto-index-all-btn");
const sampleTextBtn   = document.getElementById("sample-text-btn");
const tokenStream     = document.getElementById("token-stream");
const tokenStreamCnt  = document.getElementById("token-stream-count");
const tokenIdsDisplay = document.getElementById("token-ids-display");
const copyIdsBtn      = document.getElementById("copy-ids-btn");
const metricTokenCnt  = document.getElementById("metric-token-count");
const metricKnownCnt  = document.getElementById("metric-known-count");
const metricUnkCnt    = document.getElementById("metric-unk-count");
const metricHitRate   = document.getElementById("metric-hit-rate");

// Screen 3: Meaning vs Spelling
const msViewSelect    = document.getElementById("ms-view-select");
const msCatFilter     = document.getElementById("ms-cat-filter");
const focusWordSelect = document.getElementById("focus-word-select");
const msDensityRange  = document.getElementById("ms-density-range");
const msDensityVal    = document.getElementById("ms-density-val");
const simThresholdIn  = document.getElementById("sim-threshold");
const thresholdVal    = document.getElementById("threshold-val");
const btnShowBoth     = document.getElementById("btn-show-both");
const btnShowSpelling = document.getElementById("btn-show-spelling");
const btnShowMeaning  = document.getElementById("btn-show-meaning");
const msAutoRotateBtn = document.getElementById("ms-auto-rotate-btn");
const msResetViewBtn  = document.getElementById("ms-reset-view-btn");
const inspectorCard   = document.getElementById("inspector-card");
const inspectorWord   = document.getElementById("inspector-word-title");
const inspectorId     = document.getElementById("inspector-id-badge");
const inspectorCat    = document.getElementById("inspector-cat-badge");
const inspectorClose  = document.getElementById("inspector-close-btn");
const inspSpellingList= document.getElementById("inspector-spelling-list");
const inspMeaningList = document.getElementById("inspector-meaning-list");
const msCanvasContainer= document.getElementById("ms-canvas-container");
const msGraphCanvas   = document.getElementById("ms-graph-canvas");
const msCtx           = msGraphCanvas.getContext("2d");
const msTooltip       = document.getElementById("ms-tooltip");
const msLegend        = document.getElementById("ms-graph-legend");
const msZoomInBtn     = document.getElementById("ms-zoom-in-btn");
const msZoomOutBtn    = document.getElementById("ms-zoom-out-btn");
const msZoomLevel     = document.getElementById("ms-zoom-level");

// Screen 4: Structural Graphs (Tree & Cyclic)
const structGraphType   = document.getElementById("struct-graph-type");
const structDensityRange= document.getElementById("struct-density-range");
const structDensityVal  = document.getElementById("struct-density-val");
const structAutoRotateBtn= document.getElementById("struct-auto-rotate-btn");
const cycleToggleBtn    = document.getElementById("graph-cycle-toggle-btn");
const structResetBtn    = document.getElementById("struct-reset-view-btn");
const structContainer = document.getElementById("struct-canvas-container");
const structCanvas    = document.getElementById("struct-graph-canvas");
const structCtx       = structCanvas.getContext("2d");
const structTooltip   = document.getElementById("struct-tooltip");
const structLegend    = document.getElementById("struct-graph-legend");
const structZoomInBtn = document.getElementById("struct-zoom-in-btn");
const structZoomOutBtn= document.getElementById("struct-zoom-out-btn");
const structZoomLevel = document.getElementById("struct-zoom-level");

// Screen 5: Analytics
const catDistribution = document.getElementById("category-distribution-bars");
const lenDistribution = document.getElementById("length-distribution-bars");
const btnExportVocab  = document.getElementById("btn-export-vocab");

// ── Colors ──
const PALETTE = [
  "#7c5cfc", "#38bdf8", "#34d399", "#fbbf24", "#f43f5e",
  "#a78bfa", "#fb923c", "#2dd4bf", "#e879f9", "#60a5fa",
  "#f472b6", "#4ade80", "#facc15", "#818cf8", "#fb7185",
];

const CATEGORY_COLORS = {
  animals:   "#34d399",
  actions:   "#f43f5e",
  vehicles:  "#fbbf24",
  objects:   "#38bdf8",
  grammar:   "#a78bfa",
  modifiers: "#ec4899",
  tech:      "#818cf8",
  general:   "#94a3b8"
};

function colorFor(index) {
  return PALETTE[Math.abs(index) % PALETTE.length];
}

// ══════════════════════════════════════════════════════════
//  SCREEN SWITCHING & NAVIGATION
// ══════════════════════════════════════════════════════════
function switchScreen(targetScreenId) {
  activeScreenId = targetScreenId;

  // Toggle active button
  navBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === targetScreenId);
  });

  // Toggle active screen view
  screens.forEach(screen => {
    screen.classList.toggle("active-screen", screen.id === targetScreenId);
  });

  // URL Hash Sync
  const hashKey = targetScreenId.replace("screen-", "");
  window.location.hash = hashKey;

  // Redraw canvases when screen becomes visible
  setTimeout(() => {
    if (targetScreenId === "screen-meaning-spelling") {
      drawMeaningSpellingGraph();
    } else if (targetScreenId === "screen-graphs") {
      drawStructGraph();
    } else if (targetScreenId === "screen-analytics") {
      renderAnalytics();
    }
  }, 30);
}

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    switchScreen(btn.dataset.screen);
  });
});

if (btnGotoTokenizer) {
  btnGotoTokenizer.addEventListener("click", () => switchScreen("screen-tokenizer"));
}
if (btnGotoGraphs) {
  btnGotoGraphs.addEventListener("click", () => switchScreen("screen-graphs"));
}

// Restore active screen from URL Hash
function initScreenFromHash() {
  const hash = window.location.hash.replace("#", "");
  const targetId = `screen-${hash}`;
  if (document.getElementById(targetId)) {
    switchScreen(targetId);
  } else {
    switchScreen("screen-vocab");
  }
}

// ══════════════════════════════════════════════════════════
//  SEMANTICS & SPELLING ALGORITHMS
// ══════════════════════════════════════════════════════════
const SEMANTIC_DICTIONARY = {
  // Animals
  cat: { category: "animals", vec: [0.12, 0.88] },
  dog: { category: "animals", vec: [0.14, 0.86] },
  fox: { category: "animals", vec: [0.15, 0.84] },
  horse: { category: "animals", vec: [0.10, 0.92] },
  bird: { category: "animals", vec: [0.18, 0.89] },

  // Actions
  run: { category: "actions", vec: [0.88, 0.82] },
  running: { category: "actions", vec: [0.89, 0.84] },
  runner: { category: "actions", vec: [0.86, 0.80] },
  play: { category: "actions", vec: [0.80, 0.88] },
  playing: { category: "actions", vec: [0.82, 0.89] },
  player: { category: "actions", vec: [0.79, 0.85] },
  sat: { category: "actions", vec: [0.75, 0.72] },
  sit: { category: "actions", vec: [0.74, 0.70] },
  jumps: { category: "actions", vec: [0.85, 0.88] },
  jump: { category: "actions", vec: [0.84, 0.87] },
  learn: { category: "actions", vec: [0.78, 0.65] },
  learns: { category: "actions", vec: [0.79, 0.66] },
  training: { category: "actions", vec: [0.83, 0.70] },

  // Vehicles
  car: { category: "vehicles", vec: [0.22, 0.28] },
  cart: { category: "vehicles", vec: [0.20, 0.32] },
  truck: { category: "vehicles", vec: [0.24, 0.26] },
  bus: { category: "vehicles", vec: [0.25, 0.24] },
  train: { category: "vehicles", vec: [0.18, 0.35] },

  // Objects
  mat: { category: "objects", vec: [0.35, 0.52] },
  card: { category: "objects", vec: [0.38, 0.48] },
  box: { category: "objects", vec: [0.32, 0.55] },
  ball: { category: "objects", vec: [0.42, 0.58] },
  track: { category: "objects", vec: [0.40, 0.42] },

  // Grammar
  the: { category: "grammar", vec: [0.50, 0.08] },
  on: { category: "grammar", vec: [0.52, 0.12] },
  in: { category: "grammar", vec: [0.51, 0.10] },
  and: { category: "grammar", vec: [0.48, 0.09] },
  with: { category: "grammar", vec: [0.54, 0.14] },
  over: { category: "grammar", vec: [0.55, 0.15] },
  a: { category: "grammar", vec: [0.49, 0.07] },
  is: { category: "grammar", vec: [0.50, 0.11] },

  // Modifiers
  fast: { category: "modifiers", vec: [0.75, 0.35] },
  quick: { category: "modifiers", vec: [0.76, 0.36] },
  slow: { category: "modifiers", vec: [0.68, 0.30] },
  brown: { category: "modifiers", vec: [0.62, 0.45] },
  lazy: { category: "modifiers", vec: [0.65, 0.28] },

  // Tech
  model: { category: "tech", vec: [0.85, 0.22] },
  neural: { category: "tech", vec: [0.88, 0.24] },
  network: { category: "tech", vec: [0.86, 0.21] },
  attention: { category: "tech", vec: [0.82, 0.25] },
  deep: { category: "tech", vec: [0.80, 0.28] },
  learning: { category: "tech", vec: [0.84, 0.30] }
};

function getWordSemantics(word) {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (SEMANTIC_DICTIONARY[clean]) return SEMANTIC_DICTIONARY[clean];

  if (clean.endsWith("ing") || clean.endsWith("ed") || clean.endsWith("ize")) {
    return { category: "actions", vec: [0.82, 0.80] };
  }
  if (clean.endsWith("er") || clean.endsWith("or")) {
    return { category: "actions", vec: [0.80, 0.78] };
  }
  if (clean.endsWith("ly") || clean.endsWith("ful") || clean.endsWith("ish")) {
    return { category: "modifiers", vec: [0.70, 0.32] };
  }
  if (clean.endsWith("tion") || clean.endsWith("ment") || clean.endsWith("ness")) {
    return { category: "objects", vec: [0.40, 0.50] };
  }

  let h1 = 0, h2 = 0;
  for (let i = 0; i < clean.length; i++) {
    h1 = (h1 * 31 + clean.charCodeAt(i)) % 1000;
    h2 = (h2 * 17 + clean.charCodeAt(i)) % 1000;
  }
  return { category: "general", vec: [0.2 + (h1 / 1000) * 0.6, 0.2 + (h2 / 1000) * 0.6] };
}

function levenshteinDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

function getSpellingSimilarity(w1, w2) {
  const a = w1.toLowerCase(), b = w2.toLowerCase();
  if (a === b) return 1.0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return Math.max(0, 1.0 - levenshteinDistance(a, b) / maxLen);
}

function getMeaningSimilarity(w1, w2) {
  const s1 = getWordSemantics(w1);
  const s2 = getWordSemantics(w2);
  const catBonus = s1.category === s2.category && s1.category !== "general" ? 0.35 : 0.0;
  const dist = Math.hypot(s1.vec[0] - s2.vec[0], s1.vec[1] - s2.vec[1]);
  return Math.min(1.0, Math.max(0, 1.0 - dist / 0.85) * 0.7 + catBonus);
}

// ══════════════════════════════════════════════════════════
//  VOCABULARY MANAGEMENT & AUTO-INDEXING
// ══════════════════════════════════════════════════════════
const DEFAULT_VOCABULARY = [
  { word: "the", id: 101 }, { word: "cat", id: 102 }, { word: "car", id: 103 },
  { word: "cart", id: 104 }, { word: "card", id: 105 }, { word: "sat", id: 106 },
  { word: "on", id: 107 }, { word: "mat", id: 108 }, { word: "play", id: 109 },
  { word: "player", id: 110 }, { word: "playing", id: 111 }, { word: "run", id: 112 },
  { word: "runner", id: 113 }, { word: "running", id: 114 }, { word: "fast", id: 115 },
  { word: "dog", id: 116 }, { word: "box", id: 117 }
];

function loadVocabulary() {
  try {
    const raw = localStorage.getItem("tokenlab_vocab_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 50) {
        vocabulary = parsed;
        return;
      }
    }
  } catch (e) {
    console.error(e);
  }
  // Load 1000+ Common Vocabulary dataset if available
  if (window.COMMON_VOCABULARY_1000 && Array.isArray(window.COMMON_VOCABULARY_1000)) {
    vocabulary = JSON.parse(JSON.stringify(window.COMMON_VOCABULARY_1000));
  } else {
    vocabulary = [...DEFAULT_VOCABULARY];
  }
  saveVocabulary();
}

function load1000Vocabulary() {
  if (window.COMMON_VOCABULARY_1000 && Array.isArray(window.COMMON_VOCABULARY_1000)) {
    vocabulary = JSON.parse(JSON.stringify(window.COMMON_VOCABULARY_1000));
    saveVocabulary();
    refreshAll();
  }
}

function saveVocabulary() {
  localStorage.setItem("tokenlab_vocab_v1", JSON.stringify(vocabulary));
}

function getNextAvailableId() {
  if (vocabulary.length === 0) return 100;
  return Math.max(...vocabulary.map(t => t.id)) + 1;
}

function updateNextIdHints() {
  const nextId = getNextAvailableId();
  if (nextIdHint) nextIdHint.textContent = nextId;
  if (menubarNextId) menubarNextId.textContent = nextId;
}

function addToken(word, id = null) {
  word = word.trim().toLowerCase();
  if (!word) return false;

  let assignedId = parseInt(id, 10);
  if (isNaN(assignedId) || assignedId < 0) {
    assignedId = getNextAvailableId();
  }

  const existing = vocabulary.find(t => t.word === word);
  if (existing) {
    existing.id = assignedId;
  } else {
    vocabulary.push({ word, id: assignedId });
  }

  saveVocabulary();
  refreshAll();
  return true;
}

function autoIndexWordsFromText(text) {
  if (!text || !text.trim()) return 0;
  const words = text.match(/\b[A-Za-z0-9#_'-]+\b|[^\s\w]/g) || [];
  if (words.length === 0) return 0;

  const existingMap = new Set(vocabulary.map(t => t.word.toLowerCase()));
  let nextId = getNextAvailableId();
  let addedCount = 0;

  for (const raw of words) {
    const clean = raw.toLowerCase().replace(/^##/, "").trim();
    if (!clean || existingMap.has(clean)) continue;
    existingMap.add(clean);
    vocabulary.push({ word: clean, id: nextId++ });
    addedCount++;
  }

  if (addedCount > 0) {
    saveVocabulary();
    refreshAll();
  }
  return addedCount;
}

function removeToken(index) {
  vocabulary.splice(index, 1);
  saveVocabulary();
  refreshAll();
}

function clearVocabulary() {
  vocabulary = [];
  saveVocabulary();
  refreshAll();
}

// ══════════════════════════════════════════════════════════
//  VOCABULARY TABLE & STATS
// ══════════════════════════════════════════════════════════
function renderTable(filter = "") {
  const lf = filter.trim().toLowerCase();
  const filtered = vocabulary
    .map((t, idx) => ({ ...t, _origIdx: idx }))
    .filter(t => !lf || t.word.toLowerCase().includes(lf) || String(t.id).includes(lf));

  vocabCount.textContent = vocabulary.length;
  navVocabCount.textContent = vocabulary.length;
  updateNextIdHints();

  if (filtered.length === 0) {
    vocabBody.innerHTML = `<tr class="empty-row"><td colspan="4">${
      vocabulary.length === 0 ? "No tokens yet — add some above!" : "No matching tokens found."
    }</td></tr>`;
    return;
  }

  // Display first 150 items for snappy performance if long list
  const displaySlice = lf ? filtered : filtered.slice(0, 150);
  let html = displaySlice
    .map(t => {
      const sem = getWordSemantics(t.word);
      const catColor = CATEGORY_COLORS[sem.category] || "#94a3b8";
      return `
    <tr class="fade-in">
      <td class="token-id">${t.id}</td>
      <td class="token-word">${escapeHtml(t.word)}</td>
      <td><span class="category-tag" style="color:${catColor}; border:1px solid ${catColor}44;">${sem.category}</span></td>
      <td><button type="button" class="btn btn-sm btn-remove" data-idx="${t._origIdx}">Remove</button></td>
    </tr>`;
    })
    .join("");

  if (!lf && filtered.length > 150) {
    html += `<tr class="info-row"><td colspan="4" style="text-align:center; color:#8b92b6; font-size:0.82rem; padding:1rem;">Showing first 150 of ${filtered.length} tokens. Use search filter above to instantly locate any token.</td></tr>`;
  }

  vocabBody.innerHTML = html;
}

function updateStats() {
  statTotal.textContent = vocabulary.length;
  statUnique.textContent = new Set(vocabulary.map(t => t.word)).size;
  if (vocabulary.length > 0) {
    const avg = vocabulary.reduce((s, t) => s + t.word.length, 0) / vocabulary.length;
    statAvgLen.textContent = avg.toFixed(1);
    statMaxId.textContent = Math.max(...vocabulary.map(t => t.id));
  } else {
    statAvgLen.textContent = "0";
    statMaxId.textContent = "—";
  }
}

function populateFocusWordSelect() {
  const currentVal = focusWordSelect.value;
  focusWordSelect.innerHTML = `<option value="">(All Tokens - Global Overview)</option>` +
    vocabulary
      .slice()
      .sort((a, b) => a.word.localeCompare(b.word))
      .map(t => `<option value="${escapeHtml(t.word)}" ${t.word === currentVal ? "selected" : ""}>${escapeHtml(t.word)} (ID: ${t.id})</option>`)
      .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ══════════════════════════════════════════════════════════
//  INTERACTIVE TOKENIZER ENGINE
// ══════════════════════════════════════════════════════════
function buildVocabMap() {
  const map = new Map();
  for (const item of vocabulary) map.set(item.word.toLowerCase(), item.id);
  return map;
}

function tokenizeText(text, mode = "greedy") {
  if (!text || !text.trim()) return [];
  if (autoIndexToggle.checked) autoIndexWordsFromText(text);

  const vocabMap = buildVocabMap();
  const unkId = 0;

  if (mode === "word") {
    const words = text.match(/\b[A-Za-z0-9#_'-]+\b|[^\s\w]/g) || [];
    return words.map(w => {
      const lower = w.toLowerCase();
      return vocabMap.has(lower) ? { text: w, id: vocabMap.get(lower), isUnk: false } : { text: w, id: unkId, isUnk: true };
    });
  }

  if (mode === "char") {
    return Array.from(text).map(ch => {
      if (ch === " ") return { text: "␣", id: vocabMap.get(" ") || vocabMap.get("␣") || unkId, isUnk: !vocabMap.has(" ") };
      const lower = ch.toLowerCase();
      return vocabMap.has(lower) ? { text: ch, id: vocabMap.get(lower), isUnk: false } : { text: ch, id: unkId, isUnk: true };
    });
  }

  // Greedy Longest-Match Subword Tokenizer
  const words = text.match(/\b[A-Za-z0-9#_'-]+\b|[^\s\w]/g) || [];
  const result = [];

  for (const rawWord of words) {
    const word = rawWord.toLowerCase();
    if (vocabMap.has(word)) {
      result.push({ text: rawWord, id: vocabMap.get(word), isUnk: false });
      continue;
    }

    let start = 0;
    const subTokens = [];
    let isBad = false;

    while (start < word.length) {
      let end = word.length;
      let matchedToken = null, matchedId = null;

      while (start < end) {
        let substr = word.slice(start, end);
        let checkStr = start > 0 ? "##" + substr : substr;
        if (vocabMap.has(checkStr)) {
          matchedToken = checkStr; matchedId = vocabMap.get(checkStr); break;
        } else if (vocabMap.has(substr)) {
          matchedToken = substr; matchedId = vocabMap.get(substr); break;
        }
        end--;
      }

      if (matchedToken === null) {
        const singleChar = word.slice(start, start + 1);
        if (vocabMap.has(singleChar)) {
          subTokens.push({ text: singleChar, id: vocabMap.get(singleChar), isUnk: false });
        } else {
          isBad = true;
          subTokens.push({ text: singleChar, id: unkId, isUnk: true });
        }
        start++;
      } else {
        subTokens.push({ text: matchedToken, id: matchedId, isUnk: false });
        start = end;
      }
    }

    if (isBad && subTokens.length === 1 && subTokens[0].text === word) {
      result.push({ text: rawWord, id: unkId, isUnk: true });
    } else {
      result.push(...subTokens);
    }
  }

  return result;
}

function runTokenizer() {
  const text = tokenizeTextIn.value;
  const mode = tokenizerMode.value;
  lastTokenizedWords = tokenizeText(text, mode);

  renderTokenStream(lastTokenizedWords);
  updateTokenizerMetrics(lastTokenizedWords);

  if (activeScreenId === "screen-graphs" && structGraphType.value === "cyclic") {
    drawStructGraph();
  }
}

function renderTokenStream(tokens) {
  tokenStreamCnt.textContent = `${tokens.length} tokens`;
  if (tokens.length === 0) {
    tokenStream.innerHTML = `<span class="placeholder-text">Tokens will appear here as you type or click "Tokenize Text"...</span>`;
    tokenIdsDisplay.textContent = `[ ]`;
    return;
  }

  const ids = tokens.map(t => (t.isUnk ? `<UNK:${t.id}>` : t.id));
  tokenIdsDisplay.textContent = `[ ${ids.join(", ")} ]`;

  tokenStream.innerHTML = tokens
    .map(
      (t, idx) => `
    <span class="token-chip ${t.isUnk ? "is-unk" : ""}" data-idx="${idx}" title="${t.isUnk ? 'Unknown token (click to auto-index and add to vocab)' : 'Token ID: ' + t.id}">
      <span class="token-chip-text">${escapeHtml(t.text)}</span>
      <span class="token-chip-id">${t.isUnk ? 'UNK' : t.id}</span>
    </span>`
    )
    .join("");
}

function updateTokenizerMetrics(tokens) {
  const total = tokens.length;
  metricTokenCnt.textContent = total;
  if (total === 0) {
    metricKnownCnt.textContent = "0";
    metricUnkCnt.textContent = "0";
    metricHitRate.textContent = "100%";
    return;
  }
  const unks = tokens.filter(t => t.isUnk).length;
  metricKnownCnt.textContent = total - unks;
  metricUnkCnt.textContent = unks;
  metricHitRate.textContent = `${Math.round(((total - unks) / total) * 100)}%`;
}

// ══════════════════════════════════════════════════════════
//  3D PERSPECTIVE PROJECTION & DECLUTTERING ENGINE
// ══════════════════════════════════════════════════════════

/**
 * Projects a 3D coordinate (x, y, z) to 2D canvas space with pitch (rotX) and yaw (rotY).
 */
function project3D(x, y, z, rotX, rotY, W, H, zoom = 1.0, panX = 0, panY = 0, fov = 750) {
  // Rotate around Y-axis (Yaw)
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;

  // Rotate around X-axis (Pitch)
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  // Perspective camera projection
  const cameraZ = fov * zoom;
  const depth = z2 + cameraZ;
  if (depth <= 20) return null; // Behind camera clipping

  const scale = cameraZ / depth;
  const projX = W / 2 + panX + x1 * scale;
  const projY = H / 2 + panY + y2 * scale;

  return { x: projX, y: projY, z: z2, scale, depth };
}

/**
 * Declutters the 1,400+ vocabulary down to a clean, readable subset of tokens
 * based on user density preferences, category filters, and active sentence tokens.
 */
function filterDeclutteredTokens(maxCount = 40, catFilter = "all", focusToken = "") {
  if (vocabulary.length === 0) return [];
  const focusLower = (focusToken || "").toLowerCase().trim();

  // 1. Active Sentence Filter
  if (catFilter === "sentence" && lastTokenizedWords && lastTokenizedWords.length > 0) {
    const sentenceSet = new Set(lastTokenizedWords.map(t => t.text.toLowerCase()));
    const matching = vocabulary.filter(t => sentenceSet.has(t.word.toLowerCase()));

    const neighborSet = new Set(matching.map(t => t.word));
    for (const m of matching) {
      const topNeighbors = vocabulary
        .filter(t => !neighborSet.has(t.word))
        .map(t => ({ t, sim: getMeaningSimilarity(m.word, t.word) }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 2);
      topNeighbors.forEach(n => neighborSet.add(n.t.word));
      if (neighborSet.size >= maxCount) break;
    }
    return vocabulary.filter(t => neighborSet.has(t.word)).slice(0, maxCount);
  }

  // 2. Specific Category Filter
  if (catFilter && catFilter !== "all") {
    const catWords = vocabulary.filter(t => getWordSemantics(t.word).category === catFilter);
    return catWords.slice(0, maxCount);
  }

  // 3. Balanced Stratified Sample across all categories
  const categories = ["animals", "actions", "vehicles", "objects", "grammar", "modifiers", "tech", "general"];
  const bucketMap = new Map();
  categories.forEach(c => bucketMap.set(c, []));

  vocabulary.forEach(t => {
    const cat = getWordSemantics(t.word).category;
    if (bucketMap.has(cat)) bucketMap.get(cat).push(t);
  });

  const selected = [];
  const selectedSet = new Set();

  if (focusLower) {
    const focused = vocabulary.find(t => t.word.toLowerCase() === focusLower);
    if (focused) {
      selected.push(focused);
      selectedSet.add(focused.word);
    }
  }

  let index = 0;
  while (selected.length < maxCount) {
    let addedAny = false;
    for (const cat of categories) {
      const bucket = bucketMap.get(cat);
      if (index < bucket.length) {
        const item = bucket[index];
        if (!selectedSet.has(item.word)) {
          selectedSet.add(item.word);
          selected.push(item);
          addedAny = true;
          if (selected.length >= maxCount) break;
        }
      }
    }
    index++;
    if (!addedAny) break;
  }

  return selected;
}

// ══════════════════════════════════════════════════════════
//  SCREEN 3: 3D MEANING VS. SPELLING ENGINE
// ══════════════════════════════════════════════════════════
let ms3DNodes = [];
let ms3DEdges = [];

function build3DMeaningSpellingData(viewMode) {
  ms3DNodes = [];
  ms3DEdges = [];
  if (vocabulary.length === 0) return;

  const maxTokens = msDensityRange ? parseInt(msDensityRange.value, 10) : 40;
  const catFilter = msCatFilter ? msCatFilter.value : "all";
  const activeTokens = filterDeclutteredTokens(maxTokens, catFilter, focusWord);

  const N = activeTokens.length;
  const sortedBySpelling = [...activeTokens].sort((a, b) => a.word.localeCompare(b.word));
  const spellRankMap = new Map();
  sortedBySpelling.forEach((item, idx) => spellRankMap.set(item.word, (idx / (N - 1 || 1)) * 2 - 1));

  activeTokens.forEach((item, idx) => {
    const sem = getWordSemantics(item.word);
    const catColor = CATEGORY_COLORS[sem.category] || colorFor(idx);

    let x = 0, y = 0, z = 0;

    if (viewMode === "spelling") {
      // 3D Torus clustered by orthographic spelling
      const angle = (idx / N) * Math.PI * 2;
      const R = 220, r = 60 + (item.word.length % 3) * 15;
      const phi = idx * 1.5;
      x = (R + r * Math.cos(phi)) * Math.cos(angle);
      y = r * Math.sin(phi);
      z = (R + r * Math.cos(phi)) * Math.sin(angle);
    } else if (viewMode === "meaning") {
      // 3D Meaning Spherical Clusters
      const semX = (sem.vec[0] - 0.5) * 500;
      const semY = -(sem.vec[1] - 0.5) * 360;
      const hash = ((item.word.charCodeAt(0) * 13 + item.word.length * 23) % 100) / 100 - 0.5;
      x = semX + hash * 60;
      y = semY + hash * 40;
      z = hash * 300;
    } else {
      // 3D Meaning vs Spelling Cube
      const spellX = spellRankMap.get(item.word) * 250;
      const meanY = -(sem.vec[1] - 0.5) * 360;
      const lengthZ = (item.word.length - 4.5) * 55 + ((item.id % 7) - 3) * 25;
      x = spellX;
      y = meanY;
      z = Math.max(-220, Math.min(220, lengthZ));
    }

    const isFocused = focusWord && focusWord.toLowerCase() === item.word.toLowerCase();
    ms3DNodes.push({
      id: `token_${item.id}`,
      word: item.word,
      tokenId: item.id,
      category: sem.category,
      x, y, z,
      radius: isFocused ? 20 : 13 + Math.min(6, item.word.length),
      color: catColor,
      isFocused
    });
  });

  // Calculate Similarity Edges (Cap max edges per node to 3 to prevent crowding)
  const nodeEdgeCounts = new Map(ms3DNodes.map(n => [n.id, 0]));

  for (let i = 0; i < ms3DNodes.length; i++) {
    for (let j = i + 1; j < ms3DNodes.length; j++) {
      const n1 = ms3DNodes[i], n2 = ms3DNodes[j];
      if (focusWord && n1.word.toLowerCase() !== focusWord.toLowerCase() && n2.word.toLowerCase() !== focusWord.toLowerCase()) continue;
      if (nodeEdgeCounts.get(n1.id) >= 3 && nodeEdgeCounts.get(n2.id) >= 3) continue;

      const spellSim = getSpellingSimilarity(n1.word, n2.word);
      const meanSim = getMeaningSimilarity(n1.word, n2.word);

      if ((toolOverlayMode === "both" || toolOverlayMode === "spelling") && viewMode !== "meaning" && spellSim >= similarityThreshold) {
        ms3DEdges.push({
          source: n1.id, target: n2.id, n1, n2, type: "spelling", sim: spellSim,
          color: "#38bdf8", width: Math.max(1.2, spellSim * 3)
        });
        nodeEdgeCounts.set(n1.id, nodeEdgeCounts.get(n1.id) + 1);
        nodeEdgeCounts.set(n2.id, nodeEdgeCounts.get(n2.id) + 1);
      }

      if ((toolOverlayMode === "both" || toolOverlayMode === "meaning") && viewMode !== "spelling" && meanSim >= similarityThreshold) {
        ms3DEdges.push({
          source: n1.id, target: n2.id, n1, n2, type: "meaning", sim: meanSim,
          color: "#a78bfa", width: Math.max(1.2, meanSim * 3.2)
        });
        nodeEdgeCounts.set(n1.id, nodeEdgeCounts.get(n1.id) + 1);
        nodeEdgeCounts.set(n2.id, nodeEdgeCounts.get(n2.id) + 1);
      }
    }
  }
}

function drawMeaningSpellingGraph() {
  const dpr = window.devicePixelRatio || 1;
  const rect = msCanvasContainer.getBoundingClientRect();
  const W = rect.width, H = rect.height;

  msGraphCanvas.width = W * dpr;
  msGraphCanvas.height = H * dpr;
  msCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  msCtx.clearRect(0, 0, W, H);

  if (vocabulary.length === 0) {
    msCtx.fillStyle = "#8b92b6";
    msCtx.font = "15px Inter, sans-serif";
    msCtx.textAlign = "center";
    msCtx.fillText("Vocabulary is empty. Add tokens in the Vocabulary screen!", W / 2, H / 2);
    msLegend.innerHTML = "";
    return;
  }

  const viewMode = msViewSelect.value;
  build3DMeaningSpellingData(viewMode);
  renderMeaningSpellingLegend();

  // 1. Draw 3D Ground Grid
  draw3DGroundGrid(msCtx, W, H, msCamera, viewMode === "dual-map");

  // 2. Project Edges & Nodes to 2D
  const projectedEdges = [];
  for (const edge of ms3DEdges) {
    const p1 = project3D(edge.n1.x, edge.n1.y, edge.n1.z, msCamera.rotX, msCamera.rotY, W, H, msCamera.zoom, msCamera.panX, msCamera.panY);
    const p2 = project3D(edge.n2.x, edge.n2.y, edge.n2.z, msCamera.rotX, msCamera.rotY, W, H, msCamera.zoom, msCamera.panX, msCamera.panY);
    if (p1 && p2) {
      projectedEdges.push({ edge, p1, p2, z: (p1.z + p2.z) / 2 });
    }
  }

  const projectedNodes = [];
  for (const node of ms3DNodes) {
    const p = project3D(node.x, node.y, node.z, msCamera.rotX, msCamera.rotY, W, H, msCamera.zoom, msCamera.panX, msCamera.panY);
    if (p) {
      node.projX = p.x;
      node.projY = p.y;
      node.projRadius = Math.max(7, node.radius * p.scale);
      projectedNodes.push({ node, p, z: p.z });
    }
  }

  // 3. Depth Sorting (Painter's Algorithm)
  projectedEdges.sort((a, b) => a.z - b.z);
  projectedNodes.sort((a, b) => a.z - b.z);

  // 4. Render Edges with 3D Depth Fog
  for (const item of projectedEdges) {
    const { edge, p1, p2, z } = item;
    const alpha = Math.max(0.15, Math.min(0.85, 0.5 + (z / 800)));
    msCtx.save();
    msCtx.beginPath();
    msCtx.moveTo(p1.x, p1.y);
    msCtx.lineTo(p2.x, p2.y);
    msCtx.strokeStyle = edge.color;
    msCtx.globalAlpha = alpha;
    msCtx.lineWidth = edge.width * Math.min(1.5, (p1.scale + p2.scale) / 2);
    msCtx.stroke();
    msCtx.restore();
  }

  // 5. Render Nodes with 3D Spherical Radial Lighting
  for (const item of projectedNodes) {
    const { node, p } = item;
    const r = node.projRadius;
    const alpha = Math.max(0.35, Math.min(1.0, 0.65 + (p.z / 700)));

    msCtx.save();
    msCtx.globalAlpha = alpha;

    const grad = msCtx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r);
    if (node.isFocused) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.7, "#38bdf8");
      grad.addColorStop(1, "#0369a1");
    } else {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, node.color);
      grad.addColorStop(1, "#0a0c16");
    }

    msCtx.beginPath();
    msCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
    msCtx.fillStyle = grad;
    msCtx.fill();

    msCtx.strokeStyle = node.isFocused ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
    msCtx.lineWidth = node.isFocused ? 2.5 : 1;
    msCtx.stroke();

    // Billboard Labels (Only shown if close or hovered/focused to prevent crowding)
    const showLabel = node.isFocused || node.isHovered || r >= 13;
    if (showLabel) {
      const isLight = isLightMode();
      msCtx.fillStyle = isLight ? "#0f172a" : "#ffffff";
      msCtx.font = `bold ${Math.max(9, Math.round(r * 0.72))}px Inter, sans-serif`;
      msCtx.textAlign = "center";
      msCtx.textBaseline = "bottom";
      const lbl = node.word.length > 8 ? node.word.slice(0, 7) + "…" : node.word;
      msCtx.fillText(lbl, p.x, p.y - r - 3);

      msCtx.font = `bold ${Math.max(8, Math.round(r * 0.55))}px JetBrains Mono, monospace`;
      msCtx.fillStyle = isLight ? "#b45309" : "#fde047";
      msCtx.textBaseline = "top";
      msCtx.fillText(`#${node.tokenId}`, p.x, p.y + r + 3);
    }

    msCtx.restore();
  }
}

function draw3DGroundGrid(targetCtx, W, H, camera, isDualMap = true) {
  const isLight = isLightMode();
  const groundY = 190;
  const size = 300, step = 75;

  targetCtx.save();
  targetCtx.lineWidth = 1;

  for (let x = -size; x <= size; x += step) {
    const p1 = project3D(x, groundY, -size, camera.rotX, camera.rotY, W, H, camera.zoom, camera.panX, camera.panY);
    const p2 = project3D(x, groundY, size, camera.rotX, camera.rotY, W, H, camera.zoom, camera.panX, camera.panY);
    if (p1 && p2) {
      targetCtx.beginPath();
      targetCtx.moveTo(p1.x, p1.y);
      targetCtx.lineTo(p2.x, p2.y);
      targetCtx.strokeStyle = x === 0
        ? (isLight ? "rgba(2, 132, 199, 0.7)" : "rgba(56, 189, 248, 0.4)")
        : (isLight ? "rgba(148, 163, 184, 0.35)" : "rgba(42, 48, 77, 0.25)");
      targetCtx.stroke();
    }
  }

  for (let z = -size; z <= size; z += step) {
    const p1 = project3D(-size, groundY, z, camera.rotX, camera.rotY, W, H, camera.zoom, camera.panX, camera.panY);
    const p2 = project3D(size, groundY, z, camera.rotX, camera.rotY, W, H, camera.zoom, camera.panX, camera.panY);
    if (p1 && p2) {
      targetCtx.beginPath();
      targetCtx.moveTo(p1.x, p1.y);
      targetCtx.lineTo(p2.x, p2.y);
      targetCtx.strokeStyle = z === 0
        ? (isLight ? "rgba(124, 58, 237, 0.7)" : "rgba(167, 139, 250, 0.4)")
        : (isLight ? "rgba(148, 163, 184, 0.35)" : "rgba(42, 48, 77, 0.25)");
      targetCtx.stroke();
    }
  }

  if (isDualMap) {
    const pX = project3D(size + 30, groundY, 0, camera.rotX, camera.rotY, W, H, camera.zoom, camera.panX, camera.panY);
    if (pX) {
      targetCtx.fillStyle = isLight ? "#0284c7" : "#38bdf8"; targetCtx.font = "bold 11px Inter, sans-serif";
      targetCtx.fillText("X: Spelling ➔", pX.x, pX.y);
    }
    const pZ = project3D(0, groundY, size + 30, camera.rotX, camera.rotY, W, H, camera.zoom, camera.panX, camera.panY);
    if (pZ) {
      targetCtx.fillStyle = isLight ? "#d97706" : "#fbbf24"; targetCtx.font = "bold 11px Inter, sans-serif";
      targetCtx.fillText("Z: Token Depth ➔", pZ.x, pZ.y);
    }
    const pY = project3D(0, -groundY - 20, 0, camera.rotX, camera.rotY, W, H, camera.zoom, camera.panX, camera.panY);
    if (pY) {
      targetCtx.fillStyle = isLight ? "#7c3aed" : "#a78bfa"; targetCtx.font = "bold 11px Inter, sans-serif";
      targetCtx.fillText("▲ Y: Meaning Domain", pY.x, pY.y);
    }
  }

  targetCtx.restore();
}

function renderMeaningSpellingLegend() {
  msLegend.innerHTML = `
    <span class="legend-item"><span class="legend-swatch" style="background:#38bdf8"></span> 🔤 Spelling Link</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#a78bfa"></span> 🧠 Meaning Link</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#34d399"></span> Animals</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#f43f5e"></span> Actions</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#fbbf24"></span> Vehicles</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#38bdf8"></span> Objects</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#a78bfa"></span> Grammar</span>
  `;
}

function inspectWord(word) {
  if (!word) {
    focusWord = "";
    focusWordSelect.value = "";
    inspectorCard.style.display = "none";
    drawMeaningSpellingGraph();
    return;
  }

  focusWord = word;
  focusWordSelect.value = word;
  const token = vocabulary.find(t => t.word.toLowerCase() === word.toLowerCase());
  const sem = getWordSemantics(word);

  inspectorWord.textContent = `"${word}"`;
  inspectorId.textContent = token ? `Token ID: ${token.id}` : `Token ID: Auto`;
  inspectorCat.textContent = `Category: ${sem.category.toUpperCase()}`;
  inspectorCard.style.display = "block";

  const spellingRanks = vocabulary
    .filter(t => t.word.toLowerCase() !== word.toLowerCase())
    .map(t => ({
      word: t.word, id: t.id,
      sim: getSpellingSimilarity(word, t.word),
      dist: levenshteinDistance(word, t.word)
    }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 5);

  inspSpellingList.innerHTML = spellingRanks.length > 0
    ? spellingRanks.map(item => `
        <li>
          <span><strong>${escapeHtml(item.word)}</strong> (ID:${item.id})</span>
          <span class="inspector-score">Edit Dist: ${item.dist} (${Math.round(item.sim * 100)}%)</span>
        </li>`).join("")
    : `<li><span class="inspector-score">No close spelling neighbors</span></li>`;

  const meaningRanks = vocabulary
    .filter(t => t.word.toLowerCase() !== word.toLowerCase())
    .map(t => ({
      word: t.word, id: t.id,
      sim: getMeaningSimilarity(word, t.word),
      category: getWordSemantics(t.word).category
    }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 5);

  inspMeaningList.innerHTML = meaningRanks.length > 0
    ? meaningRanks.map(item => `
        <li>
          <span><strong>${escapeHtml(item.word)}</strong> [${item.category}]</span>
          <span class="inspector-score">Similarity: ${Math.round(item.sim * 100)}%</span>
        </li>`).join("")
    : `<li><span class="inspector-score">No close semantic neighbors</span></li>`;

  drawMeaningSpellingGraph();
}

// ══════════════════════════════════════════════════════════
//  SCREEN 4: 3D TREE & CYCLIC GRAPH ENGINE
// ══════════════════════════════════════════════════════════
let struct3DNodes = [];
let struct3DEdges = [];

function build3DStructData(type) {
  struct3DNodes = [];
  struct3DEdges = [];
  detectedCycles = [];
  if (vocabulary.length === 0) return;

  const maxTokens = structDensityRange ? parseInt(structDensityRange.value, 10) : 35;
  const activeTokens = filterDeclutteredTokens(maxTokens, "all", focusWord);

  if (type === "tree" || type === "radial") {
    const root = { id: "ROOT", char: "[ROOT]", children: new Map(), isTerminal: false, tokenId: null, fullWord: "" };
    for (const item of activeTokens) {
      let curr = root;
      for (let i = 0; i < item.word.length; i++) {
        const ch = item.word[i];
        if (!curr.children.has(ch)) {
          curr.children.set(ch, { id: `${curr.id}_${ch}`, char: ch, children: new Map(), isTerminal: false, tokenId: null, fullWord: item.word.slice(0, i + 1) });
        }
        curr = curr.children.get(ch);
      }
      curr.isTerminal = true;
      curr.tokenId = item.id;
      curr.fullWord = item.word;
    }

    function traverse3D(node, depth = 0, angle = 0, parentNode = null) {
      let x = 0, y = 0, z = 0;

      if (type === "tree") {
        if (depth === 0) {
          x = 0; y = -220; z = 0;
        } else {
          const r = depth * 65;
          x = r * Math.cos(angle);
          y = -220 + depth * 90;
          z = r * Math.sin(angle);
        }
      } else {
        if (depth === 0) {
          x = 0; y = 0; z = 0;
        } else {
          const r = depth * 80;
          const theta = angle;
          const phi = (depth * 0.7) % Math.PI;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.cos(phi);
          z = r * Math.sin(phi) * Math.sin(theta);
        }
      }

      const gNode = {
        id: node.id, char: node.char, fullWord: node.fullWord, tokenId: node.tokenId,
        isRoot: depth === 0, isTerminal: node.isTerminal, depth, x, y, z,
        radius: depth === 0 ? 18 : node.isTerminal ? 14 : 10,
        color: depth === 0 ? "#ec4899" : node.isTerminal ? "#38bdf8" : "#7c5cfc"
      };

      struct3DNodes.push(gNode);

      if (parentNode) {
        struct3DEdges.push({ source: parentNode.id, target: gNode.id, n1: parentNode, n2: gNode, char: node.char });
      }

      const childCount = node.children.size;
      let i = 0;
      for (const child of node.children.values()) {
        const span = Math.PI * 2 / (childCount || 1);
        const childAngle = angle + (i - (childCount - 1) / 2) * span * 0.8;
        traverse3D(child, depth + 1, childAngle, gNode);
        i++;
      }
    }

    traverse3D(root, 0, 0, null);
  } else {
    // 3D Cyclic Torus Loop
    const nodeMap = new Map();
    const N = activeTokens.length;
    const R = 210, r = 70;

    activeTokens.forEach((item, idx) => {
      const angle = (idx / N) * Math.PI * 2;
      const phi = idx * 1.8;
      const x = (R + r * Math.cos(phi)) * Math.cos(angle);
      const y = r * Math.sin(phi);
      const z = (R + r * Math.cos(phi)) * Math.sin(angle);

      const gNode = {
        id: `token_${item.id}`, word: item.word, tokenId: item.id,
        x, y, z, radius: 14 + Math.min(6, item.word.length), color: colorFor(idx)
      };
      nodeMap.set(item.word.toLowerCase(), gNode);
      struct3DNodes.push(gNode);
    });

    const edgeSet = new Map();
    function addEdge(n1, n2) {
      if (!n1 || !n2) return;
      const key = `${n1.id}->${n2.id}`;
      if (!edgeSet.has(key)) {
        const edge = { source: n1.id, target: n2.id, n1, n2, isCycle: false };
        edgeSet.set(key, edge);
        struct3DEdges.push(edge);
      }
    }

    if (lastTokenizedWords && lastTokenizedWords.length > 1) {
      for (let i = 0; i < lastTokenizedWords.length - 1; i++) {
        const n1 = nodeMap.get(lastTokenizedWords[i].text.toLowerCase());
        const n2 = nodeMap.get(lastTokenizedWords[i + 1].text.toLowerCase());
        if (n1 && n2) addEdge(n1, n2);
      }
      const nFirst = nodeMap.get(lastTokenizedWords[0].text.toLowerCase());
      const nLast = nodeMap.get(lastTokenizedWords[lastTokenizedWords.length - 1].text.toLowerCase());
      if (nFirst && nLast && nFirst !== nLast) addEdge(nLast, nFirst);
    }

    const sorted = [...struct3DNodes].sort((a, b) => a.tokenId - b.tokenId);
    for (let i = 0; i < sorted.length; i++) {
      addEdge(sorted[i], sorted[(i + 1) % sorted.length]);
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].word.slice(0, 2) === sorted[j].word.slice(0, 2)) {
          addEdge(sorted[i], sorted[j]);
        }
      }
    }

    const adj = new Map();
    struct3DNodes.forEach(n => adj.set(n.id, []));
    struct3DEdges.forEach(e => { if (adj.has(e.source)) adj.get(e.source).push(e.target); });

    const visited = new Set(), recStack = new Set(), cycleNodes = new Set();
    function dfs(u) {
      visited.add(u); recStack.add(u);
      for (const v of adj.get(u) || []) {
        if (!visited.has(v)) {
          if (dfs(v)) { cycleNodes.add(u); return true; }
        } else if (recStack.has(v)) {
          cycleNodes.add(u); cycleNodes.add(v); return true;
        }
      }
      recStack.delete(u);
      return false;
    }
    for (const n of struct3DNodes) { if (!visited.has(n.id)) dfs(n.id); }

    detectedCycles = Array.from(cycleNodes);
    struct3DEdges.forEach(e => {
      if (cycleNodes.has(e.source) && cycleNodes.has(e.target)) e.isCycle = true;
    });
  }
}

function drawStructGraph() {
  const dpr = window.devicePixelRatio || 1;
  const rect = structContainer.getBoundingClientRect();
  const W = rect.width, H = rect.height;

  structCanvas.width = W * dpr;
  structCanvas.height = H * dpr;
  structCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  structCtx.clearRect(0, 0, W, H);

  if (vocabulary.length === 0) {
    structCtx.fillStyle = "#8b92b6";
    structCtx.font = "15px Inter, sans-serif";
    structCtx.textAlign = "center";
    structCtx.fillText("Vocabulary is empty. Add tokens in the Vocabulary screen!", W / 2, H / 2);
    structLegend.innerHTML = "";
    return;
  }

  const type = structGraphType.value;
  build3DStructData(type);

  if (type === "tree") renderStructTreeLegend();
  else if (type === "radial") renderStructTreeLegend();
  else renderStructCyclicLegend();

  draw3DGroundGrid(structCtx, W, H, structCamera, false);

  const projectedEdges = [];
  for (const edge of struct3DEdges) {
    const p1 = project3D(edge.n1.x, edge.n1.y, edge.n1.z, structCamera.rotX, structCamera.rotY, W, H, structCamera.zoom, structCamera.panX, structCamera.panY);
    const p2 = project3D(edge.n2.x, edge.n2.y, edge.n2.z, structCamera.rotX, structCamera.rotY, W, H, structCamera.zoom, structCamera.panX, structCamera.panY);
    if (p1 && p2) {
      projectedEdges.push({ edge, p1, p2, z: (p1.z + p2.z) / 2 });
    }
  }

  const projectedNodes = [];
  for (const node of struct3DNodes) {
    const p = project3D(node.x, node.y, node.z, structCamera.rotX, structCamera.rotY, W, H, structCamera.zoom, structCamera.panX, structCamera.panY);
    if (p) {
      node.projX = p.x;
      node.projY = p.y;
      node.projRadius = Math.max(7, node.radius * p.scale);
      projectedNodes.push({ node, p, z: p.z });
    }
  }

  projectedEdges.sort((a, b) => a.z - b.z);
  projectedNodes.sort((a, b) => a.z - b.z);

  for (const item of projectedEdges) {
    const { edge, p1, p2, z } = item;
    const isCycle = highlightCyclesActive && edge.isCycle;
    const alpha = Math.max(0.2, Math.min(0.9, 0.55 + (z / 700)));

    structCtx.save();
    structCtx.beginPath();
    structCtx.moveTo(p1.x, p1.y);
    structCtx.lineTo(p2.x, p2.y);
    structCtx.globalAlpha = alpha;

    if (isCycle) {
      structCtx.strokeStyle = "#ec4899";
      structCtx.lineWidth = 3;
      structCtx.shadowColor = "#ec4899";
      structCtx.shadowBlur = 10;
    } else {
      structCtx.strokeStyle = edge.n2 && edge.n2.isTerminal ? "rgba(56, 189, 248, 0.6)" : "rgba(124, 92, 252, 0.4)";
      structCtx.lineWidth = 1.8 * Math.min(1.5, (p1.scale + p2.scale) / 2);
    }
    structCtx.stroke();
    structCtx.restore();
  }

  for (const item of projectedNodes) {
    const { node, p } = item;
    const r = node.projRadius;
    const alpha = Math.max(0.35, Math.min(1.0, 0.65 + (p.z / 700)));
    const isCycle = highlightCyclesActive && detectedCycles.includes(node.id);

    structCtx.save();
    structCtx.globalAlpha = alpha;

    const grad = structCtx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r);
    if (isCycle) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, "#ec4899");
      grad.addColorStop(1, "#831843");
      structCtx.shadowColor = "#ec4899";
      structCtx.shadowBlur = 12;
    } else if (node.isRoot) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, "#ec4899");
      grad.addColorStop(1, "#4a044e");
    } else {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, node.color || "#38bdf8");
      grad.addColorStop(1, "#0a0c16");
    }

    structCtx.beginPath();
    structCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
    structCtx.fillStyle = grad;
    structCtx.fill();

    structCtx.strokeStyle = isCycle ? "#ec4899" : "rgba(255, 255, 255, 0.4)";
    structCtx.lineWidth = isCycle ? 2 : 1;
    structCtx.stroke();

    const showLabel = node.isRoot || node.isTerminal || node.isHovered || r >= 13;
    if (showLabel) {
      const isLight = isLightMode();
      structCtx.fillStyle = isLight ? "#0f172a" : "#ffffff";
      structCtx.font = `bold ${Math.max(9, Math.round(r * 0.72))}px Inter, sans-serif`;
      structCtx.textAlign = "center";
      structCtx.textBaseline = "middle";

      if (node.isRoot) {
        structCtx.fillText("ROOT", p.x, p.y);
      } else if (node.word) {
        const lbl = node.word.length > 7 ? node.word.slice(0, 6) + "…" : node.word;
        structCtx.fillText(lbl, p.x, p.y - r - 4);
      } else {
        structCtx.fillText(node.char, p.x, p.y);
        if (node.isTerminal && node.tokenId !== null) {
          structCtx.font = "bold 9px JetBrains Mono, monospace";
          structCtx.fillStyle = isLight ? "#b45309" : "#fde047";
          structCtx.fillText(`#${node.tokenId}`, p.x, p.y + r + 4);
        }
      }
    }

    structCtx.restore();
  }
}

function renderStructTreeLegend() {
  structLegend.innerHTML = `
    <span class="legend-item"><span class="legend-swatch" style="background:#ec4899"></span> 3D Root Node [ROOT]</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#7c5cfc"></span> 3D Prefix Node</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#38bdf8"></span> Terminal Token (with Token ID)</span>
  `;
}

function renderStructCyclicLegend() {
  structLegend.innerHTML = `
    <span class="legend-item"><span class="legend-swatch" style="background:#38bdf8"></span> 3D Token Node (Word + ID)</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#38bdf8"></span> Directed 3D Arc</span>
    <span class="legend-item"><span class="legend-swatch" style="background:#ec4899; box-shadow:0 0 8px #ec4899"></span> 3D Cyclic Loop</span>
  `;
}

// ══════════════════════════════════════════════════════════
//  3D INTERACTIVE CAMERA CONTROLLER (Drag Rotate, Zoom, Pan)
// ══════════════════════════════════════════════════════════
function setup3DCameraControls(container, canvasEl, camera, getNodesFn, redrawFn, tooltipEl, onNodeClick) {
  let prevX = 0, prevY = 0;

  container.addEventListener("mousedown", (e) => {
    camera.dragging = true;
    camera.panning = e.shiftKey || e.button === 2;
    prevX = e.clientX;
    prevY = e.clientY;
    camera.startX = e.clientX;
    camera.startY = e.clientY;
  });

  window.addEventListener("mouseup", (e) => {
    if (!camera.dragging) return;
    camera.dragging = false;

    const dist = Math.hypot(e.clientX - camera.startX, e.clientY - camera.startY);
    if (dist < 6 && onNodeClick) {
      const rect = container.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      const nodes = getNodesFn();
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (n.projX && n.projY && Math.hypot(sx - n.projX, sy - n.projY) <= (n.projRadius || 14) + 4) {
          onNodeClick(n);
          break;
        }
      }
    }
  });

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;

    if (camera.dragging) {
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      if (camera.panning) {
        camera.panX += dx;
        camera.panY += dy;
      } else {
        camera.rotY += dx * 0.008;
        camera.rotX = Math.max(-1.4, Math.min(1.4, camera.rotX + dy * 0.008));
      }
      redrawFn();
      return;
    }

    const nodes = getNodesFn();
    let hovered = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.projX && n.projY && Math.hypot(sx - n.projX, sy - n.projY) <= (n.projRadius || 14) + 4) {
        hovered = n;
        break;
      }
    }

    nodes.forEach(n => { n.isHovered = (hovered && n.id === hovered.id); });

    if (hovered) {
      tooltipEl.style.display = "block";
      let html = "";
      if (hovered.isRoot) {
        html = `<strong>3D Root Node</strong><br>Start of 3D Prefix Tree`;
      } else if (hovered.word) {
        const sem = getWordSemantics(hovered.word);
        html = `<strong>Token: "${escapeHtml(hovered.word)}"</strong><br>` +
               `Token ID: <span style="color:#fbbf24;font-weight:bold;">${hovered.tokenId}</span><br>` +
               `Category: <span style="color:#a78bfa;">${sem.category}</span><br>` +
               `<em>(Click to inspect Meaning vs. Spelling)</em>`;
      } else if (hovered.isTerminal && hovered.tokenId !== null) {
        html = `<strong>Token: "${escapeHtml(hovered.fullWord)}"</strong><br>Token ID: <span style="color:#fbbf24;font-weight:bold;">${hovered.tokenId}</span>`;
      } else {
        html = `<strong>Prefix: '${escapeHtml(hovered.char)}'</strong><br>Path: <code>${escapeHtml(hovered.fullWord)}</code>`;
      }
      tooltipEl.innerHTML = html;
      tooltipEl.style.left = Math.min(sx + 15, rect.width - 240) + "px";
      tooltipEl.style.top = Math.max(10, sy - 15) + "px";
      redrawFn();
    } else {
      tooltipEl.style.display = "none";
    }
  });

  container.addEventListener("mouseleave", () => {
    tooltipEl.style.display = "none";
  });

  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    camera.zoom = Math.max(0.35, Math.min(3.2, camera.zoom * zoomFactor));
    redrawFn();
  }, { passive: false });

  container.addEventListener("contextmenu", (e) => e.preventDefault());
}

// Attach 3D Camera Controls
setup3DCameraControls(
  msCanvasContainer, msGraphCanvas, msCamera,
  () => ms3DNodes, drawMeaningSpellingGraph, msTooltip,
  (node) => { if (node.word) inspectWord(node.word); }
);

setup3DCameraControls(
  structContainer, structCanvas, structCamera,
  () => struct3DNodes, drawStructGraph, structTooltip,
  null
);

// 3D Auto-Rotate Loops
function start3DAutoRotate(camera, redrawFn, btn) {
  function loop() {
    if (camera.autoRotate) {
      camera.rotY += 0.006;
      redrawFn();
      camera.animId = requestAnimationFrame(loop);
    }
  }
  btn.addEventListener("click", () => {
    camera.autoRotate = !camera.autoRotate;
    btn.classList.toggle("active", camera.autoRotate);
    btn.textContent = camera.autoRotate ? "⏸ Pause" : "🔄 Auto-Rotate";
    if (camera.autoRotate) loop();
    else cancelAnimationFrame(camera.animId);
  });
}

if (msAutoRotateBtn) start3DAutoRotate(msCamera, drawMeaningSpellingGraph, msAutoRotateBtn);
if (structAutoRotateBtn) start3DAutoRotate(structCamera, drawStructGraph, structAutoRotateBtn);

// Zoom and Reset Buttons for 3D
msZoomInBtn.addEventListener("click", () => {
  msCamera.zoom = Math.min(3.2, msCamera.zoom * 1.2);
  msZoomLevel.textContent = `${Math.round(msCamera.zoom * 100)}%`;
  drawMeaningSpellingGraph();
});
msZoomOutBtn.addEventListener("click", () => {
  msCamera.zoom = Math.max(0.35, msCamera.zoom * 0.8);
  msZoomLevel.textContent = `${Math.round(msCamera.zoom * 100)}%`;
  drawMeaningSpellingGraph();
});
msResetViewBtn.addEventListener("click", () => {
  msCamera.rotX = 0.35; msCamera.rotY = 0.65; msCamera.zoom = 1.0; msCamera.panX = 0; msCamera.panY = 0;
  msZoomLevel.textContent = "100%";
  drawMeaningSpellingGraph();
});

structZoomInBtn.addEventListener("click", () => {
  structCamera.zoom = Math.min(3.2, structCamera.zoom * 1.2);
  structZoomLevel.textContent = `${Math.round(structCamera.zoom * 100)}%`;
  drawStructGraph();
});
structZoomOutBtn.addEventListener("click", () => {
  structCamera.zoom = Math.max(0.35, structCamera.zoom * 0.8);
  structZoomLevel.textContent = `${Math.round(structCamera.zoom * 100)}%`;
  drawStructGraph();
});
structResetBtn.addEventListener("click", () => {
  structCamera.rotX = 0.45; structCamera.rotY = 0.35; structCamera.zoom = 1.0; structCamera.panX = 0; structCamera.panY = 0;
  structZoomLevel.textContent = "100%";
  drawStructGraph();
});

cycleToggleBtn.addEventListener("click", () => {
  highlightCyclesActive = !highlightCyclesActive;
  cycleToggleBtn.classList.toggle("active", highlightCyclesActive);
  cycleToggleBtn.textContent = highlightCyclesActive ? "✓ Cycles Highlighted" : "Highlight Cycles";
  drawStructGraph();
});

// Density & Filter Controls
if (msDensityRange) {
  msDensityRange.addEventListener("input", () => {
    msDensityVal.textContent = msDensityRange.value;
    drawMeaningSpellingGraph();
  });
}
if (msCatFilter) {
  msCatFilter.addEventListener("change", () => {
    drawMeaningSpellingGraph();
  });
}
if (structDensityRange) {
  structDensityRange.addEventListener("input", () => {
    structDensityVal.textContent = structDensityRange.value;
    drawStructGraph();
  });
}

// ══════════════════════════════════════════════════════════
//  FORM & ACTION BINDINGS
// ══════════════════════════════════════════════════════════
function refreshAll() {
  renderTable(searchInput.value);
  updateStats();
  populateFocusWordSelect();
  runTokenizer();
  if (activeScreenId === "screen-meaning-spelling") drawMeaningSpellingGraph();
  if (activeScreenId === "screen-graphs") drawStructGraph();
  if (activeScreenId === "screen-analytics") renderAnalytics();
}

tokenForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (addToken(wordInput.value, idInput.value)) {
    wordInput.value = "";
    idInput.value = "";
    wordInput.focus();
  }
});

autoSuggestIdBtn.addEventListener("click", () => {
  idInput.value = getNextAvailableId();
});

bulkBtn.addEventListener("click", () => {
  const sentence = sentenceIn.value.trim();
  if (!sentence) return;

  let startId = parseInt(startIdIn.value, 10);
  if (isNaN(startId) || startId < 0) startId = getNextAvailableId();

  const words = sentence.match(/\b[A-Za-z0-9#_'-]+\b|[^\s\w]/g) || [];
  const seen = new Set(vocabulary.map(t => t.word.toLowerCase()));
  let currentId = startId;

  for (const w of words) {
    const clean = w.toLowerCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    vocabulary.push({ word: clean, id: currentId++ });
  }

  saveVocabulary();
  refreshAll();
  sentenceIn.value = "";
  startIdIn.value = "";
});

// Presets
if (btnLoad1000) {
  btnLoad1000.addEventListener("click", () => {
    load1000Vocabulary();
    alert(`Loaded ${vocabulary.length} common words into vocabulary!`);
  });
}

if (preset1000) {
  preset1000.addEventListener("click", () => {
    load1000Vocabulary();
  });
}

presetNlp.addEventListener("click", () => {
  const nlp = [{ word: "[cls]", id: 101 }, { word: "[sep]", id: 102 }, { word: "the", id: 200 }, { word: "model", id: 201 }, { word: "neural", id: 202 }, { word: "network", id: 203 }, { word: "attention", id: 204 }];
  nlp.forEach(t => { if (!vocabulary.some(v => v.word === t.word)) vocabulary.push(t); });
  saveVocabulary(); refreshAll();
});

presetSemantic.addEventListener("click", () => {
  const pairs = [{ word: "cat", id: 301 }, { word: "car", id: 302 }, { word: "cart", id: 303 }, { word: "card", id: 304 }, { word: "dog", id: 305 }, { word: "horse", id: 306 }, { word: "fast", id: 307 }, { word: "quick", id: 308 }];
  pairs.forEach(t => { if (!vocabulary.some(v => v.word === t.word)) vocabulary.push(t); });
  saveVocabulary(); refreshAll();
});

presetSubwords.addEventListener("click", () => {
  const sub = [{ word: "un", id: 401 }, { word: "pre", id: 402 }, { word: "##ing", id: 403 }, { word: "##ed", id: 404 }, { word: "train", id: 405 }, { word: "training", id: 406 }];
  sub.forEach(t => { if (!vocabulary.some(v => v.word === t.word)) vocabulary.push(t); });
  saveVocabulary(); refreshAll();
});

presetCode.addEventListener("click", () => {
  const code = [{ word: "def", id: 501 }, { word: "return", id: 502 }, { word: "function", id: 503 }, { word: "const", id: 504 }, { word: "let", id: 505 }];
  code.forEach(t => { if (!vocabulary.some(v => v.word === t.word)) vocabulary.push(t); });
  saveVocabulary(); refreshAll();
});

vocabBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-remove")) {
    removeToken(parseInt(e.target.dataset.idx, 10));
  }
});

searchInput.addEventListener("input", () => renderTable(searchInput.value));
clearBtn.addEventListener("click", () => {
  if (vocabulary.length > 0 && confirm("Remove all tokens from vocabulary?")) clearVocabulary();
});

// Tokenizer Actions
tokenizeTextIn.addEventListener("input", runTokenizer);
tokenizerMode.addEventListener("change", runTokenizer);
runTokenizeBtn.addEventListener("click", runTokenizer);

autoIndexAllBtn.addEventListener("click", () => {
  const count = autoIndexWordsFromText(tokenizeTextIn.value);
  if (count > 0) alert(`⚡ Automatically indexed and registered ${count} new word(s) into vocabulary!`);
  else alert("All words in input text are already in your vocabulary!");
});

sampleTextBtn.addEventListener("click", () => {
  const samples = [
    "the cat sat on the mat and played with a card near the car",
    "the fast runner is running while the dog jumps over the box",
    "the quick brown fox jumps over the lazy dog"
  ];
  tokenizeTextIn.value = samples[Math.floor(Math.random() * samples.length)];
  runTokenizer();
});

tokenStream.addEventListener("click", (e) => {
  const chip = e.target.closest(".token-chip");
  if (!chip) return;
  const token = lastTokenizedWords[parseInt(chip.dataset.idx, 10)];
  if (!token) return;

  if (token.isUnk) {
    const clean = token.text.toLowerCase().replace(/^##/, "").trim();
    if (clean) { addToken(clean); runTokenizer(); }
  } else {
    inspectWord(token.text);
    switchScreen("screen-meaning-spelling");
  }
});

copyIdsBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(tokenIdsDisplay.textContent).then(() => {
    copyIdsBtn.textContent = "✓ Copied!";
    setTimeout(() => { copyIdsBtn.textContent = "📋 Copy IDs"; }, 1500);
  });
});

// Meaning vs Spelling Controls
msViewSelect.addEventListener("change", () => {
  msTransform.x = 0; msTransform.y = 0; msTransform.k = 1.0;
  drawMeaningSpellingGraph();
});

focusWordSelect.addEventListener("change", () => inspectWord(focusWordSelect.value));
simThresholdIn.addEventListener("input", () => {
  similarityThreshold = parseFloat(simThresholdIn.value);
  thresholdVal.textContent = similarityThreshold.toFixed(2);
  drawMeaningSpellingGraph();
});

btnShowBoth.addEventListener("click", () => {
  toolOverlayMode = "both";
  btnShowBoth.classList.add("active");
  btnShowSpelling.classList.remove("active");
  btnShowMeaning.classList.remove("active");
  drawMeaningSpellingGraph();
});

btnShowSpelling.addEventListener("click", () => {
  toolOverlayMode = "spelling";
  btnShowBoth.classList.remove("active");
  btnShowSpelling.classList.add("active");
  btnShowMeaning.classList.remove("active");
  drawMeaningSpellingGraph();
});

btnShowMeaning.addEventListener("click", () => {
  toolOverlayMode = "meaning";
  btnShowBoth.classList.remove("active");
  btnShowSpelling.classList.remove("active");
  btnShowMeaning.classList.add("active");
  drawMeaningSpellingGraph();
});

inspectorClose.addEventListener("click", () => inspectWord(""));

// Structural Graph Controls
structGraphType.addEventListener("change", () => {
  structTransform.x = 0; structTransform.y = 0; structTransform.k = 1.0;
  drawStructGraph();
});

// Export JSON
btnExportVocab.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(vocabulary, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tokenlab_vocabulary.json";
  a.click();
  URL.revokeObjectURL(url);
});

window.addEventListener("resize", () => {
  if (activeScreenId === "screen-meaning-spelling") drawMeaningSpellingGraph();
  if (activeScreenId === "screen-graphs") drawStructGraph();
});

// Theme Mode Controller
function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    if (themeIcon) themeIcon.textContent = "☀️";
    if (themeText) themeText.textContent = "Light";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (themeIcon) themeIcon.textContent = "🌙";
    if (themeText) themeText.textContent = "Dark";
  }
  try {
    localStorage.setItem("tokenlab_theme", theme);
  } catch (e) {}

  if (activeScreenId === "screen-meaning-spelling") drawMeaningSpellingGraph();
  if (activeScreenId === "screen-graphs") drawStructGraph();
}

function initTheme() {
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("tokenlab_theme") || "dark";
  } catch (e) {}
  applyTheme(savedTheme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = isLightMode() ? "dark" : "light";
    applyTheme(nextTheme);
  });
}

// ══════════════════════════════════════════════════════════
//  INITIALIZATION
// ══════════════════════════════════════════════════════════
initTheme();
loadVocabulary();
tokenizeTextIn.value = "the cat sat on the mat near the car";
refreshAll();
initScreenFromHash();
window.addEventListener("hashchange", initScreenFromHash);
