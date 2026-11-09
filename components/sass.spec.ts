import { beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as sass from 'sass';
import { execFileSync } from 'child_process';
import type { Logger } from 'sass';

// Compiles the stylesheets with the Sass JS API (the sass package of scripts/build-css.mjs, see package-lock.json):
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
  // The themes and their page stylesheets (scripts/build-css.mjs: dist/css/<theme>.css, dist/css/pages/<theme>/), and the component
  // stylesheets (Stencil).
  const themes = fs
    .readdirSync(path.join(root, 'scss/themes'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  // As scripts/build-css.mjs: the .scss files directly in pages/, except the partials (_*.scss).
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

  // Sass writes a function it does not know as plain CSS, without a warning: a misspelled or removed token function, or a
  // color() of the former palette, would reach the browser, which drops the declaration. The component stylesheets are
  // compiled by Stencil without the engine: they read no token at all (their look is in the theme skins), only their
  // component custom properties (--ds-<component>-…, see the styling contract below).
  it.each(entryPoints)('%s writes no undefined function call', file => {
    const { css } = sass.compile(path.join(root, file));

    expect(css).not.toMatch(/(?<![\w-])(color|snk-[\w-]+|ds-[\w-]+)\(/);
    if (file.startsWith('components/')) {
      expect(fs.readFileSync(path.join(root, file), 'utf8')).not.toMatch(
        /var\(--ds-(color|colorset|font-size|font-family|font-style|space|radius|bp|gradient)-|@use '[^']*(engine|themes)/,
      );
    }
  });

  // The icons are SVG images drawn as masks (scss/engine/tools/_icons.scss): no stylesheet declares a font face or requests
  // a font file (the files of the former ds-icons font were never in the repository: each of their requests failed).
  it.each(entryPoints)('%s requests no font file', file => {
    const { css } = sass.compile(path.join(root, file));

    expect(css).not.toMatch(/@font-face|url\([^)]*\.(woff2?|ttf|otf|eot)\b|font-family:\s*["']?ds-icons/);
  });

  // The configuration comes with the first load of the module: the theme then gets the configured tokens.
  it.each([
    ['the engine tokens (default theme)', "@use 'engine' with ($grid-md: 1000); @use 'themes/default';"],
    ['the tokens of the default theme', "@use 'themes/default/tokens' with ($grid-md: 1000); @use 'themes/default';"],
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
    // the name made of the lower-cased keys, and the Sass value (references resolved with ds-token-value()). And the images
    // of all the icons, --ds-icons-<name>: the theme writes those its skins draw.
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
        @each $prop, $value in $focus { @include token(focus, $prop); }
        @each $label, $value in $breakpoints { #{name(bp, $label)}: #{$value}px; }
        @each $name, $image in $icons { --ds-icons-#{$name}: #{$image}; }
      }
    `;

    // The icons a stylesheet reads: the names of its var(--ds-icons-<name>).
    const iconsReadBy = (css: string) => new Set([...css.matchAll(/var\(--ds-icons-([\w-]+)\)/g)].map(([, name]) => name));

    const themeCss: Record<string, string> = {};
    const tokensOf = (theme: string) => new Map(declarationsOf(themeCss[theme], ':root'));

    beforeAll(() => {
      for (const theme of themes) themeCss[theme] = sass.compile(path.join(root, 'scss/themes', theme, 'index.scss'), { style: 'compressed' }).css;
    });

    it.each(themes)('the %s theme writes one custom property per token, on :root, named from the maps and resolving to their values', theme => {
      expect(themeCss[theme].match(/(^|})\s*:root\{/g)).toHaveLength(1);
      const tokens = tokensOf(theme);
      const drawn = iconsReadBy(themeCss[theme]);
      const expected = new Map(
        declarationsOf(compileString(expectedTokensSource(theme)), 'expected').filter(([name]) => !name.startsWith('--ds-icons-') || drawn.has(name.slice('--ds-icons-'.length))),
      );

      // And the labels of the breakpoints, by width.
      const breakpoints = [...expected].filter(([name]) => name.startsWith('--ds-bp-')).sort(([, a], [, b]) => parseFloat(a) - parseFloat(b));
      expected.set('--ds-bp-labels', breakpoints.map(([name]) => name.slice('--ds-bp-'.length)).join(' '));

      expect([...tokens.keys()].sort()).toEqual([...expected.keys()].sort());
      for (const [name, value] of expected) expect([name, resolve(tokens, tokens.get(name))]).toEqual([name, value]);
    });

    it('writes the neutral values of the default theme, and references for the tokens derived from others', () => {
      const tokens = tokensOf('default');

      expect(tokens.get('--ds-color-primary-base')).toBe('#2563eb');
      expect(tokens.get('--ds-color-status-warning')).toBe('#b45309');
      expect(tokens.get('--ds-colorset-solid-primary-text')).toBe('var(--ds-color-gray-white)');
      expect(tokens.get('--ds-colorset-solid-primary-background')).toBe('var(--ds-color-primary-base)');
      expect(tokens.get('--ds-colorset-solid-disabled-background')).toBe('var(--ds-color-status-disabled)');
      expect(tokens.get('--ds-font-family-default')).toMatch(/^system-ui, -apple-system, "Segoe UI", /); // names, not strings of quotes
      expect(tokens.get('--ds-font-family-mono')).toMatch(/^ui-monospace, /);
      expect(tokens.get('--ds-font-style-title-default-family')).toBe('var(--ds-font-family-heading)');
      expect(tokens.get('--ds-font-style-title-page-main-size')).toBe('var(--ds-font-size-800)');
      expect(tokens.get('--ds-font-size-800')).toBe('2.25rem');
      expect(tokens.get('--ds-space-4')).toBe('1rem');
      expect(tokens.get('--ds-focus-color')).toBe('var(--ds-color-primary-base)');
      expect(tokens.get('--ds-focus-width')).toBe('2px');
      expect(tokens.get('--ds-focus-style')).toBe('solid');
      expect(tokens.get('--ds-focus-offset')).toBe('2px');
      expect(tokens.get('--ds-bp-md')).toBe('992px');
    });

    it('writes the focus indicator from the focus tokens, and reads them with ds-focus()', () => {
      const css = compileString(`
        @use 'engine' as * with ($focus: (color: #c00, width: 3px, style: dashed, offset: 1px));
        a { b: ds-focus(color); c: ds-focus-value(width) * 2; @include ds-focus-ring(); }
      `);

      expect(declarationsOf(css, 'a')).toEqual([
        ['b', 'var(--ds-focus-color)'],
        ['c', '6px'],
        ['outline', 'var(--ds-focus-width) var(--ds-focus-style) var(--ds-focus-color)'],
        ['outline-offset', 'var(--ds-focus-offset)'],
      ]);
      expect(declarationsOf(compileString(`@use 'engine' as * with ($focus: (color: #c00, width: 3px, style: dashed, offset: 1px)); @include ds-tokens(focus);`), ':root')).toEqual(
        [
          ['--ds-focus-color', '#c00'],
          ['--ds-focus-width', '3px'],
          ['--ds-focus-style', 'dashed'],
          ['--ds-focus-offset', '1px'],
        ],
      );
      expect(() => sass.compileString(`@use 'engine' as *; a { b: ds-focus(blur); }`, { loadPaths })).toThrow(/Unknown focus token: blur/);
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

    // Every var(--ds-…) of a theme, its page stylesheets included, has a custom property: none resolves to nothing. The
    // tokens are declared on :root, the component custom properties (--ds-<component>-…) on the component elements.
    it.each(themes)('the %s theme only reads custom properties it declares', theme => {
      const tokens = tokensOf(theme);
      const stylesheets = [themeCss[theme], ...pageFilesOf(theme).map(file => sass.compile(file, { style: 'compressed' }).css)];
      const used = new Set(stylesheets.flatMap(css => [...css.matchAll(/var\((--ds-[\w-]+)/g)].map(([, name]) => name)));
      const declared = new Set(stylesheets.flatMap(css => [...css.matchAll(/[{;](--ds-[\w-]+):/g)].map(([, name]) => name)));

      expect(used.size).toBeGreaterThan(10);
      expect([...used].filter(name => !tokens.has(name) && !declared.has(name))).toEqual([]);
    });

    // The skins read the primary color through its custom property: its value is only in :root.
    it('the default skins read the primary color with var()', () => {
      const css = themeCss.default.replace(ruleRegExp(':root', 'g'), '');

      expect(css).toContain('var(--ds-color-primary-base)');
      expect(css).not.toContain('#2563eb');
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

    // The maximum is excluded, in the range syntax: two ranges that meet leave no gap at a fractional width (a zoomed page).
    it('writes the media queries of break-p() from the breakpoints (unitless or px), and fails without a known breakpoint', () => {
      const css = compileString(`
        @use 'engine' as * with ($breakpoints: (sm: 768, md: 992px));
        a { @include break-p(md) { b: c; } @include break-p(null, md) { d: e; } @include break-p(sm, md) { f: g; } }
      `);

      expect(css).toMatch(/@media\s*\(min-width:\s*992px\)\s*\{\s*a\{b:c\}/);
      expect(css).toMatch(/@media\s*\(width < 992px\)\s*\{\s*a\{d:e\}/);
      expect(css).toMatch(/@media\s*\(min-width:\s*768px\)\s*and\s*\(width < 992px\)\s*\{\s*a\{f:g\}/);
      expect(css).not.toContain('max-width');
      expect(() => sass.compileString(`@use 'engine' as *; a { @include break-p(min) { b: c; } }`, { loadPaths })).toThrow(/Unknown breakpoint: min\. Breakpoints: xxs, xs, /);
      expect(() => sass.compileString(`@use 'engine' as *; a { @include break-p(null, nope) { b: c; } }`, { loadPaths })).toThrow(/Unknown breakpoint: nope/);
      expect(() => sass.compileString(`@use 'engine' as *; a { @include break-p() { b: c; } }`, { loadPaths })).toThrow(/break-p\(\) needs a breakpoint/);
    });

    // The icons (scss/engine/tools/_icons.scss): the SVG images of $icons, generated from scss/engine/icons/, drawn as masks
    // in the color of the text; a stylesheet writes the images of the icons it draws as custom properties (--ds-icons-<name>).
    describe('icons', () => {
      // The names of the icons of the former icon font: each one is still an icon, in this order.
      // prettier-ignore
      const iconNames = [
        'basket', 'ok', 'cancel', 'right-open', 'user', 'search', 'mail', 'heart-empty', 'heart', 'star', 'star-empty', 'minus', 'plus', 'home', 'link', 'lock', 'eye-off', 'eye',
        'thumbs-up', 'thumbs-down', 'pencil', 'comment', 'chat', 'bell', 'attention', 'location', 'folder', 'folder-open', 'cog', 'right-big', 'right-hand', 'cw', 'arrows-cw',
        'play', 'stop', 'pause', 'to-end', 'to-end-alt', 'fast-fw', 'eject', 'down-dir', 'phone', 'left-dir', 'down-open', 'cog-alt', 'block', 'down-big', 'up-dir', 'right-dir',
        'left-open', 'up-open', 'left-big', 'up-big', 'ccw', 'calendar', 'login', 'logout', 'attach', 'credit-card', 'barcode', 'off', 'truck', 'videocam', 'picture', 'doc',
        'certificate', 'docs', 'menu', 'comment-empty', 'chat-empty', 'download-cloud', 'upload-cloud', 'bell-alt', 'angle-double-left', 'angle-double-right', 'angle-double-up',
        'angle-double-down', 'angle-left', 'angle-right', 'angle-up', 'angle-down', 'quote-left', 'quote-right', 'folder-empty', 'folder-open-empty', 'help', 'info',
        'attention-alt', 'ticket', 'thumbs-up-alt', 'thumbs-down-alt', 'down', 'up', 'left', 'right', 'sliders', 'trash', 'user-o',
      ];
      // The icons added since, after them: a check in a circle (the success of ds-alert), a spinner (ds-loader).
      const addedIconNames = ['ok-circle', 'spinner'];

      // The types of ds-icon in the default theme (components/_icon.scss).
      // prettier-ignore
      const iconTypes = [
        'cart', 'help', 'account', 'voucher', 'returns', 'location', 'search', 'orders', 'filter', 'arrow-up', 'arrow-left', 'arrow-right', 'arrow-down', 'up', 'down', 'left',
        'right', 'dir-up', 'dir-down', 'dir-left', 'dir-right', 'show', 'hide', 'cancel', 'delete', 'plus', 'minus', 'refresh', 'loading',
      ];

      // The images of $icons: [[name, image]].
      const imagesOf = (use = "@use 'engine' as *;") => declarationsOf(compileString(`${use} images { @each $name, $image in $icons { #{$name}: #{$image}; } }`), 'images');
      // The SVG of a data URI image.
      const svgOf = (image: string) => decodeURIComponent(image.match(/^url\("data:image\/svg\+xml,([^"]*)"\)$/)?.[1] ?? '');
      // The declarations of all the rules of a selector, but those in an at-rule.
      const allDeclarationsOf = (css: string, selector: string) => [...css.matchAll(ruleRegExp(selector, 'g'))].flatMap(([rule]) => declarationsOf(rule, selector));

      it('the icon map is the one scripts/build-icons.mjs generates from scss/engine/icons/', () => {
        const output = execFileSync(process.execPath, [path.join(root, 'scripts/build-icons.mjs'), '--check'], { cwd: root, encoding: 'utf8' });

        expect(output).toContain('scss/engine/variables/_icons.scss is up to date.');
      });

      it('keeps every name of the former icon font, then the added icons, each one an SVG data URI with a viewBox, the filled variants filled', () => {
        const images = new Map(imagesOf());

        expect([...images.keys()]).toEqual([...iconNames, ...addedIconNames]);
        for (const [name, image] of images) {
          const svg = svgOf(image);
          expect([name, svg]).toEqual([
            name,
            expect.stringMatching(/^<svg xmlns='http:\/\/www\.w3\.org\/2000\/svg' viewBox='-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+'[^<>]*>(<[^<>]+>)+<\/svg>$/),
          ]);
          expect(svg.match(/^<svg[^>]*>/)[0]).not.toMatch(/\s(class|width|height)=/);
          expect(svg).not.toMatch(/<(script|style|image|use|foreignObject|a|text)\b|\s(href|xlink:href|style|on\w+)=|<!|[\n\t"]/);
        }
        // A filled icon and its outline (the -empty, -alt, -o variants of the font) look different.
        for (const [filled, outline] of [
          ['heart', 'heart-empty'],
          ['star', 'star-empty'],
          ['user', 'user-o'],
          ['comment', 'comment-empty'],
          ['chat', 'chat-empty'],
          ['folder', 'folder-empty'],
          ['folder-open', 'folder-open-empty'],
          ['bell-alt', 'bell'],
          ['thumbs-up-alt', 'thumbs-up'],
          ['thumbs-down-alt', 'thumbs-down'],
        ]) {
          expect([filled, svgOf(images.get(filled))]).toEqual([filled, expect.stringContaining("fill='currentColor'")]);
          expect([outline, svgOf(images.get(outline))]).toEqual([outline, expect.not.stringContaining("fill='currentColor'")]);
        }
      });

      it('draws an icon as a mask of 1em in the color of the text, read from its custom property, with the icons drawn on :root', () => {
        const css = compileString(`
          @use 'engine' as *;
          a::before { @include ds-icon(heart); }
          b::before { @include ds-icon(null, block); }
          b.--open::before { @include ds-icon-content(minus); }
          c::after { @include ds-icon(plus, null, $alt: 'Add'); }
          d::before { @include ds-icon(heart); }
          @include ds-icon-tokens();
        `);
        const box = [
          ['flex-shrink', '0'],
          ['width', '1em'],
          ['height', '1em'],
          ['vertical-align', '-0.125em'],
          ['content', '""'],
        ];
        const mask = [
          ['-webkit-mask-repeat', 'no-repeat'],
          ['mask-repeat', 'no-repeat'],
          ['-webkit-mask-position', 'center'],
          ['mask-position', 'center'],
          ['-webkit-mask-size', 'contain'],
          ['mask-size', 'contain'],
        ];
        const image = (name: string) => [
          ['-webkit-mask-image', `var(--ds-icons-${name})`],
          ['mask-image', `var(--ds-icons-${name})`],
          ['background-color', 'currentColor'],
        ];
        const forcedColors = [
          ['forced-color-adjust', 'none'],
          ['forced-color-adjust', 'preserve-parent-color'],
        ];
        const images = new Map(imagesOf());

        expect(declarationsOf(css, 'a::before')).toEqual([['display', 'inline-block'], ...box, ...mask, ...image('heart'), ...forcedColors]);
        expect(declarationsOf(css, 'b::before')).toEqual([['display', 'block'], ...box, ...mask, ...forcedColors]);
        expect(declarationsOf(css, 'b.--open::before')).toEqual(image('minus'));
        expect(declarationsOf(css, 'c::after')).toEqual([...box, ['content', '""/"Add"'], ...mask, ...image('plus'), ...forcedColors]);
        // In forced colors, the color its parent is given: the system color of the text, of a link, of a button.
        for (const selector of ['a::before', 'b::before', 'c::after']) expect(css).toContain(`@media(forced-colors: active){${selector}{color:inherit}}`);
        // The images of the icons drawn, once each, in the order of their first use, then the licence notice of the icons.
        expect(declarationsOf(css, ':root')).toEqual(['heart', 'minus', 'plus'].map(name => [`--ds-icons-${name}`, images.get(name)]));
        expect(css).toMatch(/\}\/\*! Icons: Lucide 1\.60\.0 \(lucide-static, https:\/\/lucide\.dev\), ISC License, [^*]*MIT License[^*]*\*\/$/);
      });

      it('writes no icon property nor notice without an icon, and the icons with ds-tokens()', () => {
        const none = compileString("@use 'engine' as *; @include ds-tokens(); @include ds-icon-tokens(); a { @include ds-icon-tokens(); b: c; }");
        const drawn = compileString("@use 'engine' as *; a::before { @include ds-icon(plus); } .promo { @include ds-tokens(colorset); } @include ds-tokens();");

        expect(none).not.toMatch(/--ds-icons-|\/\*!/);
        expect(declarationsOf(drawn, '.promo').some(([name]) => name.startsWith('--ds-icons-'))).toBe(false);
        expect(declarationsOf(drawn, ':root').filter(([name]) => name.startsWith('--ds-icons-'))).toEqual([['--ds-icons-plus', new Map(imagesOf()).get('plus')]]);
        expect(drawn.match(/\/\*!/g)).toHaveLength(1);
      });

      it('adds and replaces icons with a configured $icons, and fails on an unknown icon or a name that is not in kebab-case', () => {
        const use = "@use 'engine' as * with ($icons: (plus: url('plus.svg'), sparkle: url('data:image/svg+xml,%3Csvg%3E%3C/svg%3E')));";
        const css = compileString(
          `${use} a::before { @include ds-icon(plus); } b::before { @include ds-icon(sparkle); } c::before { @include ds-icon(heart); } @include ds-icon-tokens();`,
        );
        const tokens = new Map(declarationsOf(css, ':root'));

        expect(imagesOf(use).map(([name]) => name)).toEqual([...iconNames, ...addedIconNames, 'sparkle']);
        expect(tokens.get('--ds-icons-plus')).toBe('url("plus.svg")');
        expect(tokens.get('--ds-icons-sparkle')).toBe('url("data:image/svg+xml,%3Csvg%3E%3C/svg%3E")');
        expect(tokens.get('--ds-icons-heart')).toBe(new Map(imagesOf()).get('heart'));
        expect(() => sass.compileString(`@use 'engine' as *; a { @include ds-icon(dir-up); }`, { loadPaths })).toThrow(/Unknown icon: dir-up\. Icons: basket, ok, /);
        expect(() => sass.compileString(`@use 'engine' as *; a { @include ds-icon-content(nope); }`, { loadPaths })).toThrow(/Unknown icon: nope\./);
        expect(() => sass.compileString(`@use 'engine' as * with ($icons: ('Big Star': url(x.svg))); a { @include ds-icon('Big Star'); }`, { loadPaths })).toThrow(
          /The icon name Big Star is not in kebab-case/,
        );
        expect(() => sass.compileString(`@use 'engine' as *; @include ds-icon-font-face();`, { loadPaths })).toThrow(/Undefined mixin/);
      });

      it.each(themes)('the %s theme writes the image of each icon it draws once, then their licence notice', theme => {
        const tokens = tokensOf(theme);
        const drawn = iconsReadBy(themeCss[theme]);

        expect(drawn.size).toBeGreaterThan(20);
        expect([...tokens.keys()].filter(name => name.startsWith('--ds-icons-')).sort()).toEqual([...drawn].map(name => `--ds-icons-${name}`).sort());
        expect(themeCss[theme].match(/\/\*![\s\S]*?\*\//g)).toEqual([expect.stringMatching(/^\/\*! Icons: Lucide 1\.60\.0 .*ISC License.*MIT License.* \*\/$/)]);
        expect(themeCss[theme]).toMatch(/\}\/\*! Icons: [^*]*\*\/$/);
      });

      // The published package holds dist/ and loader/: the CSS build copies the licence texts of the icon set into dist/css/,
      // and the notice of the stylesheets names that copy.
      it('ships the licence texts of the icons next to the stylesheets, in the file their notice names', async () => {
        const { copyIconsLicence, ICONS_LICENCE_FILE } = await import('../scripts/build-icons.mjs');
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-icons-licence-'));
        const licence = fs.readFileSync(path.join(root, 'scss/engine/icons/LICENSE'), 'utf8');

        try {
          expect(copyIconsLicence(path.join(dir, 'css'))).toBe(path.join(dir, 'css', 'LICENSE-icons.txt'));
          expect(fs.readFileSync(path.join(dir, 'css', ICONS_LICENCE_FILE), 'utf8')).toBe(licence);
        } finally {
          fs.rmSync(dir, { recursive: true, force: true });
        }
        expect(licence).toMatch(/^ISC License\n[\s\S]*The MIT License \(MIT\)/);
        expect(fs.readFileSync(path.join(root, 'scripts/build-css.mjs'), 'utf8')).toContain('copyIconsLicence(cssDir)');
        expect(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).files).toContain('dist/');
        for (const theme of themes) expect(themeCss[theme]).toContain(`Licence texts: dist/css/${ICONS_LICENCE_FILE} of the dot-stash package. */`);
      });

      it('gives each type of ds-icon an image of the default theme', () => {
        const tokens = tokensOf('default');

        for (const type of iconTypes) {
          const declarations = allDeclarationsOf(themeCss.default, `.ds-icon.--${type}::before`);
          const name = declarations.find(([property]) => property === 'mask-image')?.[1].match(/^var\(--ds-icons-([\w-]+)\)$/)?.[1];
          expect([type, declarations.slice(0, 3)]).toEqual([
            type,
            [
              ['-webkit-mask-image', `var(--ds-icons-${name})`],
              ['mask-image', `var(--ds-icons-${name})`],
              ['background-color', 'currentColor'],
            ],
          ]);
          expect([type, tokens.has(`--ds-icons-${name}`)]).toEqual([type, true]);
        }
        expect([...themeCss.default.matchAll(/\.ds-icon\.--([\w-]+)::before\{-webkit-mask-image:/g)].map(([, type]) => type)).toEqual(iconTypes);
      });

      // Forced colors: the browser replaces the colors of the page with the system colors, and the background of the box
      // of an icon with the background of the page (the icon would not show): the boxes keep their background, in the color
      // their parent is given.
      it('the default theme keeps its icons visible in forced colors', () => {
        const boxes = [...themeCss.default.matchAll(/(?<=^|\})([^{}@]+)\{([^{}]*-webkit-mask-repeat:no-repeat[^{}]*)\}/g)];

        expect(boxes.length).toBeGreaterThanOrEqual(10);
        for (const [, selector, body] of boxes) {
          expect([selector, body]).toEqual([selector, expect.stringContaining('forced-color-adjust:none;forced-color-adjust:preserve-parent-color')]);
          expect(themeCss.default).toContain(`@media(forced-colors: active){${selector}{color:inherit}}`);
        }
      });

      // CSS alternative text: the box of an icon holds no text; `$alt: ''` says that a decorative icon is not read, nor part of
      // the name of its element, after the empty content alone, for the browsers without that syntax.
      it('writes the alternative text of an icon after its empty content, with $alt', () => {
        const css = compileString(
          `@use 'engine' as *; a { @include ds-icon(angle-down, $alt: ''); } b { @include ds-icon-content(plus); } c { @include ds-icon-content(null, 'Open'); }`,
        );
        const contents = (declarations: [string, string][]) => declarations.filter(([name]) => name === 'content');

        expect(contents(declarationsOf(css, 'a'))).toEqual([
          ['content', '""'],
          ['content', '""/""'],
        ]);
        expect(contents(declarationsOf(css, 'b'))).toEqual([]);
        expect(declarationsOf(css, 'c')).toEqual([
          ['content', '""'],
          ['content', '""/"Open"'],
        ]);
        for (const icon of ['.ds-panel__title::after', '.ds-ajax.--is-loading::after']) {
          expect([icon, contents(allDeclarationsOf(themeCss.default, icon))]).toEqual([
            icon,
            [
              ['content', '""'],
              ['content', '""/""'],
            ],
          ]);
        }
      });
    });

    it('leaves the declaration out for an optional color that does not exist', () => {
      const css = compileString(`@use 'engine' as *; a { color: ds-color(status, overdue, $optional: true); border-color: ds-color(status, error, $optional: true); }`);

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
      const css = compileString(`@use 'engine' as *; .promo { --ds-color-primary-base: #c00; @include ds-tokens(colorset); }`);
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

  // The styling contract (README.md, "Styling a component"): a component stylesheet holds what the component needs to
  // work, the theme its look. The component custom properties (--ds-<component>-…) are documented with @prop in the
  // component stylesheet (Stencil lists them in the readme), set by the default theme, and read by its skins or by the
  // component stylesheet. A few are set by the components themselves, from their props, instead of the theme: the layout
  // of ds-grid. The default theme compiles without any warning (above).
  describe('styling contract', () => {
    const coreDir = path.join(root, 'components/core');
    const relative = (file: string) => path.relative(root, file);
    const tsxFilesIn = (dir: string): string[] =>
      fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap(entry => (entry.isDirectory() ? tsxFilesIn(path.join(dir, entry.name)) : /(?<!\.spec)\.tsx$/.test(entry.name) ? [path.join(dir, entry.name)] : []))
        .sort();

    // Each component: its tag, its folder (its readme) and its stylesheets (styleUrl, styleUrls).
    const components = tsxFilesIn(coreDir)
      .map(file => {
        const source = fs.readFileSync(file, 'utf8');
        const urls = source.match(/styleUrls?:\s*(\[[^\]]*\]|'[^']*')/)?.[1] ?? '';
        return {
          tag: source.match(/tag:\s*'(ds-[\w-]+)'/)?.[1],
          dir: path.dirname(file),
          sheets: [...urls.matchAll(/'([^']+)'/g)].map(([, url]) => path.resolve(path.dirname(file), url)),
        };
      })
      .filter(({ tag }) => tag);
    const tags = components.map(({ tag }) => tag);
    const componentSheets = scssFilesIn(coreDir);
    const read = (file: string) => fs.readFileSync(file, 'utf8');

    // The component a custom property belongs to: the longest tag it starts with (--ds-slider-menu-… is ds-slider-menu's).
    const ownerOf = (name: string): string | undefined => tags.filter(tag => name.startsWith(`--${tag}-`)).sort((a, b) => b.length - a.length)[0];

    // The @prop annotations of a stylesheet, as Stencil reads them in its /** */ comments: the names of the documented properties.
    const documentedIn = (file: string): string[] =>
      [...read(file).matchAll(/\/\*\*[\s\S]*?\*\//g)].flatMap(([comment]) => [...comment.matchAll(/@prop\s+(--[\w-]+)\s*:\s*\S/g)].map(([, name]) => name));
    const documentedBy = (component: (typeof components)[number]) => component.sheets.flatMap(documentedIn).sort();
    const documented = new Set(components.flatMap(documentedBy));

    // The custom properties a component writes itself, from its props (`'--ds-grid-cols': …` in its source): the theme
    // does not set them.
    const componentSources = tsxFilesIn(coreDir).map(read).join('\n');
    const isSetByComponent = (name: string) => componentSources.includes(`'${name}'`);

    // The declarations of a compiled stylesheet, comments left out: [property, value].
    const declarationsIn = (css: string): [string, string][] =>
      [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([\w-]+)\s*:\s*([^;{}]+);/g)].map(([, name, value]) => [name.toLowerCase(), value.trim()]);

    // A word of a value that Sass reads as a color: a CSS color name (gray, red…).
    const colorNames = new Map<string, boolean>();
    const isColorName = (word: string): boolean => {
      if (!colorNames.has(word)) {
        let isColor: boolean;
        try {
          isColor = sass.compileString(`@use 'sass:meta'; a { b: meta.type-of(${word}); }`).css.includes('b: color');
        } catch {
          isColor = false;
        }
        colorNames.set(word, isColor);
      }
      return colorNames.get(word);
    };

    // The typography declarations a component stylesheet may write: resets, which make an element inherit the typography
    // of its parent (set by the theme) and set none of their own.
    const typographyResets = [
      ['components/core/combo/combo.scss', 'font', 'inherit'], // the native button of the toggle
      ['components/core/title/title.scss', 'font-size', 'inherit'], // the headings, paragraphs and links in a title
      ['components/core/trigger/trigger.scss', 'font-size', 'inherit'], // the link or button in a trigger
    ];

    let themeCss: string;

    beforeAll(() => {
      themeCss = sass.compile(path.join(root, 'scss/themes/default/index.scss'), { style: 'compressed' }).css;
    });

    it('finds the components and their stylesheets, each one the stylesheet of a component', () => {
      expect(components.length).toBeGreaterThan(20);
      expect(new Set(tags).size).toBe(tags.length);
      for (const { sheets } of components) for (const sheet of sheets) expect([relative(sheet), fs.existsSync(sheet)]).toEqual([relative(sheet), true]);
      // Stencil only reads the @prop annotations of the stylesheets of a component.
      expect(componentSheets.filter(file => !components.some(({ sheets }) => sheets.includes(file))).map(relative)).toEqual([]);
    });

    it.each(componentSheets.map(relative))('%s writes no color and no font: they are the look of the theme', file => {
      const declarations = declarationsIn(sass.compile(path.join(root, file)).css);
      const colors = declarations.filter(([, value]) => {
        const words: string[] = value.replace(/--[\w-]+/g, '').match(/(?<![\w#.-])[a-z]+(?![\w(-])/gi) ?? [];
        return (
          /#[0-9a-f]{3,8}\b/i.test(value) ||
          /(?<![\w-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i.test(value) ||
          words.some(word => word.toLowerCase() !== 'transparent' && isColorName(word))
        );
      });
      const fonts = declarations.filter(([name]) => ['font', 'font-family', 'font-size'].includes(name));

      expect(declarations.length + documentedIn(path.join(root, file)).length).toBeGreaterThan(0);
      expect(colors).toEqual([]);
      expect(fonts.filter(([name, value]) => !typographyResets.some(reset => reset[0] === file && reset[1] === name && reset[2] === value))).toEqual([]);
    });

    it('allows each typography reset where it is written', () => {
      for (const [file, name, value] of typographyResets) expect(declarationsIn(sass.compile(path.join(root, file)).css)).toContainEqual([name, value]);
    });

    it('parses the declarations, and recognizes the color names', () => {
      const css = sass.compileString(
        'a { color: gray; border: 1px solid #000; background: rgb(0 0 0 / 0.5); font-size: 1rem; b: var(--ds-x-y, red); c: transparent; d: currentColor; }',
      ).css;
      const declarations = declarationsIn(css);

      expect(declarations.map(([name]) => name)).toEqual(['color', 'border', 'background', 'font-size', 'b', 'c', 'd']);
      expect(['gray', 'red', 'Gray'].every(isColorName)).toBe(true);
      expect(['currentColor', 'solid', 'inherit', 'none', 'ease'].some(isColorName)).toBe(false);
    });

    it.each(componentSheets.map(relative))('%s reads no other custom property than those of its component it documents', file => {
      const component = components.find(({ sheets }) => sheets.includes(path.join(root, file)));
      const readNames = [...read(path.join(root, file)).matchAll(/var\(\s*(--[\w-]+)/g)].map(([, name]) => name);
      const own = documentedBy(component);

      expect(readNames.filter(name => !own.includes(name))).toEqual([]);
    });

    it.each(components.filter(component => documentedBy(component).length).map(({ tag }) => tag))('%s documents its custom properties once, named after it', tag => {
      const names = documentedBy(components.find(component => component.tag === tag));

      expect(new Set(names).size).toBe(names.length);
      expect(names.filter(name => ownerOf(name) !== tag)).toEqual([]);
    });

    it('the default theme sets every documented custom property but those a component sets from its props, and its skins or a component stylesheet read it', () => {
      const declared = new Set([...themeCss.matchAll(/[{;](--ds-[\w-]+):/g)].map(([, name]) => name));
      const readByTheme = [...themeCss.matchAll(/var\((--ds-[\w-]+)/g)].map(([, name]) => name);
      const readBySheets = componentSheets.flatMap(file => [...read(file).matchAll(/var\(\s*(--[\w-]+)/g)].map(([, name]) => name));

      expect(documented.size).toBeGreaterThan(50);
      expect([...documented].filter(name => !isSetByComponent(name) && !declared.has(name))).toEqual([]);
      expect([...documented].filter(name => isSetByComponent(name) && declared.has(name))).toEqual([]);
      expect([...documented].filter(name => !readByTheme.includes(name) && !readBySheets.includes(name))).toEqual([]);
    });

    // The layout of ds-grid comes from the props of ds-grid and ds-grid-item (and their values per breakpoint, ds-rsp).
    it('documents the custom properties ds-grid and ds-grid-item set from their props, and only those are set by a component', () => {
      expect([...documented].filter(isSetByComponent).sort()).toEqual([
        '--ds-grid-cell-ratio',
        '--ds-grid-cols',
        '--ds-grid-h-gap',
        '--ds-grid-item-ratio',
        '--ds-grid-span',
        '--ds-grid-v-gap',
      ]);
    });

    it('the default theme declares and reads no undocumented component custom property, and no token is named after a component', () => {
      const names = new Set([...themeCss.matchAll(/(?:[{;]|var\()(--ds-[\w-]+)/g)].map(([, name]) => name));
      const tokens = new Set([...(themeCss.match(/(?:^|})\s*:root\{([^}]*)\}/)?.[1] ?? '').matchAll(/(--ds-[\w-]+):/g)].map(([, name]) => name));

      expect(tokens.size).toBeGreaterThan(100);
      expect([...tokens].filter(ownerOf)).toEqual([]);
      expect([...names].filter(name => !tokens.has(name) && !documented.has(name))).toEqual([]);
    });

    // The readmes are generated by `npm run build` (Stencil): the CSS Custom Properties section lists the @prop annotations,
    // the Styling section above the generated part is written by hand.
    it.each(tags)('the readme of %s has a Styling section and lists its documented custom properties', tag => {
      const component = components.find(other => other.tag === tag);
      const [handWritten, generated = ''] = read(path.join(component.dir, 'readme.md')).split('<!-- Auto Generated Below -->');
      const listed = [...(generated.match(/\n## CSS Custom Properties\n([\s\S]*?)(?=\n## |\n-{3,})/)?.[1] ?? '').matchAll(/^\| `(--[\w-]+)`/gm)].map(([, name]) => name);

      expect(handWritten).toMatch(/\n## Styling\n/);
      expect(listed.sort()).toEqual(documentedBy(component));
    });
  });

  // Accessibility (README.md, "Accessibility"): the focus indicator, that no stylesheet removes, less motion, and the
  // visually hidden class of the default theme.
  describe('accessibility', () => {
    let themeCss: string;

    beforeAll(() => {
      themeCss = sass.compile(path.join(root, 'scss/themes/default/index.scss'), { style: 'compressed' }).css;
    });

    it('the default theme draws the focus indicator on :focus-visible, from the focus tokens', () => {
      expect(themeCss).toMatch(
        /(^|\})\s*:focus-visible\{outline:var\(--ds-focus-width\) var\(--ds-focus-style\) var\(--ds-focus-color\);outline-offset:var\(--ds-focus-offset\)\}/,
      );
    });

    it.each(['scss/themes/default/index.scss', ...scssFilesIn(path.join(root, 'components')).map(file => path.relative(root, file))])(
      '%s does not remove the focus outline',
      file => {
        const css = sass.compile(path.join(root, file)).css.replace(/\/\*[\s\S]*?\*\//g, '');
        const outlines = [...css.matchAll(/(?<![\w-])(outline(?:-style|-width)?)\s*:\s*([^;{}]+)/g)].map(([, name, value]) => [name, value.trim()]);

        expect(outlines.filter(([, value]) => /^(none|0(px)?|hidden)\b/.test(value))).toEqual([]);
      },
    );

    it('the default theme ends the transitions and animations at once with less motion, but for the loading indicators', () => {
      const rules = (selector: string) =>
        [...themeCss.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([^{}]+)\{([^{}]*)\}\}/g)]
          .filter(([, selectors]) => selectors === selector)
          .map(([, , body]) => body.split(';'));

      // 0.01ms, not 0: the transitionend and animationend events still come.
      expect(rules('*,*::before,*::after')).toEqual([
        [
          'transition-duration:.01ms !important',
          'transition-delay:0s !important',
          'animation-duration:.01ms !important',
          'animation-delay:0s !important',
          'animation-iteration-count:1 !important',
          'scroll-behavior:auto !important',
        ],
      ]);
      for (const spinner of ['.ds-ajax.--is-loading::after', '.ds-icon.--loading::before']) {
        expect(rules(spinner)).toEqual([['animation-duration:4s !important', 'animation-iteration-count:infinite !important']]);
      }
    });

    it('the default theme has a visually hidden class', () => {
      expect(themeCss).toMatch(
        /\.ds-visually-hidden\{position:absolute !important;width:1px !important;height:1px !important;[^}]*overflow:hidden !important;clip-path:inset\(50%\) !important;/,
      );
    });
  });
});
