# Prettier Extension untuk Hypothesis Editor

Extension ini mengintegrasikan [Prettier](https://prettier.io) ke dalam Hypothesis Editor untuk memformat kode secara otomatis.

## Fitur

- **Format Document** — Format seluruh dokumen aktif
- **Format Selection** — Format hanya teks yang dipilih

Perintah terdaftar otomatis di **Command Palette** (`Ctrl+Shift+P`) setelah extension diaktifkan.

## Bahasa yang Didukung

| Bahasa | Parser |
|---|---|
| JavaScript / JSX | `babel` |
| TypeScript / TSX | `typescript` |
| JSON | `json` |
| CSS | `css` |
| SCSS | `scss` |
| HTML | `html` |
| Markdown | `markdown` |
| YAML | `yaml` |

## Cara Install

1. Buka Hypothesis Editor
2. Klik icon **Extensions** di sidebar kiri
3. Klik tombol **+** (Install Extension)
4. Pilih file `prettier-1.0.0.hyp`

## Cara Pakai

### Format Document
- **Command Palette**: `Ctrl+Shift+P` → ketik "Format Document with Prettier"

### Format Selection
- Pilih teks yang ingin diformat
- **Command Palette**: `Ctrl+Shift+P` → ketik "Format Selection with Prettier"

## Opsi Format

| Opsi | Nilai |
|---|---|
| `semi` | `true` (titik koma di akhir statement) |
| `singleQuote` | `true` (gunakan kutip satu) |
| `trailingComma` | `"all"` (koma di akhir) |
| `printWidth` | `100` (lebar maksimum baris) |
| `tabWidth` | `2` (jumlah spasi per indentasi) |

## Membuat File .hyp

```bash
tar -cf prettier-1.0.0.hyp --exclude="node_modules" --exclude=".hyp" .
```

## License

MIT
