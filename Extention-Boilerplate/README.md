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

| Field                        | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `engines.hypothesis`         | Compatible editor version range (e.g. `>=1.0.0`)            |
| `activationEvents`           | When to load: `["onStartup"]`, `["onCommand:<id>"]`         |
| `contributes.commands`       | Commands shown in Command Palette                            |
| `contributes.keybindings`    | Default keybindings for commands                             |
| `contributes.themes`         | Custom themes                                                |
| `contributes.languages`      | Language support (syntax, completions)                       |
| `contributes.snippets`       | Code snippets                                                |
| `contributes.views`          | Sidebar views                                                |
| `contributes.configuration`  | Settings schema                                              |

---

## Extension API

The `context` object passed to `activate(context)` provides full access to the editor. All APIs below are verified against the actual PluginSDK.

### Commands

```js
// Register a command (appears in Command Palette if in contributes.commands)
const cmd = context.commands.registerCommand('my-ext.hello', () => {
  context.notifications.success('Hello!');
});
context.subscriptions.push(cmd);

// Execute another command
await context.commands.executeCommand('editor.action.formatDocument');

// List all registered commands
const ids = context.commands.getCommands();
```

### Editor

```js
// Get the currently active document
const doc = context.editor.getActiveDocument();
// → { uri: '/path/to/file.js', content: '...', language: 'javascript' }

// Get all open documents
const docs = context.editor.getOpenDocuments();

// Get current selection
const sel = context.editor.getSelection();
// → { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } }

// Open / save / read files
await context.editor.openFile('/path/to/file.js');
await context.editor.saveFile('/path/to/file.js', 'new content');
const content = await context.editor.getDocumentContent('/path/to/file.js');

// Insert or replace text
await context.editor.insertText(uri, { line: 1, column: 1 }, 'hello');
await context.editor.replaceText(uri, { start: {...}, end: {...} }, 'new text');

// Open / close documents
await context.editor.openDocument(uri);
await context.editor.closeDocument(uri);

// Listen for events
context.editor.onOpenFile((data) => console.log('Opened:', data.filePath));
context.editor.onFileSaved((data) => console.log('Saved:', data.filePath));
context.editor.onDidChangeActiveEditor((editor) => console.log('Active:', editor));
```

### Settings

```js
// Read a setting
const fontSize = context.settings.get('editor.fontSize', 14);

// Write a setting
await context.settings.set('editor.fontSize', 16);

// Get all settings
const all = await context.settings.getAll();

// Get a section
const editorSettings = await context.settings.getSection('editor');

// Listen for changes
context.settings.onDidChange((settings) => {
  console.log('Settings changed:', settings);
});
```

### File System

```js
// Read / write files
const content = await context.fs.readFile('/path/to/file.txt');
await context.fs.writeFile('/path/to/file.txt', 'Hello World');

// Check existence
const exists = await context.fs.exists('/path/to/file.txt');

// Directory operations
const entries = await context.fs.readDir('/path/to/dir');
// → [{ name: 'file.js', isFile: true, isDirectory: false, isSymbolicLink: false }]

await context.fs.mkdir('/path/to/new-dir', { recursive: true });
await context.fs.delete('/path/to/file.txt', { recursive: false });
await context.fs.rename('/old/path', '/new/path');

// File stats
const stat = await context.fs.stat('/path/to/file.txt');
// → { size: 1234, isFile: true, isDirectory: false, createdAt: '...', modifiedAt: '...' }

// Watch for changes
const watcher = context.fs.watch('/path/to/file.txt', (event) => {
  console.log('File changed:', event.type, event.path);
});
context.subscriptions.push(watcher);

// Workspace
const root = context.fs.getWorkspacePath();
const resolved = context.fs.resolvePath(root, 'src', 'index.ts');
```

### Git

```js
const rootPath = context.fs.getWorkspacePath();

// Status
const status = await context.git.status(rootPath);
// → { branch: 'main', staged: [], unstaged: [], untracked: [], conflicted: [] }

// Log
const commits = await context.git.log(rootPath, 10);
// → [{ hash, shortHash, message, author, date }]

// Diff
const diff = await context.git.diff(rootPath, 'src/file.ts');

// Branches
const branches = await context.git.branch(rootPath);
// → [{ name: 'main', current: true, type: 'local' }]

// Stage, commit, push, pull
await context.git.add(rootPath, ['src/file.ts']);
await context.git.commit(rootPath, 'feat: add new feature');
await context.git.push(rootPath);
await context.git.pull(rootPath);

// Checkout, merge, stash, init
await context.git.checkout(rootPath, 'feature-branch');
await context.git.merge(rootPath, 'main');
await context.git.stash(rootPath);
await context.git.init(rootPath);
```

### Terminal

```js
// Create a new terminal
const termId = await context.terminal.create({ shell: 'bash', name: 'My Terminal' });

// Write to terminal
context.terminal.write(termId, 'echo "Hello"\n');

// Run a command directly (uses active terminal)
context.terminal.runCommand('npm test');

// Close terminal
await context.terminal.close(termId);

// Listen for output / exit
context.terminal.onData((data) => console.log('Output:', data.data));
context.terminal.onExit((data) => console.log('Exited:', data.exitCode));
```

### Storage (per-extension key-value)

```js
// Persist data across sessions
await context.storage.set('lastRun', Date.now());
const lastRun = context.storage.get('lastRun');

// Get all stored data
const all = await context.storage.getAll();

// Delete / clear
await context.storage.delete('lastRun');
await context.storage.clear();
```

