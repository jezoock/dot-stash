# ds-alert

An inline message of the page, in its flow (not a toast, see [`ds-toaster`](../toaster/readme.md)): an information, a success, a warning or an error, with an optional title and a dismiss button.

```html
<ds-alert type="error" heading="Payment failed" level="2">
  <p>Your card was declined. Try another card or contact your bank.</p>
</ds-alert>
```

## Styling

- **Classes**: `ds-alert` on `<ds-alert>`; `--info`, `--success`, `--warning` or `--error` (`type`; an unknown type is `--info`), `--dismissible`, `--live` (`live` is `polite` or `assertive`); `mods` → `--<mod>`.
- **Elements**: `__content` (the live region, when the alert is live), with `__title` (the title: `heading` or the `slot="title"` element; `hidden` without one) and `__body` (the message, the default slot); `__prefix`, the prefix of the type (`Error:`), first in the title, else in the body; `__dismiss`, the dismiss button (`dismissible`), after the content.
- **Attributes** (reflected): `type`, `live`, `dismissible`, `mods`. A dismissed alert has the `hidden` attribute.
- **Structure** (`alert.scss`): a grid of three columns, in the direction of the text (right to left too): the icon (the `::before` of the alert, drawn by the theme), the content, which takes the width left, and the dismiss button, on the first row. `[hidden]` is not rendered (it wins over the display of the grid). The prefix is hidden on the screen (a 1 px clipped box), not from screen readers.
- **Look** (default theme, `components/_alert.scss`): a box on a light gray background, in the dark text color, with a border of 4 px on the start side (the left, the right from right to left) in the status color of the type (`ds-color(status, <type>)`, `--ds-alert-accent-color`), a radius, a padding and a space after it. The icon of the type, in that color, on the first line: `info` (an i in a circle), `ok-circle` (a check in a circle), `attention` (a triangle) and `attention-alt` (an exclamation mark in a circle): each type has its own shape, the color is not the only sign. The title in bold, at the size of the message (a heading of the page in the title slot too: without its margins, its level kept); the first and last paragraphs of the message without their outer margins. The dismiss button: a cross (`cancel`) in a square of 1.5 em, on a gray background under the pointer. The theme has no transition for the alert. In forced colors, the box has a frame (its transparent borders, which the browser draws in the color of the text), the icons take the color of the text and of the button, and the focus indicator shows.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-alert {
  --ds-alert-radius: 0;
  --ds-alert-border-width: 6px;
}

.ds-alert.--success {
  --ds-alert-accent-color: var(--ds-color-primary-dark);
}
```

## Accessibility

- **Not a live region by default** (`live="off"`): a message that is part of the page (written by the server, there when the page loads) is read where it is, as the text around it: it is not announced, it does not interrupt the reading of the page. Its name does not make it an ARIA `alert`.
- **Live** (WCAG 4.1.3 Status Messages): an alert that a script inserts, shows (`hidden` removed) or fills is announced with `live`. `polite`: `role="status"` (`aria-live="polite"`), read when the screen reader is idle: a result, a saved state. `assertive`: `role="alert"` (`aria-live="assertive"`), read at once: an error that blocks the user. The region is `__content`, the title and the message (`aria-atomic="true"`: the whole region is read again when a part of it changes), not the icon nor the dismiss button.
- **Region before content**: a screen reader announces the changes of a live region it already knows; a region that comes with its content is not announced reliably. A live alert renders its region from its first render, and keeps its title and message from assistive technologies (`aria-hidden`, while they show on the screen) for half a second (`DS_ALERT_LIVE_DELAY`, 500 ms): the content then reaches assistive technologies in a later change than the region, and is announced. Hidden (`hidden`), it keeps its content back again, until it is shown. Set `live` before the alert gets its content: in its HTML, or before inserting it (`live` set later starts the same wait). A live alert in the page at load is announced too, once the component has loaded: keep `live="off"` for the messages of the page.
- **Changes**: change the content of a live alert by its children (the text of its paragraph, a node appended), not with `innerHTML` or `textContent` on the alert itself (see [Using the components](../../../README.md#components)): the change is announced, with the prefix and the title. Changing `type` or `heading` is announced too.
- **Prefix**: the icon is decorative (its CSS alternative text is empty: not read). The type is told by a prefix, hidden on the screen and read before the title, or before the message without a title: `Information:`, `Success:`, `Warning:`, `Error:` (`labels`, `''` to leave one out when the title says it).
- **Title**: `heading` renders a title before the message; with `level` (1 to 6), it is a heading (`role="heading"`, `aria-level`), whose name starts with the prefix ("Error: Payment failed"), for a message that is a section of the page (an error summary at the top of a form: level 2). Without `level`, it is a text in bold, not a heading. A heading element of the page in the title slot (`<h2 slot="title">`) keeps its level (`level` is ignored); the prefix is then before it.
- **Dismiss button** (`dismissible`): a native `<button type="button">` after the message, named "Dismiss" (`labels.dismiss`, `aria-label`): Tab reaches it after the links of the message, Enter and Space press it. It emits `alertDismiss` (cancelable: `preventDefault()` keeps the alert), hides the alert (`hidden`) and emits `alertDismissed`. No Escape: the alert is part of the page, not a layer (see the Escape order in the [README](../../../README.md#names-roles-and-keyboard)).
- **Focus after a dismiss**: when the focus was in the alert (the button pressed with the keyboard, or clicked), it goes to the first element of the Tab order after the alert, else to the last one before it, else it leaves the alert (to the document). Tab then goes on from where the alert was. A page that wants another place focuses it in `alertDismissed`. When the focus was elsewhere, it stays there.
- **Forced colors**: the frame of the box, the icons and the focus indicator show; the type is told by the shape of the icon and the prefix, not by a color.

```html
<!-- A message of the page: not announced -->
<ds-alert type="warning">Orders placed after 3 pm ship the next day.</ds-alert>

