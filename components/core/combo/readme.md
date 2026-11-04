# ds-combo

A custom select. The options are data: an array set in JavaScript, or its JSON string in HTML.

```html
<ds-combo name="color" options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue"}]' selected='{"value": "blue"}'></ds-combo>

<ds-combo
  name="sizes"
  custom-label="Sizes"
  multiple
  options='[{"name": "S", "value": "s", "selected": true}, {"name": "M", "value": "m"}, {"name": "L", "value": "l", "disabled": true}]'
></ds-combo>
```

```js
combo.addEventListener('optionSelected', ({ detail }) => {
  // detail.name: the combo's name, detail.option: the clicked option, detail.selectedOptions: all the selected options
});
```

Option fields (`DSOption`):

| Field      | Description                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `name`     | Text of the option; the toggle button shows the selected option's name (single selection).            |
| `value`    | Value. An empty string makes a placeholder that cannot be selected (shown while nothing is selected). |
| `disabled` | Cannot be selected; its link has no `href`.                                                           |
| `selected` | Pre-selected (a single combo keeps the first one).                                                    |
| `url`      | The option renders a link (`<a href>`) instead of a `<span>`.                                         |
| `image`    | Image shown in `image` mode.                                                                          |

`index` is set by the component, in `selectedOptions` and in the event.

`ds-combo` replaces `ds-dropdown` and `ds-dropdown-item`. There are no slotted options: the options are rendered from
the `options` data only.

## Styling

