# ds-marquee-configurator



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type     | Default              |
| ---------- | ---------- | ----------- | -------- | -------------------- |
| `inputId`  | `input-id` |             | `string` | `undefined`          |
| `settings` | `settings` |             | `any`    | `emptyMarqueeConfig` |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `saveConfiguration` |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [pronto-form](../../form)
- [ds-trigger](../../../../core/trigger)

### Graph
```mermaid
graph TD;
  ds-marquee-configurator --> pronto-form
  ds-marquee-configurator --> ds-trigger
  pronto-form --> ds-title
  style ds-marquee-configurator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
