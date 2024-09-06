# ds-block-builder



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type     | Default     |
| ---------- | ---------- | ----------- | -------- | ----------- |
| `name`     | `name`     |             | `string` | `undefined` |
| `settings` | `settings` |             | `any`    | `[]`        |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `configChange`      |             | `CustomEvent<any>` |
| `saveConfiguration` |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [ds-trigger](../../../../core/trigger)
- [pronto-modal](../../form/modal)
- [ds-toggle-group](../../../../core/toggle-group)
- [ds-toggle](../../../../core/toggle)

### Graph
```mermaid
graph TD;
  ds-block-builder --> ds-trigger
  ds-block-builder --> pronto-modal
  ds-block-builder --> ds-toggle-group
  ds-block-builder --> ds-toggle
  style ds-block-builder fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
