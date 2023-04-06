# ds-slider



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description | Type                      | Default     |
| ---------- | ----------- | ----------- | ------------------------- | ----------- |
| `dsParams` | `ds-params` |             | `DSSliderPrams \| string` | `{}`        |
| `mods`     | `mods`      |             | `string \| string[]`      | `""`        |
| `sliderId` | `slider-id` |             | `string`                  | `undefined` |
| `type`     | `type`      |             | `string`                  | `"sld"`     |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `dsSliderEvent` |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [ds-button](../button)
- [ds-slider-menu](slider-menu)

### Graph
```mermaid
graph TD;
  ds-slider --> ds-button
  ds-slider --> ds-slider-menu
  style ds-slider fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
