# ds-block

## Styling

- **Classes**: the main class is on `<ds-block>` itself, `ds[-<name>]-<type or context>`: `ds-block` by default, `ds-section` with `section` (`ds-article`, `ds-form` and `ds-modal` with the other contexts, `ds-<name>-<type>` with `name` and `type`). It prefixes the elements: `__header` and `__footer`, rendered when the block has a `slot="header"` / `slot="footer"` child, and `__body` (the default slot).
- **Modifiers**: `mods` → `--<mod>`. The default theme reads `--sm`, `--md`, `--lg` (the body is at most as wide as that breakpoint) and `--full-width`.
- **Attributes**: `section`, `block`, `article`, `form`, `modal`, `name`, `mods` (reflected).
- **Structure** (`block.scss`): a block element without padding or margin; an empty header or footer wrapper is hidden.
- **Look** (default theme, `components/_block.scss`): the space around the header and the footer, and the width of the body, for the `ds-block` and `ds-section` classes, from the custom properties below. The theme sets them on `ds-block`; the size modifiers set `--ds-block-max-width`. The other main classes (`ds-<name>-<type>`…) are left to the project.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-block {
  --ds-block-header-gap: 2rem;
}

/* A modifier of the block still sets its own width. */
.landing ds-block {
  --ds-block-max-width: 72rem;
}
```

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




## CSS Custom Properties

| Name                    | Description                                                                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ds-block-footer-gap` | Space between the body and the footer (`__footer`).                                                                                                                                                         |
| `--ds-block-header-gap` | Space between the header (`__header`) and the body.                                                                                                                                                         |
| `--ds-block-max-width`  | Maximum width of the body (`__body`), centered. Not set by default (no maximum width): the `sm`, `md`, `lg` and `full-width` modifiers set it, and the bodies of the blocks nested in the block inherit it. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
