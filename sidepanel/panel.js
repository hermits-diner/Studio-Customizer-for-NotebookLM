"use strict";

// chrome.* API가 없는 환경(일반 브라우저 미리보기)에서도 동작하도록 가드
const hasChrome = typeof chrome !== "undefined" && chrome.storage;

const $ = (id) => document.getElementById(id);

// ---------- UI 다국어 ----------
const I18N = {
  ko: {
    subtitle: "산출물을 고르고 맥락을 입력하면 맞춤설정 프롬프트가 만들어집니다.",
    step1: "1. 산출물 선택",
    step2: "2. 맥락 입력",
    step3: "3. 생성된 프롬프트",
    presets: "프리셋",
    audience: "대상",
    audiencePh: "예: 입문자, 마케팅 팀 동료",
    purpose: "목적",
    purposePh: "예: 주간 회의 발표, 시험 대비",
    context: "추가 맥락 (자유 서술)",
    contextPh: "예: 배경지식이 없는 청중이라 쉬운 예시가 필요함.",
    outputLang: "결과물 언어",
    copy: "복사",
    copied: "복사됨 ✓",
    save: "저장",
    del: "삭제",
    ok: "확인",
    cancel: "취소",
    presetNamePh: "프리셋 이름 (예: 주간 브리핑 퀴즈)",
    presetPlaceholder: "저장된 프리셋 선택…",
    charWarn: "일부 산출물의 맞춤설정란은 입력 한도(약 500자)가 있어요. 조금 줄여 보세요.",
    charSuffix: "자",
    selectOption: "(선택)",
    langNames: { "한국어": "한국어", "영어": "영어" },
    audienceOptions: [
      "입문자·처음 배우는 사람",
      "고등학생",
      "대학생·성인 학습자",
      "직장 동료·팀",
      "고객·일반 대중",
      "전문가·실무자",
    ],
    purposeOptions: ["새 개념 소개", "핵심 내용 복습", "시험·평가 대비", "업무 보고·브리핑", "강의·발표 자료", "스터디 자료"],
    toggleLabel: "EN",
    settings: "설정",
    apiKey: "Gemini API 키",
    apiKeyPh: "Google AI Studio에서 발급한 키 붙여넣기",
    model: "모델",
    refine: "AI 다듬기",
    refining: "다듬는 중…",
    refineNoKey: "먼저 설정(우측 상단 톱니)에서 Gemini API 키를 저장하세요.",
    refineFail: "요청 실패: ",
    apiPrivacy: "AI 다듬기를 누르면 현재 프롬프트가 Google Gemini API로 전송됩니다. 민감한 개인정보는 넣지 마세요. 키는 이 컴퓨터에만 저장됩니다.",
    saved: "저장됨 ✓",
    insert: "삽입",
    inserted: "삽입됨 ✓",
    insertNoTab: "NotebookLM 탭이 없어요. notebooklm.google.com을 먼저 열어주세요.",
    insertNoBox: "NotebookLM에서 산출물의 맞춤설정 입력란을 먼저 열어주세요.",
    history: "히스토리",
    historyEmpty: "복사하거나 삽입한 프롬프트가 여기에 쌓입니다.",
    clear: "비우기",
    exportBtn: "내보내기",
    importBtn: "가져오기",
    importErr: "가져오기 실패: 올바른 프리셋 JSON 파일이 아니에요.",
    obTitle: "3단계로 시작하기",
    obStep1: "산출물 유형을 고르세요 (퀴즈, 슬라이드…)",
    obStep2: "대상·목적·맥락을 입력하면 프롬프트가 실시간으로 만들어집니다",
    obStep3: "NotebookLM에서 맞춤설정란을 열고 [삽입]을 누르세요 (또는 복사해서 붙여넣기)",
    obDone: "시작하기",
  },
  en: {
    subtitle: "Pick an output, add your context, and get a tailored customization prompt.",
    step1: "1. Choose an output",
    step2: "2. Add context",
    step3: "3. Generated prompt",
    presets: "Presets",
    audience: "Audience",
    audiencePh: "e.g. 10th-grade computer science students",
    purpose: "Purpose",
    purposePh: "e.g. end-of-unit formative quiz",
    context: "Additional context (free text)",
    contextPh: "e.g. Most students are new to programming. Last class covered sequencing and selection.",
    outputLang: "Output language",
    copy: "Copy",
    copied: "Copied ✓",
    save: "Save",
    del: "Delete",
    ok: "OK",
    cancel: "Cancel",
    presetNamePh: "Preset name (e.g. weekly briefing quiz)",
    presetPlaceholder: "Select a saved preset…",
    charWarn: "Some customization boxes have a ~500-character limit. Consider trimming.",
    charSuffix: " chars",
    selectOption: "(select)",
    langNames: { "한국어": "Korean", "영어": "English" },
    audienceOptions: [
      "Beginners new to the topic",
      "High school students",
      "College students / adult learners",
      "Coworkers / my team",
      "Clients / general public",
      "Experts / practitioners",
    ],
    purposeOptions: [
      "Introducing a new concept",
      "Reviewing key content",
      "Exam / assessment prep",
      "Work report / briefing",
      "Lecture / presentation",
      "Study group material",
    ],
    toggleLabel: "한국어",
    settings: "Settings",
    apiKey: "Gemini API key",
    apiKeyPh: "Paste your key from Google AI Studio",
    model: "Model",
    refine: "AI refine",
    refining: "Refining…",
    refineNoKey: "Save your Gemini API key in Settings (gear icon) first.",
    refineFail: "Request failed: ",
    apiPrivacy: "AI refine sends the current prompt to the Google Gemini API. Avoid sensitive personal data. Your key is stored only on this device.",
    saved: "Saved ✓",
    insert: "Insert",
    inserted: "Inserted ✓",
    insertNoTab: "No NotebookLM tab found. Open notebooklm.google.com first.",
    insertNoBox: "Open an output's customization box in NotebookLM first.",
    history: "History",
    historyEmpty: "Prompts you copy or insert will appear here.",
    clear: "Clear",
    exportBtn: "Export",
    importBtn: "Import",
    importErr: "Import failed: not a valid presets JSON file.",
    obTitle: "Start in 3 steps",
    obStep1: "Pick an output type (quiz, slides…)",
    obStep2: "Add audience, purpose, and context — the prompt builds live",
    obStep3: "Open the customization box in NotebookLM and click Insert (or copy & paste)",
    obDone: "Got it",
  },
};

