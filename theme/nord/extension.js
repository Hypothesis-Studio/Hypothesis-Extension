const path = require('path');
const fs = require('fs');

let cssDisposable = null;
const monacoThemeIds = [];

function loadTheme(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'themes', filename), 'utf-8'));
  } catch {
    return null;
  }
}

function registerMonacoTheme(themeId, baseTheme, def) {
  const rules = [];

  if (def.tokenColors) {
    for (const tc of def.tokenColors) {
      const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope];
      for (const scope of scopes) {
        rules.push({
          token: scope,
          foreground: tc.settings?.foreground?.replace('#', ''),
          fontStyle: tc.settings?.fontStyle || ''
        });
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

  send();
  setTimeout(send, 300);
  setTimeout(send, 800);
  setTimeout(send, 1500);
  monacoThemeIds.push(themeId);
}

function buildCSS(def) {
  const colors = def.colors || {};
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
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      const varName = '--theme-' + key.replace(/\./g, '-').replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${varName}: ${value};\n`;
    }
  }
  for (const [key, value] of Object.entries(def.cssVars || {})) {
    if (typeof value === 'string') css += `  ${key}: ${value};\n`;
  }

  const syntaxMap = {
    comment: '--editor-comment',
    keyword: '--editor-keyword',
    string: '--editor-string',
    number: '--editor-number',
    function: '--editor-function',
    variable: '--editor-variable',
    type: '--editor-type'
  };
  for (const [scope, varName] of Object.entries(syntaxMap)) {
    if (tokens[scope]) css += `  ${varName}: ${tokens[scope]};\n`;
  }

  css += '}';
  return css;
}

function activate(ctx) {
  const { theme, settings } = ctx;

  const dark = loadTheme('nord.json');

  if (dark) ctx.subscriptions.push(theme.register(dark));
  if (dark) registerMonacoTheme('nord', 'vs-dark', dark);

  settings.set('workbench.colorTheme', 'nord');

  ctx.subscriptions.push(theme.onDidChange(() => {
    if (dark) {
      if (cssDisposable) cssDisposable.dispose();
      cssDisposable = theme.injectCSS('nord-vars', buildCSS(dark));
    }
  }));

  if (dark) {
    cssDisposable = theme.injectCSS('nord-vars', buildCSS(dark));
    ctx.subscriptions.push(cssDisposable);
  }

  console.log('[Nord] activated');
}

function deactivate() {
  if (cssDisposable) {
    cssDisposable.dispose();
    cssDisposable = null;
  }
  try {
    const win = require('electron').BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      if (monacoThemeIds.length) win.webContents.send('ext:monaco:unregister', [...monacoThemeIds]);
      win.webContents.send('ext:theme:revert');
    }
  } catch {}
  monacoThemeIds.length = 0;
  console.log('[Nord] deactivated');
}

module.exports = { activate, deactivate };
