# Hypothesis Extension Boilerplate

Boilerplate ini adalah titik awal untuk membuat extension/plugin untuk **Hypothesis Editor**.

---

## Struktur Folder

```
extension-boilerplate/
├── package.json      ← Manifest extension
├── extension.js      ← Entry point: activate() & deactivate()
└── README.md         ← Dokumentasi ini
```

> **Wajib ada:** `package.json` + `extension.js` (atau file JS lain yang di-set di `main`).

---

## `package.json`

### ✅ Wajib

| Field     | Keterangan                                  |
| --------- | ------------------------------------------- |
| `name`    | Nama tampilan extension                     |
| `id`      | ID unik, format kebab-case (`my-extension`) |
| `version` | SemVer string (`1.0.0`)                     |

### ⚙️ Opsional

| Field         | Keterangan                                              |
| ------------- | ------------------------------------------------------- |
| `main`        | Entry file, default `extension.js`                      |
| `description` | Deskripsi singkat tentang extension                     |
| `author`      | Nama pembuat                                            |
| `license`     | Lisensi (contoh: `MIT`)                                 |
| `icon`        | SVG data URI — ikon extension di sidebar                |
| `dependencies`| npm packages — otomatis di-install saat extension aktif |

### 🔧 Advance

| Field                   | Keterangan                                              |
| ----------------------- | ------------------------------------------------------- |
| `contributes.commands`  | Daftar command yang muncul di Command Palette           |

---

### Contoh `package.json` Minimal

```json
{
  "name": "My Extension",
  "id": "my-extension",
  "version": "1.0.0"
}
```

### Contoh `package.json` Lengkap

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

### ✅ Wajib — Export `activate` & `deactivate`

```js
'use strict';

function activate(context) {
  // Dipanggil saat extension diaktifkan
}

function deactivate() {
  // Dipanggil saat extension dinonaktifkan
}

module.exports = { activate, deactivate };
```

---

### ✅ Wajib — Register Command (jika ingin muncul di Command Palette)

```js
function activate(context) {
  const cmd = context.commands.registerCommand('my-ext.hello', () => {
    context.window.showInformationMessage('Hello!');
  });
  context.subscriptions.push(cmd);
}
```

> `context.subscriptions.push(cmd)` — agar auto-cleanup saat extension di-uninstall/disable.

---

### ⚙️ Opsional — Show Notification

```js
context.window.showInformationMessage('Pesan info');
context.window.showWarningMessage('Pesan warning');
context.window.showErrorMessage('Pesan error');
```

---

### ⚙️ Opsional — Baca User Settings

```js
const config = context.workspace.getConfiguration('editor');
const fontSize = config.get('fontSize', 14);  // default: 14
const hasKey   = config.has('theme');
```

---

### 🔧 Advance — Eksekusi Command Lain

```js
await context.commands.executeCommand('other.command', arg1, arg2);
```

---

### 🔧 Advance — Push ke `context.subscriptions`

Semua resource yang perlu di-cleanup harus di-push:

```js
context.subscriptions.push(myDisposable);
```

---

## Plugin API Context

Parameter `context` yang diterima di `activate(context)`:

| API                                        | Tipe     | Keterangan                          |
| ------------------------------------------ | -------- | ----------------------------------- |
| `context.commands.registerCommand(id, fn)` | ✅ Wajib | Register command ke Command Palette |
| `context.subscriptions.push(disposable)`   | ✅ Wajib | Auto-cleanup saat deactivate       |
| `context.window.showInformationMessage()`  | ⚙️ Opsional | Tampilkan notifikasi           |
| `context.window.showWarningMessage()`      | ⚙️ Opsional | Notifikasi warning              |
| `context.window.showErrorMessage()`        | ⚙️ Opsional | Notifikasi error                |
| `context.workspace.getConfiguration(sec)`  | ⚙️ Opsional | Baca user settings              |
| `context.commands.executeCommand(id, ...)` | 🔧 Advance | Eksekusi command lain           |

---

## Lifecycle

```
1. User install extension (.hyp file atau folder)
2. PluginService copy ke ~/.hypothesis/extensions/<id>/
3. npm dependencies otomatis di-install (jika ada)
4. activate(context) dipanggil
5. Extension berjalan, commands terdaftar di Command Palette
6. Saat uninstall/disable → deactivate() dipanggil, resources di-cleanup
```

---

## Cara Build & Distribute

### Development (dari folder)

```
Hypothesis Editor → Extensions → Install from Folder → pilih folder ini
```

### Distribute sebagai .hyp file

`.hyp` adalah arsip tar:

```bash
tar -cf my-extension-1.0.0.hyp -C /path/to/parent folder-extension
```

User lain bisa install via: **Extensions → Install .hyp File**

---

## Tips

- **ID harus unik** — gunakan format `<nama-extension>` tanpa spasi
- **Command ID** sebaiknya format `<extension-id>.<action>`
- **Dependencies** otomatis di-install, tapi pastikan package tersedia di npm
- **Error handling** — wrap logic di try/catch agar extension tidak crash editor
- **Jangan blokir activate()** — gunakan async untuk operasi berat
- **`contributes.commands`** — tanpa ini, command tidak muncul di Command Palette

---

## Referensi

- Boilerplate ini: `C:\Users\USER\.openclaw\workspace\extension\Extention-Boilerplate\`
- Hypothesis Editor: `C:\Users\USER\.openclaw\workspace\hypothesis\`
- Plugin System: `src/main/services/PluginService.ts`
