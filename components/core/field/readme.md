# ds-field

A form field around a native control the page writes in it: `ds-field` renders the label, the hint, the error message, the character counter and the password toggle, and links them to the control. The control stays the form control.

```html
<ds-field
  label="Email"
  hint="We only use it for the receipt."
  messages='{"valueMissing": "Enter your email address"}'
>
  <input type="email" name="email" autocomplete="email" required />
</ds-field>
```

## Controls

| Control                                                                                                          | Supported                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `<input>` of a text box: `text` (or no type), `email`, `number`, `tel`, `url`, `search`, `password`              | yes: label, hint, error, counter (`maxlength`), prefix and suffix; the password toggle for `password`                   |
| `<input>` of a date or a time: `date`, `time`, `datetime-local`, `month`, `week` (the picker of the browser)     | yes: label, hint, error, prefix and suffix                                                                              |
| `<textarea>`                                                                                                     | yes: label, hint, error, counter (`maxlength`)                                                                          |
| `<select>`                                                                                                       | yes: label, hint, error                                                                                                 |
| `ds-select` (its native `select`)                                                                                | yes: label, hint, error; `ds-select` draws its own box and sets the `aria-invalid` of its select itself (the same rule) |
| `checkbox`, `radio`, `range`, `color`, `file`, the buttons, `hidden`; `ds-toggle`, `ds-toggle-group`, `ds-combo` | no: the field finds no control (a `ds-toggle`, `ds-toggle-group` or `ds-combo` has its own label and its own validity)  |

Write one control in a field, as a direct child (the layout of the theme places the direct children). The field enhances the first control it finds in it (not one of a field in it), and follows the changes of the page: a control replaced by another one, its attributes (`required`, `disabled`, `readonly`, `maxlength`, `type`, `id`…), a `<fieldset>` disabled around it, a hint or a prefix added. A value set by a script, or a custom error set or cleared out of an event of the control, changes no attribute and dispatches no event: call `refresh()` after it (or dispatch an `input` event on the control).

## Styling