<!-- A live region in the page, hidden, filled and shown by a script: announced -->
<ds-alert id="save-status" live="polite" type="success" hidden><p></p></ds-alert>
```

```js
const status = document.querySelector('#save-status');
status.querySelector('p').textContent = 'Your changes are saved.';
status.removeAttribute('hidden'); // announced: "Success: Your changes are saved."

// An alert inserted by a script: announced at once
const alert = Object.assign(document.createElement('ds-alert'), { type: 'error', live: 'assertive', dismissible: true });
alert.append(Object.assign(document.createElement('p'), { textContent: 'The payment failed.' }));
form.prepend(alert);
```

## Texts

`labels` (JSON as an attribute, or an object) translates the texts of the alert, each with an English default:

| Key       | Default        | What it is                                                      |
| --------- | -------------- | --------------------------------------------------------------- |
| `info`    | `Information:` | The prefix of an `info` alert, read before its title or message |
| `success` | `Success:`     | The prefix of a `success` alert                                 |
| `warning` | `Warning:`     | The prefix of a `warning` alert                                 |
| `error`   | `Error:`       | The prefix of an `error` alert                                  |
| `dismiss` | `Dismiss`      | The name of the dismiss button                                  |

```html
<html lang="fr">
  …
  <ds-alert type="error" dismissible labels='{"error": "Erreur :", "dismiss": "Fermer le message"}'>Le paiement a échoué.</ds-alert>
</html>
```

## Examples

```html
<ds-alert>Your session ends in 5 minutes.</ds-alert>
<ds-alert type="success" heading="Saved">Your changes are saved.</ds-alert>
<ds-alert type="warning" dismissible>
  <p>Your password expires in 3 days. <a href="/account">Change it</a>.</p>
</ds-alert>

<!-- An error summary at the top of a form, after a submission: a heading of the page -->
<ds-alert type="error">
  <h2 slot="title">There are 2 errors</h2>
  <ul>
    <li><a href="#email">Enter your email</a></li>
    <li><a href="#terms">Accept the terms</a></li>
  </ul>
