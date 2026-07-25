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
  fills it in, with a 1-second highlight showing exactly where it went
  (falls back to Copy & paste anytime)
- **Live connection status** — the panel always shows whether a NotebookLM tab and a
  customization box are ready, with a one-click "Open NotebookLM" button
- **Auto-detects the open customization box** — reads the dialog title and switches the
  panel to the matching output type automatically
- **Notebook-aware** — shows the current notebook's name (click the chip to add it to
  your context) and remembers your inputs separately per notebook
- **Local-first** — the template engine runs entirely on your device; no account, no server
- **AI refine without an API key** — on devices with Chrome's built-in AI (Gemini Nano),
  refining runs fully on-device; add your own Gemini API key to use cloud AI instead
- **Fully multilingual** — UI in 7 languages (한국어, English, 日本語, Español, 中文,
  Français, Deutsch; header dropdown, browser-language auto-detect), and prompts can
  target the same 7 output languages — non-Korean languages use an English prompt
  scaffold with a target-language directive
- **Themes** — Auto (system) / Light / Dark / Ocean blue / Forest green, in Settings
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
4. In NotebookLM, open the output's **Customize** box — the panel's status line turns
   green and auto-selects the matching type — then click **Insert**
   (or **Copy** and paste manually)

> Outputs without a customization box (e.g. Mind Map): paste the prompt into the
> NotebookLM chat instead to get a structured response first.

## AI refine

**No API key needed** on devices where Chrome's built-in AI (Gemini Nano) is available —
just click **AI refine** under the preview and the prompt is polished entirely on-device
(nothing leaves your computer).

To use cloud Gemini instead (or on devices without built-in AI):

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey) (free tier available)
2. Panel → gear icon (**Settings**) → paste the key → Save
   (leave Model empty to use `gemini-flash-latest`, which always points to the newest Flash model)
3. Click **AI refine** — with a key saved, cloud Gemini takes priority

Your key is stored only on your device (`chrome.storage.local`). The prompt text is sent
to the Gemini API only at the moment you click the button. See [PRIVACY.md](PRIVACY.md).

## Project structure

```
├── manifest.json           # MV3 manifest
├── background.js           # side panel behavior + remote selector config fetch
├── content.js              # NotebookLM page: find & fill the customization box,
│                           #   report status (box open? which output? notebook name)
├── selectors.json          # remote-updatable DOM selectors (fetched from this repo)
├── _locales/               # store description in 7 languages (≤132 chars each)
├── icons/
├── sidepanel/
│   ├── panel.html / panel.css / panel.js   # UI, i18n, presets, history, AI refine,
│   │                                       #   status badge, notebook memory
│   ├── templates.js        # ★ prompt templates for all 9 output types (ko/en pairs)
│   └── fonts/              # bundled Pretendard Variable (SIL OFL 1.1)
├── docs/                   # GitHub Pages: landing + hosted privacy policy
├── store/                  # Chrome Web Store listing copy (7 locales) + promo assets
├── tests/run.js            # template engine unit tests (node tests/run.js)
├── tests/checks.js         # locale/selector/manifest validation (node tests/checks.js)
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
(GitHub raw allows CORS, so no extra host permission is required for this fetch.)

The config now also carries `excludeSelectors` / `excludePlaceholderWords` (so the
broad `textarea` fallback can never silently fill NotebookLM's chat box) and `headings`
(used to auto-detect which output's customize box is open).

## Development

```bash
node tests/run.js     # template engine unit tests (also run in CI on every push)
node tests/checks.js  # locale 132-char limit, selectors schema, manifest checks
```

## Store submission checklist (remaining manual steps)

- [ ] Chrome Web Store developer account ($5 one-time)
- [x] Screenshots (1280×800) and promo tile (440×280) — generated in `store/promo/`
      (see [store/ASSETS.md](store/ASSETS.md) to re-render; add 2–3 real-usage captures)
- [x] Listing copy in 7 languages — [store/LISTING.md](store/LISTING.md)
- [x] Privacy policy page ready — [docs/privacy.html](docs/privacy.html); enable
      GitHub Pages (Settings → Pages → `main` / `/docs`) to get the public URL
- [ ] Demo GIF for the listing / README (flow suggested in store/ASSETS.md)
- [ ] Decide license & pricing model (currently: all rights reserved)

## Roadmap

- ~~Auto-detect which output's customize box is open → auto-select the matching type~~
  — shipped in 0.9.0 (dialog-title detection + live status badge)
- Prompt explanation mode (why each line is in the prompt — for prompt-engineering training)
- ~~More UI languages~~ — all 7 output languages have full UI translations as of 0.8.0
- ~~AI refine without an API key~~ — shipped in 0.9.0 via Chrome's built-in on-device AI
  (hosted cloud refine with free/pro tiers still open)
- Starter recipe presets (one-click expert setups seeded on first run)