- **Classes**: `ds-field` on `<ds-field>`; the kind of its control, `--input`, `--textarea`, `--select` or `--ds-select`; `--required` (the control is `required`), `--disabled` (its `disabled`, or a disabled `<fieldset>` around it), `--readonly`, `--invalid` (the error is shown, see [Forms](#forms)), `--password` (a password input) and `--password-shown`, `--prefix` and `--suffix` (the field holds one); `mods` → `--<mod>`. The focus in the field: `.ds-field:focus-within`. No custom state: the field is not form-associated, and the control has the native `:user-invalid` (`.ds-field:has(> :user-invalid)`), shown at the same time as `--invalid`.
- **Elements**: the field renders, around the control it never moves, `__label` (a `<label>`, first) with `__required` (the required mark), `__toggle` (the password toggle, a `<button>` after the control), and, last, `__hint`, `__error`, `__counter` (`--over` over the limit) and `__status` (the live region of the counter, visually hidden by the component stylesheet). The page writes the control, and may write a `<label>`, an element with `slot="hint"`, `slot="prefix"` or `slot="suffix"`: the field and the theme style them by those attributes (`.ds-field > label`, `.ds-field > [slot='prefix']`), and the controls as the direct children of the field (`.ds-field > input`).
- **Structure** (`field.scss`): a grid. The label on the first row; the box on the second, in four columns: the prefix, the control (which takes the width left), the password toggle, the suffix; then the hint, the error and the counter, each on its row. A row without its part has no height; a field stretched by its parent keeps its rows at the top. The control or the toggle that has the focus is above its neighbours, so that its focus indicator shows whole.
- **Look** (default theme, `components/_field.scss`): the label in bold; the required mark in the error color; the control a box with a border (gray dark: a contrast of 3:1 with the page), a radius and a padding, on a gray background while read-only; the prefix, the suffix and the password toggle boxes joined to it, on a gray background (logical sides: the row follows the direction of the text); the password toggle shows an eye (an eye crossed out while the password shows), the icons `eye` and `eye-off` of the theme (the `show` and `hide` types of `ds-icon`); the hint and the counter in small gray text; the error in small text in the error color, after the `attention-alt` icon; an invalid control (`--invalid`) has its border in the error color, a counter over the limit is in the error color; a disabled field dims its box (`opacity: 0.5`, as a disabled `ds-select`). A `ds-select` in a field gets the border color of the field. Only the controls in a field are styled: the base styles of the other inputs of the page do not change. The theme has no transition for the field (nothing to do with less motion). In forced colors, the borders, the icons (in the color of their text: CanvasText, ButtonText) and the focus indicator show; the error is told by its text and its icon.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-field {
  --ds-field-radius: 0;
  --ds-field-border-color: var(--ds-color-gray-darkest);
}

.compact ds-field {
  --ds-field-padding: var(--ds-space-1) var(--ds-space-2);
}
```

## Accessibility

The control keeps its role, its keyboard and its states: those of the native control. The field adds:

- **Name**: `label` renders a `<label for="<id of the control>">` (the control gets an id, `ds-field-…-control`, if it has none): it names the control, and a click on it focuses the control. A `<label>` of the page in the field (`<label for="<id>">`) replaces it; the field leaves it as it is. Do not name the control twice (`aria-label` wins over the label element).
- **Required**: the native `required` gives the required state to assistive technologies. The required mark after the label (`*`) is decorative, `aria-hidden="true"`, out of the name; `labels.required` changes its text, for sighted users who do not know the asterisk ("(required)"), or removes it (`''`). Say what the mark means at the top of the form ("Fields marked * are required"). With a `<label>` of the page, write the mark in it.
- **Description** (`aria-describedby`, the ids of the field after those the page wrote, in their order; the page can add its own later): the text of the prefix and the suffix (a unit: `€`, `kg`; one without text, an icon, is `aria-hidden`), the hint, the error once shown, the counter. The field removes only its own ids.
- **Error**: shown when the user should see it, as `:user-invalid`: after an `invalid` event (a submission, `checkValidity()` or `reportValidity()` of the control or its form) or once the user changed the value (`change`: a text box once it loses the focus, a select at once), until it is valid (it then follows the value as the user types) or the form is reset. The field shows it in the `invalid` event, before the browser focuses the control: the control is read with its error. **The error is not a live region**: a live region would speak at each key once the error shows, and a message that appears when the user leaves a field would interrupt the reading of the next one. It is read with the control (its description), which the browser focuses on a submission; a page that validates on its own moves the focus to the first invalid control (or to an error summary).
- **`aria-invalid`** on the control (not on the select of a `ds-select`, which sets its own with the same rule): `"true"` once the error is shown; `"false"` while the control is invalid but the error not shown yet; none while it is valid (the one the page wrote is given back). Chromium tells a wrong value invalid from the load and at each key (an email without `@`), and never tells an empty required control invalid, even after a submission: the attribute gives assistive technologies the invalid state when the error shows, for every flag.
- **Counter**: the visible counter is `aria-hidden` and described by the control (read with it: "Message, 42 characters remaining"). A polite live region (`__status`, `aria-live="polite"`, `aria-atomic="true"`, visually hidden) tells the count once the user stops typing for a second (not at each key), only after an input of the user.
- **Password toggle**: a native `<button type="button">` after the input, in the Tab order, without a name attribute (not submitted). It follows the WAI-ARIA [button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) pattern for a toggle button: its name stays "Show password" (`labels.showPassword`), `aria-pressed="true"` while the password shows (the name of a toggle button does not change with its state). Enter and Space press it. It changes the type of the input (`password` / `text`): the value stays, the focus stays on the button, and when the input takes the focus again, the caret or the selection it had (the browser would select the whole value on a Tab, which the next key would replace; a click then places the caret). The password is hidden again when its form is submitted (before the page handles the `submit` event: the browser does not submit it from a text box, which it would keep in its form history or its autofill), reset, and when the page is left (`pagehide`: a page that comes back from the back/forward cache shows it hidden). A disabled input disables the button; a disabled fieldset around the field disables both.
- **Prefix and suffix**: in the box, before and after the control: a text (a unit) describes the control; an icon without text is hidden from assistive technologies.

```html
<!-- The page's own label: the field leaves it as it is -->
<ds-field>
  <label for="nickname">Nickname <span aria-hidden="true">*</span></label>
  <input id="nickname" name="nickname" required />
</ds-field>
```

## Forms

The control stays the form control: the field is not form-associated, renders no control but the password toggle (a button without a name: not submitted), and never moves nor names a control. As without the field:

- **Value**: the control submits its value under its `name` (`new FormData(form)` gives the same entries with or without the fields), and the browser autofills it (`autocomplete`).
- **Validation**: the constraints of the control (`required`, `type`, `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`, `setCustomValidity()`) and the validation of the browser: a submission stops on the first invalid control, which the browser focuses, with its own message in its bubble; `checkValidity()`, `reportValidity()`, `validity` and `validationMessage` are those of the control. The field shows its error under it (the message of the browser, or `messages` and `error-message`).
- **Error message**: the message of a custom error of the page (`setCustomValidity('This name is taken')`); else the message of the first invalid flag of the control in `messages` (in this order: `valueMissing`, `badInput`, `typeMismatch`, `patternMismatch`, `tooLong`, `tooShort`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`); else `error-message`; else the message of the browser (`validationMessage`, in the language of the browser). `messages` and `error-message` are texts of the page, to translate with it; the bubble of the browser keeps its own message. To show only the messages of the fields, give the form `novalidate`: in its `submit` handler, `form.checkValidity()` dispatches the `invalid` events the fields show; when it returns `false`, cancel the submission (`event.preventDefault()`) and move the focus to the first invalid control (`form.querySelector(':invalid')`).
- **Disabled, read-only**: those of the control (`disabled`, a disabled `<fieldset>` around it, `readonly`): not submitted, not validated (the error goes), `--disabled` and `--readonly` on the field. The field has no `disabled` prop.
- **Reset**: a form reset gives the controls their values of the load (the browser), hides the errors (until an `invalid` event or a change), counts again and hides the password.
- **Restore**: the browser restores the value of the control from the history (it is not moved nor rendered by the field). The password toggle has no state to restore (the password is hidden again when the page is left). A `ds-select` in a field keeps the limits of `ds-select` (see [ds-select](../select/readme.md#forms)).

## Texts

`labels` (JSON as an attribute) translates the texts of the field, each with an English default:

| Key                | Default                                                                                     | What it is                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `required`         | `*`                                                                                         | The mark after the label of a required control (`aria-hidden`); `''` for none.                 |
| `showPassword`     | `Show password`                                                                             | The name of the password toggle (`aria-pressed` gives its state).                              |
| `counterRemaining` | `{"one": "{count} character remaining", "other": "{count} characters remaining"}`           | The counter within the limit.                                                                  |
| `counterOver`      | `{"one": "{count} character over the limit", "other": "{count} characters over the limit"}` | The counter over the limit (a value longer than the `maxlength`, set by a script or the page). |

A text of the counter is one template (`"{count} left"`) or one per plural category of the language of the field (its closest `lang`: the page's), as `Intl.PluralRules` names them (`zero`, `one`, `two`, `few`, `many`, `other`; `other` is the fallback). The error messages are `messages` and `error-message` (texts of the page) or those of the browser.

```html
<html lang="fr">
  …
  <ds-field
    label="Mot de passe"
    labels='{"required": "(obligatoire)", "showPassword": "Afficher le mot de passe"}'
    messages='{"valueMissing": "Saisissez votre mot de passe", "tooShort": "12 caractères au moins"}'
  >
    <input
      type="password"
      name="password"
      autocomplete="current-password"
      required
      minlength="12"
    />
  </ds-field>
  <ds-field
    label="Message"
    counter
    labels='{"counterRemaining": {"one": "{count} caractère restant", "other": "{count} caractères restants"}, "counterOver": {"one": "{count} caractère en trop", "other": "{count} caractères en trop"}}'
  >
    <textarea name="message" maxlength="500"></textarea>
  </ds-field>
</html>
```

## Examples

```html
<!-- A text box, an email, a phone number, a URL, a search -->
<ds-field label="Full name"><input name="name" autocomplete="name" /></ds-field>
<ds-field label="Email" hint="We only use it for the receipt."
  ><input type="email" name="email" autocomplete="email" required
/></ds-field>
<ds-field label="Phone" hint="With the country code: +33…"
  ><input type="tel" name="phone" autocomplete="tel"
/></ds-field>
<ds-field
  label="Website"
  error-message="Enter an address that starts with https://"
  ><input type="url" name="site" pattern="https://.*"
/></ds-field>
<ds-field label="Search the docs"><input type="search" name="q" /></ds-field>

<!-- A number, with a prefix and a suffix (their text describes the control) -->
<ds-field
  label="Amount"
  hint="From 1 to 500."
  messages='{"rangeOverflow": "500 € at most"}'
>
  <span slot="prefix">€</span>
  <input type="number" name="amount" min="1" max="500" step="0.01" />
  <span slot="suffix">EUR</span>
</ds-field>

<!-- A password: the toggle; a hint with markup -->
<ds-field
  label="New password"
  messages='{"tooShort": "Use 12 characters at least"}'
>
  <input
    type="password"
    name="password"
    autocomplete="new-password"
    required
    minlength="12"
  />
  <p slot="hint">
    12 characters at least.
    <a href="/help/passwords">How to choose a password</a>
  </p>
</ds-field>

<!-- A date: the picker of the browser -->
<ds-field label="Delivery date"
  ><input type="date" name="date" min="2026-11-10"
/></ds-field>

<!-- A textarea with a counter -->
<ds-field label="Message" counter>
  <textarea name="message" rows="4" maxlength="500"></textarea>
</ds-field>

<!-- A native select, a ds-select -->
<ds-field label="Country"
  ><select name="country" autocomplete="country">
    <option value="fr">France</option>
    <option value="be">Belgium</option>
  </select></ds-field
>
<ds-field label="Size" hint="See the size guide.">
  <ds-select name="size" required
    ><option value="">Choose a size</option>
    <option value="s">S</option>
    <option value="m">M</option></ds-select
  >
</ds-field>

<!-- Read-only, disabled -->
<ds-field label="Customer number"
  ><input name="customer" value="C-10442" readonly
/></ds-field>
<fieldset disabled>
  <legend>Gift message (soon)</legend>
  <ds-field label="Message"><textarea name="gift"></textarea></ds-field>
</fieldset>
```

```js
// A check of the page (a username taken): a custom error, shown with its message.
const username = document.querySelector("#username");
username.addEventListener("input", () => username.setCustomValidity(""));
username.addEventListener("change", async () => {
  const taken = await isTaken(username.value);
  username.setCustomValidity(taken ? "This username is taken" : "");
  username.closest("ds-field").refresh(); // set out of an event of the control
});
```

## Limits

- One control per field, a direct child of the field for the layout. A `<label>` of the page names it only with `for` (or around the control, out of the grid of the theme).
- The prefix, the suffix and the password toggle are in the box of an `input`; a `ds-select` draws its own box (no prefix nor suffix).
- The bubble of the browser shows its own message on a submission (see [Forms](#forms) to show only those of the fields).
- `form.submit()` (a script) dispatches no `submit` event: the password is hidden only when the page is left.

<!-- Auto Generated Below -->


## Overview

A form field around a native control the page writes in it: an `input` (a text box: text, email, number, tel, url,
search, password; a date or a time), a `textarea`, a `select` or a `ds-select`. The field renders a label, a hint, an
error message, a character counter and a password toggle around the control, and links them to it (`<label for>`,
`aria-describedby`); the control stays the form control: it is submitted, autofilled, validated and restored by the
browser as without the field, which never creates, moves nor names a form control, and submits nothing.

The error message shows once the user should see it, as `:user-invalid`: after an `invalid` event of the control (a
submission, `checkValidity()`, `reportValidity()`) or once the user changed its value (`change`), until it is valid or
the form is reset. Its text is the message of the browser, or `messages` and `error-message`.

## Properties

| Property       | Attribute       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Type                        | Default     |
| -------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------- |
| `counter`      | `counter`       | Shows the number of characters left under a control with a `maxlength` (`__counter`), which the control describes; screen readers are told the count once the user stops typing.                                                                                                                                                                                                                                                                                  | `boolean`                   | `undefined` |
| `errorMessage` | `error-message` | The error message of the flags that have none in `messages`, instead of the message of the browser.                                                                                                                                                                                                                                                                                                                                                               | `string`                    | `undefined` |
| `hint`         | `hint`          | A hint under the control (`__hint`), which the control describes (`aria-describedby`). An element with `slot="hint"` replaces it.                                                                                                                                                                                                                                                                                                                                 | `string`                    | `undefined` |
| `label`        | `label`         | The label of the control: a `<label for>` rendered before it (the control gets an id if it has none), with the required mark of `labels` while the control is `required`. A `<label>` of the page in the field replaces it.                                                                                                                                                                                                                                       | `string`                    | `undefined` |
| `labels`       | `labels`        | The texts of the field (JSON as an attribute), to translate them: `required`, `showPassword`, `counterRemaining`, `counterOver` (see the readme).                                                                                                                                                                                                                                                                                                                 | `DSFieldLabels \| string`   | `{}`        |
| `messages`     | `messages`      | The error messages per validity flag of the control (JSON as an attribute), instead of the message of the browser: `{"valueMissing": "Enter your email address", "typeMismatch": "Enter an email address, like name@example.com"}`. The flags: `valueMissing`, `badInput`, `typeMismatch`, `patternMismatch`, `tooLong`, `tooShort`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`. A custom error of the page (`setCustomValidity()`) shows its own message. | `DSFieldMessages \| string` | `{}`        |
| `mods`         | `mods`          | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                                                                                                                                                                | `string \| string[]`        | `[]`        |


## Methods

### `refresh() => Promise<void>`

Reads the control again and updates the field: after a change that no event or attribute tells, as a value set by a
script (the counter) or a custom error set or cleared out of an event (`setCustomValidity()`).

#### Returns

Type: `Promise<void>`




## Slots

| Slot       | Description                                                                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|            | The control: a direct child of the field, for the layout of the theme. A `<label for>` of the page in the field replaces `label`.                                                        |
| `"hint"`   | An element with `slot="hint"`: a hint with markup, instead of `hint`, described by the control.                                                                                          |
| `"prefix"` | An element with `slot="prefix"`, before the control in its box: a unit, a currency or an icon. With a text, the control describes it; without, it is hidden from assistive technologies. |
| `"suffix"` | An element with `slot="suffix"`, after the control in its box, as `prefix`.                                                                                                              |


## CSS Custom Properties

| Name                             | Description                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--ds-field-addon-background`    | Background of the prefix, of the suffix and of the password toggle.                                                     |
| `--ds-field-addon-color`         | Color of the text and the icons of the prefix, of the suffix and of the password toggle.                                |
| `--ds-field-background`          | Background of the control.                                                                                              |
| `--ds-field-border-color`        | Border color of the control, of the prefix, of the suffix and of the password toggle (and of a ds-select in the field). |
| `--ds-field-gap`                 | Space between the label, the box, the hint, the error and the counter.                                                  |
| `--ds-field-hint-color`          | Color of the hint and of the counter.                                                                                   |
| `--ds-field-invalid-color`       | Color of the error message and its icon, of the border of an invalid control, and of a counter over the limit.          |
| `--ds-field-label-color`         | Color of the label.                                                                                                     |
| `--ds-field-padding`             | Padding of the control.                                                                                                 |
| `--ds-field-radius`              | Corner radius of the box (the control, with its prefix, suffix and password toggle).                                    |
| `--ds-field-readonly-background` | Background of a read-only control.                                                                                      |
| `--ds-field-required-color`      | Color of the required mark after the label.                                                                             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
