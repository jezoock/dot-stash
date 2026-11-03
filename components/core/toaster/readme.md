# ds-toaster

## Styling

- **Classes**: `<ds-toaster>` renders a `div` with the main class, `ds-toaster`, its modifiers (the default theme reads `--success`, `--warning` and `--error`), `--v-pos-<top|middle|bottom>` and `--h-pos-<left|center|right>` (`position`), and `--shown` or `--hidden`.
- **Elements**: `__container` (the box of the toasts), `__toast` (one per displayed message), its `__content` and `__message`.
- **Attributes** (reflected): `position`, `messages`, `max-displayed-toast`, `mods`.
- **Structure** (`toaster.scss`): a fixed box on the side and at the edge of its position, above the page (`--ds-toaster-z-index`), that slides in from its top or bottom edge when it is rendered. `--hidden` fades it out (opacity and visibility, 0.3 s): `show()` and `hide()` emit `toasterShown` and `toasterHidden` at the end of that transition. The pointer goes through the toaster, except on the box, which is at least `--ds-toaster-min-width` wide, at most half the screen.
- **Look** (default theme, `components/_toaster.scss`): the box of the toasts (padding, colors, font, shadow) and the space between the toasts, from the custom properties below, set on `ds-toaster`. The `success`, `warning` and `error` modifiers set `--ds-toaster-background` to their status color.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-toaster {
  --ds-toaster-min-width: min(500px, 100vw - 2rem);
}

.ds-toaster.--success {
  --ds-toaster-background: var(--ds-color-primary-dark);
}
```

<!-- Auto Generated Below -->


## Overview

Toast messages in a fixed box. Hidden until `show()` or `displayToast()`; a click hides it.
The `--shown` / `--hidden` classes fade it in and out: `toasterShown` and `toasterHidden` are emitted
at the end of that transition.

## Properties

| Property            | Attribute             | Description                                                                                                                                                                                                                                         | Type                                                                 | Default                                                                          |
| ------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `closingDelay`      | `closing-delay`       | Delay in ms before `displayToast()` hides the toaster; `0` keeps it shown.                                                                                                                                                                          | `number`                                                             | `3000`                                                                           |
| `maxDisplayedToast` | `max-displayed-toast` | Maximum number of toasts displayed: the last `maxDisplayedToast` messages, the oldest ones are dropped first. `0` displays them all.                                                                                                                | `number`                                                             | `3`                                                                              |
| `messages`          | `messages`            | The messages, one toast each, from the oldest to the newest: an array, or a comma-separated string.                                                                                                                                                 | `string \| string[]`                                                 | `undefined`                                                                      |
| `mods`              | `mods`                | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                  | `string \| string[]`                                                 | `[]`                                                                             |
| `position`          | `position`            | Vertical then horizontal position: `[TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION]`, or as an attribute a comma-separated string (`position="bottom,right"`). Vertical: `top`, `middle`, `bottom`; horizontal: `left`, `center`, `right`. | `[TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION] \| string` | `[     TOASTER_VERTICAL_POSITION.TOP,     TOASTER_HORIZONTAL_POSITION.LEFT,   ]` |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `toasterHidden` |             | `CustomEvent<any>` |
| `toasterHide`   |             | `CustomEvent<any>` |
| `toasterShow`   |             | `CustomEvent<any>` |
| `toasterShown`  |             | `CustomEvent<any>` |


## Methods

### `displayToast() => Promise<void>`

Shows the toaster, then hides it after `closingDelay` ms (counted from the last call).

#### Returns

Type: `Promise<void>`



### `hide() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`



#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                      | Description                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `--ds-toaster-background` | Background of the toasts. The `success`, `warning` and `error` modifiers set it to their status color. |
| `--ds-toaster-color`      | Text color of the toasts.                                                                              |
| `--ds-toaster-font-size`  | Font size of the toasts.                                                                               |
| `--ds-toaster-gap`        | Space between two toasts.                                                                              |
| `--ds-toaster-min-width`  | Minimum width of the box of the toasts.                                                                |
| `--ds-toaster-padding`    | Padding of the box of the toasts.                                                                      |
| `--ds-toaster-shadow`     | Shadow of the box of the toasts.                                                                       |
| `--ds-toaster-z-index`    | Stack level of the toaster.                                                                            |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
