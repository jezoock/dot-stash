import * as fs from 'fs';
import * as path from 'path';
import type { Logger } from 'sass';
import { removeQuotes } from './utils/responsive';

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

  // JavaScript reads the theme JSON in the content of body::before (responsive.getStylesJSON(): getComputedStyle, then removeQuotes).
  it.each(themes)('the %s theme writes the theme JSON in the content of body::before', theme => {
    const { css } = sass.compile(path.join(root, 'scss/themes', theme, 'index.scss'), { style: 'compressed' });
    const content = css.match(/body::before\{[^}]*?content:('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/)?.[1];

    expect(content).toBeDefined();
    const json = JSON.parse(removeQuotes(content));
    expect(json.breakpoints).toEqual({ xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 });
    expect(json.palettes.primary.base).toMatch(/^#[0-9a-f]{6}$/);
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
