# ds-loader

A loading indicator: a spinner while the time left is unknown, or a bar filled to the progress when it is known.

```html
<ds-loader label="Loading the results"></ds-loader>
<ds-loader label="Uploading photo.jpg" value="40" show-label></ds-loader>
```

## Styling

- **Classes**: `ds-loader` on `<ds-loader>`; `--indeterminate` (a spinner) or `--determinate` (a bar, with a `value`), `--inline` (`inline`), `--sm`, `--md` or `--lg` (`size`); `mods` → `--<mod>`.
- **Elements**: `__spinner` (indeterminate), or `__track` and its `__bar` (determinate: its inline `width` is the progress, `value` of `max`); `__label`, the visible label (`show-label`), after the indicator.
- **Attributes** (reflected): `inline`, `size`, `mods`; `role="progressbar"`, `aria-label` and, determinate, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` (see [Accessibility](#accessibility)).
- **Structure** (`loader.scss`): a row of the indicator and its label, `--ds-loader-gap` apart: a block, its content centered (a bar takes the width left), or an inline box in the middle of the line of the text (`--inline`: the bar `--ds-loader-bar-width` wide). The bar is filled from the start side of its track (the right, from right to left), and clipped by it.
- **Look** (default theme, `components/_loader.scss`): the indicator has the font size `--ds-loader-size`: `ds-token(font-size, 400)` (1.5rem, `md`) by default, `200` for `sm`, `400` for `md`, `800` for `lg`, and the size of the text for `inline` (unless a `size` is given). The spinner is the `spinner` icon (an open circle, a square of 1em) in the primary color, turning once in 2 s (the `spin()` mixin); the bar is a pill of 0.25 em, filled in the primary color on a light gray track, its width changing in 0.2 s. The label is a text of the page. In forced colors, the spinner and the filled part take the color of the text around them (as the icons) and the track has an outline (its transparent border): both show.
- **Less motion** (`prefers-reduced-motion: reduce`): the spinner keeps turning, once in 4 s (the loading indicators are an exception of the base styles, see [Less motion](../../../README.md#less-motion)); the bar changes at once.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-loader {
  --ds-loader-color: var(--ds-color-secondary-base);
}

.toolbar ds-loader {
  --ds-loader-size: 1.25rem;
}
```

## Accessibility

- **Role**: a WAI-ARIA `progressbar` (`role="progressbar"` on the element), as a native `<progress>`: indeterminate without `value` (no `aria-valuenow`: assistive technologies say it is busy, with no value), determinate with it: `aria-valuenow` (the value, clamped to 0…`max`), `aria-valuemin="0"`, `aria-valuemax` (`max`, 100 by default): screen readers say the percentage. Its content is presentational (the children of a progress bar are not read): the spinner, the bar and the visible label are not read on their own.
- **Name** (required): `label` (`aria-label`), what loads ("Loading the results", "Uploading photo.jpg"); `Loading` without it, in English: give it in the language of the page. An `aria-labelledby` of the page on the element names it instead (a visible title of the area that loads). `show-label` shows the name next to the indicator (the name and the visible text are the same: WCAG 2.5.3).
- **Not a live region**: a loader that appears is not announced, nor is a value that changes (a progress bar that speaks at each step would cover the rest). Mark the region that loads `aria-busy="true"` until its content is there (as `ds-ajax` does), and tell the end of a long load with a status message (`ds-alert live="polite"`: "12 results"), or move the focus to the loaded content. Screen reader users find the loader in the reading order, and its value when they reach it.
- **No focus, no keys**: it is not interactive. Do not put it in a button (the name of the button would include it): change the name of the button while it loads, or disable it and show the loader next to it.
- **Motion** (WCAG 2.2.2 Pause, Stop, Hide; 2.3.3 Animation from Interactions): the spinner turns as long as the load lasts, which may be more than 5 seconds. A loading indicator is the case the understanding of 2.2.2 names as essential: without it, the user cannot tell a load from a page that froze. With less motion, it keeps turning, at half speed, rather than a pulse or a still icon: the rotation of a small icon in its place (1 em to 2.25 rem, no movement across the page, no zoom, no parallax) is not the motion that causes discomfort to the users who ask for less of it, and it stays the sign of a load the user knows, as for the other indicators of the library (`ds-ajax`, `ds-icon type="loading"`). A determinate bar does not move by itself: its width follows the progress, at once with less motion.
- **Forced colors**: the spinner, the filled part of the bar and the outline of its track show, in the color of the text around them.