let uiLang = "ko";
const S = () => I18N[uiLang];
const pickUI = (x) => pick(x, uiLang);

const state = {
  typeId: OUTPUT_TYPES[0].id,
  common: { audience: "", purpose: "", context: "", language: "한국어" },
  // 유형별 입력값을 따로 보관해서 유형을 오가도 값이 유지되게 한다
  byType: {},
};

const currentType = () => OUTPUT_TYPES.find((x) => x.id === state.typeId);

function fillDatalist(id, options) {
  const dl = $(id);
  dl.innerHTML = "";
  for (const v of options) {
    const o = document.createElement("option");
    o.value = v;
    dl.appendChild(o);
  }
}

function applyI18n() {
  document.documentElement.lang = uiLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = S()[el.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = S()[el.dataset.i18nPh];
  });
  $("langToggle").textContent = S().toggleLabel;
  fillDatalist("audienceList", S().audienceOptions);
  fillDatalist("purposeList", S().purposeOptions);
  // 결과물 언어 select — 값은 canonical('한국어'/'영어'), 표시만 번역
  const sel = $("language");
  const cur = state.common.language || "한국어";
  sel.innerHTML = "";
  for (const canon of ["한국어", "영어"]) {
    const o = document.createElement("option");
    o.value = canon;
    o.textContent = S().langNames[canon];
    sel.appendChild(o);
  }
  sel.value = cur;
}

