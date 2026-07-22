# Prettier Extension for Hypothesis Editor

This extension integrates [Prettier](https://prettier.io) into Hypothesis Editor for automatic code formatting.

## Features

- **Format Document** — Format the entire active document
- **Format Selection** — Format only the selected text

Commands are automatically registered in the **Command Palette** (`Ctrl+Shift+P`) once the extension is activated.

## Supported Languages

| Language | Parser |
|---|---|
| JavaScript / JSX | `babel` |
| TypeScript / TSX | `typescript` |
| JSON | `json` |
| CSS | `css` |
| SCSS | `scss` |
| HTML | `html` |
| Markdown | `markdown` |
| YAML | `yaml` |

## Installation

1. Open Hypothesis Editor
2. Click the **Extensions** icon in the left sidebar
3. Click the **+** button (Install Extension)
4. Select the `prettier-1.0.0.hyp` file

## Usage

### Format Document
- **Command Palette**: `Ctrl+Shift+P` → type "Format Document with Prettier"

### Format Selection
- Select the text you want to format
- **Command Palette**: `Ctrl+Shift+P` → type "Format Selection with Prettier"

## Format Options

| Option | Value |
|---|---|
| `semi` | `true` (semicolons at the end of statements) |
| `singleQuote` | `true` (use single quotes) |
| `trailingComma` | `"all"` (trailing commas) |
| `printWidth` | `100` (maximum line width) |
| `tabWidth` | `2` (spaces per indentation level) |

## Creating the .hyp File

```bash
tar -cf prettier-1.0.0.hyp --exclude="node_modules" --exclude=".hyp" .
```

## License

MIT
