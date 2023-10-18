# ds-video



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type       | Default     |
| ---------- | ---------- | ----------- | ---------- | ----------- |
| `autoplay` | `autoplay` |             | `boolean`  | `false`     |
| `controls` | `controls` |             | `boolean`  | `false`     |
| `mods`     | --         |             | `string[]` | `[]`        |
| `poster`   | `poster`   |             | `string`   | `undefined` |
| `sources`  | --         |             | `string[]` | `[]`        |


## Methods

### `mute() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `pause() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `play() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `stop() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `unmute() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [ds-button](../../core/button)

### Graph
```mermaid
graph TD;
  ds-video --> ds-button
  style ds-video fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
