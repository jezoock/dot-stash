# ds-modal



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                    | Description | Type       | Default                |
| ------------------------ | ---------------------------- | ----------- | ---------- | ---------------------- |
| `closeButtonMods`        | --                           |             | `string[]` | `["modal-close"]`      |
| `darkBackground`         | `dark-background`            |             | `boolean`  | `false`                |
| `isClosingDisabled`      | `is-closing-disabled`        |             | `boolean`  | `false`                |
| `isFooterDisabled`       | `is-footer-disabled`         |             | `boolean`  | `false`                |
| `isHeaderDisabled`       | `is-header-disabled`         |             | `boolean`  | `false`                |
| `isLayoutDisabled`       | `is-layout-disabled`         |             | `boolean`  | `false`                |
| `isSubtitleDisabled`     | `is-subtitle-disabled`       |             | `boolean`  | `false`                |
| `lightboxClass`          | `lightbox-class`             |             | `any`      | `{ "--dialog": true }` |
| `lightboxClassObject`    | `lightbox-class-object`      |             | `any`      | `undefined`            |
| `overlay`                | `overlay`                    |             | `boolean`  | `false`                |
| `redirectToSmoodOnClose` | `redirect-to-smood-on-close` |             | `boolean`  | `false`                |
| `shown`                  | `shown`                      |             | `boolean`  | `false`                |
| `useSnack`               | `use-snack`                  |             | `boolean`  | `false`                |


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




## Dependencies

### Depends on

- [ds-trigger](../../core/trigger)

### Graph
```mermaid
graph TD;
  ds-modal --> ds-trigger
  style ds-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
