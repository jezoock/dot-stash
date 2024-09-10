# ds-nav-menu-item



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type      | Default     |
| ------------- | -------------- | ----------- | --------- | ----------- |
| `depth`       | `depth`        |             | `number`  | `0`         |
| `hasChildren` | `has-children` |             | `boolean` | `false`     |
| `isActive`    | `is-active`    |             | `boolean` | `false`     |
| `isAnimated`  | `is-animated`  |             | `boolean` | `true`      |
| `itemId`      | `item-id`      |             | `string`  | `undefined` |
| `type`        | `type`         |             | `string`  | `'page'`    |


## Events

| Event             | Description | Type               |
| ----------------- | ----------- | ------------------ |
| `dsMenuItemClick` |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [ds-trigger](../../../core/trigger)

### Graph
```mermaid
graph TD;
  ds-nav-item --> ds-trigger
  style ds-nav-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
