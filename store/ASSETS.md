# 스토어 이미지 자산 만들기

`store/promo/`의 HTML을 Chrome headless로 렌더하면 제출용 PNG가 나옵니다.
(iframe이 실제 `sidepanel/panel.html`을 그대로 보여주므로 UI가 바뀌면 다시 렌더만 하면 됩니다.)

## 프로모 타일 (440×280, 필수)

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu `
  --window-size=440,280 --hide-scrollbars --allow-file-access-from-files `
  --screenshot="store\promo\promo-tile-440x280.png" "store\promo\promo-tile.html"
```

## 스크린샷 (1280×800, 4~5장 권장)

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu `
  --window-size=1280,800 --hide-scrollbars --allow-file-access-from-files `
  --screenshot="store\promo\screenshot-1-1280x800.png" "store\promo\screenshot-frame.html"
```

- `--lang=en-US`를 붙이면 패널 UI가 영어로 렌더됩니다 (로케일별 스크린샷 제작용).
- 나머지 스크린샷은 실제 사용 장면 캡처를 권장:
  1. NotebookLM 옆에 패널이 열려 상태 배지가 초록색인 장면
  2. 맞춤설정란 자동 감지 → 유형이 자동 선택된 장면
  3. [삽입] 직후 NotebookLM 입력란에 프롬프트+초록 하이라이트가 보이는 장면
  4. 디자인 스타일을 고른 인포그래픽/슬라이드 프롬프트 미리보기

## 데모 GIF (README·리스팅용, 10–15초)

권장 흐름: 산출물 선택 → 대상/목적 입력(프롬프트 실시간 변화) → NotebookLM에서
맞춤설정란 열기(패널 상태가 초록으로 변함 + 유형 자동 전환) → [삽입] → 하이라이트.
Windows 기본 `Win+Alt+R`(Game Bar) 녹화 후 ezgif.com 등에서 GIF 변환.
