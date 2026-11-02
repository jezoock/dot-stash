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
  utils/           shared TypeScript: utility modules (props, css, dom, ajax, responsive, env, form,
                   context), the `ds` object grouping them (dot-stash.ts), debounce, throttle, uuid,
                   and shared types and enums (interfaces/)
  demo/            ds-main, the demo component used by the dev pages
  index.ts         package entry point
  index.html       page served by the Stencil dev server, with the theme switcher
  components.d.ts  component typings, generated by Stencil
scss/
  engine/          generic toolkit, no CSS output of its own (_index.scss forwards everything)
    variables/     token schema with neutral defaults: breakpoints, palette, typography, icons, spacing
    tools/         functions and mixins: colors, typography, icons, spacing, breakpoints, misc, theme
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

- **The engine** (`scss/engine/`): the token schema, with neutral defaults, and the functions and mixins that read the tokens. It outputs no CSS by itself. `@use '<path to>/scss/engine' as *;` gives the tokens, functions and mixins without a namespace (`ds-color(...)`, `break-p(...)`, `$breakpoints`).
- **Themes** (`scss/themes/<theme>/`): a theme configures the engine tokens and writes the CSS (base styles, fonts, component skins). Each one compiles to `dist/css/<theme>.css`.
  - `default`: neutral (blue primary, slate secondary, gray scale, system font stacks). Its base styles and skins take their sizes, colors and fonts from the tokens: start a new theme from it.
  - `legacy`: the look of the site the library comes from (gold primary, Montserrat and Mulish, uppercase titles, site-specific modifiers such as `.ds-grid.--home` or `.ds-block.--content`). Its skins still hard-code many values.

### Themes

A theme folder holds:

