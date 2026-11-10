# ds-toaster

## Styling

- **Classes**: `<ds-toaster>` renders a `div` with the main class, `ds-toaster`, its modifiers (the default theme reads `--success`, `--warning` and `--error`), `--v-pos-<top|middle|bottom>` and `--h-pos-<left|center|right>` (`position`), and `--shown` or `--hidden`.
- **Elements**: `__container` (the box of the toasts), `__toast` (one per displayed message), its `__content` and `__message`; `__live`, the live region (see [Accessibility](#accessibility)), a paragraph per displayed message while the toaster is shown.
- **Attributes** (reflected): `position`, `messages`, `max-displayed-toast`, `mods`.
- **Structure** (`toaster.scss`): a fixed box on the side and at the edge of its position, above the page (`--ds-toaster-z-index`), that slides in from its top or bottom edge when it is rendered. `--hidden` fades it out (opacity and visibility, 0.3 s): `show()` and `hide()` emit `toasterShown` and `toasterHidden` at the end of that transition, or at once when it does not run (durations of 0), or once its duration is over when the event does not come. With less motion (`prefers-reduced-motion: reduce`), it neither slides in nor fades. The pointer goes through the toaster, except on the box, which is at least `--ds-toaster-min-width` wide, at most half the screen. The live region is hidden on the screen (a 1 px clipped box), but not from screen readers, even while the toaster is hidden.
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

## Accessibility

The toaster announces its messages to screen readers through a live region (WAI-ARIA [alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) and status messages, WCAG 4.1.3).

- **Live region**: `.ds-toaster__live`, rendered from the first render of the component, empty, hidden on the screen only. It is `role="status"` with `aria-live="polite"` (announced when the screen reader is idle), or, with the `error` modifier (`mods="error"`), `role="alert"` with `aria-live="assertive"` (announced at once); `aria-atomic="false"`: only what changes is announced. `success`, `warning` and no modifier are polite.
- **Announcements**: `show()` and `displayToast()` write the displayed messages in the live region, one paragraph each; `hide()` empties it. A message added while the toaster is shown is announced alone. So that the region exists before the messages come, put `<ds-toaster>` in the page when it loads, not right before a message, and give it its `mods` there: a region whose role changes is not announced reliably (use a toaster per level, `<ds-toaster mods="error">` for the errors).
- **Toasts**: the box on the screen (`.ds-toaster__container`) is `aria-hidden="true"`: the live region has the same text, read once.
- **Focus**: the toaster never takes the focus, and has no focusable element. A click hides it; on the keyboard, it hides after `closing-delay` (`displayToast()`).
- **Time to read** (WCAG 2.2.1, Timing Adjustable): the toasts of `displayToast()` go away after `closing-delay` ms, a time limit on reading them. The user can extend it: the countdown pauses while the pointer is over the toasts (the box of the toasts; the rest of the toaster lets the pointer through) or while the focus is in the toaster, and starts again from the whole `closing-delay` when they leave it. A fresh delay rather than the time that was left: the user who paused it was reading, and the toasts never vanish the instant the pointer leaves them. `closing-delay="0"` keeps the toaster shown until a click or the page hides it (`hide()`). The pause needs a pointer: the toaster has no focusable element, so that it never takes the focus, and a user of the keyboard alone cannot pause it. So give the messages the time they need to be read without a pause:
  - 3000 ms (the default) only for a message of a few words;
  - at least 5000 ms for a sentence, and about one second more for every three words beyond the first ten (a slow pace of reading, 180 words a minute);
  - `closing-delay="0"`, and a `hide()` from the page, for a long message, a message the user must act on or remember (an error, a code), and when the user may not be looking at the corner of the screen. A message of the page that stays, a `ds-alert` with `live`, suits these better than a toast.

  The live region gets the messages when the toaster shows them, and is emptied when it hides: a delay long enough to read the toasts also leaves a screen reader the time to announce them (whether a screen reader still reads a polite message removed before its turn depends on the screen reader).

```html
<ds-toaster id="notices" position="bottom,right"></ds-toaster>
<ds-toaster id="errors" mods="error" position="bottom,right"></ds-toaster>
```

```js
const notices = document.querySelector('#notices');
notices.messages = ['Changes saved'];
notices.displayToast(); // "Changes saved", announced when the screen reader is idle
```

**Changed**: the live region and the `aria-hidden` box are new. The countdown of `displayToast()` pauses while the pointer is over the toasts or the focus is in the toaster (it ran to its end before).

<!-- Auto Generated Below -->


## Overview

Toast messages in a fixed box. Hidden until `show()` or `displayToast()`; a click hides it.
The `--shown` / `--hidden` classes fade it in and out: `toasterShown` and `toasterHidden` are emitted
at the end of that transition.

Screen readers announce the messages through a live region, rendered from the start, empty, and hidden on the
screen: `role="status"` (`aria-live="polite"`), or `role="alert"` (`aria-live="assertive"`) with the `error`
modifier. Shown, the toaster writes its messages in it; hidden, it empties it. The toasts on the screen are
`aria-hidden`: the live region holds the same text. The toaster never takes the focus.

The countdown of `displayToast()` pauses while the pointer is over the toasts or the focus is in the toaster, and starts
again, from `closingDelay`, when they leave it (WCAG 2.2.1, Timing Adjustable).

## Properties

| Property            | Attribute             | Description                                                                                                                                                                                                                                                                                                                                                        | Type                                                                 | Default                                                                          |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `closingDelay`      | `closing-delay`       | Delay in ms before `displayToast()` hides the toaster; `0` keeps it shown. The countdown pauses while the pointer is over the toasts or the focus is in the toaster, and starts again from this delay when they leave it. Leave the time to read the messages: 5000 at least for a sentence, more for a longer text (see the Accessibility section of the readme). | `number`                                                             | `3000`                                                                           |
| `maxDisplayedToast` | `max-displayed-toast` | Maximum number of toasts displayed: the last `maxDisplayedToast` messages, the oldest ones are dropped first. `0` displays them all.                                                                                                                                                                                                                               | `number`                                                             | `3`                                                                              |
| `messages`          | `messages`            | The messages, one toast each, from the oldest to the newest: an array, or a comma-separated string.                                                                                                                                                                                                                                                                | `string \| string[]`                                                 | `undefined`                                                                      |
| `mods`              | `mods`                | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                                                                 | `string \| string[]`                                                 | `[]`                                                                             |
| `position`          | `position`            | Vertical then horizontal position: `[TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION]`, or as an attribute a comma-separated string (`position="bottom,right"`). Vertical: `top`, `middle`, `bottom`; horizontal: `left`, `center`, `right`.                                                                                                                | `[TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION] \| string` | `[     TOASTER_VERTICAL_POSITION.TOP,     TOASTER_HORIZONTAL_POSITION.LEFT,   ]` |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `toasterHidden` |             | `CustomEvent<any>` |
| `toasterHide`   |             | `CustomEvent<any>` |
| `toasterShow`   |             | `CustomEvent<any>` |
| `toasterShown`  |             | `CustomEvent<any>` |


## Methods

### `displayToast() => Promise<void>`

Shows the toaster, then hides it after `closingDelay` ms (counted from the last call). The countdown pauses while the
pointer is over the toasts or the focus is in the toaster, and starts again from `closingDelay` when they leave it.

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