// ---------- 산출물 선택 그리드 ----------
function renderTypeGrid() {
  const grid = $("typeGrid");
  grid.innerHTML = "";
  for (const type of OUTPUT_TYPES) {
    const btn = document.createElement("button");
    btn.className = "type-btn" + (type.id === state.typeId ? " active" : "");
    btn.innerHTML = `<span class="icon">${type.icon}</span><span>${pickUI(type.name)}</span>`;
    btn.addEventListener("click", () => {
      state.typeId = type.id;
      renderTypeGrid();
      renderTypeFields();
      update();
    });
    grid.appendChild(btn);
  }
  const note = $("typeNote");
  const noteText = currentType().note ? pickUI(currentType().note) : "";
  note.hidden = !noteText;
  note.textContent = noteText;
}

// ---------- 유형별 동적 필드 ----------
function renderTypeFields() {
  const wrap = $("typeFields");
  wrap.innerHTML = "";
  const type = currentType();
  const values = state.byType[type.id] || {};

  for (const f of type.fields) {
    const div = document.createElement("div");
    div.className = "field" + (f.type === "checkbox" ? " checkbox" : "");

    if (f.type === "checkbox") {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `f_${f.key}`;
      input.checked = !!values[f.key];
      input.addEventListener("change", () => setTypeValue(f.key, input.checked));
      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = pickUI(f.label);
      div.append(input, label);
    } else {
      const label = document.createElement("label");
      label.htmlFor = `f_${f.key}`;
      label.textContent = pickUI(f.label);
      let input;
      if (f.type === "select") {
        input = document.createElement("select");
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = S().selectOption;
        input.appendChild(empty);
        for (const opt of f.options) {
          const o = document.createElement("option");
          o.value = opt.ko; // 값은 항상 한국어 canonical — 프리셋 호환 유지
          o.textContent = pickUI(opt);
          input.appendChild(o);
        }
        input.value = values[f.key] !== undefined ? values[f.key] : f.default || "";
      } else {
        input = document.createElement("input");
        input.type = f.type === "number" ? "number" : "text";
        if (f.type === "number") input.min = "1";
        input.placeholder = f.placeholder ? pickUI(f.placeholder) : "";
        input.value = values[f.key] !== undefined ? values[f.key] : f.default || "";
      }
      input.id = `f_${f.key}`;
      input.addEventListener("input", () => setTypeValue(f.key, input.value));
      div.append(label, input);
    }
    wrap.appendChild(div);
  }
}

function setTypeValue(key, value) {
  if (!state.byType[state.typeId]) state.byType[state.typeId] = {};
  state.byType[state.typeId][key] = value;
  update();
}

// ---------- 프롬프트 생성 ----------
function buildPrompt() {
  const type = currentType();
  const vals = { ...(state.byType[type.id] || {}) };
  // 아직 입력하지 않은 필드에는 기본값 적용 (예: 디자인 스타일)
  for (const f of type.fields) {
    if (vals[f.key] === undefined && f.default !== undefined) vals[f.key] = f.default;
  }
  const c = { ...state.common, ...vals };
  if (!c.language) c.language = "한국어";
  // 결과물 언어가 영어면 선택 옵션 값을 영어로 치환 (디자인 스타일 등 noTranslate 제외)
  if (c.language === "영어") {
    for (const f of type.fields) {
      if (f.type === "select" && !f.noTranslate && t(c[f.key])) {
        const opt = f.options.find((o) => o.ko === c[f.key]);
        if (opt && opt.en) c[f.key] = opt.en;
      }
    }
  }
  return type.build(c);
}

function update() {
  const prompt = buildPrompt();
  $("preview").value = prompt;
  updateCharCount(prompt.length);
  saveState();
}

function updateCharCount(len) {
  const el = $("charCount");
  el.textContent = `${len}${S().charSuffix}`;
  const over = len > 480;
  el.classList.toggle("over", over);
  $("charWarn").hidden = !over;
}

// ---------- 공통 필드 바인딩 ----------
function bindCommonFields() {
  for (const key of ["audience", "purpose", "context", "language"]) {
    const el = $(key);
    el.addEventListener("input", () => {
      state.common[key] = el.value;
      update();
    });
  }
  // 미리보기를 사용자가 직접 다듬는 경우 글자 수만 갱신
  $("preview").addEventListener("input", () => {
    updateCharCount($("preview").value.length);
  });
}

function applyCommonToInputs() {
  for (const key of ["audience", "purpose", "context"]) {
    $(key).value = state.common[key] || "";
  }
}

