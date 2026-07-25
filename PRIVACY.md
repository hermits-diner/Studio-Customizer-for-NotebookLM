# Privacy Policy — Studio Customizer for NotebookLM

_Last updated: 2026-07-25_

## English

**Studio Customizer for NotebookLM** ("the extension") is designed to be local-first.

**Data we collect: none.** The extension has no analytics, no tracking, and no server of its own.

**Where your data lives:**

- Your inputs (audience, purpose, context, presets, history) are stored in your browser's
  extension storage (`chrome.storage`). Presets sync across your own Chrome profile via
  Chrome's built-in sync; everything else stays on your device.
- Your Gemini API key, if you choose to add one, is stored only in local extension storage
  on your device. It is never transmitted anywhere except directly to Google's API.

**Network requests the extension makes:**

1. **Google Gemini API** (`generativelanguage.googleapis.com`) — only when you click
   "AI refine", the current prompt text is sent to Google using your own API key.
   This is opt-in; without a key, the extension makes no such request.
   Google's handling of that data is governed by the
   [Google API Terms](https://developers.google.com/terms) and
   [Gemini API terms](https://ai.google.dev/gemini-api/terms).
2. **Selector configuration** (`raw.githubusercontent.com`) — a small JSON file describing
   NotebookLM's UI structure is fetched so the "Insert" feature keeps working when
   NotebookLM's interface changes. No user data is sent; this is a plain download.

**Permissions:**

- `notebooklm.google.com` access — used only to insert your prompt into the customization
  box when you click "Insert". The extension does not read your notebook contents.
- `storage` — saving your settings, presets, and history locally.
- `clipboardWrite` — the "Copy" button.
- `scripting` — injecting the insert helper into an already-open NotebookLM tab.

**Contact:** hermitsdiner@gmail.com

## 한국어

**Studio Customizer for NotebookLM**(이하 "확장")은 로컬 우선으로 설계되었습니다.

**수집하는 데이터: 없음.** 자체 서버·분석·추적 코드가 없습니다.

**데이터 저장 위치:**

- 입력 내용(대상·목적·맥락·프리셋·히스토리)은 브라우저 확장 저장소(`chrome.storage`)에
  저장됩니다. 프리셋은 본인 Chrome 프로필의 기본 동기화를 통해서만 동기화되며,
  그 외에는 기기에만 저장됩니다.
- Gemini API 키를 등록한 경우, 키는 이 기기의 로컬 저장소에만 저장되며
  Google API 외의 어디로도 전송되지 않습니다.

**확장이 수행하는 네트워크 요청:**

1. **Google Gemini API** — "AI 다듬기" 버튼을 누른 순간에만, 현재 프롬프트 텍스트가
   본인의 API 키로 Google에 전송됩니다. 키가 없으면 이 요청은 발생하지 않습니다.
2. **셀렉터 설정 파일** — NotebookLM UI 변경에 대응하기 위한 작은 JSON 파일을
   GitHub에서 내려받습니다. 사용자 데이터는 전송되지 않습니다.

**권한 사용 목적:** notebooklm.google.com(삽입 버튼 동작, 노트북 내용은 읽지 않음),
storage(설정·프리셋·히스토리 저장), clipboardWrite(복사 버튼),
scripting(이미 열려 있는 NotebookLM 탭에 삽입 도우미 주입).

**문의:** hermitsdiner@gmail.com