### Clipboard

```js
const text = await context.clipboard.read();
await context.clipboard.write('Hello clipboard!');
```

### HTTP

```js
const response = await context.http.fetch('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Authorization': '***' },
});

if (response.ok) {
  const data = JSON.parse(response.body);
  console.log('Got data:', data);
}
```

### Process

```js
// Execute a shell command
const result = await context.process.exec('node --version', {
  cwd: '/path',
  env: { NODE_ENV: 'production' },
  timeout: 30000,
});
console.log('stdout:', result.stdout);
console.log('exitCode:', result.exitCode);

// System info
const platform = await context.process.getPlatform();  // 'win32', 'darwin', 'linux'
const arch = await context.process.getArch();           // 'x64', 'arm64'
const home = await context.process.getHomePath();
const temp = await context.process.getTempPath();
const appPath = await context.process.getAppPath();
const extPath = await context.process.getExtensionPath('my-extension');
const nodeVer = await context.process.getVersion();
const envVar = await context.process.getEnv('PATH');
```

### UI — Status Bar, Panels, Sidebar, Dialogs

```js
// Status bar
const item = context.ui.createStatusBarItem('my-ext.status', '🚀 Ready', 'right', 100);
context.subscriptions.push(item);
context.ui.updateStatusBarItem('my-ext.status', '🔄 Processing...');

// Panel
const panel = context.ui.createPanel('my-ext.panel', 'My Panel', '<h1>Hello</h1>');
context.subscriptions.push(panel);
context.ui.updatePanel('my-ext.panel', '<h1>Updated</h1>');
context.ui.showPanel('my-ext.panel');
context.ui.hidePanel('my-ext.panel');

// Sidebar view
context.ui.createSidebarView('my-ext.sidebar', 'My View', '<div>Content</div>');
context.ui.showSidebarView('my-ext.sidebar');

// Native dialogs
const btnIndex = await context.ui.showDialog({
  type: 'question',
  title: 'Confirm',
  message: 'Are you sure?',
  buttons: ['Yes', 'No'],
});

const openResult = await context.ui.showOpenDialog({
  properties: ['openFile'],
  filters: [{ name: 'JavaScript', extensions: ['js'] }],
});

const saveResult = await context.ui.showSaveDialog({
  defaultPath: 'output.txt',
});

// Message with items
await context.ui.showMessage('info', 'Choose an option', ['OK', 'Cancel']);
```

### Notifications

```js
context.notifications.info('Information message');
context.notifications.warn('Warning message');
context.notifications.error('Error message');
context.notifications.success('Success message!');
```

### Window (legacy VS Code-style compat)

```js
// These are available for VS Code extension compatibility
const result = await context.window.showInformationMessage('Hello', 'OK', 'Cancel');
const input = await context.window.showInputBox({ prompt: 'Enter name', placeHolder: 'Name...' });
const picked = await context.window.showQuickPick([{ label: 'Option 1' }, { label: 'Option 2' }]);
const channel = context.window.createOutputChannel('My Extension');
channel.appendLine('Hello output');
channel.show();
```

### Languages (Monaco providers)

```js
// Register auto-completion
const completionProvider = context.languages.registerCompletionItemProvider(
  'javascript',
  {
    provideCompletionItems: (document, position) => {
      return [
        { label: 'myFunction', kind: 'Function', detail: 'My custom function' },
      ];
    },
  },
  '.'  // trigger character
);
context.subscriptions.push(completionProvider);

// Register hover provider
const hoverProvider = context.languages.registerHoverProvider('javascript', {
  provideHover: (document, position) => {
    return { contents: ['**My Hover Info** — Custom documentation'] };
  },
});
context.subscriptions.push(hoverProvider);

// Register formatter
const formatter = context.languages.registerDocumentFormattingEditProvider('javascript', {
  provideDocumentFormattingEdits: (document) => {
    return [{ range: { start: { line: 0, character: 0 }, end: { line: 999, character: 0 } }, newText: document.getText() }];
  },
});
context.subscriptions.push(formatter);
```

### Events

```js
context.events.onDidSaveTextDocument((doc) => {
  console.log('Saved:', doc.uri);
});
context.events.onDidOpenTextDocument((doc) => {
  console.log('Opened:', doc.uri, doc.language);
});
context.events.onDidCloseTextDocument((doc) => {
  console.log('Closed:', doc.uri);
});
context.events.onDidChangeActiveEditor((editor) => {
  console.log('Active editor changed:', editor?.uri || 'none');
});
```

### Workspace & Configuration

```js
// Get workspace root
const root = context.workspace.rootPath;
const folders = context.workspace.workspaceFolders;

// Read configuration
const config = context.workspace.getConfiguration('editor');
const fontSize = config.get('fontSize', 14);
const has = config.has('fontFamily');

// Update configuration
await config.update('fontSize', 16);

// Listen for config changes
context.workspace.onDidChangeConfiguration(() => {
  console.log('Configuration changed');
});

// Open and inspect a document
const doc = await context.workspace.openTextDocument('/path/to/file.js');
console.log('Lines:', doc.lineCount);
```

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
- **`context.subscriptions.push()`** — always push disposables for auto-cleanup
- **Storage** is per-extension and persists across sessions
- **HTTP fetch** goes through the main process (no CORS issues)
- **Process.exec** runs on the main process (full shell access)
