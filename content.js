// NotebookLM 페이지에서 맞춤설정 입력란을 찾아 프롬프트를 삽입하는 콘텐츠 스크립트.
// 셀렉터는 원격 설정(selectors.json)으로 갱신 가능 — NotebookLM UI가 바뀌어도
// 스토어 재심사 없이 대응할 수 있다. 원격 설정 실패 시 내장 기본값 사용.

"use strict";

const FALLBACK_SELECTORS = {
  textareas: [
    "[role='dialog'] textarea",
    "mat-dialog-container textarea",
    "mat-sidenav textarea",
    "textarea",
  ],
};

let SELECTORS = FALLBACK_SELECTORS;

try {
  chrome.runtime.sendMessage({ type: "getSelectors" }, (res) => {
    // service worker 미기동 등으로 실패해도 기본값으로 동작
    if (chrome.runtime.lastError) return;
    if (res && res.selectors && Array.isArray(res.selectors.textareas)) {
      SELECTORS = res.selectors;
    }
  });
} catch (e) {
  // ignore — fallback 사용
}

function isVisible(el) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

// 화면에 보이는 마지막(=가장 최근에 열린) 입력란을 대상으로 삼는다
function findTextarea() {
  for (const sel of SELECTORS.textareas) {
    let els = [];
    try {
      els = [...document.querySelectorAll(sel)].filter(isVisible);
    } catch (e) {
      continue; // 원격 설정의 잘못된 셀렉터 방어
    }
    if (els.length) return els[els.length - 1];
  }
  return null;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "insertPrompt") {
    const ta = findTextarea();
    if (!ta) {
      sendResponse({ ok: false, reason: "no-box" });
      return;
    }
    // 프레임워크(Angular)의 값 추적을 우회하지 않도록 네이티브 setter + input 이벤트 사용
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    ).set;
    setter.call(ta, msg.text);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    ta.dispatchEvent(new Event("change", { bubbles: true }));
    ta.focus();
    sendResponse({ ok: true });
  } else if (msg && msg.type === "ping") {
    sendResponse({ ok: true });
  }
});
