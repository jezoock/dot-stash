# ds-main



<!-- Auto Generated Below -->


## Methods

### `getData(key: string) => Promise<Record<string, any>>`



#### Returns

Type: `Promise<Record<string, any>>`




## Dependencies

### Depends on

- [ds-sidebar](./ui/sidebar)
- [ds-trigger](./core/trigger)
- [ds-control](./old/control)
- [ds-slider](./ui/slider)
- [ds-slider-item](./ui/slider/slider-item)
- [ds-header](./core/header)
- [ds-block](./core/block)
- [ds-button](./ui/button)

### Graph
```mermaid
graph TD;
  ds-main --> ds-sidebar
  ds-main --> ds-trigger
  ds-main --> ds-control
  ds-main --> ds-slider
  ds-main --> ds-slider-item
  ds-main --> ds-header
  ds-main --> ds-block
  ds-main --> ds-button
  ds-slider --> ds-button
  ds-slider --> ds-slider-menu
  ds-header --> ds-title
  ds-header --> ds-text
  style ds-main fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
