# ds-icon

## Styling

- **Classes**: `ds-icon` on `<ds-icon>`, and `--<type>` (`type`). The default theme maps each type to an icon of `$icons` (see the table below and `components/_icon.scss`); `--loading` spins. A type the theme does not map draws nothing: the element stays an empty box.
- **Structure** (`icon.scss`): none, the stylesheet only documents the custom properties.
- **Look** (default theme, `components/_icon.scss`): an inline block of 1em, vertically centered on the text (`vertical-align: middle`). Its `::before` is the icon: a block of 1em × 1em painted in the text color (`background-color: currentColor`) through the SVG image of the icon (`mask-image`, from the `--ds-icons-<name>` custom property of the theme, see [Icons](../../../README.md#icons)). It is as large and of the same color as the text by default: `--ds-icon-size` (`1em`, the font size of the element) and `--ds-icon-color` (`currentColor`), set on `ds-icon`. In forced colors (a high contrast theme of the system), the icon takes the system color of the text around it (that of a link in a link, of a button in a button).

| Type                                                  | Icon (`$icons`)                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `cart`                                                | `basket` (a shopping cart)                                       |
| `help`                                                | `help`                                                           |
| `account`                                             | `user-o`                                                         |
| `voucher`                                             | `ticket`                                                         |
| `returns`                                             | `truck`                                                          |
| `location`                                            | `location`                                                       |
| `search`                                              | `search`                                                         |
| `orders`                                              | `calendar`                                                       |
| `filter`                                              | `menu`                                                           |
| `arrow-up`, `arrow-left`, `arrow-right`, `arrow-down` | `angle-up`, `angle-left`, `angle-right`, `angle-down` (chevrons) |
| `up`, `down`, `left`, `right`                         | `up`, `down`, `left`, `right` (long arrows)                      |
| `dir-up`, `dir-down`, `dir-left`, `dir-right`         | `up-dir`, `down-dir`, `left-dir`, `right-dir` (filled triangles) |
| `show`, `hide`                                        | `eye`, `eye-off`                                                 |
| `cancel`                                              | `cancel`                                                         |
| `delete`                                              | `trash`                                                          |
| `plus`, `minus`                                       | `plus`, `minus`                                                  |
| `refresh`                                             | `arrows-cw`                                                      |
| `loading`                                             | `arrows-cw`, spinning                                            |

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
.toolbar ds-icon {
  --ds-icon-size: 1.5rem;
  --ds-icon-color: var(--ds-color-primary-base);
}
```

## Accessibility

- **Decorative** (by default): the icon is hidden from assistive technologies (`aria-hidden="true"`): it is an image without a name, and the text next to it says what it means: in a button with a text, or with a visually hidden text (`.ds-visually-hidden`).
- **Meaningful**: an icon that stands alone and means something (a status, an image link without text) gets a name: `label` makes it an image (`role="img"`, `aria-label`). An `aria-label` or `aria-labelledby` of its own on the element does too.
- **Forced colors**: the icon stays visible in a high contrast theme of the system, in the system color of the text, of a link or of a button around it.

```html
<button type="button"><ds-icon type="cart"></ds-icon> Cart</button>

<a href="/help"><ds-icon type="help" label="Help"></ds-icon></a>
```

**Changed**: the icon is `aria-hidden="true"` by default; `label` is new. The icons are SVG images drawn as masks, in the text color: they were the glyphs of an icon font, `ds-icons`, whose files were not in the repository, so that no icon showed (each page requested the missing font files).

<!-- Auto Generated Below -->


## Overview

An icon of the theme (`type`): an SVG image, as large as the text and of its color. Decorative by default: hidden from
assistive technologies (`aria-hidden="true"`), the text next to it says what it means. With `label` (or an `aria-label`
/ `aria-labelledby` of its own), it is an image with that name (`role="img"`), for an icon that stands alone.

## Properties

| Property | Attribute | Description                                                                                                                      | Type     | Default     |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| `label`  | `label`   | The accessible name of an icon that means something on its own (`role="img"`, `aria-label`). Without it, the icon is decorative. | `string` | `undefined` |
| `type`   | `type`    | The icon: a type of the theme, its `--<type>` class (`cart`, `search`, `arrow-down`…, see the readme).                           | `string` | `undefined` |


## CSS Custom Properties

| Name              | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `--ds-icon-color` | Color of the icon (its text color, which paints it).           |
| `--ds-icon-size`  | Size of the icon (its font size: the icon is a square of 1em). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
