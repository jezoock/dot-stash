# ds-grid

## Styling

- **Classes**: `<ds-grid>` renders a `div` with the main class, `ds-grid`, and its modifiers; inside it, the row, `ds-grid__row`, holds the items (the default slot).
- **Modifiers**: `mods` → `--<mod>`; `--fixed` or `--fluid` (`type`), `--align-<align>` and `--v-align-<v-align>` (`start`, `center`, `end`).
- **Attributes**: `type`, `cols`, `h-gap`, `v-gap`, `align`, `v-align`, `cell-ratio`, `mods` (reflected).
- **Structure** (`grid.scss`): the row is a wrapping flex row, aligned by the alignment modifiers. The grid computes the width and gaps of each item from its props and writes them as inline styles on the items (paddings in a `fixed` grid, widths and a `column-gap` on the row in a `fluid` one).
- **Look**: none. The grid has no custom property: its columns and gaps are props, so that `ds-rsp` can change them per breakpoint (`data-rsp`). The default theme only makes the images of a grid fluid (`components/_grid.scss`).

<!-- Auto Generated Below -->


## Properties

| Property     | Attribute      | Description                                                                                        | Type                 | Default     |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `align`      | `align`        |                                                                                                    | `string`             | `'start'`   |
| `cellRatio`  | `cell-ratio`   |                                                                                                    | `number \| string`   | `undefined` |
| `cols`       | `cols`         |                                                                                                    | `number \| string`   | `1`         |
| `dataUseRsp` | `data-use-rsp` |                                                                                                    | `boolean`            | `true`      |
| `hGap`       | `h-gap`        |                                                                                                    | `string`             | `'0'`       |
| `mods`       | `mods`         | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`        |
| `type`       | `type`         |                                                                                                    | `string`             | `'fixed'`   |
| `vAlign`     | `v-align`      |                                                                                                    | `string`             | `'start'`   |
| `vGap`       | `v-gap`        |                                                                                                    | `string`             | `'0'`       |


## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
