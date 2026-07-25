// NotebookLM 페이지에서 맞춤설정 입력란을 찾아 프롬프트를 삽입하는 콘텐츠 스크립트.
// 셀렉터는 원격 설정(selectors.json)으로 갱신 가능 — NotebookLM UI가 바뀌어도
// 스토어 재심사 없이 대응할 수 있다. 원격 설정 실패 시 내장 기본값 사용.

"use strict";

const FALLBACK_SELECTORS = {
  // 신뢰도 높은 순서 — 다이얼로그/사이드시트 내부의 입력란
  textareas: [
    "[role='dialog'] textarea",
    "mat-dialog-container textarea",
    "mat-bottom-sheet-container textarea",
    "mat-sidenav textarea",
  ],
  // 위에서 못 찾았을 때만 시도하는 광범위 폴백 — 제외 규칙을 통과해야 사용
  fallbackTextareas: ["textarea"],
  // 채팅 입력창 등 맞춤설정란이 아닌 곳
  excludeSelectors: ["query-box textarea", ".query-box textarea", "chat-panel textarea"],
  // placeholder/aria-label에 이 단어가 있으면 채팅창으로 보고 제외 (NotebookLM UI 언어별)
  excludePlaceholderWords: ["질문", "ask", "質問", "提问", "pregunta", "question", "frage", "poser"],
  // 맞춤설정 다이얼로그 제목 — 산출물 유형 자동 감지에 사용
  headings: [
    "[role='dialog'] h1, [role='dialog'] h2, [role='dialog'] h3",
    "mat-dialog-container h1, mat-dialog-container h2, mat-dialog-container h3",
    "mat-bottom-sheet-container h1, mat-bottom-sheet-container h2",
    "mat-sidenav h1, mat-sidenav h2",
  ],
};

// 맞춤설정란이 들어 있는 컨테이너 — 이 안에서 찾은 입력란만 확신(confident) 판정
const CONTAINER_SEL =
  "[role='dialog'], mat-dialog-container, mat-bottom-sheet-container, mat-sidenav";

let SELECTORS = FALLBACK_SELECTORS;

try {
  chrome.runtime.sendMessage({ type: "getSelectors" }, (res) => {
    // service worker 미기동 등으로 실패해도 기본값으로 동작
    if (chrome.runtime.lastError) return;
    if (res && res.selectors && typeof res.selectors === "object") {
      // 원격 설정에 없는 키는 내장 기본값 유지
      SELECTORS = { ...FALLBACK_SELECTORS, ...res.selectors };
    }
  });
} catch (e) {
  // ignore — fallback 사용
}

function isVisible(el) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

// 채팅 입력창 등 맞춤설정란이 아닌 입력란 제외
function isExcluded(el) {
  for (const sel of SELECTORS.excludeSelectors || []) {
    try {
      if (el.matches(sel) || el.closest(sel)) return true;
    } catch (e) {
      continue; // 잘못된 원격 셀렉터 방어
    }
  }
  // 다이얼로그 밖 입력란에만 placeholder 키워드 제외 적용
  // (퀴즈 맞춤설정란 placeholder에 "questions"가 들어가는 오탐 방지)
  if (!el.closest(CONTAINER_SEL)) {
    const hint = (
      (el.placeholder || "") + " " + (el.getAttribute("aria-label") || "")
    ).toLowerCase();
    for (const w of SELECTORS.excludePlaceholderWords || []) {
      if (w && hint.includes(String(w).toLowerCase())) return true;
    }
  }
  return false;
}

// 화면에 보이는 마지막(=가장 최근에 열린) 입력란을 대상으로 삼는다.
// confident: 다이얼로그/사이드시트 내부에서 찾은 경우 — 맞춤설정란일 확률이 높다
function findTextarea() {
  const scan = (sels) => {
    for (const sel of sels || []) {
      let els = [];
      try {
        els = [...document.querySelectorAll(sel)].filter(isVisible).filter((el) => !isExcluded(el));
      } catch (e) {
        continue; // 원격 설정의 잘못된 셀렉터 방어
      }
      if (els.length) return els[els.length - 1];
    }
    return null;
  };
  const el = scan(SELECTORS.textareas) || scan(SELECTORS.fallbackTextareas);
  if (!el) return null;
  return { el, confident: !!el.closest(CONTAINER_SEL) };
}

// 열려 있는 맞춤설정 다이얼로그의 제목 — 패널이 산출물 유형 자동 선택에 사용
function dialogHeading() {
  for (const sel of SELECTORS.headings || []) {
    let els = [];
    try {
      els = [...document.querySelectorAll(sel)].filter(isVisible);
    } catch (e) {
      continue;
    }
    if (els.length) return els[els.length - 1].textContent.trim().slice(0, 120);
  }
  return "";
}

// 노트북 제목 — DOM 셀렉터 없이 탭 제목("<노트북 이름> - NotebookLM")에서 추출
function notebookTitle() {
  const t = document.title || "";
  const cleaned = t.replace(/\s*[-–—|·]\s*(NotebookLM|Gemini Notebook)\s*$/i, "").trim();
  if (!cleaned || /^(NotebookLM|Gemini Notebook)$/i.test(cleaned)) return "";
  return cleaned.slice(0, 80);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "insertPrompt") {
    const found = findTextarea();
    if (!found) {
      sendResponse({ ok: false, reason: "no-box" });
      return;
    }
    const ta = found.el;
    // 프레임워크(Angular)의 값 추적을 우회하지 않도록 네이티브 setter + input 이벤트 사용
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    ).set;
    setter.call(ta, msg.text);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    ta.dispatchEvent(new Event("change", { bubbles: true }));
    ta.focus();
    // 어디에 들어갔는지 1초간 시각적으로 표시
    try {
      const prev = ta.style.boxShadow;
      ta.style.boxShadow = "0 0 0 2px #2da05a";
      setTimeout(() => {
        ta.style.boxShadow = prev;
      }, 1200);
    } catch (e) {
      // 스타일 실패는 무시
    }
    sendResponse({ ok: true, confident: found.confident, heading: dialogHeading() });
  } else if (msg && msg.type === "getStatus") {
    const found = findTextarea();
    sendResponse({
      ok: true,
      hasBox: !!(found && found.confident),
      anyBox: !!found,
      heading: dialogHeading(),
      notebook: notebookTitle(),
      url: location.href,
    });
  } else if (msg && msg.type === "ping") {
    sendResponse({ ok: true });
  }
});
