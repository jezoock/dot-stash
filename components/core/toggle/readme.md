# ds-toggle

## Styling

- **Classes**: `ds-toggle` on `<ds-toggle>`, and `--<type>`: `--radio`, `--checkbox`, `--switch` (the default) or `--icon` (its own `type`, else the type of its `ds-toggle-group`); `mods` → `--<mod>`.
- **Attributes** (reflected): `checked` and `disabled` (the states the theme styles), `type`, `name`, `value`, `mods`.
- **Slots**: the default slot, the content of an `icon` toggle (the other types draw themselves: their content is a text that names them, visually hidden).
- **Focus**: the element takes the focus: the outline of the theme (`:focus-visible`, see [Focus indicator](../../../README.md#focus-indicator)) draws around its box.
- **Structure** (`toggle.scss`): an inline box that takes the pointer. A radio or a checkbox is a 2rem square with a 1.5rem mark (`::after`) in its center, shown when `checked`; a switch is a 3.5rem × 2rem track with a 1.5rem knob (`::after`), on the left, on the right when `checked`. The changes are animated (0.4 s), not the focus outline, which shows at once. An `icon` toggle is its content.
- **Look** (default theme, `components/_toggle.scss`): the borders and radii of the radios, checkboxes and switches, and their colors in each state, from the custom properties below, set on `ds-toggle`.

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
- **Disabled**: `aria-disabled="true"` and no `tabindex`: it cannot be focused, and clicks and keys do nothing.
- **Keyboard**:

  | Key    | Switch, toggle button (`icon`) | Checkbox | Radio                                                      |
  | ------ | ------------------------------ | -------- | ---------------------------------------------------------- |
  | Space  | toggles                        | toggles  | checks (a radio is not unchecked)                          |
  | Enter  | toggles                        | nothing  | nothing                                                    |
  | Arrows | —                              | —        | in a `ds-toggle-group` of radios: the previous or next one |

  A key toggles the element as a click does: it dispatches a `click` event, then `toggle` is emitted. Space does not scroll the page; a key held down does not repeat; the keys with Alt, Ctrl or Meta are left to the browser.

- **Name** (required): `aria-labelledby` on the element, with the id of a visible label; else `label`, rendered as `aria-label`; else the text of its content (the roles take their name from it), visually hidden for a radio, a checkbox or a switch, which have no room for it (`.ds-visually-hidden`). The name of a toggle button stays the same in both states: `aria-pressed` tells the state ("Favorite", pressed or not). A `<label>` element does not name it and a click on one does not toggle it: it is not a native form control.

```html
<span id="wifi-label">Wi-Fi</span>
<ds-toggle aria-labelledby="wifi-label" checked></ds-toggle>

<ds-toggle type="checkbox" name="newsletter" value="yes"><span class="ds-visually-hidden">Subscribe to the newsletter</span></ds-toggle>

<ds-toggle type="icon" label="Favorite"><ds-icon type="heart" aria-hidden="true"></ds-icon></ds-toggle>
```

**Changed**: the role, the `aria-checked` / `aria-pressed` and `aria-disabled` states, the focus (`tabindex`), the keyboard, `label` and `setTabbable()` are new; the focus outline is out of the 0.4 s transition of the toggle (it showed animated, from a 3px outline of the text color).

<!-- Auto Generated Below -->


## Overview

A radio, checkbox, switch or icon toggle. A click checks a radio (it cannot be unchecked by a click)
and checks or unchecks the other types; each change emits `toggle` with `{ name, value, checked }`.
The element is the control: it has the role of its type (`switch`, `checkbox`, `radio`, `button` with
`aria-pressed` for an `icon`), its state (`aria-checked`), and takes the focus (`tabindex="0"`); Space
toggles it (checks a radio), Enter too for a switch or an icon. A disabled toggle is `aria-disabled` and
cannot be focused.

## Properties

| Property   | Attribute  | Description                                                                                                                                                                     | Type                          | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------- |
| `checked`  | `checked`  |                                                                                                                                                                                 | `boolean`                     | `undefined` |
| `disabled` | `disabled` | A disabled toggle ignores clicks and keys, and cannot be focused (`aria-disabled="true"`, no `tabindex`).                                                                       | `boolean`                     | `undefined` |
| `label`    | `label`    | The accessible name of the toggle (`aria-label`), for a toggle without a text in it. A visible label elsewhere names it with `aria-labelledby` (its id) on the element instead. | `string`                      | `undefined` |
| `mods`     | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                              | `string \| string[]`          | `[]`        |
| `name`     | `name`     |                                                                                                                                                                                 | `string`                      | `undefined` |
| `type`     | `type`     | `radio`, `checkbox`, `switch` or `icon`. Without it, the toggle uses the type its parent gives with `setType()` (`ds-toggle-group`), else `switch`: its own type always wins.   | `string`                      | `undefined` |
| `value`    | `value`    |                                                                                                                                                                                 | `boolean \| number \| string` | `undefined` |


## Events

| Event    | Description | Type               |
| -------- | ----------- | ------------------ |
| `toggle` |             | `CustomEvent<any>` |


## Methods

### `setChecked(checked: boolean) => Promise<void>`



#### Parameters

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| `checked` | `boolean` |             |

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


## CSS Custom Properties

| Name                               | Description                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `--ds-toggle-checked-color`        | Border and mark color of a checked radio or checkbox.  |
| `--ds-toggle-color`                | Border and mark color of a radio or a checkbox.        |
| `--ds-toggle-disabled-color`       | Border and mark color of a disabled radio or checkbox. |
| `--ds-toggle-knob-checked-color`   | Knob color of a checked switch.                        |
| `--ds-toggle-knob-color`           | Knob color of a switch.                                |
| `--ds-toggle-knob-disabled-color`  | Knob color of a disabled switch.                       |
| `--ds-toggle-track-color`          | Track color of a switch.                               |
| `--ds-toggle-track-disabled-color` | Track color of a disabled switch.                      |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
