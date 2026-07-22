/**
 * Extension Template — Hypothesis Editor
 *
 * Full Extension API Reference based on the actual PluginSDK.
 * Every API below is tested against PluginSDK.ts and guaranteed to exist.
 *
 * ─── API CONTEXT (passed to activate) ─────────────────────────────
 *
 * COMMANDS
 *   context.commands.registerCommand(id, handler)        → Disposable
 *   context.commands.executeCommand(id, ...args)         → Promise
 *   context.commands.getCommands()                       → string[]
 *
 * EDITOR
 *   context.editor.getActiveDocument()                   → { uri, content, language } | null
 *   context.editor.getOpenDocuments()                    → Array<{ uri, content, language }>
 *   context.editor.getSelection()                        → { start, end } | null
 *   context.editor.openFile(filePath)                    → Promise<{ filePath, content }>
 *   context.editor.saveFile(filePath, content)           → Promise<boolean>
 *   context.editor.getDocumentContent(filePath)          → Promise<string>
 *   context.editor.insertText(uri, position, text)       → Promise
 *   context.editor.replaceText(uri, range, text)         → Promise
 *   context.editor.openDocument(uri)                     → Promise
 *   context.editor.closeDocument(uri)                    → Promise
 *   context.editor.onOpenFile(listener)                  → Disposable
 *   context.editor.onFileSaved(listener)                 → Disposable
 *   context.editor.onDidChangeActiveEditor(listener)     → Disposable
 *
 * SETTINGS
 *   context.settings.get(key, defaultValue?)             → value
 *   context.settings.set(key, value)                     → Promise<boolean>
 *   context.settings.getAll()                             → Promise<Record>
 *   context.settings.getSection(section)                  → Promise<Record>
 *   context.settings.onDidChange(listener)               → Disposable
 *
 * THEME
 *   context.theme.getCurrent()                           → ThemeDefinition | undefined
 *   context.theme.list()                                 → Promise<ThemeDefinition[]>
 *   context.theme.set(themeId)                           → Promise<boolean>
 *   context.theme.register(themeDef)                     → Disposable
 *   context.theme.onDidChange(listener)                  → Disposable
 *
 * FILE SYSTEM
 *   context.fs.readFile(filePath)                        → Promise<string>
 *   context.fs.writeFile(filePath, content)              → Promise<boolean>
 *   context.fs.exists(filePath)                          → Promise<boolean>
 *   context.fs.readDir(dirPath)                          → Promise<Entry[]>
 *   context.fs.mkdir(dirPath, { recursive? })            → Promise<boolean>
 *   context.fs.delete(path, { recursive? })              → Promise<boolean>
 *   context.fs.rename(oldPath, newPath)                  → Promise<boolean>
 *   context.fs.stat(filePath)                            → Promise<Stat>
 *   context.fs.watch(filePath, listener)                 → Disposable
 *   context.fs.getWorkspacePath()                        → string | undefined
 *   context.fs.resolvePath(...segments)                  → string
 *
 * GIT
 *   context.git.status(repoPath)                         → Promise<GitStatus>
 *   context.git.log(repoPath, maxCount?)                 → Promise<GitCommit[]>
 *   context.git.diff(repoPath, file?)                    → Promise<GitDiff>
 *   context.git.branch(repoPath)                         → Promise<GitBranch[]>
 *   context.git.commit(repoPath, message, files?)        → Promise<string>
 *   context.git.push(repoPath, remote?)                  → Promise<boolean>
 *   context.git.pull(repoPath, remote?)                  → Promise<boolean>
 *   context.git.fetch(repoPath, remote?)                 → Promise<boolean>
 *   context.git.add(repoPath, files)                     → Promise<boolean>
 *   context.git.reset(repoPath, files?)                  → Promise<boolean>
 *   context.git.stash(repoPath)                          → Promise<boolean>
 *   context.git.checkout(repoPath, branch)               → Promise<boolean>
 *   context.git.merge(repoPath, branch)                  → Promise<boolean>
 *   context.git.init(repoPath)                           → Promise<boolean>
 *
 * TERMINAL
 *   context.terminal.create({ shell?, cwd?, name? })     → Promise<string>
 *   context.terminal.write(terminalId, data)             → void
 *   context.terminal.close(terminalId)                   → Promise
 *   context.terminal.runCommand(command, cwd?)           → void
 *   context.terminal.onData(listener)                    → Disposable
 *   context.terminal.onExit(listener)                    → Disposable
 *
 * STORAGE (per-extension key-value)
 *   context.storage.get(key)                             → value | undefined
 *   context.storage.set(key, value)                      → Promise<boolean>
 *   context.storage.delete(key)                          → Promise<boolean>
 *   context.storage.getAll()                              → Promise<Record>
 *   context.storage.clear()                              → Promise<boolean>
 *
 * CLIPBOARD
 *   context.clipboard.read()                             → Promise<string>
 *   context.clipboard.write(text)                        → Promise<boolean>
 *
 * HTTP
 *   context.http.fetch(url, { method?, headers?, body?, timeout? }) → Promise<{ ok, status, body }>
 *
 * PROCESS
 *   context.process.exec(cmd, { cwd?, env?, timeout? })  → Promise<{ stdout, stderr, exitCode }>
 *   context.process.getEnv(key)                          → Promise<string | undefined>
 *   context.process.getPlatform()                        → Promise<string>
 *   context.process.getArch()                            → Promise<string>
 *   context.process.getVersion()                         → Promise<string>
 *   context.process.getAppPath()                         → Promise<string>
 *   context.process.getExtensionPath(pluginId)           → Promise<string | null>
 *   context.process.getTempPath()                        → Promise<string>
 *   context.process.getHomePath()                        → Promise<string>
 *
 * NOTIFICATIONS
 *   context.notifications.info(message)                  → void
 *   context.notifications.warn(message)                  → void
 *   context.notifications.error(message)                 → void
 *   context.notifications.success(message)               → void
 *
 * UI (dialogs, status bar, panels, sidebar)
 *   context.ui.showMessage(type, message, items?)        → Promise
 *   context.ui.showDialog(options)                       → Promise<number>
 *   context.ui.showOpenDialog(options)                   → Promise<{ canceled, filePaths }>
 *   context.ui.showSaveDialog(options)                   → Promise<{ canceled, filePath }>
 *   context.ui.createStatusBarItem(id, text, align, p?)  → Disposable
 *   context.ui.updateStatusBarItem(id, text)             → void
 *   context.ui.createPanel(id, title, content)           → Disposable
 *   context.ui.updatePanel(id, content)                  → void
 *   context.ui.showPanel(id) / hidePanel(id)             → void
 *   context.ui.createSidebarView(id, title, content)     → Disposable
 *   context.ui.showSidebarView(id)                       → void
 *
 * WORKSPACE (legacy compat)
 *   context.workspace.rootPath                           → string | undefined
 *   context.workspace.workspaceFolders                   → WorkspaceFolder[] | undefined
 *   context.workspace.getConfiguration(section)          → { get, has, update, inspect }
 *   context.workspace.onDidChangeConfiguration(listener) → Disposable
 *   context.workspace.onDidOpenTextDocument(listener)    → Disposable
 *   context.workspace.onDidSaveTextDocument(listener)    → Disposable
 *   context.workspace.onDidCloseTextDocument(listener)   → Disposable
 *   context.workspace.openTextDocument(uri)              → Promise<TextDocument>
 *   context.workspace.applyEdit(edit)                    → Promise<boolean>
 *
 * LANGUAGES (Monaco providers)
 *   context.languages.registerCompletionItemProvider(sel, provider, ...triggers) → Disposable
 *   context.languages.registerHoverProvider(sel, provider)           → Disposable
 *   context.languages.registerDefinitionProvider(sel, provider)      → Disposable
 *   context.languages.registerDocumentFormattingEditProvider(sel, p)  → Disposable
 *   context.languages.registerDocumentSymbolProvider(sel, provider)  → Disposable
 *   context.languages.registerCodeActionProvider(sel, provider)      → Disposable
 *   context.languages.registerCodeLensProvider(sel, provider)        → Disposable
 *   context.languages.registerReferenceProvider(sel, provider)       → Disposable
 *   context.languages.registerRenameProvider(sel, provider)          → Disposable
 *   context.languages.registerSignatureHelpProvider(sel, provider)   → Disposable
 *   context.languages.registerFoldingRangeProvider(sel, provider)    → Disposable
 *
 * PANELS (dedicated API)
 *   context.panels.createPanel(id, title, content)       → Disposable
 *   context.panels.showPanel(id) / hidePanel(id)         → void
 *   context.panels.updatePanel(id, content)              → void
 *
 * STATUSBAR (dedicated API)
 *   context.statusbar.createItem(id, text, align, p?)    → Disposable
 *   context.statusbar.updateItem(id, text)               → void
 *   context.statusbar.showItem(id) / hideItem(id)        → void
 *
 * MENUS
 *   context.menus.registerMenu(menuId, items)            → Disposable
 *   context.menus.registerContextMenu(menuId, items)     → Disposable
 *
 * FORMATTERS
 *   context.formatters.registerFormatter(sel, formatter)  → Disposable
 *
 * LINTERS
 *   context.linters.registerLinter(sel, linter)          → Disposable
 *
 * EVENTS
 *   context.events.onDidSaveTextDocument(listener)       → Disposable
 *   context.events.onDidOpenTextDocument(listener)       → Disposable
 *   context.events.onDidCloseTextDocument(listener)      → Disposable
 *   context.events.onDidChangeActiveEditor(listener)     → Disposable
 *
 * WINDOW (legacy VS Code-style compat)
 *   context.window.showInformationMessage(msg, ...items) → Promise<string | undefined>
 *   context.window.showWarningMessage(msg, ...items)     → Promise<string | undefined>
 *   context.window.showErrorMessage(msg, ...items)       → Promise<string | undefined>
 *   context.window.showInputBox(options)                 → Promise<string | undefined>
 *   context.window.showQuickPick(items, options)         → Promise<T | undefined>
 *   context.window.createOutputChannel(name)             → OutputChannel
 *
 * ─── PACKAGE.JSON FIELDS ─────────────────────────────────────────
 *
 * Required:
 *   name        — Human-readable display name
 *   id          — Unique kebab-case identifier (e.g. "my-extension")
 *   version     — SemVer string
 *   main        — Entry file (default: "extension.js")
 *
 * Optional:
 *   description — What the extension does
 *   author      — Your name
 *   engines.hypothesis — Compatible editor version range
 *   activationEvents   — When to load: ["onStartup", "onCommand:<id>"]
 *   contributes.commands     — Commands shown in Command Palette
 *   contributes.keybindings  — Default keybindings
 *   contributes.themes       — Custom themes
 *   contributes.languages    — Language support
 *   contributes.snippets     — Code snippets
 *   contributes.views        — Sidebar views
 *   contributes.configuration — Settings schema
 *   dependencies       — npm packages (auto-installed on install)
 */
