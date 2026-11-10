# ds-heading

## Styling

- **Classes**: `ds-heading` on `<ds-heading>`, and `--<image-position>` (`--block-before` by default).
- **Elements**: `__image` (slot `image`), `__content` (an `hgroup`), `__main-title` (a `ds-title`, the default slot), `__sub-title` (a `ds-title` with `sub`, slot `sub-title`) and `__description` (a `ds-text`, slot `description`). The image, sub-title and description are rendered when their slot has content.
- **Modifiers**: `mods` → `--<mod>`.
- **Attributes**: `section` and `block` (reflected, passed on to the titles: their size), `image-position`, `mods`. The default theme centers a `section` heading.
- **Structure** (`heading.scss`): a block element; an empty wrapper is hidden.
- **Look** (default theme, `components/_heading.scss`): the spacing of the parts, a fluid image, and the color and width of the description, from the custom properties below, set on `ds-heading`. The titles are `ds-title` elements: their colors and font are the `--ds-title-*` properties, set on `ds-title`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-heading {
  --ds-heading-gap: 3rem;
  --ds-heading-description-color: var(--ds-color-gray-dark);
}

/* The titles of the headings only */
ds-heading ds-title {
  --ds-title-color: var(--ds-color-primary-darker);
}
```

## Accessibility

- **Heading**: the main title (default slot) is the heading of the group: put a heading element (`h1`…`h6`) of the right level in it, or a text with `level` (1 to 6, given to its `ds-title`: `role="heading"`, `aria-level`).
- **Sub-title and description**: not headings: put a text or a `p` in the `sub-title` and `description` slots (a heading there would add a level to the outline of the page). The titles are grouped in an `hgroup`.
- **Image**: give the image of the `image` slot an `alt` (empty for a decorative image).

```html
<ds-heading section>
  <h2>Our shops</h2>
  <span slot="sub-title">Open every day</span>
  <p slot="description">Find the shop nearest to you.</p>
</ds-heading>

<ds-heading level="2">Our shops<span slot="sub-title">Open every day</span></ds-heading>
```

**Changed**: `level` is new.

<!-- Auto Generated Below -->


## Overview

A heading block: an image, a main title (a `ds-title`), a sub-title and a description, in an `hgroup`. The main title is
the heading: put a heading element (`h1`…`h6`) in the default slot, or set `level`. The sub-title and the description
are not headings: put a text or a `p` in their slots.

## Properties

| Property        | Attribute        | Description                                                                                        | Type                 | Default          |
| --------------- | ---------------- | -------------------------------------------------------------------------------------------------- | -------------------- | ---------------- |
| `block`         | `block`          |                                                                                                    | `boolean`            | `undefined`      |
| `imagePosition` | `image-position` |                                                                                                    | `string`             | `'block-before'` |
| `level`         | `level`          | The heading level (1 to 6) of a text main title, given to its `ds-title` (`level`).                | `number \| string`   | `undefined`      |
| `mods`          | `mods`           | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`             |
| `section`       | `section`        |                                                                                                    | `boolean`            | `undefined`      |
| `useContext`    | `use-context`    |                                                                                                    | `boolean`            | `undefined`      |


## Slots

| Slot            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
|                 | The main title: a heading (`h1`…`h6`), or a text with `level`. |
| `"description"` | The description: a text or paragraphs.                         |
| `"image"`       | An image, before or after the titles (`image-position`).       |
| `"sub-title"`   | The sub-title: a text or a `p`, not a heading.                 |


## CSS Custom Properties

| Name                                 | Description                                                         |
| ------------------------------------ | ------------------------------------------------------------------- |
| `--ds-heading-description-color`     | Text color of the description (`__description`).                    |
| `--ds-heading-description-max-width` | Maximum width of the description (centered in a `section` heading). |
| `--ds-heading-gap`                   | Space below the heading.                                            |
| `--ds-heading-image-gap`             | Space between the image (`__image`) and the titles.                 |


## Dependencies

### Depends on

- [ds-title](../title)
- [ds-text](../text)

### Graph
```mermaid
graph TD;
  ds-heading --> ds-title
  ds-heading --> ds-text
  style ds-heading fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
