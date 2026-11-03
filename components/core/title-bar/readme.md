# ds-title-bar

## Styling

- **Classes**: `ds-title-bar` on `<ds-title-bar>`; `mods` → `--<mod>`.
- **Elements**: `__before` (slot `before`), `__content` (the default slot) and `__after` (slot `after`). `__before` and `__after` are rendered when their slot has content.
- **Attributes**: `ctx`, `mods` (reflected).
- **Structure** (`title-bar.scss`): a flex row; the content takes the remaining width, between the two other parts.
- **Look** (default theme, `components/_title-bar.scss`): the space between the parts, `--ds-title-bar-gap`, set on `ds-title-bar`. The default theme puts none (`normal`).

Override it after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-title-bar {
  --ds-title-bar-gap: var(--ds-space-4);
}
```

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                                                                        | Type                 | Default     |
| -------- | --------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `ctx`    | `ctx`     |                                                                                                    | `boolean`            | `undefined` |
| `mods`   | `mods`    | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`        |


## CSS Custom Properties

| Name                 | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `--ds-title-bar-gap` | Space between the `before` part, the content and the `after` part. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
