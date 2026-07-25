// 산출물별 프롬프트 템플릿 정의 (한/영 이중 언어).
// 프롬프트 문구를 고치려면 build() 안의 T("한국어", "English") 쌍을 수정하면 된다.

"use strict";

const t = (v) => (v == null ? "" : String(v).trim());
const L = (label, v) => (t(v) ? `- ${label}: ${t(v)}` : "");
const joinLines = (parts) => parts.filter((p) => t(p)).join("\n");

// 다국어 문자열 {ko, en, ja?, es?, zh?, fr?, de?}
// 세 번째 인자: 일본어 문자열(구형) 또는 {ja, es, zh, fr, de} 객체.
// 없는 언어는 en → ko 순으로 폴백.
const B = (ko, en, extra) => ({
  ko,
  en,
  ...(typeof extra === "string" ? { ja: extra } : extra),
});
const pick = (x, lang) => {
  if (!x || typeof x !== "object") return x;
  if (lang === "ko") return x.ko;
  return x[lang] ?? x.en ?? x.ko;
};

// 결과물 언어 — c.language는 언어 코드(canonical). 한국어 외 언어는
// 영어 템플릿 + 대상 언어 지시문으로 프롬프트를 만든다.
const OUTPUT_LANGS = {
  ko: { label: "한국어", name: "Korean" },
  en: { label: "English", name: "English" },
  ja: { label: "日本語", name: "Japanese" },
  zh: { label: "中文(简体)", name: "Simplified Chinese" },
  es: { label: "Español", name: "Spanish" },
  fr: { label: "Français", name: "French" },
  de: { label: "Deutsch", name: "German" },
};

// 구 버전 저장값("한국어"/"영어") 호환
const LEGACY_LANG = { "한국어": "ko", "영어": "en" };
const langCode = (c) =>
  OUTPUT_LANGS[c.language] ? c.language : LEGACY_LANG[c.language] || "ko";
const langOf = (c) => (langCode(c) === "ko" ? "ko" : "en");

// mode: "write"(기본) | "speak"(오디오) | "narrate"(동영상)
function outputLangLine(c, mode) {
  const code = langCode(c);
  if (code === "ko") {
    if (mode === "speak") return "- 자연스러운 한국어로 진행할 것";
    if (mode === "narrate") return "- 내레이션은 자연스러운 한국어로 진행할 것";
    return "- 결과물은 자연스러운 한국어로 작성할 것";
  }
  const name = OUTPUT_LANGS[code].name;
  if (mode === "speak") return `- Host the conversation in natural, fluent ${name}`;
  if (mode === "narrate") return `- Narrate in natural, fluent ${name}`;
  return `- Write everything in natural, fluent ${name}`;
}

function assemble(intro, lines, c, mode) {
  const lang = langOf(c);
  const T = (ko, en) => (lang === "en" ? en : ko);
  let out = joinLines([
    intro,
    L(T("대상", "Audience"), c.audience),
    L(T("목적", "Purpose"), c.purpose),
    ...lines,
    outputLangLine(c, mode),
  ]);
  if (t(c.context)) out += `\n\n${T("추가 맥락", "Additional context")}: ${t(c.context)}`;
  return out;
}