// ---------- Gemini 설정 & AI 다듬기 ----------
const DEFAULT_MODEL = "gemini-flash-latest";

async function openSettings() {
  const card = $("settingsCard");
  card.hidden = false;
  // 설정 카드는 패널 맨 아래에 있으므로 화면에 보이도록 스크롤
  card.scrollIntoView({ behavior: "smooth", block: "start" });
  if (hasChrome) {
    const { geminiKey, geminiModel } = await chrome.storage.local.get(["geminiKey", "geminiModel"]);
    $("geminiKey").value = geminiKey || "";
    $("geminiModel").value = geminiModel || "";
  }
  $("geminiKey").focus({ preventScroll: true });
}

function bindSettings() {
  $("settingsToggle").addEventListener("click", () => {
    const card = $("settingsCard");
    if (card.hidden) openSettings();
    else card.hidden = true;
  });
  $("settingsSaveBtn").addEventListener("click", async () => {
    if (hasChrome) {
      await chrome.storage.local.set({
        geminiKey: $("geminiKey").value.trim(),
        geminiModel: $("geminiModel").value.trim(),
      });
    }
    const btn = $("settingsSaveBtn");
    btn.textContent = S().saved;
    setTimeout(() => (btn.textContent = S().save), 1500);
  });
}

function showRefineNote(msg) {
  const el = $("refineNote");
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => (el.hidden = true), 6000);
}

function bindRefine() {
  $("refineBtn").addEventListener("click", async () => {
    const draft = $("preview").value.trim();
    if (!draft) return;
    const stored = hasChrome
      ? await chrome.storage.local.get(["geminiKey", "geminiModel"])
      : {};
    if (!stored.geminiKey) {
      openSettings();
      showRefineNote(S().refineNoKey);
      return;
    }
    const btn = $("refineBtn");
    btn.disabled = true;
    btn.textContent = S().refining;
    try {
      const model = stored.geminiModel || DEFAULT_MODEL;
      const outLang = state.common.language === "영어" ? "English" : "Korean";
      const meta =
        "You are an expert prompt engineer for Google NotebookLM Studio outputs. " +
        "Improve the customization prompt below: make it clearer, more specific, and better structured " +
        "while keeping the author's intent and the bullet-list format. Keep it under 450 characters if possible. " +
        `Write the improved prompt in ${outLang}. Return ONLY the improved prompt text — no explanations, no code fences.\n\n---\n` +
        draft;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": stored.geminiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: meta }] }],
            generationConfig: { temperature: 0.4 },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data.error && data.error.message) || `HTTP ${res.status}`);
      }
      const text = (((data.candidates || [])[0] || {}).content || {}).parts
        ?.map((p) => p.text || "")
        .join("")
        .trim();
      if (!text) throw new Error("empty response");
      $("preview").value = text;
      updateCharCount(text.length);
    } catch (e) {
      showRefineNote(S().refineFail + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = S().refine;
    }
  });
}

// ---------- 언어 토글 ----------
function bindLangToggle() {
  $("langToggle").addEventListener("click", () => {
    uiLang = uiLang === "ko" ? "en" : "ko";
    if (hasChrome) chrome.storage.local.set({ uiLang });
    applyI18n();
    renderTypeGrid();
    renderTypeFields();
    renderPresets($("presetSelect").value);
    renderHistory();
    update();
  });
}

// ---------- 복사 ----------
function bindCopy() {
  $("copyBtn").addEventListener("click", async () => {
    const text = $("preview").value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      $("preview").select();
      document.execCommand("copy");
    }
    const btn = $("copyBtn");
    btn.textContent = S().copied;
    setTimeout(() => (btn.textContent = S().copy), 1500);
    pushHistory(text);
  });
}

