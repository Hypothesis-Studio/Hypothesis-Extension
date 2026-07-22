/**
 * Prettier Extension v1.0.0 for Hypothesis Editor
 *
 * Simple code formatting:
 * - Format Document
 * - Format Selection
 */

let _prettier = null;

function getPrettier() {
  if (!_prettier) {
    try {
      _prettier = require('prettier');
    } catch {
      throw new Error('Prettier not found. Run "npm install" in: ' + __dirname);
    }
  }
  return _prettier;
}

const LANGUAGE_PARSERS = {
  javascript: 'babel', javascriptreact: 'babel', jsx: 'babel',
  typescript: 'typescript', typescriptreact: 'typescript', tsx: 'typescript',
  json: 'json', jsonc: 'json', json5: 'json5',
  css: 'css', scss: 'scss', less: 'less',
  html: 'html', htm: 'html', xml: 'xml', svg: 'html',
  vue: 'vue', angular: 'angular', svelte: 'svelte',
  markdown: 'markdown', md: 'markdown', mdx: 'mdx',
  yaml: 'yaml', yml: 'yaml', toml: 'toml',
  graphql: 'graphql', gql: 'graphql',
};

const EXTENSION_PARSERS = {
  js: 'babel', jsx: 'babel', mjs: 'babel', cjs: 'babel',
  ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
  json: 'json', jsonc: 'json', json5: 'json5',
  css: 'css', scss: 'scss', less: 'less',
  html: 'html', htm: 'html', xml: 'xml', svg: 'html',
  vue: 'vue', svelte: 'svelte',
  md: 'markdown', mdx: 'mdx',
  yaml: 'yaml', yml: 'yaml', toml: 'toml',
  graphql: 'graphql', gql: 'graphql',
};

const DEFAULT_OPTIONS = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};

function resolveParser(languageId, filePath) {
  if (languageId) {
    const lang = languageId.toLowerCase().trim();
    if (LANGUAGE_PARSERS[lang]) return LANGUAGE_PARSERS[lang];
  }
  if (filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext && EXTENSION_PARSERS[ext]) return EXTENSION_PARSERS[ext];
  }
  return null;
}

async function formatText(text, parser, options) {
  const prettier = getPrettier();
  try {
    return await prettier.format(text, { parser, ...options });
  } catch (err) {
    const msg = err.message || String(err);
    const loc = err.loc ? ` at line ${err.loc.start?.line}, col ${err.loc.start?.column}` : '';
    if (msg.includes('Unexpected token') || msg.includes('SyntaxError'))
      throw new Error(`Syntax error${loc}: ${msg.slice(0, 150)}`);
    throw new Error(`Prettier${loc}: ${msg.slice(0, 200)}`);
  }
}

module.exports = {
  activate(context) {
    const prettier = getPrettier();
    const version = prettier.version || 'unknown';

    // Format Document
    context.commands.registerCommand('prettier.format', async (args) => {
      const { text, languageId, filePath } = args || {};
      if (!text?.trim()) return null;

      const parser = resolveParser(languageId, filePath);
      if (!parser) {
        context.window.showWarningMessage(`Prettier: unsupported language "${languageId || 'unknown'}"`);
        return null;
      }

      try {
        const result = await formatText(text, parser, DEFAULT_OPTIONS);
        return result === text ? null : result;
      } catch (err) {
        context.window.showErrorMessage(err.message);
        return null;
      }
    });

    // Format Selection
    context.commands.registerCommand('prettier.formatSelection', async (args) => {
      const { text, selectedText, languageId, filePath } = args || {};
      if (!text?.trim()) return null;

      const parser = resolveParser(languageId, filePath);
      if (!parser) {
        context.window.showWarningMessage(`Prettier: unsupported language "${languageId || 'unknown'}"`);
        return null;
      }

      // If no selection, format entire document
      if (!selectedText?.trim()) {
        try {
          const result = await formatText(text, parser, DEFAULT_OPTIONS);
          return result === text ? null : result;
        } catch (err) {
          context.window.showErrorMessage(err.message);
          return null;
        }
      }

      try {
        const formatted = await formatText(selectedText, parser, DEFAULT_OPTIONS);
        return formatted === selectedText ? null : formatted;
      } catch (err) {
        context.window.showErrorMessage(err.message);
        return null;
      }
    });

    context.window.showInformationMessage(`Prettier v${version} ready`);
    console.log(`Prettier v${version} activated`);
  },

  deactivate() {
    console.log('Prettier deactivated');
  },
};
