# ds-thumb

A thumbnail: an image of fixed proportions, cropped to fill them and loaded lazily, with a placeholder of initials on a color of its own when it has no source or fails: a poster, an album cover, a channel logo.

```html
<ds-thumb src="/posters/matrix.jpg" alt="The Matrix" ratio="2/3"></ds-thumb>
<ds-thumb label="France Culture" ratio="1"></ds-thumb>
```

## Loading

- **Lazily**: the image has `loading="lazy"` (it is requested as it nears the viewport) and `decoding="async"`; `loading="eager"` requests it at once (a thumbnail at the top of the page). `srcset` and `sizes` give the browser the candidates of the image.
- **State**: `--loading` while the image loads (the theme shows the background of the thumbnail, the image fades in once loaded), `--loaded` once loaded, `--error` when it fails. An image loaded from the cache before the component listened is found loaded at its first render.
- **Placeholder** (`--placeholder`): without `src` nor `srcset`, or once the image failed (it is then removed: no broken image icon), the initials of `label` (else of `alt`) on a color: the first letter of its first word, and of its last word when it has several (`The Matrix` → `TM`, `Arte` → `A`), in the upper case of the language of the page. A new `src` loads again.
- **Color**: the hue comes from the text of the label (an FNV-1a hash of its words, in lower case, modulo 360: the same label always gets the same color, two labels different colors most of the time), set by the component on the placeholder (`--ds-thumb-hue`); the saturation and the lightness are the theme's (`--ds-thumb-placeholder-saturation`, `--ds-thumb-placeholder-lightness`), chosen so that the initials are readable on every hue.

## Styling

- **Classes**: `ds-thumb` on `<ds-thumb>`; `--loading`, `--loaded` or `--error` (the image), `--placeholder` (no source, or the image failed); `mods` → `--<mod>`.
- **Elements**: `__image` (the `img`), or `__placeholder` with `__initials`.
- **Attributes** (reflected): `ratio`, `mods`.
- **Custom properties set by the component**: `--ds-thumb-ratio` (from `ratio`: `2 / 3`; a square without a valid one) on `<ds-thumb>`, `--ds-thumb-hue` (0 to 359) on the placeholder.
- **Structure** (`thumb.scss`): a block (`display: block`, the width of its container, or the width a layout gives it), its height from its proportions (`aspect-ratio`), which clips its content; the image fills it (`object-fit: cover`: cropped, never stretched); the placeholder covers it, its initials centered on one line. The placeholder is a size container: the initials take a size relative to the thumbnail (`cqmin`).
- **Look** (default theme, `components/_thumb.scss`): a radius (`ds-radius(md)`) and a light gray background while the image loads; the image fades in (0.2 s, at once with less motion: the base styles); the placeholder `hsl(var(--ds-thumb-hue) 45% 30%)`, its initials white, bold, in the font of the titles, 40% of the smaller side of the thumbnail. With these, the contrast of the initials is 4.5:1 at least on every hue (5.2:1 on the lightest, the yellows): keep the lightness at 30% or below with white initials. In forced colors, the placeholder takes the background and the text of the system.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-thumb {
  --ds-thumb-radius: 0;
  --ds-thumb-placeholder-saturation: 30%;
}

.dark ds-thumb {
  --ds-thumb-background: var(--ds-color-gray-darker);
}
```

## Accessibility

- **Name**: the image is named by `alt`, else by `label` (an `img` with that `alt`); the placeholder that replaces it gets the same name (`role="img"`, `aria-label`), so that the thumbnail says the same thing whether its image loaded or not. The initials are not read (`aria-hidden`). Write the `alt` as the content of the image ("The Matrix", "Poster of The Matrix"), not as its file name.
- **Decorative**: `decorative`, or an empty `alt` (`alt=""`): the image has an empty alternative and the placeholder is `aria-hidden`, out of the accessibility tree. Use it for a thumbnail next to a text that names the same thing (a tile with its title under the poster): the name would be read twice. A thumbnail without `alt` nor `label` is not read either.
- **No role of its own, no focus, no keys**: put the thumbnail in the link or the button of its tile; it is part of its name, unless it is decorative.
- **Color**: the color of the placeholder tells nothing (it only tells two labels apart at a glance); the initials are readable on every hue (4.5:1 at least with the `default` theme).
- **Motion**: the fade of the image is the only one; with less motion, it ends at once (the base styles of the theme).

```html
<!-- A tile: its title names the link, the poster is decorative -->
<a href="/movies/matrix" class="tile">
  <ds-thumb src="/posters/matrix.jpg" ratio="2/3" decorative></ds-thumb>
  <span>The Matrix</span>
