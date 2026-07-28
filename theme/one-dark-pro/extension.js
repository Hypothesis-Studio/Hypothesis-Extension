/**
 * One Dark Pro — Hypothesis Editor Extension
 *
 * Registers One Dark Pro + One Light Pro with full UI coverage.
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

  const dark = loadTheme('one-dark-pro.json');
  const light = loadTheme('one-light-pro.json');

  if (dark) ctx.subscriptions.push(theme.register(dark));
  if (light) ctx.subscriptions.push(theme.register(light));

  if (dark) registerMonacoTheme('one-dark-pro', 'vs-dark', dark);
  if (light) registerMonacoTheme('one-light-pro', 'vs', light);

  // Auto-select One Dark Pro
  settings.set('workbench.colorTheme', 'one-dark-pro');

  ctx.subscriptions.push(theme.onDidChange((id) => {
    const def = id === 'one-light-pro' ? light : dark;
    if (def) {
      if (cssDisposable) cssDisposable.dispose();
      const css = buildCSS(def);
      cssDisposable = theme.injectCSS('one-dark-vars', css);
    }
  }));

  if (dark) {
    const css = buildCSS(dark);
    cssDisposable = theme.injectCSS('one-dark-vars', css);
    ctx.subscriptions.push(cssDisposable);
  }

  console.log('[One Dark Pro] activated');
}

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
  const tm = { comment:'--editor-comment', keyword:'--editor-keyword', string:'--editor-string', number:'--editor-number', function:'--editor-function', variable:'--editor-variable', type:'--editor-type' };
  for (const [scope, varName] of Object.entries(tm)) if (tokens[scope]) css += `  ${varName}: ${tokens[scope]};\n`;
  css += '}';
  return css;
}

function deactivate() {
  if (cssDisposable) { cssDisposable.dispose(); cssDisposable = null; }
  try {
    const w = require('electron').BrowserWindow.getAllWindows()[0];
    if (w && !w.isDestroyed()) { w.webContents.send('ext:monaco:unregister', ['one-dark-pro', 'one-light-pro']); w.webContents.send('ext:theme:revert'); }
  } catch {}
  console.log('[One Dark Pro] deactivated');
}

module.exports = { activate, deactivate };
