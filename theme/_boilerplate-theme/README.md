# Hypothesis Theme Extension — Boilerplate

Professional template for creating theme extensions for Hypothesis Editor.

## Folder Structure

```
_boilerplate-theme/
├── package.json          ← Extension manifest + build scripts
├── extension.js          ← Entry point (lifecycle hooks)
├── build.mjs             ← Build script → .hyp package
├── README.md             ← Extension documentation
└── themes/
    ├── my-dark.json      ← Dark theme definition
    └── my-light.json     ← Light theme definition
```

---

## Quick Start

```bash
# 1. Copy the boilerplate
cp -r _boilerplate-theme my-awesome-theme
cd my-awesome-theme

# 2. Edit package.json
#    - Set id, name, description, author
#    - Update theme IDs in contributes.themes

# 3. Edit theme definitions
#    themes/my-dark.json  → dark color palette
#    themes/my-light.json → light color palette

# 4. Build the .hyp package
npm run build

# 5. Install & test
#    Hypothesis Editor → Extensions → + → select dist/<id>-<version>.hyp
```

Build output: `dist/<id>-<version>.hyp`

Dev build: `npm run build:dev` → `dist/<id>-<version>-dev.hyp`

---

## package.json — Manifest

All fields below are required in `package.json`:

| Field                | Type       | Description                                              |
| -------------------- | ---------- | -------------------------------------------------------- |
| `id`                 | `string`   | Unique extension ID (lowercase, dash-case)               |
| `name`               | `string`   | Display name in the Extensions panel                     |
| `version`            | `string`   | SemVer version (e.g. `1.0.0`)                           |
| `description`        | `string`   | Brief description (shown in Description tab)             |
| `author`             | `string`   | Author name                                              |
| `main`               | `string`   | Entry file (default: `extension.js`)                     |
| `engines.hypothesis` | `string`   | Minimum editor version (e.g. `>=0.1.0`)                 |
| `activationEvents`   | `string[]` | `["*"]` = activate on editor startup                     |
| `contributes.themes` | `array`    | List of themes provided by this extension                |
| `keywords`           | `string[]` | Search keywords                                          |

### `contributes.themes[]`

```json
{
  "id": "my-dark",
  "label": "My Dark",
  "path": "themes/my-dark.json",
  "uiTheme": "vs-dark"
}
```

| Field     | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| `id`      | `string` | Unique theme ID (must match `id` inside the theme JSON)  |
| `label`   | `string` | Display name in Settings → Color Theme                   |
| `path`    | `string` | Relative path to the theme JSON file                     |
| `uiTheme` | `string` | `"vs-dark"` for dark themes, `"vs"` for light themes     |

**Critical rules:**
- `id` here MUST match the `id` field inside the corresponding theme JSON file
- `uiTheme` MUST match the `type` field in the theme JSON:
  - `type: "dark"` → `uiTheme: "vs-dark"`
  - `type: "light"` → `uiTheme: "vs"`

### `contributes.commands[]` (optional)

```json
{
  "command": "my-theme.activateDark",
  "title": "Activate My Dark"
}
```

| Field     | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `command` | `string` | Unique command ID              |
| `title`   | `string` | Label shown in Command Palette |

---

## extension.js — Lifecycle

### `activate(ctx)`

Called when the extension is activated. The `ctx` parameter provides:

| Property            | Type     | Description                                    |
| ------------------- | -------- | ---------------------------------------------- |
| `ctx.theme`         | `object` | Theme API                                      |
| `ctx.settings`      | `object` | Settings API                                   |
| `ctx.commands`      | `object` | Commands API                                   |
| `ctx.subscriptions` | `Array`  | Push disposables here for automatic cleanup    |

### Theme API — `ctx.theme`

| Method                       | Return       | Description                                    |
| ---------------------------- | ------------ | ---------------------------------------------- |
| `register(themeDef)`         | `Disposable` | Register a workbench theme                     |
| `injectCSS(cssId, css)`     | `Disposable` | Inject CSS into the editor DOM                 |
| `removeCSS(cssId)`          | `void`       | Remove previously injected CSS                 |
| `onDidChange(callback)`     | `Disposable` | Listen for theme change events                 |

