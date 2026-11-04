# ds-grid

## Styling

- **Classes**: `<ds-grid>` renders a `div` with the main class, `ds-grid`, and its modifiers; inside it, the row, `ds-grid__row`, holds the items (the default slot).
- **Modifiers**: `mods` → `--<mod>`; `--fixed` or `--fluid` (`type`), `--align-<align>` and `--v-align-<v-align>` (`start`, `center`, `end`), `--with-cell-ratio` (`cell-ratio`).
- **Attributes**: `type`, `cols`, `h-gap`, `v-gap`, `align`, `v-align`, `cell-ratio`, `mods`, `data-use-rsp` (reflected: the grid is a subscriber of `ds-rsp`, its `data-rsp` attribute changes its props per breakpoint).
- **Structure** (`grid.scss`): the row is a CSS Grid of `--ds-grid-cols` columns (`repeat(n, minmax(0, 1fr))`), `--ds-grid-h-gap` apart (`column-gap`); each child spans `--ds-grid-span` columns (`grid-column: span n`, at most the number of columns), which a `ds-grid-item` sets from its `width`. In a `fixed` grid, `--ds-grid-v-gap` separates the rows (`row-gap`) and is kept below the last one (a bottom padding of the row); a `fluid` grid has no vertical gap. `v-align` aligns the items in the height of their row (`align-items`). `align` places the items of a row that does not fill the grid: CSS Grid cannot move them, so with `center` or `end` the row is a wrapping flex row (`justify-content`), its items as wide as the columns they span. With `cell-ratio`, the items are as high as that ratio of their width (`aspect-ratio`), the content of a `ds-grid-item` filling it. The component computes no size: it writes its props as custom properties on its `.ds-grid` element, and the stylesheet lays the items out.
- **Custom properties**: set by `ds-grid` (and `--ds-grid-span` by `ds-grid-item`) from the props, not by the theme: change the props, or their values per breakpoint with `ds-rsp`, rather than the properties. A child that is not a `ds-grid-item` spans one column, or the `--ds-grid-span` it sets itself (`style="--ds-grid-span: 2"`).
- **Look**: none. The default theme only makes the images of a grid fluid (`components/_grid.scss`).

```html
<ds-rsp></ds-rsp>
<ds-grid cols="2" h-gap="1rem" v-gap="1rem" data-rsp='{"md": {"cols": 4}}'>
  <ds-grid-item width="2" data-use-rsp data-rsp='{"md": {"width": 1}}'>…</ds-grid-item>
  <ds-grid-item>…</ds-grid-item>
  <ds-grid-item>…</ds-grid-item>
</ds-grid>
```

**Changed**: ds-grid computed in JavaScript the width and the paddings of each item, as inline styles, in a flex row; it now writes its props as custom properties, and CSS Grid lays the items out. The content of the items is where it was (the columns, the gaps, the alignments, the space below a `fixed` grid), but where the former layout was wrong:

- the boxes of the items are their cells: in a `fixed` grid with `h-gap`, they held the gap as inline paddings;
- in a `fluid` grid with `h-gap`, an item of several columns spans them exactly: it was narrower by a share of the gap, which moved the next items of its row;
- with `align` `center` or `end` and `h-gap`, an incomplete row is centered (or at the end) exactly: it was off by a fraction of the gap;
- a nested grid lays out its own items: the outer grid sized them too, with its own columns;
- `cell-ratio`, which did nothing, sets the height of the items;
- a `width` larger than `cols` spans the whole row (it overflowed it), and a fractional `width` is rounded (it was a fraction of the row); a child that is not a `ds-grid-item` takes one column (it was as wide as its content);
- a unitless gap is in px (`h-gap="10"`; it was ignored); a `v-gap` in `%` is a percentage of the height of the grid, as for any `row-gap` (it was a percentage of its width): write it as a length.

<!-- Auto Generated Below -->


## Overview

A grid of columns: its children, `ds-grid-item` elements, are laid out in `cols` columns by CSS Grid, each one spanning
the number of columns of its `width`. The props set custom properties on the `.ds-grid` element (`--ds-grid-cols`,
`--ds-grid-h-gap`, `--ds-grid-v-gap`, `--ds-grid-cell-ratio`) and classes, which the component stylesheet reads: the
component computes no size. They can change per breakpoint with `ds-rsp` (`data-rsp`, the grid is a subscriber).

## Properties

| Property     | Attribute      | Description                                                                                                               | Type                 | Default     |
| ------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `align`      | `align`        | Where the items of a row that does not fill the grid go: `start`, `center` or `end`.                                      | `string`             | `'start'`   |
| `cellRatio`  | `cell-ratio`   | The height of the items as a ratio of their width (`0.75`: 4:3), their content filling it; an item's own `ratio` wins.    | `number \| string`   | `undefined` |
| `cols`       | `cols`         | The number of columns (a whole number).                                                                                   | `number \| string`   | `1`         |
| `dataUseRsp` | `data-use-rsp` | A subscriber of `ds-rsp`: its `data-rsp` attribute can change its props per breakpoint.                                   | `boolean`            | `true`      |
| `hGap`       | `h-gap`        | The space between the columns: a CSS length (`20px`, `1rem`, `5%`); a unitless number is in px.                           | `string`             | `'0'`       |
| `mods`       | `mods`         | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                        | `string \| string[]` | `[]`        |
| `type`       | `type`         | `fixed`: `v-gap` separates the rows, and is kept below the last one; `fluid`: the rows have no gap (`v-gap` is not used). | `string`             | `'fixed'`   |
| `vAlign`     | `v-align`      | The alignment of the items in the height of their row: `start`, `center` or `end`.                                        | `string`             | `'start'`   |
| `vGap`       | `v-gap`        | The space between the rows of a `fixed` grid, and below its last row: a CSS length; a unitless number is in px.           | `string`             | `'0'`       |


## Slots

| Slot | Description                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------- |
|      | The items: `ds-grid-item` elements (any child takes a cell, one column unless it sets `--ds-grid-span`). |


## CSS Custom Properties

| Name                   | Description                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--ds-grid-cell-ratio` | Height of the items as a ratio of their width (`0.75`: 4:3), with `cell-ratio`. Set by ds-grid from `cell-ratio`.                                |
| `--ds-grid-cols`       | Number of columns. Set by ds-grid from `cols`, on its `.ds-grid` element.                                                                        |
| `--ds-grid-h-gap`      | Space between the columns. Set by ds-grid from `h-gap`.                                                                                          |
| `--ds-grid-span`       | Number of columns an item spans, at most `--ds-grid-cols` (1 for a child that does not set it). Set by ds-grid-item from its `width`, on itself. |
| `--ds-grid-v-gap`      | Space between the rows of a `fixed` grid, and below its last row (a `fluid` grid has none). Set by ds-grid from `v-gap`.                         |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
