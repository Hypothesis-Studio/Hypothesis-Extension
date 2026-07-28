# Hypothesis Extensions

Official extension repository for [Hypothesis Editor](https://github.com/Hypothesis-Studio/Hypothesis-Editor) — a modern, extensible desktop code editor.

This repository contains first-party extensions, community boilerplates, and documentation for the Hypothesis extension platform.

---

## Repository Structure

```
hypothesis-extention/
├── theme/                          ← Color theme extensions
│   ├── material-theme/             ← Material Theme (Dark + Light)
│   ├── one-dark-pro/               ← One Dark Pro (Dark + Light)
│   └── _boilerplate-theme/         ← Theme extension template
├── icon-pack/                      ← Icon theme extensions
│   ├── simple-icon/                ← Simple Icon Pack (150+ file + 620 product icons)
│   └── _boilerplate-icon-pack/     ← Icon pack extension template
├── LICENSE
└── README.md
```

---

## Extensions

### Themes

| Extension | Variants | Author | Description |
| --------- | -------- | ------ | ----------- |
| [Material Theme](theme/material-theme/) | Dark, Light | Hypothesis | Material Design-inspired theme with 127 colors and 29 syntax scopes |
| [One Dark Pro](theme/one-dark-pro/) | Dark, Light | Hypothesis | Atom's iconic One Dark theme with complete UI coverage |
| [Theme Boilerplate](theme/_boilerplate-theme/) | Template | — | Production-ready template for creating custom color themes |

### Icon Packs

| Extension | File Icons | Product Icons | Author | Description |
| --------- | ---------- | ------------- | ------ | ----------- |
| [Simple Icon](icon-pack/simple-icon/) | 150+ | 620 | Hypothesis | Default file, folder, language, and UI icon pack |
| [Icon Pack Boilerplate](icon-pack/_boilerplate-icon-pack/) | Template | Template | — | Production-ready template for creating custom icon packs |

---

## Getting Started

### Installing Extensions

1. Download or build a `.hyp` file
2. Open Hypothesis Editor
3. Go to **Extensions** sidebar (`Ctrl+Shift+X`)
4. Click **+** and select the `.hyp` file
5. Or drag and drop the `.hyp` into the editor

### Activating

- **Color themes:** Settings → Workbench → Color Theme
- **File icons:** Settings → Workbench → File Icon Theme
- **Product icons:** Settings → Workbench → Product Icon Theme

### Building from Source

```bash
cd theme/material-theme && npm run build
cd icon-pack/simple-icon && npm run build
```

---

## Extension Architecture

A Hypothesis extension is a `.hyp` file (tar archive):

```
my-extension/
├── package.json          ← Manifest (required)
├── extension.js          ← Entry point (required)
└── [assets]/             ← Themes, icons, snippets, etc.
```

### Contribution Points

| Point | Description |
| ----- | ----------- |
| `themes` | Color themes for the editor UI and Monaco editor |
| `iconThemes` | File and folder icon themes for the explorer |
| `productIconThemes` | Product (UI) icon themes for activity bar, sidebar, status bar, etc. |
| `commands` | Custom commands exposed via Command Palette |
| `menus` | Menu items for context menus, title bar, etc. |
| `keybindings` | Keyboard shortcut bindings |
| `languages` | Language support (syntax, brackets, comments) |
| `snippets` | Code snippet collections |
| `configuration` | Settings exposed in the Settings panel |
| `views` | Custom sidebar views and panels |

### Lifecycle

```js
function activate(ctx) {
  // ctx.theme      — Theme API
  // ctx.settings   — Settings API
  // ctx.commands   — Commands API
  // ctx.subscriptions — Push disposables for auto-cleanup
}

function deactivate() {
  // Clean up resources
}

module.exports = { activate, deactivate };
```

---

## Creating Extensions

### Color Theme
```bash
cp -r theme/_boilerplate-theme my-theme
# Edit package.json, themes/*.json
npm run build
```

### Icon Pack (File + Product)
```bash
cp -r icon-pack/_boilerplate-icon-pack my-icons
# Edit package.json, add SVGs to file-icons/ and product-icons/
npm run build
```

---

## Guidelines

- **ID:** Lowercase, dash-case, unique across all extensions
- **Versioning:** Semantic Versioning (`MAJOR.MINOR.PATCH`)
- **Themes:** Must define all 127 color keys, 29 token scopes, 28 cssVars
- **File icons:** SVGs `viewBox="0 0 32 32"`, hardcoded fill colors
- **Product icons:** SVGs `viewBox="0 0 16 16"`, `fill="currentColor"` for theme inheritance
- **Security:** Only install extensions from trusted sources

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Hypothesis Studio