</a>

<!-- A poster alone in a link: it names the link -->
<a href="/movies/matrix"><ds-thumb src="/posters/matrix.jpg" alt="The Matrix" label="The Matrix" ratio="2/3"></ds-thumb></a>
```

## Texts

`ds-thumb` has no text of its own: `alt` and `label` are texts of the page, in its language. The initials are written in the upper case of the language of the page (the closest `lang`: `istanbul` gives `İ` in Turkish).

## Examples

```html
<ds-thumb src="/covers/kind-of-blue.jpg" srcset="/covers/kind-of-blue-300.jpg 300w, /covers/kind-of-blue-600.jpg 600w" sizes="150px" alt="Kind of Blue" ratio="1"></ds-thumb>
<ds-thumb src="/stills/episode-3.jpg" alt="Episode 3" ratio="16/9" loading="eager"></ds-thumb>
<ds-thumb label="Le Monde diplomatique" ratio="1" decorative></ds-thumb>
```

## Limits

- One image, cropped from its center (`object-fit: cover`): give a `object-position` to the image (`.ds-thumb__image`) for another focus.
- The placeholder shows the initials of the label; a logo or an icon of a placeholder is a source of its own (`src`).
- The hue of a label is stable, but two labels can share it.

**New**: `ds-thumb` is new.

<!-- Auto Generated Below -->


## Overview

A thumbnail: an image of fixed proportions (`ratio`: `2/3` for a poster, `1` for a cover, `16/9` for a still), cropped
to fill them, loaded lazily (`loading="lazy"`, `decoding="async"`). Its state is a class: `--loading`, `--loaded`,
`--error`. Without a source, or when it fails, a placeholder takes its place: the initials of `label` (one or two
letters) on a color of its own, its hue taken from the text (`--ds-thumb-hue`), its saturation and lightness from the
theme, so that the initials stay readable.

The image is named by `alt` (else by `label`), as the placeholder that replaces it (`role="img"`); `decorative` (or an
empty `alt`) leaves both out of the accessibility tree, for a thumbnail next to a text that names it.

## Properties

| Property     | Attribute    | Description                                                                                                                                          | Type                 | Default     |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `alt`        | `alt`        | The text alternative of the image (and of the placeholder). Without it, `label`. An empty `alt` makes it decorative.                                 | `string`             | `undefined` |
| `decorative` | `decorative` | A decorative thumbnail: no text alternative, out of the accessibility tree (a text next to it names the same thing).                                 | `boolean`            | `false`     |
| `label`      | `label`      | The text the placeholder takes its initials and its color from: the title of the poster, the name of the album. The name of the image without `alt`. | `string`             | `undefined` |
| `loading`    | `loading`    | When the image loads: `lazy` (as it nears the viewport, by default) or `eager` (at once: a thumbnail at the top of the page).                        | `"eager" \| "lazy"`  | `'lazy'`    |
| `mods`       | `mods`       | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                   | `string \| string[]` | `[]`        |
| `ratio`      | `ratio`      | The proportions, width / height: `2/3`, `16/9`, `1.5`, `1` (`16:9` too). A square by default, and for a value that is not one.                       | `string`             | `'1'`       |
| `sizes`      | `sizes`      | The widths of the image in the layout, for a `srcset` of widths (`sizes` of the `img`).                                                              | `string`             | `undefined` |
| `src`        | `src`        | The URL of the image. Without it, the placeholder.                                                                                                   | `string`             | `undefined` |
| `srcset`     | `srcset`     | The candidates of the image for the densities or widths of the screen (`srcset` of the `img`).                                                       | `string`             | `undefined` |


## CSS Custom Properties

| Name                                | Description                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--ds-thumb-background`             | Background of the thumbnail while its image loads (and behind an image with transparent parts).            |
| `--ds-thumb-hue`                    | The hue of the placeholder, from 0 to 359, taken from its label. Set by the component, on the placeholder. |
| `--ds-thumb-initials-color`         | Color of the initials.                                                                                     |
| `--ds-thumb-initials-size`          | Font size of the initials (relative to the thumbnail: `40cqmin`).                                          |
| `--ds-thumb-placeholder-lightness`  | Lightness of the color of the placeholder (a percentage): dark enough for the initials.                    |
| `--ds-thumb-placeholder-saturation` | Saturation of the color of the placeholder (a percentage).                                                 |
| `--ds-thumb-radius`                 | Corner radius of the thumbnail.                                                                            |
| `--ds-thumb-ratio`                  | The proportions of the thumbnail, width / height (`2 / 3`). Set by the component, from `ratio`.            |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
