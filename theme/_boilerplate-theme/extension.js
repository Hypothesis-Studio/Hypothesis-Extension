/**
 * My Theme Pack — Hypothesis Editor Extension
 *
 * Registers Dark + Light themes with full UI coverage.
 * Monaco editor auto-detects light/dark from theme type.
 *
 * API Reference:
 *   ctx.theme.register(themeDef)       — Register workbench theme
 *   ctx.theme.injectCSS(id, css)       — Inject CSS into editor DOM (returns disposable)
 *   ctx.theme.onDidChange(callback)    — Listen for theme changes
 *   ctx.settings.set(key, value)       — Write a setting
 *   ctx.subscriptions.push(disposable) — Register cleanup
 *
 * Monaco IPC channels:
 *   ext:monaco:defineTheme   — Send theme definition to renderer for Monaco editor
 *   ext:monaco:unregister    — Unregister Monaco themes on deactivation
 *   ext:theme:revert         — Revert to default theme on deactivation
 */
const path = require('path');
const fs = require('fs');

/** CSS disposable handle (cleared on deactivate) */
let cssDisposable = null;

/** Registered Monaco theme IDs (for cleanup) */
const monacoThemeIds = [];

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Load a theme JSON file from the themes/ folder.
 * @param {string} filename — e.g. "my-dark.json"
 * @returns {object|null}
 */
function loadTheme(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'themes', filename), 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Register a Monaco editor theme via IPC.
 *
 * Sends the theme definition to the renderer which calls
 * monaco.editor.defineTheme() on its side.
 *
 * Multiple sends with delays ensure the theme is available
 * even if Monaco loads asynchronously.
 *
 * @param {string} themeId    — Unique theme identifier
 * @param {string} baseTheme  — "vs-dark" or "vs" (light)
 * @param {object} def        — Theme JSON definition
 */
function registerMonacoTheme(themeId, baseTheme, def) {
  // Build token rules from tokenColors
  const rules = [];
  if (def.tokenColors) {
    for (const tc of def.tokenColors) {
      const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope];
      for (const scope of scopes) {
        rules.push({
          token: scope,
          foreground: tc.settings?.foreground?.replace('#', ''),
          fontStyle: tc.settings?.fontStyle || '',
        });
      }
    }
  }

  // Build editor color map
  const colors = {};
  for (const [key, value] of Object.entries(def.colors || {})) {
    if (typeof value === 'string') colors[key] = value;
  }

  const payload = { themeId, baseTheme, rules, colors };

  // Send multiple times to handle async Monaco initialization
  const send = () => {
    try {
      const win = require('electron').BrowserWindow.getAllWindows()[0];
      if (win && !win.isDestroyed()) {
        win.webContents.send('ext:monaco:defineTheme', payload);
      }
    } catch {}
  };
  send();
  setTimeout(send, 300);
  setTimeout(send, 800);
  setTimeout(send, 1500);

  monacoThemeIds.push(themeId);
}

/**
 * Build :root CSS variables from a theme definition.
 *
 * Maps:
 *   colors.*     → --theme-{converted-key}
 *   cssVars.*    → direct CSS custom properties
 *   tokenColors  → --editor-{scope} syntax variables
 *
 * @param {object} def — Theme JSON definition
 * @returns {string} CSS text
 */
