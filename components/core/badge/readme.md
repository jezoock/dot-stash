# ds-badge

A small label or count, not interactive: a status (`New`, `Beta`, `Paid`), or a number of new items next to a link or a button (`3`, `99+`).

```html
<a href="/inbox">Inbox <ds-badge type="info" count="3" max="99" label='{"one": "{count} unread message", "other": "{count} unread messages"}'></ds-badge></a>
```

## Styling

- **Classes**: `ds-badge` on `<ds-badge>`; `--neutral`, `--info`, `--success`, `--warning` or `--error` (`type`; an unknown type is `--neutral`), `--count` (with a `count`), `--dot` (`dot`); `mods` → `--<mod>`.
- **Elements**: `__text`, the visible text (the content, or the count); `__label`, the label for assistive technologies (`label`), hidden on the screen.
- **Attributes** (reflected): `type`, `dot`, `mods`.
- **Structure** (`badge.scss`): an inline box (`inline-flex`), in the middle of the line of the text around it, its text on one line, centered. The label is hidden on the screen (a 1 px clipped box). A dot is an empty box of `--ds-badge-dot-size` (`0.5em` without the theme), its text hidden on the screen.
- **Look** (default theme, `components/_badge.scss`): a pill (`--ds-badge-radius`) in bold small text (`ds-token(font-size, 100)`), white on the color of the type: the secondary color for `neutral`, the status color of the same name for the others (`ds-color(status, <type>)`), each with a contrast of 4.5:1 at least with the white text. A badge with one figure is a circle (at least as wide as high). A dot is a disc of 0.625 em in that color. In forced colors, a badge has an outline (its transparent border, which the browser draws in the color of the text), and a dot takes the color of the text around it (CanvasText, LinkText, ButtonText): neither disappears with the backgrounds.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-badge {
  --ds-badge-radius: var(--ds-radius-sm);
}

.ds-badge.--neutral {
  --ds-badge-background: var(--ds-color-gray-dark);
}
```

## Accessibility

- **Not interactive**: no role, no focus, no keys. A badge is a text in the reading order, or a part of the name of the link or the button it is in.
- **Text**: without `label`, assistive technologies read the visible text (`New`, `3`, `99+`). Its color (the type) is not read: say what the badge means in its text ("Paid", "Overdue").
- **Label**: `label` replaces the visible text for assistive technologies with a text that gives it its context: the visible text is `aria-hidden`, the label is hidden on the screen and read. `{count}` is the count: the true count, not the capped one (`150` for `99+`). One template, or one per plural category of the language of the badge (its closest `lang`, that of the page), JSON as an attribute: `{"one": "{count} unread message", "other": "{count} unread messages"}` (the categories of `Intl.PluralRules`: `zero`, `one`, `two`, `few`, `many`, `other`; `other` is the fallback). Keep the visible text in the label (WCAG 2.5.3 Label in Name, for a badge in a link or a button): "3 unread messages" for "3".
- **In a link or a button**: the badge is part of its name, after the text before it: `<a href="/inbox">Inbox <ds-badge count="3" label="{count} unread messages"></ds-badge></a>` is the link "Inbox 3 unread messages" (without `label`: "Inbox 3"). Put a space between the text and the badge, as between two words.
- **Dot** (`dot`): a dot instead of the text, which is hidden on the screen, not from assistive technologies: give the dot a `label` ("New messages") or a text content, else it says nothing. A dot alone, without a text next to it that tells what it means, is a sign by its color only: use it next to a text, an icon or a link.
- **Not a live region**: a change of the count is not announced (a badge in each item of a list would speak at each update). To tell a change that matters, write it in a live region of the page, as a polite `ds-alert` (`live="polite"`) or a visually hidden `role="status"` element: "3 new messages". The name of a link or a button that holds the badge follows the count, read when the user reaches it.
- **Forced colors**: the outline of the badge and the dot stay visible.

```html
<!-- A status: its text is read -->
<ds-badge type="success">Paid</ds-badge>

<!-- A count in a button: "Notifications 12 new" -->
<button type="button">Notifications <ds-badge type="error" count="12" max="9" label="{count} new"></ds-badge></button>

<!-- A dot: its label is read -->
<a href="/messages">Messages <ds-badge type="error" dot label="New messages"></ds-badge></a>
```

```js
// Telling a change of the count, in a live region of the page
badge.count = 4;
document.querySelector('#inbox-status').textContent = '4 unread messages';
```

**New**: `ds-badge` is new.

<!-- Auto Generated Below -->


## Overview

A small label or count, not interactive: a text (`New`), or a `count` (`3`; `99+` above `max`), in the color of its
`type`. `label` gives assistive technologies the text to read instead of the visible one, with the count in it and its
plural (`3 unread messages`): the visible text is then `aria-hidden`, the label hidden on the screen. `dot` shows a dot
instead of the text, which is then hidden on the screen only. It is not a live region: a page that must tell a change of
the count does it with a live region of its own.

## Properties

| Property | Attribute | Description                                                                                                                                                                                                                                                                                                              | Type                                                               | Default     |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------- |
| `count`  | `count`   | A count, shown instead of the content: `3`. Above `max`, `<max>+`.                                                                                                                                                                                                                                                       | `number \| string`                                                 | `undefined` |
| `dot`    | `dot`     | Shows a dot instead of the text: the text (or the label) is hidden on the screen, read by assistive technologies.                                                                                                                                                                                                        | `boolean`                                                          | `false`     |
| `label`  | `label`   | The text assistive technologies read instead of the visible one, hidden on the screen: `{count}` is the count. One template (`{count} unread messages`), or one per plural category of the language of the badge (its closest `lang`), as JSON: `{"one": "{count} unread message", "other": "{count} unread messages"}`. | `"few" \| "many" \| "one" \| "other" \| "two" \| "zero" \| string` | `undefined` |
| `max`    | `max`     | The largest count shown: a count above it shows `<max>+` (`99+`), its label the count itself.                                                                                                                                                                                                                            | `number \| string`                                                 | `undefined` |
| `mods`   | `mods`    | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                       | `string \| string[]`                                               | `[]`        |
| `type`   | `type`    | The type of the badge: `neutral` (default), `info`, `success`, `warning` or `error`. Its `--<type>` class: the color of the theme.                                                                                                                                                                                       | `"error" \| "info" \| "neutral" \| "success" \| "warning"`         | `'neutral'` |


## Slots

| Slot | Description                              |
| ---- | ---------------------------------------- |
|      | The text of the badge (without `count`). |


## CSS Custom Properties

| Name                    | Description                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `--ds-badge-background` | Background of the badge, and color of the dot. Each type sets it to its status color. |
| `--ds-badge-color`      | Text color of the badge.                                                              |
| `--ds-badge-dot-size`   | Size of the dot (`dot`).                                                              |
| `--ds-badge-font-size`  | Font size of the badge.                                                               |
| `--ds-badge-padding`    | Padding of the badge.                                                                 |
| `--ds-badge-radius`     | Corner radius of the badge.                                                           |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
