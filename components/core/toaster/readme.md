# ds-toaster



<!-- Auto Generated Below -->


## Overview

Toast messages in a fixed box. Hidden until `show()` or `displayToast()`; a click hides it.
The `--shown` / `--hidden` classes fade it in and out: `toasterShown` and `toasterHidden` are emitted
at the end of that transition.

## Properties

| Property            | Attribute             | Description                                                                                                                                                                                                                                         | Type                                                                 | Default                                                                          |
| ------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `closingDelay`      | `closing-delay`       | Delay in ms before `displayToast()` hides the toaster; `0` keeps it shown.                                                                                                                                                                          | `number`                                                             | `3000`                                                                           |
| `maxDisplayedToast` | `max-displayed-toast` |                                                                                                                                                                                                                                                     | `number`                                                             | `3`                                                                              |
| `messages`          | `messages`            | The messages, one toast each: an array, or a comma-separated string.                                                                                                                                                                                | `string \| string[]`                                                 | `undefined`                                                                      |
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




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
