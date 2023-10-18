# gbx-shopping-bag



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute      | Description | Type      | Default     |
| ------------ | -------------- | ----------- | --------- | ----------- |
| `isAgeLegal` | `is-age-legal` |             | `boolean` | `false`     |
| `mode`       | `mode`         |             | `string`  | `"default"` |
| `pageName`   | `page-name`    |             | `string`  | `"Grocery"` |


## Dependencies

### Depends on

- [gbx-shopping-bag-details](shopping-bag-details)
- [gbx-shopping-bag-list](shopping-bag-list)
- [gbx-shopping-bag-create-form](shopping-bag-create-form)

### Graph
```mermaid
graph TD;
  gbx-shopping-bag --> gbx-shopping-bag-details
  gbx-shopping-bag --> gbx-shopping-bag-list
  gbx-shopping-bag --> gbx-shopping-bag-create-form
  gbx-shopping-bag-details --> gbx-shopping-bag-name
  gbx-shopping-bag-details --> gbx-shopping-bag-products
  style gbx-shopping-bag fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
