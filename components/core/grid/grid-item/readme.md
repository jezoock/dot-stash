# ds-grid-item

## Styling

- **Classes**: `ds-grid-item` on `<ds-grid-item>`, and `--with-ratio` when it has a `ratio`. Its element: `__content` (the default slot).
- **Attributes**: `width` (the number of columns it spans), `ratio` (reflected).
- **Structure** (`grid-item.scss`): a cell of `ds-grid`, whose stylesheet places it: the item writes its `width` as `--ds-grid-span` (`grid-column: span n` in the grid). With a `ratio`, it is as high as that ratio of its width (`aspect-ratio: 1 / ratio`), and its content fills it (absolutely positioned).
- **Custom properties**: `--ds-grid-item-ratio`, set by the item from `ratio`, not by the theme (and `--ds-grid-span`, from `width`, see `ds-grid`).
- **Look**: none: the parent `ds-grid` lays the items out (see its readme).

**Changed**: ds-grid no longer writes the width and paddings of the item as inline styles: the item writes `--ds-grid-span`, and the grid stylesheet places it. `setStyles()` is deprecated, ds-grid no longer calls it (it still writes the given styles). `ratio` gave the item a top padding as high as the width of the whole row, whatever its value, and its content covered the gaps (a fractional value, `0.5625`, was read as 0: no ratio); it is now the height of the item as a ratio of its width (`aspect-ratio`).

<!-- Auto Generated Below -->


## Overview

A cell of a `ds-grid`: it spans the number of columns of its `width` (`--ds-grid-span`, which the grid stylesheet reads),
and, with a `ratio`, it is as high as that ratio of its width (`--ds-grid-item-ratio`, `aspect-ratio`). The component
writes these custom properties on itself and computes no size: `width` can change per breakpoint with `ds-rsp`.

## Properties

| Property         | Attribute | Description                                                                                                         | Type               | Default     |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------- |
| `ratioFromProps` | `ratio`   | The height of the item as a ratio of its width (`0.5625`: 16:9), its content filling it.                            | `number \| string` | `undefined` |
| `width`          | `width`   | The number of columns the item spans: a whole number (a fractional one is rounded), at most the `cols` of the grid. | `number`           | `1`         |


## Methods

### `getWidth() => Promise<number>`



#### Returns

Type: `Promise<number>`



### `setStyles(styles: DSGridItemStyles) => Promise<void>`

<span style="color:red">**[DEPRECATED]**</span> ds-grid no longer calls it: the grid lays its items out with CSS Grid, from the `width` of each item.
It still writes the given styles, which apply over the layout of the grid.<br/><br/>Writes inline styles on the item.

#### Parameters

| Name     | Type               | Description |
| -------- | ------------------ | ----------- |
| `styles` | `DSGridItemStyles` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description              |
| ---- | ------------------------ |
|      | The content of the cell. |


## CSS Custom Properties

| Name                   | Description                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `--ds-grid-item-ratio` | Height of the item as a ratio of its width (`0.5625`: 16:9), with `ratio`. Set by ds-grid-item from `ratio`. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
