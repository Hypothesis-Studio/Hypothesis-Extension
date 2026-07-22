# Hypothesis Extension Boilerplate

This boilerplate is the starting point for creating extensions/plugins for **Hypothesis Editor**.

---

## Folder Structure

```
extension-boilerplate/
├── package.json      ← Extension manifest
├── extension.js      ← Entry point: activate() & deactivate()
└── README.md         ← This documentation
```

> **Required:** `package.json` + `extension.js` (or another JS file set in `main`).

---

## `package.json`

### ✅ Required

| Field     | Description                                     |
| --------- | ----------------------------------------------- |
| `name`    | Extension display name                          |
| `id`      | Unique ID, kebab-case format (`my-extension`)   |
| `version` | SemVer string (`1.0.0`)                         |

### ⚙️ Optional

| Field         | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| `main`        | Entry file, defaults to `extension.js`                       |
| `description` | Short description of the extension                           |
| `author`      | Author name                                                  |
| `license`     | License (e.g. `MIT`)                                         |
| `icon`        | SVG data URI — extension icon in the sidebar                 |
| `dependencies`| npm packages — automatically installed when extension activates |

### 🔧 Advanced

| Field                   | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `contributes.commands`  | List of commands that appear in the Command Palette          |

---

### Minimal `package.json` Example

```json
{
  "name": "My Extension",
  "id": "my-extension",
  "version": "1.0.0"
}
```

### Full `package.json` Example

```json
{
  "name": "My Extension",
  "id": "my-extension",
  "version": "1.0.0",
  "description": "A brief description of what your extension does.",
  "main": "extension.js",
  "author": "Your Name",
  "license": "MIT",
  "icon": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234fc1ff' stroke-width='2'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5z'/%3E%3Cpath d='M2 17l10 5 10-5'/%3E%3Cpath d='M2 12l10 5 10-5'/%3E%3C/svg%3E",
  "contributes": {
    "commands": [
      { "command": "my-extension.hello", "title": "Hello World", "category": "My Extension" }
    ]
  }
}
```

---

## `extension.js`

### ✅ Required — Export `activate` & `deactivate`

```js
'use strict';

function activate(context) {
  // Called when the extension is activated
}

function deactivate() {
  // Called when the extension is deactivated
}

module.exports = { activate, deactivate };
```

---

### ✅ Required — Register Command (if you want it in the Command Palette)

```js
function activate(context) {
  const cmd = context.commands.registerCommand('my-ext.hello', () => {
    context.window.showInformationMessage('Hello!');
  });
  context.subscriptions.push(cmd);
}
```

> `context.subscriptions.push(cmd)` — ensures auto-cleanup when the extension is uninstalled or disabled.

---

### ⚙️ Optional — Show Notification

```js
context.window.showInformationMessage('Info message');
context.window.showWarningMessage('Warning message');
context.window.showErrorMessage('Error message');
```

---

### ⚙️ Optional — Read User Settings

```js
const config = context.workspace.getConfiguration('editor');
const fontSize = config.get('fontSize', 14);  // default: 14
const hasKey   = config.has('theme');
```

---

### 🔧 Advanced — Execute Another Command

```js
await context.commands.executeCommand('other.command', arg1, arg2);
```

---

### 🔧 Advanced — Push to `context.subscriptions`

All resources that need cleanup must be pushed:

```js
context.subscriptions.push(myDisposable);
```

---

## Plugin API Context

The `context` parameter received in `activate(context)`:

| API                                        | Type     | Description                              |
| ------------------------------------------ | -------- | ---------------------------------------- |
| `context.commands.registerCommand(id, fn)` | ✅ Required | Register command in the Command Palette |
| `context.subscriptions.push(disposable)`   | ✅ Required | Auto-cleanup on deactivate              |
| `context.window.showInformationMessage()`  | ⚙️ Optional | Show an info notification               |
| `context.window.showWarningMessage()`      | ⚙️ Optional | Show a warning notification             |
| `context.window.showErrorMessage()`        | ⚙️ Optional | Show an error notification              |
| `context.workspace.getConfiguration(sec)`  | ⚙️ Optional | Read user settings                      |
| `context.commands.executeCommand(id, ...)` | 🔧 Advanced | Execute another command                 |

---

## Lifecycle

```
1. User installs extension (.hyp file or folder)
2. PluginService copies it to ~/.hypothesis/extensions/<id>/
3. npm dependencies are automatically installed (if any)
4. activate(context) is called
5. Extension runs, commands registered in the Command Palette
6. On uninstall/disable → deactivate() is called, resources are cleaned up
```

---

## How to Build & Distribute

### Development (from folder)

```
Hypothesis Editor → Extensions → Install from Folder → select this folder
```

### Distribute as .hyp file

`.hyp` is a tar archive:

```bash
tar -cf my-extension-1.0.0.hyp -C /path/to/parent extension-folder
```

Other users can install via: **Extensions → Install .hyp File**

---

## Tips

- **ID must be unique** — use `<extension-name>` format without spaces
- **Command ID** should follow `<extension-id>.<action>` format
- **Dependencies** are installed automatically, but make sure the package is available on npm
- **Error handling** — wrap logic in try/catch to prevent the extension from crashing the editor
- **Don't block `activate()`** — use async for heavy operations
- **`contributes.commands`** — without this, commands won't appear in the Command Palette

---

## References

- This boilerplate: `C:\Users\USER\.openclaw\workspace\extension\Extention-Boilerplate\`
- Hypothesis Editor: `C:\Users\USER\.openclaw\workspace\hypothesis\`
- Plugin System: `src/main/services/PluginService.ts`
