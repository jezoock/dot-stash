# ds-shopping-bag



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute      | Description | Type      | Default     |
| ------------ | -------------- | ----------- | --------- | ----------- |
| `isAgeLegal` | `is-age-legal` |             | `boolean` | `false`     |
| `mode`       | `mode`         |             | `string`  | `"default"` |
| `pageName`   | `page-name`    |             | `string`  | `"Grocery"` |


## Dependencies

### Depends on

- [ds-shopping-bag-details](shopping-bag-details)
- [ds-shopping-bag-list](shopping-bag-list)
- [ds-shopping-bag-create-form](shopping-bag-create-form)

### Graph
```mermaid
graph TD;
  ds-shopping-bag --> ds-shopping-bag-details
  ds-shopping-bag --> ds-shopping-bag-list
  ds-shopping-bag --> ds-shopping-bag-create-form
  ds-shopping-bag-details --> ds-shopping-bag-name
  ds-shopping-bag-details --> ds-shopping-bag-products
  style ds-shopping-bag fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
