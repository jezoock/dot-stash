# ds-modal



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
