/**
 * Tokyo Night — Hypothesis Editor Extension
 */
const path = require('path');
const fs = require('fs');

let cssDisposable = null;
const monacoThemeIds = [];

function loadTheme(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'themes', filename), 'utf-8'));
  } catch { return null; }
}

function registerMonacoTheme(themeId, baseTheme, def) {
  const rules = [];
  if (def.tokenColors) {
    for (const tc of def.tokenColors) {
      const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope];
      for (const scope of scopes) {
        rules.push({ token: scope, foreground: tc.settings?.foreground?.replace('#', ''), fontStyle: tc.settings?.fontStyle || '' });
      }
    }
  }
  const colors = {};
  for (const [key, value] of Object.entries(def.colors || {})) {
    if (typeof value === 'string') colors[key] = value;
  }
  const payload = { themeId, baseTheme, rules, colors };
  const send = () => {
    try {
      const win = require('electron').BrowserWindow.getAllWindows()[0];
      if (win && !win.isDestroyed()) win.webContents.send('ext:monaco:defineTheme', payload);
    } catch {}
  };
  send(); setTimeout(send, 300); setTimeout(send, 800); setTimeout(send, 1500);
  monacoThemeIds.push(themeId);
}

function buildCSS(def) {
  const c = def.colors || {};
  const tokens = {};
  if (def.tokenColors) {
    for (const tc of def.tokenColors) {
      const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope];
      for (const scope of scopes) { if (tc.settings?.foreground) tokens[scope] = tc.settings.foreground; }
    }
  }
  let css = ':root {\n';
  for (const [key, value] of Object.entries(c)) {
    if (typeof value === 'string') {
      const varName = '--theme-' + key.replace(/\./g, '-').replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${varName}: ${value};\n`;
    }
  }
  const cv = def.cssVars || {};
  for (const [k, v] of Object.entries(cv)) { if (typeof v === 'string') css += `  ${k}: ${v};\n`; }
  const syntaxMap = { comment: '--editor-comment', keyword: '--editor-keyword', string: '--editor-string', number: '--editor-number', function: '--editor-function', variable: '--editor-variable', type: '--editor-type' };
  for (const [scope, varName] of Object.entries(syntaxMap)) { if (tokens[scope]) css += `  ${varName}: ${tokens[scope]};\n`; }
  css += '}';
  return css;
}

function activate(ctx) {
  const { theme, settings, commands } = ctx;
  const night = loadTheme('tokyo-night.json');
  const storm = loadTheme('tokyo-storm.json');
  if (night) ctx.subscriptions.push(theme.register(night));
  if (storm) ctx.subscriptions.push(theme.register(storm));
  if (night) registerMonacoTheme('tokyo-night', 'vs-dark', night);
  if (storm) registerMonacoTheme('tokyo-storm', 'vs-dark', storm);
  settings.set('workbench.colorTheme', 'tokyo-night');
  ctx.subscriptions.push(theme.onDidChange((themeId) => {
    const def = themeId === 'tokyo-storm' ? storm : night;
    if (def) { if (cssDisposable) cssDisposable.dispose(); cssDisposable = theme.injectCSS('tokyo-night-vars', buildCSS(def)); }
  }));
  if (night) { cssDisposable = theme.injectCSS('tokyo-night-vars', buildCSS(night)); ctx.subscriptions.push(cssDisposable); }
  if (commands) {
    ctx.subscriptions.push(commands.registerCommand('tokyo-night.activateNight', () => settings.set('workbench.colorTheme', 'tokyo-night')));
    ctx.subscriptions.push(commands.registerCommand('tokyo-night.activateStorm', () => settings.set('workbench.colorTheme', 'tokyo-storm')));
  }
  console.log('[Tokyo Night] activated');
}

function deactivate() {
  if (cssDisposable) { cssDisposable.dispose(); cssDisposable = null; }
  try {
    const win = require('electron').BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      if (monacoThemeIds.length > 0) win.webContents.send('ext:monaco:unregister', [...monacoThemeIds]);
      win.webContents.send('ext:theme:revert');
    }
  } catch {}
  monacoThemeIds.length = 0;
  console.log('[Tokyo Night] deactivated');
}

module.exports = { activate, deactivate };
