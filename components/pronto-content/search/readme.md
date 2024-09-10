# ds-tag



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `tagId`  | `tag-id`  |             | `string` | `undefined` |


## Events

| Event              | Description | Type               |
| ------------------ | ----------- | ------------------ |
| `requestDeleteTag` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ds-cms-search](cms)
 - [ds-product-search](product)

### Depends on

- [ds-trigger](../../../core/trigger)

### Graph
```mermaid
graph TD;
  ds-tag --> ds-trigger
  ds-cms-search --> ds-tag
  ds-product-search --> ds-tag
  style ds-tag fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
