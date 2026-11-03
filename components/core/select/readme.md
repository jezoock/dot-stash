# ds-select

## Styling

- **Classes**: `ds-select` on `<ds-select>`, `--opened` (a click opens it, a focus out closes it), `--disabled` (`disabled`); `mods` → `--<mod>`.
- **Elements**: `__label` (the label of the selected option, `aria-hidden`: the select gives its value) and `__input` (the native `select`; the default slot holds its `option` elements).
- **Attributes** (reflected): `disabled`, `default-value`, `mods`.
- **Structure** (`select.scss`): a block, covered by the native select, which is transparent: a click opens the native list.
- **Look** (default theme, `components/_select.scss`): the box (border, radius, background), the padding of the label, a chevron on the right and a dimmed disabled select, from the custom properties below, set on `ds-select`. The native select is transparent: the box draws its focus indicator (`.ds-select:has(> .ds-select__input:focus-visible)`, with `ds-focus-ring()`).

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-select {
  --ds-select-radius: 0;
  --ds-select-border-color: var(--ds-color-gray-dark);
}
```

## Accessibility

`ds-select` keeps a native `select`, transparent over the box: its role, its keyboard (the browser's: the arrow keys change the value, Alt+Down Arrow or Space opens the list, a character goes to an option…) and its list are the browser's.

- **Name** (required): `label`, the `aria-label` of the select; `labelledby`, the ids of a visible label (`aria-labelledby`); a `<label>` element around the component, which labels the select inside it; or a `<label for>` with the `name`, which is also the id of the select.
- **Value**: the select gives the selected option to assistive technologies; the label of the box is `aria-hidden`, so that it is not read twice. Without a `selected` option, the select selects the first option, the one the box shows.
- **Disabled**: `disabled` disables the native select: it cannot be focused or changed.
- **Focus**: the theme draws the focus indicator around the box, as the select is transparent.

```html
<ds-select name="color" label="Color"
  ><option value="red">Red</option>
  <option value="blue" selected>Blue</option></ds-select
>

<label for="size">Size</label>
<ds-select name="size"
  ><option value="s">S</option>
  <option value="m">M</option></ds-select
>

<label
  >Country
  <ds-select name="country"
    ><option value="fr">France</option>
    <option value="be">Belgium</option></ds-select
  ></label
>
```

**Changed**: `disabled` disables the native select (it could be focused and changed, the component ignored the change); `label` and `labelledby` are new; the label of the box is `aria-hidden`; without a `selected` option, the native select selects the first option, the one the box shows (it selected the last one); the default theme draws the focus indicator around the box. The state that held the label of the selected option is renamed `selectedLabel` (`getValue()` still returns `{ value, label }`).

<!-- Auto Generated Below -->


## Overview

A native `select` (its `option` elements are the children of the component), transparent over a box that shows the
label of the selected option. The native select keeps its role, its keyboard and its list: name it with `label`
(`aria-label`), `labelledby` (`aria-labelledby`), a `<label>` around the component or a `<label for>` with the `name`
(the id of the select).

## Properties

| Property       | Attribute       | Description                                                                                        | Type                 | Default     |
| -------------- | --------------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `defaultValue` | `default-value` |                                                                                                    | `string`             | `undefined` |
| `disabled`     | `disabled`      | Disables the native select: it cannot be focused or changed.                                       | `boolean`            | `undefined` |
| `label`        | `label`         | The accessible name of the select (`aria-label`), without a visible label.                         | `string`             | `undefined` |
| `labelledby`   | `labelledby`    | The ids of the elements that name the select (a visible label): its `aria-labelledby`.             | `string`             | `undefined` |
| `mods`         | `mods`          | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`        |
| `name`         | `name`          | The `name` of the native select, and its `id` (a `<label for>` with it names the select).          | `string`             | `undefined` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `valueChange` |             | `CustomEvent<any>` |


## Methods

### `getValue() => Promise<{ value: string; label: string; }>`



#### Returns

Type: `Promise<{ value: string; label: string; }>`




## Slots

| Slot | Description                                           |
| ---- | ----------------------------------------------------- |
|      | The `option` (and `optgroup`) elements of the select. |


## CSS Custom Properties

| Name                       | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `--ds-select-background`   | Background of the box.                                                |
| `--ds-select-border-color` | Border color of the box.                                              |
| `--ds-select-padding`      | Padding of the label (its right padding leaves room for the chevron). |
| `--ds-select-radius`       | Corner radius of the box.                                             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