// 디자인·서식 산출물에 기본 적용되는 스타일 지시문.
// 매체별로 문구가 다르다: screen(슬라이드·동영상·인포그래픽) / doc(보고서) / table(데이터 표)
const DESIGN_STYLES = {
  "세련된 미니멀 (애플·Figma풍)": {
    en: "Refined minimal (Apple/Figma)",
    ja: "洗練ミニマル(Apple・Figma風)",
    es: "Minimalismo refinado (Apple/Figma)",
    zh: "精致极简(Apple·Figma风)",
    fr: "Minimalisme raffiné (Apple/Figma)",
    de: "Edler Minimalismus (Apple/Figma)",
    screen: [
      B(
        "- 디자인: 애플 프레젠테이션처럼 세련된 미니멀 스타일 — 넉넉한 여백, 화면당 핵심 메시지 1개, 차분한 배경에 포인트 컬러 1가지만 사용할 것",
        "- Design: refined, Apple-keynote-style minimalism — generous whitespace, one key message per screen, calm background with a single accent color"
      ),
      B(
        "- 폰트·레이아웃: 크고 굵은 산세리프 제목과 가는 본문의 대비를 살리고, Figma 디자인 시스템처럼 일관된 그리드 정렬을 유지할 것. 클립아트·화려한 그라데이션·장식 요소 금지",
        "- Type & layout: strong contrast between bold sans-serif headlines and light body text, with consistent Figma-like grid alignment. No clip art, flashy gradients, or ornaments"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 절제된 미니멀 스타일 — 제목·소제목·본문의 위계를 명확히 하고, 단락 사이 여백을 넉넉히 둘 것. 강조는 굵은 글씨만 사용하고 이모지·장식 기호·과한 구분선은 쓰지 말 것",
        "- Document style: restrained minimalism — clear heading hierarchy and generous paragraph spacing. Emphasize with bold only; no emoji, decorative symbols, or heavy dividers"
      ),
    ],
    table: [
      B(
        "- 표 서식: 불필요한 장식 없이 머리행만 강조한 깔끔한 미니멀 표로, 열 이름은 짧고 명확하게 쓸 것",
        "- Table style: clean and minimal with only the header row emphasized; keep column names short and clear"
      ),
    ],
  },
  "밝고 친근한 톤": {
    en: "Bright & friendly",
    ja: "明るくフレンドリー",
    es: "Alegre y cercano",
    zh: "明快友好",
    fr: "Chaleureux et convivial",
    de: "Hell & freundlich",
    screen: [
      B(
        "- 디자인: 밝고 따뜻한 파스텔 톤과 둥근 도형, 단순한 아이콘으로 친근한 분위기로 구성할 것",
        "- Design: bright, warm pastel tones with rounded shapes and simple icons for a friendly mood"
      ),
      B(
        "- 텍스트는 크고 읽기 쉽게, 화면당 정보량은 적게 유지할 것",
        "- Keep text large and readable, with little information per screen"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 짧은 단락과 친근한 소제목으로 구성하고, 핵심 내용마다 한 줄 요약을 덧붙여 읽기 쉽게 만들 것",
        "- Document style: short paragraphs with friendly subheadings; add a one-line takeaway after each key point"
      ),
    ],
    table: [
      B(
        "- 표 서식: 행 수를 적게 유지해 한눈에 들어오게 하고, 어려운 용어에는 괄호로 쉬운 설명을 덧붙일 것",
        "- Table style: keep rows few enough to scan at a glance; add plain-language hints in parentheses for difficult terms"
      ),
    ],
  },
  "다크·테크 (개발 발표풍)": {
    en: "Dark tech (developer talk)",
    ja: "ダークテック(開発発表風)",
    es: "Tecnológico oscuro",
    zh: "暗黑科技风",
    fr: "Tech sombre",
    de: "Dark Tech",
    screen: [
      B(
        "- 디자인: 어두운 배경에 밝은 텍스트, 네온 포인트 컬러 1가지, 다이어그램 중심의 테크 발표 스타일로 구성할 것",
        "- Design: dark background with light text, one neon accent color, in a diagram-centric tech-talk style"
      ),
      B(
        "- 산세리프 제목과 모노스페이스(코드) 폰트의 대비를 활용하고 장식 요소는 최소화할 것",
        "- Contrast sans-serif headings with monospace (code) type; minimize decoration"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 기술 문서 스타일 — 간결한 개조식 위주로 쓰고, 코드·명령어는 코드 블록으로 구분하며 핵심 용어는 원어를 병기할 것",
        "- Document style: technical-doc style — terse bullets, code/commands in code blocks, key terms glossed in their original language"
      ),
    ],
    table: [
      B(
        "- 표 서식: 기술 비교표 스타일 — 코드·수치는 그대로 표기하고, 셀 내용은 간결한 키워드 위주로 쓸 것",
        "- Table style: technical comparison table — keep code and numbers verbatim, cells keyword-brief"
      ),
    ],
  },
  "스위스 그리드 (모던 타이포)": {
    en: "Swiss grid (modern typographic)",
    ja: "スイスグリッド(モダンタイポ)",
    es: "Retícula suiza (tipográfica)",
    zh: "瑞士网格(现代字体排印)",
    fr: "Grille suisse (typographique)",
    de: "Schweizer Raster (typografisch)",
    screen: [
      B(
        "- 디자인: 스위스 그리드 스타일 — 엄격한 격자 정렬, 비대칭 여백, 흑백 + 강렬한 레드 1색, 큰 산세리프 타이포 중심으로 구성할 것",
        "- Design: Swiss-grid style — strict grid alignment, asymmetric whitespace, black & white plus one bold red, driven by large sans-serif type"
      ),
      B(
        "- 사진·일러스트보다 타이포그래피와 여백으로 위계를 만들고, 장식 요소는 일절 금지",
        "- Build hierarchy with typography and whitespace rather than imagery; no decorative elements at all"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 스위스 타이포그래피 스타일 — 번호 매긴 섹션, 정렬된 여백, 굵기 대비로만 강조할 것",
        "- Document style: Swiss typographic — numbered sections, aligned margins, emphasis through weight contrast only"
      ),
    ],
    table: [
      B(
        "- 표 서식: 세로 괘선 없이 가로 헤어라인만 쓰는 스위스 스타일 표로, 숫자는 우측 정렬할 것",
        "- Table style: Swiss table with horizontal hairlines only (no vertical rules); right-align numbers"
      ),
    ],
  },
  "에디토리얼 매거진 (세리프·화보풍)": {
    en: "Editorial magazine",
    ja: "エディトリアル雑誌風",
    es: "Revista editorial",
    zh: "杂志编辑风",
    fr: "Magazine éditorial",
    de: "Editorial-Magazin",
    screen: [
      B(
        "- 디자인: 고급 매거진 스타일 — 우아한 세리프 대제목, 큰 이미지 1장 중심, 크림·차콜 톤의 절제된 팔레트로 구성할 것",
        "- Design: high-end magazine style — elegant serif headlines, one large hero image per spread, restrained cream & charcoal palette"
      ),
      B(
        "- 본문은 좁은 컬럼으로 짧게 쓰고, 핵심 문장은 인용구로 크게 뽑아 화보처럼 배치할 것",
        "- Keep body copy in narrow columns; pull key sentences out as large quotes, laid out like a photo spread"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 매거진 에디토리얼 스타일 — 세리프 제목과 산세리프 본문의 대비, 섹션 사이에 인용구 강조",
        "- Document style: magazine editorial — serif headings against sans-serif body, pull quotes between sections"
      ),
    ],
    table: [
      B(
        "- 표 서식: 매거진 표 스타일 — 세리프 머리행, 은은한 줄무늬 행 배경, 여백을 넉넉하게",
        "- Table style: magazine table — serif header row, subtle striped rows, generous padding"
      ),
    ],
  },
  "손그림 스케치노트": {
    en: "Hand-drawn sketchnote",
    ja: "手描きスケッチノート",
    es: "Sketchnote a mano",
    zh: "手绘笔记风",
    fr: "Sketchnote à la main",
    de: "Handgezeichnete Sketchnote",
    screen: [
      B(
        "- 디자인: 손그림 스케치노트 스타일 — 마커로 그린 듯한 도형·화살표·밑줄, 손글씨 느낌의 제목, 종이 질감 배경으로 구성할 것",
        "- Design: hand-drawn sketchnote style — marker-like shapes, arrows and underlines, handwritten-feel headings on a paper-textured background"
      ),
      B(
        "- 개념 사이를 화살표와 낙서풍 아이콘으로 연결해 생각의 흐름이 한눈에 보이게 할 것",
        "- Connect ideas with arrows and doodle icons so the flow of thinking reads at a glance"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 필기 노트 스타일 — 핵심 옆 여백 메모, 형광펜 강조, 중요한 부분에 별표 표시",
        "- Document style: study-notes style — margin notes beside key points, highlighter emphasis, stars on what matters"
      ),
    ],
    table: [
      B(
        "- 표 서식: 손그림 표 스타일 — 자유로운 선, 셀마다 핵심 키워드 하나와 간단한 아이콘",
        "- Table style: hand-drawn table — loose lines, one keyword plus a simple icon per cell"
      ),
    ],
  },
  "볼드 팝 (비비드 컬러블록)": {
    en: "Bold pop (vivid color blocks)",
    ja: "ボールドポップ(ビビッド配色)",
    es: "Pop audaz (bloques vivos)",
    zh: "大胆波普(鲜艳色块)",
    fr: "Pop audacieux (blocs vifs)",
    de: "Bold Pop (kräftige Farbblöcke)",
    screen: [
      B(
        "- 디자인: 볼드 팝 스타일 — 비비드한 컬러 블록, 화면을 가득 채우는 초대형 타이포, 강한 대비로 에너지 있게 구성할 것",
        "- Design: bold pop style — vivid color blocks, oversized type that fills the frame, high-contrast and energetic"
      ),
      B(
        "- 한 화면의 컬러는 2~3개로 제한하고, 메시지는 한 번에 한 문장씩 크게 던질 것",
        "- Limit each screen to 2–3 colors; deliver one big statement at a time"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 볼드 에디토리얼 — 컬러 배경의 섹션 헤더, 크고 굵은 소제목, 짧은 단락",
        "- Document style: bold editorial — color-block section headers, big heavy subheadings, short paragraphs"
      ),
    ],
    table: [
      B(
        "- 표 서식: 컬러 블록 표 — 머리행은 진한 배경색, 강조할 셀에만 포인트 컬러를 쓸 것",
        "- Table style: color-block table — solid header row, accent color reserved for highlighted cells"
      ),
    ],
  },
  "럭셔리 세리프 (크림·골드)": {
    en: "Luxury serif (cream & gold)",
    ja: "ラグジュアリーセリフ(クリーム・ゴールド)",
    es: "Serif de lujo (crema y oro)",
    zh: "奢华衬线(奶油·金)",
    fr: "Serif luxe (crème et or)",
    de: "Luxus-Serif (Creme & Gold)",
    screen: [
      B(
        "- 디자인: 럭셔리 브랜드 스타일 — 크림 배경, 가는 세리프 대제목, 골드 포인트 라인, 넓은 여백으로 고급스럽게 구성할 것",
        "- Design: luxury-brand style — cream background, fine serif headlines, gold accent rules, expansive whitespace"
      ),
      B(
        "- 요소 수를 최소화하고, 가는 괘선과 자간 넓은 대문자 표기로 격조를 표현할 것",
        "- Keep elements minimal; convey refinement with thin rules and letterspaced small caps"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 포멀 레터 스타일 — 세리프 본문, 가는 구분선, 절제된 격식 있는 어조",
        "- Document style: formal letter — serif body, thin dividers, restrained and formal tone"
      ),
    ],
    table: [
      B(
        "- 표 서식: 파인 다이닝 메뉴 스타일 — 가는 괘선과 세리프, 점선 리더로 항목과 값을 연결",
        "- Table style: fine-dining menu — thin rules, serif type, dotted leaders joining items to values"
      ),
    ],
  },
  "데이터 저널리즘 (차트 중심)": {
    en: "Data journalism (chart-first)",
    ja: "データジャーナリズム(チャート中心)",
    es: "Periodismo de datos",
    zh: "数据新闻(图表优先)",
    fr: "Journalisme de données",
    de: "Datenjournalismus",
    screen: [
      B(
        "- 디자인: 데이터 저널리즘 스타일 — 차트와 수치가 주인공, 명확한 축·단위 표기, 주석으로 인사이트를 짚어줄 것",
        "- Design: data-journalism style — charts and figures lead, with clear axes and units, insights called out in annotations"
      ),
      B(
        "- 장식 없는 중립 팔레트를 쓰고, 강조할 데이터에만 포인트 컬러 1색을 쓸 것",
        "- Use a neutral, no-frills palette; one accent color reserved for the key data point"
      ),
    ],
    doc: [
      B(
        "- 문서 서식: 리서치 브리프 스타일 — 핵심 수치를 본문에 굵게 인라인 표기하고 출처를 각주로 달 것",
        "- Document style: research brief — key figures bolded inline, sources footnoted"
      ),
    ],
    table: [
      B(
        "- 표 서식: 통계표 스타일 — 숫자 우측 정렬과 단위 명시, 최댓값·최솟값 강조",
        "- Table style: statistical table — right-aligned numbers with units, min and max highlighted"
      ),
    ],
  },
};