- **Classes**: `<ds-combo>` renders a `div` with the main class, `ds-combo`, its modifiers, and `--open` (while the list is open), `--position-<position>` (`left` by default, `right`, `top`, `bottom`), `--<mode>` (`--dropdown`, `--image`), `--with-overlay` (`overlay`), `--disabled` (its own `disabled`, or a disabled `<fieldset>` around it) and `--invalid` (required and no option selected, shown after an `invalid` event or a change by the user, see [Forms](#forms)).
- **Custom state**: `:state(user-invalid)` on `<ds-combo>`, the same as `--invalid`.
- **Elements**: `__selected-option` (the toggle button, a native `button` with `role="combobox"`, not rendered in `dropdown` mode), `__menu` (a `div` that holds the list), `__option-list` (a `ul`, the listbox, `--hidden` while it is closed in `image` mode), `__option` (an `li`, `--selected`, `--disabled`, `--active` for the option the keys move while the list is open; it holds a `span`, or an `a` with a `url`, after its `img` in `image` mode) and `__overlay` (with `overlay`, while the list is open).
- **Attributes** (reflected): `name`, `mode`, `position`, `disabled`, `required`, `mods`.
- **Structure** (`combo.scss`): an inline block. The browser styles of the toggle button are reset (with `:where()`: zero specificity, any skin wins) and its label stays on one line. The list is positioned below the button (above it with `top`), `--ds-combo-list-offset` away (against it with `bottom`), above the page (`z-index: 100`), at least as wide as the button and as its options; in `image` mode, the options are a wrapping row, each name over its image. The overlay covers the page. The `default` modifier puts the list at 3.25rem from the top of `__menu`.
- **Look** (default theme, `components/_combo.scss`): the toggle button (border, radius, padding, a chevron turned while open), the list (border, radius, shadow, at most half the screen high, then it scrolls) and the options (padding, hover, selected and disabled states, and the focus indicator inside the active option: `ds-focus-ring()`, its offset the negative focus width, as the list cuts what overflows it), and a dimmed toggle button while the combo is disabled (`--disabled`), from the custom properties below, set on `ds-combo`. The toggle button has the focus indicator of the base styles (`:focus-visible`).

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

## Accessibility

The combo follows the WAI-ARIA [select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/): the focus stays on the toggle button, which points to the active option of the list.

- **Roles and attributes**: the toggle button is a native `button` with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (the id of the list, while it is in the DOM: open, or in `image` mode) and, while the list is open, `aria-activedescendant` (the id of the active option). Its text is the value: the name of the selected option (single, or `custom-label`), the `name` and the count (multiple). The list is a `ul` with `role="listbox"` (`aria-multiselectable="true"` with `multiple`), the id `<id of the root>-listbox` and `tabindex="-1"` (out of the Tab order: a list that scrolls is a Tab stop in some browsers). The options are `li` elements with `role="option"`, the id `<id of the root>-option-<index>`, `aria-selected="true"` or `"false"`, and `aria-disabled="true"` when they cannot be chosen: disabled, or a placeholder (an empty `value`) without a link.
- **Name** (required), on the combobox and on the listbox: `labelledby`, the ids of a visible label (`aria-labelledby`); else `label` (`aria-label`); else its `<label>` elements: `<label for="<id of the combo>">` (`aria-labelledby` with their ids: a label without an id gets one, `<id of the root>-label-<n>`), or a `<label>` around the combo (`aria-label`, the text of the label without the text of the combo, its value); else `custom-label`; else `name`. A click on a label gives the focus to the combobox, as to a native select. The labels are read when the combo renders: a label added later names it from its next render.
- **Disabled**: `disabled`, or a disabled `<fieldset>` around the combo: the toggle button is disabled (no focus, no click), an open list closes, `open()` and `toggle()` do nothing.
- **Required**: `aria-required="true"` on the combobox. `aria-invalid="true"` on the combobox once the user should see that no option is selected: after an `invalid` event (a submission, `checkValidity()` or `reportValidity()` of the combo or of its form) or after the user deselected the last option, until an option is selected or the form is reset; `aria-invalid="false"` before that, for a required combo without a selected option (the browser would otherwise announce it as invalid from the start).
- **Keyboard**, on the combobox (on the listbox in `dropdown` mode). Closed:

  | Key                                                 | Action                                                                                             |
  | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
  | Down Arrow, Up Arrow, Enter, Space (Alt+Down Arrow) | Opens the list; the active option is the selected one (the first selected one), else the first one |
  | Home, End                                           | Opens the list on the first or the last option                                                     |
  | A character                                         | Opens the list on the next option whose name starts with it (type-ahead, below)                    |

  Open (the keys move over the options that can be chosen, and skip the others; the active option is scrolled into the list's view):

  | Key                  | Action                                                                                                                                                                                                                                                |
  | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Down Arrow, Up Arrow | Moves the active option to the next or the previous one; stops at the ends                                                                                                                                                                            |
  | Home, End            | Moves it to the first or the last one                                                                                                                                                                                                                 |
  | Page Down, Page Up   | Moves it 10 options down or up (`COMBO_PAGE_SIZE`), stopping at the ends                                                                                                                                                                              |
  | Characters           | Type-ahead: the characters typed less than 500 ms apart (`COMBO_TYPE_AHEAD_DELAY`, `combo.constants.ts`) move it to the next option whose name starts with them, case aside; the same character typed again goes round the options that start with it |
  | Enter, Space         | Single: selects the active option and closes the list, the focus on the combobox. Multiple: toggles it, the list stays open. A link option: its link is clicked, as with the pointer (the option is selected, the link followed)                      |
  | Alt+Up Arrow         | Single: selects the active option and closes the list. Multiple: closes it                                                                                                                                                                            |
  | Escape               | Closes the list without changing the selection; the key press goes no further (a modal or a sidebar around the combo stays open)                                                                                                                      |
  | Tab, Shift+Tab       | Closes the list, and the focus moves on. A single combo selects the active option first, as the pattern does (the value follows the keys); not a link option, which would not be followed                                                             |

  A key held down does not repeat Enter and Space; the keys with Ctrl or Meta are left to the browser. Each selection emits `optionSelected`, as a click does.

- **Pointer**: a click on the combobox opens or closes the list; a click on an option selects it (single: the list closes, the focus goes back to the combobox) or toggles it (multiple: it becomes the active option); a mouse down in the list does not move the focus; a click outside the component, or on the overlay, closes the list.
- **Links** (`url`): the option keeps a real link (`<a href>`, out of the Tab order with `tabindex="-1"`), for the pointer (a middle click opens a tab). With the keyboard, Enter or Space on the option clicks its link: the option is selected (when it has a value) and the link followed. A disabled link option has no `href` and is skipped.
- **Images** (`mode="image"`): the images are decorative (`alt=""`): the name of an option is its `name`, give each option one.
- **`dropdown` mode**: there is no combobox. `open()` (and `toggle()`) moves the focus to the listbox, which takes the keys of the open list above and points to the active option (`aria-activedescendant`), named as the combobox is. A selection (single), Escape and Tab close the list and give the focus back to the element that had it before `open()`, the button that opened it (Tab then goes on from it); `close()` too, when the focus is in the list. Give that button a name that says what it opens and `aria-haspopup="listbox"`.

```html
<span id="color-label">Color</span>
<ds-combo name="color" labelledby="color-label" options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue"}]'></ds-combo>

<ds-combo name="sizes" label="Sizes" custom-label="Sizes" multiple options='[{"name": "S", "value": "s"}, {"name": "M", "value": "m"}]'></ds-combo>

<ds-trigger target="#menu" action="toggle" aria-haspopup="listbox">Menu</ds-trigger>
<ds-combo id="menu" mode="dropdown" label="Menu" options='[{"name": "Docs", "value": "docs", "url": "/docs"}]'></ds-combo>
```

## Forms

`ds-combo` is a form-associated custom element: in a `<form>`, it behaves as a native select.

- **Value**: a single combo submits `<name>=<value of the selected option>`; a multiple combo submits one entry per selected option, `<name>=<value>`, in the order of the options; without a selected option (a placeholder, an empty `value`, is not one), without a `name`, or disabled, it submits nothing. Unlike a native select, a single combo without a selected option has no value: pre-select an option (`selected`, or the `selected` flag of an option) for a value by default.
- **Disabled**: `disabled`, or a disabled `<fieldset>` around it: it submits nothing and is not validated.
- **Reset**: a form reset gives it back its selection of the load, from `options` and `selected` (as the `defaultSelected` of native options), without an `optionSelected` event.
- **Restore**: the browser gives back its selected values when the page comes back from the history without its cache (`formStateRestoreCallback`), without an `optionSelected` event.
- **Required**: `required` makes it invalid without a selected option (`valueMissing`): the form is not submitted, and the browser shows its message at the combobox, which gets the focus. The message is the browser's own, that of a native required select, or `required-message`.
- **Validity**: `validity`, `validationMessage` and `willValidate` (read-only), `checkValidity()` and `reportValidity()` (asynchronous), the `invalid` event, `:invalid` and `:valid`, as on a native control.
- **Attributes**: as on a native control, a boolean attribute is true when it is present: `multiple="false"` is multiple.

```html
<form action="/search">
  <label for="color">Color</label>
  <ds-combo id="color" name="color" required options='[{"name": "Choose a color", "value": ""}, {"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue"}]'></ds-combo>
  <ds-combo name="sizes" label="Sizes" multiple options='[{"name": "S", "value": "s", "selected": true}, {"name": "M", "value": "m", "selected": true}]'></ds-combo>
  <button>Search</button>
</form>
<!-- Not submitted until a color is selected; then color=red&sizes=s&sizes=m -->
```

**Changed**: the list hangs from a `div` with the `__menu` class, not from a `menu` element (a `menu` holding a `ul` is not valid HTML): a stylesheet that targets `.ds-combo > menu` targets `.ds-combo__menu` now. The roles, ids and ARIA states, the keyboard, the active option (`--active`), the focus of the `dropdown` mode, `label` and `labelledby` are new; the list and the links of the options have `tabindex="-1"`; a click on an option of a single combo gives the focus back to the combobox. It is form-associated (new `disabled`, `required` and `required-message` props, `validity`, `validationMessage` and `willValidate` properties, `checkValidity()` and `reportValidity()` methods, the `--disabled` and `--invalid` classes), and its `<label>` elements name it.

<!-- Auto Generated Below -->


## Overview

A custom select: a toggle button opens a list of options, given as an array or a JSON string in `options`.
Single selection (a click selects an option and closes the list) or `multiple` selection (a click toggles
an option and keeps the list open). An option with a `url` renders a link; `mode="image"` shows the options'
images; `mode="dropdown"` renders no toggle button (open the list with `open()` or `toggle()`, e.g. from a
`ds-trigger`). A click outside the component closes the list.
It follows the WAI-ARIA select-only combobox pattern: the toggle button is a `combobox` that keeps the focus and
points to the active option (`aria-activedescendant`) of the `listbox`; the arrow keys, Home, End, Page Up, Page
Down and the typed characters move the active option, Enter and Space select it, Escape closes the list. In
`dropdown` mode, `open()` moves the focus to the list, and closing it gives the focus back.
It is form-associated, as a native select: it submits the value of its selected option (of each one, in a multiple
combo) under its `name`; a `<label>` names it and a click on the label focuses it; a disabled fieldset disables it; a
form reset gives it back its selection of the load; `required` makes it invalid without a selected option.

## Properties

| Property            | Attribute            | Description                                                                                                                                                                                                                                                                                                                                                      | Type                                     | Default     |
| ------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| `customLabel`       | `custom-label`       | Fixed text of the toggle button, shown instead of the selected option's name (single) or the `name` (multiple).                                                                                                                                                                                                                                                  | `string`                                 | `''`        |
| `disabled`          | `disabled`           | Disables the combo: its button cannot be focused nor opened, an open list closes, and it submits nothing. A disabled `<fieldset>` around it disables it too, without changing this prop.                                                                                                                                                                         | `boolean`                                | `undefined` |
| `label`             | `label`              | The accessible name of the combo, what it chooses ("Color"): the `aria-label` of the combobox and of the list. Without it (and without `labelledby`), the combo is named by `custom-label`, else by `name`.                                                                                                                                                      | `string`                                 | `undefined` |
| `labelledby`        | `labelledby`         | The ids of the elements that name the combo (a visible label): the `aria-labelledby` of the combobox and of the list.                                                                                                                                                                                                                                            | `string`                                 | `undefined` |
| `mode`              | `mode`               | `dropdown`: no toggle button, the list is opened with the methods. `image`: each option shows its `image`, and the list stays in the DOM while closed (with a `--hidden` class), so that the images are loaded. Each mode also adds a `--<mode>` class.                                                                                                          | `string`                                 | `''`        |
| `mods`              | `mods`               | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                                                               | `string \| string[]`                     | `[]`        |
| `multiple`          | `multiple`           | Several options can be selected: a click toggles an option and keeps the list open.                                                                                                                                                                                                                                                                              | `boolean`                                | `false`     |
| `name`              | `name`               | Name of the combo: the name of its value in the form data (a combo without a name submits nothing), sent in the `optionSelected` event, and shown on the toggle button of a multiple combo without `custom-label`.                                                                                                                                               | `string`                                 | `undefined` |
| `options`           | `options`            | The options: an array of `DSOption` (`{ name, value, disabled, selected, image, url }`), or its JSON string: `options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue", "selected": true}]'`.                                                                                                                                                 | `DSOption[] \| string`                   | `[]`        |
| `overlay`           | `overlay`            | Renders a full-page overlay behind the open list: a click on it closes the list.                                                                                                                                                                                                                                                                                 | `boolean`                                | `false`     |
| `position`          | `position`           | Where the list opens: `top` (above), `bottom` (below), `left` (below, towards the left) or `right` (below, towards the right).                                                                                                                                                                                                                                   | `"bottom" \| "left" \| "right" \| "top"` | `'left'`    |
| `required`          | `required`           | An option must be selected for the form to be submitted (`valueMissing`, `aria-required` on the combobox).                                                                                                                                                                                                                                                       | `boolean`                                | `undefined` |
| `requiredMessage`   | `required-message`   | The message of a required combo without a selected option, instead of the browser's own (`validationMessage`).                                                                                                                                                                                                                                                   | `string`                                 | `undefined` |
| `selected`          | `selected`           | Pre-selects an option: `{ index }`, `{ value }` or `{ name }`, or its JSON string (`selected='{"value": "blue"}'`). It adds to the options' `selected` flags in a multiple combo, and replaces them in a single combo. Changing `options`, `selected` or `multiple` resets the selection from them (new arrays or objects with the same content change nothing). | `DSComboSelection \| string`             | `undefined` |
| `selectedOptions`   | --                   | The selected options, in the list order. Set by the component: to change the selection, set `selected` or the options' `selected` flags.                                                                                                                                                                                                                         | `DSOption[]`                             | `[]`        |
| `validationMessage` | `validation-message` | The message of an invalid combo, as the `validationMessage` of a native select (read-only): `required-message`, else the browser's own.                                                                                                                                                                                                                          | `string`                                 | `undefined` |
| `validity`          | --                   | The validity of the combo, as the `validity` of a native select (read-only; once the component is loaded).                                                                                                                                                                                                                                                       | `ValidityState`                          | `undefined` |
| `willValidate`      | `will-validate`      | Whether the form validates the combo (read-only): not while it is disabled.                                                                                                                                                                                                                                                                                      | `boolean`                                | `undefined` |


## Events

| Event            | Description                                                                                                     | Type                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `optionSelected` | Emitted when the user selects an option (or toggles it, in a multiple combo). See `DSComboSelectedEventDetail`. | `CustomEvent<DSComboSelectedEventDetail>` |


## Methods

### `checkValidity() => Promise<boolean>`

Whether the combo is valid; an invalid combo gets an `invalid` event (as the `checkValidity()` of a native select, but asynchronous).

#### Returns

Type: `Promise<boolean>`



### `close() => Promise<void>`

Closes the list. When the focus is in the list (`dropdown` mode), it goes back to the element that had it before.

#### Returns

Type: `Promise<void>`



### `open() => Promise<void>`

Opens the list (not while the combo is disabled). In `dropdown` mode, it moves the focus to the list.

#### Returns

Type: `Promise<void>`



### `reportValidity() => Promise<boolean>`

As `checkValidity()`, and the browser shows the message of an invalid combo at its combobox, which takes the focus.

#### Returns

Type: `Promise<boolean>`



### `toggle(forceDisplay?: boolean) => Promise<void>`

Opens the list if it is closed and closes it if it is open, or opens (`true`) or closes (`false`) it.

#### Parameters

| Name           | Type      | Description |
| -------------- | --------- | ----------- |
| `forceDisplay` | `boolean` |             |

#### Returns

Type: `Promise<void>`




## Custom States

| State                  | Initial Value | Description                                                                                                                                             |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:state(user-invalid)` | `false`       | The combo is invalid (`required`, no option selected) and the user should see it: after an `invalid` event or a change by the user, until a form reset. |


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
