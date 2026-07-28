/**
 * Material Theme Pack — Hypothesis Editor Extension
 *
 * Registers Material Dark + Material Light with full UI coverage.
 * Monaco editor auto-detects light/dark from theme type.
 */
const path = require('path');
const fs   = require('fs');

let cssDisposable = null;

function loadTheme(f) { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'themes', f), 'utf-8')); } catch { return null; } }

function registerMonacoTheme(themeId, baseTheme, def) {
  const rules = [];
  if (def.tokenColors) for (const tc of def.tokenColors) { const s = Array.isArray(tc.scope) ? tc.scope : [tc.scope]; for (const sc of s) rules.push({ token: sc, foreground: tc.settings?.foreground?.replace('#', ''), fontStyle: tc.settings?.fontStyle || '' }); }
  const colors = {}; for (const [k, v] of Object.entries(def.colors || {})) if (typeof v === 'string') colors[k] = v;
  const payload = { themeId, baseTheme, rules, colors };
  const send = () => { try { const w = require('electron').BrowserWindow.getAllWindows()[0]; if (w && !w.isDestroyed()) w.webContents.send('ext:monaco:defineTheme', payload); } catch {} };
  send(); setTimeout(send, 300); setTimeout(send, 800); setTimeout(send, 1500);
}

function activate(ctx) {
  const { theme, settings } = ctx;

  const dark = loadTheme('material-dark.json');
  const light = loadTheme('material-light.json');

  // Register workbench themes
  if (dark) ctx.subscriptions.push(theme.register(dark));
  if (light) ctx.subscriptions.push(theme.register(light));

  // Register Monaco editor themes (base = vs-dark for dark, vs for light)
  if (dark) registerMonacoTheme('material-dark', 'vs-dark', dark);
  if (light) registerMonacoTheme('material-light', 'vs', light);

  // Auto-select Material Dark
  settings.set('workbench.colorTheme', 'material-dark');

  // Re-inject CSS when theme changes (dark ↔ light)
  ctx.subscriptions.push(theme.onDidChange((id) => {
    const def = id === 'material-light' ? light : dark;
    if (def) {
      if (cssDisposable) cssDisposable.dispose();
      const css = buildCSS(def);
      cssDisposable = theme.injectCSS('material-theme-vars', css);
    }
  }));

  // Inject initial CSS
  if (dark) {
    const css = buildCSS(dark);
    cssDisposable = theme.injectCSS('material-theme-vars', css);
    ctx.subscriptions.push(cssDisposable);
  }

  console.log('[Material Theme Pack] activated');
}

/** Build :root CSS from theme definition */
function buildCSS(def) {
  const c = def.colors || {};
  const tokens = {};
  if (def.tokenColors) for (const tc of def.tokenColors) { const s = Array.isArray(tc.scope) ? tc.scope : [tc.scope]; for (const sc of s) if (tc.settings?.foreground) tokens[sc] = tc.settings.foreground; }
  let css = ':root {\n';
  for (const [key, value] of Object.entries(c)) {
    if (typeof value === 'string') css += `  --theme-${key.replace(/\./g, '-').replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
  }
  const cv = def.cssVars || {};
  for (const [k, v] of Object.entries(cv)) if (typeof v === 'string') css += `  ${k}: ${v};\n`;
  // Syntax vars from tokenColors
  const tm = { comment:'--editor-comment', keyword:'--editor-keyword', string:'--editor-string', number:'--editor-number', function:'--editor-function', variable:'--editor-variable', type:'--editor-type' };
  for (const [scope, varName] of Object.entries(tm)) if (tokens[scope]) css += `  ${varName}: ${tokens[scope]};\n`;
  css += '}';
  return css;
}

function deactivate() {
  if (cssDisposable) { cssDisposable.dispose(); cssDisposable = null; }
  try {
    const w = require('electron').BrowserWindow.getAllWindows()[0];
    if (w && !w.isDestroyed()) { w.webContents.send('ext:monaco:unregister', ['material-dark', 'material-light']); w.webContents.send('ext:theme:revert'); }
  } catch {}
  console.log('[Material Theme Pack] deactivated');
}

module.exports = { activate, deactivate };
