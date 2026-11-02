# Archived from the development branch

Code removed from the dot-stash library, kept unchanged. Nothing is developed here.

- **Source**: branch `claude/intelligent-pasteur-rwiqsn`, commit `f4ff816d1553b985f4935f0427b88f698da07010` (`f4ff816`), the last commit before the removal.
- **Layout**: each folder below mirrors the repository root of that commit: `archived/components/ds-button/components/core/button/button.tsx` was `components/core/button/button.tsx`. To restore one, copy its content back to the repository root.

```sh
git fetch origin archive/propal
git ls-tree -r --name-only origin/archive/propal -- archived
git show origin/archive/propal:archived/components/ds-marquee/components/core/marquee/marquee.tsx
git checkout origin/archive/propal -- archived/components/ds-marquee   # then move its components/ and scss/ to the root
```

## Components (`archived/components/<tag>/`)

Each folder holds the component folder (`.tsx`, types, structural `.scss`, spec, generated `readme.md`) and its skins from both themes of the time (`default`, `legacy`).

| Folder           | Files                                                                                                                                                                    | Depended on                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ds-button`      | `components/core/button/` (`button.tsx`, `button.types.ts`, `button.scss`, `button.spec.tsx`, `readme.md`), skins `scss/themes/{default,legacy}/components/_button.scss` | `utils/props` (`toClassList`). Skin: the `.ds-button` class and its modifiers (`xs`…`xl`, `stl-1`…`stl-3`, `rounded`, `shadow`); tokens `font-style button`, `font-size 100`–`400`, `space 1`–`6`, `radius sm`/`pill`, colorsets `solid`/`outlined` `primary`, `secondary`, `gray` (+ `-hover`), `shadow base`. The `.ds-button` skin stays in the library's `default` theme: `ds-trigger type="button"` renders that class. |
| `ds-video`       | `components/core/video/` (`video.tsx`, `video.scss`, `video.spec.tsx`, `readme.md`)                                                                                      | `utils/props` (`isTrue`, `toArray`, `toClassList`), `utils/debounce`; renders `ds-button` for its play / pause / mute / unmute controls (`mods` `video-player`, …). No theme skin.                                                                                                                                                                                                                                           |
| `ds-marquee`     | `components/core/marquee/` (`marquee.tsx`, `marquee.types.ts` with `DSMarqueeTransitionEnum`, `marquee.scss`, `marquee.spec.tsx`, `readme.md`)                           | `utils/env` (`touchSupport`), `utils/props` (`isTrue`, `toClassList`, `toNumber`). No theme skin.                                                                                                                                                                                                                                                                                                                            |
| `ds-rating-list` | `components/core/rating-list/` (`rating-list.tsx`, `rating-list.scss`, `readme.md`; no spec), skins `scss/themes/{default,legacy}/components/_rating-list.scss`          | `utils/props` (`fromJSON`, `toNumber`). Skins: `.ds-rating`, `.ds-rating-list__average`, token `color secondary base`. Its structural stylesheet also places `ds-grade-star` (`toSort-propal/grade-star` on this branch).                                                                                                                                                                                                    |

The utilities they used (`components/utils/props`, `env`, `debounce`) are public API of the library and stay there. `components/core/mods.spec.tsx` covered `ds-button`, `ds-marquee` (class `DSSlideMsg`) and `ds-video` (`['ds-button', DSButton, 'ds-button', 'host']`…): add them back when restoring one, then run `npm run build` to regenerate `components/components.d.ts` and the readmes.

## Demo (`archived/demo/`)

- `components/demo/`: `ds-main` (`main.tsx`, `main.spec.tsx`, `readme.md`), the demo component of the dev pages. It used `ds-block`, `ds-toggle`, `ds-slider`, `ds-slider-item`, `ds-button`, `ds-trigger`, `ds-heading`, `ds-title-bar`, `ds-icon`, `ds-panel-group`, `ds-panel`, `ds-combo` (and `combo.types`), `ds-rsp`, `ds-grid` and `ds-grid-item`.
- `index.html` (served by `npm run serve:theme`) and `components/index.html` (Stencil dev server): the dev pages that rendered `<ds-main>`, with the theme switcher (`<select>`, `localStorage` key `ds-demo-theme`, themes `default` and `legacy`), the runtime color control (sets `--ds-color-primary-base` on `<html>`) and the `ds-rsp` `refresh()` call after a theme change. `components/index.html` read the theme from `/css/`, the copy of `dist/css/*.css` made by the Stencil `www` output target (`copy` in `stencil.config.ts`).

## Legacy theme (`archived/themes/legacy/`)

`scss/themes/legacy/`: the whole `legacy` theme, the look of the site the library comes from (gold primary, Montserrat and Mulish, uppercase titles, site-specific modifiers and page classes): `_tokens.scss`, `_fonts.scss`, `_animations.scss`, `_base.scss`, `layout/`, `components/`, `pages/`, `index.scss`.

- It is built on the engine of the source commit (`scss/engine/`): `_tokens.scss` loads `scss/engine/tools/references` (`ds-ref()`) and configures the engine with `@forward '../../engine' with (…)`, adding tokens of its own (`status danger`, `shadow` shades, `overlay`, `surface`, `border`, font families `body`, `heading`, `text`, `caption`).
- `_fonts.scss` points at `../fonts/` (`dist/fonts/`): the Montserrat, Mulish and `ds-icons` font files were never part of the repository.
- To build it again: copy it back to `scss/themes/legacy/`, add `'legacy'` to `themes` in `dot-stash.config.mjs` (gulp then writes `dist/css/legacy.css`). The tests that checked it (configured values, no color literal or font name in its skins, selectors matching the rendered classes) are in `components/sass.spec.ts` of the source commit.