// ---------- NotebookLM 자동 삽입 ----------
function bindInsert() {
  $("insertBtn").addEventListener("click", async () => {
    const text = $("preview").value.trim();
    if (!text) return;
    if (!hasChrome || !chrome.tabs) {
      showRefineNote(S().insertNoTab);
      return;
    }
    const tabs = await chrome.tabs.query({ url: "https://notebooklm.google.com/*" });
    if (!tabs.length) {
      showRefineNote(S().insertNoTab);
      return;
    }
    const tab = tabs.find((t) => t.active) || tabs[0];
    let res;
    try {
      res = await chrome.tabs.sendMessage(tab.id, { type: "insertPrompt", text });
    } catch {
      // 콘텐츠 스크립트가 아직 없는 탭(확장 설치 전 열림) → 주입 후 재시도
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
        res = await chrome.tabs.sendMessage(tab.id, { type: "insertPrompt", text });
      } catch {
        showRefineNote(S().insertNoBox);
        return;
      }
    }
    if (res && res.ok) {
      const btn = $("insertBtn");
      btn.textContent = S().inserted;
      setTimeout(() => (btn.textContent = S().insert), 1500);
      pushHistory(text);
    } else {
      showRefineNote(S().insertNoBox);
    }
  });
}

// ---------- 히스토리 (최근 20개) ----------
async function pushHistory(text) {
  if (!hasChrome || !text.trim()) return;
  const { history = [] } = await chrome.storage.local.get("history");
  if (history[0] && history[0].text === text) return; // 연속 중복 방지
  history.unshift({ text, typeId: state.typeId, at: Date.now() });
  await chrome.storage.local.set({ history: history.slice(0, 20) });
  renderHistory();
}

