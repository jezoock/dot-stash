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

  // The theme (gulp: dist/css/style.css), the page stylesheets (gulp), and the demo and component stylesheets (Stencil).
  const entryPoints = [
    'scss/index.scss',
    'scss/pages.scss',
    ...[...scssFilesIn(path.join(root, 'scss/pages')), ...scssFilesIn(path.join(root, 'components'))].map(file => path.relative(root, file)),
  ];

  it.each(entryPoints)('%s compiles without any warning', file => {
    const messages: string[] = [];
    sass.compile(path.join(root, file), { logger: collectingLogger(messages), verbose: true });

    expect(messages).toEqual([]);
  });

  it('lets a theme configure the tokens with @use … with (…)', () => {
    const messages: string[] = [];
    const { css } = sass.compileString("@use 'theme' with ($grid-md: 1000); @use 'index';", { loadPaths: [path.join(root, 'scss')], logger: collectingLogger(messages) });

    expect(messages).toEqual([]);
    expect(css).toContain('@media (min-width: 1000px)');
    expect(css).toContain('"md": 1000');
    expect(css).not.toContain('992px');
  });
});