### Settings API — `ctx.settings`

| Method             | Description                                    |
| ------------------ | ---------------------------------------------- |
| `get(key)`         | Retrieve a setting value                       |
| `set(key, value)`  | Write a setting (e.g. `'workbench.colorTheme'`)|

### Commands API — `ctx.commands`

| Method                           | Return       | Description                    |
| -------------------------------- | ------------ | ------------------------------ |
| `registerCommand(id, handler)`  | `Disposable` | Register a command handler     |

### `deactivate()`

Called when the extension is disabled or uninstalled. Must clean up all resources:
- Injected CSS
- Monaco themes via IPC (`ext:monaco:unregister`)
- Workbench theme revert (`ext:theme:revert`)

---

## Theme JSON Format

Each theme file in `themes/` must follow this structure:

```json
{
  "$schema": "hypothesis-theme-v1",
  "id": "my-dark",
  "name": "My Dark",
  "type": "dark",
  "author": "Your Name",
  "description": "Brief description of this theme.",
  "version": "1.0.0",
  "isBuiltin": false,
  "semanticHighlighting": true,
  "colors": { ... },
  "tokenColors": [ ... ],
  "cssVars": { ... }
}
```

### Required Fields in Theme JSON

| Field                 | Type      | Description                                        |
| --------------------- | --------- | -------------------------------------------------- |
| `id`                  | `string`  | Must match the `id` in `contributes.themes`        |
| `name`                | `string`  | Theme display name                                 |
| `type`                | `string`  | `"dark"` or `"light"` — determines Monaco base     |
| `colors`              | `object`  | Workbench color definitions (see full list below)  |
| `tokenColors`         | `array`   | Syntax highlighting rules                          |
| `cssVars`             | `object`  | CSS custom properties                              |

### `type` → Monaco Base Theme Mapping

| `type`    | Monaco `baseTheme` | Description                     |
| --------- | ------------------ | ------------------------------- |
| `"dark"`  | `"vs-dark"`        | Dark background, light text     |
| `"light"` | `"vs"`             | Light background, dark text     |

---

## colors — All Workbench Color Keys

Colors for every UI element in the editor. Format: `"#RRGGBB"` or `"#RRGGBBAA"` (with alpha).

### Editor (24 keys)

| Key                                          | Description                              |
| -------------------------------------------- | ---------------------------------------- |
| `editor.background`                          | Main editor background                   |
| `editor.foreground`                          | Main editor text color                   |
| `editor.lineHighlightBackground`             | Active line highlight                    |
| `editor.selectionBackground`                 | Text selection                           |
| `editor.inactiveSelectionBackground`         | Selection when editor is unfocused       |
| `editor.findMatchBackground`                 | Active search match                      |
| `editor.findMatchHighlightBackground`        | Other search matches                     |
| `editor.rangeHighlightBackground`            | Range highlight                          |
| `editor.wordHighlightBackground`             | Word highlight (read access)             |
| `editor.wordHighlightStrongBackground`       | Word highlight (write access)            |
| `editorBracketMatch.background`              | Bracket match background                 |
| `editorBracketMatch.border`                 | Bracket match border                     |
| `editorIndentGuide.background`               | Indent guide                             |
| `editorIndentGuide.activeBackground`         | Active indent guide                      |
| `editorIndentGuide.background1`              | Indent guide level 1                     |
| `editorIndentGuide.background2`              | Indent guide level 2                     |
| `editorIndentGuide.background3`              | Indent guide level 3                     |
| `editorIndentGuide.background4`              | Indent guide level 4                     |
| `editorIndentGuide.background5`              | Indent guide level 5                     |
| `editorIndentGuide.background6`              | Indent guide level 6                     |
| `editorLineNumber.foreground`                | Line numbers                             |
| `editorLineNumber.activeForeground`          | Active line number                       |
| `editorCursor.foreground`                    | Cursor color                             |
| `editorWhitespace.foreground`                | Whitespace characters                    |

