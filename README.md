# dot-stash

A standalone UI library made of two parts:

- **Web components**: generic `ds-*` custom elements built with Stencil. They render in the light DOM (no shadow DOM) and use plain class names (`ds-block`, `ds-block__body`, `--modifier`), so a regular page stylesheet can style them.
- **SCSS theming toolkit**: an engine (design tokens, functions and mixins) and a theme built on it, `default`, neutral, compiled by a small Node script (`scripts/build-css.mjs`) into one global stylesheet (`dist/css/default.css`) that skins the components and the page. A project gets its own look by configuring the engine in a theme of its own (see [Creating a theme](#creating-a-theme)).

Each component keeps its structure in its own stylesheet (`styleUrl`), which Stencil injects into the document, and gets its look from the theme stylesheet, through a few component custom properties (`--ds-tooltip-background`, `--ds-sidebar-width`…): see [Styling a component](#styling-a-component).

This README describes the current state of the library (version 0.1.0). What changed since the original code, with the breaking changes and what to do, is in the [changelog](CHANGELOG.md). The remaining work, split into small tasks, is in [docs/backlog.md](docs/backlog.md) (in French).

## Requirements

- Node.js 22 or later (`.nvmrc`, `package.json` `engines`): `@stencil/sass` requires it, and the build scripts use its recursive `fs.watch` (Linux, macOS, Windows); 22.12 or later for the tests (Vitest)
- npm (the lockfile installs with npm 10 and 11; adding a test dependency with npm 10 can fail on the optional peer dependencies of Vitest, which npm 11 resolves)
- for the browser tests: the Chromium of Playwright (`npx playwright install chromium`), see [Tests](#tests)

## Install

The library is used from its repository: clone it, install its dependencies and build it.

```sh
git clone https://github.com/jezoock/dot-stash.git
cd dot-stash
npm ci
npm run build:all
```

The build writes `dist/` and `loader/` (see [Build output](#build-output)), which are not committed. A project then takes the library from the clone, as a local path dependency or as built files: see [In another project](#in-another-project).

## Browser support

The minimum versions below come from the compatibility data of MDN (`@mdn/browser-compat-data` 8.1.7) for each CSS and JavaScript feature the components and the `default` theme use, not from tests: only Chromium is tested automatically so far (the browser tests, in CI). Firefox, Safari and the screen readers are not verified yet, which is why the version stays 0.x.

| Browser                 | Every component works | Nothing degrades |
| ----------------------- | --------------------- | ---------------- |
| Chrome, Edge (Chromium) | 105                   | 107              |
| Firefox                 | 121                   | 121              |
| Safari (macOS and iOS)  | 16.4                  | 17.4             |

The features that set these versions (first version of each browser; the other features the code uses are older):

| Feature                                                                                                                    | What needs it                                                                                                                                                                                 | Chrome, Edge   | Firefox | Safari         |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------------- |
| `:has()`                                                                                                                   | the focus ring around the box of `ds-select` (its native select is transparent) and its disabled look; the empty parts of `ds-heading` and `ds-block` hidden; `ds-panel-group` tabs that fade | 105            | 121     | 15.4           |
| Form-associated custom elements (`attachInternals()`, `ElementInternals`: `setFormValue()`, `setValidity()`)               | `ds-toggle`, `ds-toggle-group`, `ds-combo`                                                                                                                                                    | 77             | 98      | 16.4           |
| Media queries, range syntax (`(width < 992px)`)                                                                            | `break-p()` (below a breakpoint), the `responsive` helpers (`isMobile()`, `widthQuery()`…), `ds-rsp`, the mode of `ds-nav-item`, the compact `ds-pagination`                                  | 104            | 102     | 16.4           |
| `inert`                                                                                                                    | the hidden parts: `ds-sidebar`, a collapsed `ds-panel`, the slides out of view of `ds-slider`, a hidden `ds-back-to-top`                                                                      | 102            | 112     | 15.5           |
| `grid-template-rows` transition                                                                                            | the expand and collapse of a collapsible `ds-panel`                                                                                                                                           | 107            | 66      | 16             |
| `checkVisibility()`                                                                                                        | the focus helpers: what can take the focus, leaving out the elements hidden by CSS                                                                                                            | 105            | 106     | 17.4           |
| Custom states (`ElementInternals.states`, `:state()`)                                                                      | `:state(user-invalid)` in a page stylesheet (not in the columns above: the library styles the `--invalid` class)                                                                              | 125            | 126     | 17.4           |
| `:focus-visible`, `aspect-ratio`, `:is()`, `:where()`, `:not()` with a list, logical properties, `gap` in flexbox, `inset` | the focus indicator, `ds-grid` ratios, the skins, right to left                                                                                                                               | 88             | 89      | 15.4           |
| Masks (`mask-image`, with `-webkit-mask-image`)                                                                            | the icons                                                                                                                                                                                     | 1 (`-webkit-`) | 53      | 4 (`-webkit-`) |

The components also need ES modules and `import()` (Stencil's loader), `Intl.PluralRules` (the plural texts), `matchMedia()` with its `change` event and `MutationObserver`: older than the versions above.

**What degrades** between the two columns (every component works; a detail differs):

- Chrome and Edge 105 and 106: a collapsible `ds-panel` expands and collapses at once, without its transition (`panelShown` and `panelHidden` come once its duration is over). In 105, the icons take the fallback of `forced-color-adjust: preserve-parent-color` (106), `none`, which keeps them visible in forced colors.
- Safari 16.4 to 17.3: without `checkVisibility()`, the focus helpers count as focusable the elements hidden by CSS (`display: none`, `visibility: hidden`; those hidden with `hidden` or `inert` are left out): the focus moved into a `ds-modal` or a `ds-sidebar`, the Tab trap of a modal, the element a `ds-tooltip` describes and the focus after the dismiss of a `ds-alert` may pick such an element, which cannot take the focus.

**Other differences**, whatever the version:

- `:state(user-invalid)`, for a page stylesheet, needs Chrome and Edge 125, Firefox 126, Safari 17.4: before, the components set no custom state (the library catches the error of the former syntax of Chrome and Edge 90 to 124), and the `--invalid` class and `aria-invalid` tell the same.
- `forced-color-adjust: preserve-parent-color` is Chromium's (106): the other browsers take its fallback, `none`, which keeps the icons visible in forced colors too (Firefox has forced colors from 89; Safari has no forced colors mode).
- `overscroll-behavior: contain` (`ds-modal`, `ds-sidebar`) has no effect while their content does not overflow (before Chrome and Edge 144 and Firefox 150, and in Safari): the page scrolls under them.

**Below the minimum**: without `ElementInternals` (Safari before 16.4, Firefox before 98), `ds-toggle`, `ds-toggle-group` and `ds-combo` fail in their constructor and do not render. Without `:has()` (Firefox before 121, Chrome before 105), a `ds-select` shows no keyboard focus and loses its disabled look (the selector list that holds `:has()` is dropped whole), and the empty parts of `ds-heading` keep their space. Without the range syntax, the rules and the JavaScript below a breakpoint never match (`isMobile()` is false, `ds-nav-item` never collapses).

## npm scripts

| Script                 | What it does                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm start`            | Development: the CSS watcher and the Stencil dev server, in one terminal (`scripts/dev.mjs`, see [Tooling](#tooling)). Serves `www/` (page `components/index.html`) on `http://localhost:3333/`.                                           |
| `npm run build`        | Stencil production build: the package in `dist/` and `loader/`, the dev page in `www/`. Also regenerates `components/components.d.ts` and the component `readme.md` files.                                                                 |
| `npm run build:css`    | Compiles every theme and its page stylesheets into `dist/css/` (`scripts/build-css.mjs`, see [Tooling](#tooling)).                                                                                                                         |
| `npm run build:icons`  | Generates the icon map of the engine, `scss/engine/variables/_icons.scss`, from the SVG files of `scss/engine/icons/` (`scripts/build-icons.mjs`, see [Icons](#icons)); `-- --check` writes nothing and fails when the map is out of date. |
| `npm run build:all`    | Runs `clean`, `build:css`, then `build`.                                                                                                                                                                                                   |
| `npm run clean`        | Deletes `dist/`, `www/`, `.stencil/` and `loader/`.                                                                                                                                                                                        |
| `npm test`             | Unit tests: the spec files (`*.spec.ts`, `*.spec.tsx`) with Vitest, the `unit` and `styles` projects of `vitest.config.mts`, without a browser and without a build. See [Tests](#tests).                                                   |
| `npm run test:watch`   | Same as `npm test`, in watch mode.                                                                                                                                                                                                         |
| `npm run test:browser` | Browser tests: the `*.browser.ts` files in Chromium (Vitest browser mode, Playwright), on the build: run `npm run build:all` first. See [Tests](#tests).                                                                                   |
| `npm run generate`     | Stencil component generator (interactive).                                                                                                                                                                                                 |
| `npm run lint`         | ESLint on the repository: the components, the scripts and the configuration files (`eslint.config.mjs`: ESLint recommended + typescript-eslint recommended rules).                                                                         |
| `npm run lint:fix`     | Same as `lint`, applying automatic fixes.                                                                                                                                                                                                  |
| `npm run lint:css`     | Stylelint on the `.scss` files of `scss/` and `components/` (`stylelint.config.mjs`, see [Tooling](#tooling)).                                                                                                                             |
| `npm run typecheck`    | `tsc --noEmit`: type-checks the components and the tests (`tsconfig.json`; the build only compiles the components, `tsconfig.build.json`).                                                                                                 |
| `npm run format`       | Prettier on the `ts`, `tsx`, `js`, `mjs`, `mts`, `scss`, `json`, `html`, `yml`, `yaml` and `md` files (`.prettierignore` excludes build output and generated files, including the component `readme.md` files).                            |
| `npm run format:check` | Checks the same files without writing.                                                                                                                                                                                                     |

## Tooling

The build uses Stencil for the components and the `sass` package for the theme stylesheets, run by two Node scripts, without a task runner:

- **`scripts/build-css.mjs`** (`npm run build:css`) compiles the themes listed in `dot-stash.config.mjs`: it deletes `dist/css/`, copies the licence texts of the icons there (`dist/css/LICENSE-icons.txt`, see [Icons](#icons)), then compiles each `scss/themes/<theme>/index.scss` to `dist/css/<theme>.css` and each page stylesheet, `scss/themes/<theme>/pages/<page>.scss` (not the `_partials`), to `dist/css/pages/<theme>/<page>.css`, compressed. It prints the Sass warnings; a Sass error fails the build (exit code 1). Options, after `--` (`npm run build:css -- --watch`):
  - `--watch`: after the build, recompiles on each change in `scss/`: a file of the engine, every theme and its pages; a file of a theme, that theme and its pages; a page stylesheet, that page (deleted, its stylesheet too). A Sass error is printed, the last stylesheet that compiled stays, and the watch goes on.
  - `--strict`: a Sass warning fails the compilation, as an error.
  - `--source-map`: writes a source map, `<stylesheet>.css.map`, next to each stylesheet, with the SCSS sources in it.
- **`scripts/build-icons.mjs`** (`npm run build:icons`) generates `scss/engine/variables/_icons.scss`, the `$icons` map of the engine, from the SVG files and `icons.json` of `scss/engine/icons/`: each icon as an SVG data URI (see [Icons](#icons)). The generated file is committed; with `--check`, the script writes nothing and exits with code 1 when the file is not the one it generates (CI, and `npm test`).
- **`scripts/dev.mjs`** (`npm start`) runs `build-css.mjs --watch` and, once the stylesheets are compiled, the Stencil dev server (`stencil build --dev --watch --serve`), in one terminal; Ctrl+C stops both, and when one of them stops, the other is stopped too. The dev server serves `www/`, with the dev page `components/index.html`: add `ds-*` markup there to try the components. The Stencil build copies `dist/css/` to `www/css/`, and watches `dist/css/` (`watchExternalDirs` in `stencil.config.ts`): a stylesheet the watcher recompiles makes a rebuild, which copies it, and the page reloads. A change of a component reloads it as before (Stencil's hot module replacement).
- **`dot-stash.config.mjs`** is the configuration of the stylesheet build: `themes` (the folders of `scss/themes/` to compile), `paths` (`scss`, the sources; `css`, the output, `dist/css`) and `css` (`style`, `compressed` or `expanded`; `sourceMap`).
- **Stylelint** (`npm run lint:css`, `stylelint.config.mjs`) checks the SCSS with the standard SCSS configuration (`stylelint-config-standard-scss`), adapted to the conventions of the project, each change explained in the configuration: the class names `ds-<block>__<element>--<modifier>` and `--<modifier>`, the custom properties `--ds-…`, the blank lines that group the lines of a block, the explicit `== null` tests of the engine, the values the compiled theme writes as they are (six-digit colors, font names), and the `-webkit-mask-*` properties of the icons (Chrome before 120 needs them). Prettier formats the files (Stylelint has no formatting rule left).
- **TypeScript** (`typescript`, `~5.8.3`) is the version Stencil 4.45 compiles with (it bundles its own copy): typescript-eslint and the editors use this one. `tsconfig.json` covers the components and the tests (`components/`, `test/`), with the module resolution of Vite (`bundler`): the editors and `npm run typecheck` (`tsc --noEmit`) use it. The Stencil build uses `tsconfig.build.json` (`tsconfig` in `stencil.config.ts`): the same options, the module resolution of the build (`node`), and only the components, without the test files (`*.spec.ts(x)`, `*.browser.ts`): the build compiles every file of its program, and would publish the test helpers they import.

The dev page only loads the components (`/build/dot-stash.esm.js`) and the `default` theme stylesheet (`/css/default.css`, the copy of `dist/css/default.css`); a page stylesheet is at `/css/pages/<theme>/<page>.css`. The former demo (the `ds-main` component, the theme switcher and the runtime color control of the dev pages) is archived on `archive/propal` (see [Archived code](#archived-code)).

CI (`.github/workflows/ci.yml`, GitHub Actions) runs two jobs on every push and pull request. The first one runs `npm ci`, `build:all` (then checks that the main build outputs exist), `build:icons -- --check` (the icon map is up to date), `format:check`, `lint`, `typecheck`, `lint:css` and `npm test`; the second one, in parallel, `npm ci`, `build:all`, `npx playwright install --with-deps chromium` (the Chromium of the Playwright version of the lockfile) and `npm run test:browser`. Every step is blocking: a build, formatting, lint, type or test error fails the run.

## Project structure

```
components/
  core/            ds-* components, one folder each (.tsx, structural .scss with the documented
                   custom properties, type, enum and constant modules, readme.md: generated, below a
                   hand-written Styling section and, for the components that have roles, keys or
                   labels, an Accessibility section), and its tests: <name>.spec.tsx (unit), <name>.browser.ts
                   (browser)
  utils/           shared TypeScript: utility modules (props, css, dom, ajax, responsive, tokens, env,
                   form, context), the `ds` object grouping them (dot-stash.ts), debounce, throttle,
                   uuid, the internal focus, transition, label and form helpers of the components (focus.ts,
                   transition.ts, labels.ts, form-control.ts), and shared types and enums (interfaces/); their
                   unit tests (<module>.spec.ts) and transition.browser.ts
  sass.spec.ts     the stylesheet tests (npm test)
  index.ts         package entry point
  index.html       dev page served by the Stencil dev server (npm start)
  components.d.ts  component typings, generated by Stencil
scss/
  engine/          generic toolkit, no CSS output of its own (_index.scss forwards everything)
    icons/         the icon set: SVG files of Lucide, icons.json (name → file), LICENSE, README.md
    variables/     token schema with neutral defaults: breakpoints, palette, typography, icons (generated
                   from icons/), spacing
    tools/         functions and mixins: tokens (custom properties), references, colors, typography,
                   icons, spacing, breakpoints, misc
  themes/
    default/       neutral theme: _tokens.scss (the engine defaults), _base.scss, layout/,
                   components/, pages/, index.scss (entry point)
scripts/
  build-css.mjs        theme stylesheet build and watcher (npm run build:css)
  build-icons.mjs      icon map of the engine, generated from scss/engine/icons/ (npm run build:icons)
  dev.mjs              npm start: the CSS watcher and the Stencil dev server
test/
  helpers/             shared helpers of the tests: the unit tests (index.ts) and the browser tests (browser.ts)
  setup/               setup files of the Vitest projects: unit.ts (simulated DOM), browser.ts (Chromium)
dot-stash.config.mjs   stylesheet build configuration: themes, paths, output style, source maps
stencil.config.ts      Stencil configuration (srcDir: components)
tsconfig.json          TypeScript configuration of the editors and of npm run typecheck (components and tests)
tsconfig.build.json    TypeScript configuration of the Stencil build (the components only)
vitest.config.mts      Vitest configuration: the unit, styles and browser projects (npm test, npm run test:browser)
eslint.config.mjs      ESLint configuration (npm run lint)
stylelint.config.mjs   Stylelint configuration (npm run lint:css)
docs/                  project notes: the archives, the backlog (in French)
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
| `dist/css/LICENSE-icons.txt`         | The licence texts of the icons the stylesheets draw (`build:css`, see [Icons](#icons))      |

Stencil runs with `empty: false`, so it does not delete the stylesheets of `build:css` in `dist/css/`. The package (`files` of `package.json`) contains `dist/`, `loader/` and the changelog, with the README, the licence and `package.json`, which npm always adds. The dev page in `www/` gets a copy of `dist/css/` in `www/css/`.

## Theming

The SCSS uses the Sass module system (`@use` and `@forward`, no `@import`) and the built-in modules (`sass:map`, `sass:list`, `sass:string`, `sass:color`): compile it with Dart Sass, the `sass` or `sass-embedded` package, 1.107 or later (the version in `package-lock.json`, which compiles it without any warning). LibSass and `node-sass` do not support it. `scripts/build-css.mjs` compiles the themes with `sass`, Stencil (`@stencil/sass`) the component stylesheets with `sass-embedded`.

It has two layers:

- **The engine** (`scss/engine/`): the token schema, with neutral defaults, and the functions and mixins that read the tokens. It outputs no CSS by itself. `@use '<path to>/scss/engine' as *;` gives the tokens, functions and mixins without a namespace (`ds-color(...)`, `break-p(...)`, `$breakpoints`). Each theme writes the tokens once as CSS custom properties (`--ds-color-primary-base`…), and the skins read them with `var()`: see [Design tokens as custom properties](#design-tokens-as-custom-properties).
- **Themes** (`scss/themes/<theme>/`): a theme configures the engine tokens and writes the CSS (base styles, fonts, component skins). Each one compiles to `dist/css/<theme>.css`. The library has one, `default`: neutral (blue primary, slate secondary, gray scale, system font stacks). Its base styles and skins take their sizes, colors and fonts from the tokens: a project creates its own theme by configuring the engine with its own tokens, from a copy of `default` or on top of it (see [Creating a theme](#creating-a-theme)).

The look of the site the library comes from (gold primary, Montserrat and Mulish, site-specific modifiers and page classes) is the `legacy` theme, archived on the `archive/propal` branch, in `archived/themes/legacy/` (see [Archived code](#archived-code)): an example of a theme that configures the engine and adds tokens of its own.

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

3. Edit the base styles and skins, or add some: each partial starts with `@use '../tokens' as *;` and is loaded by `index.scss`. Keep `@include ds-keyframes();` (once, at the root), and `@include tokens.ds-tokens();` at the end of `index.scss`, after the skins: the custom properties the skins read (the images of the icons they draw included, see [Icons](#icons)), and the breakpoints JavaScript reads (`--ds-bp-labels`, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript)).
4. Add the name to `themes` in `dot-stash.config.mjs`, then run `npm run build:css`: `dist/css/<name>.css`. `npm test` compiles the new theme, fails on any Sass warning, and checks its custom properties, `--ds-bp-labels` included.

The engine can also be configured from outside a theme that does not configure it, before the theme loads it: a project that keeps the `default` skins compiles its own stylesheet, `@use '<path to>/scss/engine' with ($grid-md: 1024); @use '<path to>/scss/themes/default';` (the same configuration as in step 2), and gets them with its tokens.

### Skins read the tokens

The skins take their values from the tokens, so that a theme configures them in one place (`_tokens.scss`) and a page can change them at runtime (see [Changing a token at runtime](#changing-a-token-at-runtime)). In a skin:

- **Colors**: `ds-color(<family>, <shade>)` or a colorset (`ds-colorset-styles()`), never a hex value, `rgb()` or a color keyword (`transparent` aside). A color the palette lacks is added to the `$colors` of the theme, in a family and shade named after its role, not after its value: two colors with the same value are different tokens when their roles differ. Shadows and veils are colors too (`rgba()` values, such as `shadow` `base`). One exception: the placeholder of `ds-thumb`, `hsl()` of a hue the component computes from its label and of a saturation and a lightness of its custom properties. Color math (`color.change()`) takes the `-value` accessors and does not follow the tokens at runtime: prefer a token.
- **Font families**: `ds-font-family(<type>, <variant>)` (font styles) or `ds-token(font-family, <name>)`, never a font name.
- **Icons**: `@include ds-icon(<name>)`, an icon of `$icons` (see [Icons](#icons)), never an image file or a font.
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
- `_icons.scss` (generated by `npm run build:icons` from `scss/engine/icons/`): `$icons`, the icon names mapped to their SVG images, data URIs (`url("data:image/svg+xml,…")`); a configured `$icons` is merged into them (see [Icons](#icons)). `$icons-notice`, the licence notice of the icon set.
- `_breakpoints.scss`: `$grid-xxs` to `$grid-xxl`, and `$breakpoints`, minimum widths in px (`xxs` 360, `xs` 576, `sm` 768, `md` 992, `lg` 1200, `xl` 1400, `xxl` 1600).
- `_spacing.scss`: `$spacings`, steps `0` to `8` (`0` to `4rem`), and `$radii` (`none`, `sm`, `md`, `lg`, `pill`, `circle`).
- `_focus.scss`: `$focus`, the focus indicator: `color` (a reference to the primary base color), `width` (`2px`), `style` (`solid`), `offset` (`2px`, the space between the element and its outline). See [Accessibility](#accessibility).

### Functions and mixins (`scss/engine/tools/`)

The accessors of the tokens return their custom property, `var(--ds-…)` (see [Design tokens as custom properties](#design-tokens-as-custom-properties)); each one has a `-value` variant that returns the Sass value, for computations.

- Tokens: `@include ds-tokens($groups...)` writes the custom properties. `ds-token($group, $keys...)` returns the custom property of any token (`ds-token(font-size, 100)` → `var(--ds-font-size-100)`), `ds-token-value()` its Sass value, `ds-token-name()` its name (`--ds-font-size-100`), `ds-has-token()` whether it exists and has a value. `ds-ref($group, $keys...)` makes a reference to a token, in a token map.
- Colors: `ds-color($type, $variant: base)`, `ds-colorset-text()`, `ds-colorset-border()`, `ds-colorset-background()`, `ds-colorset-style($prop, $type, $variant)`, and `@include ds-colorset-styles($type, $variant)` for all three properties. `gradient($name, $attr)` and `@include gradient($name, $orientation)` read `$gradients`.
- Typography: `ds-font-style($prop, $type, $variant)`, `ds-font-family()`, `ds-font-size()`, `ds-font-weight()`, `ds-font-decoration()` (`$type`, `$variant`), and `@include ds-font-styles($type, $variant)` for the family, size, weight and decoration.
- Icons (see [Icons](#icons)): `@include ds-icon($name, $display: inline-block, $alt)` draws an icon in a pseudo-element, a box of 1em in the color of the text; `@include ds-icon-content($name, $alt)` the image only, in a rule that changes the icon of a box (a name that is not in `$icons` is an error; `null`, no image). `$alt` is the alternative text of the icon for assistive technologies (`content: "" / <alt>`, after `content: ""` for the browsers without that syntax): `$alt: ''` for a decorative icon (the chevron of `ds-panel`, the spinner of `ds-ajax`). `@include ds-icon-tokens()` writes the images of the icons a stylesheet drew (`ds-tokens()` writes them with the tokens), `ds-icon-property($name)` returns the name of the custom property of an icon (`--ds-icons-plus`).
- Spacing: `ds-spacing($step)`, `ds-radius($name)`.
- Focus: `ds-focus($prop)` (`ds-focus(color)` → `var(--ds-focus-color)`), and `@include ds-focus-ring()`, the outline drawn from the focus tokens (the base styles of a theme write it for `:focus-visible`).
- Breakpoints: `@include break-p($min, $max)` writes a media query from `$breakpoints`: `(min-width: <$min>)` from `$min`, `(width < <$max>)` below `$max` (the range syntax of Media Queries level 4), or both (`break-p(sm, md)`: `(min-width: 768px) and (width < 992px)`); two ranges that meet leave no gap, at the fractional widths of a zoomed page too (`max-width: 991px` and `min-width: 992px` both fail at 991.5 px); an unknown label, or none, is an error (below the first breakpoint: `break-p(null, <first label>)`). `ds-breakpoint($label)` returns the width of a breakpoint in px (a Sass value: media queries cannot read custom properties). JavaScript reads them from the custom properties, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript).
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
    @include ds-icon(right-open);
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
| `icons`       | `$icons`         | `--ds-icons-<name>`: the icons the stylesheet draws (see [Icons](#icons))   | `--ds-icons-plus: url("data:image/svg+xml,…")`                         |

`default` writes 217 custom properties on `:root`: 180 tokens and the images of the 37 icons its skins draw (the component custom properties are on the component elements, see [Styling a component](#styling-a-component)). A token whose value is `null` is not written, nor a reference to a token that does not exist or has no value. Of `$icons`, only the icons a skin draws are written (`ds-tokens()` with all the groups, after the skins), followed by the licence notice of the icon set, a `/*! … */` comment that the compressed output keeps.

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

### Icons

The icons are SVG images of [Lucide](https://lucide.dev) 1.60.0 (ISC License), an open-licence icon set, copied into the repository (`scss/engine/icons/`, with the licence of the set and a README) and compiled into the stylesheets as data URIs: no font, no image file, no request, no service and no runtime dependency.

- **The map**: `$icons` (`scss/engine/variables/_icons.scss`) maps 101 names to their SVG images: those of the former `ds-icons` font (`basket`, `ok`, `cancel`, `angle-down`, `plus`, `heart`, `heart-empty`…), then the icons added since (`ok-circle`, a check in a circle; `spinner`, an open circle that turns; `ellipsis`, three dots in a row). `npm run build:icons` (`scripts/build-icons.mjs`) generates it from the SVG files and `icons.json` of `scss/engine/icons/`, which maps each name to a Lucide icon or to a variant of it (filled, rotated, smaller). The names, their Lucide icons and the approximate ones are listed in [scss/engine/icons/README.md](scss/engine/icons/README.md#the-icons). `npm test` and CI fail when the generated file is out of date.
- **Drawing**: `@include ds-icon(<name>)`, in a pseudo-element, draws a box of 1em × 1em (an inline block by default, its bottom 0.125em below the baseline as a glyph of an icon font; `flex-shrink: 0`), painted in the color of the text (`background-color: currentColor`) through the image of the icon (`mask-image`, and `-webkit-mask-image` for Chrome before 120). Its size is the font size of the element and its color the text color: `font-size` and `color` change them, and a transform turns it (the chevron of an open `ds-panel` or `ds-combo`). `ds-icon-content(<name>)` changes the icon of a box, in the rule of a state (the minus of an open `ds-nav-item`). The box of `ds-icon` is the `::before` of the element, a block of 1em: see [`ds-icon`](components/core/icon/readme.md) for its types and their icons.
- **Custom properties**: the image of an icon is a custom property, `--ds-icons-<name>: url(…)`, that the mixins read with `var()`. A stylesheet writes those of the icons it draws, once each: `ds-tokens()`, at the end of the `index.scss` of a theme, writes the icons its skins drew before it (37 in `default`), so that an icon no skin draws costs nothing; a page stylesheet that draws icons ends with `@include ds-icon-tokens();` (see [Page stylesheets](#page-stylesheets)). The prefix is `--ds-icons-`: the `--ds-icon-…` properties belong to the `ds-icon` component (`--ds-icon-size`).
- **Replacing or adding an icon**: in CSS, after the theme stylesheet, give the property of an icon another image, a data URI or an absolute URL (`:root { --ds-icons-plus: url("data:image/svg+xml,…"); }`): every `plus` of the theme follows. In Sass, configure `$icons`: unlike the other maps, a configured `$icons` is merged into the icons of the engine, adds the icons it names and replaces those of the same name (`@forward '../../engine' with ($icons: (plus: url('data:…'), sparkle: url('data:…')));`, then `@include ds-icon(sparkle)`). To add an icon of the icon set to the engine: [scss/engine/icons/README.md](scss/engine/icons/README.md#adding-an-icon).
- **Forced colors**: in a high contrast theme of the system (`forced-colors: active`), the browser replaces the colors of the page with the system colors, and would paint the box of an icon with the background of the page. The boxes keep their background (`forced-color-adjust: preserve-parent-color`, after `none` for the browsers without that value) and take the color their parent is given (`color: inherit`): CanvasText in a text, LinkText in a link, ButtonText in a button.
- **Right to left**: the icons are not mirrored, and the theme draws its arrows in the physical directions (`arrow-right` points to the right, the chevron of `ds-panel` is on the right), as before, but for the arrows of the navigation components, which point to the next level and to the previous and next pages: the chevrons of `ds-breadcrumb` and the arrows of `ds-pagination` are mirrored (`transform: scaleX(-1)`) on a page or in an element with `dir="rtl"`. The theme reads the `dir` attribute of an ancestor (`[dir='rtl'] .ds-pagination__control…`), as `:dir(rtl)` needs Chrome 120: an element with `dir="ltr"` in a right-to-left page has its arrows mirrored too (a rule of the page with `transform: none` sets them back). A skin that turns one of these arrows writes the mirror in the same `transform` (`rotate(90deg) scaleX(-1)`): a second `transform` replaces the first.
- **Licence**: the stylesheets keep the licence notice of the icon set, a `/*! Icons: Lucide 1.60.0 … ISC License … Licence texts: dist/css/LICENSE-icons.txt of the dot-stash package. */` comment written after the custom properties of the icons (`$icons-notice`). The licence texts (ISC License; the icons derived from Feather: MIT License) are in `scss/engine/icons/LICENSE`, which `npm run build:css` copies next to the stylesheets, to `dist/css/LICENSE-icons.txt`: the package, which holds `dist/` and `loader/` (and no `scss/`), ships them with the stylesheets (`npm pack --dry-run` lists the file). A project that serves the stylesheets, or compiles a theme of its own with the engine, keeps that file with them.
- **Size**: `dist/css/default.css` is about 74 KB (10.5 KB gzipped); the images of its 37 icons are 12 KB of it. Writing the 101 icons would make it 98 KB (13.5 KB gzipped), and the images in each rule instead of custom properties 93 KB (11 KB). The growth of the stylesheet with the skins is in the [changelog](CHANGELOG.md).

### Page stylesheets

A page stylesheet belongs to a theme: create `scss/themes/<theme>/pages/<page>.scss` and start it with `@use '../tokens' as *;` to get the tokens, functions and mixins of the theme. As the engine outputs no CSS, the compiled file only holds the rules of the page; a page that draws icons ends with `@include ds-icon-tokens();`, which writes their images (see [Icons](#icons)). `npm run build:css` compiles it to `dist/css/pages/<theme>/<page>.css`, and the watcher of `npm start` on each change; load it after the theme stylesheet. Partials (`_*.scss`) are not compiled.

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
- `responsive.processBreakpoints()` turns them into ranges with the mobile-first semantics of `break-p`: each label starts at its value and ends at the next value - 1, the first label also covers the smaller widths (it starts at 0) and the last one has no maximum. With the theme map: `xxs` 0–575, `xs` 576–767, `sm` 768–991, `md` 992–1199, `lg` 1200–1399, `xl` 1400–1599, `xxl` 1600 and up. At a fractional width, a label ends below the next value: 575.5 px is `xxs`. `responsive.getBreakpoint()` returns the label and limits (`[min, max]`, or `[min]` for the last label) for a width; without a width, the breakpoint of the viewport, from the media queries of the minimums (below).

JavaScript tests the viewport with the media queries of the theme, `matchMedia()`, rather than with `window.innerWidth`: the browser evaluates them at the exact width of the viewport, fractional when the page is zoomed (991.8 px, which `innerWidth` rounds to 992), as it evaluates the media queries of the theme stylesheet, and a `MediaQueryList` tells when its state changes (its `change` event), at once, without listening to `resize`. The media queries are those of `break-p()`: `(min-width: 768px)` from a breakpoint, `(width < 992px)` below one. Without `matchMedia()` (a server, a test environment), the helpers compare `window.innerWidth`.

- `responsive.isMobile()`, `isTablet()` and `isDesktop()` evaluate the media queries of the `sm` and `md` breakpoints of the theme (`--ds-bp-sm`, `--ds-bp-md`): mobile below `sm`, `(width < 768px)`, tablet from `sm` to below `md`, desktop from `md`, `(min-width: 992px)`. Without the theme, 768 and 992 px.
- The helpers they use, for components and pages:
  - `widthQuery(min?, max?)`: the media query of the widths from `min` px (included) to `max` px (excluded): `(min-width: 768px)`, `(width < 992px)`, `(min-width: 768px) and (width < 992px)`; a breakpoint `[min, max]` of `processBreakpoints()` is `widthQuery(min, max + 1)`. `matchesWidth(min?, max?)` evaluates it.
  - `watchMedia(query, listener)`: calls `listener(matches)` each time a media query starts or stops matching; returns `{ matches, stop() }`.
  - `watchBreakpoint(breakpoints, listener)`: one media query per boundary (the minimum of each breakpoint but the first: `(min-width: 576px)`…), `listener(breakpoint)` called once when the breakpoint changes, never within a breakpoint; returns `{ current, stop() }`. `<ds-rsp>` uses it.
  - `watchThemeBreakpoint(label, fallback, listener)`: from a theme breakpoint on (`--ds-bp-<label>`, `fallback` px without the theme), read again when a stylesheet `<link>` loads; returns `{ matches, width, stop() }`. `ds-nav-item` uses it for `md`, `ds-pagination` for its compact layout (below `sm`).
  - `isSameBreakpoint(a, b)` (same label and limits) and `isStylesheetLoad(event)` (the `load` event of a stylesheet `<link>`).
- `<ds-rsp>` reads the breakpoints with `tokens.getBreakpoints()` (or takes them from its `breakpoints` attribute, label: minimum width in px: `breakpoints='{"sm": 0, "lg": 992}'`), watches one media query per boundary (`watchBreakpoint()`: `(min-width: 576px)`, `(min-width: 768px)`…), and when it starts and each time the breakpoint changes (at once, when the viewport crosses a boundary; once, when it crosses several; never while it is resized within a breakpoint):
  - dispatches a `breakpointChange` event (`detail: { all, current, previous, isGrowing }`, type `BreakpointChangeDetail`) on every element with a `data-use-rsp` attribute. This event does not bubble;
  - sets on these elements the properties declared in their `data-rsp` attribute (a JSON string) for the current breakpoint (or the closest smaller breakpoint that has some). Unknown labels are ignored with a warning; the initial values of the changing properties are kept for the smallest breakpoint. They are read from the element's property (a camelCase property such as `hGap` included), else from its attribute (`h-gap`). Initialised elements get a `data-rsp-init` attribute;
  - then emits the same `breakpointChange` event from `<ds-rsp>` itself. This one bubbles: listen to it on `<ds-rsp>` or on `document`. A subscriber that contains `<ds-rsp>` receives both events and should only handle the one whose `target` is itself.
  - Elements subscribed after it started, with its `subscribe(element)` method, or inserted in the document (or given a `data-use-rsp` attribute) and matching `subscriber-selector`, get the params of the current breakpoint at once. Insertions are detected with a `MutationObserver`.
  - Without breakpoints (theme stylesheet not loaded, no `breakpoints` attribute), it logs one warning and tracks nothing: no media query, no event, the subscribers wait. New breakpoints (`refresh()`, a new `breakpoints` value) replace the media queries with those of their boundaries; leaving the document removes their listeners.
  - Its `refresh()` method reads the breakpoints again (from the `breakpoints` attribute, else from the theme) and applies them: it subscribes the matching elements that are not subscribed yet, sets the params of the current breakpoint on every subscriber again, and emits `breakpointChange` only when the label or the limits of the current breakpoint changed (`previous` is then the former breakpoint, `undefined` when it starts). Without breakpoints until then (theme stylesheet loaded after `<ds-rsp>`), it starts, as when the theme is there at load. When it finds none (theme stylesheet removed, or being replaced), it keeps the current ones and logs a warning, once until it finds some again. A new `breakpoints` attribute value is applied the same way.
  - `<ds-rsp>` calls `refresh()` by itself when a stylesheet `<link>` of the document loads (it listens to `load` on the document, in the capture phase): a theme stylesheet added after it, or a theme switched by changing the `href` of its `<link>`. Call `refresh()` when the theme changes otherwise: a `<style>` element, a constructed stylesheet (`adoptedStyleSheets`), a `media` attribute changed after the load (`media="print" onload="this.media='all'"`), custom properties set from JavaScript.

```html
<ds-rsp></ds-rsp>
<ds-grid cols="2" data-rsp='{"md": {"cols": 5}}'>
  <ds-grid-item width="1" data-use-rsp data-rsp='{"sm": {"width": 2}, "lg": {"width": 5}}'>…</ds-grid-item>
</ds-grid>
```

```js
const rsp = document.querySelector('ds-rsp');
document.head.append(Object.assign(document.createElement('style'), { textContent: themeCss }));
await rsp.refresh();
```

## Using the components

### In another project

The package is not published to a registry: a project takes it from a clone of the repository, built with `npm ci` and `npm run build:all` (see [Install](#install)), in one of two ways.

- **A local path dependency**: in the project, `npm install ../dot-stash` (the path of the clone), which writes `"dot-stash": "file:../dot-stash"` in its `package.json` and links `node_modules/dot-stash` to the clone. The project imports the loader, the utilities (with their types) and the theme stylesheet from `dot-stash`: see [From the package](#from-the-package). After a `git pull` in the clone, `npm run build:all` there gives the project the new build. A tarball made by `npm pack` in the clone (`dot-stash-0.1.0.tgz`, the files of `files` only) installs the same way, as a copy: `npm install ../dot-stash/dot-stash-0.1.0.tgz`.
- **The built files**: copy `dist/dot-stash/` (the browser build, which loads the code of each component from its own folder) and `dist/css/<theme>.css` (with `dist/css/LICENSE-icons.txt`, the licence texts of its icons) to the static files of the site, and load them with a script tag and a stylesheet link: see [Script tags](#script-tags).

A git dependency (`npm install github:jezoock/dot-stash`, or a git URL in `package.json`) does not work: it installs the files of the repository, and `dist/` and `loader/`, built and not committed, are not among them (the package has no `prepare` script that would build them on install), so the imports of `dot-stash` and `dot-stash/loader` and the stylesheets are missing. Use a built clone.

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

In a project that has the package as a dependency (a local path, see [In another project](#in-another-project)), register the components with the loader, from the code the bundler of the project builds:

```js
import { defineCustomElements } from 'dot-stash/loader';

defineCustomElements();
```

Add a theme stylesheet, `dot-stash/dist/css/<theme>.css`, to the page with your usual CSS pipeline, or compile your own theme (see [Creating a theme](#creating-a-theme)). Without a bundler, an import map gives the browser the files of the entry points (`node_modules/` served by the site):

```html
<link rel="stylesheet" href="/node_modules/dot-stash/dist/css/default.css" />
<script type="importmap">
  { "imports": { "dot-stash/loader": "/node_modules/dot-stash/loader/index.js", "dot-stash": "/node_modules/dot-stash/dist/index.js" } }
</script>
<script type="module">
  import { defineCustomElements } from 'dot-stash/loader';
  import { tokens } from 'dot-stash';

  defineCustomElements();
  console.log(tokens.getToken('color-primary-base')); // '#2563eb', the default theme
</script>
```

The `exports` of `package.json` give these entry points, as ES modules (`import`) or CommonJS (`require`), with their types: `dot-stash` (the utilities, `ds`), `dot-stash/loader` and the files of `dist/` (`dot-stash/dist/css/<theme>.css`, `dot-stash/dist/collection/…`). TypeScript finds the types with the module resolutions `bundler`, `node16` and `nodenext`, and with them the typings of the elements: `document.querySelector('ds-alert')` is an `HTMLDsAlertElement`, with its props and methods (`HTMLElementTagNameMap`), and `JSX.DsAlert` (`import type { JSX } from 'dot-stash'`) the props of the component.

### Components

Each component documents its properties, events, methods, slots and custom properties in the `readme.md` generated next to its source (`components/core/<component>/readme.md`), below a Styling section (see [Styling a component](#styling-a-component)). Among them:

- **`ds-ajax`** ([readme](components/core/ajax/readme.md)): loads the `.ds-ajax-content` of the page of its link, on `click` or on `load`, into itself or a `target`. The target is `aria-busy` while it loads; the loaded content takes the focus of the replaced link, or another target is a polite live region; a failed load shows `error-message` in an alert.
- **`ds-alert`** ([readme](components/core/alert/readme.md)): an inline message of the page (not a toast): `info`, `success`, `warning` or `error` (`type`), with an optional title (`heading`, a heading with `level`, or a `slot="title"` heading of the page), the icon of its type (decorative: a prefix hidden on the screen, `Error:`, tells the type) and an optional dismiss button (`dismissible`: `alertDismiss`, cancelable, then hidden, the focus to the next element, `alertDismissed`). Not a live region by default (a message of the page is read where it is); `live="polite"` (`role="status"`) or `"assertive"` (`role="alert"`) announces an alert a script inserts, shows or fills, its region rendered before its content reaches assistive technologies.
- **`ds-back-to-top`** ([readme](components/core/back-to-top/readme.md)): a "Back to top" link (`<a href="#top">`), fixed in the bottom corner of the end side of the viewport, shown once the page is scrolled past `threshold` (px or `vh`, one screen by default; hidden: `visibility: hidden` and `inert`); it scrolls to the top (smoothly, at once with less motion) and moves the focus to `target` (else the `#top` element, the main landmark, the first heading, the body).
- **`ds-badge`** ([readme](components/core/badge/readme.md)): a small label or count, not interactive, in the color of its `type` (`neutral`, `info`, `success`, `warning`, `error`): a text, a `count` (`99+` above `max`) or a `dot`. `label` gives assistive technologies the text to read instead of the visible one, with the count and its plural (`3 unread messages`, in a link: "Inbox 3 unread messages"). Not a live region.
- **`ds-breadcrumb`** ([readme](components/core/breadcrumb/readme.md)): a breadcrumb trail (WAI-ARIA breadcrumb pattern), enhanced from the list of links the page writes in it (`<ol><li><a href="/">Home</a></li>…</ol>`), which works before the script and which the component never moves: a navigation landmark named by `label` ("Breadcrumb"; not one in a `nav` element or around one), the last item marked `aria-current="page"` when the page marked none, the separators drawn by the theme (not read). A long trail wraps; `collapse` keeps its first and last items and hides the others behind a "Show full path" button (`aria-expanded`), which shows them and moves the focus to the first one.
- **`ds-combo`** ([readme](components/core/combo/readme.md)): a custom select with single or `multiple` selection. Its options are data (an array, or its JSON string in HTML): text options, links (`url`), images (`mode="image"`), disabled options and placeholders (empty `value`). Pre-select options with `selected` (`{ index }`, `{ value }` or `{ name }`) or with the options' `selected` flags; each user selection emits `optionSelected` (`{ name, option, selectedOptions }`). `open()`, `close()` and `toggle()` drive the list; `mode="dropdown"` renders no toggle button, for a list opened by another element. A click outside closes the list. It is a select-only combobox (WAI-ARIA): the toggle button is a `combobox` that keeps the focus, the list a `listbox`; the arrow keys, Home, End, Page Up, Page Down and type-ahead move the active option, Enter and Space select it, Escape closes the list; name it with `label`, `labelledby` or a `<label>`. It is form-associated: it submits the value of its selected options under its `name` (see [Forms](#forms)).
- **`ds-field`** ([readme](components/core/field/readme.md)): a form field around a native control the page writes in it (`input`, `textarea`, `select`, or `ds-select`): a label (`label`, a `<label for>` with the required mark), a hint (`hint` or `slot="hint"`), an error message once the user should see it (the message of the browser, or `messages` per validity flag and `error-message`), a character counter (`counter`, with `maxlength`), a password toggle, a prefix and a suffix, linked to the control (`aria-describedby`). The control stays the form control: see [Fields](#fields-ds-field).
- **`ds-grid`**, **`ds-grid-item`** ([readme](components/core/grid/readme.md)): a grid of `cols` columns, `h-gap` apart (`v-gap` between the rows of a `fixed` grid), laid out by CSS Grid in the component stylesheet: each `ds-grid-item` spans the columns of its `width` (`grid-column: span n`), `v-align` aligns the items in their row, `align` places an incomplete row (at the start, centered or at the end), `cell-ratio` and the `ratio` of an item set the height of the items as a ratio of their width (`aspect-ratio`). The components compute no size: they write their props as custom properties (`--ds-grid-cols`, `--ds-grid-h-gap`, `--ds-grid-v-gap`, `--ds-grid-cell-ratio`, `--ds-grid-span`, `--ds-grid-item-ratio`), and every prop can change per breakpoint with `<ds-rsp>` (`data-rsp`, see [Breakpoints shared with JavaScript](#breakpoints-shared-with-javascript)). `setStyles()` of `ds-grid-item` and its `DSGridItemStyles` type are deprecated: the grid does not call it.
- **`ds-loader`** ([readme](components/core/loader/readme.md)): a loading indicator, a `progressbar` named by `label` ("Loading" by default): a spinner while indeterminate (no `aria-valuenow`), a bar filled to `value` of `max` once determinate (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`); a block or `inline`, `size` `sm`, `md`, `lg`, its label visible with `show-label`. With less motion, the spinner keeps turning, more slowly.
- **`ds-modal`** ([readme](components/core/modal/readme.md)): a modal dialog in a lightbox (`shown`): a backdrop over the page and a centered dialog box, `role="dialog"` with `aria-modal="true"`, named by its `slot="title"` heading or by `label`. Shown, it takes the focus and keeps it (Tab and Shift+Tab stay in the dialog); Escape or a mouse down on the backdrop hides it, and the focus goes back to the element that opened it.
- **`ds-nav`**, **`ds-nav-item`** ([readme](components/core/nav/readme.md)): a navigation landmark (`label`), a list of links whose sub-navigations open with an expand button (WAI-ARIA disclosure navigation: `aria-expanded`, Escape) below `md`, or drop down on hover and focus from `md` (the theme). `is-active` marks the current page (`aria-current="page"`).
- **`ds-pagination`** ([readme](components/core/pagination/readme.md)): a navigation landmark (`label`, "Pagination") with the previous and next controls (and the first and last ones, `first-last`) around a list of pages: the first and last ones (`boundaries`), the current one (`aria-current="page"`) and its `siblings`, a decorative ellipsis for the others; each page named "Page 3". Links to the pages with `href-template` (`?page={page}`: the browser follows them, no script changes the page), else buttons: a cancelable `pageChange`, then `current` changes, and the focus is never lost. On the first and the last page, the previous and next controls are unavailable, not focusable. Compact below `sm` ("Page 3 of 10" between the arrows). `labels` translates its texts.
- **`ds-panel-group`**, **`ds-panel`** ([readme](components/core/panel-group/readme.md)): tabs (`type="tab"`, WAI-ARIA tabs: a tab list named by `label`, the arrow keys, Home and End) or accordion panels (`type="collapsible"`: a button with `aria-expanded` in a heading, `level`). `panelShown` / `panelHidden` are emitted at the end of the transition.
- **`ds-range`** ([readme](components/core/range/readme.md)): enhances a native `<input type="range">` written in it, which stays the slider (its role, its name, its keys, its value, its form): a track filled up to the value (`--ds-range-fill`, a percentage the component sets) and, with `buffer`, up to a second value (the part of a video loaded already, `--ds-range-buffer`). It follows the events of the user, the attributes of the input and a disabled fieldset; `refresh()` after a value set by a script. `labels.valueText` (a template) or `formatter` (a function) give the input its `aria-valuetext`.
- **`ds-sidebar`** ([readme](components/core/sidebar/readme.md)): a fixed panel on the `h-pos` side of the screen (`left` by default, or `right`) and at its `v-pos` edge, a `complementary` landmark named by `label`, not modal. Hidden, it is out of the screen on that side and inert; `show()`, `hide()` and `toggle()` slide it, and `sidebarShown` / `sidebarHidden` are emitted at the end of the slide. `show()` moves the focus into it, Escape hides it, `hide()` gives the focus back.
- **`ds-slider`** ([readme](components/core/slider/readme.md)): a carousel (WAI-ARIA carousel: a region named by `label`, slides named "2 of 5", the slides out of view inert), with previous and next buttons, a menu of dots (`params.menu`) and an automatic rotation (`params.autoplay`) that a button stops and starts, which stops when the focus enters it, pauses on hover and does not start with less motion. `labels` translates its texts.
- **`ds-thumb`** ([readme](components/core/thumb/readme.md)): a thumbnail, an image of fixed proportions (`ratio`: `2/3`, `1`, `16/9`), cropped to fill them, loaded lazily (`loading="lazy"`, `decoding="async"`), its state a class (`--loading`, `--loaded`, `--error`). Without a source, or when it fails, a placeholder: the initials of `label` on a color whose hue comes from the text (`--ds-thumb-hue`) and whose saturation and lightness are the theme's. Named by `alt` (else `label`), the placeholder too; `decorative` leaves it out of the accessibility tree.
- **`ds-toaster`** ([readme](components/core/toaster/readme.md)): toasts in a fixed box (`position`, `messages`, `show()`, `displayToast()`), announced to screen readers by a live region (`status`, or `alert` with `mods="error"`). `displayToast()` hides them after `closing-delay`, a countdown that pauses while the pointer is over them or the focus is in the toaster (WCAG 2.2.1). The themes give the toasts the secondary color, or a status color with the `success`, `warning` or `error` modifier (`mods="success"`).
- **`ds-tooltip`** ([readme](components/core/tooltip/readme.md)): a message (`slot="message"`, `role="tooltip"`) that describes its content (`aria-describedby`), shown on hover and on the keyboard focus, hidden on Escape, and that stays while the pointer is over it.
- **`ds-trigger`** ([readme](components/core/trigger/readme.md)): calls a method of a target element on an event (`target`, `action`, `on`). With `type="button"` it renders the `.ds-button` class, which the theme skins with modifiers (sizes `xs` to `xl`, colors `stl-1` to `stl-3`, `rounded`, `shadow`). When it is the control (on `click`, with no link or button in it), the element is a button: `role="button"`, focusable, clicked by Enter and Space; with a native `<button>` or link in it, that control keeps its semantics and calls the action. It does not submit forms: use a native `<button>` for that, and `ds-trigger` to bind an action to another element.

```html
<ds-combo name="color" options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue"}]' selected='{"value": "blue"}'></ds-combo>
<ds-combo id="menu" mode="dropdown" options='[{"name": "Docs", "value": "docs", "url": "/docs"}]'></ds-combo>
<ds-trigger type="button" mods="sm,stl-2" target="#menu" action="toggle">Menu</ds-trigger>
```

`ds-ajax` draws its own spinner (the `arrows-cw` icon in its `::after`) and its own error message (a `p.ds-message.--error` with `role="alert"`, skinned by the `.ds-message` rules of the theme), not a `ds-loader` and a `ds-alert`.

```html
<ds-alert type="error" heading="Payment failed" level="2" dismissible><p>Your card was declined.</p></ds-alert>
<ds-alert id="save-status" live="polite" type="success" hidden><p></p></ds-alert>
<a href="/inbox">Inbox <ds-badge type="info" count="3" max="99" label="{count} unread messages"></ds-badge></a>
<ds-loader label="Loading the results"></ds-loader>
<ds-back-to-top label="Back to top" target="#main"></ds-back-to-top>
```

```html
<ds-breadcrumb>
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/women">Women</a></li>
    <li><a href="/women/shoes">Shoes</a></li>
  </ol>
</ds-breadcrumb>
<ds-pagination total="12" current="3" href-template="/women/shoes?page={page}"></ds-pagination>
```

### Forms

`ds-toggle`, `ds-toggle-group` and `ds-combo` are form-associated custom elements (`ElementInternals`): in a native `<form>`, they behave as the native controls they stand for, without any native input in them. `ds-select` keeps its native `select`, which is the form control, and `ds-field` enhances a native control the page writes in it (see [Fields](#fields-ds-field)), and `ds-range` a native range input (its value, its form and its validation stay the input's). Every current browser has `ElementInternals`; a browser without it cannot run these components (see [Browser support](#browser-support)).

| Component         | Submits (under its `name`)                                                                                                                                                                                              | Required (`valueMissing`)                                            | Message of the browser (else `required-message`)           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `ds-toggle`       | checked (pressed): its `value`, `on` without one, as a native checkbox or radio; a `switch` and an `icon` toggle as a checkbox                                                                                          | not checked                                                          | that of a required checkbox (a radio: of a required radio) |
| `ds-toggle-group` | nothing itself: each of its toggles submits its own value, under the `name` of the group, as native radios or checkboxes that share a name (`size=m`, `toppings=cheese&toppings=ham`). A value is never submitted twice | no toggle checked (`required` on the group, or on one of its radios) | that of a required radio                                   |
| `ds-combo`        | the value of its selected option; a `multiple` combo, one entry per selected option (`sizes=s&sizes=m`); nothing without a selected option (a placeholder, an empty `value`, is not one)                                | no option selected                                                   | that of a required select                                  |
| `ds-select`       | its native select: the value of the selected option. `ds-select` itself is not form-associated, so that the value is submitted once                                                                                     | the native `required` (`required` prop): a placeholder selected      | the native select's                                        |

- **Labelling**: a `<label for="<id>">` or a `<label>` around the element names it, and a click on the label activates it as for the native control: it toggles a `ds-toggle` (and focuses it), focuses the checked radio (else the first enabled toggle) of a `ds-toggle-group`, focuses the combobox of a `ds-combo` and the native select of a `ds-select`. A `ds-combo` gives the name to its combobox (`aria-labelledby` with the ids of its labels, or the text of a label around it). Precedence, as for the native controls: `aria-labelledby` (`labelledby` on `ds-combo` and `ds-select`), then `label` (`aria-label`), then the `<label>` elements, then the fallbacks of each component (the content of a `ds-toggle`, `custom-label` or `name` of a `ds-combo`).
- **Disabled**: the own `disabled` of the component, a disabled `ds-toggle-group` (for its toggles) or a disabled `<fieldset>` around it disable it: not focusable, no clicks nor keys, `aria-disabled` (the native `disabled` for the selects and the combobox), nothing submitted, not validated, and the `--disabled` class, which the theme dims (`ds-select`: the theme also dims the box when a fieldset disables its select, `:has(> .ds-select__input:disabled)`). The fieldset and the group never change the `disabled` prop of the component.
- **Reset**: a form reset gives back the state of the load: the checked state of a `ds-toggle` (as `defaultChecked`), the selection of a `ds-combo` from `options` and `selected` (as `defaultSelected`); a `ds-toggle-group` follows its toggles; the box of a `ds-select` shows the option its native select selects again. No `toggle`, `toggleValueChange`, `optionSelected` nor `valueChange` event, as no `change` event for a native control.
- **Restore**: when a page comes back from the history without the back/forward cache, the browser gives back the state of `ds-toggle`, `ds-toggle-group` (which checks its toggles again) and `ds-combo` (`formStateRestoreCallback`), without events. Not that of `ds-select`: its native select is rendered after the browser restored the form. And Chromium recognizes a form by the names of its first two named native controls (the form-associated components do not count): when the select of a `ds-select` is one of them, Chromium restores none of the controls of that form; put two named native controls before it (a hidden input will do) when the restore matters. A page restored from the back/forward cache keeps everything.
- **Validation**: `required` makes the form invalid while the control is empty: the form is not submitted, and the browser shows its message at the control (the toggle; the radio Tab reaches in a group, else its first enabled toggle; the combobox), which gets the focus. The message is the browser's own, in its language, read from a native control in the same state; `required-message` replaces it (a text of the page, to translate with it). As on a native control, `validity`, `validationMessage` and `willValidate` (read-only properties), `checkValidity()` and `reportValidity()` (asynchronous, as the methods of every component: `await combo.checkValidity()`; the form's own methods are synchronous and include the components), the `invalid` event, `:invalid` and `:valid`.
- **Invalid state**: `aria-required="true"` on the element that has the role, where the role has that property (a checkbox or a switch, a radio group, the combobox; the native select has its own). `aria-invalid="true"`, the `--invalid` class and the `:state(user-invalid)` custom state once the user should see the error, as `:user-invalid`: after an `invalid` event (a submission, `checkValidity()` or `reportValidity()` of the element or of its form) or after the user made the control empty, until it is valid again or the form is reset. Before that, an empty required control has `aria-invalid="false"`: Chromium would otherwise announce it as invalid from the start, native controls included. The default theme draws the invalid state in the error color, `ds-color(status, error)` (the color of `.ds-message.--error`): the border of a radio, a checkbox, the combobox and the select box, a ring around a switch and a toggle button (`--ds-toggle-invalid-color`, `--ds-combo-invalid-color`, `--ds-select-invalid-color`).
- **Attributes**: as on the native controls, a boolean attribute of a form-associated component is true when it is present, whatever its value (`checked="false"` is checked, `multiple="false"` is multiple): remove the attribute, or set the property to `false`.

```html
<form action="/order">
  <label for="terms">I accept the terms</label>
  <ds-toggle id="terms" type="checkbox" name="terms" value="accepted" required></ds-toggle>

  <label for="size">Size</label>
  <ds-toggle-group id="size" name="size" type="radio" required>
    <ds-toggle value="s" label="Small"></ds-toggle>
    <ds-toggle value="m" label="Medium" checked></ds-toggle>
  </ds-toggle-group>

  <label for="color">Color</label>
  <ds-combo id="color" name="color" required options='[{"name": "Choose a color", "value": ""}, {"name": "Red", "value": "red"}]'></ds-combo>

  <fieldset disabled>
    <legend>Gift wrapping (soon)</legend>
    <ds-toggle name="gift" label="Gift wrapping"></ds-toggle>
  </fieldset>

  <button>Order</button> <button type="reset">Reset</button>
</form>
<!-- Submitted once the terms are accepted and a color chosen: terms=accepted&size=m&color=red -->
```

`ds-trigger` has no `submit` or `reset` type (its `type` is its look): put a native `<button>` in the form for that.

#### Fields (`ds-field`)

`ds-field` enhances a native control the page writes in it, which stays the form control: an `input` (a text box: `text`, `email`, `number`, `tel`, `url`, `search`, `password`; a date or a time: `date`, `time`, `datetime-local`, `month`, `week`), a `textarea`, a `select`, or the native select of a `ds-select`. It is not form-associated: it never creates, moves nor names a form control (Chromium recognizes a form for the restore by its first named controls, see Restore above), and renders no control but the password toggle, a button without a name.

- **What stays native**: the control submits its value under its `name` (`new FormData(form)` gives the same entries with or without the fields), the browser autofills it, validates it (`required`, `type`, `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`, `setCustomValidity()`: a submission stops on the first invalid control, which the browser focuses with its own message) and restores it from the history; its `disabled` (or a disabled `<fieldset>`) and `readonly` are its own (the field shows them, `--disabled`, `--readonly`: it has no `disabled` prop); a form reset gives it its value back.
- **Label**: `label` renders a `<label for>` before the control (which gets an id if it has none), with a required mark while the control is `required` (`*`, `aria-hidden`: the native `required` tells assistive technologies); a `<label>` of the page in the field replaces it, as it is.
- **Hint**: `hint`, or an element with `slot="hint"` (a hint with markup); a `slot="prefix"` or `slot="suffix"` element is a unit or an icon in the box of the control (described when it has a text, hidden without). The field appends its ids to the `aria-describedby` of the control, after those of the page, and removes only its own.
- **Error**: the timing of the form-associated components (Invalid state above): shown after an `invalid` event or once the user changed the value (`change`), as `:user-invalid`, until the control is valid or the form is reset; `aria-invalid` on the control (`"false"` while it is invalid but not shown, `"true"` once shown), the message described by the control, under it, with an icon. Its text: the message of a custom error of the page (`setCustomValidity()`), else `messages` per validity flag (`{"valueMissing": "…", "typeMismatch": "…"}`), else `error-message`, else the message of the browser. Not a live region: it is read with the control, which the browser focuses on a submission.
- **Counter**: `counter` on a field whose control has a `maxlength`: the characters left (or over the limit), described by the control, told to screen readers by a polite live region once the user stops typing.
- **Password**: an `input type="password"` gets a toggle button after it (`aria-pressed`, named "Show password"), which shows the password as a text and hides it again; the value, the focus and the caret stay; it is hidden again when the form is submitted or reset, and when the page is left.
- **Texts**: `labels` translates the required mark, the name of the password toggle and the counter (one template per plural category of the language of the page: `{"one": "{count} caractère restant", "other": "{count} caractères restants"}`); `messages` and `error-message` are texts of the page. See the [readme](components/core/field/readme.md#texts).

```html
<form action="/account">
  <ds-field label="Email" hint="We only use it for the receipt." messages='{"valueMissing": "Enter your email address"}'>
    <input type="email" name="email" autocomplete="email" required />
  </ds-field>
  <ds-field label="Password" messages='{"tooShort": "Use 12 characters at least"}'>
    <input type="password" name="password" autocomplete="new-password" required minlength="12" />
  </ds-field>
  <ds-field label="About you" counter><textarea name="about" maxlength="280"></textarea></ds-field>
  <button>Create the account</button>
</form>
<!-- Submitted as without the fields: email=…&password=…&about=… -->
```

A `ds-select` in a field gets the border color of the field (`--ds-select-border-color`, set by the theme on a `ds-select` in a `ds-field` only).

The components render in the light DOM, and most of them move their children into their `<slot>` elements (Stencil's slot emulation). To change the content of such a component from a script, change its children (the `data` of a text node, the content of a child element) or add nodes with `appendChild()`: Stencil hides, at the next render of the component, the children that `innerHTML` or `textContent` set on the component element itself, as they are not in a slot.

`ds-button`, `ds-video`, `ds-marquee` and `ds-rating-list` are not part of the library: their code is archived on the `archive/propal` branch (see [Archived code](#archived-code)).

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

| Module       | Functions                                                                                                                                                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `props`      | `isTrue`, `toNumber`, `toFloat`, `toArray`, `fromJSON`, `toClassList`, `toString`                                                                                                                                                   |
| `css`        | `set`, `get`, `toNumber` (inline styles)                                                                                                                                                                                            |
| `dom`        | `cleanHTML`, `loadScript`, `scrollTo`, `getFileExtension`, `getOffset`                                                                                                                                                              |
| `ajax`       | `buildQuery`, `get`, `post` (JSON responses; `get(url, query, { responseType: 'text' })` returns the body as text, e.g. HTML)                                                                                                       |
| `tokens`     | `getToken`, `getBreakpoints` (the theme custom properties)                                                                                                                                                                          |
| `responsive` | `processBreakpoints`, `getBreakpoint`, `getParamsForBreakpoint`, `isMobile`, `isTablet`, `isDesktop`, `widthQuery`, `matchesWidth`, `watchMedia`, `watchBreakpoint`, `watchThemeBreakpoint`, `isSameBreakpoint`, `isStylesheetLoad` |
| `env`        | `touchSupport`                                                                                                                                                                                                                      |
| `form`       | `submit`, `reset`                                                                                                                                                                                                                   |
| `context`    | `get`, `DsComponentContext`                                                                                                                                                                                                         |

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

  The layout of `ds-grid` is the exception: its columns, gaps and ratios are props of each grid (and of each item), which can change per breakpoint. `ds-grid` and `ds-grid-item` write them as custom properties (`--ds-grid-cols`…), inline, and the component stylesheet lays the items out from them: they are documented like the others, as the stylesheet reads them, but the theme does not set them. Change the props, not these properties. `ds-range` writes the same way the shares of its fill and its buffer (`--ds-range-fill`, `--ds-range-buffer`), from its input, and `ds-thumb` its proportions and the hue of its placeholder (`--ds-thumb-ratio`, `--ds-thumb-hue`).

The component stylesheet documents the custom properties with `@prop` annotations, which Stencil lists in the **CSS Custom Properties** section it generates in the readme of the component:

```scss
/**
 * @prop --ds-tooltip-background: Background of the message bubble, and color of its arrow.
 * @prop --ds-tooltip-width: Width of the message bubble.
 */
```

Above the generated part, the **Styling** section of each readme, written by hand, lists what a stylesheet can target: the main class (`ds-<component>`, on the component element or on the element it renders inside it), its elements (`ds-<component>__<element>`), its modifiers (`mods` → `--<mod>`, and the classes the component sets from its state and props: `--open`, `--shown`, `--h-pos-left`…), the attributes and slots the styles read, what the component stylesheet does and what the theme draws, with an example.

| Component                                                        | Custom properties (`--ds-<component>-…`)                                                                                                                                           |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`ds-ajax`](components/core/ajax/readme.md)                      | `overlay-background`, `spinner-color`, `spinner-size`                                                                                                                              |
| [`ds-alert`](components/core/alert/readme.md)                    | `background`, `color`, `accent-color`, `border-width`, `radius`, `padding`, `gap`, `icon-size`                                                                                     |
| [`ds-back-to-top`](components/core/back-to-top/readme.md)        | `offset`, `z-index`, `transition-duration`, `size`, `icon-size`, `background`, `hover-background`, `color`, `radius`, `shadow`                                                     |
| [`ds-badge`](components/core/badge/readme.md)                    | `background`, `color`, `font-size`, `padding`, `radius`, `dot-size`                                                                                                                |
| [`ds-block`](components/core/block/readme.md)                    | `header-gap`, `footer-gap`, `max-width`                                                                                                                                            |
| [`ds-breadcrumb`](components/core/breadcrumb/readme.md)          | `font-size`, `gap`, `color`, `hover-color`, `current-color`, `separator-color`, `separator-size`                                                                                   |
| [`ds-combo`](components/core/combo/readme.md)                    | `background`, `color`, `border-color`, `active-color`, `hover-background`, `selected-background`, `selected-color`, `list-offset`, `invalid-color`                                 |
| [`ds-field`](components/core/field/readme.md)                    | `gap`, `label-color`, `required-color`, `hint-color`, `background`, `readonly-background`, `border-color`, `radius`, `padding`, `addon-background`, `addon-color`, `invalid-color` |
| [`ds-grid`](components/core/grid/readme.md)                      | `cols`, `h-gap`, `v-gap`, `cell-ratio`, `span`: the layout, set by the components from their props (`span` by `ds-grid-item`), not by the theme                                    |
| [`ds-grid-item`](components/core/grid/grid-item/readme.md)       | `ratio`: set by the component from its `ratio`, not by the theme                                                                                                                   |
| [`ds-heading`](components/core/heading/readme.md)                | `gap`, `image-gap`, `description-color`, `description-max-width`                                                                                                                   |
| [`ds-icon`](components/core/icon/readme.md)                      | `size`, `color`                                                                                                                                                                    |
| [`ds-loader`](components/core/loader/readme.md)                  | `size`, `color`, `track-color`, `bar-height`, `bar-width`, `radius`, `gap`                                                                                                         |
| [`ds-modal`](components/core/modal/readme.md)                    | `z-index`, `max-width`, `margin`, `backdrop`, `background`, `color`, `padding`, `radius`, `shadow`                                                                                 |
| [`ds-nav`](components/core/nav/readme.md)                        | `gap`                                                                                                                                                                              |
| [`ds-nav-item`](components/core/nav/nav-item/readme.md)          | `color`, `active-color`, `padding`, `border-color`, `sub-nav-background`, `sub-nav-shadow`                                                                                         |
| [`ds-pagination`](components/core/pagination/readme.md)          | `gap`, `size`, `font-size`, `icon-size`, `radius`, `color`, `hover-background`, `current-color`, `current-background`, `disabled-color`                                            |
| [`ds-panel`](components/core/panel/readme.md)                    | `border-color`, `tab-color`, `active-color`, `title-font-size`, `transition-duration`                                                                                              |
| [`ds-panel-group`](components/core/panel-group/readme.md)        | none: its panels carry the look                                                                                                                                                    |
| [`ds-range`](components/core/range/readme.md)                    | `thumb-size`, `track-height`, `track-color`, `buffer-color`, `fill-color`, `thumb-color`, `thumb-border-color`, `radius`; `fill`, `buffer`: set by the component                   |
| [`ds-rsp`](components/core/responsive/readme.md)                 | none: it renders nothing                                                                                                                                                           |
| [`ds-select`](components/core/select/readme.md)                  | `background`, `border-color`, `radius`, `padding`, `invalid-color`                                                                                                                 |
| [`ds-sidebar`](components/core/sidebar/readme.md)                | `width`, `max-width`, `z-index`, `transition-duration`, `padding`, `background`, `shadow`                                                                                          |
| [`ds-slider`](components/core/slider/readme.md)                  | `transition-duration`, `button-offset`, `button-size`, `button-background`, `button-border-color`                                                                                  |
| [`ds-slider-item`](components/core/slider/slider-item/readme.md) | none: no look of its own                                                                                                                                                           |
| [`ds-slider-menu`](components/core/slider/slider-menu/readme.md) | `offset`, `dot-size`, `dot-gap`, `dot-color`, `dot-active-color`                                                                                                                   |
| [`ds-text`](components/core/text/readme.md)                      | `font-family`, `font-size`, `line-height`, `spacing`, `list-indent`                                                                                                                |
| [`ds-thumb`](components/core/thumb/readme.md)                    | `background`, `radius`, `placeholder-saturation`, `placeholder-lightness`, `initials-color`, `initials-size`; `ratio`, `hue`: set by the component                                 |
| [`ds-title`](components/core/title/readme.md)                    | `color`, `sub-color`, `font-family`, `line-height`                                                                                                                                 |
| [`ds-title-bar`](components/core/title-bar/readme.md)            | `gap`                                                                                                                                                                              |
| [`ds-toaster`](components/core/toaster/readme.md)                | `background`, `color`, `font-size`, `padding`, `gap`, `shadow`, `min-width`, `z-index`                                                                                             |
| [`ds-toggle`](components/core/toggle/readme.md)                  | `color`, `checked-color`, `disabled-color`, `track-color`, `track-disabled-color`, `knob-color`, `knob-checked-color`, `knob-disabled-color`, `invalid-color`                      |
| [`ds-toggle-group`](components/core/toggle-group/readme.md)      | none: its toggles carry the look                                                                                                                                                   |
| [`ds-tooltip`](components/core/tooltip/readme.md)                | `background`, `color`, `font-size`, `padding`, `radius`, `shadow`, `width`, `offset`                                                                                               |
| [`ds-trigger`](components/core/trigger/readme.md)                | `color`, `background`, `border-color`, `radius`, `padding`, `font-size`, `link-color`, `link-hover-color`                                                                          |

`npm test` checks the contract: no color and no font in the component stylesheets (the resets that make an element inherit the font of its parent aside), every documented custom property named after its component, set by the default theme (or, for the layout of `ds-grid`, by the components, and then not by the theme) and read, no undocumented one, and every readme up to date (see [Tests](#tests)).

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

The components follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) patterns. The unit tests check their roles, attributes, keyboard handling (simulated key events) and focus moves, the stylesheet tests the focus indicator and less motion, and the browser tests the keys, the Tab order and the focus moves with the keyboard of Chromium (Tab, Shift+Tab, Escape, Enter, Space, the arrow keys…; see [Tests](#tests)). The library uses no accessibility audit library or service. The readme of each component describes its roles, keyboard support and required labelling in an Accessibility section: the overlays, [`ds-modal`](components/core/modal/readme.md#accessibility), [`ds-sidebar`](components/core/sidebar/readme.md#accessibility), [`ds-tooltip`](components/core/tooltip/readme.md#accessibility), [`ds-toaster`](components/core/toaster/readme.md#accessibility), and the form controls, [`ds-toggle`](components/core/toggle/readme.md#accessibility), [`ds-toggle-group`](components/core/toggle-group/readme.md#accessibility), [`ds-combo`](components/core/combo/readme.md#accessibility), [`ds-select`](components/core/select/readme.md#accessibility), [`ds-field`](components/core/field/readme.md#accessibility), [`ds-range`](components/core/range/readme.md#accessibility), [`ds-trigger`](components/core/trigger/readme.md#accessibility), the feedback components, [`ds-alert`](components/core/alert/readme.md#accessibility), [`ds-badge`](components/core/badge/readme.md#accessibility), [`ds-loader`](components/core/loader/readme.md#accessibility), [`ds-back-to-top`](components/core/back-to-top/readme.md#accessibility), the navigation and content components, [`ds-panel-group`](components/core/panel-group/readme.md#accessibility), [`ds-panel`](components/core/panel/readme.md#accessibility), [`ds-slider`](components/core/slider/readme.md#accessibility) (and [`ds-slider-menu`](components/core/slider/slider-menu/readme.md#accessibility), [`ds-slider-item`](components/core/slider/slider-item/readme.md#accessibility)), [`ds-nav`](components/core/nav/readme.md#accessibility), [`ds-nav-item`](components/core/nav/nav-item/readme.md#accessibility), [`ds-breadcrumb`](components/core/breadcrumb/readme.md#accessibility), [`ds-pagination`](components/core/pagination/readme.md#accessibility), [`ds-ajax`](components/core/ajax/readme.md#accessibility), [`ds-thumb`](components/core/thumb/readme.md#accessibility), and [`ds-icon`](components/core/icon/readme.md#accessibility), [`ds-title`](components/core/title/readme.md#accessibility), [`ds-heading`](components/core/heading/readme.md#accessibility), [`ds-block`](components/core/block/readme.md#accessibility). `ds-grid`, `ds-grid-item`, `ds-text`, `ds-title-bar` and `ds-rsp` are layout and text: no role, no keyboard, no focus. The form controls take part in a native `<form>` (`ds-toggle`, `ds-toggle-group` and `ds-combo` are form-associated, `ds-select` has a native `select`, `ds-field` enhances a native control): a `<label>` names them, a disabled fieldset disables them, and their required state and errors are given to assistive technologies when the user should see them (see [Forms](#forms)).

### Focus indicator

The base styles of the theme draw an outline around the element that has the keyboard focus (`:focus-visible`: not after a click on a button), with `@include ds-focus-ring()`, from the focus tokens (`$focus`, see [Tokens](#tokens-scssenginevariables)):

| Custom property     | `default`                      | What it is                                    |
| ------------------- | ------------------------------ | --------------------------------------------- |
| `--ds-focus-color`  | `var(--ds-color-primary-base)` | Color of the outline (3:1 contrast at least). |
| `--ds-focus-width`  | `2px`                          | Width of the outline.                         |
| `--ds-focus-style`  | `solid`                        | Style of the outline.                         |
| `--ds-focus-offset` | `2px`                          | Space between the element and its outline.    |

Configure them in a theme (`@forward '../../engine' with ($focus: (color: ds-ref(color, secondary, darker), width: 3px, style: solid, offset: 2px));`) or change them at runtime (`:root { --ds-focus-color: #0d9488; }`, or in a scope, on a dark background: `.dark { --ds-focus-color: var(--ds-color-gray-white); }`). No stylesheet of the theme or of the components removes the outline (`npm test` checks it): an element that draws its own focus state does it on `:focus-visible`, with `ds-focus-ring()` or a style of the same strength. Two components draw it for an element that cannot show it: `ds-select` around its box, as its native select is transparent (`:has(> .ds-select__input:focus-visible)`), and `ds-combo` inside the active option of its open list (`--active`), which the keys move while the combobox keeps the focus. The scrolling parts of the overlays have their padding inside them (the dialog of `ds-modal`, the content of `ds-sidebar`), so that the outline of the elements at their edges is not cut. `ds-panel` and `ds-panel-group` clip their content only while it is collapsed or hidden and during its transition: the outline of the tabs and of the elements of an expanded panel shows.

### Less motion

With `prefers-reduced-motion: reduce` (a system setting):

- the base styles of the theme end every transition and animation at once: their durations become `0.01ms` (not `0`, so that the `transitionend` and `animationend` events still come), without delay, one iteration; smooth scrolling is off. The loading indicators (the `spin()` mixin: `ds-ajax`, `ds-icon type="loading"`, the spinner of `ds-loader`) are essential: they keep turning, at half speed (see [`ds-loader`](components/core/loader/readme.md#accessibility) for the reasons); the bar of a determinate `ds-loader` takes its width at once;
- `ds-sidebar` and `ds-toaster` drop their transitions and the slide-in of the toasts, in their component stylesheets (also without the theme): they show and hide at once, and emit `sidebarShown` / `sidebarHidden` and `toasterShown` / `toasterHidden` at once. `ds-back-to-top` drops its fade too, and scrolls to the top at once instead of smoothly (a choice of its script: the `behavior` of `scrollTo()`). `ds-modal`, `ds-alert`, `ds-breadcrumb` and `ds-pagination` have no transition;
- `ds-slider` drops the slide of its list (in its component stylesheet): the slides change at once; its automatic rotation (`params.autoplay`) does not start, and its rotation button can start it. `ds-panel` and the sub-navigations of `ds-nav-item` expand and collapse at once (the 0.01ms of the base styles), and the opening of a sub-navigation is visible at once.

The components that wait for the end of a transition (`ds-sidebar`, `ds-toaster`, `ds-panel`, `ds-slider`, `ds-nav-item`) do not hang when no transition runs (durations of `0`, `transition: none`, an element that is not rendered): they end the wait at once, or once the duration is over (`utils/transition.ts`). Use the `ds-reduced-motion()` mixin for the rules of a skin: `@include ds-reduced-motion() { transition: none; }`.

### Names, roles and keyboard

| Component                | Role and attributes                                                                                                                                                                                                                                               | Name (required)                                                                   | Keyboard                                                                                                                                                      | Focus                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ds-modal`               | `role="dialog"`, `aria-modal="true"`, `aria-describedby` (`slot="description"`)                                                                                                                                                                                   | a `slot="title"` heading (`aria-labelledby`), else `label`                        | Escape hides the modal on top; Tab and Shift+Tab stay in the dialog                                                                                           | moves into the dialog when shown (`autofocus`, else the first focusable element), back to the opener when hidden                          |
| `ds-sidebar`             | `role="complementary"` (or the element's `role`), `inert` while hidden                                                                                                                                                                                            | `label` (`aria-label`)                                                            | Escape hides it while the focus is in it                                                                                                                      | `show()` moves it into the sidebar, `hide()` back to the opener                                                                           |
| `ds-tooltip`             | `role="tooltip"` on the message, `aria-describedby` on the first focusable element of the content (or on the box, then focusable)                                                                                                                                 | the content's own (a button text, an `aria-label`): the message is a description  | the focus shows the message; Escape hides it                                                                                                                  | none: the content keeps the focus                                                                                                         |
| `ds-toaster`             | a live region: `role="status"` (`aria-live="polite"`), `role="alert"` (`aria-live="assertive"`) with `mods="error"`                                                                                                                                               | none needed                                                                       | none                                                                                                                                                          | never takes the focus                                                                                                                     |
| `ds-toggle`              | the element: `switch`, `checkbox`, `radio` (`aria-checked`) or, for `icon`, `button` (`aria-pressed`); `aria-disabled`; `aria-required`, `aria-invalid` (a checkbox, a switch)                                                                                    | `aria-labelledby`, `label`, a `<label>`, or a text in it (visually hidden)        | Space toggles (checks a radio); Enter toggles a switch or a toggle button                                                                                     | `tabindex="0"`, none while disabled                                                                                                       |
| `ds-toggle-group`        | `radiogroup` (radios, single selection) or `group`; `aria-disabled`; `aria-required` (a radio group), `aria-invalid`                                                                                                                                              | `aria-labelledby`, `label` or a `<label for>`                                     | radio group: the arrow keys, Home and End move the focus and the selection, round the group, over the enabled radios                                          | radio group: Tab reaches one radio, the checked one or the first (roving tabindex)                                                        |
| `ds-combo`               | `combobox` (the toggle button: `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-required`, `aria-invalid`) and `listbox` (`aria-multiselectable`) of `option` elements (`aria-selected`, `aria-disabled`)                                         | `labelledby`, `label`, a `<label>`, else `custom-label` or `name`                 | arrows, Home, End, Page Up/Down and type-ahead move the active option; Enter and Space select it (single: close); Escape closes; Tab closes (single: selects) | stays on the combobox; `dropdown` mode: `open()` moves it to the listbox, closing gives it back                                           |
| `ds-select`              | the native `select` (`aria-invalid`); its box label `aria-hidden`                                                                                                                                                                                                 | `label`, `labelledby`, a `<label>` around it, or `<label for="<name>">`           | the browser's                                                                                                                                                 | the native select; the theme draws the ring around the box                                                                                |
| `ds-field`               | the native control (its role, `aria-required`); `aria-invalid` and `aria-describedby` (hint, error, counter, prefix, suffix) on it; the password toggle a `button` (`aria-pressed`); the counter a polite live region                                             | `label` (a `<label for>`) or a `<label>` of the page in the field                 | the browser's; the password toggle: Enter and Space                                                                                                           | the control; the password toggle after it in the Tab order; the caret given back to the input after a toggle                              |
| `ds-range`               | none of its own: the native `input type="range"` (`slider`, its `aria-valuenow`, `aria-valuemin`, `aria-valuemax`), with an `aria-valuetext` from `labels.valueText` or `formatter`; the track `aria-hidden`                                                      | a `<label>` of the page, or the `aria-label` of the input                         | the browser's: the arrows, Page Up, Page Down, Home, End                                                                                                      | the input                                                                                                                                 |
| `ds-trigger`             | when it is the control: `button` (or the element's `role`), `aria-disabled`; with a native button or link in it: none                                                                                                                                             | its text, `label`, `aria-label`                                                   | Enter and Space click it                                                                                                                                      | `tabindex="0"`, none while disabled                                                                                                       |
| `ds-alert`               | not a live region by default; `live`: `role="status"` (`polite`) or `role="alert"` (`assertive`) on the title and the message, `aria-atomic`; the title a `heading` with `level`; a prefix of the type hidden on the screen; the dismiss button a native `button` | the title and the message; the dismiss button: `labels.dismiss` ("Dismiss")       | Enter and Space on the dismiss button; no Escape (not a layer)                                                                                                | never takes it; a dismiss moves it, when it was in the alert, to the next element of the Tab order (else the previous one)                |
| `ds-badge`               | none: a text; with `label`, the label hidden on the screen is read, the visible text `aria-hidden`                                                                                                                                                                | its text, or `label` (`{count}`, plurals); part of the name of its link or button | none                                                                                                                                                          | none                                                                                                                                      |
| `ds-loader`              | `progressbar`; determinate: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`                                                                                                                                                                                     | `label` ("Loading" by default) or `aria-labelledby`                               | none                                                                                                                                                          | none                                                                                                                                      |
| `ds-back-to-top`         | a native link (`href="#top"`); hidden: `visibility: hidden` and `inert`                                                                                                                                                                                           | its text: `label` ("Back to top")                                                 | Enter follows it                                                                                                                                              | moves to `target` (else the `#top` element, `main`, the first heading, the body; `tabindex="-1"` until it loses it)                       |
| `ds-panel-group`         | tabs: a rendered `tablist` that owns the tabs (`aria-owns`); collapsible: none                                                                                                                                                                                    | tabs: `label` or `labelledby`                                                     | tabs: Left and Right Arrow (reversed from right to left), Home, End move the focus and select (automatic activation); Enter, Space                            | tabs: Tab reaches the selected tab (roving tabindex), then its panel                                                                      |
| `ds-panel`               | tab: `tab` (`aria-selected`, `aria-controls`) and `tabpanel` (`aria-labelledby`); collapsible: `button` (`aria-expanded`, `aria-controls`) in a `heading` (`level`, or a slotted `h1`…`h6`); the content `inert` while collapsed                                  | the text of its `title` slot                                                      | Enter and Space expand, collapse or select                                                                                                                    | the control of the title; a tab panel without focusable element takes the focus; collapsing gives the focus of the content to the control |
| `ds-slider`              | `region` (`aria-roledescription="carousel"`), slides `group` (`aria-roledescription="slide"`, named "2 of 5"), the slides out of view `inert`, the list `aria-live` (`polite`, `off` while rotating)                                                              | `label`; `labels` translates the texts                                            | the buttons: Enter and Space (previous, next, rotation, the dots of `ds-slider-menu`: buttons with `aria-current`)                                            | the rotation stops when the focus enters the slider; a removed previous / next button gives the focus to the other one                    |
| `ds-nav`                 | a main one: `navigation` (or the element's `role`); its `div` a `list`                                                                                                                                                                                            | `label`                                                                           | none                                                                                                                                                          | none                                                                                                                                      |
| `ds-nav-item`            | `listitem`; the expand button `aria-expanded`, `aria-controls`; the link of the current page `aria-current="page"` (`is-active`)                                                                                                                                  | the expand button: `toggle-label` (`{label} submenu`)                             | Enter and Space on the expand button; Escape closes the sub-navigation (or hides the drop-down)                                                               | Escape gives it to the expand button (or to the link of the item); a collapsed sub-navigation is out of the Tab order                     |
| `ds-breadcrumb`          | `navigation` (or the element's `role`; none in a `nav` or around one); the list of the page; `aria-current="page"` on the last item (none marked); a collapsed trail: its button `aria-expanded="false"`, its hidden items `hidden`                               | `label` ("Breadcrumb"); the button: `labels.expand` ("Show full path")            | the links'; Enter and Space on the button of a collapsed trail                                                                                                | the button gives it to the first item it shows; a trail that collapses around it gives it to the button                                   |
| `ds-pagination`          | `navigation` (or the element's `role`); the pages a `list` of links (`href-template`) or buttons, the current one `aria-current="page"`, the ellipses `aria-hidden`; unavailable: a link without `href` (`aria-disabled`), a disabled button                      | `label` ("Pagination"); the controls: `labels` ("Page 3", "Next page")            | Enter follows a link; Enter and Space press a button                                                                                                          | buttons: stays on the pressed control, else the same page, the current page, the closest control: never lost                              |
| `ds-ajax`                | the target `aria-busy` while it loads; another target a polite live region after a click; the error message `role="alert"`                                                                                                                                        | the text of its link                                                              | the link's                                                                                                                                                    | the loaded content takes the focus of the replaced link (`tabindex="-1"`)                                                                 |
| `ds-icon`                | decorative: `aria-hidden="true"`; with a name: `img`                                                                                                                                                                                                              | `label` (for an icon that stands alone)                                           | none                                                                                                                                                          | none                                                                                                                                      |
| `ds-thumb`               | the image an `img` (its `alt`), the placeholder that replaces it `role="img"` (`aria-label`), its initials `aria-hidden`; decorative: neither is in the tree                                                                                                      | `alt`, else `label`; `decorative` (or `alt=""`) for none                          | none                                                                                                                                                          | none                                                                                                                                      |
| `ds-title`, `ds-heading` | none, or with `level` (a text title): `heading` (`aria-level`); a slotted `h1`…`h6` keeps its level                                                                                                                                                               | its text                                                                          | none                                                                                                                                                          | none                                                                                                                                      |
| `ds-block`               | `article` (`article`), `region` (`section` with `label`), else none                                                                                                                                                                                               | `label` (a section)                                                               | none                                                                                                                                                          | none                                                                                                                                      |

Escape closes one layer per key press: a shown tooltip first (its listener runs in the capture phase), then the open list of a `ds-combo`, then the open sub-navigation of `ds-nav-item` that has the focus (the innermost one first: the closest layer to the focus), then the modal on top, then a sidebar that has the focus; the key press then goes no further. Last, with the focus elsewhere, a drop-down sub-navigation under the pointer is hidden.

### Accessibility checklist for integrators

The components give the roles, states and keys; the page gives the names and the content:

- **Name the landmarks and the widgets** with their `label` prop (or `labelledby` / `aria-labelledby`, to point at a visible title; a `<label>` element for the form controls): `ds-nav` (when the page has several navigations: "Main", "Footer"), `ds-sidebar`, `ds-modal` (or its `slot="title"` heading), `ds-slider` (what the slides are), `ds-panel-group` of tabs, `ds-block section` (to make a region of it), the form controls (`ds-toggle`, `ds-toggle-group`, `ds-combo`, `ds-select`, the input of a `ds-range`), a `ds-trigger` or a `ds-icon` without text, a `ds-loader` (what loads). `ds-breadcrumb` and `ds-pagination` have a name of their own ("Breadcrumb", "Pagination"), to translate; two paginations of the same list (above and below it) need two names.
- **Translate the built-in texts** of a page in another language: `labels` of `ds-slider` (`carousel`, `slide`, `{index} of {count}`, the buttons and the menu), `toggle-label` of `ds-nav-item` (`{label} submenu`), `error-message` of `ds-ajax`, `labels` of `ds-range` (the template of the value text, or its `formatter`), `labels` of `ds-field` (the required mark, "Show password", the counter, in the plural forms of the language), `labels` of `ds-alert` (the prefixes `Information:`, `Success:`, `Warning:`, `Error:`, and "Dismiss"), `label` of `ds-loader` ("Loading") and of `ds-back-to-top` ("Back to top"), `label` and `labels` of `ds-breadcrumb` ("Breadcrumb", "Show full path") and of `ds-pagination` ("Pagination", "Previous page", "Next page", "First page", "Last page", `Page {page}`, and `Page {page} of {total}` in the plural forms of the language); the `label` of a `ds-badge` is a text of the page ("{count} unread messages", in the plural forms of the language). The validation messages of the form controls are the browser's own, in its language; `required-message` (and `messages` and `error-message` of `ds-field`) replaces them with a text of the page.
- **Required fields**: say it in the visible label too ("Email (required)"), or explain the mark of `ds-field` (`*`) at the top of the form ("Fields marked * are required"), and give the controls of a form their `name`: a control without a name submits nothing.
- **Fields**: put one control in a `ds-field`, as a direct child; give it its `autocomplete`; write a hint for the format a control expects ("With the country code") rather than a placeholder, which goes away as the user types. Call `refresh()` on the field after a script sets the value or a custom error out of an event of the control.
- **Headings**: put a heading element of the right level in `ds-title`, in `ds-heading` and in the `title` slot of a collapsible `ds-panel` (its level goes to the title), or set `level`.
- **Live regions** are in the components: `ds-toaster` (`status`, `alert` with `mods="error"`), the list of `ds-slider` (polite, off while rotating), the target of `ds-ajax` (busy while it loads, polite after a click) and its error alert, the counter of `ds-field` (polite, once the user stops typing; its error is not a live region: it is read with the control), and a `ds-alert` with `live` (`polite` or `assertive`: an alert that a script inserts, shows or fills; not the messages of the page, `live="off"` by default). Do not add another live region around them. `ds-badge` and `ds-loader` are not live regions: tell a change of a count or the end of a load that matters with a polite `ds-alert` ("3 new messages", "12 results"), and mark a region that loads `aria-busy="true"`.
- **Current page**: set `is-active` on the `ds-nav-item` of the current page (`aria-current="page"` on its link), or an `aria-current` of your own on the link. `ds-breadcrumb` marks its last item (an `aria-current` of the page on another element of the list replaces that mark; `aria-current="false"` on the last item, for a trail that ends with a parent of the page), `ds-pagination` its `current` page.
- **Breadcrumb and pagination**: write the trail of `ds-breadcrumb` as a list of links (`ol`, the current page last), and put it at the top of the main content, before the main heading; put `ds-pagination` after the list it pages, with links to the pages (`href-template`) wherever they have URLs: the browser follows them (a new tab too), and no script changes the page. Each one is its own navigation landmark: do not put it in another one (or put it in a `nav` element of the page, which is then the landmark). In buttons mode, tell the user the new page in `pageChange`: move the focus to the results (their heading), or write the change in a polite live region.
- **Images and icons**: an `alt` on the images of the slides and headings (empty for a decorative one), on a `ds-thumb` (or `decorative`, next to a text that names it); a `ds-icon` is decorative unless it has a `label`. The icon of a `ds-alert` is decorative (its prefix tells the type), and the color of a `ds-badge` is not read: say what it means in its text. The icons of the theme stay visible in forced colors, in the system color of the text around them (see [Icons](#icons)).
- **Less motion** is handled: keep the base styles of the theme (`ds-reduced-motion()` for the rules of your skins), and `params.autoplay` of `ds-slider` does not start with `prefers-reduced-motion: reduce`; `ds-back-to-top` scrolls at once then, and the spinner of `ds-loader` turns more slowly. An automatic rotation always has its stop button: do not hide it.
- **Focus**: do not remove the focus outline (`:focus-visible`); keep the padding inside the scrolling parts (see [Focus indicator](#focus-indicator)). Put only `ds-nav-item` elements in a `ds-nav` (a list), only `ds-panel` elements in a `ds-panel-group`. Put `ds-back-to-top` at the end of the `body`, and give it a `target` at the top of the page (the main title, the main content).

### Visually hidden text

`.ds-visually-hidden` (base styles of the theme) hides a text on the screen and keeps it for screen readers: the text of an icon button, a label, an extra word of context.

```html
<button type="button"><ds-icon type="cart"></ds-icon><span class="ds-visually-hidden">Cart</span></button>
```

## Tests

The tests run with Vitest 5 and `@stencil/vitest`, the test tooling of Stencil that replaces its integrated test runner (`stencil test`, Jest), deprecated since Stencil 4.43 and dropped by Stencil 5. `vitest.config.mts` defines three projects:

| Project   | Files                                                        | Where                                                                                                                                                                                            | Script                 |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `unit`    | `components/**/*.spec.ts`, `*.spec.tsx` (but `sass.spec.ts`) | Stencil's simulated DOM (mock-doc, the `stencil` environment of `@stencil/vitest`), in Node: the plugin of `@stencil/vitest` compiles the components from their sources as the tests import them | `npm test`             |
| `styles`  | `components/sass.spec.ts`                                    | Node: the stylesheets compiled with the Sass JavaScript API                                                                                                                                      | `npm test`             |
| `browser` | `components/**/*.browser.ts`                                 | Chromium, driven by Playwright (Vitest browser mode), on the build of the components and of the theme                                                                                            | `npm run test:browser` |

`npm test` runs the unit and stylesheet tests once, without a browser and without a build; `npm run test:watch` runs them again on every change. `npm run test:browser` runs the browser tests on the build: run `npm run build:all` first, and again after a change of a component or of the theme (the setup stops with that message when the build is missing). `npm test` does not run the browser tests, which need a build and a browser; CI runs both (see [Tooling](#tooling)). The test files and the helpers are not part of the build output (`dist/`, `www/`, `loader/`, the types) nor of the generated readmes: the Stencil build compiles the components only (`tsconfig.build.json`), and `npm run typecheck` type-checks the tests too.

### Unit tests

- A spec file sits next to its source: `components/utils/props.spec.ts`, `components/core/toggle/toggle.spec.tsx`. It imports what it uses from `vitest` (`describe`, `it`, `expect`, `vi`…): there are no globals.
- A component is defined when the test file imports it (`import './toggle'`): the plugin of `@stencil/vitest` compiles it as a custom element. `renderPage()` (`test/helpers`) renders HTML, or a JSX template for props that are not strings, in the body of a fresh page and waits for its components: `page.root` is the first component of the body, `page.waitForChanges()` waits for them to render a change. The DOM matchers of `@stencil/vitest` are installed: `toHaveClass()`, `toHaveClasses()`, `toHaveAttribute()`, `toEqualAttribute()`, `toEqualAttributes()`.

```tsx
import { describe, expect, it } from 'vitest';
import './toggle';
import { renderPage } from '../../../test/helpers';

describe('ds-toggle', () => {
  it('toggles a checkbox', async () => {
    const page = await renderPage('<ds-toggle type="checkbox"></ds-toggle>');
    page.root.click();
    await page.waitForChanges();
    expect(page.root.checked).toBe(true);
  });
});
```

The simulated DOM has no focus, no layout, no computed style, no viewport and no `ElementInternals`. The shared helpers of `test/helpers/` (imported from `test/helpers`) give what a test needs of them:

| Helper (module)                                                                        | What it gives                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `renderPage()`, `waitForChanges()`, `wait()`, `componentClass()` (`page.ts`)           | a page and its components; a wait for a time (the timers are real); the class of a component, to spy on a method of its prototype                                           |
| `trackFocus()` (`focus.ts`)                                                            | `document.activeElement`, which `focus()` sets, dispatching `focusout` and `focusin`; returns the function that gives the focused element, with the spy of `focus()`        |
| `keydown()`, `keyup()`, `dispatchKey()` (`keyboard.ts`)                                | key events that bubble and can be cancelled, as a browser dispatches them                                                                                                   |
| `mockTransition()`, `mockComputedStyle()`, `mockTokens()`, `mockLayout()` (`style.ts`) | the computed transition, the computed style or the theme custom properties that `getComputedStyle()` gives, and the sizes of the elements (`offsetWidth`, `offsetHeight`)   |
| `fakeMatchMedia()` (`media.ts`)                                                        | a `matchMedia()` that evaluates the width media queries at a width and, when the test resizes, dispatches `change` on the lists whose state changes, as a browser does      |
| `mockElementInternals()`, `formCallbacks()` (`form.ts`)                                | a fake `ElementInternals` that records the form value, the state and the validity and dispatches `invalid`, and the form callbacks a browser calls (`formResetCallback()`…) |

`components/core/slots.spec.ts` checks the slots of the components: each one documents with a JSDoc `@slot` tag every slot it renders (`<slot name="title">`), every slot marker its code reads (`slot="hint"`) and the content it enhances without a slot (`ds-ajax`, `ds-breadcrumb`, `ds-field`, `ds-range`), and the Slots section of its generated readme lists them. `components/docs.spec.ts` checks that the repository paths the README, the changelog and the notes of `docs/` name (`scss/…`, `components/…`) and their relative links exist.

`test/setup/unit.ts` gives each test a fresh page (a new body, no listeners), and `vitest.config.mts` restores the spies (`vi.spyOn()`) and the globals of `vi.stubGlobal()` before each test. The setup also gives the runtime the build flags of Stencil's former spec pages (the development mode, form association, no `hydrated` class) and the window the `on…` properties and the event listeners of a browser window, which the components rely on.

`components/sass.spec.ts` compiles every theme (`scss/themes/<theme>/index.scss`), every theme page stylesheet and every `.scss` file of `components/` with the Sass JavaScript API: a Sass warning (a deprecation included) or error fails `npm test` (the `styles` project, in Node), so CI. It also checks that the tokens can be configured with `@use … with (…)`. For the custom properties, it checks that each theme writes one per token of its maps (names and values, references resolved), that its `--ds-bp-labels` lists its `--ds-bp-*` breakpoints by width (and that no JSON is written in a `content` any more), the errors on breakpoint labels, that every `var(--ds-…)` of a theme has its property, that the accessors return `var()` and the `-value` functions the values, the errors on unknown tokens, `null` values, configured engines and the scoped `ds-tokens()`. It also checks that no stylesheet writes a function call Sass does not know (`color(…)`, `ds-…(…)`: Sass writes them as plain CSS, which browsers drop), and that the component stylesheets read no token. For the [styling contract](#styling-a-component), it checks that each `.scss` file of `components/core/` is the stylesheet of a component; that the component stylesheets write no color (hexadecimal, color function or color name, `transparent` aside) and no `font`, `font-family` or `font-size`, but for the resets it lists (`font-size: inherit`…); that they read no other custom property than the documented ones of their component; that each component documents its custom properties once, named after it (`--ds-<component>-…`); that the default theme sets each documented property but those a component writes from its props (the layout of `ds-grid`, the fill of `ds-range`, the ratio and the hue of `ds-thumb`, which the theme does not set but may read: the test pins that list), that its skins or a component stylesheet read it, and that it declares or reads no other `--ds-…` property than the tokens and the documented ones; and that the readme of each component has a Styling section and lists its documented properties (regenerated by `npm run build`). For [accessibility](#accessibility), it checks that the default theme draws the focus indicator from the focus tokens, that no stylesheet removes the outline (`outline: none`, `0`), that every stylesheet names the properties it transitions (no `all`, which would animate the outline and the visibility), the rules of less motion (and the loading indicators that keep turning), the visually hidden class, the icons in forced colors, and the empty alternative text of the decorative icons (`$alt` of the icon mixins). For the [icons](#icons), it checks that the icon map is the one `scripts/build-icons.mjs` generates, that it keeps every name of the former font, each one an SVG data URI with a viewBox and nothing but shapes (the filled variants filled), the box and the image the mixins write, the custom properties of the icons drawn (only those, in a theme too) and the licence notice after them, the licence texts the CSS build copies next to the stylesheets (the file the notice names), a configured `$icons`, each type of `ds-icon`, and that no stylesheet declares a font face or requests a font file.

### Browser tests

The browser tests check in Chromium what the simulated DOM can only imitate. A browser test file sits next to its source too (`components/core/toggle/toggle.browser.ts`), and runs on the build that the package publishes: the browser build (`dist/dot-stash/dot-stash.esm.js`) and the default theme (`dist/css/default.css`), loaded by `test/setup/browser.ts`. The tests use the keyboard and the pointer of Playwright (`userEvent` of `vitest/browser`: `keyboard()`, `tab()`, `click()`, `hover()`…), the viewport (`page.viewport()`), and the media features (`setReducedMotion()`, `setForcedColors()`); the helpers of `test/helpers/browser.ts` mount a page and wait for its components (`mount()`), collect events (`nextEvent()`, `recordEvents()`), and read the node of an element in the accessibility tree of Chromium (`accessibleNode()`: its role, name, description, value and states, through the Chrome DevTools Protocol), and `commands.compileScss()` compiles a stylesheet of a test with the engine. They wait for events and conditions (`expect.poll()`), not for fixed times. After each test, the page is emptied, back to 1280 × 800 px, without emulated media, and the pointer is in a corner.

- **Keyboard and focus**: `ds-panel-group` (tabs: the arrows, reversed from right to left, Home, End, Tab into the panel; collapsible panels), `ds-slider` (the buttons, the dots, the first slide of `params.index` with and without loop, the rotation stopped by the focus and paused under the pointer, less motion), `ds-nav` (disclosure and Escape in both modes), `ds-combo` (the keys of the select-only combobox, type-ahead, Escape), `ds-toggle-group` (roving tabindex), `ds-toggle` (Space, Enter, the focus in the frame it is shown), `ds-modal` (focus moved in and given back, Tab trapped, Escape), `ds-sidebar`, `ds-tooltip`.
- **Forms**: `new FormData(form)` with `ds-toggle`, `ds-toggle-group`, `ds-combo` (`multiple`) and `ds-select` (its value submitted once), a form reset, a `<fieldset>` disabled at runtime, `required` (`checkValidity()`, a blocked submission, the focus), when `aria-invalid` shows, a click on a `<label>` and the name it gives. `ds-field`: the same entries as without the fields and no control moved, the error shown before the browser focuses the control, `reportValidity()`, the timing of the error and of `aria-invalid` (and what Chromium tells without it), a reset, a disabled fieldset, the names and descriptions in the accessibility tree, the counter told once, the password toggle with the keyboard and on a submission, the layout (right to left too), the colors and forced colors, a control replaced. `ds-range`: the slider of the input (its name, its keys, its form), the fill under the thumb at every value from left to right and from right to left, the buffer, the value text, a disabled fieldset, a form reset, forced colors.
- **Responsive**: the breakpoint of `ds-rsp` at the boundary widths, at once when the viewport crosses one and never within a breakpoint; the boxes of the items of `ds-grid`; the switch of mode of `ds-nav-item` across `md`.
- **Transitions**: `panelShown` and `panelHidden` of `ds-panel`, the end of a slide of `ds-slider` without `transitionend`, `waitForTransition()` with less motion.
- **Feedback components**: `ds-alert` (the accessibility tree of a static alert and of a live one, its region in the tree before its content, a change in a region already there, a hidden alert shown, the dismiss with Enter, Space and the pointer and where the focus goes, the icons of the types, right to left, forced colors), `ds-badge` (the name of its link or button, with its label and plurals, the contrast of each type, the dot, forced colors, right to left), `ds-loader` (the progress bar and its value, determinate or not, the sizes, the spinner with less motion, the bar, right to left, forced colors), `ds-back-to-top` (before the threshold: not shown, not focusable, not in the tree; shown without moving the page; Enter and a click: the scroll, smooth or at once with less motion, and the focus on the target; right to left, forced colors).
- **Navigation components**: `ds-breadcrumb` (the landmark and its name, in a `nav` element too, the current page, the separators drawn and not read, the Tab order of a collapsed trail and its button with Enter, Space and the pointer, the focus on the first item shown, the wrap at 320 px, the collapse below `md` with `ds-rsp`, right to left, forced colors), `ds-pagination` (the landmark, the names of the pages and of the controls, the ellipses out of the tree, the unavailable controls out of the Tab order, the links that navigate, Enter and Space on the buttons and `pageChange`, the focus kept through every page with the next control and on a page clicked as the list moves, the compact layout across `sm` and at 320 px without a horizontal scroll, the list that wraps, right to left, forced colors in both modes).
- **Thumbnails**: `ds-thumb` (its proportions and the crop of its image, the lazy load of an image far below the viewport, the states, a failed image replaced by the placeholder and its name, a decorative thumbnail out of the tree, the contrast of the initials on every hue, their size and place, forced colors).
- **Toaster**: `ds-toaster` (its countdown paused while the pointer is over the toasts, and started again when it leaves; the box of the toasts within the viewport at 320 and 375 px, in each position, and 500 px wide at 800 and 1280 px).
- **Icons**: the theme and a page of icons load without requesting a font, an image or a file that fails, and the licence texts of the icons are next to the theme stylesheet; every icon of `$icons` is a mask of 1em that paints pixels in the color of the text (screenshots); the icons of the skins and of `ds-icon` have the size and the color of their text, and follow a change of color; in forced colors, they stay visible, in the system color of a text, a link or a button; right to left, they are neither mirrored nor moved.

Playwright (`playwright`, pinned) runs the Chromium of its version: download it once with `npx playwright install chromium` (CI: `--with-deps`, with the system libraries). Without that download, `CHROMIUM_PATH` makes the tests run an installed Chromium of a close version instead: `CHROMIUM_PATH=/path/to/chromium npm run test:browser`.

### Testing a new component

1. Unit tests, `<name>.spec.tsx` next to the component: import it (`import './<name>'`), render it with `renderPage()`, check its classes, attributes, events and methods; give it what the simulated DOM lacks with the helpers above.
2. Browser tests, `<name>.browser.ts`, for what needs a browser: the keyboard and the focus, a form, the layout, the viewport, the transitions. Run `npm run build:all`, then `npm run test:browser`.

```ts
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, mount } from '../../../test/helpers/browser';

it('Space checks a toggle', async () => {
  const toggle = await mount<HTMLDsToggleElement>('<ds-toggle type="checkbox" label="Terms"></ds-toggle>');
  toggle.focus();
  await userEvent.keyboard(' ');
  expect([toggle.checked, focused()]).toEqual([true, toggle]);
});
```

## Archived code

Code removed from the development branch is kept unchanged on two archive branches, `archive/propal` and `archive/external-integrations`. `archive/propal` holds, in `archived/`, the components `ds-button`, `ds-video`, `ds-marquee` and `ds-rating-list`, the demo (`ds-main` and the controls of the dev pages) and the `legacy` theme. See [docs/propal-archive.md](docs/propal-archive.md) for their content and how to read or restore files from them.

## License

MIT, see [LICENSE](LICENSE).
