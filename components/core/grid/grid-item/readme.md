# ds-grid-item

## Styling

- **Classes**: `ds-grid-item` on `<ds-grid-item>`, and `--with-ratio` when it has a `ratio`. Its element: `__content` (the default slot).
- **Attributes**: `width` (number of columns), `ratio` (reflected).
- **Structure** (`grid-item.scss`): an inline-block cell that does not shrink; `ds-grid` writes its width and paddings as inline styles. With a `ratio`, the item gets a top padding of that ratio and its content fills it.
- **Look**: none, and no custom property: the parent `ds-grid` sizes the items (see its readme).

<!-- Auto Generated Below -->


## Properties

| Property         | Attribute | Description | Type               | Default     |
| ---------------- | --------- | ----------- | ------------------ | ----------- |
| `ratioFromProps` | `ratio`   |             | `number \| string` | `undefined` |
| `width`          | `width`   |             | `number`           | `1`         |


## Methods

### `getWidth() => Promise<number>`



#### Returns

Type: `Promise<number>`



### `setStyles(styles: DSGridItemStyles) => Promise<void>`



#### Parameters

| Name     | Type               | Description |
| -------- | ------------------ | ----------- |
| `styles` | `DSGridItemStyles` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
