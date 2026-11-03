# ds-combo

A custom select. The options are data: an array set in JavaScript, or its JSON string in HTML.

```html
<ds-combo name="color" options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue"}]' selected='{"value": "blue"}'></ds-combo>

<ds-combo name="sizes" custom-label="Sizes" multiple
  options='[{"name": "S", "value": "s", "selected": true}, {"name": "M", "value": "m"}, {"name": "L", "value": "l", "disabled": true}]'></ds-combo>
```

```js
combo.addEventListener('optionSelected', ({ detail }) => {
  // detail.name: the combo's name, detail.option: the clicked option, detail.selectedOptions: all the selected options
});
```

Option fields (`DSOption`):

| Field      | Description                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `name`     | Text of the option; the toggle button shows the selected option's name (single selection).           |
| `value`    | Value. An empty string makes a placeholder that cannot be selected (shown while nothing is selected). |
| `disabled` | Cannot be selected; its link has no `href`.                                                           |
| `selected` | Pre-selected (a single combo keeps the first one).                                                    |
| `url`      | The option renders a link (`<a href>`) instead of a `<span>`.                                         |
| `image`    | Image shown in `image` mode.                                                                          |

`index` is set by the component, in `selectedOptions` and in the event.

`ds-combo` replaces `ds-dropdown` and `ds-dropdown-item`. There are no slotted options: the options are rendered from
the `options` data only.

## Styling

- **Classes**: `<ds-combo>` renders a `div` with the main class, `ds-combo`, its modifiers, and `--open` (while the list is open), `--position-<position>` (`left` by default, `right`, `top`, `bottom`), `--<mode>` (`--dropdown`, `--image`) and `--with-overlay` (`overlay`).
- **Elements**: `__selected-option` (the toggle button, a native `button`, not rendered in `dropdown` mode), a `menu` that holds `__option-list` (a `ul`, `--hidden` while it is closed in `image` mode), `__option` (an `li`, `--selected`, `--disabled`; it holds a `span`, or an `a` with a `url`, after its `img` in `image` mode) and `__overlay` (with `overlay`, while the list is open).
- **Attributes** (reflected): `name`, `mode`, `position`, `mods`.
- **Structure** (`combo.scss`): an inline block. The browser styles of the toggle button are reset (with `:where()`: zero specificity, any skin wins) and its label stays on one line. The list is positioned below the button (above it with `top`), `--ds-combo-list-offset` away (against it with `bottom`), above the page (`z-index: 100`), at least as wide as the button and as its options; in `image` mode, the options are a wrapping row, each name over its image. The overlay covers the page. The `default` modifier puts the list at 3.25rem from the top of the menu.
- **Look** (default theme, `components/_combo.scss`): the toggle button (border, radius, padding, a chevron turned while open), the list (border, radius, shadow, at most half the screen high, then it scrolls) and the options (padding, hover, selected and disabled states), from the custom properties below, set on `ds-combo`.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-combo {
  --ds-combo-selected-background: var(--ds-color-gray-lighter);
  --ds-combo-selected-color: var(--ds-color-gray-darkest);
}

.toolbar ds-combo {
  --ds-combo-border-color: transparent;
  --ds-combo-list-offset: 0;
}
```

<!-- Auto Generated Below -->


## Overview

A custom select: a toggle button opens a list of options, given as an array or a JSON string in `options`.
Single selection (a click selects an option and closes the list) or `multiple` selection (a click toggles
an option and keeps the list open). An option with a `url` renders a link; `mode="image"` shows the options'
images; `mode="dropdown"` renders no toggle button (open the list with `open()` or `toggle()`, e.g. from a
`ds-trigger`). A click outside the component closes the list.

## Properties

| Property          | Attribute      | Description                                                                                                                                                                                                                                                                                                                                                      | Type                                     | Default     |
| ----------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| `customLabel`     | `custom-label` | Fixed text of the toggle button, shown instead of the selected option's name (single) or the `name` (multiple).                                                                                                                                                                                                                                                  | `string`                                 | `''`        |
| `mode`            | `mode`         | `dropdown`: no toggle button, the list is opened with the methods. `image`: each option shows its `image`, and the list stays in the DOM while closed (with a `--hidden` class), so that the images are loaded. Each mode also adds a `--<mode>` class.                                                                                                          | `string`                                 | `''`        |
| `mods`            | `mods`         | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                                                               | `string \| string[]`                     | `[]`        |
| `multiple`        | `multiple`     | Several options can be selected: a click toggles an option and keeps the list open.                                                                                                                                                                                                                                                                              | `boolean`                                | `false`     |
| `name`            | `name`         | Name of the combo: sent in the `optionSelected` event, and shown on the toggle button of a multiple combo without `custom-label`.                                                                                                                                                                                                                                | `string`                                 | `undefined` |
| `options`         | `options`      | The options: an array of `DSOption` (`{ name, value, disabled, selected, image, url }`), or its JSON string: `options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue", "selected": true}]'`.                                                                                                                                                 | `DSOption[] \| string`                   | `[]`        |
| `overlay`         | `overlay`      | Renders a full-page overlay behind the open list: a click on it closes the list.                                                                                                                                                                                                                                                                                 | `boolean`                                | `false`     |
| `position`        | `position`     | Where the list opens: `top` (above), `bottom` (below), `left` (below, towards the left) or `right` (below, towards the right).                                                                                                                                                                                                                                   | `"bottom" \| "left" \| "right" \| "top"` | `'left'`    |
| `selected`        | `selected`     | Pre-selects an option: `{ index }`, `{ value }` or `{ name }`, or its JSON string (`selected='{"value": "blue"}'`). It adds to the options' `selected` flags in a multiple combo, and replaces them in a single combo. Changing `options`, `selected` or `multiple` resets the selection from them (new arrays or objects with the same content change nothing). | `DSComboSelection \| string`             | `undefined` |
| `selectedOptions` | --             | The selected options, in the list order. Set by the component: to change the selection, set `selected` or the options' `selected` flags.                                                                                                                                                                                                                         | `DSOption[]`                             | `[]`        |


## Events

| Event            | Description                                                                                                     | Type                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `optionSelected` | Emitted when the user selects an option (or toggles it, in a multiple combo). See `DSComboSelectedEventDetail`. | `CustomEvent<DSComboSelectedEventDetail>` |


## Methods

### `close() => Promise<void>`

Closes the list.

#### Returns

Type: `Promise<void>`



### `open() => Promise<void>`

Opens the list.

#### Returns

Type: `Promise<void>`



### `toggle(forceDisplay?: boolean) => Promise<void>`

Opens the list if it is closed and closes it if it is open, or opens (`true`) or closes (`false`) it.

#### Parameters

| Name           | Type      | Description |
| -------------- | --------- | ----------- |
| `forceDisplay` | `boolean` |             |

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                             | Description                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `--ds-combo-active-color`        | Border color of the toggle button while the list is open.                              |
| `--ds-combo-background`          | Background of the toggle button and of the list.                                       |
| `--ds-combo-border-color`        | Border color of the toggle button.                                                     |
| `--ds-combo-color`               | Text color of the toggle button and of the options.                                    |
| `--ds-combo-hover-background`    | Background of a hovered option.                                                        |
| `--ds-combo-list-offset`         | Distance between the toggle button and the list (positions `left`, `right` and `top`). |
| `--ds-combo-selected-background` | Background of a selected option.                                                       |
| `--ds-combo-selected-color`      | Text color of a selected option.                                                       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
