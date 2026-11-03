# ds-slider-item

## Styling

- **Classes**: `<ds-slider-item>` renders a `div` with the class `ds-slider-item` around its content (the default slot).
- **Structure** (`slider-item.scss`, and `slider.scss` for its width): a block, as wide as the slider; `ds-slider` writes its maximum size as inline styles when it measures the items.
- **Look**: none, and no custom property.

## Accessibility

`ds-slider` makes each of its items a slide: `role="group"` (unless the item has a `role`), `aria-roledescription="slide"` and a name, "2 of 5", unless the item has an `aria-label` of its own; the items out of view are `inert`. See [`ds-slider`](../readme.md#accessibility).

<!-- Auto Generated Below -->


## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
