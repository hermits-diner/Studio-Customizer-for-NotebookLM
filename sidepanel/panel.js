"use strict";

// chrome.* API가 없는 환경(일반 브라우저 미리보기)에서도 동작하도록 가드
const hasChrome = typeof chrome !== "undefined" && chrome.storage;

const $ = (id) => document.getElementById(id);

// ---------- UI 다국어 ----------
const I18N = {
  ko: {
    subtitle: "산출물을 고르고 맥락을 입력하면 맞춤설정 프롬프트가 만들어집니다.",
    step1: "산출물 선택",
    step2: "맥락 입력",
    step3: "생성된 프롬프트",
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
    step1: "Choose an output",
    step2: "Add context",
    step3: "Generated prompt",
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
    toggleLabel: "日本語",
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
  ja: {
    subtitle: "アウトプットを選び、コンテキストを入力するとカスタマイズプロンプトが作られます。",
    step1: "アウトプットを選択",
    step2: "コンテキストを入力",
    step3: "生成されたプロンプト",
    presets: "プリセット",
    audience: "対象",
    audiencePh: "例: 入門者、マーケティングチームの同僚",
    purpose: "目的",
    purposePh: "例: 週次会議の発表、試験対策",
    context: "補足コンテキスト(自由記述)",
    contextPh: "例: 予備知識のない聴衆なので、やさしい例えが必要。",
    outputLang: "アウトプット言語",
    copy: "コピー",
    copied: "コピー済み ✓",
    save: "保存",
    del: "削除",
    ok: "OK",
    cancel: "キャンセル",
    presetNamePh: "プリセット名(例: 週次ブリーフィングクイズ)",
    presetPlaceholder: "保存済みプリセットを選択…",
    charWarn: "一部のカスタマイズ欄には約500文字の入力上限があります。少し短くしてみてください。",
    charSuffix: " 文字",
    selectOption: "(選択)",
    audienceOptions: [
      "初めて学ぶ入門者",
      "高校生",
      "大学生・社会人学習者",
      "職場の同僚・チーム",
      "顧客・一般の方",
      "専門家・実務者",
    ],
    purposeOptions: [
      "新しい概念の紹介",
      "要点の復習",
      "試験・評価対策",
      "業務報告・ブリーフィング",
      "講義・発表資料",
      "勉強会の資料",
    ],
    toggleLabel: "한국어",
    settings: "設定",
    apiKey: "Gemini APIキー",
    apiKeyPh: "Google AI Studioで発行したキーを貼り付け",
    model: "モデル",
    refine: "AIで仕上げ",
    refining: "仕上げ中…",
    refineNoKey: "まず設定(右上の歯車)でGemini APIキーを保存してください。",
    refineFail: "リクエスト失敗: ",
    apiPrivacy: "AIで仕上げを押すと、現在のプロンプトがGoogle Gemini APIに送信されます。機微な個人情報は入力しないでください。キーはこの端末にのみ保存されます。",
    saved: "保存済み ✓",
    insert: "挿入",
    inserted: "挿入済み ✓",
    insertNoTab: "NotebookLMのタブが見つかりません。先にnotebooklm.google.comを開いてください。",
    insertNoBox: "先にNotebookLMでアウトプットのカスタマイズ欄を開いてください。",
    history: "履歴",
    historyEmpty: "コピーまたは挿入したプロンプトがここに残ります。",
    clear: "クリア",
    exportBtn: "エクスポート",
    importBtn: "インポート",
    importErr: "インポート失敗: 有効なプリセットJSONファイルではありません。",
    obTitle: "3ステップで始める",
    obStep1: "アウトプットの種類を選ぶ(クイズ、スライド…)",
    obStep2: "対象・目的・コンテキストを入力するとプロンプトがリアルタイムで作られる",
    obStep3: "NotebookLMでカスタマイズ欄を開き[挿入]を押す(またはコピーして貼り付け)",
    obDone: "はじめる",
  },
  es: {
    subtitle: "Elige un tipo de contenido, añade tu contexto y obtén un prompt de personalización a medida.",
    step1: "Elige el contenido",
    step2: "Añade contexto",
    step3: "Prompt generado",
    presets: "Preajustes",
    audience: "Audiencia",
    audiencePh: "p. ej. principiantes, compañeros de marketing",
    purpose: "Propósito",
    purposePh: "p. ej. presentación semanal, repaso para examen",
    context: "Contexto adicional (texto libre)",
    contextPh: "p. ej. El público no tiene conocimientos previos; se necesitan ejemplos sencillos.",
    outputLang: "Idioma del resultado",
    copy: "Copiar",
    copied: "Copiado ✓",
    save: "Guardar",
    del: "Eliminar",
    ok: "OK",
    cancel: "Cancelar",
    presetNamePh: "Nombre del preajuste (p. ej. quiz semanal)",
    presetPlaceholder: "Selecciona un preajuste guardado…",
    charWarn: "Algunos cuadros de personalización tienen un límite de ~500 caracteres. Considera acortar.",
    charSuffix: " caracteres",
    selectOption: "(elegir)",
    audienceOptions: [
      "Principiantes en el tema",
      "Estudiantes de secundaria",
      "Universitarios / adultos",
      "Compañeros de trabajo / mi equipo",
      "Clientes / público general",
      "Expertos / profesionales",
    ],
    purposeOptions: [
      "Presentar un concepto nuevo",
      "Repasar lo esencial",
      "Preparar un examen",
      "Informe de trabajo / briefing",
      "Clase / presentación",
      "Material de grupo de estudio",
    ],
    settings: "Ajustes",
    apiKey: "Clave API de Gemini",
    apiKeyPh: "Pega tu clave de Google AI Studio",
    model: "Modelo",
    refine: "Pulir con IA",
    refining: "Puliendo…",
    refineNoKey: "Primero guarda tu clave API de Gemini en Ajustes (icono de engranaje).",
    refineFail: "Error de solicitud: ",
    apiPrivacy: "Pulir con IA envía el prompt actual a la API de Google Gemini. Evita datos personales sensibles. Tu clave se guarda solo en este dispositivo.",
    saved: "Guardado ✓",
    insert: "Insertar",
    inserted: "Insertado ✓",
    insertNoTab: "No se encontró una pestaña de NotebookLM. Abre notebooklm.google.com primero.",
    insertNoBox: "Abre primero el cuadro de personalización del contenido en NotebookLM.",
    history: "Historial",
    historyEmpty: "Los prompts que copies o insertes aparecerán aquí.",
    clear: "Vaciar",
    exportBtn: "Exportar",
    importBtn: "Importar",
    importErr: "Error al importar: no es un archivo JSON de preajustes válido.",
    obTitle: "Empieza en 3 pasos",
    obStep1: "Elige el tipo de contenido (quiz, diapositivas…)",
    obStep2: "Añade audiencia, propósito y contexto: el prompt se crea en vivo",
    obStep3: "Abre el cuadro de personalización en NotebookLM y pulsa Insertar (o copia y pega)",
    obDone: "Entendido",
  },
  zh: {
    subtitle: "选择输出类型,输入你的背景信息,即可生成定制化提示词。",
    step1: "选择输出类型",
    step2: "输入背景信息",
    step3: "生成的提示词",
    presets: "预设",
    audience: "受众",
    audiencePh: "例:入门者、市场团队同事",
    purpose: "目的",
    purposePh: "例:周会汇报、备考复习",
    context: "补充背景(自由填写)",
    contextPh: "例:听众没有背景知识,需要通俗易懂的例子。",
    outputLang: "输出语言",
    copy: "复制",
    copied: "已复制 ✓",
    save: "保存",
    del: "删除",
    ok: "确定",
    cancel: "取消",
    presetNamePh: "预设名称(例:每周简报测验)",
    presetPlaceholder: "选择已保存的预设…",
    charWarn: "部分定制输入框约有500字符上限,建议适当精简。",
    charSuffix: " 字符",
    selectOption: "(选择)",
    audienceOptions: [
      "零基础入门者",
      "高中生",
      "大学生·成人学习者",
      "同事·团队",
      "客户·大众",
      "专家·从业者",
    ],
    purposeOptions: [
      "介绍新概念",
      "要点复习",
      "备考·测评",
      "工作汇报·简报",
      "讲课·演示材料",
      "学习小组资料",
    ],
    settings: "设置",
    apiKey: "Gemini API 密钥",
    apiKeyPh: "粘贴在 Google AI Studio 生成的密钥",
    model: "模型",
    refine: "AI 润色",
    refining: "润色中…",
    refineNoKey: "请先在设置(右上角齿轮)中保存 Gemini API 密钥。",
    refineFail: "请求失败:",
    apiPrivacy: "点击 AI 润色会将当前提示词发送到 Google Gemini API。请勿输入敏感个人信息。密钥仅保存在本设备。",
    saved: "已保存 ✓",
    insert: "插入",
    inserted: "已插入 ✓",
    insertNoTab: "未找到 NotebookLM 标签页。请先打开 notebooklm.google.com。",
    insertNoBox: "请先在 NotebookLM 中打开输出内容的定制输入框。",
    history: "历史记录",
    historyEmpty: "复制或插入过的提示词会显示在这里。",
    clear: "清空",
    exportBtn: "导出",
    importBtn: "导入",
    importErr: "导入失败:不是有效的预设 JSON 文件。",
    obTitle: "三步开始",
    obStep1: "选择输出类型(测验、幻灯片…)",
    obStep2: "输入受众、目的和背景,提示词实时生成",
    obStep3: "在 NotebookLM 打开定制输入框,点击[插入](或复制粘贴)",
    obDone: "知道了",
  },
  fr: {
    subtitle: "Choisissez un contenu, ajoutez votre contexte et obtenez un prompt de personnalisation sur mesure.",
    step1: "Choisir le contenu",
    step2: "Ajouter le contexte",
    step3: "Prompt généré",
    presets: "Préréglages",
    audience: "Public",
    audiencePh: "ex. débutants, collègues du marketing",
    purpose: "Objectif",
    purposePh: "ex. présentation hebdomadaire, révision d'examen",
    context: "Contexte supplémentaire (texte libre)",
    contextPh: "ex. Public sans connaissances préalables ; il faut des exemples simples.",
    outputLang: "Langue du résultat",
    copy: "Copier",
    copied: "Copié ✓",
    save: "Enregistrer",
    del: "Supprimer",
    ok: "OK",
    cancel: "Annuler",
    presetNamePh: "Nom du préréglage (ex. quiz hebdo)",
    presetPlaceholder: "Choisir un préréglage enregistré…",
    charWarn: "Certains champs de personnalisation sont limités à ~500 caractères. Pensez à raccourcir.",
    charSuffix: " caractères",
    selectOption: "(choisir)",
    audienceOptions: [
      "Débutants sur le sujet",
      "Lycéens",
      "Étudiants / adultes",
      "Collègues / mon équipe",
      "Clients / grand public",
      "Experts / praticiens",
    ],
    purposeOptions: [
      "Présenter un nouveau concept",
      "Réviser l'essentiel",
      "Préparer un examen",
      "Rapport / briefing de travail",
      "Cours / présentation",
      "Support de groupe d'étude",
    ],
    settings: "Réglages",
    apiKey: "Clé API Gemini",
    apiKeyPh: "Collez votre clé Google AI Studio",
    model: "Modèle",
    refine: "Affiner par IA",
    refining: "Affinage…",
    refineNoKey: "Enregistrez d'abord votre clé API Gemini dans les réglages (icône engrenage).",
    refineFail: "Échec de la requête : ",
    apiPrivacy: "Affiner par IA envoie le prompt actuel à l'API Google Gemini. Évitez les données personnelles sensibles. Votre clé reste sur cet appareil.",
    saved: "Enregistré ✓",
    insert: "Insérer",
    inserted: "Inséré ✓",
    insertNoTab: "Aucun onglet NotebookLM trouvé. Ouvrez d'abord notebooklm.google.com.",
    insertNoBox: "Ouvrez d'abord le champ de personnalisation du contenu dans NotebookLM.",
    history: "Historique",
    historyEmpty: "Les prompts copiés ou insérés apparaîtront ici.",
    clear: "Vider",
    exportBtn: "Exporter",
    importBtn: "Importer",
    importErr: "Échec de l'import : fichier JSON de préréglages invalide.",
    obTitle: "Démarrer en 3 étapes",
    obStep1: "Choisissez le type de contenu (quiz, diapositives…)",
    obStep2: "Ajoutez public, objectif et contexte — le prompt se construit en direct",
    obStep3: "Ouvrez le champ de personnalisation dans NotebookLM et cliquez sur Insérer (ou copiez-collez)",
    obDone: "Compris",
  },
  de: {
    subtitle: "Ausgabetyp wählen, Kontext eingeben — fertig ist der maßgeschneiderte Anpassungs-Prompt.",
    step1: "Ausgabe wählen",
    step2: "Kontext eingeben",
    step3: "Generierter Prompt",
    presets: "Voreinstellungen",
    audience: "Zielgruppe",
    audiencePh: "z. B. Einsteiger, Marketing-Kollegen",
    purpose: "Zweck",
    purposePh: "z. B. Wochenmeeting, Prüfungsvorbereitung",
    context: "Zusätzlicher Kontext (Freitext)",
    contextPh: "z. B. Publikum ohne Vorwissen; einfache Beispiele nötig.",
    outputLang: "Ausgabesprache",
    copy: "Kopieren",
    copied: "Kopiert ✓",
    save: "Speichern",
    del: "Löschen",
    ok: "OK",
    cancel: "Abbrechen",
    presetNamePh: "Name der Voreinstellung (z. B. Wochenbriefing-Quiz)",
    presetPlaceholder: "Gespeicherte Voreinstellung wählen…",
    charWarn: "Manche Anpassungsfelder haben ein Limit von ca. 500 Zeichen. Ggf. kürzen.",
    charSuffix: " Zeichen",
    selectOption: "(wählen)",
    audienceOptions: [
      "Einsteiger ohne Vorwissen",
      "Schüler (Oberstufe)",
      "Studierende / Erwachsene",
      "Kollegen / mein Team",
      "Kunden / breites Publikum",
      "Experten / Praktiker",
    ],
    purposeOptions: [
      "Neues Konzept vorstellen",
      "Kernpunkte wiederholen",
      "Prüfungsvorbereitung",
      "Arbeitsbericht / Briefing",
      "Vorlesung / Präsentation",
      "Lerngruppen-Material",
    ],
    settings: "Einstellungen",
    apiKey: "Gemini-API-Schlüssel",
    apiKeyPh: "Schlüssel aus Google AI Studio einfügen",
    model: "Modell",
    refine: "Mit KI verfeinern",
    refining: "Wird verfeinert…",
    refineNoKey: "Speichere zuerst deinen Gemini-API-Schlüssel in den Einstellungen (Zahnrad).",
    refineFail: "Anfrage fehlgeschlagen: ",
    apiPrivacy: "Mit KI verfeinern sendet den aktuellen Prompt an die Google-Gemini-API. Keine sensiblen persönlichen Daten eingeben. Der Schlüssel bleibt auf diesem Gerät.",
    saved: "Gespeichert ✓",
    insert: "Einfügen",
    inserted: "Eingefügt ✓",
    insertNoTab: "Kein NotebookLM-Tab gefunden. Öffne zuerst notebooklm.google.com.",
    insertNoBox: "Öffne zuerst das Anpassungsfeld der Ausgabe in NotebookLM.",
    history: "Verlauf",
    historyEmpty: "Kopierte oder eingefügte Prompts erscheinen hier.",
    clear: "Leeren",
    exportBtn: "Exportieren",
    importBtn: "Importieren",
    importErr: "Import fehlgeschlagen: keine gültige Voreinstellungs-JSON-Datei.",
    obTitle: "In 3 Schritten starten",
    obStep1: "Ausgabetyp wählen (Quiz, Folien…)",
    obStep2: "Zielgruppe, Zweck und Kontext eingeben — der Prompt entsteht live",
    obStep3: "In NotebookLM das Anpassungsfeld öffnen und auf Einfügen klicken (oder kopieren & einfügen)",
    obDone: "Alles klar",
  },
};

let uiLang = "ko";
const S = () => I18N[uiLang];
const pickUI = (x) => pick(x, uiLang);

// ---------- 테마 ----------
const THEME_IDS = ["auto", "light", "dark", "ocean", "forest"];
const THEME_LABEL = { ko: "테마", en: "Theme", ja: "テーマ", es: "Tema", zh: "主题", fr: "Thème", de: "Thema" };
const THEME_NAMES = {
  auto: { ko: "자동 (시스템)", en: "Auto (system)", ja: "自動(システム)", es: "Automático (sistema)", zh: "自动(跟随系统)", fr: "Auto (système)", de: "Automatisch (System)" },
  light: { ko: "라이트", en: "Light", ja: "ライト", es: "Claro", zh: "浅色", fr: "Clair", de: "Hell" },
  dark: { ko: "다크", en: "Dark", ja: "ダーク", es: "Oscuro", zh: "深色", fr: "Sombre", de: "Dunkel" },
  ocean: { ko: "오션 블루", en: "Ocean blue", ja: "オーシャンブルー", es: "Azul océano", zh: "海洋蓝", fr: "Bleu océan", de: "Ozeanblau" },
  forest: { ko: "포레스트 그린", en: "Forest green", ja: "フォレストグリーン", es: "Verde bosque", zh: "森林绿", fr: "Vert forêt", de: "Waldgrün" },
};
let theme = "auto";

function applyTheme() {
  document.documentElement.dataset.theme = theme;
}

function bindTheme() {
  $("themeSelect").addEventListener("input", () => {
    const v = $("themeSelect").value;
    if (!THEME_IDS.includes(v)) return;
    theme = v;
    if (hasChrome) chrome.storage.local.set({ theme });
    applyTheme();
  });
}

const state = {
  typeId: OUTPUT_TYPES[0].id,
  common: { audience: "", purpose: "", context: "", language: "ko" },
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
  // UI 언어 드롭다운 — 각 언어의 원어 명칭으로 표기
  const lt = $("langToggle");
  if (lt.options.length !== UI_LANGS.length) {
    lt.innerHTML = "";
    for (const code of UI_LANGS) {
      const o = document.createElement("option");
      o.value = code;
      o.textContent = OUTPUT_LANGS[code].label;
      lt.appendChild(o);
    }
  }
  lt.value = uiLang;
  // 테마 select
  $("themeLabel").textContent = pick(THEME_LABEL, uiLang);
  const ts = $("themeSelect");
  ts.innerHTML = "";
  for (const id of THEME_IDS) {
    const o = document.createElement("option");
    o.value = id;
    o.textContent = pick(THEME_NAMES[id], uiLang);
    ts.appendChild(o);
  }
  ts.value = theme;
  $("settingsToggle").title = S().settings;
  $("settingsToggle").setAttribute("aria-label", S().settings);
  fillDatalist("audienceList", S().audienceOptions);
  fillDatalist("purposeList", S().purposeOptions);
  // 결과물 언어 select — 값은 언어 코드, 표기는 각 언어의 원어 명칭
  const sel = $("language");
  const cur = langCode({ language: state.common.language });
  state.common.language = cur;
  sel.innerHTML = "";
  for (const [code, def] of Object.entries(OUTPUT_LANGS)) {
    const o = document.createElement("option");
    o.value = code;
    o.textContent = def.label;
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
  if (!c.language) c.language = "ko";
  // 영어 템플릿을 쓰는 언어면 선택 옵션 값을 영어로 치환 (디자인 스타일 등 noTranslate 제외)
  if (langOf(c) === "en") {
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
      const outLang = OUTPUT_LANGS[langCode({ language: state.common.language })].name;
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
// 자동완성 목록에서 고른 값(한/영 1:1 대응)은 토글 시 반대 언어로 교체.
// 직접 입력한 자유 텍스트는 사용자 콘텐츠이므로 그대로 둔다.
function swapSuggestedValues(fromLang, toLang) {
  const pairs = [
    ["audience", "audienceOptions"],
    ["purpose", "purposeOptions"],
  ];
  for (const [key, optKey] of pairs) {
    const val = (state.common[key] || "").trim();
    if (!val) continue;
    const idx = I18N[fromLang][optKey].indexOf(val);
    if (idx >= 0) state.common[key] = I18N[toLang][optKey][idx];
  }
}

const UI_LANGS = ["ko", "en", "ja", "es", "zh", "fr", "de"];

function bindLangToggle() {
  $("langToggle").addEventListener("input", () => {
    const prev = uiLang;
    const next = $("langToggle").value;
    if (!UI_LANGS.includes(next) || next === prev) return;
    uiLang = next;
    if (hasChrome) chrome.storage.local.set({ uiLang });
    // UI 언어 전환 시 결과물 언어도 함께 전환 — 셀렉트에서 개별 변경은 그대로 가능
    state.common.language = uiLang;
    swapSuggestedValues(prev, uiLang);
    applyI18n();
    applyCommonToInputs();
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
  const locale =
    { ko: "ko-KR", ja: "ja-JP", es: "es-ES", zh: "zh-CN", fr: "fr-FR", de: "de-DE" }[uiLang] || "en-US";
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

function detectUiLang() {
  const l = (navigator.language || "").toLowerCase();
  for (const code of ["ko", "ja", "es", "zh", "fr", "de"]) {
    if (l.startsWith(code)) return code;
  }
  return "en";
}

async function loadState() {
  if (!hasChrome) {
    uiLang = detectUiLang();
    return;
  }
  const stored = await chrome.storage.local.get(["lastState", "uiLang", "theme"]);
  uiLang = UI_LANGS.includes(stored.uiLang) ? stored.uiLang : detectUiLang();
  if (THEME_IDS.includes(stored.theme)) theme = stored.theme;
  const lastState = stored.lastState;
  if (!lastState) {
    // 첫 실행: 결과물 언어를 UI 언어에 맞춤
    state.common.language = uiLang;
    return;
  }
  state.typeId = OUTPUT_TYPES.some((x) => x.id === lastState.typeId)
    ? lastState.typeId
    : OUTPUT_TYPES[0].id;
  state.common = { ...state.common, ...lastState.common };
  state.byType = migrateDesignNames(lastState.byType || {});
  // 구버전(교사 특화 예시) 시절 저장된 대상/목적 값은 일회성으로 비운다
  if (LEGACY_EXAMPLES.has((state.common.audience || "").trim())) state.common.audience = "";
  if (LEGACY_EXAMPLES.has((state.common.purpose || "").trim())) state.common.purpose = "";
}

const LEGACY_EXAMPLES = new Set([
  "고등학교 1학년 정보 수업 학생",
  "고등학교 인공지능기초 수업 학생",
  "고등학교 공학일반 수업 학생",
  "동료 교사 (연수)",
  "학부모",
  "처음 배우는 일반인",
  "새 개념 도입",
  "단원 복습",
  "시험 대비",
  "수행평가 준비",
  "교사 연수 자료",
  "발표 자료",
]);

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
  applyTheme();
  applyI18n();
  applyCommonToInputs();
  renderTypeGrid();
  renderTypeFields();
  bindCommonFields();
  bindLangToggle();
  bindTheme();
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