function buildCSS(def) {
  const c = def.colors || {};

  // Extract syntax token colors
  const tokens = {};
  if (def.tokenColors) {
    for (const tc of def.tokenColors) {
      const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope];
      for (const scope of scopes) {
        if (tc.settings?.foreground) tokens[scope] = tc.settings.foreground;
      }
    }
  }

  let css = ':root {\n';

  // Workbench colors → CSS variables
  for (const [key, value] of Object.entries(c)) {
    if (typeof value === 'string') {
      const varName = '--theme-' + key.replace(/\./g, '-').replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${varName}: ${value};\n`;
    }
  }

  // Custom cssVars from theme definition
  const cv = def.cssVars || {};
  for (const [k, v] of Object.entries(cv)) {
    if (typeof v === 'string') css += `  ${k}: ${v};\n`;
  }

  // Syntax highlight variables
  const syntaxMap = {
    comment:  '--editor-comment',
    keyword:  '--editor-keyword',
    string:   '--editor-string',
    number:   '--editor-number',
    function: '--editor-function',
    variable: '--editor-variable',
    type:     '--editor-type',
  };
  for (const [scope, varName] of Object.entries(syntaxMap)) {
    if (tokens[scope]) css += `  ${varName}: ${tokens[scope]};\n`;
  }

  css += '}';
  return css;
}

// ── Extension Lifecycle ────────────────────────────────────────────

/**
 * Called when the extension is activated.
 *
 * @param {object} ctx — Extension context
 * @param {object} ctx.theme     — Theme API (register, injectCSS, onDidChange)
 * @param {object} ctx.settings  — Settings API (get, set)
 * @param {object} ctx.commands  — Commands API (register)
 * @param {Array}  ctx.subscriptions — Push disposables here for auto-cleanup
 */
function activate(ctx) {
  const { theme, settings, commands } = ctx;

  // ── 1. Load theme definitions ──────────────────────────────────
  const dark = loadTheme('my-dark.json');
  const light = loadTheme('my-light.json');

  // ── 2. Register workbench themes ───────────────────────────────
  // theme.register() accepts a theme definition object.
  // The editor uses `id` to identify themes and `type` for light/dark detection.
  if (dark) ctx.subscriptions.push(theme.register(dark));
  if (light) ctx.subscriptions.push(theme.register(light));

  // ── 3. Register Monaco editor themes ───────────────────────────
  // Monaco needs separate registration via IPC.
  // baseTheme: "vs-dark" for dark themes, "vs" for light themes.
  if (dark) registerMonacoTheme('my-dark', 'vs-dark', dark);
  if (light) registerMonacoTheme('my-light', 'vs', light);

  // ── 4. Set default theme ───────────────────────────────────────
  // This activates the theme on first install.
  settings.set('workbench.colorTheme', 'my-dark');

  // ── 5. Listen for theme changes ────────────────────────────────
  // Re-inject CSS when user switches between dark ↔ light variants.
  ctx.subscriptions.push(theme.onDidChange((themeId) => {
    const def = themeId === 'my-light' ? light : dark;
    if (def) {
      if (cssDisposable) cssDisposable.dispose();
      cssDisposable = theme.injectCSS('my-theme-vars', buildCSS(def));
    }
  }));

  // ── 6. Inject initial CSS ──────────────────────────────────────
  // theme.injectCSS() returns a disposable — push it for auto-cleanup.
  if (dark) {
    cssDisposable = theme.injectCSS('my-theme-vars', buildCSS(dark));
    ctx.subscriptions.push(cssDisposable);
  }

  // ── 7. Register commands ───────────────────────────────────────
  // Commands listed in package.json → contributes.commands
  // must be registered here with their handler functions.
  if (commands) {
    ctx.subscriptions.push(commands.registerCommand('my-theme.activateDark', () => {
      settings.set('workbench.colorTheme', 'my-dark');
    }));
    ctx.subscriptions.push(commands.registerCommand('my-theme.activateLight', () => {
      settings.set('workbench.colorTheme', 'my-light');
    }));
  }

  console.log('[My Theme Pack] activated');
}

/**
 * Called when the extension is deactivated.
 * Clean up all resources: CSS, Monaco themes, IPC listeners.
 */
function deactivate() {
  // Dispose injected CSS
  if (cssDisposable) {
    cssDisposable.dispose();
    cssDisposable = null;
  }

  // Unregister Monaco themes and revert workbench
  try {
    const win = require('electron').BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      if (monacoThemeIds.length > 0) {
        win.webContents.send('ext:monaco:unregister', [...monacoThemeIds]);
      }
      win.webContents.send('ext:theme:revert');
    }
  } catch {}

  monacoThemeIds.length = 0;
  console.log('[My Theme Pack] deactivated');
}

module.exports = { activate, deactivate };
