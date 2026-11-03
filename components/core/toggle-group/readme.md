# ds-toggle-group

## Styling

- **Classes**: `ds-toggle-group` on `<ds-toggle-group>`; `mods` → `--<mod>`. The `mods` of the group also replace those of its toggles: the toggles get the same `--<mod>` classes.
- **Attributes** (reflected): `name`, `type` (given to its toggles without a type of their own), `disabled`, `mods`.
- **Structure**: none (no stylesheet): an inline wrapper of its `ds-toggle` elements.
- **Look**: none, and no custom property: the `ds-toggle` elements carry the look. Set their `--ds-toggle-*` properties on them (`.filters ds-toggle { … }`, see `ds-toggle`).

<!-- Auto Generated Below -->


## Overview

Groups `ds-toggle` elements and keeps their selected values (emitted with `toggleValueChange`).
The group's `name` and `mods`, when set, replace those of its toggles, and its `type` applies to the toggles
without a type of their own; changes after the load are passed on too, and removing the group's `name` or `mods`
gives the toggles back the ones they had when they joined. Toggles added later join the group (with
MutationObserver, in browsers).

## Properties

| Property   | Attribute  | Description                                                                                                                                                                                                                                                                                            | Type                 | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------- |
| `count`    | `count`    | `[min, max]` number of selected values (JSON as an attribute: `count="[0, 3]"`). `max` 1 is a single selection: checking a toggle unchecks the others. A click that would leave fewer than `min` values, or select more than `max` (0 for no maximum), is undone. Default `[1, 1]`: exactly one value. | `number[] \| string` | `[1, 1]`    |
| `disabled` | `disabled` |                                                                                                                                                                                                                                                                                                        | `boolean`            | `undefined` |
| `mods`     | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                     | `string \| string[]` | `[]`        |
| `name`     | `name`     |                                                                                                                                                                                                                                                                                                        | `string`             | `undefined` |
| `type`     | `type`     |                                                                                                                                                                                                                                                                                                        | `string`             | `undefined` |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `toggleValueChange` |             | `CustomEvent<any>` |


## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