const DESIGN_FIELD = {
  key: "design",
  label: B("디자인 스타일", "Design style", { ja: "デザインスタイル", es: "Estilo de diseño", zh: "设计风格", fr: "Style de design", de: "Designstil" }),
  type: "select",
  noTranslate: true, // 값은 항상 한국어 키로 저장·조회
  options: Object.entries(DESIGN_STYLES).map(([ko, v]) =>
    B(ko, v.en, { ja: v.ja, es: v.es, zh: v.zh, fr: v.fr, de: v.de })
  ),
  default: "세련된 미니멀 (애플·Figma풍)",
};

const designLines = (c, medium = "screen") => {
  const lang = langOf(c);
  const st = DESIGN_STYLES[t(c.design)];
  return st ? (st[medium] || []).map((x) => pick(x, lang)) : [];
};

// 산출물 그리드용 라인 아이콘 (feather 스타일, currentColor)
const ic = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const OUTPUT_TYPES = [
  {
    id: "audio",
    name: B("AI 오디오 오버뷰", "Audio Overview", { ja: "音声概要", es: "Resumen de audio", zh: "音频概览", fr: "Résumé audio", de: "Audioübersicht" }),
    icon: ic('<line x1="4" y1="10" x2="4" y2="14"/><line x1="8" y1="7" x2="8" y2="17"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="16" y1="7" x2="16" y2="17"/><line x1="20" y1="10" x2="20" y2="14"/>'),
    fields: [
      {
        key: "format", label: B("진행 형식", "Format", { ja: "進行形式", es: "Formato", zh: "形式", fr: "Format", de: "Format" }), type: "select",
        options: [
          B("두 진행자 심층 토론", "In-depth discussion (two hosts)", { ja: "二人のホストによる深掘り討論", es: "Debate a fondo (dos presentadores)", zh: "双主持深度讨论", fr: "Discussion approfondie (deux animateurs)", de: "Tiefgehende Diskussion (zwei Hosts)" }),
          B("간결한 브리핑(1인)", "Concise solo briefing", { ja: "簡潔なブリーフィング(1人)", es: "Briefing breve (una voz)", zh: "简明简报(单人)", fr: "Briefing concis (une voix)", de: "Kompaktes Briefing (eine Stimme)" }),
          B("비판적 검토", "Critical review", { ja: "批判的レビュー", es: "Revisión crítica", zh: "批判性评述", fr: "Analyse critique", de: "Kritische Betrachtung" }),
          B("찬반 토론", "Debate (pro vs. con)", { ja: "賛否討論", es: "Debate a favor y en contra", zh: "正反辩论", fr: "Débat pour/contre", de: "Pro-und-Contra-Debatte" }),
        ],
      },
      {
        key: "duration", label: B("길이", "Length", { ja: "長さ", es: "Duración", zh: "时长", fr: "Durée", de: "Länge" }), type: "select",
        options: [
          B("짧게 (5분 내외)", "Short (~5 min)", { ja: "短め(約5分)", es: "Corto (~5 min)", zh: "短(约5分钟)", fr: "Court (~5 min)", de: "Kurz (~5 Min.)" }),
          B("보통 (10분 내외)", "Medium (~10 min)", { ja: "標準(約10分)", es: "Medio (~10 min)", zh: "中等(约10分钟)", fr: "Moyen (~10 min)", de: "Mittel (~10 Min.)" }),
          B("길게 (15분 이상)", "Long (15+ min)", { ja: "長め(15分以上)", es: "Largo (15+ min)", zh: "长(15分钟以上)", fr: "Long (15 min et +)", de: "Lang (15+ Min.)" }),
        ],
      },
      { key: "focus", label: B("반드시 다룰 주제", "Must-cover topics", { ja: "必ず扱うトピック", es: "Temas imprescindibles", zh: "必须涵盖的主题", fr: "Sujets à couvrir", de: "Pflichtthemen" }), type: "text", placeholder: B("예: 핵심 개념 비교, 최신 동향", "e.g. comparing core concepts, recent trends", { ja: "例: 主要概念の比較、最新動向", es: "p. ej. comparar conceptos clave, tendencias", zh: "例:核心概念对比、最新趋势", fr: "ex. comparer les concepts clés, tendances", de: "z. B. Kernkonzepte vergleichen, Trends" }) },
      { key: "situation", label: B("활용 상황", "Listening context", { ja: "利用シーン", es: "Contexto de escucha", zh: "收听场景", fr: "Contexte d'écoute", de: "Hörsituation" }), type: "text", placeholder: B("예: 출퇴근길 청취, 회의 전 브리핑", "e.g. commute listening, pre-meeting briefing", { ja: "例: 通勤中の試聴、会議前のブリーフィング", es: "p. ej. de camino al trabajo, antes de una reunión", zh: "例:通勤路上、会前简报", fr: "ex. trajet domicile-travail, avant une réunion", de: "z. B. beim Pendeln, vor einem Meeting" }) },
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("다음 조건에 맞는 오디오 오버뷰를 만들어 주세요.", "Create an Audio Overview with the following requirements."),
        [
          L(T("진행 형식", "Format"), c.format),
          L(T("길이", "Length"), c.duration),
          L(T("반드시 다룰 주제", "Must-cover topics"), c.focus),
          L(T("활용 상황", "Listening context"), c.situation),
          T("- 어려운 용어는 대상 수준에 맞는 구체적 예시로 풀어서 설명할 것",
            "- Explain difficult terms with concrete examples suited to the audience"),
          T("- 소스에 없는 내용은 추측해서 말하지 말 것",
            "- Do not speculate beyond what the sources say"),
        ],
        c,
        "speak"
      );
    },
  },
  {
    id: "slides",
    name: B("슬라이드 자료", "Slides", { ja: "スライド資料", es: "Diapositivas", zh: "幻灯片", fr: "Diapositives", de: "Folien" }),
    icon: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/>'),
    fields: [
      { key: "count", label: B("슬라이드 장수", "Slide count", { ja: "スライド枚数", es: "Número de diapositivas", zh: "幻灯片数量", fr: "Nombre de diapositives", de: "Folienanzahl" }), type: "number", placeholder: B("10", "10", { ja: "10", es: "10", zh: "10", fr: "10", de: "10" }) },
      { key: "time", label: B("발표 시간", "Presentation time", { ja: "発表時間", es: "Duración de la presentación", zh: "演示时长", fr: "Durée de présentation", de: "Vortragsdauer" }), type: "text", placeholder: B("예: 15분 발표", "e.g. a 15-minute talk", { ja: "例: 15分の発表", es: "p. ej. charla de 15 minutos", zh: "例:15分钟演讲", fr: "ex. exposé de 15 minutes", de: "z. B. 15-minütiger Vortrag" }) },
      {
        key: "presenter", label: B("용도", "Use case", { ja: "用途", es: "Uso", zh: "用途", fr: "Usage", de: "Einsatzzweck" }), type: "select",
        options: [
          B("강의·발표용", "Lecture / presentation", { ja: "講義・発表用", es: "Clase / presentación", zh: "讲课·演示", fr: "Cours / présentation", de: "Vortrag / Präsentation" }),
          B("보고·브리핑용", "Report / briefing", { ja: "報告・ブリーフィング用", es: "Informe / briefing", zh: "汇报·简报", fr: "Rapport / briefing", de: "Bericht / Briefing" }),
          B("자습·복습용", "Self-study / review", { ja: "自習・復習用", es: "Autoestudio / repaso", zh: "自学·复习", fr: "Autoformation / révision", de: "Selbststudium / Wiederholung" }),
          B("교육·워크숍용", "Training / workshop", { ja: "研修・ワークショップ用", es: "Formación / taller", zh: "培训·工作坊", fr: "Formation / atelier", de: "Schulung / Workshop" }),
        ],
      },
      {
        key: "density", label: B("텍스트 밀도", "Text density", { ja: "テキスト量", es: "Densidad de texto", zh: "文字密度", fr: "Densité de texte", de: "Textdichte" }), type: "select",
        options: [
          B("키워드 중심(텍스트 최소)", "Keywords only (minimal text)", { ja: "キーワード中心(テキスト最小)", es: "Solo palabras clave (texto mínimo)", zh: "关键词为主(文字最少)", fr: "Mots-clés uniquement (texte minimal)", de: "Nur Stichwörter (minimaler Text)" }),
          B("핵심 문장 서술", "Key sentences", { ja: "要点を文章で記述", es: "Frases clave", zh: "要点成句", fr: "Phrases clés", de: "Kernsätze" }),
          B("시각 자료 위주", "Visual-first", { ja: "ビジュアル中心", es: "Prioridad a lo visual", zh: "视觉素材为主", fr: "Priorité au visuel", de: "Visuell zuerst" }),
        ],
      },
      { key: "focus", label: B("반드시 포함할 내용", "Must include", { ja: "必ず含める内容", es: "Debe incluir", zh: "必须包含", fr: "À inclure absolument", de: "Muss enthalten" }), type: "text", placeholder: B("예: 실습 예제, 핵심 수치", "e.g. hands-on examples, key figures", { ja: "例: 実習例、主要数値", es: "p. ej. ejemplos prácticos, cifras clave", zh: "例:实操示例、关键数据", fr: "ex. exemples pratiques, chiffres clés", de: "z. B. Praxisbeispiele, Kennzahlen" }) },
      DESIGN_FIELD,
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("다음 조건에 맞는 슬라이드 자료를 만들어 주세요.", "Create presentation slides with the following requirements."),
        [
          L(T("분량", "Slide count"), t(c.count) ? T(`${t(c.count)}장 내외`, `about ${t(c.count)} slides`) : ""),
          L(T("발표 시간", "Presentation time"), c.time),
          L(T("용도", "Use case"), c.presenter),
          L(T("텍스트 밀도", "Text density"), c.density),
          L(T("반드시 포함할 내용", "Must include"), c.focus),
          ...designLines(c),
          T("- 도입(동기 유발) → 전개 → 정리(핵심 요약) 흐름으로 구성할 것",
            "- Structure the deck as hook → main content → summary of key takeaways"),
        ],
        c
      );
    },
  },
  {
    id: "video",
    name: B("동영상 개요", "Video Overview", { ja: "動画概要", es: "Resumen en video", zh: "视频概览", fr: "Résumé vidéo", de: "Videoübersicht" }),
    icon: ic('<rect x="2" y="5" width="20" height="14" rx="3"/><polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none"/>'),
    fields: [
      {
        key: "duration", label: B("길이", "Length", { ja: "長さ", es: "Duración", zh: "时长", fr: "Durée", de: "Länge" }), type: "select",
        options: [
          B("짧게 (3분 내외)", "Short (~3 min)", { ja: "短め(約3分)", es: "Corto (~3 min)", zh: "短(约3分钟)", fr: "Court (~3 min)", de: "Kurz (~3 Min.)" }),
          B("보통 (5~7분)", "Medium (5–7 min)", { ja: "標準(5〜7分)", es: "Medio (5–7 min)", zh: "中等(5–7分钟)", fr: "Moyen (5–7 min)", de: "Mittel (5–7 Min.)" }),
          B("길게 (10분 이상)", "Long (10+ min)", { ja: "長め(10分以上)", es: "Largo (10+ min)", zh: "长(10分钟以上)", fr: "Long (10 min et +)", de: "Lang (10+ Min.)" }),
        ],
      },
      {
        key: "style", label: B("스타일", "Style", { ja: "スタイル", es: "Estilo", zh: "风格", fr: "Style", de: "Stil" }), type: "select",
        options: [
          B("개념 설명 중심", "Concept explanation", { ja: "概念説明中心", es: "Explicación de conceptos", zh: "概念讲解为主", fr: "Explication de concepts", de: "Konzepterklärung" }),
          B("사례·스토리 중심", "Case & story driven", { ja: "事例・ストーリー中心", es: "Casos e historias", zh: "案例·故事为主", fr: "Cas et récits", de: "Fälle & Geschichten" }),
          B("단계별 튜토리얼", "Step-by-step tutorial", { ja: "ステップ別チュートリアル", es: "Tutorial paso a paso", zh: "分步教程", fr: "Tutoriel pas à pas", de: "Schritt-für-Schritt-Tutorial" }),
          B("핵심 요약 브리핑", "Key-points briefing", { ja: "要点ブリーフィング", es: "Briefing de puntos clave", zh: "要点简报", fr: "Briefing des points clés", de: "Kernpunkte-Briefing" }),
        ],
      },
      { key: "focus", label: B("강조할 주제", "Topics to emphasize", { ja: "強調するトピック", es: "Temas a destacar", zh: "重点主题", fr: "Sujets à mettre en avant", de: "Zu betonende Themen" }), type: "text", placeholder: B("예: 핵심 개념 간의 관계", "e.g. how the key concepts relate", { ja: "例: 主要概念どうしの関係", es: "p. ej. cómo se relacionan los conceptos clave", zh: "例:核心概念之间的关系", fr: "ex. liens entre les concepts clés", de: "z. B. Zusammenhang der Kernkonzepte" }) },
      DESIGN_FIELD,
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("다음 조건에 맞는 동영상 개요를 만들어 주세요.", "Create a Video Overview with the following requirements."),
        [
          L(T("길이", "Length"), c.duration),
          L(T("스타일", "Style"), c.style),
          L(T("강조할 주제", "Topics to emphasize"), c.focus),
          ...designLines(c),
          T("- 첫 30초 안에 이 영상에서 무엇을 배우는지 명확히 제시할 것",
            "- State clearly what viewers will learn within the first 30 seconds"),
          T("- 시각 자료(도식, 예시 화면)를 적극 활용하고, 나열식 낭독은 피할 것",
            "- Use visuals (diagrams, example screens) actively; avoid monotonously reading lists"),
        ],
        c,
        "narrate"
      );
    },
  },
  {
    id: "mindmap",
    name: B("마인드맵", "Mind Map", { ja: "マインドマップ", es: "Mapa mental", zh: "思维导图", fr: "Carte mentale", de: "Mindmap" }),
    icon: ic('<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="20" r="2"/><line x1="10.2" y1="10.6" x2="6.6" y2="7.4"/><line x1="13.8" y1="10.6" x2="17.4" y2="7.4"/><line x1="12" y1="14.5" x2="12" y2="18"/>'),
    note: B(
      "마인드맵에 맞춤설정란이 없으면, 이 프롬프트를 채팅창에 붙여넣어 계층 구조 개요를 먼저 받아 보세요.",
      "If the mind map has no customization box, paste this prompt into the chat to get a hierarchical outline first.",
      {
        ja: "マインドマップにカスタマイズ欄がない場合は、このプロンプトをチャットに貼り付けて階層アウトラインを先に受け取ってください。",
        es: "Si el mapa mental no tiene cuadro de personalización, pega este prompt en el chat para obtener primero un esquema jerárquico.",
        zh: "如果思维导图没有定制输入框,请将此提示词粘贴到聊天中,先获取层级大纲。",
        fr: "Si la carte mentale n'a pas de champ de personnalisation, collez ce prompt dans le chat pour obtenir d'abord un plan hiérarchique.",
        de: "Hat die Mindmap kein Anpassungsfeld, füge diesen Prompt in den Chat ein, um zuerst eine hierarchische Gliederung zu erhalten.",
      }
    ),
    fields: [
      { key: "root", label: B("중심 주제", "Central topic", { ja: "中心テーマ", es: "Tema central", zh: "中心主题", fr: "Thème central", de: "Zentrales Thema" }), type: "text", placeholder: B("예: 문서 전체의 핵심 주제", "e.g. the document's central theme", { ja: "例: 資料全体の中心テーマ", es: "p. ej. el tema central del documento", zh: "例:资料的核心主题", fr: "ex. le thème central du document", de: "z. B. das zentrale Thema des Dokuments" }) },
      {
        key: "depth", label: B("깊이", "Depth", { ja: "階層の深さ", es: "Profundidad", zh: "层级深度", fr: "Profondeur", de: "Tiefe" }), type: "select",
        options: [
          B("2단계 (대주제-소주제)", "2 levels (main → sub)", { ja: "2階層(大テーマ→サブ)", es: "2 niveles (principal → sub)", zh: "2层(主题→子主题)", fr: "2 niveaux (principal → sous)", de: "2 Ebenen (Haupt → Unter)" }),
          B("3단계", "3 levels", { ja: "3階層", es: "3 niveles", zh: "3层", fr: "3 niveaux", de: "3 Ebenen" }),
          B("4단계 이상 (세부 개념까지)", "4+ levels (down to details)", { ja: "4階層以上(詳細まで)", es: "4+ niveles (hasta el detalle)", zh: "4层以上(到细节)", fr: "4 niveaux et + (jusqu'au détail)", de: "4+ Ebenen (bis ins Detail)" }),
        ],
      },
      {
        key: "lens", label: B("구성 관점", "Perspective", { ja: "構成の観点", es: "Perspectiva", zh: "组织视角", fr: "Angle d'organisation", de: "Gliederungsperspektive" }), type: "select",
        options: [
          B("개념 위계 중심", "Concept hierarchy", { ja: "概念の階層中心", es: "Jerarquía de conceptos", zh: "概念层级", fr: "Hiérarchie des concepts", de: "Konzepthierarchie" }),
          B("시험 출제 포인트 중심", "Exam focus points", { ja: "試験の出題ポイント中心", es: "Puntos de examen", zh: "考点导向", fr: "Points d'examen", de: "Prüfungsschwerpunkte" }),
          B("프로젝트 작업 분해", "Project task breakdown", { ja: "プロジェクトのタスク分解", es: "Desglose de tareas de proyecto", zh: "项目任务分解", fr: "Découpage des tâches projet", de: "Projekt-Aufgabengliederung" }),
          B("원인-결과 관계 중심", "Cause & effect", { ja: "因果関係中心", es: "Causa y efecto", zh: "因果关系", fr: "Causes et effets", de: "Ursache & Wirkung" }),
        ],
      },
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("소스 내용을 마인드맵(계층 구조)으로 정리해 주세요.", "Organize the source content into a mind map (hierarchical structure)."),
        [
          L(T("중심 주제", "Central topic"), c.root),
          L(T("깊이", "Depth"), c.depth),
          L(T("구성 관점", "Perspective"), c.lens),
          T("- 각 가지의 이름은 소스에 실제로 등장하는 용어를 사용할 것",
            "- Name each branch using terms that actually appear in the sources"),
          T("- 같은 수준의 가지끼리는 분류 기준을 통일할 것",
            "- Keep one consistent classification criterion among sibling branches"),
        ],
        c
      );
    },
  },
  {
    id: "report",
    name: B("보고서", "Report", { ja: "レポート", es: "Informe", zh: "报告", fr: "Rapport", de: "Bericht" }),
    icon: ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>'),
    fields: [
      {
        key: "kind", label: B("문서 유형", "Document type", { ja: "文書タイプ", es: "Tipo de documento", zh: "文档类型", fr: "Type de document", de: "Dokumenttyp" }), type: "select",
        options: [
          B("핵심 요약 정리", "Key-points summary", { ja: "要点サマリー", es: "Resumen de puntos clave", zh: "要点总结", fr: "Synthèse des points clés", de: "Kernpunkte-Zusammenfassung" }),
          B("실무 브리핑", "Executive briefing", { ja: "エグゼクティブブリーフィング", es: "Briefing ejecutivo", zh: "高管简报", fr: "Briefing exécutif", de: "Executive Briefing" }),
          B("학습·참고 자료", "Study / reference material", { ja: "学習・参考資料", es: "Material de estudio / referencia", zh: "学习·参考资料", fr: "Support d'étude / référence", de: "Lern-/Referenzmaterial" }),
          B("시험 대비 정리", "Exam review notes", { ja: "試験対策ノート", es: "Apuntes para examen", zh: "备考笔记", fr: "Fiches de révision", de: "Prüfungsnotizen" }),
          B("안내문 초안", "Announcement draft", { ja: "案内文の下書き", es: "Borrador de aviso", zh: "通知草稿", fr: "Brouillon d'annonce", de: "Entwurf einer Mitteilung" }),
        ],
      },
      { key: "structure", label: B("원하는 목차", "Outline", { ja: "希望する構成", es: "Esquema deseado", zh: "期望结构", fr: "Plan souhaité", de: "Gewünschte Gliederung" }), type: "text", placeholder: B("예: 개요 → 핵심 내용 → 시사점", "e.g. overview → key points → implications", { ja: "例: 概要 → 要点 → 示唆", es: "p. ej. visión general → puntos clave → implicaciones", zh: "例:概述→要点→启示", fr: "ex. aperçu → points clés → implications", de: "z. B. Überblick → Kernpunkte → Fazit" }) },
      {
        key: "style", label: B("문체", "Writing style", { ja: "文体", es: "Estilo de redacción", zh: "文体", fr: "Style d'écriture", de: "Schreibstil" }), type: "select",
        options: [
          B("개조식(~함, ~임)", "Terse bullet style", { ja: "箇条書き(簡潔体)", es: "Viñetas concisas", zh: "简洁条列体", fr: "Puces concises", de: "Knapper Stichpunktstil" }),
          B("서술식", "Narrative prose", { ja: "文章体", es: "Prosa narrativa", zh: "叙述体", fr: "Prose rédigée", de: "Fließtext" }),
          B("친근한 설명체", "Friendly explanatory tone", { ja: "親しみやすい解説体", es: "Tono cercano y explicativo", zh: "亲切讲解体", fr: "Ton pédagogique et convivial", de: "Freundlich erklärend" }),
        ],
      },
      { key: "length", label: B("분량", "Length", { ja: "分量", es: "Extensión", zh: "篇幅", fr: "Longueur", de: "Umfang" }), type: "text", placeholder: B("예: A4 2장 이내", "e.g. within 2 pages", { ja: "例: A4 2枚以内", es: "p. ej. máximo 2 páginas", zh: "例:A4两页以内", fr: "ex. 2 pages max", de: "z. B. max. 2 Seiten" }) },
      DESIGN_FIELD,
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("다음 조건에 맞는 보고서를 작성해 주세요.", "Write a report with the following requirements."),
        [
          L(T("문서 유형", "Document type"), c.kind),
          L(T("목차 구성", "Outline"), c.structure),
          L(T("문체", "Writing style"), c.style),
          L(T("분량", "Length"), c.length),
          ...designLines(c, "doc"),
          T("- 소스에 근거한 내용만 쓰고, 주요 내용에는 출처(어느 소스인지)를 표시할 것",
            "- Use only source-grounded content and cite which source each key point comes from"),
        ],
        c
      );
    },
  },
  {
    id: "flashcards",
    name: B("플래시카드", "Flashcards", { ja: "フラッシュカード", es: "Tarjetas de memoria", zh: "抽认卡", fr: "Cartes mémo", de: "Karteikarten" }),
    icon: ic('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    fields: [
      { key: "count", label: B("카드 수", "Number of cards", { ja: "カード数", es: "Número de tarjetas", zh: "卡片数量", fr: "Nombre de cartes", de: "Kartenanzahl" }), type: "number", placeholder: B("20", "20", { ja: "20", es: "20", zh: "20", fr: "20", de: "20" }) },
      {
        key: "form", label: B("카드 형식", "Card format", { ja: "カード形式", es: "Formato de tarjeta", zh: "卡片形式", fr: "Format des cartes", de: "Kartenformat" }), type: "select",
        options: [
          B("용어 → 정의", "Term → definition", { ja: "用語 → 定義", es: "Término → definición", zh: "术语→定义", fr: "Terme → définition", de: "Begriff → Definition" }),
          B("질문 → 답", "Question → answer", { ja: "質問 → 答え", es: "Pregunta → respuesta", zh: "问题→答案", fr: "Question → réponse", de: "Frage → Antwort" }),
          B("빈칸 채우기 혼합", "Mixed with fill-in-the-blank", { ja: "穴埋め混合", es: "Mixto con huecos", zh: "混合填空", fr: "Mixte avec textes à trous", de: "Gemischt mit Lückentext" }),
        ],
      },
      {
        key: "difficulty", label: B("난이도", "Difficulty", { ja: "難易度", es: "Dificultad", zh: "难度", fr: "Difficulté", de: "Schwierigkeit" }), type: "select",
        options: [
          B("기초 용어 위주", "Basic terms", { ja: "基礎用語中心", es: "Términos básicos", zh: "基础术语为主", fr: "Termes de base", de: "Grundbegriffe" }),
          B("기초 + 응용 혼합", "Basic + applied mix", { ja: "基礎+応用ミックス", es: "Mezcla básico + aplicado", zh: "基础+应用混合", fr: "Base + application", de: "Basis + Anwendung" }),
          B("심화 포함", "Including advanced", { ja: "発展内容を含む", es: "Incluye avanzado", zh: "包含进阶", fr: "Avec notions avancées", de: "Inkl. Fortgeschrittenem" }),
        ],
      },
      { key: "scope", label: B("범위 제한", "Scope", { ja: "範囲指定", es: "Alcance", zh: "范围限定", fr: "Périmètre", de: "Umfangsbegrenzung" }), type: "text", placeholder: B("예: 3장 핵심 용어만", "e.g. chapter 3 key terms only", { ja: "例: 第3章の重要用語のみ", es: "p. ej. solo términos clave del cap. 3", zh: "例:仅第3章核心术语", fr: "ex. termes clés du chap. 3 uniquement", de: "z. B. nur Schlüsselbegriffe aus Kap. 3" }) },
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("다음 조건에 맞는 플래시카드를 만들어 주세요.", "Create flashcards with the following requirements."),
        [
          L(T("카드 수", "Number of cards"), t(c.count) ? T(`${t(c.count)}장`, `${t(c.count)} cards`) : ""),
          L(T("형식", "Format"), c.form),
          L(T("난이도", "Difficulty"), c.difficulty),
          L(T("범위", "Scope"), c.scope),
          T("- 앞면은 짧고 명확하게, 뒷면은 핵심만 2~3문장 이내로 쓸 것",
            "- Keep fronts short and clear; keep backs to 2–3 essential sentences"),
          T("- 서로 헷갈리기 쉬운 개념은 짝지어 연달아 배치할 것",
            "- Place easily-confused concepts back to back as pairs"),
        ],
        c
      );
    },
  },
  {
    id: "quiz",
    name: B("퀴즈", "Quiz", { ja: "クイズ", es: "Cuestionario", zh: "测验", fr: "Quiz", de: "Quiz" }),
    icon: ic('<circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4"/><line x1="12" y1="17.5" x2="12.01" y2="17.5"/>'),
    fields: [
      { key: "count", label: B("문항 수", "Number of questions", { ja: "問題数", es: "Número de preguntas", zh: "题目数量", fr: "Nombre de questions", de: "Fragenanzahl" }), type: "number", placeholder: B("10", "10", { ja: "10", es: "10", zh: "10", fr: "10", de: "10" }) },
      {
        key: "types", label: B("문항 유형", "Question types", { ja: "問題形式", es: "Tipos de pregunta", zh: "题型", fr: "Types de questions", de: "Fragetypen" }), type: "select",
        options: [
          B("선다형 위주", "Mostly multiple-choice", { ja: "選択式中心", es: "Mayormente opción múltiple", zh: "以选择题为主", fr: "Surtout QCM", de: "Überwiegend Multiple-Choice" }),
          B("선다형 + 단답형 혼합", "Multiple-choice + short answer", { ja: "選択式+短答式", es: "Opción múltiple + respuesta corta", zh: "选择+简答", fr: "QCM + réponses courtes", de: "Multiple-Choice + Kurzantwort" }),
          B("OX + 선다형 혼합", "True/false + multiple-choice", { ja: "○×+選択式", es: "Verdadero/falso + opción múltiple", zh: "判断+选择", fr: "Vrai/faux + QCM", de: "Richtig/Falsch + Multiple-Choice" }),
          B("서술형 포함", "Including open-ended", { ja: "記述式を含む", es: "Incluye preguntas abiertas", zh: "包含开放题", fr: "Avec questions ouvertes", de: "Inkl. offener Fragen" }),
        ],
      },
      {
        key: "difficulty", label: B("난이도 배분", "Difficulty mix", { ja: "難易度配分", es: "Mezcla de dificultad", zh: "难度分布", fr: "Répartition de difficulté", de: "Schwierigkeitsmix" }), type: "select",
        options: [
          B("기초 위주", "Mostly basic", { ja: "基礎中心", es: "Mayormente básico", zh: "以基础为主", fr: "Surtout basique", de: "Überwiegend Basis" }),
          B("기본 70% + 응용 30%", "70% basic + 30% applied", { ja: "基礎70%+応用30%", es: "70 % básico + 30 % aplicado", zh: "基础70%+应用30%", fr: "70 % base + 30 % application", de: "70 % Basis + 30 % Anwendung" }),
          B("응용·심화 위주", "Mostly applied/advanced", { ja: "応用・発展中心", es: "Mayormente aplicado/avanzado", zh: "以应用·进阶为主", fr: "Surtout appliqué/avancé", de: "Überwiegend Anwendung/Fortgeschritten" }),
        ],
      },
      { key: "misconception", label: B("오답 선택지에 흔한 오개념 반영", "Base distractors on common misconceptions", { ja: "誤答選択肢によくある誤解を反映", es: "Distractores basados en errores comunes", zh: "错误选项反映常见误解", fr: "Distracteurs fondés sur les idées reçues", de: "Falschantworten aus typischen Missverständnissen" }), type: "checkbox" },
      { key: "explanation", label: B("문항별 해설 포함", "Include explanations per question", { ja: "各問題に解説を付ける", es: "Incluir explicación por pregunta", zh: "每题附解析", fr: "Explication pour chaque question", de: "Erklärung je Frage" }), type: "checkbox" },
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("다음 조건에 맞는 퀴즈를 출제해 주세요.", "Create a quiz with the following requirements."),
        [
          L(T("문항 수", "Number of questions"), t(c.count) ? T(`총 ${t(c.count)}문항`, `${t(c.count)} questions in total`) : ""),
          L(T("문항 유형", "Question types"), c.types),
          L(T("난이도 배분", "Difficulty mix"), c.difficulty),
          c.misconception
            ? T("- 오답 선택지는 학습자가 실제로 자주 하는 오개념을 반영해 만들 것",
                "- Craft wrong-answer options from misconceptions learners actually have")
            : "",
          c.explanation
            ? T("- 각 문항에 정답 근거와 해설을 함께 제시할 것",
                "- Provide the rationale and an explanation with each question")
            : "",
          T("- 소스에 없는 내용은 출제하지 말 것", "- Do not test anything not covered in the sources"),
          T("- 문항 간 난이도가 점진적으로 올라가도록 배치할 것", "- Order questions from easier to harder"),
        ],
        c
      );
    },
  },
  {
    id: "infographic",
    name: B("인포그래픽", "Infographic", { ja: "インフォグラフィック", es: "Infografía", zh: "信息图", fr: "Infographie", de: "Infografik" }),
    icon: ic('<line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="9"/><line x1="3" y1="20" x2="21" y2="20"/>'),
    note: B(
      "이미지 생성 특성상 한글이 간혹 깨질 수 있어요. 깨지면 같은 프롬프트로 다시 생성하는 것이 가장 효과적입니다.",
      "Image generation can occasionally garble text. If that happens, regenerating with the same prompt is the most effective fix.",
      {
        ja: "画像生成の特性上、文字が崩れることがあります。その場合は同じプロンプトで再生成するのが最も効果的です。",
        es: "La generación de imágenes puede distorsionar el texto a veces. Si ocurre, lo más eficaz es regenerar con el mismo prompt.",
        zh: "图像生成有时会出现文字变形。此时用同一提示词重新生成最有效。",
        fr: "La génération d'images peut parfois altérer le texte. Le cas échéant, régénérer avec le même prompt est le plus efficace.",
        de: "Bei der Bildgenerierung kann Text gelegentlich fehlerhaft dargestellt werden. Dann hilft es am besten, mit demselben Prompt neu zu generieren.",
      }
    ),
    fields: [
      {
        key: "style", label: B("구성 방식", "Layout", { ja: "構成", es: "Estructura", zh: "版式", fr: "Structure", de: "Aufbau" }), type: "select",
        options: [
          B("프로세스·단계형", "Process / steps", { ja: "プロセス・ステップ型", es: "Proceso / pasos", zh: "流程·步骤型", fr: "Processus / étapes", de: "Prozess / Schritte" }),
          B("비교형", "Comparison", { ja: "比較型", es: "Comparativa", zh: "对比型", fr: "Comparaison", de: "Vergleich" }),
          B("타임라인형", "Timeline", { ja: "タイムライン型", es: "Cronología", zh: "时间线型", fr: "Chronologie", de: "Zeitstrahl" }),
          B("통계·수치 중심", "Stats & numbers", { ja: "統計・数値中心", es: "Estadísticas y cifras", zh: "统计·数据型", fr: "Statistiques et chiffres", de: "Statistik & Zahlen" }),
        ],
      },
      { key: "emphasis", label: B("강조할 핵심", "Key emphasis", { ja: "強調ポイント", es: "Puntos a destacar", zh: "强调重点", fr: "Points à souligner", de: "Zentrale Aussagen" }), type: "text", placeholder: B("예: 3가지 핵심 원리, 주요 수치", "e.g. 3 core principles, key figures", { ja: "例: 3つの原則、主要数値", es: "p. ej. 3 principios clave, cifras principales", zh: "例:3大原则、关键数据", fr: "ex. 3 principes clés, chiffres majeurs", de: "z. B. 3 Grundprinzipien, Kernzahlen" }) },
      {
        key: "textAmount", label: B("텍스트 양", "Text amount", { ja: "テキスト量", es: "Cantidad de texto", zh: "文字量", fr: "Quantité de texte", de: "Textmenge" }), type: "select",
        options: [
          B("텍스트 최소화(도식 위주)", "Minimal text (diagram-first)", { ja: "テキスト最小(図中心)", es: "Texto mínimo (prioridad al diagrama)", zh: "文字最少(以图为主)", fr: "Texte minimal (schéma d'abord)", de: "Minimaler Text (Diagramm zuerst)" }),
          B("보통(짧은 설명 포함)", "Moderate (short captions)", { ja: "標準(短い説明付き)", es: "Moderado (con breves notas)", zh: "适中(含简短说明)", fr: "Modéré (courtes légendes)", de: "Moderat (kurze Hinweise)" }),
        ],
      },
      DESIGN_FIELD,
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("다음 조건에 맞는 인포그래픽을 만들어 주세요.", "Create an infographic with the following requirements."),
        [
          L(T("구성 방식", "Layout"), c.style),
          L(T("강조할 핵심", "Key emphasis"), c.emphasis),
          L(T("텍스트 양", "Text amount"), c.textAmount),
          ...designLines(c),
          T("- 한글 표기(가장 중요): 모든 텍스트는 정확한 한국어 단어로만, 또렷한 고딕체로 표기할 것. 글자가 뭉개지거나 깨진 자형, 존재하지 않는 글자가 있으면 안 됨",
            "- Text accuracy (critical): render all text as real, correctly-spelled words in a clean sans-serif; no garbled, distorted, or invented glyphs"),
          T("- 긴 문장 대신 짧은 키워드를 크게 표기할 것 (작은 글씨일수록 글자가 깨지기 쉬움)",
            "- Prefer short, large keywords over long sentences (small text garbles more easily)"),
          T("- 한눈에 전체 구조가 보이도록 정보를 3~5개 덩어리로 묶을 것",
            "- Group information into 3–5 chunks so the overall structure reads at a glance"),
        ],
        c
      );
    },
  },
  {
    id: "table",
    name: B("데이터 표", "Data Table", { ja: "データ表", es: "Tabla de datos", zh: "数据表", fr: "Tableau de données", de: "Datentabelle" }),
    icon: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="10" x2="9" y2="20"/><line x1="15" y1="10" x2="15" y2="20"/>'),
    fields: [
      {
        key: "goal", label: B("표의 목적", "Table purpose", { ja: "表の目的", es: "Propósito de la tabla", zh: "表格用途", fr: "But du tableau", de: "Zweck der Tabelle" }), type: "select",
        options: [
          B("항목 간 비교", "Compare items", { ja: "項目の比較", es: "Comparar elementos", zh: "项目对比", fr: "Comparer des éléments", de: "Elemente vergleichen" }),
          B("핵심 내용 요약", "Summarize key content", { ja: "要点の整理", es: "Resumir lo esencial", zh: "要点汇总", fr: "Résumer l'essentiel", de: "Kernpunkte zusammenfassen" }),
          B("체크리스트", "Checklist", { ja: "チェックリスト", es: "Lista de verificación", zh: "清单", fr: "Check-list", de: "Checkliste" }),
          B("일정·계획 정리", "Schedule / plan", { ja: "スケジュール・計画", es: "Calendario / plan", zh: "日程·计划", fr: "Calendrier / plan", de: "Zeitplan / Planung" }),
        ],
      },
      { key: "rows", label: B("행 기준", "Rows", { ja: "行の基準", es: "Filas", zh: "行", fr: "Lignes", de: "Zeilen" }), type: "text", placeholder: B("예: 항목·유형별로 한 행", "e.g. one row per item or type", { ja: "例: 項目・種類ごとに1行", es: "p. ej. una fila por elemento o tipo", zh: "例:每个项目/类型一行", fr: "ex. une ligne par élément ou type", de: "z. B. eine Zeile je Element oder Typ" }) },
      { key: "cols", label: B("열 구성", "Columns", { ja: "列の構成", es: "Columnas", zh: "列", fr: "Colonnes", de: "Spalten" }), type: "text", placeholder: B("예: 정의 / 특징 / 장단점 / 예시", "e.g. definition / features / pros & cons / example", { ja: "例: 定義 / 特徴 / 長所短所 / 例", es: "p. ej. definición / rasgos / pros y contras / ejemplo", zh: "例:定义/特点/优缺点/示例", fr: "ex. définition / caractéristiques / avantages-inconvénients / exemple", de: "z. B. Definition / Merkmale / Vor-/Nachteile / Beispiel" }) },
      { key: "sort", label: B("정렬 기준", "Sort order", { ja: "並び順", es: "Orden", zh: "排序", fr: "Tri", de: "Sortierung" }), type: "text", placeholder: B("예: 등장 순서, 난이도 순", "e.g. order of appearance, by difficulty", { ja: "例: 登場順、難易度順", es: "p. ej. orden de aparición, por dificultad", zh: "例:出现顺序、按难度", fr: "ex. ordre d'apparition, par difficulté", de: "z. B. Reihenfolge im Text, nach Schwierigkeit" }) },
      DESIGN_FIELD,
    ],
    build(c) {
      const T = (ko, en) => (langOf(c) === "en" ? en : ko);
      return assemble(
        T("소스 내용을 다음 조건의 표로 정리해 주세요.", "Organize the source content into a table with the following requirements."),
        [
          L(T("표의 목적", "Table purpose"), c.goal),
          L(T("행 기준", "Rows"), c.rows),
          L(T("열 구성", "Columns"), c.cols),
          L(T("정렬 기준", "Sort order"), c.sort),
          ...designLines(c, "table"),
          T("- 셀 내용은 한 줄 요약 수준으로 간결하게 쓸 것", "- Keep each cell to a one-line summary"),
          T("- 소스에서 확인되지 않는 칸은 비워 두고 임의로 채우지 말 것",
            "- Leave cells blank rather than inventing unverified content"),
        ],
        c
      );
    },
  },
];
