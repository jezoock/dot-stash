# pronto-fieldset



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type     | Default     |
| -------------- | --------------- | ----------- | -------- | ----------- |
| `defaultValue` | `default-value` |             | `any`    | `undefined` |
| `depth`        | `depth`         |             | `number` | `0`         |
| `fields`       | --              |             | `any[]`  | `[]`        |
| `label`        | `label`         |             | `string` | `""`        |
| `name`         | `name`          |             | `string` | `""`        |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `valueChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [pronto-fieldset](.)

### Depends on

- [ds-title](../../../../core/title)
- [pronto-fieldset](.)
- [pronto-field](..)

### Graph
```mermaid
graph TD;
  pronto-fieldset --> pronto-fieldset
  pronto-field --> ds-select
  pronto-field --> ds-trigger
  pronto-field --> ds-toggle
  pronto-field --> ds-input-date
  pronto-field --> ds-button-configurator
  pronto-field --> ds-title-configurator
  pronto-field --> ds-product-search
  pronto-field --> ds-products-configurator
  pronto-field --> pronto-product-list
  pronto-field --> ds-features-configurator
  pronto-field --> ds-panels-configurator
  pronto-field --> ds-media
  pronto-field --> ds-html
  ds-input-date --> ds-trigger
  ds-button-configurator --> pronto-form
  pronto-form --> ds-title
  ds-product-search --> ds-tag
  ds-tag --> ds-trigger
  ds-products-configurator --> pronto-form
  pronto-product-list --> ds-product-search
  pronto-product-list --> ds-trigger
  ds-features-configurator --> ds-block
  ds-features-configurator --> ds-feature-configurator
  ds-features-configurator --> ds-trigger
  ds-feature-configurator --> pronto-form
  ds-feature-configurator --> ds-trigger
  ds-panels-configurator --> ds-block
  ds-panels-configurator --> ds-panel-configurator
  ds-panels-configurator --> ds-trigger
  ds-panel-configurator --> pronto-form
  ds-panel-configurator --> ds-trigger
  ds-media --> ds-toggle-group
  ds-media --> ds-toggle
  ds-media --> pronto-form
  ds-media --> pronto-modal
  ds-media --> ds-filemanager
  ds-media --> ds-trigger
  ds-html --> pronto-modal
  ds-html --> ds-html-editor
  ds-html --> ds-trigger
  ds-html-editor --> ds-trigger
  style pronto-fieldset fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
