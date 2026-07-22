/**
 * Live Server Extension — Hypothesis Editor
 *
 * Launches a local HTTP dev server with live reload.
 * Auto-refreshes your browser when HTML, CSS, or JS files change.
 *
 * ── Commands ──────────────────────────────────────────────────────
 *   Live Server: Start  — start HTTP server (default port 5500)
 *   Live Server: Stop   — stop the running server
 *
 * ── No external dependencies required ─────────────────────────────
 * Uses only Node.js built-ins: http, fs, path, crypto, url, net.
 */
'use strict';

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const url    = require('url');
const net    = require('net');
const crypto = require('crypto');
const { BrowserWindow, dialog: nativeDialog } = require('electron');

// ── State ─────────────────────────────────────────────────────────
let httpServer = null;
let watcher = null;
let wsClients = new Set();
let liveReloadPort = null;
let serverRoot = null;
let statusBarItem = null;

const DEFAULT_PORT = 5500;
const INJECTED_SCRIPT_ID = '__hyp_live_reload__';

// ── MIME types ────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',  '.js':  'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.svg':  'image/svg+xml',  '.png':  'image/png',  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',     '.gif':  'image/gif',  '.webp': 'image/webp',
  '.ico':  'image/x-icon',   '.woff': 'font/woff',  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',       '.otf':  'font/otf',
  '.mp4':  'video/mp4',      '.webm': 'video/webm', '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',      '.pdf':  'application/pdf',
  '.zip':  'application/zip','.tar':  'application/x-tar',
  '.gz':   'application/gzip','.wasm': 'application/wasm',
  '.txt':  'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.csv':  'text/csv; charset=utf-8',   '.log':'text/plain; charset=utf-8',
};

// ── Helpers ───────────────────────────────────────────────────────
function log(msg) { console.log(`[Live Server] ${msg}`); }

function getMime(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function isBinary(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const textExts = new Set([
    '.html','.htm','.css','.js','.mjs','.json','.xml','.svg','.txt','.md','.csv','.log',
    '.yaml','.yml','.toml','.ini','.cfg','.conf','.env','.gitignore',
    '.ts','.tsx','.jsx','.py','.rb','.go','.rs','.java','.c','.cpp','.h','.hpp',
    '.cs','.swift','.kt','.php','.sh','.bash','.zsh','.ps1','.bat','.cmd',
    '.sql','.r','.lua','.pl','.pm','.ex','.exs','.hs','.elm','.vue','.svelte',
    '.astro','.ejs','.hbs','.pug','.scss','.sass','.less','.styl','.coffee',
  ]);
  return !textExts.has(ext);
}

function isInjectable(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.html' || ext === '.htm';
}

// ── Live reload client script (injected into HTML) ────────────────
function liveReloadScript(port, token) {
  return `\n<script id="${INJECTED_SCRIPT_ID}">\n` +
`(function() {\n` +
`  var ws;\n` +
`  var retry = 0;\n` +
`  function connect() {\n` +
`    ws = new WebSocket('ws://localhost:${port}/?token=${token}');\n` +
`    ws.onopen = function() { retry = 0; };\n` +
`    ws.onmessage = function(e) {\n` +
`      if (e.data === 'reload') location.reload();\n` +
`    };\n` +
`    ws.onclose = function() {\n` +
`      setTimeout(connect, Math.min(1000 * Math.pow(2, retry++), 10000));\n` +
`    };\n` +
`  }\n` +
`  connect();\n` +
`})();\n` +
`</script>\n`;
}

// ── WebSocket (RFC 6455) minimal implementation ───────────────────
function acceptWebSocket(req, socket, token) {
  const parsed = new URL(req.url, 'http://localhost');
  if (parsed.searchParams.get('token') !== token) { socket.destroy(); return null; }
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return null; }
  const accept = crypto.createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  return socket;
}

function sendWsFrame(socket, data) {
  const buf = Buffer.from(data, 'utf-8');
  let header;
  if (buf.length < 126) {
    header = Buffer.alloc(2); header[0] = 0x81; header[1] = buf.length;
  } else if (buf.length < 65536) {
    header = Buffer.alloc(4); header[0] = 0x81; header[1] = 126;
    header.writeUInt16BE(buf.length, 2);
  } else {
    header = Buffer.alloc(10); header[0] = 0x81; header[1] = 127;
    header.writeBigUInt64BE(BigInt(buf.length), 2);
  }
  try { socket.write(Buffer.concat([header, buf])); }
  catch (_) { wsClients.delete(socket); }
}

