# ds-panel-group



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




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
