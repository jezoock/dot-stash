# ds-toggle-group



<!-- Auto Generated Below -->


## Overview

Groups `ds-toggle` elements and keeps their selected values (emitted with `toggleValueChange`).

## Properties

| Property   | Attribute  | Description                                                                                                                                                                                                                                                                                            | Type                 | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------- |
| `count`    | `count`    | `[min, max]` number of selected values (JSON as an attribute: `count="[0, 3]"`). `max` 1 is a single selection: checking a toggle unchecks the others. A click that would leave fewer than `min` values, or select more than `max` (0 for no maximum), is undone. Default `[1, 1]`: exactly one value. | `number[] \| string` | `[1, 1]`    |
| `disabled` | `disabled` |                                                                                                                                                                                                                                                                                                        | `boolean`            | `undefined` |
| `mods`     | `mods`     |                                                                                                                                                                                                                                                                                                        | `string \| string[]` | `[]`        |
| `name`     | `name`     |                                                                                                                                                                                                                                                                                                        | `string`             | `undefined` |
| `type`     | `type`     |                                                                                                                                                                                                                                                                                                        | `string`             | `undefined` |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `toggleValueChange` |             | `CustomEvent<any>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
