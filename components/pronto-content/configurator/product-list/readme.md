# pronto-product-list



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type     | Default     |
| ----------------- | ------------------ | ----------- | -------- | ----------- |
| `associatedRoute` | `associated-route` |             | `string` | `undefined` |
| `inputProps`      | `input-props`      |             | `any`    | `undefined` |
| `value`           | --                 |             | `any[]`  | `[]`        |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `valueChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [pronto-field](../../form)

### Depends on

- [ds-product-search](../../search/product)
- [ds-trigger](../../../../core/trigger)

### Graph
```mermaid
graph TD;
  pronto-product-list --> ds-product-search
  pronto-product-list --> ds-trigger
  ds-product-search --> ds-tag
  ds-tag --> ds-trigger
  pronto-field --> pronto-product-list
  style pronto-product-list fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
