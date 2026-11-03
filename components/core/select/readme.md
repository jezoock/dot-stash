# ds-select

## Styling

- **Classes**: `ds-select` on `<ds-select>`, `--opened` (a click opens it, a focus out closes it), `--disabled` (`disabled`); `mods` → `--<mod>`.
- **Elements**: `__label` (the label of the selected option) and `__input` (the native `select`; the default slot holds its `option` elements).
- **Attributes** (reflected): `disabled`, `default-value`, `mods`.
- **Structure** (`select.scss`): a block, covered by the native select, which is transparent: a click opens the native list.
- **Look** (default theme, `components/_select.scss`): the box (border, radius, background), the padding of the label, a chevron on the right and a dimmed disabled select, from the custom properties below, set on `ds-select`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-select {
  --ds-select-radius: 0;
  --ds-select-border-color: var(--ds-color-gray-dark);
}
```

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                                        | Type                 | Default     |
| -------------- | --------------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `defaultValue` | `default-value` |                                                                                                    | `string`             | `undefined` |
| `disabled`     | `disabled`      |                                                                                                    | `boolean`            | `undefined` |
| `mods`         | `mods`          | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`        |
| `name`         | `name`          |                                                                                                    | `string`             | `undefined` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `valueChange` |             | `CustomEvent<any>` |


## Methods

### `getValue() => Promise<{ value: string; label: string; }>`



#### Returns

Type: `Promise<{ value: string; label: string; }>`




## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


## CSS Custom Properties

| Name                       | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `--ds-select-background`   | Background of the box.                                                |
| `--ds-select-border-color` | Border color of the box.                                              |
| `--ds-select-padding`      | Padding of the label (its right padding leaves room for the chevron). |
| `--ds-select-radius`       | Corner radius of the box.                                             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