| File                     | Content                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_tokens.scss`           | Loads the engine configured for the theme (`@forward '../../engine' with (…)`). The other files of the theme start with `@use '../tokens' as *;` (or `'./tokens'`): they all get the configured tokens. |
| `index.scss`             | The entry point compiled by gulp: loads the tokens first, then the base styles and skins. The order of the `@use` rules is the order of the CSS output.                                                 |
| `_base.scss`             | Base element styles and the `body::before` bridge (`@include ds-theme()`): JavaScript reads it, a theme must have it.                                                                                   |
| `layout/`, `components/` | Skins, one partial per component.                                                                                                                                                                       |
| `pages/`                 | The page stylesheets of the theme (see [Page stylesheets](#page-stylesheets)).                                                                                                                          |

`legacy` also has `_fonts.scss` (the `ds-icons`, Montserrat and Mulish `@font-face` rules) and `_animations.scss`. The font URLs are relative to the stylesheet (`../fonts/`, so `dist/fonts/`); the font files are not part of the repository.

`themes` in `dot-stash.config.mjs` lists the themes gulp builds, `['default', 'legacy']`. The first one is the default theme of the demo pages.

- `npm run build:css` deletes `dist/css/`, then compiles each `scss/themes/<theme>/index.scss` to `dist/css/<theme>.css` and each `scss/themes/<theme>/pages/<page>.scss` to `dist/css/pages/<theme>/<page>.css`, compressed. A Sass error fails the build.
- `npm run serve:theme` recompiles on change: a file of the engine, every theme and its pages; a file of a theme, that theme and its pages; a page stylesheet, that page. A Sass error is logged and the watch goes on. BrowserSync injects the new CSS in the page.

### Theme switcher

The demo pages load the first theme: `index.html` (`npm run serve:theme`) from `/dist/css/`, `components/index.html` (`npm start`) from `/css/`, the copy of `dist/css/*.css` the Stencil build makes in `www/css/`. Both have a theme switcher: a `<select>` that replaces the file name of the theme stylesheet (`<link id="ds-theme-stylesheet">`). The choice is remembered in `localStorage` (key `ds-demo-theme`) when the browser allows it. The themes it offers are listed in the script of each page.

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

   A configured map replaces the whole default map: keep its keys, the tools and skins read them. The tokens derived from others follow the configured values: `$breakpoints` is built from `$grid-*`, `$colorset` from `$colors`, `$font-families` from `$font-family-*`, `$font-styles` from `$font-sizes` and `$font-families`. With `!default` after a value (`$grid-md: 1024 !default`, as `legacy` does), a stylesheet can still change it when it loads the theme: `@use 'themes/<name>/tokens' with ($grid-md: 1100); @use 'themes/<name>';`.

3. Edit the base styles and skins, or add some: each partial starts with `@use '../tokens' as *;` and is loaded by `index.scss`. Keep `@include ds-icon-font-face();` and `@include ds-keyframes();` (once, at the root) and the `body::before` bridge.
4. Add the name to `themes` in `dot-stash.config.mjs` (and to the switcher of the demo pages), then run `npm run build:css`: `dist/css/<name>.css`. `npm test` compiles the new theme, fails on any Sass warning, and checks the theme JSON of its `body::before`.

The engine can also be configured from outside a theme that does not configure it, before the theme loads it: `@use '<path to>/scss/engine' with ($grid-md: 1024); @use '<path to>/scss/themes/default';`.

### Tokens (`scss/engine/variables/`)

Every token is declared with `!default`. The defaults are neutral; `legacy/_tokens.scss` holds the legacy values.

- `_palette.scss`
  - `$colors`: color families and their shades: `primary` and `secondary` (`darker`, `dark`, `base`, `light`), `gray` (`white`, `lightest`, `lighter`, `light`, `base`, `dark`, `darker`, `darkest`, `black`), `status` (`success`, `warning`, `error`, `info`, `busy`, `disabled`, `discount`, `new`), `input` (`caret`), `shadow` (`base`).
  - `$colorset`: named sets of `text`, `border` and `background` colors, grouped by type (`solid`, `outlined`, `link`) with variants such as `primary`, `primary-hover`, `secondary`, `white`, `gray` or `disabled`.
  - `$gradients`: named gradients for `gradient()`, `(name: (fallback: …, from: …, to: …))`, empty by default.
- `_typography.scss`
  - `$font-size-100` to `$font-size-900`, and the `$font-sizes` scale (`100` to `900`).
  - `$font-family-base`, `$font-family-heading`, `$font-family-mono` (system font stacks, no font file) and `$font-families` (`default`, `heading`, `mono`).
  - `$font-styles`: family, size, weight and decoration per type (`page`, `text`, `title`, `button`, `form`, `link`) and variant (for `title`: `page-main`, `page-sub`, `section-main`, `section-sub`, `block-main`, `block-sub`). A variant inherits the `default` variant of its type, which inherits the top-level `default`.
- `_icons.scss`: `$icons`, icon names mapped to glyph codes of the `ds-icons` font.
- `_breakpoints.scss`: `$grid-xxs` to `$grid-xxl`, and `$breakpoints`, minimum widths in px (`xxs` 360, `xs` 576, `sm` 768, `md` 992, `lg` 1200, `xl` 1400, `xxl` 1600).
- `_spacing.scss`: `$spacings`, steps `0` to `8` (`0` to `4rem`), and `$radii` (`none`, `sm`, `md`, `lg`, `pill`, `circle`).

### Functions and mixins (`scss/engine/tools/`)

- Colors: `ds-color($type, $variant: base)`, `ds-colorset-text()`, `ds-colorset-border()`, `ds-colorset-background()`, and `@include ds-colorset-styles($type, $variant)` for all three properties. `gradient($name, $attr)` and `@include gradient($name, $orientation)` read `$gradients`.
- Typography: `ds-font-style($prop, $type, $variant)`, `ds-font-family()`, `ds-font-size()`, `ds-font-weight()`, `ds-font-decoration()` (`$type`, `$variant`), and `@include ds-font-styles($type, $variant)` for the family, size, weight and decoration.
- Icons: `@include ds-icon($name, $display)` for an icon glyph, `@include ds-icon-content($name)` for the glyph only, and `@include ds-icon-font-face($path: '../fonts')` for the `@font-face` of the `ds-icons` font.
- Spacing: `ds-spacing($step)`, `ds-radius($name)`.
- Breakpoints: `@include break-p($min, $max)` writes a media query from `$breakpoints`: `min-width` for `$min`, `max-width` (value - 1) for `$max`, or both. `ds-breakpoint($label)` returns the width of a breakpoint in px.
- Misc: `@include ds-arrow($size, $direction, $color)`, `@include spin` (it uses the keyframes of `@include ds-keyframes()`, included once at the root of a theme).
- Theme: `@include ds-theme()`, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript).

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

Each theme applies `@include ds-theme()` to `body::before` (in its `_base.scss`): the breakpoints (and the primary base color) are written as JSON in the pseudo-element's `content`, which is hidden. The SCSS map stays the single source of truth:

- `responsive.getStylesJSON()` (also available as `ds.tools.getStylesJSON()`) reads and parses that JSON. It returns `{}` when the theme stylesheet is not loaded.
- `responsive.processBreakpoints()` turns the map into ranges with the mobile-first semantics of `break-p`: each label starts at its value and ends at the next value - 1, the first label also covers the smaller widths (it starts at 0) and the last one has no maximum. With the theme map: `xxs` 0–575, `xs` 576–767, `sm` 768–991, `md` 992–1199, `lg` 1200–1399, `xl` 1400–1599, `xxl` 1600 and up. `responsive.getBreakpoint()` returns the label and limits (`[min, max]`, or `[min]` for the last label) for a width.
- `<ds-rsp>` reads the breakpoints (or takes them from its `breakpoints` attribute, written like the Sass map: `breakpoints='{"sm": 0, "lg": 992}'`), listens to `resize` (debounced by `debounce-delay`, 500 ms by default), and when it starts and each time the breakpoint changes:
  - dispatches a `breakpointChange` event (`detail: { all, current, previous, isGrowing }`, type `BreakpointChangeDetail`) on every element with a `data-use-rsp` attribute. This event does not bubble;
  - sets on these elements the properties declared in their `data-rsp` attribute (a JSON string) for the current breakpoint (or the closest smaller breakpoint that has some). Unknown labels are ignored with a warning; the initial values of the changing properties are kept for the smallest breakpoint. They are read from the element's property (a camelCase property such as `hGap` included), else from its attribute (`h-gap`). Initialised elements get a `data-rsp-init` attribute;
  - then emits the same `breakpointChange` event from `<ds-rsp>` itself. This one bubbles: listen to it on `<ds-rsp>` or on `document`. A subscriber that contains `<ds-rsp>` receives both events and should only handle the one whose `target` is itself, as `ds-grid` does.
  - Elements subscribed after it started, with its `subscribe(element)` method, or inserted in the document (or given a `data-use-rsp` attribute) and matching `subscriber-selector`, get the params of the current breakpoint at once. Insertions are detected with a `MutationObserver`.
  - Without breakpoints (theme stylesheet not loaded, no `breakpoints` attribute), it logs a warning and does nothing.

```html
<ds-rsp></ds-rsp>
<ds-grid cols="5">
  <ds-grid-item width="1" data-use-rsp data-rsp='{"sm": {"width": 3}, "lg": {"width": 5}}'>…</ds-grid-item>
</ds-grid>
```

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
import { ds, props, responsive, debounce, throttle, uuid, AppStatus, DsComponentContext } from 'dot-stash';
import type { Breakpoint, BreakpointChangeDetail, Breakpoints, RawBreakpoint, SassStyles, DsComponentContextType } from 'dot-stash';

const { breakpoints } = responsive.getStylesJSON();
const classList = props.toClassList('ds-card', 'large,dark');
const onResize = debounce(() => console.log(window.innerWidth), 200);
```

The helpers are split into modules, each exported as a namespace:

| Module       | Functions                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `props`      | `isTrue`, `toNumber`, `toFloat`, `toArray`, `fromJSON`, `toClassList`, `toString`                                                                   |
| `css`        | `set`, `get`, `toNumber` (inline styles)                                                                                                            |
| `dom`        | `cleanHTML`, `loadScript`, `scrollTo`, `getFileExtension`, `getOffset`                                                                              |
| `ajax`       | `buildQuery`, `get`, `post` (JSON responses; `get(url, query, { responseType: 'text' })` returns the body as text, e.g. HTML)                       |
| `responsive` | `getStylesJSON`, `removeQuotes` (Sass bridge), `processBreakpoints`, `getBreakpoint`, `getParamsForBreakpoint`, `isMobile`, `isTablet`, `isDesktop` |
| `env`        | `touchSupport`                                                                                                                                      |
| `form`       | `submit`, `reset`                                                                                                                                   |
| `context`    | `get`, `DsComponentContext`                                                                                                                         |

`ds` groups the same modules in one object (`ds.props.toClassList(...)`, `ds.ajax.get(...)`), and `ds.tools` keeps the DOM helpers and the Sass bridge under their former key (`ds.tools.scrollTo`, `ds.tools.getStylesJSON`…). Inside the library, components import the functions from their module (`import { toClassList } from '../../utils/props'`), so each bundle only contains the helpers it uses.

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

`components/sass.spec.ts` compiles every theme (`scss/themes/<theme>/index.scss`), every theme page stylesheet and every `.scss` file of `components/` with the Sass JavaScript API: a Sass warning (a deprecation included) or error fails `npm test`, so CI. It also checks that each theme writes valid theme JSON in `body::before`, and that the tokens can be configured with `@use … with (…)`.

`npm test` runs them once, `npm run test.watch` on every change. Spec files are not part of the build output (`dist/`, `www/`, `loader/`). End-to-end tests (`*.e2e.ts`, `npm run test:e2e`) need Puppeteer's Chromium, so `npm ci` must run without `PUPPETEER_SKIP_DOWNLOAD`.

## Archived code

Code removed from the development branch is kept unchanged on two archive branches, `archive/propal` and `archive/external-integrations`. See [docs/propal-archive.md](docs/propal-archive.md) for their content and how to read or restore files from them.

## License

MIT, see [LICENSE](LICENSE).
