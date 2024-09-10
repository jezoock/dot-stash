# ds-txt-img-configurator



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type     | Default |
| -------------- | --------------- | ----------- | -------- | ------- |
| `defaultValue` | `default-value` |             | `string` | `""`    |
| `settings`     | `settings`      |             | `any`    | `{}`    |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `configChange`      |             | `CustomEvent<any>` |
| `saveConfiguration` |             | `CustomEvent<any>` |


## Methods

### `getConfig(extraProps: Record<string, unknown>) => Promise<{ config: Record<string, unknown>; markup: string; }>`



#### Parameters

| Name         | Type                        | Description |
| ------------ | --------------------------- | ----------- |
| `extraProps` | `{ [x: string]: unknown; }` |             |

#### Returns

Type: `Promise<{ config: Record<string, unknown>; markup: string; }>`




## Dependencies

### Depends on

- [pronto-form](../../form)

### Graph
```mermaid
graph TD;
  ds-txt-img-configurator --> pronto-form
  pronto-form --> ds-title
  style ds-txt-img-configurator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
