# ds-toggle

## Styling

- **Classes**: `ds-toggle` on `<ds-toggle>`, and `--<type>`: `--radio`, `--checkbox`, `--switch` (the default) or `--icon` (its own `type`, else the type of its `ds-toggle-group`); `--disabled` (its own `disabled`, or a disabled `ds-toggle-group` or `<fieldset>` around it); `--invalid` (required and not checked, shown after an `invalid` event or a change by the user, see [Forms](#forms)); `mods` → `--<mod>`.
- **Custom state**: `:state(user-invalid)`, the same as `--invalid`, for a stylesheet that does not use the classes.
- **Attributes** (reflected): `checked` (the state the theme styles), `disabled`, `required`, `type`, `name`, `value`, `mods`.
- **Slots**: the default slot, the content of an `icon` toggle (the other types draw themselves: their content is a text that names them, visually hidden).
- **Focus**: the element takes the focus: the outline of the theme (`:focus-visible`, see [Focus indicator](../../../README.md#focus-indicator)) draws around its box.
- **Structure** (`toggle.scss`): an inline box that takes the pointer. A radio or a checkbox is a 2rem square with a 1.5rem mark (`::after`) in its center, shown when `checked`; a switch is a 3.5rem × 2rem track with a 1.5rem knob (`::after`), on the left, on the right when `checked`. The changes of state are animated (0.4 s): the colors, the border, the ring (`box-shadow`) and the opacity of the toggle, the opacity, place (`left`), colors and transform of its mark or knob; not the focus outline, which shows at once, nor the visibility, so that a toggle takes the focus as soon as it is shown. An `icon` toggle is its content.
- **Look** (default theme, `components/_toggle.scss`): the borders and radii of the radios, checkboxes and switches, and their colors in each state (`--disabled` included), from the custom properties below, set on `ds-toggle`. An invalid toggle (`--invalid`, or in a `ds-toggle-group` that has it) has the error color (`--ds-toggle-invalid-color`): the border of a radio or a checkbox, a 2px ring around a switch or a toggle button.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-toggle {
  --ds-toggle-checked-color: var(--ds-color-primary-base);
  --ds-toggle-knob-checked-color: var(--ds-color-status-success);
}

.filters ds-toggle {
  --ds-toggle-color: var(--ds-color-gray-dark);
}
```

## Accessibility

The `<ds-toggle>` element is the control (there is no native input in it). It follows the WAI-ARIA [switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/), [checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), [radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) and [toggle button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) patterns:

| Type                        | Role       | State                             |
| --------------------------- | ---------- | --------------------------------- |
| `switch` (the default)      | `switch`   | `aria-checked="true"` / `"false"` |
| `checkbox`                  | `checkbox` | `aria-checked`                    |
| `radio`                     | `radio`    | `aria-checked`                    |
| `icon` (and any other type) | `button`   | `aria-pressed="true"` / `"false"` |

- **Focus**: `tabindex="0"`, Tab reaches it. In a `ds-toggle-group` of radios, only one radio is in the Tab order and the arrow keys move between them: the group calls `setTabbable()` (`false` renders `tabindex="-1"`), see [`ds-toggle-group`](../toggle-group/readme.md#accessibility).
- **Disabled**: `aria-disabled="true"` and no `tabindex`: it cannot be focused, and clicks and keys do nothing. Its own `disabled`, a disabled `ds-toggle-group` (`setGroupDisabled()`) or a disabled `<fieldset>` around it disable it; the last two leave its `disabled` prop as it is.
- **Keyboard**:

  | Key    | Switch, toggle button (`icon`) | Checkbox | Radio                                                      |
  | ------ | ------------------------------ | -------- | ---------------------------------------------------------- |
  | Space  | toggles                        | toggles  | checks (a radio is not unchecked)                          |
  | Enter  | toggles                        | nothing  | nothing                                                    |
  | Arrows | —                              | —        | in a `ds-toggle-group` of radios: the previous or next one |

  A key toggles the element as a click does: it dispatches a `click` event, then `toggle` is emitted. Space does not scroll the page; a key held down does not repeat; the keys with Alt, Ctrl or Meta are left to the browser.

- **Name** (required): `aria-labelledby` on the element, with the id of a visible label; else `label`, rendered as `aria-label`; else a `<label>` element, `<label for="<id of the toggle>">` or a `<label>` around it (a click on it toggles it, and gives it the focus, as for a native checkbox); else the text of its content (the roles take their name from it), visually hidden for a radio, a checkbox or a switch, which have no room for it (`.ds-visually-hidden`). The name of a toggle button stays the same in both states: `aria-pressed` tells the state ("Favorite", pressed or not).
- **Required**: `aria-required="true"` on a required checkbox or switch (the roles that have it; a required radio belongs to a `ds-toggle-group`, which carries it). `aria-invalid="true"` once the user should see that it is not checked (as `:user-invalid`): after an `invalid` event (a submission, `checkValidity()` or `reportValidity()` of the toggle or of its form) or after the user unchecked it, until it is checked or the form is reset. Before that, a required toggle left unchecked has `aria-invalid="false"`: the browser would otherwise announce it as invalid from the start, as it does for a native checkbox.

```html
<span id="wifi-label">Wi-Fi</span>
<ds-toggle aria-labelledby="wifi-label" checked></ds-toggle>

<label for="newsletter">Subscribe to the newsletter</label>
<ds-toggle id="newsletter" type="checkbox" name="newsletter" value="yes"></ds-toggle>

<ds-toggle type="icon" label="Show the password"><ds-icon type="show" aria-hidden="true"></ds-icon></ds-toggle>
```

## Forms

`ds-toggle` is a form-associated custom element: in a `<form>`, it behaves as a native checkbox (or radio), without any native input in it.

- **Value**: checked (pressed, for an `icon` toggle) and enabled, it submits `<name>=<value>`, `value` being `on` without one; unchecked, disabled or without a `name`, it submits nothing. A `switch` and an `icon` toggle submit as a checkbox. In a `ds-toggle-group`, each toggle submits its own value, under the name of the group (see [`ds-toggle-group`](../toggle-group/readme.md#forms)).
- **Disabled**: a disabled toggle (its own `disabled`, its group, or a disabled `<fieldset>`) submits nothing and is not validated.
- **Reset**: a form reset gives it back its checked state of the load (as the `defaultChecked` of a native checkbox), without a `toggle` event.
- **Restore**: the browser gives back its checked state when the page comes back from the history without its cache (`formStateRestoreCallback`), without a `toggle` event.
- **Required**: `required` makes it invalid while it is not checked (`valueMissing`): the form is not submitted, and the browser shows its message at the toggle, which gets the focus. The message is the browser's own, in its language (that of a native required checkbox, or radio), or `required-message`. A radio of a `ds-toggle-group` makes its group required instead.
- **Validity**: as a native control, `validity`, `validationMessage` and `willValidate` (read-only properties), and `checkValidity()` and `reportValidity()`, which are asynchronous, as every method of a component (`await toggle.checkValidity()`); the form's own `checkValidity()` and `reportValidity()` include the toggle. The `invalid` event, `:invalid` and `:valid` work as on a native control.
- **Attributes**: as on a native control, a boolean attribute is true when it is present, whatever its value: `checked="false"` is checked.

```html
<form action="/subscribe">
  <label for="terms">I accept the terms</label>
  <ds-toggle id="terms" type="checkbox" name="terms" value="accepted" required></ds-toggle>
  <label>Newsletter <ds-toggle name="newsletter" checked></ds-toggle></label>
  <button>Subscribe</button>
</form>
<!-- Submitted: terms=accepted&newsletter=on -->
```

**Changed**: the role, the `aria-checked` / `aria-pressed` and `aria-disabled` states, the focus (`tabindex`), the keyboard, `label` and `setTabbable()` are new; the focus outline is out of the 0.4 s transition of the toggle (it showed animated, from a 3px outline of the text color), and so is the visibility (the transition listed no property, `all`: a toggle shown or hydrated was hidden for the first frame, and could not take the focus in it). It is form-associated (new `required` and `required-message` props, `validity`, `validationMessage` and `willValidate` properties, `checkValidity()`, `reportValidity()` and `setGroupDisabled()` methods, the `--disabled` and `--invalid` classes); the theme styles a disabled toggle from `--disabled` (it styled the `disabled` attribute).

<!-- Auto Generated Below -->


## Overview

A radio, checkbox, switch or icon toggle. A click checks a radio (it cannot be unchecked by a click)
and checks or unchecks the other types; each change emits `toggle` with `{ name, value, checked }`.
The element is the control: it has the role of its type (`switch`, `checkbox`, `radio`, `button` with
`aria-pressed` for an `icon`), its state (`aria-checked`), and takes the focus (`tabindex="0"`); Space
toggles it (checks a radio), Enter too for a switch or an icon. A disabled toggle is `aria-disabled` and
cannot be focused.
It is form-associated, as a native checkbox or radio: checked, it submits its `value` (`on` by default) under its
`name` with its form; a `<label>` names it and a click on the label toggles it; a disabled fieldset disables it; a
form reset gives it back its checked state of the load; `required` makes it invalid while it is not checked.

## Properties

| Property            | Attribute            | Description                                                                                                                                                                                                                                      | Type                          | Default     |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ----------- |
| `checked`           | `checked`            | Whether the toggle is checked (pressed, for an `icon` toggle). Its value at the load is the default one, which a form reset gives back.                                                                                                          | `boolean`                     | `undefined` |
| `disabled`          | `disabled`           | A disabled toggle ignores clicks and keys, cannot be focused (`aria-disabled="true"`, no `tabindex`) and submits nothing. A disabled `<fieldset>` or `ds-toggle-group` disables it too, without changing this prop.                              | `boolean`                     | `undefined` |
| `label`             | `label`              | The accessible name of the toggle (`aria-label`), for a toggle without a text in it. A visible label elsewhere names it with a `<label>` element (`<label for="<id>">`, or around it) or with `aria-labelledby` (its id) on the element instead. | `string`                      | `undefined` |
| `mods`              | `mods`               | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                               | `string \| string[]`          | `[]`        |
| `name`              | `name`               | The name of the value in the form data (a toggle without a name submits nothing). A `ds-toggle-group` with a `name` gives it its own.                                                                                                            | `string`                      | `undefined` |
| `required`          | `required`           | The toggle must be checked for its form to be submitted (`valueMissing`, `aria-required` on a checkbox or a switch). A radio of a `ds-toggle-group` makes its group required instead.                                                            | `boolean`                     | `undefined` |
| `requiredMessage`   | `required-message`   | The message of a required toggle left unchecked, instead of the browser's own (`validationMessage`).                                                                                                                                             | `string`                      | `undefined` |
| `type`              | `type`               | `radio`, `checkbox`, `switch` or `icon`. Without it, the toggle uses the type its parent gives with `setType()` (`ds-toggle-group`), else `switch`: its own type always wins.                                                                    | `string`                      | `undefined` |
| `validationMessage` | `validation-message` | The message of an invalid toggle, as the `validationMessage` of a native control (read-only): `required-message`, else the browser's own.                                                                                                        | `string`                      | `undefined` |
| `validity`          | --                   | The validity of the toggle, as the `validity` of a native control (read-only; once the component is loaded).                                                                                                                                     | `ValidityState`               | `undefined` |
| `value`             | `value`              | The value the toggle submits with its form while it is checked: `on` without one (as a native checkbox). Also sent in the `toggle` event.                                                                                                        | `boolean \| number \| string` | `undefined` |
| `willValidate`      | `will-validate`      | Whether the form validates the toggle (read-only), as the browser tells it: not while its `disabled` or a disabled fieldset disables it (a toggle its group disables is valid).                                                                  | `boolean`                     | `undefined` |


## Events

| Event    | Description | Type               |
| -------- | ----------- | ------------------ |
| `toggle` |             | `CustomEvent<any>` |


## Methods

### `checkValidity() => Promise<boolean>`

Whether the toggle is valid; an invalid toggle gets an `invalid` event (as the `checkValidity()` of a native control, but asynchronous).

#### Returns

Type: `Promise<boolean>`



### `reportValidity() => Promise<boolean>`

As `checkValidity()`, and the browser shows the message of an invalid toggle, which takes the focus.

#### Returns

Type: `Promise<boolean>`



### `setChecked(checked: boolean) => Promise<void>`



#### Parameters

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| `checked` | `boolean` |             |

#### Returns

Type: `Promise<void>`



### `setGroupDisabled(isDisabled?: boolean) => Promise<void>`

Disables the toggle while its parent is disabled (`ds-toggle-group` calls it), without changing its own `disabled`:
`true` disables it, `false` or `undefined` gives it its own state back.

#### Parameters

| Name         | Type      | Description |
| ------------ | --------- | ----------- |
| `isDisabled` | `boolean` |             |

#### Returns

Type: `Promise<void>`



### `setName(name: string) => Promise<void>`



#### Parameters

| Name   | Type     | Description |
| ------ | -------- | ----------- |
| `name` | `string` |             |

#### Returns

Type: `Promise<void>`



### `setProps(properties: Record<string, unknown>) => Promise<void>`

Sets the given props (`mods`, `value`, `name`, `type`, `disabled`, `checked`); `undefined` values and other keys are ignored.

#### Parameters

| Name         | Type                        | Description |
| ------------ | --------------------------- | ----------- |
| `properties` | `{ [x: string]: unknown; }` |             |

#### Returns

Type: `Promise<void>`



### `setTabbable(isTabbable?: boolean) => Promise<void>`

Sets whether Tab reaches the toggle, for a parent that moves the focus between its toggles (the arrow keys of a
`ds-toggle-group` of radios): `false` renders `tabindex="-1"`, `true` or `undefined` `tabindex="0"`, the default.

#### Parameters

| Name         | Type      | Description |
| ------------ | --------- | ----------- |
| `isTabbable` | `boolean` |             |

#### Returns

Type: `Promise<void>`



### `setType(type: "radio" | "icon" | "checkbox" | "switch" | string) => Promise<void>`

Sets the type given by a parent (`ds-toggle-group` calls it): the toggle uses it while it has no `type` of
its own. `undefined` removes it.

#### Parameters

| Name   | Type     | Description |
| ------ | -------- | ----------- |
| `type` | `string` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description                                                                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------- |
|      | The content of the toggle: the icon of an `icon` toggle, or a text that names the toggle (it can be visually hidden). |


## Custom States

| State                  | Initial Value | Description                                                                                                                                          |
| ---------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:state(user-invalid)` | `false`       | The toggle is invalid (`required` and not checked) and the user should see it: after an `invalid` event or a change by the user, until a form reset. |


## CSS Custom Properties

| Name                               | Description                                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ds-toggle-checked-color`        | Border and mark color of a checked radio or checkbox.                                                                                           |
| `--ds-toggle-color`                | Border and mark color of a radio or a checkbox.                                                                                                 |
| `--ds-toggle-disabled-color`       | Border and mark color of a disabled radio or checkbox.                                                                                          |
| `--ds-toggle-invalid-color`        | Border color of an invalid radio or checkbox, and ring of an invalid switch or toggle button (`--invalid`, or in an invalid `ds-toggle-group`). |
| `--ds-toggle-knob-checked-color`   | Knob color of a checked switch.                                                                                                                 |
| `--ds-toggle-knob-color`           | Knob color of a switch.                                                                                                                         |
| `--ds-toggle-knob-disabled-color`  | Knob color of a disabled switch.                                                                                                                |
| `--ds-toggle-track-color`          | Track color of a switch.                                                                                                                        |
| `--ds-toggle-track-disabled-color` | Track color of a disabled switch.                                                                                                               |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
