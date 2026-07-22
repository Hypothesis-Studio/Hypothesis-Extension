/**
 * Extension Template — Hypothesis Editor
 *
 * This file is the entry point for your extension.
 * It MUST export an object with an optional `activate()` and `deactivate()`.
 *
 * ─── API CONTEXT (passed to activate) ─────────────────────────────
 *
 * context.commands.registerCommand(id, handler)
 *   Register a command that can be invoked from the Command Palette.
 *   Returns a Disposable. Always push to context.subscriptions.
 *
 * context.commands.executeCommand(id, ...args)
 *   Execute another registered command by ID.
 *
 * context.window.showInformationMessage(text)
 * context.window.showWarningMessage(text)
 * context.window.showErrorMessage(text)
 *   Show a notification in the editor UI.
 *
 * context.workspace.getConfiguration(section)
 *   Returns { get(key, default?), has(key) } for reading user settings.
 *
 * context.subscriptions
 *   Array of Disposables. Push anything with a .dispose() method here
 *   so Hypothesis can clean up when the extension is deactivated.
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
 *   contributes.commands — Commands shown in Command Palette
 *   dependencies       — npm packages (auto-installed on install)
 */
'use strict';

/**
 * Called when the extension is activated.
 * @param {object} context — Plugin API context
 */
function activate(context) {
  // ── Register a simple command ───────────────────────────────────
  const helloCmd = context.commands.registerCommand(
    'my-extension.hello',
    () => {
      context.window.showInformationMessage('Hello from My Extension! 🎉');
    }
  );
  context.subscriptions.push(helloCmd);

  // ── Register a command that reads workspace config ──────────────
  const infoCmd = context.commands.registerCommand(
    'my-extension.showInfo',
    () => {
      const config = context.workspace.getConfiguration('editor');
      const fontSize = config.get('fontSize', 14);
      const theme   = config.get('theme', 'hypothesis-dark');
      context.window.showInformationMessage(
        `Font size: ${fontSize}, Theme: ${theme}`
      );
    }
  );
  context.subscriptions.push(infoCmd);

  // ── Log startup ─────────────────────────────────────────────────
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
