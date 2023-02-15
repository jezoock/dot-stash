# ds-video



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type                 | Default     |
| ---------- | ---------- | ----------- | -------------------- | ----------- |
| `autoplay` | `autoplay` |             | `boolean \| string`  | `false`     |
| `controls` | `controls` |             | `boolean \| string`  | `false`     |
| `mods`     | `mods`     |             | `string \| string[]` | `[]`        |
| `poster`   | `poster`   |             | `string`             | `undefined` |
| `sources`  | `sources`  |             | `string \| string[]` | `[]`        |


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

### Used by

 - [ds-main](../../..)

### Depends on

- [ds-button](../button)

### Graph
```mermaid
graph TD;
  ds-video --> ds-button
  ds-main --> ds-video
  style ds-video fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
