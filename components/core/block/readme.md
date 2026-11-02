# ds-block



<!-- Auto Generated Below -->


## Overview

A block: a body, plus a header and a footer wrapper when it has `slot="header"` / `slot="footer"` children.
Its main class, `ds[-<name>]-<type or context>`, is on the host and prefixes the element classes
(`ds-home-hero__header`, `__body`, `__footer`).

## Properties

| Property  | Attribute | Description                                                                                        | Type                 | Default     |
| --------- | --------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `article` | `article` |                                                                                                    | `boolean`            | `undefined` |
| `block`   | `block`   |                                                                                                    | `boolean`            | `undefined` |
| `form`    | `form`    |                                                                                                    | `boolean`            | `undefined` |
| `modal`   | `modal`   |                                                                                                    | `boolean`            | `undefined` |
| `mods`    | `mods`    | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`        |
| `name`    | `name`    | Use to derivate the main class name                                                                | `string`             | `undefined` |
| `section` | `section` |                                                                                                    | `boolean`            | `undefined` |
| `type`    | `type`    | Block type classname ( also used to build block classname )                                        | `string`             | `undefined` |


## Methods

### `getContext() => Promise<DSBlockContext>`



#### Returns

Type: `Promise<DSBlockContext>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
