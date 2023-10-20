# ds-input-password



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description | Type      | Default     |
| -------------- | -------------- | ----------- | --------- | ----------- |
| `autocomplete` | `autocomplete` |             | `string`  | `'on'`      |
| `inputId`      | `input-id`     |             | `string`  | `undefined` |
| `inputName`    | `input-name`   |             | `string`  | `undefined` |
| `isDisabled`   | `is-disabled`  |             | `boolean` | `undefined` |
| `isInError`    | `is-in-error`  |             | `boolean` | `undefined` |
| `max`          | `max`          |             | `number`  | `undefined` |
| `min`          | `min`          |             | `number`  | `undefined` |
| `placeholder`  | `placeholder`  |             | `string`  | `''`        |
| `type`         | `type`         |             | `string`  | `'text'`    |
| `value`        | `value`        |             | `any`     | `undefined` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `dsInputBlur` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ds-input-field](../../field/input)

### Depends on

- [ds-input](../input)
- [ds-button](../../../ui/button)

### Graph
```mermaid
graph TD;
  ds-input-password --> ds-input
  ds-input-password --> ds-button
  ds-input-field --> ds-input-password
  style ds-input-password fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
