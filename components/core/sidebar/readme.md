# ds-sidebar



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type                 | Default                  |
| ---------- | ---------- | ----------- | -------------------- | ------------------------ |
| `ctx`      | `ctx`      |             | `boolean`            | `true`                   |
| `isShown`  | `is-shown` |             | `boolean`            | `false`                  |
| `mods`     | `mods`     |             | `string \| string[]` | `""`                     |
| `position` | `position` |             | `string`             | `SIDEBAR_POSITION.RIGHT` |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `sidebarHidden` |             | `CustomEvent<any>` |
| `sidebarHide`   |             | `CustomEvent<any>` |
| `sidebarShow`   |             | `CustomEvent<any>` |
| `sidebarShown`  |             | `CustomEvent<any>` |


## Methods

### `hide() => Promise<void>`

Hide the sidebar

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Show the sidebar

#### Returns

Type: `Promise<void>`



### `toggle(mustShow?: boolean) => Promise<void>`

Toggle the sidebar display

#### Parameters

| Name       | Type      | Description                                                |
| ---------- | --------- | ---------------------------------------------------------- |
| `mustShow` | `boolean` | Used to specify wether the sidebar must be shown or hidden |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
