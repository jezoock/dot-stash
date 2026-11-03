# ds-title

## Styling

- **Classes**: `ds-title` on `<ds-title>`; `mods` → `--<mod>`.
- **Attributes** (reflected): `page`, `section`, `block` and `sub` give the variant the default theme styles (a section title without any of them; `sub` for a subtitle of the same level); `sup`, `article` and `form` are reflected too, without a style of their own in the default theme.
- **Slots**: the default slot, text or a heading (`h1`…`h6`), a paragraph, a link or a `strong`.
- **Structure** (`title.scss`): a block element. The headings, paragraphs, links and `strong` elements inside it lose their margins and paddings and inherit the font size, weight, line height and color of the title (a link and a `strong` are blocks).
- **Look** (default theme, `components/_title.scss`): each variant takes its font size and weight from the title font styles (`--ds-font-style-title-<variant>-size`, `-weight`), and the color, font family and line height from the custom properties below, set on `ds-title`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-title {
  --ds-title-font-family: Georgia, serif;
}

.dark ds-title {
  --ds-title-color: var(--ds-color-gray-white);
  --ds-title-sub-color: var(--ds-color-gray-light);
}
```

<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                                                                        | Type                 | Default     |
| --------- | --------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `article` | `article` |                                                                                                    | `boolean`            | `undefined` |
| `block`   | `block`   |                                                                                                    | `boolean`            | `undefined` |
| `form`    | `form`    |                                                                                                    | `boolean`            | `undefined` |
| `mods`    | `mods`    | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`        |
| `page`    | `page`    |                                                                                                    | `boolean`            | `undefined` |
| `section` | `section` |                                                                                                    | `boolean`            | `undefined` |
| `sub`     | `sub`     |                                                                                                    | `boolean`            | `undefined` |
| `sup`     | `sup`     |                                                                                                    | `boolean`            | `undefined` |


## CSS Custom Properties

| Name                     | Description                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| `--ds-title-color`       | Text color of the title.                                            |
| `--ds-title-font-family` | Font family of the titles (every variant: `page`, `block`, `sub`…). |
| `--ds-title-line-height` | Line height of the titles.                                          |
| `--ds-title-sub-color`   | Text color of a `sub` title.                                        |


## Dependencies

### Used by

 - [ds-heading](../heading)

### Graph
```mermaid
graph TD;
  ds-heading --> ds-title
  style ds-title fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
