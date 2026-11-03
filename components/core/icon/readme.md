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

## Accessibility

- **Decorative** (by default): the icon is hidden from assistive technologies (`aria-hidden="true"`): its glyph (a character of the private use area of the icon font) would be read as nothing, or as noise. The text next to it says what it means: in a button with a text, or with a visually hidden text (`.ds-visually-hidden`).
- **Meaningful**: an icon that stands alone and means something (a status, an image link without text) gets a name: `label` makes it an image (`role="img"`, `aria-label`). An `aria-label` or `aria-labelledby` of its own on the element does too.

```html
<button type="button"><ds-icon type="cart"></ds-icon> Cart</button>

<a href="/help"><ds-icon type="help" label="Help"></ds-icon></a>
```

**Changed**: the icon is `aria-hidden="true"` by default; `label` is new.

<!-- Auto Generated Below -->


## Overview

An icon: a glyph of the icon font of the theme (`type`). Decorative by default: hidden from assistive technologies
(`aria-hidden="true"`), the text next to it says what it means. With `label` (or an `aria-label` / `aria-labelledby`
of its own), it is an image with that name (`role="img"`), for an icon that stands alone.

## Properties

| Property | Attribute | Description                                                                                                                      | Type     | Default     |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| `label`  | `label`   | The accessible name of an icon that means something on its own (`role="img"`, `aria-label`). Without it, the icon is decorative. | `string` | `undefined` |
| `type`   | `type`    |                                                                                                                                  | `string` | `undefined` |


## CSS Custom Properties

| Name              | Description                       |
| ----------------- | --------------------------------- |
| `--ds-icon-color` | Color of the icon.                |
| `--ds-icon-size`  | Size of the icon (its font size). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
