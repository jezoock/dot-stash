# ds-modal

## Styling

- **Classes**: `<ds-modal>` has the class `ds-lightbox`, `--overlay` (`overlay`), and the classes of `lightbox-class` (an object or its JSON string, `{"--dialog": true}` by default: `--dialog`). Inside it: `ds-lightbox__container`, which holds the dialog, `ds-modal` (`role="dialog"`), which holds the `slot="title"` and `slot="description"` elements, then `ds-modal__content` (the default slot). A mouse down outside the dialog hides the modal.
- **Attributes**: `shown` (reflected) while the modal is shown.
- **Body class**: while at least one modal of the document is shown, the body has the class `ds-js--modal-open`.
- **Structure** (`modal.scss`): hidden (no `shown` attribute), the modal is not rendered (`display: none`). Shown, it is fixed over the whole screen, above the page (`--ds-modal-z-index`), and centers the dialog, which is at most `--ds-modal-max-width` wide and as high as the screen, then its content scrolls; `body.ds-js--modal-open` does not scroll. No transition: the modal shows and hides at once. The child combinators (`ds-modal > .ds-lightbox__container > .ds-modal`) leave out a `ds-block` in the `modal` context, whose main class is `ds-modal` too.
- **Look** (default theme, `components/_modal.scss`): a dark translucent backdrop (`shadow` `strong`) on the lightbox, `--ds-modal-margin` away from the dialog at least, and a white dialog box with a padding, rounded corners and a shadow, at most as wide as the `xs` breakpoint, from the custom properties below, set on `ds-modal`. The focus indicator is the one of the theme (see [Accessibility](../../../README.md#accessibility)).

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-modal {
  --ds-modal-max-width: 48rem;
  --ds-modal-backdrop: rgb(15 23 42 / 0.75);
}

#confirm {
  --ds-modal-padding: var(--ds-space-6);
}
```

## Accessibility

The modal follows the WAI-ARIA [dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

- **Roles and attributes**: the dialog (`.ds-modal`) has `role="dialog"`, `aria-modal="true"` and `tabindex="-1"`. Name it, always: with a visible title, an element with `slot="title"` (a heading), which it references with `aria-labelledby`; else with `label`, its `aria-label`. An element with `slot="description"` describes it (`aria-describedby`). The component gives these elements an id (`ds-modal-<n>-title`, `ds-modal-<n>-description`) when they have none.
- **Focus**: shown, the modal moves the focus into the dialog, to its first element with an `autofocus` attribute, else to its first focusable element, else to the dialog itself. Hidden, it gives the focus back to the element that had it before (the button that opened it), when the focus is still in the modal. While it is shown, the focus stays in the dialog: Tab after the last focusable element goes to the first one, Shift+Tab before the first one to the last one, and a focus that moves out (a script) is brought back. The rest of the page is not made inert: `aria-modal="true"` tells assistive technologies to stay in the dialog, and the backdrop covers the page.
- **Keyboard**: Escape hides the modal (the one on top when several are shown, one per key press); the event then goes no further (a `ds-sidebar` or a modal under it stays open). Tab and Shift+Tab stay in the dialog.
- **Pointer**: a mouse down on the backdrop hides the modal, without moving the focus (it goes back to the opener).
- Give the dialog a button that hides it, for the pointer and touch users, for example `<button type="button" onclick="this.closest('ds-modal').shown = false">Close</button>`.

```html
<button type="button" onclick="document.querySelector('#confirm').shown = true">Delete…</button>

<ds-modal id="confirm">
  <h2 slot="title">Delete the file?</h2>
  <p slot="description">It will be deleted for good.</p>
  <button type="button" onclick="this.closest('ds-modal').shown = false">Cancel</button>
  <button type="button">Delete</button>
</ds-modal>

<ds-modal label="Image preview"><img src="photo.jpg" alt="A lighthouse at dawn" /></ds-modal>
```

**Changed**: Escape is handled on `keydown` (it was `keyup`, throttled), and only by the modal on top; `label`, the `title` and `description` slots, the ARIA attributes and the focus management are new. A hidden modal is no longer rendered in place: the component stylesheet hides it, and the default theme draws the lightbox.

<!-- Auto Generated Below -->


## Overview

A modal dialog in a lightbox (WAI-ARIA dialog pattern), shown while `shown` is set: a `role="dialog"` element with
`aria-modal="true"`, named by its `slot="title"` element (`aria-labelledby`) or by `label` (`aria-label`), and described by
its `slot="description"` element (`aria-describedby`). Shown, it moves the focus into the dialog (its first element
with `autofocus`, else its first focusable element, else the dialog itself), keeps Tab and Shift+Tab in it, closes on
Escape and on a mouse down outside the dialog, and gives the focus back, when it is hidden, to the element that had it.
While at least one modal of the document is shown, the body has the `ds-js--modal-open` class, which locks the page
scroll (`overflow: hidden`, no inline style): the class is removed when the last shown modal is hidden or removed from
the document.

## Properties

| Property              | Attribute               | Description                                                                                      | Type      | Default                |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ | --------- | ---------------------- |
| `label`               | `label`                 | The accessible name of the dialog (`aria-label`), for a dialog without a `slot="title"` element. | `string`  | `undefined`            |
| `lightboxClass`       | `lightbox-class`        |                                                                                                  | `any`     | `{ '--dialog': true }` |
| `lightboxClassObject` | `lightbox-class-object` |                                                                                                  | `any`     | `undefined`            |
| `overlay`             | `overlay`               |                                                                                                  | `boolean` | `false`                |
| `shown`               | `shown`                 |                                                                                                  | `boolean` | `false`                |


## Events

| Event        | Description | Type               |
| ------------ | ----------- | ------------------ |
| `modalClose` |             | `CustomEvent<any>` |
| `modalOpen`  |             | `CustomEvent<any>` |


## Methods

### `setContent(content: string) => Promise<void>`



#### Parameters

| Name      | Type     | Description |
| --------- | -------- | ----------- |
| `content` | `string` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot            | Description                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
|                 | The content of the dialog.                                                                                    |
| `"description"` | A text that describes the dialog: `aria-describedby` (an id is given to it if it has none).                   |
| `"title"`       | The title of the dialog (a heading), which names it: `aria-labelledby` (an id is given to it if it has none). |


## CSS Custom Properties

| Name                    | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `--ds-modal-backdrop`   | Background of the backdrop, which covers the page behind the dialog. |
| `--ds-modal-background` | Background of the dialog.                                            |
| `--ds-modal-color`      | Text color of the dialog.                                            |
| `--ds-modal-margin`     | Smallest space between the dialog and the edges of the screen.       |
| `--ds-modal-max-width`  | Maximum width of the dialog.                                         |
| `--ds-modal-padding`    | Padding of the dialog.                                               |
| `--ds-modal-radius`     | Corner radius of the dialog.                                         |
| `--ds-modal-shadow`     | Shadow of the dialog.                                                |
| `--ds-modal-z-index`    | Stack level of the shown modal, above the page.                      |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
