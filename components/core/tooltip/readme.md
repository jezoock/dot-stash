# ds-tooltip

## Styling

- **Classes**: `<ds-tooltip>` renders a `div` with the main class, `ds-tooltip`, its modifiers, and `--<position>` (`position`: `--top` by default, `--top-left`, `--top-right`, `--bottom`, `--bottom-left`, `--bottom-right`, `--left`, `--right`), `--is-shown` (while the message is shown), `--with-arrow` (`has-arrow`, set by default), `--disabled` (`disabled`), and `--icon` and `--<icon>` with an `icon`.
- **Elements**: `__content` (the default slot: what the tooltip is about); the `slot="message"` element is the message bubble.
- **Attributes** (reflected): `disabled`, `mods`.
- **Structure** (`tooltip.scss`): an inline box as wide as its content. The message is hidden until `--is-shown` (mouse over, touch, or the `request_tooltipShow_event` / `request_tooltipToggle_event` events), then placed on the side of the position, `--ds-tooltip-offset` away from the content, above the page (`z-index: 1000`). With `container-selector`, the component shifts a top or bottom message (an inline `margin-left`) to keep it in that container.
- **Look** (default theme, `components/_tooltip.scss`): the bubble (width, padding, radius, colors, font, shadow) and, for the top and bottom positions `--with-arrow`, its arrow, from the custom properties below, set on `ds-tooltip`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-tooltip {
  --ds-tooltip-background: var(--ds-color-gray-white);
  --ds-tooltip-color: var(--ds-color-gray-darkest);
  --ds-tooltip-width: 16rem;
}

.help ds-tooltip {
  --ds-tooltip-offset: 4px;
}
```

<!-- Auto Generated Below -->


## Overview

Simple icon tooltip component

## Properties

| Property            | Attribute            | Description                                                                                        | Type                                                                                                                                                                                                                     | Default               |
| ------------------- | -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `containerSelector` | `container-selector` |                                                                                                    | `string`                                                                                                                                                                                                                 | `''`                  |
| `hasArrow`          | `has-arrow`          |                                                                                                    | `boolean`                                                                                                                                                                                                                | `true`                |
| `icon`              | `icon`               | Displayed tooltip icon                                                                             | `string`                                                                                                                                                                                                                 | `''`                  |
| `isActive`          | `is-active`          |                                                                                                    | `boolean`                                                                                                                                                                                                                | `true`                |
| `isDisabled`        | `disabled`           |                                                                                                    | `boolean`                                                                                                                                                                                                                | `false`               |
| `mode`              | `mode`               | Used for applying modifier on main container                                                       | `string`                                                                                                                                                                                                                 | `undefined`           |
| `mods`              | `mods`               | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]`                                                                                                                                                                                                     | `[]`                  |
| `position`          | `position`           |                                                                                                    | `TooltipPosition.BOTTOM \| TooltipPosition.BOTTOM_LEFT \| TooltipPosition.BOTTOM_RIGHT \| TooltipPosition.LEFT \| TooltipPosition.RIGHT \| TooltipPosition.TOP \| TooltipPosition.TOP_LEFT \| TooltipPosition.TOP_RIGHT` | `TooltipPosition.TOP` |


## Slots

| Slot             | Description            |
| ---------------- | ---------------------- |
| `"content slot"` |                        |
| `"message"`      | slot to put message in |


## CSS Custom Properties

| Name                      | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `--ds-tooltip-background` | Background of the message bubble, and color of its arrow. |
| `--ds-tooltip-color`      | Text color of the message.                                |
| `--ds-tooltip-font-size`  | Font size of the message.                                 |
| `--ds-tooltip-offset`     | Distance between the message and the content.             |
| `--ds-tooltip-padding`    | Padding of the message bubble.                            |
| `--ds-tooltip-radius`     | Corner radius of the message bubble.                      |
| `--ds-tooltip-shadow`     | Shadow of the message bubble.                             |
| `--ds-tooltip-width`      | Width of the message bubble.                              |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
