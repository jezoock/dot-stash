# ds-range

A native range input, with a track filled up to its value (and, optionally, up to a second value: the part of a video loaded already). The input stays the control: its role, its name, its keys, its value and its form are the browser's.

```html
<label for="volume">Volume</label>
<ds-range><input id="volume" name="volume" type="range" min="0" max="100" value="40" /></ds-range>
```

## The input

Write one `<input type="range">` in the range, as a direct child, and name it as any input: a `<label for>` of the page, or its `aria-label`. The range never moves, names nor replaces it: it adds a class to it (`ds-range__input`) and a track before it (`__track`, `aria-hidden`), and, with a value text, its `aria-valuetext`. Removed, it takes them back.

The range follows the input: the `input` and `change` events of the user (the pointer, the arrows, Page Up, Page Down, Home, End), the attributes `min`, `max`, `step`, `value` and `disabled` (and a disabled `<fieldset>` around it), a form reset, and an input replaced by another one. A value set by a script on the `value` property (the position of a video at each `timeupdate`) dispatches no event: call `refresh()` after it.

```js
const position = document.querySelector('#position');
video.addEventListener('timeupdate', () => {
  position.querySelector('input').value = video.currentTime;
  position.buffer = video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0;
  position.refresh();
});
```

## Styling

- **Classes**: `ds-range` on `<ds-range>`; `--buffer` (a `buffer` is given), `--disabled` (the input is disabled, by its own `disabled` or by a `<fieldset>` around it); `mods` → `--<mod>`.
- **Elements**: `__track` (created before the input, `aria-hidden`) with `__buffer` and `__fill`; `__input`, the class added to the input.
- **Custom properties set by the component**: `--ds-range-fill`, the share of the range up to the value (`42.5%`: (`value` − `min`) / (`max` − `min`)), and `--ds-range-buffer`, the share up to `buffer`, on `<ds-range>`. A stylesheet can read them for a look of its own (a gradient, a tooltip).
- **Structure** (`range.scss`): the input takes the width of the range and the height of its thumb (`--ds-range-thumb-size`); its own track is transparent and its thumb a box of that size (`appearance: none`). The track of the range is under it, centered on its height (`--ds-range-track-height`), from the start side of the input (the right, from right to left), with the buffer and the fill as wide as their shares. The fill ends under the thumb at every value: the browser moves the center of the thumb from half a thumb to the width less half a thumb.
- **Look** (default theme, `components/_range.scss`): a pill track in light gray, the buffer in gray, the fill in the primary color, a white round thumb with a primary border and a light shadow; the range dimmed when disabled. No transition: the fill follows the value at once (less motion has nothing to stop). In forced colors, the track has an outline (its transparent border) and the fill takes the color of the text around it, as the bar of `ds-loader`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-range {
  --ds-range-fill-color: var(--ds-color-secondary-base);
  --ds-range-thumb-size: 0.75rem;
}

.player ds-range {
  --ds-range-track-color: rgba(255, 255, 255, 0.3);
  --ds-range-buffer-color: rgba(255, 255, 255, 0.6);
}
```

## Accessibility

- **Role, keys, focus**: those of the native input, a WAI-ARIA [slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/): the arrows move the value by a `step`, Page Up and Page Down by a larger one, Home and End to the minimum and the maximum (from right to left, the browser reverses the horizontal arrows); the input is in the Tab order and the theme draws the focus outline around it (`:focus-visible`). The track, the buffer and the fill are drawn, not read (`aria-hidden`).
- **Name** (required): a `<label for>` of the page, `aria-labelledby` or `aria-label` on the input ("Volume", "Position"). The range adds none.
- **Value text**: the value is read as a number ("40"). `labels.valueText` gives the input an `aria-valuetext` from a template (`{value}`, `{min}`, `{max}`, `{percent}`: "{percent} %", "Volume {value} of {max}"); `formatter`, a function set as a property, gives it instead of the template, for a text a template cannot write: a time ("1 minute 23 of 45 minutes"), a unit, a word. The range only removes the `aria-valuetext` it set (never one of the page). The buffer is not read: tell it in the value text when it matters.
- **Disabled**: the native `disabled` (or a disabled fieldset): not focusable, not changed, read as unavailable, dimmed by the theme.
- **Live region**: none. A value that changes by itself (the position of a video) is not announced: screen reader users read it when they reach it, as for a native input.
- **Pointer**: the thumb is `--ds-range-thumb-size` (1.125rem, 18 px, by default) and the whole input takes the clicks: a target of 24 px is the minimum of WCAG 2.5.8 when another target is close; give the range a larger thumb (`--ds-range-thumb-size: 1.5rem`), or space around it.

## Texts

`labels` (JSON as an attribute) translates the texts of the range:

| Key         | Default             | What it is                                                                                                                                         |
| ----------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valueText` | `''` (no text: the value) | The template of the `aria-valuetext` of the input: `{value}`, `{min}`, `{max}` and `{percent}` (the share of the range, rounded) are replaced. |