function broadcast(msg) { for (const c of wsClients) sendWsFrame(c, msg); }

// ── Port detection ────────────────────────────────────────────────
function isPortFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => { s.close(); resolve(true); });
    s.listen(port, '0.0.0.0');
  });
}

async function findFreePort(start) {
  for (let p = start; p < start + 100; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error('No free port found');
}

// ── HTTP request handler ──────────────────────────────────────────
function makeHandler(root, port, token) {
  return function handler(req, res) {
    const parsed = url.parse(req.url);
    let reqPath = decodeURIComponent(parsed.pathname || '/');
    if (reqPath === '/') reqPath = '/index.html';

    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(root, safePath);
    if (!filePath.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        if (!err && stat.isDirectory()) {
          const idx = path.join(filePath, 'index.html');
          if (fs.existsSync(idx)) return serveFile(idx, root, port, token, res);
          return serveDirectory(filePath, root, reqPath, port, token, res);
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 — Not Found</h1>');
        return;
      }
      serveFile(filePath, root, port, token, res);
    });
  };
}

function serveFile(filePath, root, port, token, res) {
  if (isBinary(filePath)) {
    res.writeHead(200, { 'Content-Type': getMime(filePath) });
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) { res.writeHead(500); res.end('Internal Server Error'); return; }
    if (isInjectable(filePath)) {
      const script = liveReloadScript(port, token);
      const bodyClose = content.lastIndexOf('</body>');
      content = bodyClose !== -1
        ? content.slice(0, bodyClose) + script + content.slice(bodyClose)
        : content + script;
    }
    res.writeHead(200, {
      'Content-Type': getMime(filePath),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(content);
  });
}

