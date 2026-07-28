const path = require('path');
const fs = require('fs');
let cssDisposable = null;
const monacoThemeIds = [];
function loadTheme(f) { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'themes', f), 'utf-8')); } catch { return null; } }
function registerMonacoTheme(themeId, baseTheme, def) {
  const rules = [];
  if (def.tokenColors) { for (const tc of def.tokenColors) { const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope]; for (const s of scopes) rules.push({ token: s, foreground: tc.settings?.foreground?.replace('#', ''), fontStyle: tc.settings?.fontStyle || '' }); } }
  const colors = {}; for (const [k, v] of Object.entries(def.colors || {})) { if (typeof v === 'string') colors[k] = v; }
  const payload = { themeId, baseTheme, rules, colors };
  const send = () => { try { const w = require('electron').BrowserWindow.getAllWindows()[0]; if (w && !w.isDestroyed()) w.webContents.send('ext:monaco:defineTheme', payload); } catch {} };
  send(); setTimeout(send, 300); setTimeout(send, 800); setTimeout(send, 1500);
  monacoThemeIds.push(themeId);
}
function buildCSS(def) {
  const c = def.colors || {}; const tokens = {};
  if (def.tokenColors) { for (const tc of def.tokenColors) { const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope]; for (const s of scopes) { if (tc.settings?.foreground) tokens[s] = tc.settings.foreground; } } }
  let css = ':root {\n';
  for (const [k, v] of Object.entries(c)) { if (typeof v === 'string') css += `  --theme-${k.replace(/\./g, '-').replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};\n`; }
  for (const [k, v] of Object.entries(def.cssVars || {})) { if (typeof v === 'string') css += `  ${k}: ${v};\n`; }
  const sm = { comment: '--editor-comment', keyword: '--editor-keyword', string: '--editor-string', number: '--editor-number', function: '--editor-function', variable: '--editor-variable', type: '--editor-type' };
  for (const [s, n] of Object.entries(sm)) { if (tokens[s]) css += `  ${n}: ${tokens[s]};\n`; }
  css += '}'; return css;
}
function activate(ctx) {
  const { theme, settings, commands } = ctx;
  const dark = loadTheme('synthwave-84.json');
  if (dark) ctx.subscriptions.push(theme.register(dark));
  if (dark) registerMonacoTheme('synthwave-84', 'vs-dark', dark);
  settings.set('workbench.colorTheme', 'synthwave-84');
  ctx.subscriptions.push(theme.onDidChange(() => { if (dark) { if (cssDisposable) cssDisposable.dispose(); cssDisposable = theme.injectCSS('synthwave84-vars', buildCSS(dark)); } }));
  if (dark) { cssDisposable = theme.injectCSS('synthwave84-vars', buildCSS(dark)); ctx.subscriptions.push(cssDisposable); }
  if (commands) { ctx.subscriptions.push(commands.registerCommand('synthwave84.activate', () => settings.set('workbench.colorTheme', 'synthwave-84'))); }
  console.log('[Synthwave 84] activated');
}
function deactivate() {
  if (cssDisposable) { cssDisposable.dispose(); cssDisposable = null; }
  try { const w = require('electron').BrowserWindow.getAllWindows()[0]; if (w && !w.isDestroyed()) { if (monacoThemeIds.length) w.webContents.send('ext:monaco:unregister', [...monacoThemeIds]); w.webContents.send('ext:theme:revert'); } } catch {}
  monacoThemeIds.length = 0; console.log('[Synthwave 84] deactivated');
}
module.exports = { activate, deactivate };
