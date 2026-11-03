# ds-modal

## Styling

- **Classes**: `<ds-modal>` has the class `ds-lightbox`, `--overlay` (`overlay`), and the classes of `lightbox-class` (an object or its JSON string, `{"--dialog": true}` by default: `--dialog`). Inside it: `ds-lightbox__container`, which holds `ds-modal`, which holds `ds-modal__content` (the default slot). A mouse down outside `.ds-modal` hides the modal.
- **Attributes**: `shown` (reflected) while the modal is shown.
- **Body class**: while at least one modal of the document is shown, the body has the class `ds-js--modal-open`.
- **Structure** (`modal.scss`): `body.ds-js--modal-open` does not scroll.
- **Look**: none yet, and no custom property. Neither the component nor the default theme styles the lightbox (its position, a backdrop, the dialog box, the hidden state): the content is rendered in place, shown or not. Until a theme does, a project styles these classes itself, for example:

```css
ds-modal:not([shown]) {
  display: none;
}

ds-modal[shown] {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background-color: rgb(15 23 42 / 0.6);
}
```

<!-- Auto Generated Below -->


## Overview

A modal dialog in a lightbox, shown while `shown` is set. While at least one modal of the document is shown,
the body has the `ds-js--modal-open` class, which locks the page scroll (`overflow: hidden`, no inline style):
the class is removed when the last shown modal is hidden or removed from the document.

## Properties

| Property              | Attribute               | Description | Type      | Default                |
| --------------------- | ----------------------- | ----------- | --------- | ---------------------- |
| `lightboxClass`       | `lightbox-class`        |             | `any`     | `{ '--dialog': true }` |
| `lightboxClassObject` | `lightbox-class-object` |             | `any`     | `undefined`            |
| `overlay`             | `overlay`               |             | `boolean` | `false`                |
| `shown`               | `shown`                 |             | `boolean` | `false`                |


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




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
