# ds-panel-group

## Styling

- **Classes**: `ds-panel-group` on `<ds-panel-group>`; `mods` → `--<mod>`.
- **Elements**: `__tablist`, in a `tab` group that is `active`: the tab list, an empty element (see [Accessibility](#accessibility)), out of the row (`position: absolute`).
- **Attributes** (reflected): `type` (`tab` or `collapsible`, given to its panels), `active` (`false`: the panels are all shown, as they are), `solo-content` (a collapsible group expands one panel at a time), `mods`.
- **Structure** (`panel-group.scss`): a `tab` group is a wrapping flex row: the titles of its panels in a row, the content of the expanded one below them. It clips its content only while the content of a tab fades in or out (a panel with `--transition`, `:has()`), so that the focus indicator of the tabs and of the content shows the rest of the time.
- **Look**: none, and no custom property: the `ds-panel` elements carry the look. Set their `--ds-panel-*` properties on them (`.faq ds-panel { … }`, see `ds-panel`).

## Accessibility

The panels of a group are its own `ds-panel` elements: not those of a group nested in one of them, nor a panel in the content of another (`getItems()`).

- **Tabs** (`type="tab"`, [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), automatic activation: the content of a tab is in the page, it shows at once): the group renders the tab list, `__tablist` (`role="tablist"`, horizontal), which owns the tabs of its panels with `aria-owns` (the titles stay in their panels, for the layout). Each panel is a tab and a tab panel (see [`ds-panel`](../panel/readme.md#accessibility)). One tab is selected: the first panel with `expanded`, else the first panel (the others are collapsed).
- **Name** (required for tabs): `label` (`aria-label` of the tab list), or `labelledby`, the id of a visible label (`aria-labelledby`).
- **Keyboard**: Tab reaches the selected tab (the others have `tabindex="-1"`), then its tab panel (or its first focusable element), then the rest of the page. On a tab:

  | Key                     | Action                                                                                               |
  | ----------------------- | ---------------------------------------------------------------------------------------------------- |
  | Right Arrow, Left Arrow | Moves the focus to the next or previous tab and selects it; from the last one to the first, and back |
  | Home, End               | Moves the focus to the first or the last tab and selects it                                          |
  | Enter, Space            | Selects the focused tab                                                                              |

  From right to left (`dir="rtl"` on an ancestor), Right and Left Arrow are reversed. Up and Down Arrow are left to the page (a horizontal tab list); the keys with Alt, Ctrl or Meta too.

- **Collapsible** (`type="collapsible"`, an accordion): no tab list; each panel has a button (`aria-expanded`), in the Tab order, which Enter and Space toggle. `solo-content` collapses the expanded panel when another one expands. Give the titles a heading level (`level` on the panels, or headings in their `title` slot).
- **Not active** (`active="false"`): no tab list, no role; the panels are all shown.

```html
<h2 id="details-title">Details</h2>
<ds-panel-group type="tab" labelledby="details-title">
  <ds-panel expanded><span slot="title">Description</span><p>…</p></ds-panel>
  <ds-panel><span slot="title">Reviews</span><p>…</p></ds-panel>
</ds-panel-group>

<ds-panel-group type="collapsible" solo-content>
  <ds-panel level="3"><span slot="title">Shipping</span><p>…</p></ds-panel>
  <ds-panel level="3"><span slot="title">Returns</span><p>…</p></ds-panel>
</ds-panel-group>
```

**Changed**: the tab list, `label`, `labelledby` and the keys are new; a `tab` group selects its first panel when none is expanded, and keeps one tab selected when several are; `getItems()`, `showPanel()` and the selection only concern the own panels of the group (they took the panels of the nested groups too); a group that is not `active` shows all its panels (it kept the last one); the row no longer clips its content out of the transitions.

<!-- Auto Generated Below -->


## Overview

Groups `ds-panel` elements, and gives them its `type`:
- `tab` (WAI-ARIA tabs pattern, automatic activation): the titles of the panels are the tabs of a tab list, rendered by
  the group (`role="tablist"`, named by `label` or `labelledby`, owning the tabs with `aria-owns`), one expanded at a
  time. Tab reaches the selected tab, then its panel; Left and Right Arrow, Home and End move the focus to another tab
  and select it.
- `collapsible`: accordion panels, each one expanded and collapsed by its title button; `solo-content` keeps one
  expanded at a time.
The panels of the group are its own: not those of a group or a panel nested in one of them.

## Properties

| Property      | Attribute      | Description                                                                                         | Type                     | Default     |
| ------------- | -------------- | --------------------------------------------------------------------------------------------------- | ------------------------ | ----------- |
| `isActive`    | `active`       | `false`: the group does not set the type of its panels, which are all shown (no tab list).          | `boolean`                | `true`      |
| `label`       | `label`        | The accessible name of the tab list (`aria-label`) of a `tab` group.                                | `string`                 | `undefined` |
| `labelledby`  | `labelledby`   | The id of a visible label of the tab list of a `tab` group (`aria-labelledby`), instead of `label`. | `string`                 | `undefined` |
| `mods`        | `mods`         | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.  | `string \| string[]`     | `[]`        |
| `soloContent` | `solo-content` | A `collapsible` group expands one panel at a time.                                                  | `boolean`                | `false`     |
| `type`        | `type`         |                                                                                                     | `"collapsible" \| "tab"` | `'tab'`     |


## Methods

### `getItems() => Promise<HTMLDsPanelElement[]>`

The panels of the group: its `ds-panel` elements, but those of a nested group or panel.

#### Returns

Type: `Promise<HTMLDsPanelElement[]>`



### `hidePanel(_index?: number) => Promise<void>`

Not implemented yet: does nothing.

#### Parameters

| Name     | Type     | Description |
| -------- | -------- | ----------- |
| `_index` | `number` |             |

#### Returns

Type: `Promise<void>`



### `showPanel(index: number) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `index` | `number` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description              |
| ---- | ------------------------ |
|      | The `ds-panel` elements. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