function serveDirectory(dirPath, root, reqPath, port, token, res) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, entries) => {
    if (err) { res.writeHead(500); res.end('Internal Server Error'); return; }
    const parentLink = reqPath !== '/'
      ? `<a href="${path.dirname(reqPath)}" style="color:#888">&#11014; Parent Directory</a><br><br>` : '';
    const listing = entries
      .sort((a, b) => (a.isDirectory() !== b.isDirectory() ? (a.isDirectory() ? -1 : 1) : a.name.localeCompare(b.name)))
      .map(e => {
        const icon = e.isDirectory() ? '\uD83D\uDCC1' : '\uD83D\uDCC4';
        const href = path.posix.join(reqPath, e.name) + (e.isDirectory() ? '/' : '');
        return `<div style="padding:4px 0"><span style="margin-right:8px">${icon}</span>` +
               `<a href="${href}" style="color:#4fc1ff;text-decoration:none">${e.name}</a></div>`;
      }).join('');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Index of ${reqPath}</title></head>` +
      `<body style="font-family:system-ui,sans-serif;background:#1e1e1e;color:#ccc;padding:24px">` +
      `<h2 style="color:#fff">\uD83D\uDCC2 Index of ${reqPath}</h2>${parentLink}${listing}</body></html>`
    );
  });
}

// ── File watcher ──────────────────────────────────────────────────
function startWatcher(root) {
  stopWatcher();
  let debounce = null;
  try {
    watcher = fs.watch(root, { recursive: true }, (_eventType, filename) => {
      if (!filename) return;
      clearTimeout(debounce);
      debounce = setTimeout(() => { log(`File changed: ${filename}`); broadcast('reload'); }, 100);
    });
    log(`Watching ${root} for changes`);
  } catch (e) { log(`Watcher error: ${e.message}`); }
}

function stopWatcher() { if (watcher) { try { watcher.close(); } catch (_) {} watcher = null; } }

// ── Renderer notifications ────────────────────────────────────────
function notifyRenderer(running, serverUrl) {
  try {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win || win.isDestroyed()) return;

    win.webContents.send('live-server:status', { running, url: serverUrl || null });

    if (running && serverUrl) {
      win.webContents.send('extension:console', { level: 'success', source: 'Live Server', message: `Server started at ${serverUrl}` });
      win.webContents.send('extension:console', { level: 'info',    source: 'Live Server', message: `Serving: ${serverRoot}` });
      win.webContents.send('extension:console', { level: 'info',    source: 'Live Server', message: 'Open the URL in your browser — files reload automatically on save.' });
      win.webContents.send('extension:console-open');
    } else if (!running) {
      win.webContents.send('extension:console', { level: 'info', source: 'Live Server', message: 'Server stopped.' });
    }
  } catch (_) { /* ignore */ }
}

// ── Status bar ────────────────────────────────────────────────────
function updateStatusBar(context, running, serverUrl) {
  if (statusBarItem) {
    if (running && serverUrl) {
      statusBarItem.updateItem('live-server.status', `🟢 Live Server: ${serverUrl}`);
    } else {
      statusBarItem.updateItem('live-server.status', '⚪ Live Server: Off');
    }
  }
}

// ── Resolve workspace root path ───────────────────────────────────
async function resolveRootPath(context) {
  if (context.workspace.rootPath) return context.workspace.rootPath;
  try {
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      const rootPath = await win.webContents.executeJavaScript(
        `(function() { try { var r = localStorage.getItem('hypothesis-session'); if (r) { var d = JSON.parse(r); if (d.rootPath) return d.rootPath; } } catch(e) {} return null; })()`
      );
      if (rootPath) return rootPath;
    }
  } catch (_) { /* ignore */ }
  return null;
}

// ── Server control ────────────────────────────────────────────────
async function startServer(context) {
  if (httpServer) {
    context.notifications.info('Live Server is already running at http://localhost:' + liveReloadPort);
    return;
  }

  let root = await resolveRootPath(context);

  if (!root) {
    try {
      const win = BrowserWindow.getAllWindows()[0];
      if (win && !win.isDestroyed()) {
        const result = await nativeDialog.showOpenDialog(win, { title: 'Live Server — Select folder', properties: ['openDirectory'] });
        if (!result.canceled && result.filePaths.length > 0) root = result.filePaths[0];
      }
    } catch (_) { /* ignore */ }
  }

  if (!root) {
    context.notifications.error('Live Server: No folder is open. Open a folder first (File → Open Folder)');
    return;
  }

  const config = context.workspace.getConfiguration('liveServer');
  const port = await findFreePort(config.get('port', DEFAULT_PORT));
  const token = crypto.randomBytes(16).toString('hex');
  serverRoot = root;
  liveReloadPort = port;

  const server = http.createServer(makeHandler(root, port, token));
  server.on('upgrade', (req, socket) => {
    const client = acceptWebSocket(req, socket, token);
    if (client) {
      wsClients.add(client);
      client.on('close', () => wsClients.delete(client));
      client.on('error', () => wsClients.delete(client));
    }
  });

  server.listen(port, '0.0.0.0', () => {
    httpServer = server;
    startWatcher(root);
    const serverUrl = `http://localhost:${port}`;
    log(`Started at ${serverUrl} serving ${root}`);
    notifyRenderer(true, serverUrl);
    updateStatusBar(context, true, serverUrl);
    context.notifications.success(`Live Server started: ${serverUrl}`);
  });

  server.on('error', (e) => {
    context.notifications.error(`Live Server error: ${e.message}`);
    httpServer = null;
  });
}

function stopServer(context) {
  if (!httpServer) {
    if (context) context.notifications.info('Live Server is not running.');
    return;
  }
  for (const c of wsClients) { try { c.destroy(); } catch (_) {} }
  wsClients.clear();
  stopWatcher();
  httpServer.close(() => { log('Server stopped'); });
  httpServer = null;
  liveReloadPort = null;
  serverRoot = null;
  notifyRenderer(false, null);
  if (context) updateStatusBar(context, false, null);
}

// ── Extension entry points ────────────────────────────────────────
function activate(context) {
  try {
    log('Activating…');

    // Commands
    const startCmd = context.commands.registerCommand('live-server.start', () => startServer(context));
    const stopCmd  = context.commands.registerCommand('live-server.stop',  () => stopServer(context));
    context.subscriptions.push(startCmd, stopCmd);

    // Status bar
    statusBarItem = context.ui.createStatusBarItem(
      'live-server.status',
      '⚪ Live Server: Off',
      'right',
      50
    );
    context.subscriptions.push(statusBarItem);

    // Listen for file saves to show reload count
    const saveListener = context.events.onDidSaveTextDocument((doc) => {
      if (httpServer) {
        log(`Saved: ${doc.uri} — reloading browser`);
      }
    });
    context.subscriptions.push(saveListener);

    log('Activated — Command Palette → "Live Server"');
  } catch (e) {
    log('Activation error: ' + e.message);
    throw e;
  }
}

function deactivate() { stopServer(null); log('Deactivated'); }

module.exports = { activate, deactivate };