</ds-alert>
```

**New**: `ds-alert` is new. `ds-ajax` still shows its error in a `p.ds-message.--error` with `role="alert"`, and the `.ds-message` skin of the theme is unchanged.

<!-- Auto Generated Below -->


## Overview

An inline message of the page (not a toast): `info`, `success`, `warning` or `error` (`type`), with an optional title
(`heading`, or a `slot="title"` element) and its content. The theme draws the icon of its type, decorative: a prefix
hidden on the screen (`Error:`, `labels`) tells the type to assistive technologies, before the title or the content.

It is not a live region by default (`live="off"`): a message that is part of the page is read where it is. An alert that
a script inserts, shows or fills is announced with `live`: `polite` (`role="status"`) or `assertive` (`role="alert"`).
Its region is rendered before its content reaches assistive technologies (`DS_ALERT_LIVE_DELAY`), so that the content
is announced; a change of its content is announced too, the whole region (`aria-atomic`).

`dismissible` renders a dismiss button: `alertDismiss` (cancelable), then the alert is hidden (`hidden`), the focus
goes to the next element of the Tab order (else the previous one) when it was in the alert, and `alertDismissed`.

## Properties

| Property      | Attribute     | Description                                                                                                                                                                                                                                                                                                               | Type                                          | Default     |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------- |
| `dismissible` | `dismissible` | Renders a dismiss button after the message: `alertDismiss` (cancelable), then the alert is hidden.                                                                                                                                                                                                                        | `boolean`                                     | `false`     |
| `heading`     | `heading`     | The title of the alert, before the message (`__title`). A `slot="title"` element replaces it.                                                                                                                                                                                                                             | `string`                                      | `undefined` |
| `labels`      | `labels`      | The texts of the alert (JSON as an attribute), to translate them: `info`, `success`, `warning`, `error` (the prefixes), `dismiss`.                                                                                                                                                                                        | `DSAlertLabels \| string`                     | `{}`        |
| `level`       | `level`       | The heading level (1 to 6) of the title: it is a heading (`role="heading"`, `aria-level`). Not applied when the title holds a heading element (`<h2 slot="title">`), which has its own level. Without it, the title is not a heading.                                                                                     | `number \| string`                            | `undefined` |
| `live`        | `live`        | Whether the alert is a live region, announced when it appears and when its content changes: `off` (default: read where it is, for a message that is part of the page), `polite` (`role="status"`) or `assertive` (`role="alert"`, an urgent message, read at once). Set it before the alert gets the content to announce. | `"assertive" \| "off" \| "polite"`            | `'off'`     |
| `mods`        | `mods`        | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                        | `string \| string[]`                          | `[]`        |
| `type`        | `type`        | The type of the message: `info` (default), `success`, `warning` or `error`. Its `--<type>` class: the icon and the color of the theme.                                                                                                                                                                                    | `"error" \| "info" \| "success" \| "warning"` | `'info'`    |


## Events

| Event            | Description                                                                                   | Type                |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| `alertDismiss`   | Emitted before the alert is dismissed (its button, `dismiss()`): `preventDefault()` keeps it. | `CustomEvent<void>` |
| `alertDismissed` | Emitted once the alert is dismissed: hidden, the focus moved.                                 | `CustomEvent<void>` |


## Methods

### `dismiss() => Promise<boolean>`

Dismisses the alert, as its dismiss button: emits `alertDismiss`, and unless it is cancelled, hides the alert (the
`hidden` attribute), moves the focus out of it when it had it, and emits `alertDismissed`. Resolves with whether it was
dismissed (`false`: cancelled, or already hidden).

#### Returns

Type: `Promise<boolean>`




## Slots

| Slot      | Description                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------- |
|           | The message: a text, or paragraphs, a list, links.                                                        |
| `"title"` | The title, instead of `heading`: a heading element of the page (`<h2 slot="title">`), with its own level. |


## CSS Custom Properties

| Name                      | Description                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `--ds-alert-accent-color` | Color of the type: the border on the start side and the icon. Each type sets it to its status color. |
| `--ds-alert-background`   | Background of the alert.                                                                             |
| `--ds-alert-border-width` | Width of the border on the start side, in the color of the type.                                     |
| `--ds-alert-color`        | Text color of the alert.                                                                             |
| `--ds-alert-gap`          | Space between the icon, the content and the dismiss button.                                          |
| `--ds-alert-icon-size`    | Size of the icon of the type.                                                                        |
| `--ds-alert-padding`      | Padding of the alert.                                                                                |
| `--ds-alert-radius`       | Corner radius of the alert.                                                                          |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
