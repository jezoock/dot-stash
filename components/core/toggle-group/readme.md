# ds-toggle-group

## Styling

- **Classes**: `ds-toggle-group` on `<ds-toggle-group>`; `mods` → `--<mod>`. The `mods` of the group also replace those of its toggles: the toggles get the same `--<mod>` classes.
- **Attributes** (reflected): `name`, `type` (given to its toggles without a type of their own), `disabled` (it disables its toggles, which get `disabled`: the theme styles them), `mods`.
- **Structure**: none (no stylesheet): an inline wrapper of its `ds-toggle` elements.
- **Look**: none, and no custom property: the `ds-toggle` elements carry the look. Set their `--ds-toggle-*` properties on them (`.filters ds-toggle { … }`, see `ds-toggle`).

## Accessibility

- **Role**: `role="radiogroup"` when all its toggles are radios (their own `type`, or the type of the group) and the selection is single (`count` max 1, the default); otherwise `role="group"`: switches, checkboxes, toggle buttons, or radios with a multiple selection (use checkboxes for that). The role follows the group's props and selection, and the toggles added later.
- **Name** (required): `aria-labelledby` on the element, with the id of a visible label (a heading, a text before the group); else `label`, rendered as `aria-label`. Each toggle needs its own name too (see [`ds-toggle`](../toggle/readme.md#accessibility)).
- **Radio group** ([WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)): Tab reaches one radio, the checked one, else the first enabled one (roving tabindex: the others have `tabindex="-1"`, given with their `setTabbable()`), and Tab goes on out of the group. The keys, on a radio:

  | Key                     | Action                                                                                |
  | ----------------------- | ------------------------------------------------------------------------------------- |
  | Down Arrow, Right Arrow | Moves the focus to the next enabled radio and checks it; from the last one, the first |
  | Up Arrow, Left Arrow    | Moves the focus to the previous enabled radio and checks it; from the first, the last |
  | Home, End               | Moves the focus to the first or the last enabled radio and checks it                  |
  | Space                   | Checks the focused radio                                                              |

  The disabled radios are skipped; the keys with Alt, Ctrl or Meta are left to the browser. A radio checked with the keys emits `toggle`, and the group `toggleValueChange`, as a click does.

- **Other groups**: each toggle is in the Tab order, with its own keys (Space, and Enter for a switch or a toggle button); the arrow keys do nothing.
- **Disabled**: `disabled` disables all the toggles (each gets `disabled`: no focus, no click, no key) and the group gets `aria-disabled="true"`. Enabled again, each toggle gets back the `disabled` it had when the group was disabled.
- **Required**: `count` with a minimum keeps that number of values once they are selected, but does not require a first selection: the group has no `aria-required`. When a choice is required, say it in the label ("Size (required)"), or set `aria-required="true"` on a radio group.

```html
<h3 id="size-title">Size</h3>
<ds-toggle-group type="radio" name="size" aria-labelledby="size-title">
  <ds-toggle value="s" aria-labelledby="size-s"></ds-toggle><span id="size-s">Small</span> <ds-toggle value="m" aria-labelledby="size-m"></ds-toggle><span id="size-m">Medium</span>
  <ds-toggle value="l" aria-labelledby="size-l" disabled></ds-toggle><span id="size-l">Large</span>
</ds-toggle-group>

<ds-toggle-group type="checkbox" count="[0, 3]" label="Toppings">
  <ds-toggle value="cheese" label="Cheese"></ds-toggle>
  <ds-toggle value="ham" label="Ham"></ds-toggle>
</ds-toggle-group>
```

**Changed**: the role, `label`, `aria-disabled`, the roving tabindex and the arrow keys of a radio group are new; `disabled`, which did nothing, now disables the toggles.

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

## Properties

| Property   | Attribute  | Description                                                                                                                                                                                                                                                                                            | Type                 | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------- |
| `count`    | `count`    | `[min, max]` number of selected values (JSON as an attribute: `count="[0, 3]"`). `max` 1 is a single selection: checking a toggle unchecks the others. A click that would leave fewer than `min` values, or select more than `max` (0 for no maximum), is undone. Default `[1, 1]`: exactly one value. | `number[] \| string` | `[1, 1]`    |
| `disabled` | `disabled` | Disables all the toggles of the group (`disabled` on each, `aria-disabled` on the group). Enabled again, the toggles get back the `disabled` they had when the group was disabled.                                                                                                                     | `boolean`            | `undefined` |
| `label`    | `label`    | The accessible name of the group (`aria-label`). A visible label (a heading, a text) names it with `aria-labelledby` (its id) on the element instead.                                                                                                                                                  | `string`             | `undefined` |
| `mods`     | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                     | `string \| string[]` | `[]`        |
| `name`     | `name`     |                                                                                                                                                                                                                                                                                                        | `string`             | `undefined` |
| `type`     | `type`     |                                                                                                                                                                                                                                                                                                        | `string`             | `undefined` |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `toggleValueChange` |             | `CustomEvent<any>` |


## Slots

| Slot | Description                                         |
| ---- | --------------------------------------------------- |
|      | The `ds-toggle` elements, and the text around them. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
