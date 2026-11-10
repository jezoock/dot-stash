# ds-toggle-group

## Styling

- **Classes**: `ds-toggle-group` on `<ds-toggle-group>`; `--disabled` (its own `disabled`, or a disabled `<fieldset>` around it); `--invalid` (required and no toggle checked, shown after an `invalid` event or a change by the user, see [Forms](#forms)); `mods` → `--<mod>`. The `mods` of the group also replace those of its toggles: the toggles get the same `--<mod>` classes.
- **Custom state**: `:state(user-invalid)`, the same as `--invalid`.
- **Attributes** (reflected): `name`, `type` (given to its toggles without a type of their own), `disabled` (it disables its toggles, which get the `--disabled` class: the theme styles them), `required`, `mods`.
- **Structure**: none (no stylesheet): an inline wrapper of its `ds-toggle` elements.
- **Look**: none, and no custom property: the `ds-toggle` elements carry the look. Set their `--ds-toggle-*` properties on them (`.filters ds-toggle { … }`, see `ds-toggle`). The default theme gives the toggles of an invalid group (`--invalid`) the invalid look of `ds-toggle`.

## Accessibility

- **Role**: `role="radiogroup"` when all its toggles are radios (their own `type`, or the type of the group) and the selection is single (`count` max 1, the default); otherwise `role="group"`: switches, checkboxes, toggle buttons, or radios with a multiple selection (use checkboxes for that). The role follows the group's props and selection, and the toggles added later.
- **Name** (required): `aria-labelledby` on the element, with the id of a visible label (a heading, a text before the group); else `label`, rendered as `aria-label`; else a `<label for="<id of the group>">` (a click on it moves the focus to the radio Tab reaches, or to the first enabled toggle, without changing the selection). Each toggle needs its own name too (see [`ds-toggle`](../toggle/readme.md#accessibility)).
- **Radio group** ([WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)): Tab reaches one radio, the checked one, else the first enabled one (roving tabindex: the others have `tabindex="-1"`, given with their `setTabbable()`), and Tab goes on out of the group. The keys, on a radio:

  | Key                     | Action                                                                                |
  | ----------------------- | ------------------------------------------------------------------------------------- |
  | Down Arrow, Right Arrow | Moves the focus to the next enabled radio and checks it; from the last one, the first |
  | Up Arrow, Left Arrow    | Moves the focus to the previous enabled radio and checks it; from the first, the last |
  | Home, End               | Moves the focus to the first or the last enabled radio and checks it                  |
  | Space                   | Checks the focused radio                                                              |

  The disabled radios are skipped; the keys with Alt, Ctrl or Meta are left to the browser. A radio checked with the keys emits `toggle`, and the group `toggleValueChange`, as a click does.

- **Other groups**: each toggle is in the Tab order, with its own keys (Space, and Enter for a switch or a toggle button); the arrow keys do nothing.
- **Disabled**: `disabled`, or a disabled `<fieldset>` around the group, disables all the toggles (each one is `aria-disabled`, has the `--disabled` class and no `tabindex`: no focus, no click, no key; their own `disabled` prop does not change) and the group gets `aria-disabled="true"`. Enabled again, each toggle has its own state back.
- **Required**: `required` (or a radio of the group with `required`) requires a checked toggle (see [Forms](#forms)): a radio group gets `aria-required="true"` (the `group` role has no such property: say it in the label of a group of checkboxes, "Toppings (choose at least one)"). `aria-invalid="true"` once the user should see that nothing is checked: after an `invalid` event, or after the user unchecked the last toggle, until a toggle is checked or the form is reset; `aria-invalid="false"` before that, for a required group without a checked toggle. `count` with a minimum keeps that number of values once they are selected, but is not a validation of the form.

```html
<h3 id="size-title">Size</h3>
<ds-toggle-group type="radio" name="size" aria-labelledby="size-title" required>
  <ds-toggle value="s" aria-labelledby="size-s"></ds-toggle><span id="size-s">Small</span> <ds-toggle value="m" aria-labelledby="size-m"></ds-toggle><span id="size-m">Medium</span>
  <ds-toggle value="l" aria-labelledby="size-l" disabled></ds-toggle><span id="size-l">Large</span>
</ds-toggle-group>

<ds-toggle-group type="checkbox" count="[0, 3]" label="Toppings">
  <ds-toggle value="cheese" label="Cheese"></ds-toggle>
  <ds-toggle value="ham" label="Ham"></ds-toggle>
</ds-toggle-group>
```

## Forms

`ds-toggle-group` is a form-associated custom element, but its toggles submit the values: each `ds-toggle` is a form control of its own (see [`ds-toggle`](../toggle/readme.md#forms)), and the group gives them its `name`, as native radios or checkboxes that share a name. The group submits nothing itself, so that no value is submitted twice.

- **Value**: a group of radios named `size` with `m` checked submits `size=m`; a group of checkboxes named `toppings` with two checked submits `toppings=cheese&toppings=ham`, in the order of the toggles. A toggle without a value submits `on`.
- **Disabled**: a disabled group (its `disabled`, or a disabled `<fieldset>`) disables its toggles, which submit nothing and are not validated.
- **Reset and restore**: each toggle takes back its checked state of the load on a form reset; when the page comes back from the history without its cache, the browser gives the group back its value (its state: the toggles that take their name from the group have no name yet when the browser restores the form), and the group checks its toggles again. The group follows its toggles (its value, its Tab order), without `toggle` nor `toggleValueChange`; it also follows a toggle checked or unchecked by a script.
- **Required**: `required` makes the group invalid while no toggle is checked (`valueMissing`), as a native radio group with a required radio: the form is not submitted, and the browser shows the message at the radio Tab reaches (else the first enabled toggle), which gets the focus. The message is the browser's own, that of a native required radio, or `required-message`.
- **Validity**: `validity`, `validationMessage` and `willValidate` (read-only), `checkValidity()` and `reportValidity()` (asynchronous), the `invalid` event, `:invalid` and `:valid`, as on a native control.

```html
<form action="/order">
  <label for="size">Size</label>
  <ds-toggle-group id="size" name="size" type="radio" required>
    <ds-toggle value="s" label="Small"></ds-toggle>
    <ds-toggle value="m" label="Medium"></ds-toggle>
  </ds-toggle-group>
  <button>Order</button>
</form>
<!-- Not submitted until a size is checked; then size=s or size=m -->
```

**Changed**: the role, `label`, `aria-disabled`, the roving tabindex and the arrow keys of a radio group are new; `disabled`, which did nothing, now disables the toggles. It is form-associated (new `required` and `required-message` props, `validity`, `validationMessage` and `willValidate` properties, `checkValidity()` and `reportValidity()` methods, the `--disabled` and `--invalid` classes). A disabled group no longer sets the `disabled` prop of its toggles: they get the `--disabled` class (`setGroupDisabled()`), and keep their own `disabled`.

<!-- Auto Generated Below -->


## Overview

Groups `ds-toggle` elements and keeps their selected values (emitted with `toggleValueChange`).
The group's `name` and `mods`, when set, replace those of its toggles, and its `type` applies to the toggles
without a type of their own; changes after the load are passed on too, and removing the group's `name` or `mods`
gives the toggles back the ones they had when they joined. Toggles added later join the group (with
MutationObserver, in browsers).
The element is a `radiogroup` when its toggles are radios with a single selection (`count` max 1), else a `group`.
In a radio group, Tab reaches one radio (the checked one, else the first), and the arrow keys, Home and End move the
focus and the selection between the enabled radios.
It is form-associated: each of its toggles submits its own value (under the group's `name`), as native radios or
checkboxes that share a name, and the group submits nothing; it validates the choice (`required`), a `<label>` names
it, and a disabled fieldset disables it with its toggles.

## Properties

| Property            | Attribute            | Description                                                                                                                                                                                                                                                                                            | Type                 | Default     |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------- |
| `count`             | `count`              | `[min, max]` number of selected values (JSON as an attribute: `count="[0, 3]"`). `max` 1 is a single selection: checking a toggle unchecks the others. A click that would leave fewer than `min` values, or select more than `max` (0 for no maximum), is undone. Default `[1, 1]`: exactly one value. | `number[] \| string` | `[1, 1]`    |
| `disabled`          | `disabled`           | Disables the group and all its toggles (`aria-disabled` on the group, and on each toggle, which leaves the toggles' own `disabled` as it is). A disabled `<fieldset>` around it does the same.                                                                                                         | `boolean`            | `undefined` |
| `label`             | `label`              | The accessible name of the group (`aria-label`). A visible label (a heading, a text) names it with `aria-labelledby` (its id) on the element, or a `<label>` element (`<label for="<id of the group>">`) instead.                                                                                      | `string`             | `undefined` |
| `mods`              | `mods`               | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                     | `string \| string[]` | `[]`        |
| `name`              | `name`               | The name of its toggles, which submit their values under it with their form (it replaces their own).                                                                                                                                                                                                   | `string`             | `undefined` |
| `required`          | `required`           | At least one toggle must be checked for the form to be submitted (`valueMissing`; `aria-required` on a radio group). A radio of the group with `required` makes it required too, as a native radio.                                                                                                    | `boolean`            | `undefined` |
| `requiredMessage`   | `required-message`   | The message of a required group without a checked toggle, instead of the browser's own (`validationMessage`).                                                                                                                                                                                          | `string`             | `undefined` |
| `type`              | `type`               | The type of its toggles that have none of their own (`radio`, `checkbox`, `switch`, `icon`).                                                                                                                                                                                                           | `string`             | `undefined` |
| `validationMessage` | `validation-message` | The message of an invalid group, as the `validationMessage` of a native control (read-only): `required-message`, else the browser's own.                                                                                                                                                               | `string`             | `undefined` |
| `validity`          | --                   | The validity of the group, as the `validity` of a native control (read-only; once the component is loaded).                                                                                                                                                                                            | `ValidityState`      | `undefined` |
| `willValidate`      | `will-validate`      | Whether the form validates the group (read-only): not while it is disabled.                                                                                                                                                                                                                            | `boolean`            | `undefined` |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `toggleValueChange` |             | `CustomEvent<any>` |


## Methods

### `checkValidity() => Promise<boolean>`

Whether the group is valid; an invalid group gets an `invalid` event (as the `checkValidity()` of a native control, but asynchronous).

#### Returns

Type: `Promise<boolean>`



### `reportValidity() => Promise<boolean>`

As `checkValidity()`, and the browser shows the message of an invalid group at its first enabled toggle (the checked radio of a radio group), which takes the focus.

#### Returns

Type: `Promise<boolean>`




## Slots

| Slot | Description                                         |
| ---- | --------------------------------------------------- |
|      | The `ds-toggle` elements, and the text around them. |


## Custom States

| State                  | Initial Value | Description                                                                                                                                            |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `:state(user-invalid)` | `false`       | The group is invalid (`required`, no toggle checked) and the user should see it: after an `invalid` event or a change by the user, until a form reset. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
