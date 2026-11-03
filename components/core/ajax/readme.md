# ds-ajax

## Styling

- **Classes**: `ds-ajax` on `<ds-ajax>`, and `--is-loading` while it loads.
- **Attributes** (reflected): `on`, `target`, `suffix`.
- **Content**: the link (`a`) whose URL is loaded, a child of `<ds-ajax>` (no slot: the component renders no element of its own).
- **Structure** (`ajax.scss`): while it loads, an overlay (`::before`) covers the `ds-ajax` element and takes the pointer, and a loading indicator (`::after`) is in its center, above the overlay. The overlay covers the component even when the content goes to another `target`.
- **Look** (default theme, `components/_ajax.scss`): a translucent white veil and a spinning `arrows-cw` glyph of the icon font, from the custom properties below, set on `ds-ajax`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-ajax {
  --ds-ajax-overlay-background: rgb(15 23 42 / 0.3);
  --ds-ajax-spinner-color: var(--ds-color-gray-white);
}
```

<!-- Auto Generated Below -->


## Overview

A simple component to load ajax content: on `click` (default) or `load`, it requests the URL of its link
as text (HTML) and puts the content of the response's `.ds-ajax-content` element in the target.
Version: 1.0

## Properties

| Property | Attribute | Description                                                                                                                     | Type                | Default   |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------- |
| `on`     | `on`      | Event that will trigger the loading of the ajax content: `click` (default) or `load`                                            | `"click" \| "load"` | `'click'` |
| `suffix` | `suffix`  | If the url can be crawled by search bots, one should pass an additional query param to tell server to render url in "ajax mode" | `string`            | `''`      |
| `target` | `target`  | Where to display the content, can be the component itself or an element specified by a css selector                             | `string`            | `'self'`  |


## CSS Custom Properties

| Name                           | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `--ds-ajax-overlay-background` | Background of the overlay that covers the content while it loads. |
| `--ds-ajax-spinner-color`      | Color of the loading indicator.                                   |
| `--ds-ajax-spinner-size`       | Size of the loading indicator (its font size).                    |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
