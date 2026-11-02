import * as fs from 'fs';
import * as path from 'path';
import type { Logger } from 'sass';

// Compiles the stylesheets with the Sass JS API (the Sass version of gulp-sass and @stencil/sass, see package-lock.json):
// a Sass warning, deprecations included, or error fails the tests instead of only being printed by the build.

const root = path.resolve(__dirname, '..');

const scssFilesIn = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => (entry.isDirectory() ? scssFilesIn(path.join(dir, entry.name)) : entry.name.endsWith('.scss') ? [path.join(dir, entry.name)] : []))
    .sort();

const collectingLogger = (messages: string[]): Logger => ({
  warn: (message, { span }) => messages.push(`${span ? `${span.url}:${span.start.line + 1}: ` : ''}${message}`),
  debug: (message, { span }) => messages.push(`${span.url}:${span.start.line + 1}: @debug ${message}`),
});

describe('Sass stylesheets', () => {
  let sass: typeof import('sass');

  // The Stencil test setup defines a mock `document`: with one, the JavaScript build of Dart Sass waits for a <script> load event
  // that never comes, and exports nothing. Load it as in Node, without `document`.
  beforeAll(async () => {
    const { document } = globalThis;
    delete (globalThis as { document?: Document }).document;
    try {
      sass = await import('sass');
    } finally {
      globalThis.document = document;
    }
  });

  // The themes and their page stylesheets (gulp: dist/css/<theme>.css, dist/css/pages/<theme>/), and the demo and component
  // stylesheets (Stencil).
  const themes = fs
    .readdirSync(path.join(root, 'scss/themes'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  // As gulp: the .scss files directly in pages/, except the partials (_*.scss).
  const pageFilesOf = (theme: string): string[] => {
    const pagesDir = path.join(root, 'scss/themes', theme, 'pages');
    return fs.existsSync(pagesDir) ? scssFilesIn(pagesDir).filter(file => path.dirname(file) === pagesDir && !path.basename(file).startsWith('_')) : [];
  };
  const entryPoints = [
    ...themes.map(theme => `scss/themes/${theme}/index.scss`),
    ...[...themes.flatMap(pageFilesOf), ...scssFilesIn(path.join(root, 'components'))].map(file => path.relative(root, file)),
  ];

  it.each(entryPoints)('%s compiles without any warning', file => {
    const messages: string[] = [];
    sass.compile(path.join(root, file), { logger: collectingLogger(messages), verbose: true });

    expect(messages).toEqual([]);
  });

  // The configuration comes with the first load of the module: the theme then gets the configured tokens.
  it.each([
    ['the engine tokens (default theme)', "@use 'engine' with ($grid-md: 1000); @use 'themes/default';"],
    ['the legacy tokens (a theme built on legacy)', "@use 'themes/legacy/tokens' with ($grid-md: 1000); @use 'themes/legacy';"],
  ])('lets a theme configure %s with @use … with (…)', (_, source) => {
    const messages: string[] = [];
    const { css } = sass.compileString(source, { loadPaths: [path.join(root, 'scss')], logger: collectingLogger(messages) });

    expect(messages).toEqual([]);
    expect(css).toContain('@media (min-width: 1000px)');
    expect(css).toContain('"md": 1000');
    expect(css).not.toContain('992px');
  });
});
