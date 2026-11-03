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

- **Classes**: `<ds-combo>` renders a `div` with the main class, `ds-combo`, its modifiers, and `--open` (while the list is open), `--position-<position>` (`left` by default, `right`, `top`, `bottom`), `--<mode>` (`--dropdown`, `--image`) and `--with-overlay` (`overlay`).
- **Elements**: `__selected-option` (the toggle button, a native `button` with `role="combobox"`, not rendered in `dropdown` mode), `__menu` (a `div` that holds the list), `__option-list` (a `ul`, the listbox, `--hidden` while it is closed in `image` mode), `__option` (an `li`, `--selected`, `--disabled`, `--active` for the option the keys move while the list is open; it holds a `span`, or an `a` with a `url`, after its `img` in `image` mode) and `__overlay` (with `overlay`, while the list is open).
- **Attributes** (reflected): `name`, `mode`, `position`, `mods`.
- **Structure** (`combo.scss`): an inline block. The browser styles of the toggle button are reset (with `:where()`: zero specificity, any skin wins) and its label stays on one line. The list is positioned below the button (above it with `top`), `--ds-combo-list-offset` away (against it with `bottom`), above the page (`z-index: 100`), at least as wide as the button and as its options; in `image` mode, the options are a wrapping row, each name over its image. The overlay covers the page. The `default` modifier puts the list at 3.25rem from the top of `__menu`.
- **Look** (default theme, `components/_combo.scss`): the toggle button (border, radius, padding, a chevron turned while open), the list (border, radius, shadow, at most half the screen high, then it scrolls) and the options (padding, hover, selected and disabled states, and the focus indicator inside the active option: `ds-focus-ring()`, its offset the negative focus width, as the list cuts what overflows it), from the custom properties below, set on `ds-combo`. The toggle button has the focus indicator of the base styles (`:focus-visible`).

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
- **Name** (required), on the combobox and on the listbox: `labelledby`, the ids of a visible label (`aria-labelledby`); else `label` (`aria-label`); else `custom-label`; else `name`. A `<label>` element does not name it (the toggle button is not a form control of the label).
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

**Changed**: the list hangs from a `div` with the `__menu` class, not from a `menu` element (a `menu` holding a `ul` is not valid HTML): a stylesheet that targets `.ds-combo > menu` targets `.ds-combo__menu` now. The roles, ids and ARIA states, the keyboard, the active option (`--active`), the focus of the `dropdown` mode, `label` and `labelledby` are new; the list and the links of the options have `tabindex="-1"`; a click on an option of a single combo gives the focus back to the combobox.

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

## Properties

| Property          | Attribute      | Description                                                                                                                                                                                                                                                                                                                                                      | Type                                     | Default     |
| ----------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| `customLabel`     | `custom-label` | Fixed text of the toggle button, shown instead of the selected option's name (single) or the `name` (multiple).                                                                                                                                                                                                                                                  | `string`                                 | `''`        |
| `label`           | `label`        | The accessible name of the combo, what it chooses ("Color"): the `aria-label` of the combobox and of the list. Without it (and without `labelledby`), the combo is named by `custom-label`, else by `name`.                                                                                                                                                      | `string`                                 | `undefined` |
| `labelledby`      | `labelledby`   | The ids of the elements that name the combo (a visible label): the `aria-labelledby` of the combobox and of the list.                                                                                                                                                                                                                                            | `string`                                 | `undefined` |
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

Closes the list. When the focus is in the list (`dropdown` mode), it goes back to the element that had it before.

#### Returns

Type: `Promise<void>`



### `open() => Promise<void>`

Opens the list. In `dropdown` mode, it moves the focus to the list.

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
