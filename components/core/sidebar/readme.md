# ds-sidebar



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute  | Description                                                                                        | Type                 | Default                 |
| --------- | ---------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------------------- |
| `ctx`     | `ctx`      |                                                                                                    | `boolean`            | `true`                  |
| `hPos`    | `h-pos`    |                                                                                                    | `"left" \| "right"`  | `SIDEBAR_POSITION.LEFT` |
| `isShown` | `is-shown` |                                                                                                    | `boolean`            | `false`                 |
| `mods`    | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`                    |
| `vPos`    | `v-pos`    |                                                                                                    | `"bottom" \| "top"`  | `SIDEBAR_POSITION.TOP`  |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `sidebarHidden` |             | `CustomEvent<any>` |
| `sidebarHide`   |             | `CustomEvent<any>` |
| `sidebarShow`   |             | `CustomEvent<any>` |
| `sidebarShown`  |             | `CustomEvent<any>` |


## Methods

### `hide() => Promise<void>`

Hide the sidebar (nothing happens when it is already hidden)

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Show the sidebar (nothing happens when it is already shown)

#### Returns

Type: `Promise<void>`



### `toggle(mustShow?: boolean) => Promise<void>`

Toggle the sidebar display

#### Parameters

| Name       | Type      | Description                                                                                     |
| ---------- | --------- | ----------------------------------------------------------------------------------------------- |
| `mustShow` | `boolean` | Used to specify wether the sidebar must be shown or hidden; without it, the display is switched |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
