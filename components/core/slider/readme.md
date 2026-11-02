# ds-slider



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                                                        | Type                       | Default                 |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------- |
| `mods`     | `mods`      | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]`       | `[]`                    |
| `params`   | `params`    |                                                                                                    | `DSSliderParams \| string` | `{}`                    |
| `sliderId` | `slider-id` |                                                                                                    | `string`                   | ``slide-${sliderId++}`` |
| `type`     | `type`      |                                                                                                    | `string`                   | `'sld'`                 |


## Events

| Event         | Description | Type                                                                        |
| ------------- | ----------- | --------------------------------------------------------------------------- |
| `sliderEvent` |             | `CustomEvent<{ slide: string; direction: number; currentIndex?: number; }>` |


## Methods

### `goTo(itemIndex: number) => Promise<void>`



#### Parameters

| Name        | Type     | Description |
| ----------- | -------- | ----------- |
| `itemIndex` | `number` |             |

#### Returns

Type: `Promise<void>`



### `initialize() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `next(step?: number, startPosition?: number) => Promise<void>`



#### Parameters

| Name            | Type     | Description |
| --------------- | -------- | ----------- |
| `step`          | `number` |             |
| `startPosition` | `number` |             |

#### Returns

Type: `Promise<void>`



### `play() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `pointerDownHandler(event: TouchEvent) => Promise<void>`



#### Parameters

| Name    | Type         | Description |
| ------- | ------------ | ----------- |
| `event` | `TouchEvent` |             |

#### Returns

Type: `Promise<void>`



### `pointerMoveHandler() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `pointerUpHandler(event: TouchEvent) => Promise<void>`



#### Parameters

| Name    | Type         | Description |
| ------- | ------------ | ----------- |
| `event` | `TouchEvent` |             |

#### Returns

Type: `Promise<void>`



### `prev(step?: number, startPosition?: number) => Promise<void>`



#### Parameters

| Name            | Type     | Description |
| --------------- | -------- | ----------- |
| `step`          | `number` |             |
| `startPosition` | `number` |             |

#### Returns

Type: `Promise<void>`



### `refresh(reset?: boolean) => Promise<void>`



#### Parameters

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| `reset` | `boolean` |             |

#### Returns

Type: `Promise<void>`



### `reset() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `stop() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [ds-trigger](../trigger)
- [ds-slider-menu](slider-menu)

### Graph
```mermaid
graph TD;
  ds-slider --> ds-trigger
  ds-slider --> ds-slider-menu
  style ds-slider fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