'use strict';

/**
 * Called when the extension is activated.
 * @param {object} context — Full Plugin API context
 */
function activate(context) {

  // ═══════════════════════════════════════════════════════════════
  // 1. COMMANDS
  // ═══════════════════════════════════════════════════════════════

  const helloCmd = context.commands.registerCommand(
    'my-extension.hello',
    () => {
      context.notifications.success('Hello from My Extension! 🎉');
    }
  );
  context.subscriptions.push(helloCmd);

  // Show editor & settings info
  const infoCmd = context.commands.registerCommand(
    'my-extension.showInfo',
    async () => {
      const fontSize = context.settings.get('editor.fontSize', 14);
      const tabSize = context.settings.get('editor.tabSize', 2);
      const doc = context.editor.getActiveDocument();
      const docInfo = doc ? `${doc.uri} (${doc.language})` : 'No file open';
      context.notifications.info(`Font: ${fontSize}px | Tab: ${tabSize} | Active: ${docInfo}`);
    }
  );
  context.subscriptions.push(infoCmd);

  // ═══════════════════════════════════════════════════════════════
  // 2. FILE SYSTEM — List workspace files
  // ═══════════════════════════════════════════════════════════════

  const listFilesCmd = context.commands.registerCommand(
    'my-extension.listFiles',
    async () => {
      const rootPath = context.fs.getWorkspacePath();
      if (!rootPath) {
        context.notifications.warn('No workspace folder open');
        return;
      }

      try {
        const entries = await context.fs.readDir(rootPath);
        const files = entries.filter(e => e.isFile).map(e => e.name);
        const dirs = entries.filter(e => e.isDirectory).map(e => e.name + '/');
        const items = [...dirs, ...files];

        const selected = await context.window.showQuickPick(
          items.map(label => ({ label })),
          { placeHolder: 'Files in workspace root' }
        );

        if (selected) {
          const fullPath = context.fs.resolvePath(rootPath, selected.label);
          if (selected.label.endsWith('/')) {
            context.notifications.info(`Directory: ${fullPath}`);
          } else {
            const content = await context.fs.readFile(fullPath);
            context.notifications.info(`${selected.label}: ${content.length} chars`);
          }
        }
      } catch (err) {
        context.notifications.error(`Failed to list files: ${err.message}`);
      }
    }
  );
  context.subscriptions.push(listFilesCmd);

  // ═══════════════════════════════════════════════════════════════
  // 3. TERMINAL — Run a shell command
  // ═══════════════════════════════════════════════════════════════

  const runTerminalCmd = context.commands.registerCommand(
    'my-extension.runTerminal',
    async () => {
      const rootPath = context.fs.getWorkspacePath();
      context.terminal.runCommand('echo "Hello from extension!"', rootPath);
      context.notifications.info('Command sent to terminal');
    }
  );
  context.subscriptions.push(runTerminalCmd);

  // ═══════════════════════════════════════════════════════════════
  // 4. GIT — Show status of current repo
  // ═══════════════════════════════════════════════════════════════

  const gitStatusCmd = context.commands.registerCommand(
    'my-extension.gitStatus',
    async () => {
      const rootPath = context.fs.getWorkspacePath();
      if (!rootPath) {
        context.notifications.warn('No workspace folder open');
        return;
      }

      try {
        const status = await context.git.status(rootPath);
        const summary = [
          `Branch: ${status.branch}`,
          `Modified: ${status.staged.length + status.unstaged.length}`,
          `Untracked: ${status.untracked.length}`,
          `Conflicts: ${status.conflicted.length}`,
        ].join(' | ');
        context.notifications.info(summary);
      } catch (err) {
        context.notifications.error(`Git error: ${err.message}`);
      }
    }
  );
  context.subscriptions.push(gitStatusCmd);

  // ═══════════════════════════════════════════════════════════════
  // 5. STORAGE — Persist data across sessions
  // ═══════════════════════════════════════════════════════════════

  const count = context.storage.get('activationCount') || 0;
  context.storage.set('activationCount', count + 1);
  console.log(`[My Extension] Activated ${count + 1} times`);

  // ═══════════════════════════════════════════════════════════════
  // 6. STATUS BAR — Show custom info
  // ═══════════════════════════════════════════════════════════════

  const statusItem = context.ui.createStatusBarItem(
    'my-extension.status',
    `🚀 Ext v1.0.0 (${count + 1} runs)`,
    'right',
    100
  );
  context.subscriptions.push(statusItem);

  // ═══════════════════════════════════════════════════════════════
  // 7. EVENTS — Listen for file changes
  // ═══════════════════════════════════════════════════════════════

  const saveListener = context.events.onDidSaveTextDocument((doc) => {
    console.log(`[My Extension] File saved: ${doc.uri}`);
  });
  context.subscriptions.push(saveListener);

  // ═══════════════════════════════════════════════════════════════
  // 8. WORKSPACE — Read configuration
  // ═══════════════════════════════════════════════════════════════

  const config = context.workspace.getConfiguration('editor');
  const currentFontSize = config.get('fontSize', 14);
  console.log(`[My Extension] Editor font size: ${currentFontSize}`);

  // ═══════════════════════════════════════════════════════════════
  // Log startup
  // ═══════════════════════════════════════════════════════════════
  console.log('[My Extension] Activated');
}

/**
 * Called when the extension is deactivated.
 * Clean up timers, listeners, or external resources here.
 */
function deactivate() {
  console.log('[My Extension] Deactivated');
}

module.exports = { activate, deactivate };