### Sidebar (5 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `sideBar.background`                     | Sidebar background                       |
| `sideBar.foreground`                     | Sidebar text                             |
| `sideBar.border`                         | Sidebar border                           |
| `sideBarTitle.foreground`                | Sidebar title                            |
| `sideBarSectionHeader.background`        | Sidebar section header                   |

### Title Bar (5 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `titleBar.activeBackground`              | Active title bar background              |
| `titleBar.activeForeground`              | Active title bar text                    |
| `titleBar.inactiveBackground`            | Inactive title bar background            |
| `titleBar.inactiveForeground`            | Inactive title bar text                  |
| `titleBar.border`                        | Title bar border                         |

### Status Bar (6 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `statusBar.background`                   | Status bar background                    |
| `statusBar.foreground`                   | Status bar text                          |
| `statusBar.border`                       | Status bar border                        |
| `statusBar.debuggingBackground`          | Background during debugging              |
| `statusBar.debuggingForeground`          | Text during debugging                    |
| `statusBar.noFolderBackground`           | Background when no folder is open        |

### Tabs (9 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `tab.activeBackground`                   | Active tab background                    |
| `tab.activeForeground`                   | Active tab text                          |
| `tab.activeBorder`                       | Active tab border                        |
| `tab.activeBorderTop`                    | Active tab top border accent             |
| `tab.inactiveBackground`                 | Inactive tab background                  |
| `tab.inactiveForeground`                 | Inactive tab text                        |
| `tab.border`                             | Border between tabs                      |
| `tab.hoverBackground`                    | Tab background on hover                  |
| `tab.hoverBorder`                        | Tab border on hover                      |

### Terminal (17 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `terminal.background`                    | Terminal background                      |
| `terminal.foreground`                    | Terminal text                            |
| `terminal.ansiBlack`                     | ANSI black                               |
| `terminal.ansiRed`                       | ANSI red                                 |
| `terminal.ansiGreen`                     | ANSI green                               |
| `terminal.ansiYellow`                    | ANSI yellow                              |
| `terminal.ansiBlue`                      | ANSI blue                                |
| `terminal.ansiMagenta`                   | ANSI magenta                             |
| `terminal.ansiCyan`                      | ANSI cyan                                |
| `terminal.ansiWhite`                     | ANSI white                               |
| `terminal.ansiBrightBlack`               | ANSI bright black                        |
| `terminal.ansiBrightRed`                 | ANSI bright red                          |
| `terminal.ansiBrightGreen`               | ANSI bright green                        |
| `terminal.ansiBrightYellow`              | ANSI bright yellow                       |
| `terminal.ansiBrightBlue`                | ANSI bright blue                         |
| `terminal.ansiBrightMagenta`             | ANSI bright magenta                      |
| `terminal.ansiBrightCyan`                | ANSI bright cyan                         |
| `terminal.ansiBrightWhite`               | ANSI bright white                        |

### Activity Bar (6 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `activityBar.background`                 | Activity bar background                  |
| `activityBar.foreground`                 | Active icon color                        |
| `activityBar.inactiveForeground`         | Inactive icon color                      |
| `activityBar.border`                     | Activity bar border                      |
| `activityBarBadge.background`            | Badge background                         |
| `activityBarBadge.foreground`            | Badge text                               |

### Scrollbar & Minimap (7 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `minimap.background`                     | Minimap background                       |
| `minimap.selectionHighlight`             | Selection highlight in minimap           |
| `minimap.findMatchHighlight`             | Search match highlight in minimap        |
| `scrollbar.shadow`                       | Scrollbar shadow                         |
| `scrollbarSlider.background`             | Scrollbar slider background              |
| `scrollbarSlider.hoverBackground`        | Slider background on hover               |
| `scrollbarSlider.activeBackground`       | Slider background when active            |

