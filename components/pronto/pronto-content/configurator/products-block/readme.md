# ds-products-configurator



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type     | Default     |
| ----------------- | ------------------ | ----------- | -------- | ----------- |
| `associatedRoute` | `associated-route` |             | `string` | `undefined` |
| `defaultValue`    | `default-value`    |             | `string` | `undefined` |
| `settings`        | `settings`         |             | `any`    | `{}`        |


## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `configChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [pronto-field](../../form)

### Depends on

- [pronto-form](../../form)

### Graph
```mermaid
graph TD;
  ds-products-configurator --> pronto-form
  pronto-form --> ds-title
  pronto-field --> ds-products-configurator
  style ds-products-configurator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
