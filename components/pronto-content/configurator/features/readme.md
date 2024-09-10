# ds-features-configurator



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
- [ds-feature-configurator](.)
- [ds-trigger](../../../../core/trigger)

### Graph
```mermaid
graph TD;
  ds-features-configurator --> ds-block
  ds-features-configurator --> ds-feature-configurator
  ds-features-configurator --> ds-trigger
  ds-feature-configurator --> pronto-form
  ds-feature-configurator --> ds-trigger
  pronto-form --> ds-title
  pronto-field --> ds-features-configurator
  style ds-features-configurator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
