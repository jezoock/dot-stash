# ds-panels-configurator



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type      | Default     |
| ------------- | -------------- | ----------- | --------- | ----------- |
| `name`        | `name`         |             | `string`  | `undefined` |
| `settings`    | `settings`     |             | `any`     | `[]`        |
| `showActions` | `show-actions` |             | `boolean` | `true`      |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `configChange`      |             | `CustomEvent<any>` |
| `saveConfiguration` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [pronto-field](../../form)

### Depends on

- [ds-block](../../../../core/block)
- [ds-panel-configurator](.)
- [ds-trigger](../../../../core/trigger)

### Graph
```mermaid
graph TD;
  ds-panels-configurator --> ds-block
  ds-panels-configurator --> ds-panel-configurator
  ds-panels-configurator --> ds-trigger
  ds-panel-configurator --> pronto-form
  ds-panel-configurator --> ds-trigger
  pronto-form --> ds-title
  pronto-field --> ds-panels-configurator
  style ds-panels-configurator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
