# ds-toaster



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description | Type                                                                 | Default                                                             |
| ------------------- | --------------------- | ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `closingDelay`      | `closing-delay`       |             | `number`                                                             | `3000`                                                              |
| `maxDisplayedToast` | `max-displayed-toast` |             | `number`                                                             | `3`                                                                 |
| `messages`          | `messages`            |             | `string \| string[]`                                                 | `undefined`                                                         |
| `mods`              | `mods`                |             | `string \| string[]`                                                 | `""`                                                                |
| `position`          | `position`            |             | `[TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION] \| string` | `[TOASTER_VERTICAL_POSITION.TOP, TOASTER_HORIZONTAL_POSITION.LEFT]` |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `toasterHidden` |             | `CustomEvent<any>` |
| `toasterHide`   |             | `CustomEvent<any>` |
| `toasterShow`   |             | `CustomEvent<any>` |
| `toasterShown`  |             | `CustomEvent<any>` |


## Methods

### `displayToast() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `hide() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