### Input & Dropdown (8 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `input.background`                       | Input background                         |
| `input.foreground`                       | Input text                               |
| `input.border`                           | Input border                             |
| `input.placeholderForeground`            | Placeholder text                         |
| `inputOption.activeBorder`               | Active option border                     |
| `dropdown.background`                    | Dropdown background                      |
| `dropdown.foreground`                    | Dropdown text                            |
| `dropdown.border`                        | Dropdown border                          |

### List (8 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `list.activeSelectionBackground`         | Active selected item background          |
| `list.activeSelectionForeground`         | Active selected item text                |
| `list.hoverBackground`                   | Item background on hover                 |
| `list.hoverForeground`                   | Item text on hover                       |
| `list.focusBackground`                   | Focused item background                  |
| `list.focusForeground`                   | Focused item text                        |
| `list.highlightForeground`               | Search match highlight in lists          |
| `list.inactiveSelectionBackground`       | Inactive selected item background        |

### Buttons & Badges (5 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `badge.background`                       | Badge background                         |
| `badge.foreground`                       | Badge text                               |
| `button.background`                      | Button background                        |
| `button.foreground`                      | Button text                              |
| `button.hoverBackground`                | Button background on hover               |

### Peek View (5 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `peekView.border`                        | Peek view border                         |
| `peekViewEditor.background`              | Peek view editor background              |
| `peekViewResult.background`              | Peek view results background             |
| `peekViewTitle.background`               | Peek view title background               |
| `peekViewTitleLabel.foreground`          | Peek view title text                     |

### Notifications (3 keys)

| Key                                      | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `notificationCenter.border`              | Notification center border               |
| `notifications.background`               | Notification background                  |
| `notifications.foreground`               | Notification text                        |

### Git Decoration (6 keys)

| Key                                            | Description                        |
| ---------------------------------------------- | ---------------------------------- |
| `gitDecoration.addedResourceForeground`        | New file (green)                   |
| `gitDecoration.modifiedResourceForeground`     | Modified file (blue)               |
| `gitDecoration.deletedResourceForeground`      | Deleted file (red)                 |
| `gitDecoration.untrackedResourceForeground`    | Untracked file                     |
| `gitDecoration.ignoredResourceForeground`      | Ignored file                       |
| `gitDecoration.conflictingResourceForeground`  | Conflicting file                   |

### General (11 keys)

| Key                              | Description                              |
| -------------------------------- | ---------------------------------------- |
| `focusBorder`                    | Focus border                             |
| `foreground`                     | Global text color                        |
| `widget.shadow`                  | Widget shadow                            |
| `selection.background`           | Global selection                         |
| `descriptionForeground`          | Description text                         |
| `errorForeground`                | Error text                               |
| `textLink.foreground`            | Link text                                |
| `textBlockQuote.background`      | Blockquote background                    |
| `textCodeBlock.background`       | Code block background                    |
| `textPreformat.foreground`       | Preformatted text                        |
| `textSeparator.foreground`       | Separator                                |

**Total: 127 color keys**

---

## tokenColors — Syntax Highlighting

An array of objects. Each entry defines colors for one or more syntax tokens.

```json
{
  "scope": "keyword",
  "settings": {
    "foreground": "#C792EA",
    "fontStyle": "italic"
  }
}
```

### All Supported Scopes (29 scopes)

