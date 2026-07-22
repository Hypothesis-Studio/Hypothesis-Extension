# Live Server Extension

Local development server with **live reload** — auto-refreshes your browser when HTML/CSS/JS files change in the workspace.

## Commands

| Command | Description |
|---------|-------------|
| **Live Server: Start Server** | Start HTTP server on default port (5500) |
| **Live Server: Stop Server** | Stop the running server |
| **Live Server: Open in Browser** | Start server + open browser automatically |
| **Live Server: Toggle Server** | Start/stop toggle |

Access via **Command Palette** (`Ctrl+Shift+P`) → type `Live Server`.

## How It Works

1. Opens a workspace folder in Hypothesis
2. Run `Live Server: Open in Browser` from the Command Palette
3. Browser opens showing your `index.html`
4. Edit any file → browser auto-refreshes

## Features

- **Zero dependencies** — uses only Node.js built-ins
- **Live reload** via WebSocket (RFC 6455, no external packages)
- **Auto-inject** — reload script injected into HTML responses automatically
- **Directory listing** — navigate folders in the browser
- **Free port detection** — auto-finds next available port if 5500 is taken
- **MIME type support** — 40+ file types handled correctly
- **Secure** — token-authenticated WebSocket connections
- **Path traversal protection** — cannot access files outside workspace

## Configuration

Default port: `5500`

To change, add to your Hypothesis settings:
```json
{ "liveServer.port": 3000 }
```

## Install

### From folder (development)
1. Place the `Live-Server` folder in your extensions directory
2. Hypothesis Editor → Extensions → Install from Folder

### As .hyp package (distribution)
```bash
tar -cf live-server-1.0.0.hyp -C /path/to/parent Live-Server
```
Then: Extensions → Install .hyp File

## Architecture

```
extension.js — single file, no build step
├── HTTP server (Node.js http module)
├── WebSocket server (raw RFC 6455, no ws package)
├── File watcher (fs.watch, recursive)
└── Live reload script (auto-injected into HTML)
```

## Notes

- Only HTML files get the live-reload script injected
- CSS/JS/image changes trigger a full page reload via WebSocket
- The server binds to `0.0.0.0` — accessible from other devices on your network
- WebSocket uses a random token per session for security
