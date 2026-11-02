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
    expect(css).toContain('--ds-bp-md: 1000px;');
    expect(css).toContain('--ds-bp-labels: xxs xs sm md lg xl xxl;');
    expect(css).not.toContain('992px');
  });

  // ds-tokens() (scss/engine/tools/_tokens.scss): the tokens as custom properties, read by the accessors with var().
  describe('design tokens as custom properties', () => {
    const loadPaths = [path.join(root, 'scss')];

    const compileString = (source: string): string => {
      const messages: string[] = [];
      const { css } = sass.compileString(source, { loadPaths, logger: collectingLogger(messages), style: 'compressed' });
      expect(messages).toEqual([]);
      return css;
    };

    // A rule of compressed CSS, its body (strings included) in group 1.
    const ruleRegExp = (selector: string, flags = '') =>
      new RegExp(`(?<=^|[}\\s])${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{((?:[^}"']|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')*)\\}`, flags);

    // The declarations of a rule, in order: [[name, value], …].
    const declarationsOf = (css: string, selector: string): [string, string][] => {
      const body = css.match(ruleRegExp(selector))?.[1];
      expect(body).toBeDefined();
      return [...body.matchAll(/([\w-]+):((?:[^;"']|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')*)/g)].map(([, name, value]) => [name, value.trim()]);
    };

    // The value of a custom property, its var() resolved with the other ones.
    const resolve = (tokens: Map<string, string>, value: string, depth = 0): string => {
      expect(depth).toBeLessThan(10);
      const resolved = value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
        expect(tokens.has(name)).toBe(true);
        return tokens.get(name);
      });
      return resolved.includes('var(') ? resolve(tokens, resolved, depth + 1) : resolved;
    };

    // The expected tokens of a theme, from its maps, with loops that know their depth (not the walk of ds-tokens()):
    // the name made of the lower-cased keys, and the Sass value (references resolved with ds-token-value()).
    const expectedTokensSource = (theme: string): string => `
      @use 'sass:meta';
      @use 'sass:string';
      @use 'themes/${theme}/tokens' as *;

      @function name($parts...) {
        $name: '--ds';
        @each $part in $parts { $name: $name + '-' + string.to-lower-case('#{$part}'); }
        @return $name;
      }

      @mixin token($group, $keys...) {
        @if ds-has-token($group, $keys...) { #{name($group, $keys...)}: #{meta.inspect(ds-token-value($group, $keys...))}; }
      }

      expected {
        @each $family, $shades in $colors { @each $shade, $value in $shades { @include token(color, $family, $shade); } }
        @each $type, $variants in $colorset {
          @if $type == default { @each $prop, $value in $variants { @include token(colorset, default, $prop); } }
          @else { @each $variant, $props in $variants { @each $prop, $value in $props { @include token(colorset, $type, $variant, $prop); } } }
        }
        @each $step, $value in $font-sizes { @include token(font-size, $step); }
        @each $family, $value in $font-families { @include token(font-family, $family); }
        @each $type, $variants in $font-styles {
          @if $type == default { @each $prop, $value in $variants { @include token(font-style, default, $prop); } }
          @else { @each $variant, $props in $variants { @if meta.type-of($props) == map { @each $prop, $value in $props { @include token(font-style, $type, $variant, $prop); } } } }
        }
        @each $step, $value in $spacings { @include token(space, $step); }
        @each $name, $value in $radii { @include token(radius, $name); }
        @each $label, $value in $breakpoints { #{name(bp, $label)}: #{$value}px; }
      }
    `;

    const themeCss: Record<string, string> = {};
    const tokensOf = (theme: string) => new Map(declarationsOf(themeCss[theme], ':root'));

    beforeAll(() => {
      for (const theme of themes) themeCss[theme] = sass.compile(path.join(root, 'scss/themes', theme, 'index.scss'), { style: 'compressed' }).css;
    });

    it.each(themes)('the %s theme writes one custom property per token, on :root, named from the maps and resolving to their values', theme => {
      expect(themeCss[theme].match(/(^|})\s*:root\{/g)).toHaveLength(1);
      const tokens = tokensOf(theme);
      const expected = new Map(declarationsOf(compileString(expectedTokensSource(theme)), 'expected'));

      // And the labels of the breakpoints, by width.
      const breakpoints = [...expected].filter(([name]) => name.startsWith('--ds-bp-')).sort(([, a], [, b]) => parseFloat(a) - parseFloat(b));
      expected.set('--ds-bp-labels', breakpoints.map(([name]) => name.slice('--ds-bp-'.length)).join(' '));

      expect([...tokens.keys()].sort()).toEqual([...expected.keys()].sort());
      for (const [name, value] of expected) expect([name, resolve(tokens, tokens.get(name))]).toEqual([name, value]);
    });

    it('writes the configured values of the legacy theme, and references for the tokens derived from others', () => {
      const tokens = tokensOf('legacy');

      expect(tokens.get('--ds-color-primary-base')).toBe('#e4be90');
      expect(tokens.get('--ds-color-secondary-dark')).toBe('#c94328');
      expect(tokens.get('--ds-color-status-warning')).toBe('#f29100');
      expect(tokens.get('--ds-colorset-solid-primary-background')).toBe('var(--ds-color-primary-base)');
      expect(tokens.get('--ds-colorset-solid-primary-hover-border')).toBe('var(--ds-color-primary-dark)');
      expect(tokens.get('--ds-colorset-solid-white-text')).toBe('var(--ds-color-gray-black)');
      expect(tokens.get('--ds-colorset-solid-gray-background')).toBe('#dcdcdc'); // a value of its own
      expect(tokens.get('--ds-color-shadow-medium')).toBe('rgba(0, 0, 0, 0.3)');
      expect(tokens.get('--ds-font-family-heading')).toBe('"Montserrat", sans-serif');
      expect(tokens.get('--ds-font-family-body')).toBe('"Montserrat"');
      expect(tokens.get('--ds-font-family-default')).toMatch(/^-apple-system, BlinkMacSystemFont, "Segoe UI", /); // names, not strings of quotes
      expect(tokens.get('--ds-font-family-now')).toBe('"Now"');
      expect(tokens.get('--ds-font-style-default-family')).toBe('var(--ds-font-family-now)');
      expect(tokens.get('--ds-font-style-title-page-main-size')).toBe('var(--ds-font-size-800)');
      expect(tokens.get('--ds-font-style-title-page-main-weight')).toBe('900');
      expect(tokens.get('--ds-font-size-800')).toBe('2.25rem');
      expect(tokens.get('--ds-space-4')).toBe('1rem');
      expect(tokens.get('--ds-radius-pill')).toBe('999px');
      expect(tokens.get('--ds-bp-md')).toBe('992px');
    });

    it('writes the neutral values of the default theme', () => {
      const tokens = tokensOf('default');

      expect(tokens.get('--ds-color-primary-base')).toBe('#2563eb');
      expect(tokens.get('--ds-color-status-warning')).toBe('#b45309');
      expect(tokens.get('--ds-colorset-solid-primary-text')).toBe('var(--ds-color-gray-white)');
      expect(tokens.get('--ds-colorset-solid-disabled-background')).toBe('var(--ds-color-status-disabled)');
      expect(tokens.get('--ds-font-family-mono')).toMatch(/^ui-monospace, /);
      expect(tokens.get('--ds-font-style-title-default-family')).toBe('var(--ds-font-family-heading)');
    });

    // JavaScript reads the breakpoints from the custom properties (tokens.getBreakpoints()): --ds-bp-labels lists the labels,
    // identifiers separated by spaces, by width; --ds-bp-<label> gives each width. The JSON of body::before is gone.
    it.each(themes)('the %s theme lists its breakpoints in --ds-bp-labels, and writes no JSON in body::before', theme => {
      const tokens = tokensOf(theme);
      const labels = tokens.get('--ds-bp-labels');
      const widths = [...tokens]
        .filter(([name]) => name.startsWith('--ds-bp-') && name !== '--ds-bp-labels')
        .map(([name, value]): [string, string] => [name.slice('--ds-bp-'.length), value]);

      expect(labels).toMatch(/^[a-z_][a-z0-9_-]*( [a-z_][a-z0-9_-]*)*$/);
      expect(labels.split(' ')).toEqual([...widths].sort(([, a], [, b]) => parseFloat(a) - parseFloat(b)).map(([label]) => label));
      expect(widths.every(([, value]) => /^\d+px$/.test(value))).toBe(true);
      expect(Object.fromEntries(widths.map(([label, value]) => [label, parseFloat(value)]))).toEqual({ xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 });
      expect(themeCss[theme]).not.toContain('body::before');
      expect(themeCss[theme]).not.toMatch(/content:\s*["']\s*\{/);
    });

    it('lists the breakpoint labels by width (equal widths in the order of the map), without the null ones, in a scope too', () => {
      const css = compileString(`
        @use 'engine' as * with ($breakpoints: (lg: 1200, sm: 768, Tab_Let: 768px, xs: 0, off: null));
        @include ds-tokens(bp);
        .scope { @include ds-tokens(bp); }
      `);

      expect(declarationsOf(css, ':root')).toEqual([
        ['--ds-bp-lg', '1200px'],
        ['--ds-bp-sm', '768px'],
        ['--ds-bp-tab_let', '768px'],
        ['--ds-bp-xs', '0px'],
        ['--ds-bp-labels', 'xs sm tab_let lg'],
      ]);
      expect(declarationsOf(css, '.scope')).toEqual(declarationsOf(css, ':root'));
      expect(compileString(`@use 'engine' as * with ($breakpoints: ()); @include ds-tokens(bp); a { b: c; }`)).not.toContain('--ds-bp');
    });

    it.each([
      ['a label that is not an identifier', '(sm: 0, 2xl: 1600)', /The breakpoint label 2xl \(--ds-bp-2xl\) does not start with a letter or _/],
      ['a breakpoint named labels', '(sm: 0, labels: 1600)', /A breakpoint gets the custom property name --ds-bp-labels/],
      ['a width that is not in px', '(sm: 0, md: 62em)', /The breakpoint md is 62em: a breakpoint is a minimum width, in px/],
    ])('fails on %s', (_, breakpoints, message) => {
      expect(() => sass.compileString(`@use 'engine' as * with ($breakpoints: ${breakpoints}); @include ds-tokens(bp);`, { loadPaths })).toThrow(message);
    });

    // Every var(--ds-…) of a theme, its page stylesheets included, has a custom property: none resolves to nothing.
    it.each(themes)('the %s theme only reads custom properties it declares', theme => {
      const tokens = tokensOf(theme);
      const stylesheets = [themeCss[theme], ...pageFilesOf(theme).map(file => sass.compile(file, { style: 'compressed' }).css)];
      const used = new Set(stylesheets.flatMap(css => [...css.matchAll(/var\((--ds-[\w-]+)/g)].map(([, name]) => name)));

      expect(used.size).toBeGreaterThan(10);
      expect([...used].filter(name => !tokens.has(name))).toEqual([]);
    });

    // The legacy skins take their colors and fonts from the tokens (scss/themes/legacy/_tokens.scss), so that they follow them,
    // at runtime too: no color or font name of their own in the compiled theme, outside :root and @font-face. Allowed:
    // transparent (rgba(0,0,0,0) once compressed) and the icon font, ds-icons (the glyphs of the engine's icon mixins).
    it('the legacy skins write no literal color or font name', () => {
      const css = themeCss.legacy.replace(ruleRegExp(':root', 'g'), '').replace(ruleRegExp('@font-face', 'g'), '');
      // Not yet: the undefined color(…) of the combo skin, written as plain CSS (to be fixed).
      const declarations = [...css.matchAll(/[{;]([\w-]+):((?:[^;{}"']|"[^"]*"|'[^']*')+)/g)].map(([, name, value]) => [
        name,
        value.replace(/rgba\(0,0,0,0\)|"ds-icons"|\bcolor\([^)]*\)/g, ''),
      ]);
      const colorLiteral =
        /#[0-9a-f]{3,8}(?![\w-])|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w-])(red|white|black|gr[ae]y|silver|blue|green|yellow|orange|purple|pink|gold)(?![\w-])/i;
      const fontLiteral = ([name, value]: string[]) => /^font(-family)?$/.test(name) && value !== '' && value !== 'inherit' && !value.includes('var(--ds-font-');

      expect(declarations.length).toBeGreaterThan(500);
      expect(declarations.filter(([, value]) => colorLiteral.test(value))).toEqual([]);
      expect(declarations.filter(fontLiteral)).toEqual([]);
    });

    // The skins read the primary color through its custom property: its value is only in :root.
    it.each([
      ['default', '#2563eb'],
      ['legacy', '#e4be90'],
    ])('the %s skins read the primary color with var()', (theme, primary) => {
      const css = themeCss[theme].replace(ruleRegExp(':root', 'g'), '');

      expect(css).toContain('var(--ds-color-primary-base)');
      expect(css).not.toContain(primary);
    });

    it('returns custom properties from the accessors', () => {
      const css = compileString(`
        @use 'engine' as *;
        a {
          color: ds-color(primary, dark);
          b: ds-colorset-text(link, primary);
          c: ds-colorset-background(solid);
          d: ds-font-size(title, page-main);
          e: ds-font-family(title, page-sub);
          f: ds-font-weight(button);
          g: ds-font-decoration(link);
          h: ds-spacing(4);
          i: ds-radius(sm);
          j: ds-token(font-size, 100);
          k: ds-token-name(font-family, Garamond);
          @include ds-colorset-styles(outlined, secondary);
          @include ds-font-styles(text, note);
        }
      `);

      expect(declarationsOf(css, 'a')).toEqual([
        ['color', 'var(--ds-color-primary-dark)'],
        ['b', 'var(--ds-colorset-link-primary-text)'],
        ['c', 'var(--ds-colorset-solid-default-background)'], // the default variant of the type
        ['d', 'var(--ds-font-style-title-page-main-size)'],
        ['e', 'var(--ds-font-style-title-default-family)'], // inherited from the default variant
        ['f', 'var(--ds-font-style-button-default-weight)'],
        ['g', 'var(--ds-font-style-link-default-decoration)'],
        ['h', 'var(--ds-space-4)'],
        ['i', 'var(--ds-radius-sm)'],
        ['j', 'var(--ds-font-size-100)'],
        ['k', '--ds-font-family-garamond'],
        ['color', 'var(--ds-colorset-outlined-secondary-text)'],
        ['border-color', 'var(--ds-colorset-outlined-secondary-border)'],
        ['background-color', 'var(--ds-colorset-outlined-secondary-background)'],
        ['font-family', 'var(--ds-font-style-default-family)'], // inherited from the top-level default
        ['font-size', 'var(--ds-font-style-text-note-size)'],
        ['font-weight', 'var(--ds-font-style-default-weight)'],
        ['text-decoration', 'var(--ds-font-style-default-decoration)'],
      ]);
    });

    it('returns the Sass values from the -value functions, references resolved', () => {
      const values = (tokens: string) =>
        declarationsOf(
          compileString(`
            @use 'sass:color';
            @use '${tokens}' as *;
            a {
              a: ds-color-value(primary, base);
              b: ds-colorset-background-value(solid, primary);
              c: ds-colorset-text-value(link, primary);
              d: ds-font-size-value(title, page-main);
              e: ds-font-weight-value(title, section-sub);
              f: ds-spacing-value(4) * 2;
              g: ds-radius-value(md);
              h: color.change(ds-color-value(gray, white), $alpha: 0.5);
              i: ds-token-value(font-size, 100);
            }
          `),
          'a',
        );

      expect(values('engine')).toEqual([
        ['a', '#2563eb'],
        ['b', '#2563eb'],
        ['c', '#2563eb'],
        ['d', '2.25rem'],
        ['e', '400'],
        ['f', '2rem'],
        ['g', '.5rem'],
        ['h', 'rgba(255,255,255,.5)'],
        ['i', '.875rem'],
      ]);
      expect(values('themes/legacy/tokens')).toEqual([
        ['a', '#e4be90'],
        ['b', '#e4be90'],
        ['c', '#e4be90'],
        ['d', '2.25rem'],
        ['e', '500'],
        ['f', '2rem'],
        ['g', '.5rem'],
        ['h', 'rgba(255,255,255,.5)'],
        ['i', '.875rem'],
      ]);
    });

    it.each([
      ['an unknown color', 'ds-color(primary, nope)', /Unknown color token: primary nope \(--ds-color-primary-nope\)\. Keys of primary: darker, dark, base, light\./],
      ['an unknown color family', 'ds-color-value(nope, base)', /Unknown color token: nope base/],
      ['a group of tokens', 'ds-token(color, primary)', /The color primary is a group of tokens, not a token/],
      ['an unknown spacing', 'ds-spacing(42)', /Unknown space token: 42/],
      ['an unknown radius', 'ds-radius(huge)', /Unknown radius token: huge/],
      ['an unknown colorset type', 'ds-colorset-text(nope)', /Unknown colorset type: nope\. Types: solid, outlined, link\./],
      ['an unknown colorset variant', 'ds-colorset-border(solid, nope)', /Unknown colorset variant: solid nope/],
      ['an unknown font style', 'ds-font-size(title, nope)', /Unknown font-style variant: title nope/],
      ['an unknown font style property', 'ds-font-style(color, title)', /No color in the font-style tokens for title, nor in its defaults\./],
      ['an unknown token group', 'ds-token(nope, x)', /Unknown token group: nope/],
    ])('fails on %s', (_, call, message) => {
      expect(() => sass.compileString(`@use 'engine' as *; a { b: ${call}; }`, { loadPaths })).toThrow(message);
    });

    it('leaves the declaration out for an optional color that does not exist', () => {
      const css = compileString(
        `@use 'themes/legacy/tokens' as *; a { color: ds-color(status, overdue, $optional: true); border-color: ds-color(status, error, $optional: true); }`,
      );

      expect(declarationsOf(css, 'a')).toEqual([['border-color', 'var(--ds-color-status-error)']]);
    });

    it('writes the values of an engine configured with @use … with (…), and leaves out null values and references to missing tokens', () => {
      const css = compileString(`
        @use 'engine' as * with (
          $colors: (primary: (base: #123456, dark: #0a1b2c, light: null)),
          $font-size-200: 1.1rem,
          $radii: (sm: 3px, 'Big Pill': 99rem),
          $grid-md: 1000
        );
        @include ds-tokens();
        a { b: ds-has-token(color, primary, light); c: ds-has-token(colorset, solid, primary, background); d: ds-has-token(colorset, solid, gray, background); }
      `);
      const tokens = new Map(declarationsOf(css, ':root'));

      expect([...tokens.keys()].filter(name => name.startsWith('--ds-color-'))).toEqual(['--ds-color-primary-base', '--ds-color-primary-dark']);
      expect(tokens.get('--ds-color-primary-base')).toBe('#123456');
      expect(tokens.get('--ds-colorset-solid-primary-background')).toBe('var(--ds-color-primary-base)');
      expect(tokens.get('--ds-colorset-solid-primary-hover-background')).toBe('var(--ds-color-primary-dark)');
      expect(tokens.has('--ds-colorset-solid-primary-light-background')).toBe(false); // primary light is null
      expect(tokens.has('--ds-colorset-solid-gray-background')).toBe(false); // no gray in these colors
      expect(tokens.get('--ds-font-size-200')).toBe('1.1rem');
      expect(tokens.get('--ds-font-style-default-size')).toBe('var(--ds-font-size-200)');
      expect([...tokens].filter(([name]) => name.startsWith('--ds-radius-'))).toEqual([
        ['--ds-radius-sm', '3px'],
        ['--ds-radius-big-pill', '99rem'], // keys are lower-cased, other characters become -
      ]);
      expect(tokens.get('--ds-bp-md')).toBe('1000px');
      expect(declarationsOf(css, 'a')).toEqual([
        ['b', 'false'],
        ['c', 'true'],
        ['d', 'false'],
      ]);
      expect(() => sass.compileString(`@use 'engine' as * with ($colors: (primary: (light: null))); a { b: ds-color(primary, light); }`, { loadPaths })).toThrow(
        /The color token primary light has no value \(null\)/,
      );
    });

    it('redeclares the tokens of some groups in a rule, for a scope', () => {
      const css = compileString(`@use 'themes/legacy/tokens' as *; .promo { --ds-color-primary-base: #c00; @include ds-tokens(colorset); }`);
      const declarations = declarationsOf(css, '.promo');

      expect(declarations[0]).toEqual(['--ds-color-primary-base', '#c00']);
      expect(declarations).toContainEqual(['--ds-colorset-solid-primary-background', 'var(--ds-color-primary-base)']);
      expect(declarations.slice(1).every(([name]) => name.startsWith('--ds-colorset-'))).toBe(true);
      expect(css).not.toContain(':root');
    });

    it('fails on two tokens with the same custom property name, and on a ds-ref() that was not loaded', () => {
      expect(() => sass.compileString(`@use 'engine' as * with ($radii: (a-b: 1px, 'A.B': 2px)); @include ds-tokens(radius);`, { loadPaths })).toThrow(
        /Two tokens get the same custom property name, --ds-radius-a-b/,
      );
      expect(() => sass.compileString(`@use 'engine' as * with ($gradients: (hero: (from: ds-ref(color, primary, base)))); @include ds-tokens(gradient);`, { loadPaths })).toThrow(
        /is ds-ref\(color, primary, base\), a plain string: load ds-ref\(\)/,
      );
    });
  });
});
