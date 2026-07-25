# Studio Customizer for NotebookLM

Generate tailored customization prompts for NotebookLM Studio outputs — audio overviews,
slides, quizzes, infographics, and more — from your **purpose, audience, and context**,
then insert them into NotebookLM with one click.

NotebookLM 스튜디오 산출물 9종의 **맞춤설정 프롬프트**를 목적·대상·맥락 입력만으로
만들고, 클릭 한 번으로 NotebookLM에 삽입하는 Chrome 확장 프로그램입니다.

## Features

- **9 output types** — Audio Overview, Slides, Video Overview, Mind Map, Report,
  Flashcards, Quiz, Infographic, Data Table
- **One-click Insert** — detects the customization box in your open NotebookLM tab and
  fills it in (falls back to Copy & paste anytime)
- **Local-first** — the template engine runs entirely on your device; no account, no server
- **AI refine (optional)** — add your own Gemini API key to polish the generated prompt
- **Multilingual** — UI in Korean, English, and Japanese (cycle with the header toggle);
  prompts can target 7 output languages (한국어, English, 日本語, 中文, Español,
  Français, Deutsch) — non-Korean languages use an English prompt scaffold with a
  target-language directive
- **Design defaults** — visual outputs get a refined Apple/Figma-style minimal directive
  by default (switchable: bright & friendly, dark tech, or none)
- **Presets, history, export/import** — save frequent setups, reuse recent prompts,
  share preset packs as JSON
- Editorial-minimal UI, dark mode, bundled Pretendard font (works offline)

## Install (developer mode)

1. Download or clone this repository
2. Open `chrome://extensions`, enable **Developer mode**
3. Click **Load unpacked** and select the project folder
4. Click the toolbar icon — the side panel opens next to NotebookLM

## Usage

1. Open a notebook at [notebooklm.google.com](https://notebooklm.google.com)
2. In the panel: pick an output type → fill in audience / purpose / options
3. The prompt builds live — tweak it directly in the preview if you like
4. In NotebookLM, open the output's **Customize** box, then click **Insert**
   (or **Copy** and paste manually)

> Outputs without a customization box (e.g. Mind Map): paste the prompt into the
> NotebookLM chat instead to get a structured response first.

## AI refine (optional, bring your own key)

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey) (free tier available)
2. Panel → gear icon (**Settings**) → paste the key → Save
   (leave Model empty to use `gemini-flash-latest`, which always points to the newest Flash model)
3. Click **AI refine** under the preview

Your key is stored only on your device (`chrome.storage.local`). The prompt text is sent
to the Gemini API only at the moment you click the button. See [PRIVACY.md](PRIVACY.md).

## Project structure

```
├── manifest.json           # MV3 manifest
├── background.js           # side panel behavior + remote selector config fetch
├── content.js              # NotebookLM page: find & fill the customization box
├── selectors.json          # remote-updatable DOM selectors (fetched from this repo)
├── _locales/               # extension name/description (en, ko)
├── icons/
├── sidepanel/
│   ├── panel.html / panel.css / panel.js   # UI, i18n, presets, history, Gemini refine
│   ├── templates.js        # ★ prompt templates for all 9 output types (ko/en pairs)
│   └── fonts/              # bundled Pretendard Variable (SIL OFL 1.1)
├── tests/run.js            # template engine unit tests (node tests/run.js)
└── .github/workflows/ci.yml
```

### Editing prompt templates

All template strings live in [sidepanel/templates.js](sidepanel/templates.js) as
`B("한국어", "English")` pairs — edit both languages, reload the extension.
Select option values are stored with Korean as the canonical key, so existing presets
keep working across languages (see `LEGACY_DESIGN` in panel.js for rename migrations).

### Why `selectors.json` is fetched remotely

The Insert feature depends on NotebookLM's DOM. When Google changes the UI, updating
`selectors.json` on this repo's `main` branch fixes Insert for all users within 24 hours —
no store re-review needed. The file contains CSS selectors only; no code is executed.

## Development

```bash
node tests/run.js   # unit tests (also run in CI on every push)
```

## Store submission checklist (remaining manual steps)

- [ ] Chrome Web Store developer account ($5 one-time)
- [ ] Screenshots (1280×800, 4–5) and promo tile (440×280)
- [ ] Host PRIVACY.md as a public URL (e.g. GitHub Pages) for the listing's privacy field
- [ ] Demo GIF for the listing / README
- [ ] Decide license & pricing model (currently: all rights reserved)

## Roadmap

- Auto-detect which output's customize box is open → auto-select the matching type
- Prompt explanation mode (why each line is in the prompt — for prompt-engineering training)
- More UI languages (es, zh…) — ja shipped in 0.7.0, output languages already supported
- Optional hosted AI refine (no API key needed) with free/pro tiers
