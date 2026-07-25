// 로케일·셀렉터 설정·manifest 검증 — node tests/checks.js
// (스토어 업로드가 거부되는 실수를 CI에서 잡는다: extDesc 132자 초과 등)

"use strict";

const fs = require("fs");
const path = require("path");

let fail = 0;
const err = (m) => {
  fail++;
  console.error(`  FAIL: ${m}`);
};

const root = path.join(__dirname, "..");
const readJson = (p) =>
  JSON.parse(fs.readFileSync(path.join(root, p), "utf8").replace(/^﻿/, ""));

// --- _locales: 전 로케일 JSON 파싱 + 스토어 설명 한도(132자) ---
const UI_LOCALES = ["ko", "en", "ja", "es", "zh_CN", "fr", "de"];
const locales = fs.readdirSync(path.join(root, "_locales"));
for (const loc of UI_LOCALES) {
  if (!locales.includes(loc)) err(`_locales/${loc} 없음`);
}
for (const dir of locales) {
  let m;
  try {
    m = readJson(path.join("_locales", dir, "messages.json"));
  } catch (e) {
    err(`_locales/${dir}: JSON 파싱 실패 — ${e.message}`);
    continue;
  }
  if (!m.extDesc || !m.extDesc.message) {
    err(`_locales/${dir}: extDesc 없음`);
  } else {
    const len = [...m.extDesc.message].length;
    if (len > 132) err(`_locales/${dir}: extDesc ${len}자 — Chrome Web Store 한도 132자 초과`);
  }
  if (!m.actionTitle || !m.actionTitle.message) err(`_locales/${dir}: actionTitle 없음`);
}

// --- selectors.json: content.js가 기대하는 스키마 ---
const sel = readJson("selectors.json");
for (const key of [
  "textareas",
  "fallbackTextareas",
  "excludeSelectors",
  "excludePlaceholderWords",
  "headings",
]) {
  if (!Array.isArray(sel[key]) || !sel[key].every((s) => typeof s === "string" && s.length)) {
    err(`selectors.json: ${key}는 비어 있지 않은 문자열 배열이어야 함`);
  }
}

// --- manifest ---
const manifest = readJson("manifest.json");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) err(`manifest: version 형식 이상 (${manifest.version})`);
if ((manifest.host_permissions || []).some((h) => h.includes("raw.githubusercontent"))) {
  err("manifest: raw.githubusercontent host 권한 불필요 (GitHub raw는 CORS 허용) — 설치 경고만 늘림");
}

console.log(fail ? `\n${fail} failed` : "checks OK");
process.exit(fail ? 1 : 0);
