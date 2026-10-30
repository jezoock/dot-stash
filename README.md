# dot-stash

A standalone UI library made of two parts:

- **Web components**: generic `ds-*` custom elements built with Stencil. They render in the light DOM (no shadow DOM) and use plain class names (`ds-block`, `ds-block__body`, `--modifier`), so a regular page stylesheet can style them.
- **SCSS theming toolkit**: token maps, functions and mixins compiled by gulp into one global stylesheet (`dist/css/style.css`) that skins the components and the page.

Some components also have a small structural stylesheet (`styleUrl`) that Stencil injects into the document. Colors, typography and component skins come from the global stylesheet.

## Requirements

- Node.js 22 (see `.nvmrc`; `package.json` `engines` requires Node.js 20 or later)
- npm

## Install

```sh
git clone https://github.com/jezoock/dot-stash.git
cd dot-stash
npm ci
npm run build:all
```

## npm scripts

| Script                 | What it does                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`        | Stencil production build: the package in `dist/` and `loader/`, the demo app in `www/`. Also regenerates `components/components.d.ts` and the component `readme.md` files.                                  |
| `npm run build:css`    | Compiles `scss/index.scss` into `dist/css/style.css` (gulp task `generateThemeCSS`).                                                                                                                        |
| `npm run build:all`    | Runs `clean`, `build`, then `build:css`.                                                                                                                                                                    |
| `npm run clean`        | Deletes `dist/`, `www/`, `.stencil/` and `loader/`.                                                                                                                                                         |
| `npm start`            | Stencil development build in watch mode, with the Stencil dev server (serves `www/`, page `components/index.html`).                                                                                         |
| `npm run dev`          | One-off Stencil development build (no server, no watch).                                                                                                                                                    |
| `npm run serve:theme`  | Theme live preview (gulp default task, BrowserSync). Serves the repository root (`index.html`), recompiles the theme when a file in `scss/` changes and a page stylesheet when `scss/pages/*.scss` changes. |
| `npm test`             | Unit tests: Stencil spec tests (`stencil test --spec`, Jest), without a browser. See [Tests](#tests).                                                                                                       |
| `npm run test.watch`   | Same as `npm test`, in watch mode.                                                                                                                                                                          |
| `npm run test:e2e`     | Stencil end-to-end tests (`stencil test --e2e`, Puppeteer and Chromium). No end-to-end test exists yet, and CI does not run them.                                                                           |
| `npm run generate`     | Stencil component generator (interactive).                                                                                                                                                                  |
| `npm run lint`         | ESLint on `components/` (`eslint.config.mjs`: ESLint recommended + typescript-eslint recommended rules).                                                                                                    |
| `npm run lint:fix`     | Same as `lint`, applying automatic fixes.                                                                                                                                                                   |
| `npm run format`       | Prettier on the `ts`, `tsx`, `js`, `mjs`, `scss`, `json`, `html`, `yml`, `yaml` and `md` files (`.prettierignore` excludes build output and generated files, including the component `readme.md` files).    |
| `npm run format:check` | Checks the same files without writing.                                                                                                                                                                      |

`serve:theme` only recompiles on change: run `npm run build:css` once first, and `npm start` or `npm run dev` to get the components in `www/build/`.

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
  index.html       page served by the Stencil dev server
  components.d.ts  component typings, generated by Stencil
scss/
  variables/       token maps (palette, typography, breakpoints, spacing)
  tools/           functions and mixins (colors, typography, breakpoints, theme, misc)
  components/      component skins
  layout/          header, footer, nav
  pages/           per-page stylesheets (empty for now)
  index.scss       theme entry point: base styles and the body::before bridge
  theme.scss       imports fonts, variables, tools, layout and components
  pages.scss       imports variables and tools only (no CSS output), for page stylesheets
gulpfile.mjs           theme tasks and live-preview server
dot-stash.config.mjs   source/destination paths and gulp settings
stencil.config.ts      Stencil configuration (srcDir: components)
index.html             theme preview page used by serve:theme
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
| `dist/css/style.css`                 | Theme stylesheet (gulp)                                                                     |
| `dist/css/pages/*.css`               | Page stylesheets (gulp, written by `serve:theme`)                                           |
| `dist/images/`                       | Optimized images (`npx gulp generateImages`)                                                |

Stencil runs with `empty: false`, so it does not delete the gulp output in `dist/`. The published package contains `dist/` and `loader/`.

## Theming

### Tokens (`scss/variables/`)

- `palette.scss`
  - `$colors`: color families and their shades (`primary`, `secondary`, `gray`, `status`, `input`, `shadow`).
  - `$colorset`: named sets of `text`, `border` and `background` colors, grouped by type (`solid`, `outlined`, `link`) with variants such as `primary`, `primary-hover`, `secondary`, `white` or `disabled`.
- `typography.scss`
  - `$font-sizes` (scale `100` to `900`), `$font-families`.
  - `$font-styles`: family, size, weight and decoration per type (`page`, `text`, `title`, `button`, `form`, `link`) and variant.
  - `$icons`: icon names mapped to glyph codes of the `ds-icons` font.
- `breakpoint.scss`: `$breakpoints`, minimum widths in px (`xxs` 360, `xs` 576, `sm` 768, `md` 992, `lg` 1200, `xl` 1400, `xxl` 1600).
- `spacing.scss`: empty for now.

`scss/fonts.scss` declares the `@font-face` rules (`ds-icons`, Montserrat, Mulish) with URLs relative to the stylesheet (`../fonts/`, so `dist/fonts/`). The font files are not part of the repository.

### Functions and mixins (`scss/tools/`)

- Colors: `ds-color($type, $variant)`, `ds-colorset-text()`, `ds-colorset-border()`, `ds-colorset-background()`, and `@include ds-colorset-styles($type, $variant)` for all three properties.
- Typography: `ds-font-style()`, `ds-font-family()`, `ds-font-size()`, `ds-font-weight()`, `ds-font-decoration()`, `@include ds-font-styles($type, $variant)`, and `@include ds-icon($name, $display)` for an icon glyph.
- Breakpoints: `@include break-p($min, $max)` writes a media query from `$breakpoints`: `min-width` for `$min`, `max-width` (value - 1) for `$max`, or both.
- Misc: `@include ds-arrow($size, $direction, $color)`, `@include spin`.
- Theme: `@include ds-theme()`, see below.

```scss
.ds-card {
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
    padding: 2rem;
  }
}
```

### Modifier classes

Components with a `mods` property turn each modifier into a `--<modifier>` class next to their main class. `mods` accepts a comma-separated string or an array:

```html
<ds-block mods="content,top-header">…</ds-block>
<!-- renders class="ds-block --content --top-header" -->
```

The stylesheet then targets `.ds-block.--content.--top-header`. The same conversion is available in JavaScript as `ds.props.toClassList('ds-card', 'large,dark')`.

A string `mods` is reflected to the `mods` attribute. An array set in JavaScript is not (Stencil only reflects primitive values): the attribute then keeps its previous value, so read the `mods` property rather than the attribute.

### Breakpoints shared with JavaScript

`scss/index.scss` applies `@include ds-theme()` to `body::before`: the breakpoints (and the primary base color) are written as JSON in the pseudo-element's `content`, which is hidden. The SCSS map stays the single source of truth:

- `responsive.getStylesJSON()` (also available as `ds.tools.getStylesJSON()`) reads and parses that JSON. It returns `{}` when the theme stylesheet is not loaded.
- `responsive.processBreakpoints()` turns the map into ranges with the mobile-first semantics of `break-p`: each label starts at its value and ends at the next value - 1, the first label also covers the smaller widths (it starts at 0) and the last one has no maximum. With the theme map: `xxs` 0–575, `xs` 576–767, `sm` 768–991, `md` 992–1199, `lg` 1200–1399, `xl` 1400–1599, `xxl` 1600 and up. `responsive.getBreakpoint()` returns the label and limits (`[min, max]`, or `[min]` for the last label) for a width.
- `<ds-rsp>` reads the breakpoints (or takes them from its `breakpoints` attribute, written like the Sass map: `breakpoints='{"sm": 0, "lg": 992}'`), listens to `resize` (debounced by `debounce-delay`, 500 ms by default), and when the breakpoint changes:
  - dispatches a `breakpointChange` event (`detail: { all, current, previous, isGrowing }`) to every element with a `data-use-rsp` attribute;
  - sets on these elements the properties declared in their `data-rsp` attribute (a JSON string) for the current breakpoint (or the closest smaller breakpoint that has some). Unknown labels are ignored with a warning; the initial values of the changing properties are kept for the smallest breakpoint. Initialised elements get a `data-rsp-init` attribute.
  - Without breakpoints (theme stylesheet not loaded, no `breakpoints` attribute), it logs a warning and does nothing.

```html
<ds-rsp></ds-rsp>
<ds-grid cols="5">
  <ds-grid-item width="1" data-use-rsp data-rsp='{"sm": {"width": 3}, "lg": {"width": 5}}'>…</ds-grid-item>
</ds-grid>
```

### Page stylesheets

Create `scss/pages/<page>.scss` and start it with `@import '../pages.scss';` to get the variables and tools. While `npm run serve:theme` runs, each change compiles it to `dist/css/pages/<page>.css`. There is no one-shot build for page stylesheets yet.

## Using the components

### Script tags

After `npm run build:all`, serve the files and load the theme and the browser build:

```html
<link rel="stylesheet" href="/dist/css/style.css" />
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

Add `dot-stash/dist/css/style.css` to the page with your usual CSS pipeline.

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
import type { Breakpoint, Breakpoints, RawBreakpoint, SassStyles, DsComponentContextType } from 'dot-stash';

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

`npm test` runs them once, `npm run test.watch` on every change. Spec files are not part of the build output (`dist/`, `www/`, `loader/`). End-to-end tests (`*.e2e.ts`, `npm run test:e2e`) need Puppeteer's Chromium, so `npm ci` must run without `PUPPETEER_SKIP_DOWNLOAD`.

## Archived code

Code removed from the development branch is kept unchanged on two archive branches, `archive/propal` and `archive/external-integrations`. See [docs/propal-archive.md](docs/propal-archive.md) for their content and how to read or restore files from them.

## License

MIT, see [LICENSE](LICENSE).