| Scope              | Code examples                          |
| ------------------ | -------------------------------------- |
| `comment`          | `// comment`, `/* block */`            |
| `keyword`          | `if`, `else`, `return`, `const`        |
| `string`           | `"hello"`, `'world'`, `` `template` `` |
| `number`           | `42`, `3.14`, `0xFF`                   |
| `type`             | `string`, `number`, `MyClass`          |
| `function`         | `myFunction()`, `console.log`          |
| `variable`         | `x`, `myVar`                           |
| `constant`         | `PI`, `MAX_SIZE`                       |
| `parameter`        | `function(param)`                      |
| `property`         | `obj.property`                         |
| `punctuation`      | `{`, `}`, `;`, `.`                     |
| `operator`         | `+`, `=`, `===`, `=>`                  |
| `tag`              | `<div>`, `<Component>`                 |
| `attribute`        | `className`, `onClick`                 |
| `regexp`           | `/\d+/g`                               |
| `annotation`       | `@Override`, `@Deprecated`             |
| `decorator`        | `@Injectable()`, `@observable`         |
| `namespace`        | `namespace MyLib`                      |
| `class`            | `class MyClass`                        |
| `interface`        | `interface IMyProps`                    |
| `enum`             | `enum Status`                          |
| `import`           | `import`, `from`, `require`            |
| `export`           | `export`, `default`                    |
| `control`          | `if`, `for`, `while`, `switch`         |
| `modifier`         | `public`, `private`, `static`          |
| `markup.heading`   | `# Heading`                            |
| `markup.bold`      | `**bold**`                             |
| `markup.italic`    | `*italic*`                             |
| `markup.inline.raw`| `` `code` ``                           |

### Settings per Token

| Key          | Type     | Description                                        |
| ------------ | -------- | -------------------------------------------------- |
| `foreground` | `string` | Text color (`#RRGGBB` or `#RRGGBBAA`)              |
| `fontStyle`  | `string` | `"bold"`, `"italic"`, `"bold italic"`, or `""`     |

### Tips
- `scope` accepts a string or array: `["keyword", "storage"]`
- Empty `fontStyle: ""` resets inherited styles
- **All 29 scopes must be defined** for consistent syntax highlighting

---

## cssVars — CSS Custom Properties

Key-value pairs injected directly into `:root` as CSS custom properties.

```json
{
  "cssVars": {
    "--editor-bg": "#1e1e2e",
    "--editor-fg": "#cdd6f4",
    "--accent-primary": "#89b4fa"
  }
}
```

### Naming Convention

| Prefix           | Purpose                     |
| ---------------- | --------------------------- |
| `--editor-*`     | Editor & syntax             |
| `--sidebar-*`    | Sidebar                     |
| `--titlebar-*`   | Title bar                   |
| `--statusbar-*`  | Status bar                  |
| `--tab-*`        | Tabs                        |
| `--terminal-*`   | Terminal                    |
| `--accent-*`     | Accent colors               |

**All of the following variables must be defined:**

```
--editor-bg, --editor-fg, --editor-line-highlight, --editor-selection
--editor-comment, --editor-keyword, --editor-string, --editor-number
--editor-function, --editor-variable, --editor-type
--sidebar-bg, --sidebar-fg, --sidebar-border, --sidebar-hover, --sidebar-active
--titlebar-bg, --titlebar-fg
--statusbar-bg, --statusbar-fg
--tab-bg, --tab-fg, --tab-active, --tab-border
--terminal-bg, --terminal-fg
--accent-primary, --accent-secondary
```

---

## Best Practices

### Colors
- Use `#RRGGBB` for opaque colors
- Use `#RRGGBBAA` for transparent colors (e.g. selections: `#80CBC433`)
- Ensure contrast ratio >= 4.5:1 for main text (WCAG AA)
- Test across all UI areas: sidebar, editor, terminal, tabs, status bar

### Consistency
- Dark theme: `type: "dark"`, `uiTheme: "vs-dark"`, Monaco base `vs-dark`
- Light theme: `type: "light"`, `uiTheme: "vs"`, Monaco base `vs`
- Theme JSON `id` = `contributes.themes[].id`
- All 127 color keys must be present (values may repeat)
- All 29 token scopes must be defined
- All cssVars must be defined

### Build
- `npm run build` → `dist/<id>-<version>.hyp`
- `npm run build:dev` → `dist/<id>-<version>-dev.hyp`
- `.hyp` files are tar archives (can be extracted for debugging)
- Build script auto-excludes: `node_modules`, `dist`, `.git`, `build.mjs`

### Testing
1. Run `npm run build`
2. Install the `.hyp` via Extensions panel
3. Open Settings → Color Theme → select your theme
4. Verify: editor, sidebar, terminal, tabs, status bar, scrollbar, minimap
5. Switch between dark and light to confirm transitions work

---

## License

MIT
