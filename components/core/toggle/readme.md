# ds-toggle

## Styling

- **Classes**: `ds-toggle` on `<ds-toggle>`, and `--<type>`: `--radio`, `--checkbox`, `--switch` (the default) or `--icon` (its own `type`, else the type of its `ds-toggle-group`); `mods` → `--<mod>`.
- **Attributes** (reflected): `checked` and `disabled` (the states the theme styles), `type`, `name`, `value`, `mods`.
- **Slots**: the default slot, the content of an `icon` toggle (the other types draw themselves).
- **Structure** (`toggle.scss`): an inline box that takes the pointer. A radio or a checkbox is a 2rem square with a 1.5rem mark (`::after`) in its center, shown when `checked`; a switch is a 3.5rem × 2rem track with a 1.5rem knob (`::after`), on the left, on the right when `checked`. The changes are animated (0.4 s). An `icon` toggle is its content.
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

<!-- Auto Generated Below -->


## Overview

A radio, checkbox, switch or icon toggle. A click checks a radio (it cannot be unchecked by a click)
and checks or unchecks the other types; each change emits `toggle` with `{ name, value, checked }`.

## Properties

| Property   | Attribute  | Description                                                                                                                                                                   | Type                          | Default     |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------- |
| `checked`  | `checked`  |                                                                                                                                                                               | `boolean`                     | `undefined` |
| `disabled` | `disabled` |                                                                                                                                                                               | `boolean`                     | `undefined` |
| `mods`     | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                            | `string \| string[]`          | `[]`        |
| `name`     | `name`     |                                                                                                                                                                               | `string`                      | `undefined` |
| `type`     | `type`     | `radio`, `checkbox`, `switch` or `icon`. Without it, the toggle uses the type its parent gives with `setType()` (`ds-toggle-group`), else `switch`: its own type always wins. | `string`                      | `undefined` |
| `value`    | `value`    |                                                                                                                                                                               | `boolean \| number \| string` | `undefined` |


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

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


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
