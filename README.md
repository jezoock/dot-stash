# dot-stash

A standalone UI library made of two parts:

- **Web components**: generic `ds-*` custom elements built with Stencil. They render in the light DOM (no shadow DOM) and use plain class names (`ds-block`, `ds-block__body`, `--modifier`), so a regular page stylesheet can style them.
- **SCSS theming toolkit**: an engine (design tokens, functions and mixins) and a theme built on it, `default`, neutral, compiled by a small Node script (`scripts/build-css.mjs`) into one global stylesheet (`dist/css/default.css`) that skins the components and the page. A project gets its own look by configuring the engine in a theme of its own (see [Creating a theme](#creating-a-theme)).

Each component keeps its structure in its own stylesheet (`styleUrl`), which Stencil injects into the document, and gets its look from the theme stylesheet, through a few component custom properties (`--ds-tooltip-background`, `--ds-sidebar-width`…): see [Styling a component](#styling-a-component).

## Requirements

- Node.js 22 or later (`.nvmrc`, `package.json` `engines`): `@stencil/sass` requires it, and the build scripts use its recursive `fs.watch` (Linux, macOS, Windows)
- npm

## Install

```sh
git clone https://github.com/jezoock/dot-stash.git
cd dot-stash
npm ci
npm run build:all
```

## npm scripts

| Script                 | What it does                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm start`            | Development: the CSS watcher and the Stencil dev server, in one terminal (`scripts/dev.mjs`, see [Tooling](#tooling)). Serves `www/` (page `components/index.html`) on `http://localhost:3333/`.         |
| `npm run build`        | Stencil production build: the package in `dist/` and `loader/`, the dev page in `www/`. Also regenerates `components/components.d.ts` and the component `readme.md` files.                               |
| `npm run build:css`    | Compiles every theme and its page stylesheets into `dist/css/` (`scripts/build-css.mjs`, see [Tooling](#tooling)).                                                                                       |
| `npm run build:all`    | Runs `clean`, `build:css`, then `build`.                                                                                                                                                                 |
| `npm run clean`        | Deletes `dist/`, `www/`, `.stencil/` and `loader/`.                                                                                                                                                      |
| `npm test`             | Unit tests: Stencil spec tests (`stencil test --spec`, Jest), without a browser. See [Tests](#tests).                                                                                                    |
| `npm run test.watch`   | Same as `npm test`, in watch mode.                                                                                                                                                                       |
| `npm run test:e2e`     | Stencil end-to-end tests (`stencil test --e2e`, Puppeteer and Chromium). No end-to-end test exists yet, and CI does not run them.                                                                        |
| `npm run generate`     | Stencil component generator (interactive).                                                                                                                                                               |
| `npm run lint`         | ESLint on the repository: the components, the scripts and the configuration files (`eslint.config.mjs`: ESLint recommended + typescript-eslint recommended rules).                                       |
| `npm run lint:fix`     | Same as `lint`, applying automatic fixes.                                                                                                                                                                |
| `npm run lint:css`     | Stylelint on the `.scss` files of `scss/` and `components/` (`stylelint.config.mjs`, see [Tooling](#tooling)).                                                                                           |
| `npm run format`       | Prettier on the `ts`, `tsx`, `js`, `mjs`, `scss`, `json`, `html`, `yml`, `yaml` and `md` files (`.prettierignore` excludes build output and generated files, including the component `readme.md` files). |
| `npm run format:check` | Checks the same files without writing.                                                                                                                                                                   |

## Tooling

The build uses Stencil for the components and the `sass` package for the theme stylesheets, run by two Node scripts, without a task runner:

- **`scripts/build-css.mjs`** (`npm run build:css`) compiles the themes listed in `dot-stash.config.mjs`: it deletes `dist/css/`, then compiles each `scss/themes/<theme>/index.scss` to `dist/css/<theme>.css` and each page stylesheet, `scss/themes/<theme>/pages/<page>.scss` (not the `_partials`), to `dist/css/pages/<theme>/<page>.css`, compressed. It prints the Sass warnings; a Sass error fails the build (exit code 1). Options, after `--` (`npm run build:css -- --watch`):
  - `--watch`: after the build, recompiles on each change in `scss/`: a file of the engine, every theme and its pages; a file of a theme, that theme and its pages; a page stylesheet, that page (deleted, its stylesheet too). A Sass error is printed, the last stylesheet that compiled stays, and the watch goes on.
  - `--strict`: a Sass warning fails the compilation, as an error.
  - `--source-map`: writes a source map, `<stylesheet>.css.map`, next to each stylesheet, with the SCSS sources in it.
- **`scripts/dev.mjs`** (`npm start`) runs `build-css.mjs --watch` and, once the stylesheets are compiled, the Stencil dev server (`stencil build --dev --watch --serve`), in one terminal; Ctrl+C stops both, and when one of them stops, the other is stopped too. The dev server serves `www/`, with the dev page `components/index.html`: add `ds-*` markup there to try the components. The Stencil build copies `dist/css/` to `www/css/`, and watches `dist/css/` (`watchExternalDirs` in `stencil.config.ts`): a stylesheet the watcher recompiles makes a rebuild, which copies it, and the page reloads. A change of a component reloads it as before (Stencil's hot module replacement).
- **`dot-stash.config.mjs`** is the configuration of the stylesheet build: `themes` (the folders of `scss/themes/` to compile), `paths` (`scss`, the sources; `css`, the output, `dist/css`) and `css` (`style`, `compressed` or `expanded`; `sourceMap`).
- **Stylelint** (`npm run lint:css`, `stylelint.config.mjs`) checks the SCSS with the standard SCSS configuration (`stylelint-config-standard-scss`), adapted to the conventions of the project, each change explained in the configuration: the class names `ds-<block>__<element>--<modifier>` and `--<modifier>`, the custom properties `--ds-…`, the blank lines that group the lines of a block, the explicit `== null` tests of the engine, and the values the compiled theme writes as they are (six-digit colors, font names, the quoted icon font). Prettier formats the files (Stylelint has no formatting rule left).
- **TypeScript** (`typescript`, `~5.8.3`) is the version Stencil 4.45 compiles with (it bundles its own copy): typescript-eslint and the editors use this one, and `npx tsc --noEmit` type-checks `components/` with it.

The dev page only loads the components (`/build/dot-stash.esm.js`) and the `default` theme stylesheet (`/css/default.css`, the copy of `dist/css/default.css`); a page stylesheet is at `/css/pages/<theme>/<page>.css`. The former demo (the `ds-main` component, the theme switcher and the runtime color control of the dev pages) is archived on `archive/propal` (see [Archived code](#archived-code)).

CI (`.github/workflows/ci.yml`, GitHub Actions) runs `npm ci`, `build:all` (then checks that the main build outputs exist), `format:check`, `lint`, `lint:css` and `npm test` on every push and pull request. Every step is blocking: a build, formatting, lint or test error fails the run.

## Project structure

```
components/
  core/            ds-* components, one folder each (.tsx, structural .scss with the documented
                   custom properties, type and enum modules, readme.md: generated, below a
                   hand-written Styling section, and an Accessibility section for the overlays and
                   the form controls)
  utils/           shared TypeScript: utility modules (props, css, dom, ajax, responsive, tokens, env,
                   form, context), the `ds` object grouping them (dot-stash.ts), debounce, throttle,
                   uuid, the internal focus and transition helpers of the components (focus.ts,
                   transition.ts), and shared types and enums (interfaces/)
  index.ts         package entry point
  index.html       dev page served by the Stencil dev server (npm start)
  components.d.ts  component typings, generated by Stencil
scss/
  engine/          generic toolkit, no CSS output of its own (_index.scss forwards everything)
    variables/     token schema with neutral defaults: breakpoints, palette, typography, icons, spacing
    tools/         functions and mixins: tokens (custom properties), references, colors, typography,
                   icons, spacing, breakpoints, misc
  themes/
    default/       neutral theme: _tokens.scss (the engine defaults), _base.scss, layout/,
                   components/, pages/, index.scss (entry point)
scripts/
  build-css.mjs        theme stylesheet build and watcher (npm run build:css)
  dev.mjs              npm start: the CSS watcher and the Stencil dev server
dot-stash.config.mjs   stylesheet build configuration: themes, paths, output style, source maps
stencil.config.ts      Stencil configuration (srcDir: components)
eslint.config.mjs      ESLint configuration (npm run lint)
stylelint.config.mjs   Stylelint configuration (npm run lint:css)
docs/                  project notes (archives)
```

## Build output

`npm run build:all` produces:

| Path                                 | Content                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `dist/index.js`, `dist/index.cjs.js` | Package entry: the shared utilities (`esm/` and `cjs/` hold the lazy-loaded component code) |
| `dist/dot-stash/`                    | Browser build, loaded with a script tag (`dot-stash.esm.js`)                                |
| `dist/collection/`                   | Stencil collection, to use the components from another Stencil project                      |
| `dist/types/`                        | Type declarations (`index.d.ts`, `components.d.ts`)                                         |
| `loader/`                            | `defineCustomElements()` to register the components from a bundler                          |
| `dist/css/<theme>.css`               | Theme stylesheets (`build:css`): `default.css`                                              |
| `dist/css/pages/<theme>/<page>.css`  | Page stylesheets of each theme (`build:css`)                                                |

Stencil runs with `empty: false`, so it does not delete the stylesheets of `build:css` in `dist/css/`. The published package contains `dist/` and `loader/`. The dev page in `www/` gets a copy of `dist/css/` in `www/css/`.

## Theming

The SCSS uses the Sass module system (`@use` and `@forward`, no `@import`) and the built-in modules (`sass:map`, `sass:list`, `sass:string`, `sass:color`): compile it with Dart Sass, the `sass` or `sass-embedded` package, 1.107 or later (the version in `package-lock.json`, which compiles it without any warning). LibSass and `node-sass` do not support it. `scripts/build-css.mjs` compiles the themes with `sass`, Stencil (`@stencil/sass`) the component stylesheets with `sass-embedded`.

It has two layers:

- **The engine** (`scss/engine/`): the token schema, with neutral defaults, and the functions and mixins that read the tokens. It outputs no CSS by itself. `@use '<path to>/scss/engine' as *;` gives the tokens, functions and mixins without a namespace (`ds-color(...)`, `break-p(...)`, `$breakpoints`). Each theme writes the tokens once as CSS custom properties (`--ds-color-primary-base`…), and the skins read them with `var()`: see [Design tokens as custom properties](#design-tokens-as-custom-properties).
- **Themes** (`scss/themes/<theme>/`): a theme configures the engine tokens and writes the CSS (base styles, fonts, component skins). Each one compiles to `dist/css/<theme>.css`. The library has one, `default`: neutral (blue primary, slate secondary, gray scale, system font stacks). Its base styles and skins take their sizes, colors and fonts from the tokens: a project creates its own theme by configuring the engine with its own tokens, from a copy of `default` or on top of it (see [Creating a theme](#creating-a-theme)).

The former `legacy` theme (the look of the site the library comes from: gold primary, Montserrat and Mulish, site-specific modifiers and page classes) was removed; it is archived on the `archive/propal` branch, in `archived/themes/legacy/` (see [Archived code](#archived-code)), an example of a theme that configures the engine and adds tokens of its own.

### Themes

A theme folder holds:

| File                     | Content                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_tokens.scss`           | Loads the engine configured for the theme (`@forward '../../engine' with (…)`). The other files of the theme start with `@use '../tokens' as *;` (or `'./tokens'`): they all get the configured tokens.       |
| `index.scss`             | The entry point compiled by `build:css`: loads the tokens first, then the base styles and skins (the order of the `@use` rules is the order of the CSS output), and ends with `@include tokens.ds-tokens();`. |
| `_base.scss`             | Base element styles, the focus indicator, less motion and the `.ds-visually-hidden` class (see [Accessibility](#accessibility)).                                                                              |
| `layout/`, `components/` | Skins, one partial per component.                                                                                                                                                                             |
| `pages/`                 | The page stylesheets of the theme (see [Page stylesheets](#page-stylesheets)).                                                                                                                                |

`themes` in `dot-stash.config.mjs` lists the themes `npm run build:css` compiles, `['default']`: each `scss/themes/<theme>/index.scss` to `dist/css/<theme>.css` and each `scss/themes/<theme>/pages/<page>.scss` to `dist/css/pages/<theme>/<page>.css`, compressed. `npm start` recompiles them on change (see [Tooling](#tooling)).

### Creating a theme

The library ships one theme, `default`. A project creates its own by configuring the engine with its tokens (colors, fonts, sizes, breakpoints…): in a theme folder of its own, with its own skins (the steps below), or on top of the `default` skins (see the end of this section).

1. Copy `scss/themes/default/` to `scss/themes/<name>/`.
2. Configure the engine in its `_tokens.scss`:

   ```scss
   @forward '../../engine' with (
     $colors: (
       primary: (
         darker: #134e4a,
         dark: #0f766e,
         base: #0d9488,
         light: #ccfbf1,
       ),
       // secondary, gray, status, input, shadow, indicator: all the families, with all their shades
     ),
     $font-family-base: (
       'Inter',
       system-ui,
       sans-serif,
     ),
     $grid-md: 1024
   );
   ```

   A configured map replaces the whole default map: keep its keys, the tools and skins read them. The tokens derived from others follow the configured values: `$breakpoints` is built from `$grid-*`, `$font-families` from `$font-family-*`, and `$colorset` and `$font-styles` refer to `$colors`, `$font-sizes` and `$font-families` with `ds-ref()` (see [References](#references-derived-tokens)). With `!default` after a value (`$grid-md: 1024 !default`), a stylesheet can still change it when it loads the theme: `@use 'themes/<name>/tokens' with ($grid-md: 1100); @use 'themes/<name>';`.

3. Edit the base styles and skins, or add some: each partial starts with `@use '../tokens' as *;` and is loaded by `index.scss`. Keep `@include ds-icon-font-face();` and `@include ds-keyframes();` (once, at the root), and `@include tokens.ds-tokens();` at the end of `index.scss`: the custom properties the skins read, and the breakpoints JavaScript reads (`--ds-bp-labels`, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript)).
4. Add the name to `themes` in `dot-stash.config.mjs`, then run `npm run build:css`: `dist/css/<name>.css`. `npm test` compiles the new theme, fails on any Sass warning, and checks its custom properties, `--ds-bp-labels` included.

The engine can also be configured from outside a theme that does not configure it, before the theme loads it: a project that keeps the `default` skins compiles its own stylesheet, `@use '<path to>/scss/engine' with ($grid-md: 1024); @use '<path to>/scss/themes/default';` (the same configuration as in step 2), and gets them with its tokens.

### Skins read the tokens

The skins take their values from the tokens, so that a theme configures them in one place (`_tokens.scss`) and a page can change them at runtime (see [Changing a token at runtime](#changing-a-token-at-runtime)). In a skin:

- **Colors**: `ds-color(<family>, <shade>)` or a colorset (`ds-colorset-styles()`), never a hex value, `rgb()` or a color keyword (`transparent` aside). A color the palette lacks is added to the `$colors` of the theme, in a family and shade named after its role, not after its value: two colors with the same value are different tokens when their roles differ. Shadows and veils are colors too (`rgba()` values, such as `shadow` `base`). Color math (`color.change()`) takes the `-value` accessors and does not follow the tokens at runtime: prefer a token.
- **Font families**: `ds-font-family(<type>, <variant>)` (font styles) or `ds-token(font-family, <name>)`, never a font name; the icon font, `'ds-icons'`, is the one exception (the `ds-icon()` mixins write it).
- **Font sizes, spacing, radii**: `ds-token(font-size, <step>)`, `ds-spacing(<step>)` (margins, paddings, gaps) and `ds-radius(<name>)` where the value is a step of the scale, in the same unit. The other values stay literal: sizes off the scale, offsets (`top: 0.5rem`), zeros.
- **Component custom properties**: the skin of a component sets them on the component element with the same accessors, interpolated (`--ds-tooltip-background: #{ds-color(secondary, darker)};`), and its rules read them (see [Styling a component](#styling-a-component)).
- **`!important`**: only where the rule must win over a more specific rule of the theme or of a component, with a comment that names it.

### Tokens (`scss/engine/variables/`)

Every token is declared with `!default`. The defaults are neutral: the values of the `default` theme.

- `_palette.scss`
  - `$colors`: color families and their shades: `primary` and `secondary` (`darker`, `dark`, `base`, `light`), `gray` (`white`, `lightest`, `lighter`, `light`, `base`, `dark`, `darker`, `darkest`, `black`), `status` (`success`, `warning`, `error`, `info`, `busy`, `disabled`, `discount`, `new`), `input` (`caret`, and the toggles of `ds-toggle`: `unchecked`, `checked`, `disabled`, `track`, `track-disabled`, `knob`, `knob-checked`, `knob-disabled`), `shadow` (`base`, `strong`), `indicator` (`base`, `active`: the dots of `ds-slider-menu`). A theme can add families and shades of its own, for the colors the palette lacks (see [Skins read the tokens](#skins-read-the-tokens)): each one gets its custom property.
  - `$colorset`: named sets of `text`, `border` and `background` colors, grouped by type (`solid`, `outlined`, `link`) with variants such as `primary`, `primary-hover`, `secondary`, `white`, `gray` or `disabled`. Its colors are references to `$colors` (`ds-ref(color, primary, base)`) or colors of their own.
  - `$gradients`: named gradients for `gradient()`, `(name: (fallback: …, from: …, to: …))`, empty by default.
- `_typography.scss`
  - `$font-size-100` to `$font-size-900`, and the `$font-sizes` scale (`100` to `900`).
  - `$font-family-base`, `$font-family-heading`, `$font-family-mono` (system font stacks, no font file) and `$font-families` (`default`, `heading`, `mono`).
  - `$font-styles`: family, size, weight and decoration per type (`page`, `text`, `title`, `button`, `form`, `link`) and variant (for `title`: `page-main`, `page-sub`, `section-main`, `section-sub`, `block-main`, `block-sub`). A variant inherits the `default` variant of its type, which inherits the top-level `default`. Families and sizes are references (`ds-ref(font-family, heading)`, `ds-ref(font-size, 800)`).
- `_icons.scss`: `$icons`, icon names mapped to glyph codes of the `ds-icons` font.
- `_breakpoints.scss`: `$grid-xxs` to `$grid-xxl`, and `$breakpoints`, minimum widths in px (`xxs` 360, `xs` 576, `sm` 768, `md` 992, `lg` 1200, `xl` 1400, `xxl` 1600).
- `_spacing.scss`: `$spacings`, steps `0` to `8` (`0` to `4rem`), and `$radii` (`none`, `sm`, `md`, `lg`, `pill`, `circle`).
- `_focus.scss`: `$focus`, the focus indicator: `color` (a reference to the primary base color), `width` (`2px`), `style` (`solid`), `offset` (`2px`, the space between the element and its outline). See [Accessibility](#accessibility).

### Functions and mixins (`scss/engine/tools/`)

The accessors of the tokens return their custom property, `var(--ds-…)` (see [Design tokens as custom properties](#design-tokens-as-custom-properties)); each one has a `-value` variant that returns the Sass value, for computations.

- Tokens: `@include ds-tokens($groups...)` writes the custom properties. `ds-token($group, $keys...)` returns the custom property of any token (`ds-token(font-size, 100)` → `var(--ds-font-size-100)`), `ds-token-value()` its Sass value, `ds-token-name()` its name (`--ds-font-size-100`), `ds-has-token()` whether it exists and has a value. `ds-ref($group, $keys...)` makes a reference to a token, in a token map.
- Colors: `ds-color($type, $variant: base)`, `ds-colorset-text()`, `ds-colorset-border()`, `ds-colorset-background()`, `ds-colorset-style($prop, $type, $variant)`, and `@include ds-colorset-styles($type, $variant)` for all three properties. `gradient($name, $attr)` and `@include gradient($name, $orientation)` read `$gradients`.
- Typography: `ds-font-style($prop, $type, $variant)`, `ds-font-family()`, `ds-font-size()`, `ds-font-weight()`, `ds-font-decoration()` (`$type`, `$variant`), and `@include ds-font-styles($type, $variant)` for the family, size, weight and decoration.
- Icons: `@include ds-icon($name, $display)` for an icon glyph, `@include ds-icon-content($name)` for the glyph only (a name that is not in `$icons` is an error), and `@include ds-icon-font-face($path: '../fonts')` for the `@font-face` of the `ds-icons` font.
- Spacing: `ds-spacing($step)`, `ds-radius($name)`.
- Focus: `ds-focus($prop)` (`ds-focus(color)` → `var(--ds-focus-color)`), and `@include ds-focus-ring()`, the outline drawn from the focus tokens (the base styles of a theme write it for `:focus-visible`).
- Breakpoints: `@include break-p($min, $max)` writes a media query from `$breakpoints`: `min-width` for `$min`, `max-width` (value - 1) for `$max`, or both; an unknown label, or none, is an error (below the first breakpoint: `break-p(null, <first label>)`). `ds-breakpoint($label)` returns the width of a breakpoint in px (a Sass value: media queries cannot read custom properties). JavaScript reads them from the custom properties, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript).
- Misc: `@include ds-arrow($size, $direction, $color)`, `@include spin` (it uses the keyframes of `@include ds-keyframes()`, included once at the root of a theme; a loading indicator, it keeps turning with less motion, more slowly), `@include ds-reduced-motion() { … }` (the rules for `prefers-reduced-motion: reduce`).

```scss
@use '../tokens' as *;

.ds-card {
  padding: ds-spacing(4);
  border-radius: ds-radius(md);
  @include ds-font-styles(text, paragraph);
  @include ds-colorset-styles(solid, primary);

  &:hover {
    @include ds-colorset-styles(solid, primary-hover);
  }

  &.--outlined {
    @include ds-colorset-styles(outlined, primary);
  }

  &::after {
    @include ds-icon(right-open, inline-block);
  }

  @include break-p(md) {
    padding: ds-spacing(6);
  }
}
```

### Design tokens as custom properties

Each theme writes its tokens once, as CSS custom properties on `:root`, with `@include tokens.ds-tokens();` at the end of its `index.scss`. The skins read them with `var()`, through the accessors, so a token can be changed at runtime, without compiling the theme again.

#### Naming

`--ds-<group>-<key>[-<key>…]`: the group of the token, then its keys in the map, from the outer to the inner one. The names are generated from the maps (a token added to a map gets its custom property), the keys lower-cased, and any character other than `a-z`, `0-9`, `-` and `_` replaced by `-` (`'Garamond'` → `garamond`); two tokens that would get the same name are a Sass error.

| Group         | Map              | Custom properties                                                           | Example (`default` theme)                                              |
| ------------- | ---------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `color`       | `$colors`        | `--ds-color-<family>-<shade>`                                               | `--ds-color-primary-base: #2563eb`                                     |
| `colorset`    | `$colorset`      | `--ds-colorset-<type>-<variant>-<prop>`                                     | `--ds-colorset-solid-primary-background: var(--ds-color-primary-base)` |
|               |                  | `--ds-colorset-default-<prop>` (top-level default)                          | `--ds-colorset-default-text: var(--ds-color-primary-base)`             |
| `font-size`   | `$font-sizes`    | `--ds-font-size-<step>`                                                     | `--ds-font-size-800: 2.25rem`                                          |
| `font-family` | `$font-families` | `--ds-font-family-<name>`                                                   | `--ds-font-family-mono: ui-monospace, SFMono-Regular, …`               |
| `font-style`  | `$font-styles`   | `--ds-font-style-<type>-<variant>-<prop>`, `--ds-font-style-default-<prop>` | `--ds-font-style-title-default-weight: 700`                            |
| `space`       | `$spacings`      | `--ds-space-<step>`                                                         | `--ds-space-4: 1rem`                                                   |
| `radius`      | `$radii`         | `--ds-radius-<name>`                                                        | `--ds-radius-pill: 999px`                                              |
| `focus`       | `$focus`         | `--ds-focus-<prop>`                                                         | `--ds-focus-color: var(--ds-color-primary-base)`                       |
| `bp`          | `$breakpoints`   | `--ds-bp-<label>`, in px, and `--ds-bp-labels`, the list of the labels      | `--ds-bp-md: 992px`, `--ds-bp-labels: xxs xs sm md lg xl xxl`          |
| `gradient`    | `$gradients`     | `--ds-gradient-<name>-<attr>`                                               | (none: no gradient in `default`)                                       |

`default` writes 180 custom properties on `:root`, the tokens (the component custom properties are on the component elements, see [Styling a component](#styling-a-component)). A token whose value is `null` is not written, nor a reference to a token that does not exist or has no value. `$icons` is not written: its glyph codes belong to the `ds-icons` font, not to a theme.

The `--ds-bp-*` properties are for JavaScript (`tokens.getBreakpoints()`, `tokens.getToken('bp-md')`, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript)): media queries cannot use custom properties, so `break-p()` and `ds-breakpoint()` use the Sass values, and changing the properties at runtime does not change the media queries of the theme.

#### References (derived tokens)

A token can be a reference to another one: `ds-ref(<group>, <keys>…)` in a map, such as `text: ds-ref(color, primary, base)` in `$colorset`. Its custom property is then `var()` of the other one, `--ds-colorset-default-text: var(--ds-color-primary-base)`, so it follows it, at build time (a configured `$colors`) and at runtime. The default `$colorset` and `$font-styles` refer to `$colors`, `$font-sizes` and `$font-families`. A configured map can also give a token a value of its own instead of a reference: it then does not follow the palette (its own custom property still changes it at runtime).

`ds-ref()` is in `scss/engine/tools/references`, which reads no token: a theme loads it in its `_tokens.scss` before it configures the engine (`@use '../../engine/tools/references' as *;`), and so does a stylesheet that configures the engine with references (`@use '<path to>/scss/engine/tools/references' as *; @use '<path to>/scss/engine' with (…);`). Written where it is not loaded, Sass takes `ds-ref(…)` for a plain CSS function: `ds-tokens()` then fails with an error that says so.

#### Accessors and Sass values

| Returns `var(--ds-…)`                                                                                                             | Returns the Sass value                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ds-token($group, $keys...)`                                                                                                      | `ds-token-value($group, $keys...)`                                                                                                |
| `ds-color($type, $variant)`                                                                                                       | `ds-color-value()`                                                                                                                |
| `ds-colorset-style($prop, $type, $variant)`, `ds-colorset-text()`, `-border()`, `-background()`, `@include ds-colorset-styles()`  | `ds-colorset-style-value()`, `ds-colorset-text-value()`, `ds-colorset-border-value()`, `ds-colorset-background-value()`           |
| `ds-font-style($prop, $type, $variant)`, `ds-font-family()`, `-size()`, `-weight()`, `-decoration()`, `@include ds-font-styles()` | `ds-font-style-value()`, `ds-font-family-value()`, `ds-font-size-value()`, `ds-font-weight-value()`, `ds-font-decoration-value()` |
| `ds-spacing($step)`, `ds-radius($name)`                                                                                           | `ds-spacing-value()`, `ds-radius-value()`                                                                                         |
| `ds-focus($prop)`, `@include ds-focus-ring()`                                                                                     | `ds-focus-value()`                                                                                                                |
| `gradient($name, $attr)`, `@include gradient()`                                                                                   | `gradient-value()`                                                                                                                |

Use the `-value` functions wherever Sass needs the value itself: color functions (`color.change(ds-color-value(gray, white), $alpha: 0.6)`), arithmetic and comparisons (`ds-spacing-value(4) * 2`), media queries. `var()` cannot be computed by Sass (`color.change(ds-color(…))` is an error), and the result of a computation is a value: it does not follow the token at runtime.

The colorset and font style accessors resolve the inheritance at build time: `ds-font-family(title, page-sub)` is `var(--ds-font-style-title-default-family)`, the variant that declares it. An unknown token, type or variant, a group of tokens (`ds-token(color, primary)`) or a token without value is a Sass error, with the known keys. `ds-color($type, $variant, $optional: true)` returns `null` for a color that does not exist, so the declaration is left out: for a skin shared by themes whose palettes differ.

#### Changing a token at runtime

Set the custom property after the theme, globally:

```css
:root {
  --ds-color-primary-base: #0d9488;
}
```

```js
document.documentElement.style.setProperty('--ds-color-primary-base', '#0d9488');
tokens.getToken('color-primary-base'); // '#0d9488': the value in effect, read with getComputedStyle()
```

Everything that reads the token follows, the tokens that refer to it included: the `stl-1` buttons (`--ds-colorset-solid-primary-*`), the component custom properties set from it, the links, the `default` focus outline (`--ds-focus-color` refers to it)… The skins read their colors and fonts from the tokens, so overriding any color or font family token works the same way (`--ds-color-shadow-base`, `--ds-font-family-heading`…). What a skin computes in Sass (`color.change(…)`, the two white veils of `default`) does not follow, nor the other tokens that only have the same value (`--ds-color-status-info` and `--ds-color-input-caret` are `#2563eb` in `default`, like the primary color).

Or in a scope: `.promo { --ds-color-primary-base: #0d9488; }`. The rules that read `--ds-color-primary-base` inside `.promo` follow, but not the tokens that refer to it: their `var()` was resolved on `:root`, and `.promo` inherits the result. Declare them again in the scope, from Sass with `ds-tokens()` and the groups to declare:

```scss
@use '../tokens' as *;

.promo {
  --ds-color-primary-base: #0d9488;
  @include ds-tokens(colorset); // --ds-colorset-…: var(--ds-color-…), resolved in .promo
}
```

### Page stylesheets

A page stylesheet belongs to a theme: create `scss/themes/<theme>/pages/<page>.scss` and start it with `@use '../tokens' as *;` to get the tokens, functions and mixins of the theme. As the engine outputs no CSS, the compiled file only holds the rules of the page. `npm run build:css` compiles it to `dist/css/pages/<theme>/<page>.css`, and the watcher of `npm start` on each change; load it after the theme stylesheet. Partials (`_*.scss`) are not compiled.

### Modifier classes

Components with a `mods` property turn each modifier into a `--<modifier>` class next to their main class. `mods` accepts a comma-separated string or an array:

```html
<ds-block mods="content,top-header">…</ds-block>
<!-- renders class="ds-block --content --top-header" -->
```

The stylesheet then targets `.ds-block.--content.--top-header`. The same conversion is available in JavaScript as `ds.props.toClassList('ds-card', 'large,dark')`.

A string `mods` is reflected to the `mods` attribute. An array set in JavaScript is not (Stencil only reflects primitive values): the attribute then keeps its previous value, so read the `mods` property rather than the attribute.

### Breakpoints shared with JavaScript

The SCSS map `$breakpoints` stays the single source of truth. `ds-tokens()` writes each breakpoint as a custom property on `:root`, and the list of their labels:

```css
:root {
  --ds-bp-xxs: 360px;
  /* … */
  --ds-bp-xxl: 1600px;
  --ds-bp-labels: xxs xs sm md lg xl xxl;
}
```

`--ds-bp-labels` is a list of CSS identifiers separated by spaces, from the smallest to the largest width (equal widths in the order of the map). Each label is the end of the name of its property (`--ds-bp-<label>`: the key lower-cased, see [Naming](#naming)). Browsers return a custom property as it is written, but they may trim the whitespace around it or change the whitespace between its tokens, and quoted strings come back with their quotes: so the labels are identifiers, never strings, and a reader splits the value on whitespace. A label that is not an identifier starting with a letter or `_` (`2xl`), a breakpoint named `labels`, or a width that is not in px is a Sass error. Without any breakpoint (an empty map), `--ds-bp-labels` is not written.

- `tokens.getToken(name, element?)` returns the computed value of a token, trimmed: `getToken('bp-md')` or `getToken('--ds-bp-md')` gives `'992px'`; `''` when it is not declared (theme stylesheet not loaded). `element` (`document.documentElement` by default) reads the value in a scope.
- `tokens.getBreakpoints(element?)` returns the breakpoints, label: width in px, sorted by width: `{ xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 }` with the `default` theme. It reads `--ds-bp-labels`, then each `--ds-bp-<label>` (`992px` or a unitless `992`). A label without a width in px is left out, with one warning that names them; without `--ds-bp-labels` (the theme stylesheet is not loaded yet), it returns `{}` with one warning.
- `responsive.processBreakpoints()` turns them into ranges with the mobile-first semantics of `break-p`: each label starts at its value and ends at the next value - 1, the first label also covers the smaller widths (it starts at 0) and the last one has no maximum. With the theme map: `xxs` 0–575, `xs` 576–767, `sm` 768–991, `md` 992–1199, `lg` 1200–1399, `xl` 1400–1599, `xxl` 1600 and up. `responsive.getBreakpoint()` returns the label and limits (`[min, max]`, or `[min]` for the last label) for a width.
- `responsive.isMobile()`, `isTablet()` and `isDesktop()` compare the window width with the `sm` and `md` breakpoints of the theme (`--ds-bp-sm`, `--ds-bp-md`): mobile below `sm`, tablet from `sm` to below `md`, desktop from `md`. Without the theme, 768 and 992 px.
- `<ds-rsp>` reads the breakpoints with `tokens.getBreakpoints()` (or takes them from its `breakpoints` attribute, label: minimum width in px: `breakpoints='{"sm": 0, "lg": 992}'`), listens to `resize` (debounced by `debounce-delay`, 500 ms by default), and when it starts and each time the breakpoint changes:
  - dispatches a `breakpointChange` event (`detail: { all, current, previous, isGrowing }`, type `BreakpointChangeDetail`) on every element with a `data-use-rsp` attribute. This event does not bubble;
  - sets on these elements the properties declared in their `data-rsp` attribute (a JSON string) for the current breakpoint (or the closest smaller breakpoint that has some). Unknown labels are ignored with a warning; the initial values of the changing properties are kept for the smallest breakpoint. They are read from the element's property (a camelCase property such as `hGap` included), else from its attribute (`h-gap`). Initialised elements get a `data-rsp-init` attribute;
  - then emits the same `breakpointChange` event from `<ds-rsp>` itself. This one bubbles: listen to it on `<ds-rsp>` or on `document`. A subscriber that contains `<ds-rsp>` receives both events and should only handle the one whose `target` is itself, as `ds-grid` does.
  - Elements subscribed after it started, with its `subscribe(element)` method, or inserted in the document (or given a `data-use-rsp` attribute) and matching `subscriber-selector`, get the params of the current breakpoint at once. Insertions are detected with a `MutationObserver`.
  - Without breakpoints (theme stylesheet not loaded, no `breakpoints` attribute), it logs one warning and tracks nothing: no `resize` listener, no event, the subscribers wait.
  - Its `refresh()` method reads the breakpoints again (from the `breakpoints` attribute, else from the theme) and applies them: it subscribes the matching elements that are not subscribed yet, sets the params of the current breakpoint on every subscriber again, and emits `breakpointChange` only when the label or the limits of the current breakpoint changed (`previous` is then the former breakpoint, `undefined` when it starts). Without breakpoints until then (theme stylesheet loaded after `<ds-rsp>`), it starts, as when the theme is there at load. When it finds none (theme stylesheet removed, or being replaced), it keeps the current ones and logs a warning, once until it finds some again. A new `breakpoints` attribute value is applied the same way.
  - `<ds-rsp>` calls `refresh()` by itself when a stylesheet `<link>` of the document loads (it listens to `load` on the document, in the capture phase): a theme stylesheet added after it, or a theme switched by changing the `href` of its `<link>`. Call `refresh()` when the theme changes otherwise: a `<style>` element, a constructed stylesheet (`adoptedStyleSheets`), a `media` attribute changed after the load (`media="print" onload="this.media='all'"`), custom properties set from JavaScript.

```html
<ds-rsp></ds-rsp>
<ds-grid cols="5">
  <ds-grid-item width="1" data-use-rsp data-rsp='{"sm": {"width": 3}, "lg": {"width": 5}}'>…</ds-grid-item>
</ds-grid>
```

```js
const rsp = document.querySelector('ds-rsp');
document.head.append(Object.assign(document.createElement('style'), { textContent: themeCss }));
await rsp.refresh();
```

**Changed:** The themes used to write the breakpoints, and the primary base color, as JSON in the `content` of `body::before` (the `ds-theme()` mixin, `ds-breakpoints-to-json()`), which `responsive.getStylesJSON()` (`ds.tools.getStylesJSON()`) parsed with `removeQuotes()`. That bridge is gone: use `tokens.getBreakpoints()` and `tokens.getToken('color-primary-base')`; the `SassStyles` type is gone too.

## Using the components

### Script tags

After `npm run build:all`, serve the files and load the theme and the browser build:

```html
<link rel="stylesheet" href="/dist/css/default.css" />
<script type="module" src="/dist/dot-stash/dot-stash.esm.js"></script>

<ds-block mods="content">
  <ds-title>Hello</ds-title>
</ds-block>
```

Each component's code is loaded on first use, from the same folder.

### From the package

The package is not published to a registry. Install it from a local path or from a tarball made with `npm pack`, then:

```js
import { defineCustomElements } from 'dot-stash/loader';

defineCustomElements();
```

Add a theme stylesheet, `dot-stash/dist/css/<theme>.css`, to the page with your usual CSS pipeline, or compile your own theme (see [Creating a theme](#creating-a-theme)).

The `exports` of `package.json` give these entry points, as ES modules (`import`) or CommonJS (`require`), with their types: `dot-stash` (the utilities, `ds`), `dot-stash/loader` and the files of `dist/` (`dot-stash/dist/css/<theme>.css`, `dot-stash/dist/collection/…`).

### Components

Each component documents its properties, events, methods, slots and custom properties in the `readme.md` generated next to its source (`components/core/<component>/readme.md`), below a Styling section (see [Styling a component](#styling-a-component)). Among them:

- **`ds-combo`** ([readme](components/core/combo/readme.md)): a custom select with single or `multiple` selection. Its options are data (an array, or its JSON string in HTML): text options, links (`url`), images (`mode="image"`), disabled options and placeholders (empty `value`). Pre-select options with `selected` (`{ index }`, `{ value }` or `{ name }`) or with the options' `selected` flags; each user selection emits `optionSelected` (`{ name, option, selectedOptions }`). `open()`, `close()` and `toggle()` drive the list; `mode="dropdown"` renders no toggle button, for a list opened by another element. A click outside closes the list. It is a select-only combobox (WAI-ARIA): the toggle button is a `combobox` that keeps the focus, the list a `listbox`; the arrow keys, Home, End, Page Up, Page Down and type-ahead move the active option, Enter and Space select it, Escape closes the list; name it with `label` or `labelledby`. `ds-combo` replaces `ds-dropdown` and `ds-dropdown-item`, which were removed: their slotted items had no selection behavior.
- **`ds-modal`** ([readme](components/core/modal/readme.md)): a modal dialog in a lightbox (`shown`): a backdrop over the page and a centered dialog box, `role="dialog"` with `aria-modal="true"`, named by its `slot="title"` heading or by `label`. Shown, it takes the focus and keeps it (Tab and Shift+Tab stay in the dialog); Escape or a mouse down on the backdrop hides it, and the focus goes back to the element that opened it.
- **`ds-sidebar`** ([readme](components/core/sidebar/readme.md)): a fixed panel on the `h-pos` side of the screen (`left` by default, or `right`) and at its `v-pos` edge, a `complementary` landmark named by `label`, not modal. Hidden, it is out of the screen on that side and inert; `show()`, `hide()` and `toggle()` slide it, and `sidebarShown` / `sidebarHidden` are emitted at the end of the slide. `show()` moves the focus into it, Escape hides it, `hide()` gives the focus back.
- **`ds-toaster`** ([readme](components/core/toaster/readme.md)): toasts in a fixed box (`position`, `messages`, `show()`, `displayToast()`), announced to screen readers by a live region (`status`, or `alert` with `mods="error"`). The themes give the toasts the secondary color, or a status color with the `success`, `warning` or `error` modifier (`mods="success"`).
- **`ds-tooltip`** ([readme](components/core/tooltip/readme.md)): a message (`slot="message"`, `role="tooltip"`) that describes its content (`aria-describedby`), shown on hover and on the keyboard focus, hidden on Escape, and that stays while the pointer is over it.
- **`ds-trigger`** ([readme](components/core/trigger/readme.md)): calls a method of a target element on an event (`target`, `action`, `on`). With `type="button"` it renders the `.ds-button` class, which the theme skins with modifiers (sizes `xs` to `xl`, colors `stl-1` to `stl-3`, `rounded`, `shadow`). When it is the control (on `click`, with no link or button in it), the element is a button: `role="button"`, focusable, clicked by Enter and Space; with a native `<button>` or link in it, that control keeps its semantics and calls the action. It does not submit forms: use a native `<button>` for that, and `ds-trigger` to bind an action to another element.

```html
<ds-combo name="color" options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue"}]' selected='{"value": "blue"}'></ds-combo>
<ds-combo id="menu" mode="dropdown" options='[{"name": "Docs", "value": "docs", "url": "/docs"}]'></ds-combo>
<ds-trigger type="button" mods="sm,stl-2" target="#menu" action="toggle">Menu</ds-trigger>
```

The components render in the light DOM, and most of them move their children into their `<slot>` elements (Stencil's slot emulation). To change the content of such a component from a script, change its children (the `data` of a text node, the content of a child element) or add nodes with `appendChild()`: Stencil hides, at the next render of the component, the children that `innerHTML` or `textContent` set on the component element itself, as they are not in a slot.

`ds-button`, `ds-video`, `ds-marquee` and `ds-rating-list` were removed from the library: their code is archived on the `archive/propal` branch (see [Archived code](#archived-code)).

The package entry also exports the shared utilities, with their types:

```ts
import { ds, props, responsive, tokens, debounce, throttle, uuid, AppStatus, DsComponentContext } from 'dot-stash';
import type { Breakpoint, BreakpointChangeDetail, Breakpoints, RawBreakpoint, DsComponentContextType } from 'dot-stash';

const breakpoints = tokens.getBreakpoints();
const primary = tokens.getToken('color-primary-base');
const classList = props.toClassList('ds-card', 'large,dark');
const onResize = debounce(() => console.log(window.innerWidth), 200);
```

The helpers are split into modules, each exported as a namespace:

| Module       | Functions                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `props`      | `isTrue`, `toNumber`, `toFloat`, `toArray`, `fromJSON`, `toClassList`, `toString`                                             |
| `css`        | `set`, `get`, `toNumber` (inline styles)                                                                                      |
| `dom`        | `cleanHTML`, `loadScript`, `scrollTo`, `getFileExtension`, `getOffset`                                                        |
| `ajax`       | `buildQuery`, `get`, `post` (JSON responses; `get(url, query, { responseType: 'text' })` returns the body as text, e.g. HTML) |
| `tokens`     | `getToken`, `getBreakpoints` (the theme custom properties)                                                                    |
| `responsive` | `processBreakpoints`, `getBreakpoint`, `getParamsForBreakpoint`, `isMobile`, `isTablet`, `isDesktop`                          |
| `env`        | `touchSupport`                                                                                                                |
| `form`       | `submit`, `reset`                                                                                                             |
| `context`    | `get`, `DsComponentContext`                                                                                                   |

`ds` groups the same modules in one object (`ds.props.toClassList(...)`, `ds.tokens.getBreakpoints()`), and `ds.tools` keeps the DOM helpers under their former key (`ds.tools.scrollTo`…). Inside the library, components import the functions from their module (`import { toClassList } from '../../utils/props'`), so each bundle only contains the helpers it uses.

## Styling a component

Every component follows the same contract, in three parts.

- **The structure is in the component.** Its stylesheet (its `styleUrl`, `components/core/<component>/<component>.scss`, which Stencil injects into the document) holds what the component needs to work: the layout mechanics, positioning and overflow, the transitions and animations its behavior relies on (a slide that ends on `transitionend`), the stack levels, the hidden and shown states. It writes no look: no color, font, font size, border, shadow, radius or decorative spacing. Stencil compiles it without the engine: it reads no token.
- **The look is in the theme.** The skin of the component in the theme (`scss/themes/<theme>/components/_<component>.scss`, `_trigger.scss` for the `.ds-button` and `.ds-link` classes of `ds-trigger`) draws it: colors, typography, borders, radii, shadows, spacing. The theme also writes the structure that depends on the breakpoints, as media queries cannot read custom properties and the component stylesheets have no breakpoints: the opening of the sub-navigations of `ds-nav-item`, the row of a main `ds-nav`.
- **Component custom properties, fed by the tokens, are the styling API.** Each component exposes a few custom properties named `--ds-<component>-<property>`: what a project restyling it would change (colors, a few sizes and spaces, a duration or stack level). The theme sets them on the component element from the tokens, and its skin reads them:

  ```scss
  // scss/themes/default/components/_tooltip.scss
  ds-tooltip {
    --ds-tooltip-background: #{ds-color(secondary, darker)}; // var(--ds-color-secondary-darker)
    --ds-tooltip-width: 220px;
  }

  .ds-tooltip [slot='message'] {
    width: var(--ds-tooltip-width);
    background-color: var(--ds-tooltip-background);
  }
  ```

  A modifier sets them again (`.ds-toaster.--success { --ds-toaster-background: … }`, the sizes and colors of `.ds-button`). A structural value that stays tunable (a duration, a stack level, an offset, the width of `ds-sidebar`) is read by the component stylesheet itself, with a fallback for a page without a theme, `var(--ds-sidebar-width, auto)`, and the theme sets it like the others.

The component stylesheet documents the custom properties with `@prop` annotations, which Stencil lists in the **CSS Custom Properties** section it generates in the readme of the component:

```scss
/**
 * @prop --ds-tooltip-background: Background of the message bubble, and color of its arrow.
 * @prop --ds-tooltip-width: Width of the message bubble.
 */
```

Above the generated part, the **Styling** section of each readme, written by hand, lists what a stylesheet can target: the main class (`ds-<component>`, on the component element or on the element it renders inside it), its elements (`ds-<component>__<element>`), its modifiers (`mods` → `--<mod>`, and the classes the component sets from its state and props: `--open`, `--shown`, `--h-pos-left`…), the attributes and slots the styles read, what the component stylesheet does and what the theme draws, with an example.

| Component                                                        | Custom properties (`--ds-<component>-…`)                                                                                                     |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [`ds-ajax`](components/core/ajax/readme.md)                      | `overlay-background`, `spinner-color`, `spinner-size`                                                                                        |
| [`ds-block`](components/core/block/readme.md)                    | `header-gap`, `footer-gap`, `max-width`                                                                                                      |
| [`ds-combo`](components/core/combo/readme.md)                    | `background`, `color`, `border-color`, `active-color`, `hover-background`, `selected-background`, `selected-color`, `list-offset`            |
| [`ds-grid`](components/core/grid/readme.md)                      | none: its props set the columns and gaps                                                                                                     |
| [`ds-grid-item`](components/core/grid/grid-item/readme.md)       | none: `ds-grid` sizes it                                                                                                                     |
| [`ds-heading`](components/core/heading/readme.md)                | `gap`, `image-gap`, `description-color`, `description-max-width`                                                                             |
| [`ds-icon`](components/core/icon/readme.md)                      | `size`, `color`                                                                                                                              |
| [`ds-modal`](components/core/modal/readme.md)                    | `z-index`, `max-width`, `margin`, `backdrop`, `background`, `color`, `padding`, `radius`, `shadow`                                           |
| [`ds-nav`](components/core/nav/readme.md)                        | `gap`                                                                                                                                        |
| [`ds-nav-item`](components/core/nav/nav-item/readme.md)          | `color`, `active-color`, `padding`, `border-color`, `sub-nav-background`, `sub-nav-shadow`                                                   |
| [`ds-panel`](components/core/panel/readme.md)                    | `border-color`, `tab-color`, `active-color`, `title-font-size`, `transition-duration`                                                        |
| [`ds-panel-group`](components/core/panel-group/readme.md)        | none: its panels carry the look                                                                                                              |
| [`ds-rsp`](components/core/responsive/readme.md)                 | none: it renders nothing                                                                                                                     |
| [`ds-select`](components/core/select/readme.md)                  | `background`, `border-color`, `radius`, `padding`                                                                                            |
| [`ds-sidebar`](components/core/sidebar/readme.md)                | `width`, `max-width`, `z-index`, `transition-duration`, `padding`, `background`, `shadow`                                                    |
| [`ds-slider`](components/core/slider/readme.md)                  | `transition-duration`, `button-offset`, `button-size`, `button-background`, `button-border-color`                                            |
| [`ds-slider-item`](components/core/slider/slider-item/readme.md) | none: no look of its own                                                                                                                     |
| [`ds-slider-menu`](components/core/slider/slider-menu/readme.md) | `offset`, `dot-size`, `dot-gap`, `dot-color`, `dot-active-color`                                                                             |
| [`ds-text`](components/core/text/readme.md)                      | `font-family`, `font-size`, `line-height`, `spacing`, `list-indent`                                                                          |
| [`ds-title`](components/core/title/readme.md)                    | `color`, `sub-color`, `font-family`, `line-height`                                                                                           |
| [`ds-title-bar`](components/core/title-bar/readme.md)            | `gap`                                                                                                                                        |
| [`ds-toaster`](components/core/toaster/readme.md)                | `background`, `color`, `font-size`, `padding`, `gap`, `shadow`, `min-width`, `z-index`                                                       |
| [`ds-toggle`](components/core/toggle/readme.md)                  | `color`, `checked-color`, `disabled-color`, `track-color`, `track-disabled-color`, `knob-color`, `knob-checked-color`, `knob-disabled-color` |
| [`ds-toggle-group`](components/core/toggle-group/readme.md)      | none: its toggles carry the look                                                                                                             |
| [`ds-tooltip`](components/core/tooltip/readme.md)                | `background`, `color`, `font-size`, `padding`, `radius`, `shadow`, `width`, `offset`                                                         |
| [`ds-trigger`](components/core/trigger/readme.md)                | `color`, `background`, `border-color`, `radius`, `padding`, `font-size`, `link-color`, `link-hover-color`                                    |

`npm test` checks the contract: no color and no font in the component stylesheets (the resets that make an element inherit the font of its parent aside), every documented custom property named after its component, set by the default theme and read, no undocumented one, and every readme up to date (see [Tests](#tests)).

### Overriding the custom properties

The theme sets the custom properties on the component elements (`ds-tooltip { … }`): set them on the same elements, in a stylesheet loaded after the theme or with a more specific selector. Set on an ancestor (`:root`, a wrapper), they do not reach the component, which declares its own.

```css
/* After dist/css/default.css: every tooltip */
ds-tooltip {
  --ds-tooltip-background: #1e293b;
  --ds-tooltip-width: 16rem;
}

/* In an area of the page */
.dark ds-title {
  --ds-title-color: var(--ds-color-gray-white);
}

/* A modifier: on its own selector */
.ds-toaster.--success {
  --ds-toaster-background: var(--ds-color-primary-dark);
}
```

```html
<ds-sidebar id="cart" h-pos="right" style="--ds-sidebar-width: 32rem; --ds-sidebar-max-width: 100%">…</ds-sidebar>
```

```js
document.querySelector('#cart').style.setProperty('--ds-sidebar-width', '24rem');
```

The tokens still apply: the theme writes the component custom properties as `var()` of the tokens, resolved on each component element, so a token changed at runtime changes the components that read it, on `:root` or in a scope (`.promo { --ds-color-secondary-darker: #4c1d95; }` changes the tooltips inside `.promo`; see [Changing a token at runtime](#changing-a-token-at-runtime)).

### Skins of a new theme

A theme gives each component its skin, a partial of its `components/` folder loaded by its `index.scss`: it sets the custom properties of the component on the component element, from the tokens of the theme, and writes the rules that read them. Start from the skins of `default` (see [Creating a theme](#creating-a-theme)): keep the names of the custom properties, which the readmes document and the projects override, and set all of them; keep the rules of the skins that are structure (the media queries of the navigation). The component stylesheets do not change from one theme to another. A theme that keeps the `default` skins and only configures the tokens gets them all, set from its tokens.

## Accessibility

The components follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) patterns. The spec tests check their roles, attributes, keyboard handling (simulated key events) and focus moves, and the stylesheet tests the focus indicator and less motion (see [Tests](#tests)); the behavior is also checked in a browser with the keyboard (Tab, Shift+Tab, Escape, Enter, Space). The library uses no accessibility audit library or service. The readme of each component describes its roles, keyboard support and required labelling in an Accessibility section: the overlays, [`ds-modal`](components/core/modal/readme.md#accessibility), [`ds-sidebar`](components/core/sidebar/readme.md#accessibility), [`ds-tooltip`](components/core/tooltip/readme.md#accessibility), [`ds-toaster`](components/core/toaster/readme.md#accessibility), and the form controls, [`ds-toggle`](components/core/toggle/readme.md#accessibility), [`ds-toggle-group`](components/core/toggle-group/readme.md#accessibility), [`ds-combo`](components/core/combo/readme.md#accessibility), [`ds-select`](components/core/select/readme.md#accessibility), [`ds-trigger`](components/core/trigger/readme.md#accessibility). The navigation components (`ds-panel`, `ds-panel-group`, `ds-slider`, `ds-nav`, `ds-nav-item`) are not covered yet. The form controls are not form-associated: they take no part in the submission of a native `<form>` (but the native `select` of `ds-select`), and a `<label>` element does not label them (but `ds-select`): name them with their `label` prop or with `aria-labelledby` (`labelledby` for `ds-combo`).

### Focus indicator

The base styles of the theme draw an outline around the element that has the keyboard focus (`:focus-visible`: not after a click on a button), with `@include ds-focus-ring()`, from the focus tokens (`$focus`, see [Tokens](#tokens-scssenginevariables)):

| Custom property     | `default`                      | What it is                                    |
| ------------------- | ------------------------------ | --------------------------------------------- |
| `--ds-focus-color`  | `var(--ds-color-primary-base)` | Color of the outline (3:1 contrast at least). |
| `--ds-focus-width`  | `2px`                          | Width of the outline.                         |
| `--ds-focus-style`  | `solid`                        | Style of the outline.                         |
| `--ds-focus-offset` | `2px`                          | Space between the element and its outline.    |

Configure them in a theme (`@forward '../../engine' with ($focus: (color: ds-ref(color, secondary, darker), width: 3px, style: solid, offset: 2px));`) or change them at runtime (`:root { --ds-focus-color: #0d9488; }`, or in a scope, on a dark background: `.dark { --ds-focus-color: var(--ds-color-gray-white); }`). No stylesheet of the theme or of the components removes the outline (`npm test` checks it): an element that draws its own focus state does it on `:focus-visible`, with `ds-focus-ring()` or a style of the same strength. Two components draw it for an element that cannot show it: `ds-select` around its box, as its native select is transparent (`:has(> .ds-select__input:focus-visible)`), and `ds-combo` inside the active option of its open list (`--active`), which the keys move while the combobox keeps the focus. The scrolling parts of the overlays have their padding inside them (the dialog of `ds-modal`, the content of `ds-sidebar`), so that the outline of the elements at their edges is not cut.

### Less motion

With `prefers-reduced-motion: reduce` (a system setting):

- the base styles of the theme end every transition and animation at once: their durations become `0.01ms` (not `0`, so that the `transitionend` and `animationend` events still come), without delay, one iteration; smooth scrolling is off. The loading indicators (the `spin()` mixin: `ds-ajax`, `ds-icon type="loading"`) are essential: they keep turning, at half speed;
- `ds-sidebar` and `ds-toaster` drop their transitions and the slide-in of the toasts, in their component stylesheets (also without the theme): they show and hide at once, and emit `sidebarShown` / `sidebarHidden` and `toasterShown` / `toasterHidden` at once. `ds-modal` has no transition.

The components that wait for the end of a transition (`ds-sidebar`, `ds-toaster`) do not hang when no transition runs (durations of `0`, `transition: none`, an element that is not rendered): they end the wait at once, or once the duration is over (`utils/transition.ts`). Use the `ds-reduced-motion()` mixin for the rules of a skin: `@include ds-reduced-motion() { transition: none; }`.

### Names, roles and keyboard

| Component         | Role and attributes                                                                                                                                                                      | Name (required)                                                                  | Keyboard                                                                                                                                                      | Focus                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ds-modal`        | `role="dialog"`, `aria-modal="true"`, `aria-describedby` (`slot="description"`)                                                                                                          | a `slot="title"` heading (`aria-labelledby`), else `label`                       | Escape hides the modal on top; Tab and Shift+Tab stay in the dialog                                                                                           | moves into the dialog when shown (`autofocus`, else the first focusable element), back to the opener when hidden |
| `ds-sidebar`      | `role="complementary"` (or the element's `role`), `inert` while hidden                                                                                                                   | `label` (`aria-label`)                                                           | Escape hides it while the focus is in it                                                                                                                      | `show()` moves it into the sidebar, `hide()` back to the opener                                                  |
| `ds-tooltip`      | `role="tooltip"` on the message, `aria-describedby` on the first focusable element of the content (or on the box, then focusable)                                                        | the content's own (a button text, an `aria-label`): the message is a description | the focus shows the message; Escape hides it                                                                                                                  | none: the content keeps the focus                                                                                |
| `ds-toaster`      | a live region: `role="status"` (`aria-live="polite"`), `role="alert"` (`aria-live="assertive"`) with `mods="error"`                                                                      | none needed                                                                      | none                                                                                                                                                          | never takes the focus                                                                                            |
| `ds-toggle`       | the element: `switch`, `checkbox`, `radio` (`aria-checked`) or, for `icon`, `button` (`aria-pressed`); `aria-disabled`                                                                   | `aria-labelledby`, `label`, or a text in it (visually hidden)                    | Space toggles (checks a radio); Enter toggles a switch or a toggle button                                                                                     | `tabindex="0"`, none while disabled                                                                              |
| `ds-toggle-group` | `radiogroup` (radios, single selection) or `group`; `aria-disabled`                                                                                                                      | `aria-labelledby` or `label`                                                     | radio group: the arrow keys, Home and End move the focus and the selection, round the group, over the enabled radios                                          | radio group: Tab reaches one radio, the checked one or the first (roving tabindex)                               |
| `ds-combo`        | `combobox` (the toggle button: `aria-expanded`, `aria-controls`, `aria-activedescendant`) and `listbox` (`aria-multiselectable`) of `option` elements (`aria-selected`, `aria-disabled`) | `labelledby`, `label`, else `custom-label` or `name`                             | arrows, Home, End, Page Up/Down and type-ahead move the active option; Enter and Space select it (single: close); Escape closes; Tab closes (single: selects) | stays on the combobox; `dropdown` mode: `open()` moves it to the listbox, closing gives it back                  |
| `ds-select`       | the native `select`; its box label `aria-hidden`                                                                                                                                         | `label`, `labelledby`, a `<label>` around it, or `<label for="<name>">`          | the browser's                                                                                                                                                 | the native select; the theme draws the ring around the box                                                       |
| `ds-trigger`      | when it is the control: `button` (or the element's `role`), `aria-disabled`; with a native button or link in it: none                                                                    | its text, `label`, `aria-label`                                                  | Enter and Space click it                                                                                                                                      | `tabindex="0"`, none while disabled                                                                              |

Escape closes one layer per key press: a shown tooltip first (its listener runs in the capture phase), then the open list of a `ds-combo`, then the modal on top, then a sidebar that has the focus; the key press then goes no further.

### Visually hidden text

`.ds-visually-hidden` (base styles of the theme) hides a text on the screen and keeps it for screen readers: the text of an icon button, a label, an extra word of context.

```html
<button type="button"><ds-icon type="cart"></ds-icon><span class="ds-visually-hidden">Cart</span></button>
```

**Changed**: `ds-modal` handles Escape on `keydown` (it was a throttled `keyup`), only for the modal on top, and a hidden modal is no longer rendered in place (the default theme draws the lightbox); `ds-sidebar` is inert and `visibility: hidden` while hidden, and its padding moved to its content in the default theme; `ds-toaster` renders a live region and an `aria-hidden` toast box; `ds-tooltip` shows its message on the keyboard focus and hides it 300 ms after the pointer leaves; `ds-toggle` no longer removes the focus outline. New props: `label` on `ds-modal` and `ds-sidebar`; new slots: `title` and `description` on `ds-modal`.

**Changed** (form controls): `ds-toggle` and `ds-trigger` (when it is the control) are focusable, with a role, and Enter and Space activate them; `ds-toggle-group` has a role and the arrow keys of a radio group, and its `disabled`, which did nothing, disables its toggles; `ds-combo` has the combobox and listbox roles and the keyboard, its list hangs from `div.ds-combo__menu` (it was a `menu` holding the `ul`), and its `dropdown` mode moves the focus to the list; `ds-select` disables its native select, hides the label of its box from assistive technologies and, without a `selected` option, selects the option its box shows (the native select selected the last one). The focus outline of `ds-toggle` is out of its 0.4 s transition. New props: `label` on `ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select` and `ds-trigger`, `labelledby` on `ds-combo` and `ds-select`; new method: `setTabbable()` on `ds-toggle`.

## Tests

Unit tests are Stencil spec tests: Stencil's test runner drives Jest 29 (the `jest`, `jest-cli` and `@types/jest` dev dependencies; Stencil 4 supports Jest 24 to 29) in Stencil's simulated DOM, without a browser:

- A spec file sits next to its source: `components/utils/props.spec.ts`, `components/core/toggle/toggle.spec.tsx`.
- Utility modules are tested with plain Jest (`describe`, `it`, `expect`, `jest.fn()`).
- Components are rendered with `newSpecPage` from `@stencil/core/testing`:

```tsx
import { newSpecPage } from '@stencil/core/testing';
import { DSToggle } from './toggle';

it('toggles a checkbox', async () => {
  const page = await newSpecPage({ components: [DSToggle], html: '<ds-toggle type="checkbox"></ds-toggle>' });
  page.root.click();
  await page.waitForChanges();
  expect(page.root.checked).toBe(true);
});
```

`components/sass.spec.ts` compiles every theme (`scss/themes/<theme>/index.scss`), every theme page stylesheet and every `.scss` file of `components/` with the Sass JavaScript API: a Sass warning (a deprecation included) or error fails `npm test`, so CI. It also checks that the tokens can be configured with `@use … with (…)`. For the custom properties, it checks that each theme writes one per token of its maps (names and values, references resolved), that its `--ds-bp-labels` lists its `--ds-bp-*` breakpoints by width (and that no JSON is written in a `content` any more), the errors on breakpoint labels, that every `var(--ds-…)` of a theme has its property, that the accessors return `var()` and the `-value` functions the values, the errors on unknown tokens, `null` values, configured engines and the scoped `ds-tokens()`. It also checks that no stylesheet writes a function call Sass does not know (`color(…)`, `ds-…(…)`: Sass writes them as plain CSS, which browsers drop), and that the component stylesheets read no token. For the [styling contract](#styling-a-component), it checks that each `.scss` file of `components/core/` is the stylesheet of a component; that the component stylesheets write no color (hexadecimal, color function or color name, `transparent` aside) and no `font`, `font-family` or `font-size`, but for the resets it lists (`font-size: inherit`…); that they read no other custom property than the documented ones of their component; that each component documents its custom properties once, named after it (`--ds-<component>-…`); that the default theme sets each documented property, that its skins or a component stylesheet read it, and that it declares or reads no other `--ds-…` property than the tokens and the documented ones; and that the readme of each component has a Styling section and lists its documented properties (regenerated by `npm run build`). For [accessibility](#accessibility), it checks that the default theme draws the focus indicator from the focus tokens, that no stylesheet removes the outline (`outline: none`, `0`), the rules of less motion (and the loading indicators that keep turning), and the visually hidden class.

`npm test` runs them once, `npm run test.watch` on every change. Spec files are not part of the build output (`dist/`, `www/`, `loader/`). End-to-end tests (`*.e2e.ts`, `npm run test:e2e`) run in Chromium with Puppeteer 25: `npm ci` downloads its browser unless `PUPPETEER_SKIP_DOWNLOAD` is set, or `PUPPETEER_EXECUTABLE_PATH` points to another Chromium; as root (a container), add `-- --ci` (Chromium without its sandbox).

Stencil 4.43 deprecated its integrated test runner (`stencil test`, which prints a deprecation warning): Stencil 5 drops it, for `@stencil/vitest` (spec and browser tests) or `@stencil/playwright` (end-to-end tests).

## Archived code

Code removed from the development branch is kept unchanged on two archive branches, `archive/propal` and `archive/external-integrations`. `archive/propal` holds, in `archived/`, the components `ds-button`, `ds-video`, `ds-marquee` and `ds-rating-list`, the demo (`ds-main` and the controls of the dev pages) and the `legacy` theme. See [docs/propal-archive.md](docs/propal-archive.md) for their content and how to read or restore files from them.

## License

MIT, see [LICENSE](LICENSE).