async function renderHistory() {
  const wrap = $("historyList");
  wrap.innerHTML = "";
  const { history = [] } = hasChrome ? await chrome.storage.local.get("history") : {};
  if (!history.length) {
    const p = document.createElement("p");
    p.className = "history-empty";
    p.textContent = S().historyEmpty;
    wrap.appendChild(p);
    return;
  }
  const locale = uiLang === "ko" ? "ko-KR" : "en-US";
  for (const h of history) {
    const type = OUTPUT_TYPES.find((x) => x.id === h.typeId);
    const item = document.createElement("button");
    item.className = "history-item";
    const meta = document.createElement("span");
    meta.className = "hi-meta";
    meta.textContent = `${type ? pickUI(type.name) : "?"} · ${new Date(h.at).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
    const body = document.createElement("span");
    body.className = "hi-text";
    body.textContent = h.text.replace(/\s+/g, " ").slice(0, 80);
    item.append(meta, body);
    item.addEventListener("click", () => {
      $("preview").value = h.text;
      updateCharCount(h.text.length);
    });
    wrap.appendChild(item);
  }
}

function bindHistory() {
  $("historyClearBtn").addEventListener("click", async () => {
    if (hasChrome) await chrome.storage.local.set({ history: [] });
    renderHistory();
  });
}

// ---------- 온보딩 ----------
async function initOnboarding() {
  let onboarded = false;
  if (hasChrome) {
    ({ onboarded = false } = await chrome.storage.local.get("onboarded"));
  }
  $("onboardingCard").hidden = !!onboarded;
  $("obDoneBtn").addEventListener("click", () => {
    $("onboardingCard").hidden = true;
    if (hasChrome) chrome.storage.local.set({ onboarded: true });
  });
}

// ---------- 프리셋 내보내기/가져오기 ----------
function bindPresetIO() {
  $("presetExportBtn").addEventListener("click", async () => {
    const presets = await getPresets();
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "studio-customizer-presets.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $("presetImportBtn").addEventListener("click", () => $("presetFile").click());
  $("presetFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const arr = JSON.parse(await file.text());
      if (!Array.isArray(arr)) throw new Error("not array");
      const presets = await getPresets();
      for (const p of arr) {
        if (!p || typeof p.name !== "string") continue;
        const idx = presets.findIndex((x) => x.name === p.name);
        if (idx >= 0) presets[idx] = p;
        else presets.push(p);
      }
      if (hasChrome) await chrome.storage.sync.set({ presets });
      renderPresets();
    } catch {
      showRefineNote(S().importErr);
    }
    e.target.value = "";
  });
}

// ---------- 상태 저장/복원 ----------
function saveState() {
  if (!hasChrome) return;
  chrome.storage.local.set({ lastState: state });
}

async function loadState() {
  if (!hasChrome) {
    uiLang = (navigator.language || "").toLowerCase().startsWith("ko") ? "ko" : "en";
    return;
  }
  const stored = await chrome.storage.local.get(["lastState", "uiLang"]);
  uiLang =
    stored.uiLang ||
    ((navigator.language || "").toLowerCase().startsWith("ko") ? "ko" : "en");
  const lastState = stored.lastState;
  if (!lastState) {
    // 첫 실행: 결과물 언어를 UI 언어에 맞춤
    state.common.language = uiLang === "en" ? "영어" : "한국어";
    return;
  }
  state.typeId = OUTPUT_TYPES.some((x) => x.id === lastState.typeId)
    ? lastState.typeId
    : OUTPUT_TYPES[0].id;
  state.common = { ...state.common, ...lastState.common };
  state.byType = migrateDesignNames(lastState.byType || {});
}

// 구 버전에서 저장된 디자인 스타일명을 새 이름으로 변환
const LEGACY_DESIGN = { "친근한 수업용 (밝고 따뜻한 톤)": "밝고 친근한 톤" };

function migrateDesignNames(byType) {
  for (const vals of Object.values(byType)) {
    if (vals && LEGACY_DESIGN[vals.design]) vals.design = LEGACY_DESIGN[vals.design];
  }
  return byType;
}

// ---------- 프리셋 ----------
async function getPresets() {
  if (!hasChrome) return [];
  const { presets } = await chrome.storage.sync.get("presets");
  return presets || [];
}

async function renderPresets(selectedName) {
  const presets = await getPresets();
  const sel = $("presetSelect");
  sel.innerHTML = "";
  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = S().presetPlaceholder;
  sel.appendChild(ph);
  for (const p of presets) {
    const o = document.createElement("option");
    o.value = p.name;
    o.textContent = p.name;
    sel.appendChild(o);
  }
  if (selectedName) sel.value = selectedName;
}

function bindPresets() {
  $("presetSaveBtn").addEventListener("click", () => {
    $("presetNameRow").hidden = false;
    $("presetName").focus();
  });
  $("presetCancelBtn").addEventListener("click", () => {
    $("presetNameRow").hidden = true;
    $("presetName").value = "";
  });
  $("presetConfirmBtn").addEventListener("click", async () => {
    const name = $("presetName").value.trim();
    if (!name) return;
    const presets = await getPresets();
    const entry = {
      name,
      typeId: state.typeId,
      common: { ...state.common },
      values: { ...(state.byType[state.typeId] || {}) },
    };
    const idx = presets.findIndex((p) => p.name === name);
    if (idx >= 0) presets[idx] = entry;
    else presets.push(entry);
    if (hasChrome) await chrome.storage.sync.set({ presets });
    $("presetNameRow").hidden = true;
    $("presetName").value = "";
    renderPresets(name);
  });
  $("presetSelect").addEventListener("change", async () => {
    const name = $("presetSelect").value;
    if (!name) return;
    const presets = await getPresets();
    const p = presets.find((x) => x.name === name);
    if (!p) return;
    state.typeId = OUTPUT_TYPES.some((x) => x.id === p.typeId) ? p.typeId : state.typeId;
    state.common = { ...state.common, ...p.common };
    state.byType[state.typeId] = { ...p.values };
    migrateDesignNames(state.byType);
    applyI18n();
    applyCommonToInputs();
    renderTypeGrid();
    renderTypeFields();
    update();
  });
  $("presetDeleteBtn").addEventListener("click", async () => {
    const name = $("presetSelect").value;
    if (!name) return;
    const presets = (await getPresets()).filter((p) => p.name !== name);
    if (hasChrome) await chrome.storage.sync.set({ presets });
    renderPresets();
  });
}

// ---------- 초기화 ----------
(async function init() {
  await loadState();
  applyI18n();
  applyCommonToInputs();
  renderTypeGrid();
  renderTypeFields();
  bindCommonFields();
  bindLangToggle();
  bindCopy();
  bindInsert();
  bindSettings();
  bindRefine();
  bindPresets();
  bindPresetIO();
  bindHistory();
  renderPresets();
  renderHistory();
  initOnboarding();
  update();
})();
