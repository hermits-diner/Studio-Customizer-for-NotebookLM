// 툴바 아이콘 클릭 시 사이드 패널 열기 + 원격 셀렉터 설정 제공

"use strict";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((e) => console.error(e));

// NotebookLM DOM 셀렉터 원격 설정 — UI 변경 시 저장소의 selectors.json만 고치면 된다.
// GitHub raw는 CORS(Access-Control-Allow-Origin: *)를 허용하므로 host 권한이 필요 없다
// (설치 시 권한 경고를 줄이기 위해 manifest에서 제거).
const SELECTORS_URL =
  "https://raw.githubusercontent.com/hermits-diner/Studio-Customizer-for-NotebookLM/main/selectors.json";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

async function getSelectors() {
  const { selectorsCache } = await chrome.storage.local.get("selectorsCache");
  if (selectorsCache && Date.now() - selectorsCache.at < CACHE_TTL) {
    return selectorsCache.data;
  }
  try {
    const res = await fetch(SELECTORS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    await chrome.storage.local.set({ selectorsCache: { at: Date.now(), data } });
    return data;
  } catch (e) {
    return selectorsCache ? selectorsCache.data : null;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "getSelectors") {
    getSelectors()
      .then((s) => sendResponse({ selectors: s }))
      .catch(() => sendResponse({ selectors: null }));
    return true; // async response
  }
});
