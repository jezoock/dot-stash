# dot-stash

A standalone UI library made of two parts:

- **Web components**: generic `ds-*` custom elements built with Stencil. They render in the light DOM (no shadow DOM) and use plain class names (`ds-block`, `ds-block__body`, `--modifier`), so a regular page stylesheet can style them.
- **SCSS theming toolkit**: an engine (design tokens, functions and mixins) and themes built on it, each compiled by gulp into one global stylesheet (`dist/css/<theme>.css`) that skins the components and the page. Two themes: `default`, neutral, and `legacy`, the look of the site the library comes from.

Some components also have a small structural stylesheet (`styleUrl`) that Stencil injects into the document. Colors, typography and component skins come from the theme stylesheet.

## Requirements

- Node.js 22 or later (`.nvmrc`, `package.json` `engines`; required by `@stencil/sass`)
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
| `npm run build`        | Stencil production build: the package in `dist/` and `loader/`, the demo app in `www/`. Also regenerates `components/components.d.ts` and the component `readme.md` files.                               |
| `npm run build:css`    | Compiles every theme and its page stylesheets into `dist/css/` (gulp task `buildCSS`, see [Themes](#themes)).                                                                                            |
| `npm run build:all`    | Runs `clean`, `build:css`, then `build`.                                                                                                                                                                 |
| `npm run clean`        | Deletes `dist/`, `www/`, `.stencil/` and `loader/`.                                                                                                                                                      |
| `npm start`            | Runs `build:css`, then the Stencil development build in watch mode, with the Stencil dev server (serves `www/`, page `components/index.html`).                                                           |
| `npm run dev`          | Runs `build:css`, then a one-off Stencil development build (no server, no watch).                                                                                                                        |
| `npm run serve:theme`  | Theme live preview (gulp default task, BrowserSync). Serves the repository root (`index.html`) and recompiles the stylesheets when a file in `scss/` changes (see [Themes](#themes)).                    |
| `npm test`             | Unit tests: Stencil spec tests (`stencil test --spec`, Jest), without a browser. See [Tests](#tests).                                                                                                    |
| `npm run test.watch`   | Same as `npm test`, in watch mode.                                                                                                                                                                       |
| `npm run test:e2e`     | Stencil end-to-end tests (`stencil test --e2e`, Puppeteer and Chromium). No end-to-end test exists yet, and CI does not run them.                                                                        |
| `npm run generate`     | Stencil component generator (interactive).                                                                                                                                                               |
| `npm run lint`         | ESLint on `components/` (`eslint.config.mjs`: ESLint recommended + typescript-eslint recommended rules).                                                                                                 |
| `npm run lint:fix`     | Same as `lint`, applying automatic fixes.                                                                                                                                                                |
| `npm run format`       | Prettier on the `ts`, `tsx`, `js`, `mjs`, `scss`, `json`, `html`, `yml`, `yaml` and `md` files (`.prettierignore` excludes build output and generated files, including the component `readme.md` files). |
| `npm run format:check` | Checks the same files without writing.                                                                                                                                                                   |

`serve:theme` only recompiles on change: run `npm run build:css` once first, and `npm start` or `npm run dev` to get the components in `www/build/`. The Stencil build copies `dist/css/*.css` to `www/css/` for its demo page: it takes the theme stylesheets compiled before it, and `npm start` does not recompile them on change (use `serve:theme` to work on a theme).

One gulp task has no npm script: `npx gulp generateImages` optimizes the files in `images/` and writes them, plus a WebP copy of each, to `dist/images/`.

CI (`.github/workflows/ci.yml`, GitHub Actions) runs `npm ci`, `build:all` (then checks that the main build outputs exist), `format:check`, `lint` and `npm test` on every push and pull request. Every step is blocking: a build, formatting, lint or test error fails the run.

## Project structure

```
components/
  core/            ds-* components, one folder each (.tsx, optional structural .scss, type and enum
                   modules, generated readme.md)
  utils/           shared TypeScript: utility modules (props, css, dom, ajax, responsive, tokens, env,
                   form, context), the `ds` object grouping them (dot-stash.ts), debounce, throttle,
                   uuid, and shared types and enums (interfaces/)
  demo/            ds-main, the demo component used by the dev pages
  index.ts         package entry point
  index.html       page served by the Stencil dev server, with the theme switcher
  components.d.ts  component typings, generated by Stencil
scss/
  engine/          generic toolkit, no CSS output of its own (_index.scss forwards everything)
    variables/     token schema with neutral defaults: breakpoints, palette, typography, icons, spacing
    tools/         functions and mixins: tokens (custom properties), references, colors, typography,
                   icons, spacing, breakpoints, misc
  themes/
    default/       neutral theme: _tokens.scss (the engine defaults), _base.scss, layout/,
                   components/, pages/, index.scss (entry point)
    legacy/        legacy look: _tokens.scss (the engine configured with its values), _fonts.scss,
                   _animations.scss, _base.scss, layout/, components/, pages/, index.scss
gulpfile.mjs           theme tasks and live-preview server
dot-stash.config.mjs   theme list, source/destination paths and gulp settings
stencil.config.ts      Stencil configuration (srcDir: components)
index.html             theme preview page used by serve:theme, with the theme switcher
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
| `dist/css/<theme>.css`               | Theme stylesheets (gulp): `default.css`, `legacy.css`                                       |
| `dist/css/pages/<theme>/<page>.css`  | Page stylesheets of each theme (gulp)                                                       |
| `dist/images/`                       | Optimized images (`npx gulp generateImages`)                                                |

Stencil runs with `empty: false`, so it does not delete the gulp output in `dist/`. The published package contains `dist/` and `loader/`. The demo app in `www/` gets a copy of the theme stylesheets in `www/css/`.

## Theming

The SCSS uses the Sass module system (`@use` and `@forward`, no `@import`) and the built-in modules (`sass:map`, `sass:list`, `sass:string`, `sass:color`): compile it with Dart Sass, the `sass` or `sass-embedded` package, 1.107 or later (the version in `package-lock.json`, which compiles it without any warning). LibSass and `node-sass` do not support it. gulp (`gulp-sass`) compiles the themes with `sass`, Stencil (`@stencil/sass`) the component stylesheets with `sass-embedded`.

It has two layers:

- **The engine** (`scss/engine/`): the token schema, with neutral defaults, and the functions and mixins that read the tokens. It outputs no CSS by itself. `@use '<path to>/scss/engine' as *;` gives the tokens, functions and mixins without a namespace (`ds-color(...)`, `break-p(...)`, `$breakpoints`). Each theme writes the tokens once as CSS custom properties (`--ds-color-primary-base`…), and the skins read them with `var()`: see [Design tokens as custom properties](#design-tokens-as-custom-properties).
- **Themes** (`scss/themes/<theme>/`): a theme configures the engine tokens and writes the CSS (base styles, fonts, component skins). Each one compiles to `dist/css/<theme>.css`.
  - `default`: neutral (blue primary, slate secondary, gray scale, system font stacks). Its base styles and skins take their sizes, colors and fonts from the tokens: start a new theme from it.
  - `legacy`: the look of the site the library comes from (gold primary, Montserrat and Mulish, uppercase titles, site-specific modifiers such as `.ds-grid.--home` or `.ds-block.--content`). Its skins read the legacy tokens too: see [Skins read the tokens](#skins-read-the-tokens).

### Themes

A theme folder holds:

| File                     | Content                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_tokens.scss`           | Loads the engine configured for the theme (`@forward '../../engine' with (…)`). The other files of the theme start with `@use '../tokens' as *;` (or `'./tokens'`): they all get the configured tokens. |
| `index.scss`             | The entry point compiled by gulp: loads the tokens first, then the base styles and skins (the order of the `@use` rules is the order of the CSS output), and ends with `@include tokens.ds-tokens();`.  |
| `_base.scss`             | Base element styles.                                                                                                                                                                                    |
| `layout/`, `components/` | Skins, one partial per component.                                                                                                                                                                       |
| `pages/`                 | The page stylesheets of the theme (see [Page stylesheets](#page-stylesheets)).                                                                                                                          |

`legacy` also has `_fonts.scss` (the `ds-icons`, Montserrat and Mulish `@font-face` rules) and `_animations.scss`. The font URLs are relative to the stylesheet (`../fonts/`, so `dist/fonts/`); the font files are not part of the repository.

`themes` in `dot-stash.config.mjs` lists the themes gulp builds, `['default', 'legacy']`. The first one is the default theme of the demo pages.

- `npm run build:css` deletes `dist/css/`, then compiles each `scss/themes/<theme>/index.scss` to `dist/css/<theme>.css` and each `scss/themes/<theme>/pages/<page>.scss` to `dist/css/pages/<theme>/<page>.css`, compressed. A Sass error fails the build.
- `npm run serve:theme` recompiles on change: a file of the engine, every theme and its pages; a file of a theme, that theme and its pages; a page stylesheet, that page. A Sass error is logged and the watch goes on. BrowserSync injects the new CSS in the page.

### Theme switcher

The demo pages load the first theme: `index.html` (`npm run serve:theme`) from `/dist/css/`, `components/index.html` (`npm start`) from `/css/`, the copy of `dist/css/*.css` the Stencil build makes in `www/css/`. Both have a theme switcher: a `<select>` that replaces the file name of the theme stylesheet (`<link id="ds-theme-stylesheet">`). The choice is remembered in `localStorage` (key `ds-demo-theme`) when the browser allows it. The themes it offers are listed in the script of each page. Once the new stylesheet has loaded (its `load` event), the page calls `refresh()` on the `<ds-rsp>` elements, which read the breakpoints of the new theme (see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript)). Below it, a color input changes the primary color token at runtime (see [Changing a token at runtime](#changing-a-token-at-runtime)).

### Creating a theme

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
       // secondary, gray, status, input, shadow: all the families, with all their shades
     ),
     $font-family-base: (
       'Inter',
       system-ui,
       sans-serif,
     ),
     $grid-md: 1024
   );
   ```

   A configured map replaces the whole default map: keep its keys, the tools and skins read them. The tokens derived from others follow the configured values: `$breakpoints` is built from `$grid-*`, `$font-families` from `$font-family-*`, and `$colorset` and `$font-styles` refer to `$colors`, `$font-sizes` and `$font-families` with `ds-ref()` (see [References](#references-derived-tokens)). With `!default` after a value (`$grid-md: 1024 !default`, as `legacy` does), a stylesheet can still change it when it loads the theme: `@use 'themes/<name>/tokens' with ($grid-md: 1100); @use 'themes/<name>';`.

3. Edit the base styles and skins, or add some: each partial starts with `@use '../tokens' as *;` and is loaded by `index.scss`. Keep `@include ds-icon-font-face();` and `@include ds-keyframes();` (once, at the root), and `@include tokens.ds-tokens();` at the end of `index.scss`: the custom properties the skins read, and the breakpoints JavaScript reads (`--ds-bp-labels`, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript)).
4. Add the name to `themes` in `dot-stash.config.mjs` (and to the switcher of the demo pages), then run `npm run build:css`: `dist/css/<name>.css`. `npm test` compiles the new theme, fails on any Sass warning, and checks its custom properties, `--ds-bp-labels` included.

The engine can also be configured from outside a theme that does not configure it, before the theme loads it: `@use '<path to>/scss/engine' with ($grid-md: 1024); @use '<path to>/scss/themes/default';`.

### Skins read the tokens

The skins of both themes take their values from the tokens, so that a theme configures them in one place (`_tokens.scss`) and a page can change them at runtime (see [Changing a token at runtime](#changing-a-token-at-runtime)). In a skin:

- **Colors**: `ds-color(<family>, <shade>)` or a colorset (`ds-colorset-styles()`), never a hex value, `rgb()` or a color keyword (`transparent` aside). A color the palette lacks is added to the `$colors` of the theme, in a family and shade named after its role, not after its value: two colors with the same value are different tokens when their roles differ. Shadows and veils are colors too (`rgba()` values in `shadow` and `overlay`). Color math (`color.change()`) takes the `-value` accessors and does not follow the tokens at runtime: prefer a token.
- **Font families**: `ds-font-family(<type>, <variant>)` (font styles) or `ds-token(font-family, <name>)`, never a font name; the icon font, `'ds-icons'`, is the one exception (the `ds-icon()` mixins write it).
- **Font sizes, spacing, radii**: `ds-token(font-size, <step>)`, `ds-spacing(<step>)` (margins, paddings, gaps) and `ds-radius(<name>)` where the value is a step of the scale, in the same unit. The other values stay literal: sizes in px or off the scale (`50px` titles, `1.25rem` button text), offsets (`top: 0.5rem`), zeros.
- **`!important`**: only where the rule must win over a more specific rule of the theme or of a component, with a comment that names it. `legacy` keeps 12: the paddings of the paragraphs and titles of `.ds-block.--content` (over the `--under` heading title and the `ds-text` paddings), the font, padding and line height of the `ds-text` paragraphs (over the toggler text `font` shorthands), and the layout of `.ds-heading.--footer` (over the `--image-text` heading layout of the content blocks).

`npm test` checks the compiled `legacy` theme: no color literal and no font name outside `:root` and `@font-face` (allowed: `transparent` and `ds-icons`).

The colors and font families `legacy` adds to the engine schema (`scss/themes/legacy/_tokens.scss`):

| Token                                          | Value                      | Role                                                                                           |
| ---------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| `status` `danger` (`--ds-color-status-danger`) | `#ff0000`                  | text of the site alerts `.message.alert.--danger`                                              |
| `shadow` `medium`                              | `rgba(0, 0, 0, 0.3)`       | drop shadow of the buttons (`--shadow`), the `--left` sidebar and the tooltips                 |
| `shadow` `strong`                              | `rgba(0, 0, 0, 0.4)`       | drop shadow of the combo option list                                                           |
| `shadow` `text`                                | `rgba(0, 0, 0, 0.5)`       | text shadow of the loading icon of `ds-ajax`                                                   |
| `shadow` `text-strong`                         | `rgba(0, 0, 0, 0.8)`       | text shadow of the labels on the images of an image combo                                      |
| `overlay` `base`                               | `rgba(255, 255, 255, 0.6)` | veil over a loading `ds-ajax`                                                                  |
| `overlay` `light`                              | `rgba(255, 255, 255, 0.4)` | veil behind an open combo (`overlay`)                                                          |
| `surface` `highlight`                          | `#dbd5dc`                  | background of `.ds-grid.--conseil` and `.ds-grid.--capital`                                    |
| `border` `light`                               | `#ccc`                     | outline of the tooltip arrow                                                                   |
| font family `body` (`--ds-font-family-body`)   | `'Montserrat'`             | the page, the buttons, the combos, the togglers (no fallback, as the site declares it)         |
| font family `heading`                          | `'Montserrat', sans-serif` | the titles (`ds-title`, `h1` and `h4` of `.ds-block.--content`, `h1`, `h2`, `h4` of `ds-text`) |
| font family `text`                             | `'Mulish', sans-serif`     | the paragraphs and lists of `.ds-block.--content` and `ds-text`                                |
| font family `caption`                          | `Arial`                    | the footer link (`.ds-footer-link`)                                                            |

White and black are the `gray` `white` and `black` of the palette, in the skins and in the colorsets. The font styles of `legacy` (`$font-styles`) still refer to the `Now` and `Garamond` families, which no skin reads.

### Tokens (`scss/engine/variables/`)

Every token is declared with `!default`. The defaults are neutral; `legacy/_tokens.scss` holds the legacy values.

- `_palette.scss`
  - `$colors`: color families and their shades: `primary` and `secondary` (`darker`, `dark`, `base`, `light`), `gray` (`white`, `lightest`, `lighter`, `light`, `base`, `dark`, `darker`, `darkest`, `black`), `status` (`success`, `warning`, `error`, `info`, `busy`, `disabled`, `discount`, `new`), `input` (`caret`), `shadow` (`base`). A theme can add families and shades of its own: `legacy` adds `status` `danger`, more `shadow` shades, `overlay`, `surface` and `border` (see [Skins read the tokens](#skins-read-the-tokens)).
  - `$colorset`: named sets of `text`, `border` and `background` colors, grouped by type (`solid`, `outlined`, `link`) with variants such as `primary`, `primary-hover`, `secondary`, `white`, `gray` or `disabled`. Its colors are references to `$colors` (`ds-ref(color, primary, base)`) or colors of their own.
  - `$gradients`: named gradients for `gradient()`, `(name: (fallback: …, from: …, to: …))`, empty by default.
- `_typography.scss`
  - `$font-size-100` to `$font-size-900`, and the `$font-sizes` scale (`100` to `900`).
  - `$font-family-base`, `$font-family-heading`, `$font-family-mono` (system font stacks, no font file) and `$font-families` (`default`, `heading`, `mono`).
  - `$font-styles`: family, size, weight and decoration per type (`page`, `text`, `title`, `button`, `form`, `link`) and variant (for `title`: `page-main`, `page-sub`, `section-main`, `section-sub`, `block-main`, `block-sub`). A variant inherits the `default` variant of its type, which inherits the top-level `default`. Families and sizes are references (`ds-ref(font-family, heading)`, `ds-ref(font-size, 800)`).
- `_icons.scss`: `$icons`, icon names mapped to glyph codes of the `ds-icons` font.
- `_breakpoints.scss`: `$grid-xxs` to `$grid-xxl`, and `$breakpoints`, minimum widths in px (`xxs` 360, `xs` 576, `sm` 768, `md` 992, `lg` 1200, `xl` 1400, `xxl` 1600).
- `_spacing.scss`: `$spacings`, steps `0` to `8` (`0` to `4rem`), and `$radii` (`none`, `sm`, `md`, `lg`, `pill`, `circle`).

### Functions and mixins (`scss/engine/tools/`)

The accessors of the tokens return their custom property, `var(--ds-…)` (see [Design tokens as custom properties](#design-tokens-as-custom-properties)); each one has a `-value` variant that returns the Sass value, for computations.

- Tokens: `@include ds-tokens($groups...)` writes the custom properties. `ds-token($group, $keys...)` returns the custom property of any token (`ds-token(font-size, 100)` → `var(--ds-font-size-100)`), `ds-token-value()` its Sass value, `ds-token-name()` its name (`--ds-font-size-100`), `ds-has-token()` whether it exists and has a value. `ds-ref($group, $keys...)` makes a reference to a token, in a token map.
- Colors: `ds-color($type, $variant: base)`, `ds-colorset-text()`, `ds-colorset-border()`, `ds-colorset-background()`, `ds-colorset-style($prop, $type, $variant)`, and `@include ds-colorset-styles($type, $variant)` for all three properties. `gradient($name, $attr)` and `@include gradient($name, $orientation)` read `$gradients`.
- Typography: `ds-font-style($prop, $type, $variant)`, `ds-font-family()`, `ds-font-size()`, `ds-font-weight()`, `ds-font-decoration()` (`$type`, `$variant`), and `@include ds-font-styles($type, $variant)` for the family, size, weight and decoration.
- Icons: `@include ds-icon($name, $display)` for an icon glyph, `@include ds-icon-content($name)` for the glyph only, and `@include ds-icon-font-face($path: '../fonts')` for the `@font-face` of the `ds-icons` font.
- Spacing: `ds-spacing($step)`, `ds-radius($name)`.
- Breakpoints: `@include break-p($min, $max)` writes a media query from `$breakpoints`: `min-width` for `$min`, `max-width` (value - 1) for `$max`, or both. `ds-breakpoint($label)` returns the width of a breakpoint in px (a Sass value: media queries cannot read custom properties). JavaScript reads them from the custom properties, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript).
- Misc: `@include ds-arrow($size, $direction, $color)`, `@include spin` (it uses the keyframes of `@include ds-keyframes()`, included once at the root of a theme).

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

| Group         | Map              | Custom properties                                                           | Example (legacy theme)                                                 |
| ------------- | ---------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `color`       | `$colors`        | `--ds-color-<family>-<shade>`                                               | `--ds-color-primary-base: #e4be90`                                     |
| `colorset`    | `$colorset`      | `--ds-colorset-<type>-<variant>-<prop>`                                     | `--ds-colorset-solid-primary-background: var(--ds-color-primary-base)` |
|               |                  | `--ds-colorset-default-<prop>` (top-level default)                          | `--ds-colorset-default-text: var(--ds-color-primary-base)`             |
| `font-size`   | `$font-sizes`    | `--ds-font-size-<step>`                                                     | `--ds-font-size-800: 2.25rem`                                          |
| `font-family` | `$font-families` | `--ds-font-family-<name>`                                                   | `--ds-font-family-now: "Now"`                                          |
| `font-style`  | `$font-styles`   | `--ds-font-style-<type>-<variant>-<prop>`, `--ds-font-style-default-<prop>` | `--ds-font-style-title-page-main-weight: 900`                          |
| `space`       | `$spacings`      | `--ds-space-<step>`                                                         | `--ds-space-4: 1rem`                                                   |
| `radius`      | `$radii`         | `--ds-radius-<name>`                                                        | `--ds-radius-pill: 999px`                                              |
| `bp`          | `$breakpoints`   | `--ds-bp-<label>`, in px, and `--ds-bp-labels`, the list of the labels      | `--ds-bp-md: 992px`, `--ds-bp-labels: xxs xs sm md lg xl xxl`          |
| `gradient`    | `$gradients`     | `--ds-gradient-<name>-<attr>`                                               | (none: no gradient in the themes)                                      |

`default` writes 165 custom properties, `legacy` 180 (`legacy` has no `status` `warning` color, so no `--ds-color-status-warning`, and adds colors and font families of its own). A token whose value is `null` is not written, nor a reference to a token that does not exist or has no value. `$icons` is not written: its glyph codes belong to the `ds-icons` font, not to a theme.

The `--ds-bp-*` properties are for JavaScript (`tokens.getBreakpoints()`, `tokens.getToken('bp-md')`, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript)): media queries cannot use custom properties, so `break-p()` and `ds-breakpoint()` use the Sass values, and changing the properties at runtime does not change the media queries of the theme.

#### References (derived tokens)

A token can be a reference to another one: `ds-ref(<group>, <keys>…)` in a map, such as `text: ds-ref(color, primary, base)` in `$colorset`. Its custom property is then `var()` of the other one, `--ds-colorset-default-text: var(--ds-color-primary-base)`, so it follows it, at build time (a configured `$colors`) and at runtime. The default `$colorset` and `$font-styles` refer to `$colors`, `$font-sizes` and `$font-families`; `legacy` does the same for the values it took from its palette and type scale (white and black are its `gray` `white` and `black`), and keeps its own values for the gray button (`solid` `gray` and `gray-hover`: `#dcdcdc`, `#ccc`, `#333`), which do not follow the palette (their own custom properties still change them at runtime).

`ds-ref()` is in `scss/engine/tools/references`, which reads no token: a theme loads it in its `_tokens.scss` before it configures the engine (`@use '../../engine/tools/references' as *;`, as `legacy` does), and so does a stylesheet that configures the engine with references (`@use '<path to>/scss/engine/tools/references' as *; @use '<path to>/scss/engine' with (…);`). Written where it is not loaded, Sass takes `ds-ref(…)` for a plain CSS function: `ds-tokens()` then fails with an error that says so.

#### Accessors and Sass values

| Returns `var(--ds-…)`                                                                                                             | Returns the Sass value                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ds-token($group, $keys...)`                                                                                                      | `ds-token-value($group, $keys...)`                                                                                                |
| `ds-color($type, $variant)`                                                                                                       | `ds-color-value()`                                                                                                                |
| `ds-colorset-style($prop, $type, $variant)`, `ds-colorset-text()`, `-border()`, `-background()`, `@include ds-colorset-styles()`  | `ds-colorset-style-value()`, `ds-colorset-text-value()`, `ds-colorset-border-value()`, `ds-colorset-background-value()`           |
| `ds-font-style($prop, $type, $variant)`, `ds-font-family()`, `-size()`, `-weight()`, `-decoration()`, `@include ds-font-styles()` | `ds-font-style-value()`, `ds-font-family-value()`, `ds-font-size-value()`, `ds-font-weight-value()`, `ds-font-decoration-value()` |
| `ds-spacing($step)`, `ds-radius($name)`                                                                                           | `ds-spacing-value()`, `ds-radius-value()`                                                                                         |
| `gradient($name, $attr)`, `@include gradient()`                                                                                   | `gradient-value()`                                                                                                                |

Use the `-value` functions wherever Sass needs the value itself: color functions (`color.change(ds-color-value(gray, white), $alpha: 0.6)`), arithmetic and comparisons (`ds-spacing-value(4) * 2`), media queries. `var()` cannot be computed by Sass (`color.change(ds-color(…))` is an error), and the result of a computation is a value: it does not follow the token at runtime.

The colorset and font style accessors resolve the inheritance at build time: `ds-font-family(title, page-sub)` is `var(--ds-font-style-title-default-family)`, the variant that declares it. An unknown token, type or variant, a group of tokens (`ds-token(color, primary)`) or a token without value is a Sass error, with the known keys. `ds-color($type, $variant, $optional: true)` returns `null` for a color that does not exist, so the declaration is left out: `legacy`'s message skin uses it for `ds-color(status, warning)`, which its palette does not have (to be fixed in the palette).

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

Everything that reads the token follows, the tokens that refer to it included: the `stl-1` buttons (`--ds-colorset-solid-primary-*`), the links, the `default` focus outline… The skins of both themes read their colors and fonts from the tokens, so overriding any color or font family token works the same way (`--ds-color-shadow-medium`, `--ds-font-family-heading` in `legacy`…). What a skin computes in Sass (`color.change(…)`, the two white veils of `default`) does not follow, nor the other tokens that only have the same value (`--ds-color-status-info` and `--ds-color-input-caret` are `#2563eb` in `default`, like the primary color).

Or in a scope: `.promo { --ds-color-primary-base: #0d9488; }`. The rules that read `--ds-color-primary-base` inside `.promo` follow, but not the tokens that refer to it: their `var()` was resolved on `:root`, and `.promo` inherits the result. Declare them again in the scope, from Sass with `ds-tokens()` and the groups to declare:

```scss
@use '../tokens' as *;

.promo {
  --ds-color-primary-base: #0d9488;
  @include ds-tokens(colorset); // --ds-colorset-…: var(--ds-color-…), resolved in .promo
}
```

The demo pages (`index.html`, `components/index.html`) have a **Primary color token (`--ds-color-primary-base`)** color input next to the theme switcher: it sets the custom property on `<html>`, the skins follow at once; **Reset the primary color** removes it, and switching themes removes it too.

### Page stylesheets

A page stylesheet belongs to a theme: create `scss/themes/<theme>/pages/<page>.scss` and start it with `@use '../tokens' as *;` to get the tokens, functions and mixins of the theme. As the engine outputs no CSS, the compiled file only holds the rules of the page. `npm run build:css` compiles it to `dist/css/pages/<theme>/<page>.css`, and `serve:theme` on each change; load it after the theme stylesheet. Partials (`_*.scss`) are not compiled.

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
- `tokens.getBreakpoints(element?)` returns the breakpoints, label: width in px, sorted by width: `{ xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 }` with both themes. It reads `--ds-bp-labels`, then each `--ds-bp-<label>` (`992px` or a unitless `992`). A label without a width in px is left out, with one warning that names them; without `--ds-bp-labels` (the theme stylesheet is not loaded yet), it returns `{}` with one warning.
- `responsive.processBreakpoints()` turns them into ranges with the mobile-first semantics of `break-p`: each label starts at its value and ends at the next value - 1, the first label also covers the smaller widths (it starts at 0) and the last one has no maximum. With the theme map: `xxs` 0–575, `xs` 576–767, `sm` 768–991, `md` 992–1199, `lg` 1200–1399, `xl` 1400–1599, `xxl` 1600 and up. `responsive.getBreakpoint()` returns the label and limits (`[min, max]`, or `[min]` for the last label) for a width.
- `responsive.isMobile()`, `isTablet()` and `isDesktop()` compare the window width with the `sm` and `md` breakpoints of the theme (`--ds-bp-sm`, `--ds-bp-md`): mobile below `sm`, tablet from `sm` to below `md`, desktop from `md`. Without the theme, 768 and 992 px.
- `<ds-rsp>` reads the breakpoints with `tokens.getBreakpoints()` (or takes them from its `breakpoints` attribute, label: minimum width in px: `breakpoints='{"sm": 0, "lg": 992}'`), listens to `resize` (debounced by `debounce-delay`, 500 ms by default), and when it starts and each time the breakpoint changes:
  - dispatches a `breakpointChange` event (`detail: { all, current, previous, isGrowing }`, type `BreakpointChangeDetail`) on every element with a `data-use-rsp` attribute. This event does not bubble;
  - sets on these elements the properties declared in their `data-rsp` attribute (a JSON string) for the current breakpoint (or the closest smaller breakpoint that has some). Unknown labels are ignored with a warning; the initial values of the changing properties are kept for the smallest breakpoint. They are read from the element's property (a camelCase property such as `hGap` included), else from its attribute (`h-gap`). Initialised elements get a `data-rsp-init` attribute;
  - then emits the same `breakpointChange` event from `<ds-rsp>` itself. This one bubbles: listen to it on `<ds-rsp>` or on `document`. A subscriber that contains `<ds-rsp>` receives both events and should only handle the one whose `target` is itself, as `ds-grid` does.
  - Elements subscribed after it started, with its `subscribe(element)` method, or inserted in the document (or given a `data-use-rsp` attribute) and matching `subscriber-selector`, get the params of the current breakpoint at once. Insertions are detected with a `MutationObserver`.
  - Without breakpoints (theme stylesheet not loaded, no `breakpoints` attribute), it logs one warning and tracks nothing: no `resize` listener, no event, the subscribers wait.
  - Its `refresh()` method reads the breakpoints again (from the `breakpoints` attribute, else from the theme) and applies them: it subscribes the matching elements that are not subscribed yet, sets the params of the current breakpoint on every subscriber again, and emits `breakpointChange` only when the label or the limits of the current breakpoint changed (`previous` is then the former breakpoint, `undefined` when it starts). Without breakpoints until then (theme stylesheet loaded after `<ds-rsp>`), it starts, as when the theme is there at load. When it finds none (theme stylesheet removed, or being replaced), it keeps the current ones and logs a warning, once until it finds some again. A new `breakpoints` attribute value is applied the same way.
  - `<ds-rsp>` calls `refresh()` by itself when a stylesheet `<link>` of the document loads (it listens to `load` on the document, in the capture phase): a theme stylesheet added after it, or a theme switched by changing the `href` of its `<link>`, as the demo pages do. Call `refresh()` when the theme changes otherwise: a `<style>` element, a constructed stylesheet (`adoptedStyleSheets`), a `media` attribute changed after the load (`media="print" onload="this.media='all'"`), custom properties set from JavaScript.

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

### Components

Each component documents its properties, events, methods and slots in the `readme.md` generated next to its source (`components/core/<component>/readme.md`). Among them:

- **`ds-button`** ([readme](components/core/button/readme.md)): a native `<button>` (`type` `button`, `submit` or `reset`; in the light DOM, a submit button inside a `<form>` submits it), or a link when `href` is set. Slots `before`, default and `after`. The theme skins it with modifiers: sizes `xs` to `xl`, `rounded`, `shadow`, colors `stl-1` to `stl-3`. While `disabled`, the native button is disabled, a link loses its `href`, and the component stops the clicks before they reach its listeners (`onClick` in JSX included).
- **`ds-combo`** ([readme](components/core/combo/readme.md)): a custom select with single or `multiple` selection. Its options are data (an array, or its JSON string in HTML): text options, links (`url`), images (`mode="image"`), disabled options and placeholders (empty `value`). Pre-select options with `selected` (`{ index }`, `{ value }` or `{ name }`) or with the options' `selected` flags; each user selection emits `optionSelected` (`{ name, option, selectedOptions }`). `open()`, `close()` and `toggle()` drive the list; `mode="dropdown"` renders no toggle button, for a list opened by another element. A click outside closes the list. `ds-combo` replaces `ds-dropdown` and `ds-dropdown-item`, which were removed: their slotted items had no selection behavior.
- **`ds-trigger`** ([readme](components/core/trigger/readme.md)): calls a method of a target element on an event (`target`, `action`, `on`). With `type="button"` it also gets the `.ds-button` skin, but it is not a native button: it is not focusable and does not submit forms. Use `ds-button` for buttons and links, and `ds-trigger` to bind an action to another element.

```html
<ds-combo name="color" options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue"}]' selected='{"value": "blue"}'></ds-combo>
<ds-combo id="menu" mode="dropdown" options='[{"name": "Docs", "value": "docs", "url": "/docs"}]'></ds-combo>
<ds-trigger type="button" mods="sm,stl-2" target="#menu" action="toggle">Menu</ds-trigger>

<form>
  <ds-button mods="md,stl-1" type="submit">Send</ds-button>
  <ds-button mods="md,stl-2" href="/help">Help</ds-button>
</form>
```

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

## Tests

Unit tests are Stencil spec tests: Stencil's test runner drives Jest 27 (the `jest` and `jest-cli` dev dependencies) in Stencil's simulated DOM, without a browser:

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

`components/sass.spec.ts` compiles every theme (`scss/themes/<theme>/index.scss`), every theme page stylesheet and every `.scss` file of `components/` with the Sass JavaScript API: a Sass warning (a deprecation included) or error fails `npm test`, so CI. It also checks that the tokens can be configured with `@use … with (…)`. For the custom properties, it checks that each theme writes one per token of its maps (names and values, references resolved), that its `--ds-bp-labels` lists its `--ds-bp-*` breakpoints by width (and that no JSON is written in a `content` any more), the errors on breakpoint labels, that every `var(--ds-…)` of a theme has its property, that the accessors return `var()` and the `-value` functions the values, the errors on unknown tokens, `null` values, configured engines and the scoped `ds-tokens()`.

`npm test` runs them once, `npm run test.watch` on every change. Spec files are not part of the build output (`dist/`, `www/`, `loader/`). End-to-end tests (`*.e2e.ts`, `npm run test:e2e`) need Puppeteer's Chromium, so `npm ci` must run without `PUPPETEER_SKIP_DOWNLOAD`.

## Archived code

Code removed from the development branch is kept unchanged on two archive branches, `archive/propal` and `archive/external-integrations`. See [docs/propal-archive.md](docs/propal-archive.md) for their content and how to read or restore files from them.

## License

MIT, see [LICENSE](LICENSE).