```html
<label for="volume">Volume</label>
<ds-range labels='{"valueText": "{percent} %"}'><input id="volume" type="range" value="40" /></ds-range>
```

```js
// A time, in the language of the page.
const position = document.querySelector('#position');
position.formatter = ({ value, max }) => `${formatTime(value)} sur ${formatTime(max)}`;
```

## Examples

```html
<!-- The position of a video, with the part loaded -->
<label for="seek" class="ds-visually-hidden">Position</label>
<ds-range id="position" buffer="0"><input id="seek" type="range" min="0" max="2700" step="1" value="0" /></ds-range>

<!-- Disabled by its fieldset -->
<fieldset disabled>
  <legend>Balance (soon)</legend>
  <ds-range><input type="range" aria-label="Balance" min="-10" max="10" value="0" /></ds-range>
</fieldset>
```

## Limits

- One input per range, a direct child: a range of two thumbs (a minimum and a maximum) is not supported.
- Horizontal only (no vertical input).
- A value set on the `value` property by a script needs `refresh()` (no event tells it).
- Tested in Chromium only, as the rest of the library: the thumb and the track of the input are drawn with the pseudo-elements of WebKit and Blink (`::-webkit-slider-thumb`) and of Firefox (`::-moz-range-thumb`); Firefox and Safari are not verified yet.

**New**: `ds-range` is new.

<!-- Auto Generated Below -->


## Overview

Enhances a native `<input type="range">` the page writes in it, which stays the control: its role (`slider`), its name
(a `<label>` of the page), its keys (the arrows, Page Up, Page Down, Home, End), its value and its form are the
browser's. The range draws a track under the input, filled from its start side to the value: the share of the range is
the `--ds-range-fill` custom property (`42.5%`), which the component sets on itself, and the theme draws the track and
the thumb from it. `buffer` adds a second part, from the start to another value (the part of a video that is loaded
already: `--ds-range-buffer`).

The range follows the input: the user's `input` and `change` events, the attributes `min`, `max`, `step`, `value` and
`disabled` (its own, or that of a `<fieldset>` around it). A value set by a script on the `value` property tells no
event: call `refresh()` after it. `labels.valueText` (a template) or `formatter` (a function) give the input an
`aria-valuetext`, the text assistive technologies read for its value ("1:23 of 45:00", "40 %").

## Properties

| Property    | Attribute | Description                                                                                                                                                                                                             | Type                              | Default     |
| ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------- |
| `buffer`    | `buffer`  | A second value, on the scale of the input (from its `min` to its `max`): the track is filled to it, under the fill of the value (`__buffer`, `--ds-range-buffer`). The part of a video loaded already. None by default. | `number \| string`                | `undefined` |
| `formatter` | --        | Gives the text of the value (`aria-valuetext`) instead of `labels.valueText`: a function, set as a property (a time, a unit).                                                                                           | `(value: DSRangeValue) => string` | `undefined` |
| `labels`    | `labels`  | The texts of the range (JSON as an attribute), to translate them: `valueText`, the template of `aria-valuetext` (see the readme).                                                                                       | `DSRangeLabels \| string`         | `{}`        |
| `mods`      | `mods`    | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                      | `string \| string[]`              | `[]`        |


## Methods

### `refresh() => Promise<void>`

Reads the input again: after a value set by a script on its `value` property, which tells no event.

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description                                                                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
|      | The control: an `<input type="range">`, a direct child of the range, named by a `<label>` of the page (or its `aria-label`). |


## CSS Custom Properties

| Name                            | Description                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--ds-range-buffer`             | The share of the range up to `buffer` (`80%`): the width of the buffer. Set by the component, from `buffer`.                |
| `--ds-range-buffer-color`       | Color of the buffer (`buffer`), under the fill.                                                                             |
| `--ds-range-fill`               | The share of the range up to the value of the input (`42.5%`): the width of the fill. Set by the component, from the input. |
| `--ds-range-fill-color`         | Color of the fill, up to the value.                                                                                         |
| `--ds-range-radius`             | Corner radius of the track and of the thumb.                                                                                |
| `--ds-range-thumb-border-color` | Color of the border of the thumb.                                                                                           |
| `--ds-range-thumb-color`        | Color of the thumb.                                                                                                         |
| `--ds-range-thumb-size`         | Width and height of the thumb, and height of the input.                                                                     |
| `--ds-range-track-color`        | Color of the track that is not filled.                                                                                      |
| `--ds-range-track-height`       | Thickness of the track.                                                                                                     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
