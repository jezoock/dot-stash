# ds-tooltip

## Styling

- **Classes**: `<ds-tooltip>` renders a `div` with the main class, `ds-tooltip`, its modifiers, and `--<position>` (`position`: `--top` by default, `--top-left`, `--top-right`, `--bottom`, `--bottom-left`, `--bottom-right`, `--left`, `--right`), `--is-shown` (while the message is shown), `--with-arrow` (`has-arrow`, set by default), `--disabled` (`disabled`), and `--icon` and `--<icon>` with an `icon`.
- **Elements**: `__content` (the default slot: what the tooltip is about); the `slot="message"` element is the message bubble.
- **Attributes** (reflected): `disabled`, `mods`.
- **Structure** (`tooltip.scss`): an inline box as wide as its content. The message is hidden until `--is-shown` (the pointer over the content or the message, the keyboard focus on the content, a tap on a touch screen, or the `request_tooltipShow_event` / `request_tooltipToggle_event` events), then placed on the side of the position, `--ds-tooltip-offset` away from the content, above the page (`z-index: 1000`). With `container-selector`, the component shifts a top or bottom message (an inline `margin-left`) to keep it in that container.
- **Focus**: when the content has no focusable element, the `.ds-tooltip` box is focusable (`tabindex="0"`) and shows the focus indicator of the theme.
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

## Accessibility

The tooltip follows the WAI-ARIA [tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) and WCAG 1.4.13 (content on hover or focus).

- **Roles and attributes**: the `slot="message"` element gets `role="tooltip"` and an id (`ds-tooltip-<n>-message` when it has none). The first focusable element of the content (a `button`, a link…) gets that id in its `aria-describedby` (its other ids are kept): it is the element the message describes. When the content has none (a text, an icon), the `.ds-tooltip` box is made focusable (`tabindex="0"`) and gets the `aria-describedby`. A disabled tooltip describes nothing and is not focusable.
- **Name**: the message is a description, not a name. The element it describes needs a name of its own: the text of a button, or an `aria-label` for an icon button. Prefer a `button` in the content to the focusable box, which has no role.
- **Keyboard**: the focus on the content (from the keyboard: the browser shows its focus indicator) shows the message, its loss hides it. Escape hides it without moving the focus or the pointer, and the key press goes no further (a modal or a sidebar around the tooltip stays open); the message comes back when the focus or the pointer comes back.
- **Pointer**: the message is shown while the pointer is over the content or over the message (hoverable): it stays 300 ms (`TOOLTIP_HIDE_DELAY`, `tooltip.constants.ts`) after the pointer has left, the time to cross the offset. A click that focuses the content does not keep the message: it hides when the pointer leaves.
- **Touch screens**: unchanged, a tap on the tooltip shows or hides the message.
- Keep the message short, plain text: no link or button in it (it cannot take the focus).

```html
<ds-tooltip>
  <button type="button" aria-label="Help">?</button>
  <span slot="message">Your password needs 12 characters at least.</span>
</ds-tooltip>

<ds-tooltip position="bottom"><abbr>VAT</abbr><span slot="message">Value added tax</span></ds-tooltip>
```

**Changed**: the message shows on the keyboard focus too, hides on Escape and stays while the pointer is over it; the `role`, id and `aria-describedby` attributes are new. The `mode` and `is-active` props are removed: they did nothing (no class, no state; use `mods` for a modifier class and `disabled` to turn the tooltip off).

<!-- Auto Generated Below -->


## Overview

A tooltip (WAI-ARIA tooltip pattern): a message (`slot="message"`, given `role="tooltip"` and an id) that describes the
content of the tooltip. The first focusable element of the content gets the message in its `aria-describedby`; without
one, the tooltip box (`.ds-tooltip`) is made focusable (`tabindex="0"`) and gets it. The message is shown while the
pointer is over the content or the message, and while the content has the keyboard focus; Escape hides it, without
moving the focus or the pointer. On touch screens, a tap shows or hides it.

## Properties

| Property            | Attribute            | Description                                                                                        | Type                                                                                                                                                                                                                     | Default               |
| ------------------- | -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `containerSelector` | `container-selector` |                                                                                                    | `string`                                                                                                                                                                                                                 | `''`                  |
| `hasArrow`          | `has-arrow`          |                                                                                                    | `boolean`                                                                                                                                                                                                                | `true`                |
| `icon`              | `icon`               | Displayed tooltip icon                                                                             | `string`                                                                                                                                                                                                                 | `''`                  |
| `isDisabled`        | `disabled`           |                                                                                                    | `boolean`                                                                                                                                                                                                                | `false`               |
| `mods`              | `mods`               | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]`                                                                                                                                                                                                     | `[]`                  |
| `position`          | `position`           |                                                                                                    | `TooltipPosition.BOTTOM \| TooltipPosition.BOTTOM_LEFT \| TooltipPosition.BOTTOM_RIGHT \| TooltipPosition.LEFT \| TooltipPosition.RIGHT \| TooltipPosition.TOP \| TooltipPosition.TOP_LEFT \| TooltipPosition.TOP_RIGHT` | `TooltipPosition.TOP` |


## Slots

| Slot        | Description                                                   |
| ----------- | ------------------------------------------------------------- |
|             | The content the tooltip is about (an icon, a text, a button). |
| `"message"` | The message: a short text, without interactive element.       |


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
