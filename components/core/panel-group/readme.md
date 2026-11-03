# ds-panel-group

## Styling

- **Classes**: `ds-panel-group` on `<ds-panel-group>`; `mods` → `--<mod>`.
- **Attributes** (reflected): `type` (`tab` or `collapsible`, given to its panels), `active` (`false`: the panels are all shown, as they are), `solo-content` (a collapsible group expands one panel at a time), `mods`.
- **Structure** (`panel-group.scss`): a `tab` group is a wrapping flex row that clips its content: the titles of its panels in a row, the content of the expanded one below them.
- **Look**: none, and no custom property: the `ds-panel` elements carry the look. Set their `--ds-panel-*` properties on them (`.faq ds-panel { … }`, see `ds-panel`).

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                        | Type                     | Default |
| ------------- | -------------- | -------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| `isActive`    | `active`       |                                                                                                    | `boolean`                | `true`  |
| `mods`        | `mods`         | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]`     | `[]`    |
| `soloContent` | `solo-content` |                                                                                                    | `boolean`                | `false` |
| `type`        | `type`         |                                                                                                    | `"collapsible" \| "tab"` | `'tab'` |


## Methods

### `getItems() => Promise<HTMLDsPanelElement[]>`



#### Returns

Type: `Promise<HTMLDsPanelElement[]>`



### `hidePanel(_index?: number) => Promise<void>`

Not implemented yet: does nothing.

#### Parameters

| Name     | Type     | Description |
| -------- | -------- | ----------- |
| `_index` | `number` |             |

#### Returns

Type: `Promise<void>`



### `showPanel(index: number) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `index` | `number` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