```html
<section aria-busy="true" aria-labelledby="results-title">
  <h2 id="results-title">Results</h2>
  <ds-loader aria-labelledby="results-title"></ds-loader>
</section>

<button type="submit" disabled>Save</button> <ds-loader inline label="Saving your changes"></ds-loader>
```

```js
const upload = document.querySelector('#upload');
upload.value = 40; // aria-valuenow="40": "40%"
upload.value = undefined; // indeterminate again: a spinner
```

## Examples

```html
<ds-loader></ds-loader>
<ds-loader size="sm" label="Loading the comments"></ds-loader>
<ds-loader size="lg" label="Loading the map" show-label></ds-loader>
<ds-loader value="3" max="8" label="Sending the files" show-label></ds-loader>
<p>Address <ds-loader inline size="sm" label="Checking the address"></ds-loader></p>
```

**New**: `ds-loader` is new. `ds-ajax` keeps its own spinner (the `arrows-cw` icon in its `::after`, with `aria-busy` on its target).

<!-- Auto Generated Below -->


## Overview

A loading indicator (WAI-ARIA `progressbar`), named by `label` ("Loading" by default). Indeterminate by default: a
spinner, without a value. Determinate when `value` is a number: a bar filled to `value` of `max` (100 by default), with
`aria-valuenow`, `aria-valuemin` and `aria-valuemax`, as a native `<progress>`. Block by default (centered in its
container, a bar as wide as it), or `inline` (in the line of the text, at its size); `size` `sm`, `md` or `lg`.

It is not a live region: a page tells the start and the end of a load with `aria-busy` on the region that loads, and a
status message (a polite `ds-alert`) when it matters. With less motion, the spinner keeps turning, more slowly.

## Properties

| Property    | Attribute    | Description                                                                                                                    | Type                   | Default     |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------- |
| `inline`    | `inline`     | In the line of the text, at its size (`--inline`), instead of a block centered in its container.                               | `boolean`              | `false`     |
| `label`     | `label`      | The accessible name of the loader (`aria-label`): what loads. `Loading` by default: give it in the language of the page.       | `string`               | `undefined` |
| `max`       | `max`        | The value of a complete progress (`aria-valuemax`): 100 by default, and for a value that is not a number above 0.              | `number \| string`     | `undefined` |
| `mods`      | `mods`       | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                             | `string \| string[]`   | `[]`        |
| `showLabel` | `show-label` | Shows the label next to the indicator, instead of only giving it to assistive technologies.                                    | `boolean`              | `false`     |
| `size`      | `size`       | The size of the indicator: `sm`, `md` or `lg` (its `--<size>` class). Without it, `md`, or the size of the text when `inline`. | `"lg" \| "md" \| "sm"` | `undefined` |
| `value`     | `value`      | The progress, from 0 to `max`: a determinate loader (a bar), else an indeterminate one (a spinner). Clamped to 0…`max`.        | `number \| string`     | `undefined` |


## CSS Custom Properties

| Name                      | Description                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ds-loader-bar-height`  | Thickness of the bar.                                                                                                                                   |
| `--ds-loader-bar-width`   | Width of the bar of an inline loader (a block one is as wide as its container).                                                                         |
| `--ds-loader-color`       | Color of the spinner and of the filled part of the bar.                                                                                                 |
| `--ds-loader-gap`         | Space between the indicator and its visible label.                                                                                                      |
| `--ds-loader-radius`      | Corner radius of the bar.                                                                                                                               |
| `--ds-loader-size`        | Size of the indicator: its font size (the spinner is a square of 1em, the bar is `--ds-loader-bar-height` thick). `sm`, `md`, `lg` and `inline` set it. |
| `--ds-loader-track-color` | Color of the bar that is not filled yet (the track).                                                                                                    |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
