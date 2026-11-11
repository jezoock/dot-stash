# ds-sortable

A list the user puts in order, with the keyboard (and buttons, for the pointer and the touch): the order of services, of the sections of a menu, of sources. Each move is told to screen readers, and each new order emits `orderChange` with the keys of the items.

```html
<ds-sortable label="Order of the services" buttons>
  <div data-key="netflix">Netflix</div>
  <div data-key="plex">Plex</div>
  <div data-key="arte">Arte</div>
</ds-sortable>
```

```js
document.querySelector('ds-sortable').addEventListener('orderChange', event => {
  saveOrder(event.detail.keys); // ['plex', 'netflix', 'arte']
});
```

## The items

The items are the direct children of the list, written by the page, each with a `data-key` (its key in `orderChange`; an item without one gets a console warning) and, optionally, a `data-label` (its label in the texts and its name; else its text). The list moves them in the page: their order in the DOM is the order shown, read and submitted. It never moves the item that has the focus (it moves the others around it), so that the focus stays on it. Items added or removed by the page are followed, and those that leave the list are given back as they were (their attributes, no class, no buttons).

## Keyboard

| Key                                                                         | Item not picked up       | Item picked up                                                   |
| --------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| Space, Enter                                                                | picks it up              | drops it where it is (`orderChange` if it moved)                 |
| Up Arrow, Down Arrow (`horizontal`: Left Arrow, Right Arrow, reversed from right to left) | (the page's)             | moves it one place back, one place forward (not past the ends)   |
| Home, End                                                                   | (the page's)             | moves it first, last                                             |
| Escape                                                                      | (the page's)             | puts it back where it was picked up; the key goes no further     |
| Tab, a click elsewhere                                                      | (the page's)             | drops it where it is, and the focus goes on                      |

The keys are those of the item itself: an element in an item (a link, a button, a field) keeps its own keys. A click on the item without a pointer (`element.click()`, which the button A of a game pad does on the focused element) picks it up and drops it, as Space; a click of a mouse or a touch does not.

With `buttons`, each item gets two native buttons at its end (`__actions`), that move it one place back or forward ("Move Plex before Netflix", "Move Plex after Arte"): the way for the pointer and the touch. A button at an end of the list is disabled; the one that had the focus gives it to the other one. The list has no drag and drop of its own.

## Styling

- **Classes**: `ds-sortable` on `<ds-sortable>`; `--vertical` or `--horizontal` (`orientation`), `--buttons` (`buttons`), `--sorting` (an item is picked up); `mods` → `--<mod>`. On the items: `ds-sortable__item`, and `--grabbed` on the item picked up.
- **Elements**: the items (`__item`, the page's elements); `__actions` (at the end of each item, `buttons`) with its two `__move` buttons, `--before` and `--after`; `__instructions` (hidden: the description of the items) and `__status` (the live region, visually hidden), at the end of the list.
- **Attributes** (reflected): `orientation`, `buttons`, `mods`; `role="list"`, `aria-label`. On the items: `role="listitem"`, `tabindex="0"`, `aria-describedby`, `aria-label` (see [Accessibility](#accessibility)).
- **Structure** (`sortable.scss`): a column of the items (a row that wraps, `--horizontal`), `--ds-sortable-gap` apart; with `buttons`, each item is a flex row, its buttons (`--ds-sortable-button-size`) at its end.
- **Look** (default theme, `components/_sortable.scss`): each item a box with a light border, a radius and a padding; the item picked up in the light primary color, with a primary border, a shadow and a dashed outline (the focus outline, dashed: it shows in forced colors too, where the shadow and the colors do not); the buttons round, with a chevron (up and down; left and right, `--horizontal`, mirrored from right to left), dimmed when disabled.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-sortable {
  --ds-sortable-gap: 0;
  --ds-sortable-item-radius: 0;
}

.dark ds-sortable {
  --ds-sortable-item-background: var(--ds-color-gray-darker);
  --ds-sortable-grabbed-background: var(--ds-color-primary-darker);
}
```

## Accessibility

- **Roles**: the list is a `list` (named by `label`: what the items are, "Order of the services"), each item a `listitem` (a `role` of the page on an item is kept). Each item is in the Tab order (`tabindex="0"`, unless the page gave it one), and named by its `data-label`, else its text without its buttons (`aria-label`: a list item is not named by its content in the accessibility tree; an `aria-label` or `aria-labelledby` of the page is kept). Its description (`aria-describedby`, after those of the page) is the instructions of the keyboard (`labels.instructions`).
- **Live region**: a polite one (`aria-live="polite"`, `aria-atomic="true"`, no role: a list owns only its items), visually hidden, tells each step: picked up, moved, dropped, put back (`labels`: "Netflix moved to position 2 of 3."). The same text twice in a row is told twice.
- **Focus**: never moved by the list: the item moved keeps it (the others move around it). From a move button that becomes disabled, to the other one.
- **The picked up item** is shown by more than its color: a shadow and a dashed outline.
- **Pattern**: WAI-ARIA has no pattern for a list sorted with the keyboard; the list follows the common practice of the accessible drag and drop libraries (pick up, move, drop, cancel, each step told), with buttons as the alternative to a dragging movement (WCAG 2.5.7).

## Texts

`labels` (JSON as an attribute) translates the texts of the list. In the templates, `{label}` is the label of the item, `{index}` its position (from 1), `{count}` the number of items, `{other}` the item it would be moved before or after.

| Key            | Default                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `instructions` | `To move this item, press Space or Enter, then the arrow keys; press Space or Enter again to drop it, or Escape to cancel.` |
| `grabbed`      | `{label} picked up, position {index} of {count}.`                                                                         |
| `moved`        | `{label} moved to position {index} of {count}.`                                                                           |
| `dropped`      | `{label} dropped at position {index} of {count}.`                                                                         |
| `cancelled`    | `{label} back to position {index} of {count}.`                                                                            |
| `moveBefore`   | `Move {label} before {other}` (the name of the `--before` button)                                                         |
| `moveAfter`    | `Move {label} after {other}` (the name of the `--after` button)                                                           |

```html
<ds-sortable
  label="Ordre des services"
  buttons
  labels='{"instructions": "Pour déplacer cet élément, appuyez sur Espace ou Entrée, puis sur les flèches ; Espace ou Entrée pour le déposer, Échap pour annuler.", "grabbed": "{label} saisi, position {index} sur {count}.", "moved": "{label} déplacé en position {index} sur {count}.", "dropped": "{label} déposé en position {index} sur {count}.", "cancelled": "{label} remis en position {index} sur {count}.", "moveBefore": "Placer {label} avant {other}", "moveAfter": "Placer {label} après {other}"}'
>
  …
</ds-sortable>
```

## Examples

```html
<!-- The sections of a menu, in a row -->
<ds-sortable label="Sections of the menu" orientation="horizontal">
  <span data-key="home">Home</span>
  <span data-key="movies">Movies</span>
  <span data-key="music">Music</span>
</ds-sortable>
```

## Limits

- No drag and drop with a pointer: the buttons (`buttons`) move the items with a pointer or a touch.
- The items are the direct children of the list: a nested list is a list of its own.
- The order is that of the DOM: the page that renders the items again from its data gives them in the order of `orderChange`.

**New**: `ds-sortable` is new.

<!-- Auto Generated Below -->


## Overview

A list the user puts in order: each child of the list is an item, identified by its `data-key`. With the keyboard, an
item that has the focus is picked up with Space or Enter, moved with the arrow keys (Up and Down; Left and Right,
`horizontal`, reversed from right to left), Home and End, dropped with Space or Enter, or put back with Escape (Tab, or
a click elsewhere, drops it). With `buttons`, each item also gets two buttons that move it one place back or forward,
for the pointer and the touch. Each move is told by a polite live region (`labels`: "Netflix moved to position 2 of
5"), and each order the user commits (a drop, a button) emits `orderChange`, with the keys in their new order.

The list is a WAI-ARIA `list` (named by `label`) of `listitem` elements, each in the Tab order and described by the
instructions of the keyboard. The list moves the items in the page (their order in the DOM is the order shown and
read), never the one that has the focus: the focus stays on it.

## Properties

| Property      | Attribute     | Description                                                                                                                                      | Type                         | Default      |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ------------ |
| `buttons`     | `buttons`     | Gives each item two buttons that move it one place back or forward (named by `labels`).                                                          | `boolean`                    | `false`      |
| `label`       | `label`       | The name of the list (`aria-label`): what the items are ("Order of the services").                                                               | `string`                     | `undefined`  |
| `labels`      | `labels`      | The texts of the list (JSON as an attribute), to translate them: the instructions, the announcements, the names of the buttons (see the readme). | `DSSortableLabels \| string` | `{}`         |
| `mods`        | `mods`        | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                               | `string \| string[]`         | `[]`         |
| `orientation` | `orientation` | The direction of the list, and of the arrow keys that move an item: `vertical` (Up and Down, by default) or `horizontal` (Left and Right).       | `"horizontal" \| "vertical"` | `'vertical'` |


## Events

| Event         | Description                                                                                                           | Type                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `orderChange` | The user committed a new order (an item dropped where it was not, or moved by a button): the keys in their new order. | `CustomEvent<DSSortableOrderChangeDetail>` |


## Slots

| Slot | Description                                                                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------- |
|      | The items: the direct children of the list, each with a `data-key` (and a `data-label` for the texts, else its text). |


## CSS Custom Properties

| Name                                 | Description                                             |
| ------------------------------------ | ------------------------------------------------------- |
| `--ds-sortable-button-size`          | Width and height of the buttons of an item (`buttons`). |
| `--ds-sortable-gap`                  | Space between the items.                                |
| `--ds-sortable-grabbed-background`   | Background of the item picked up.                       |
| `--ds-sortable-grabbed-border-color` | Border color of the item picked up.                     |
| `--ds-sortable-grabbed-shadow`       | Shadow of the item picked up.                           |
| `--ds-sortable-item-background`      | Background of an item.                                  |
| `--ds-sortable-item-border-color`    | Border color of an item.                                |
| `--ds-sortable-item-padding`         | Padding of an item.                                     |
| `--ds-sortable-item-radius`          | Corner radius of an item.                               |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
