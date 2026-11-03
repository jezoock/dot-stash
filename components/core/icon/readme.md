# ds-icon

## Styling

- **Classes**: `ds-icon` on `<ds-icon>`, and `--<type>` (`type`). The default theme maps each type to a glyph of the `ds-icons` font (`cart`, `help`, `account`, `search`, `arrow-down`, `plus`, `loading`…, see `components/_icon.scss`); `--loading` spins.
- **Structure** (`icon.scss`): none, the stylesheet only documents the custom properties. The icon is a glyph of the icon font of the theme, drawn in its `::before`.
- **Look** (default theme, `components/_icon.scss`): an inline block, vertically centered, with the glyph of its type, as large and of the same color as the text by default: `--ds-icon-size` (`1em`) and `--ds-icon-color` (`currentColor`), set on `ds-icon`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
.toolbar ds-icon {
  --ds-icon-size: 1.5rem;
  --ds-icon-color: var(--ds-color-primary-base);
}
```

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `type`   | `type`    |             | `string` | `undefined` |


## CSS Custom Properties

| Name              | Description                       |
| ----------------- | --------------------------------- |
| `--ds-icon-color` | Color of the icon.                |
| `--ds-icon-size`  | Size of the icon (its font size). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
