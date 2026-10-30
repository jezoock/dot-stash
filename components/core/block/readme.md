# ds-block



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                                 | Type                 | Default     |
| --------- | --------- | ----------------------------------------------------------- | -------------------- | ----------- |
| `article` | `article` |                                                             | `boolean`            | `undefined` |
| `block`   | `block`   |                                                             | `boolean`            | `undefined` |
| `form`    | `form`    |                                                             | `boolean`            | `undefined` |
| `modal`   | `modal`   |                                                             | `boolean`            | `undefined` |
| `mods`    | `mods`    | List of modifiers                                           | `string \| string[]` | `[]`        |
| `name`    | `name`    | Use to derivate the main class name                         | `string`             | `undefined` |
| `section` | `section` |                                                             | `boolean`            | `undefined` |
| `type`    | `type`    | Block type classname ( also used to build block classname ) | `string`             | `undefined` |


## Methods

### `getContext() => Promise<"block" | "article" | "section" | "form" | "modal">`



#### Returns

Type: `Promise<"block" | "article" | "section" | "form" | "modal">`




## Dependencies

### Used by

 - [ds-main](../../demo)

### Graph
```mermaid
graph TD;
  ds-main --> ds-block
  style ds-block fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
