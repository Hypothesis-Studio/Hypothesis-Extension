# Hypothesis Extension

> Extension marketplace for [Hypothesis Editor](https://github.com/Hypothesis-Studio/Hypothesis-Editor).

## What is Hypothesis Extension?

**Hypothesis Extension** is a curated collection of extensions (plugins) for Hypothesis Editor. Extensions add new features, integrations, and customization to the editor.

> Want to add your extension? See [Contributing](#contributing) below.

## Install an Extension

### From this repository

1. Download the `.hyp` file from the extension's folder
2. Open Hypothesis Editor
3. Go to **Extensions** sidebar → click **+** → select the `.hyp` file
4. Done — the extension is installed and ready to use

## Create Your Own Extension

Want to build an extension? Start with the [Extension Boilerplate](./Extention-Boilerplate/README.md).

## Contributing

1. Fork this repository
2. Add your extension to `<your-extension-name>/`
3. Include a `package.json`, `extension.js`, `extention-name.hyp` and `README.md`
4. Open a Pull Request

### Requirements

- Extension must have a unique `id` (kebab-case)
- Extension must include `package.json` with `name`, `id`, `version`
- Extension must export `activate` and `deactivate` functions
- Extension must not contain malicious code
- No external dependencies unless absolutely necessary (prefer Node.js built-ins)

---

## License

[MIT](LICENSE) — © 2026 Hypothesis Studio
