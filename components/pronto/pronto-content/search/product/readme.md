# ds-product-search



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                 | Default     |
| -------- | --------- | ----------- | -------------------- | ----------- |
| `route`  | `route`   |             | `string`             | `undefined` |
| `value`  | `value`   |             | `string \| string[]` | `[]`        |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `valueChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [pronto-field](../../form)
 - [pronto-product-list](../../configurator/product-list)

### Depends on

- [ds-tag](..)

### Graph
```mermaid
graph TD;
  ds-product-search --> ds-tag
  ds-tag --> ds-trigger
  pronto-field --> ds-product-search
  pronto-product-list --> ds-product-search
  style ds-product-search fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
