// 템플릿 엔진 단위 테스트 — node tests/run.js
// templates.js는 브라우저 전역 스크립트라 vm 컨텍스트에서 평가한 뒤 검사한다.

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const code = fs.readFileSync(path.join(__dirname, "..", "sidepanel", "templates.js"), "utf8");
const ctx = { console };
vm.createContext(ctx);
// 최상위 const는 컨텍스트 객체에 붙지 않으므로 명시적으로 내보낸다
vm.runInContext(code + "\n;this.__x = { OUTPUT_TYPES, DESIGN_STYLES, DESIGN_FIELD };", ctx);
const { OUTPUT_TYPES, DESIGN_STYLES, DESIGN_FIELD } = ctx.__x;

let pass = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.error(`  FAIL: ${name}`);
  }
}

// --- 구조 ---
check("9개 산출물", OUTPUT_TYPES.length === 9);
check("id 중복 없음", new Set(OUTPUT_TYPES.map((t) => t.id)).size === 9);
check("모든 유형에 한/영 이름", OUTPUT_TYPES.every((t) => t.name.ko && t.name.en));
check("모든 유형에 SVG 아이콘", OUTPUT_TYPES.every((t) => t.icon && t.icon.startsWith("<svg")));

for (const type of OUTPUT_TYPES) {
  for (const f of type.fields) {
    check(`${type.id}.${f.key} 라벨 한/영`, !!(f.label.ko && f.label.en));
    if (f.type === "select") {
      check(`${type.id}.${f.key} 옵션 한/영`, f.options.every((o) => o.ko && o.en));
    }
  }
}

// --- 빌드: 한국어 ---
for (const type of OUTPUT_TYPES) {
  const out = type.build({ language: "한국어" });
  check(`${type.id} ko 빌드 결과 있음`, typeof out === "string" && out.length > 20);
  check(`${type.id} ko 한국어 포함`, /[가-힣]/.test(out));
}

// --- 빌드: 영어 (빈 입력 시 한글이 전혀 없어야 함) ---
for (const type of OUTPUT_TYPES) {
  const out = type.build({ language: "영어" });
  check(`${type.id} en 빌드에 한글 없음`, !/[가-힣]/.test(out));
}

// --- 공통 필드 반영 ---
{
  const out = OUTPUT_TYPES.find((t) => t.id === "quiz").build({
    language: "한국어",
    audience: "테스트대상",
    purpose: "테스트목적",
    context: "테스트맥락",
    count: "10",
    misconception: true,
    explanation: true,
  });
  check("퀴즈: 대상 반영", out.includes("테스트대상"));
  check("퀴즈: 문항 수 반영", out.includes("총 10문항"));
  check("퀴즈: 오개념 옵션 반영", out.includes("오개념"));
  check("퀴즈: 해설 옵션 반영", out.includes("해설"));
  check("퀴즈: 추가 맥락 말미 배치", out.trim().endsWith("테스트맥락"));
}

// --- 디자인 스타일 ---
check("디자인 기본값 존재", !!DESIGN_STYLES[DESIGN_FIELD.default]);
check("디자인 스타일 9종", Object.keys(DESIGN_STYLES).length === 9);
check("디자인 스타일 영문명 모두 존재", Object.values(DESIGN_STYLES).every((s) => typeof s.en === "string" && s.en.length > 0));
check(
  "모든 디자인 스타일에 screen/doc/table",
  Object.values(DESIGN_STYLES).every((s) => s.screen && s.doc && s.table)
);
{
  const slides = OUTPUT_TYPES.find((t) => t.id === "slides");
  const out = slides.build({ language: "한국어", design: DESIGN_FIELD.default });
  check("슬라이드: 디자인 지시문 포함", out.includes("미니멀"));
  const none = slides.build({ language: "한국어", design: "" });
  check("슬라이드: 디자인 미선택 시 지시문 없음", !none.includes("미니멀"));
}

// --- 인포그래픽 한글 보호 ---
{
  const info = OUTPUT_TYPES.find((t) => t.id === "infographic");
  check("인포그래픽: 한글 표기 규칙 상시 포함", info.build({ language: "한국어" }).includes("한글 표기"));
  check("인포그래픽 en: 텍스트 정확성 규칙", info.build({ language: "영어" }).includes("Text accuracy"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
