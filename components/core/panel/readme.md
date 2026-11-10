# ds-panel

## Styling

- **Classes**: `ds-panel` on `<ds-panel>`, and `--tab` or `--collapsible` (`type`, which `ds-panel-group` sets); `--transition` while its content expands or collapses (from the change of `expanded` to the end of the transition); `mods` → `--<mod>`.
- **Elements**: `__title` (a click expands the panel), which holds `__control` (the slot `title`: the tab, or the button of a collapsible panel, which takes the focus), and `__content`, which holds `__content-wrapper` (the default slot; `min-height` sets its minimum height).
- **Attributes** (reflected): `expanded`, `type`, `index`, `mods`. The component also sets the roles and ARIA attributes of `__title`, `__control` and `__content`, `inert` on the content of a panel that is not expanded, and the ids `<id>-control` and `<id>-content` (`<id>`: the id of the `ds-panel`, else a generated one) (see [Accessibility](#accessibility)).
- **Structure** (`panel.scss`): a tab has `display: contents`, so that its title and content are items of the row of its `ds-panel-group`: the titles first, the contents below them at full width. The content of a tab that is not expanded is transparent, under the expanded one, and does not take the pointer; the expanded one fades in. The content of a collapsible panel collapses to a height of 0 (a grid row from `0fr` to `1fr`). Both transitions last `--ds-panel-transition-duration`. The content is clipped only where it must be: a collapsible panel while it is collapsed and during its transition, the content of a tab once it is hidden (out of its fade). Expanded, nothing clips it: the focus indicator of the elements at its edges shows (`__content-wrapper` is a block formatting context, `display: flow-root`, for the margins of its content).
- **Look** (default theme, `components/_panel.scss`): the title (padding, title font, a chevron on a collapsible panel, turned when expanded, which is not read by screen readers), the space below the content, the line under a collapsible panel or a tab title, and the colors of the tabs, from the custom properties below, set on `ds-panel`. The elements of the `title` slot inherit the font of the title and have no margin. The focus indicator of the theme draws around `__control`, and around the content of a tab when it takes the focus.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-panel {
  --ds-panel-active-color: var(--ds-color-secondary-dark);
}

.faq ds-panel {
  --ds-panel-border-color: transparent;
  --ds-panel-transition-duration: 0.2s;
}
```

## Accessibility

- **Collapsible panel** ([WAI-ARIA accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/), a disclosure on its own): `__control` is a button (`role="button"`, `tabindex="0"`) with `aria-expanded` and `aria-controls` (the id of `__content`). Its name is the text of the `title` slot.
- **Heading**: with a heading level, `__title` is a heading (`role="heading"`, `aria-level`) around the button, so that the panels are in the outline of the page. The level is `level` (1 to 6), else the level of an `h1`…`h6` element put in the `title` slot, which then gets `role="none"` (it would be a heading inside the button, read twice); it gets its own role back if the title is no longer a control. Without a level, the title is not a heading.
- **Tab** (in a `ds-panel-group` of type `tab`, which calls `setTab(true)`): `__control` is a `tab` (`aria-selected`, `aria-controls`), in the Tab order when it is selected (`tabindex="0"`, else `-1`), and `__content` a `tabpanel` (`aria-labelledby`: the tab), which takes the focus (`tabindex="0"`) when it has no focusable element. A heading in the `title` slot of a tab gets `role="none"`. See [`ds-panel-group`](../panel-group/readme.md#accessibility) for the tab list and its keys. A `tab` panel outside of a tab list (`setTab(false)`, a group that is not `active`) has no role: its title is not a control.
- **Hidden content**: the content of a panel that is not expanded is `inert` (out of the Tab order and of the accessibility tree), at once when it collapses; when the focus is in it, the focus goes to `__control` first.
- **Keyboard**, on `__control`:

  | Key   | Action                                                                                            |
  | ----- | ------------------------------------------------------------------------------------------------- |
  | Enter | A click (on keydown): expands or collapses a collapsible panel, selects a tab                     |
  | Space | The same, on keyup (as a native button); the page does not scroll                                 |
  | Tab   | Moves to the next focusable element: in an expanded panel, the first focusable one of its content |

  A key held down does not repeat; the keys with Alt, Ctrl or Meta, and those of the elements of the title (a link in it), are left to the browser.

- **Events**: `panelShow` / `panelHide` when `expanded` changes, `panelShown` / `panelHidden` at the end of the transition of the content (`transitionend`), at once when there is none (a duration of 0, less motion), or once its duration is over when the event does not come (`utils/transition.ts`). A new change cancels the wait.

```html
<ds-panel type="collapsible" level="3">
  <span slot="title">Shipping</span>
  <p>Orders ship within two days.</p>
</ds-panel>

<ds-panel type="collapsible"><h3 slot="title">Returns</h3><p>…</p></ds-panel>
```

**Changed**: the title holds a new element, `__control`, which wraps the `title` slot (the theme rules on the elements of the slot follow it); the roles, ARIA attributes, ids, `inert`, the keys, `level`, `setTab()` and the `--transition` class are new; `panelShown` and `panelHidden`, which were never emitted, are emitted at the end of the transition; the content is no longer clipped once expanded (`__content-wrapper` was `overflow: hidden`), nor the row of a group of tabs out of the transitions.

<!-- Auto Generated Below -->


## Overview

A panel: a title and a content, which expands and collapses. Two types, which `ds-panel-group` sets on its panels:
- `collapsible` (WAI-ARIA disclosure / accordion pattern): the title holds a button (`role="button"`, `aria-expanded`,
  `aria-controls`), which Enter, Space and a click toggle; with a heading level (`level`, or the level of a heading put
  in the `title` slot, which then gets `role="none"`), the title is a heading (`role="heading"`, `aria-level`) around
  that button.
- `tab`: in a `ds-panel-group` (WAI-ARIA tabs pattern), the title is a `tab` (`aria-selected`, `aria-controls`) of the
  tab list of the group and the content a `tabpanel` (`aria-labelledby`); the group handles the arrow keys.
The content of a panel that is not expanded is inert: out of the Tab order and of the accessibility tree.
`panelShow` / `panelHide` are emitted when the state changes, `panelShown` / `panelHidden` at the end of its transition
(at once when there is none).

## Properties

| Property    | Attribute    | Description                                                                                                                                                                                                                                                                                                                   | Type                     | Default     |
| ----------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------- |
| `expanded`  | `expanded`   | Whether the content is shown.                                                                                                                                                                                                                                                                                                 | `boolean`                | `false`     |
| `index`     | `index`      | The place of the panel in its `ds-panel-group` (set by the group).                                                                                                                                                                                                                                                            | `number`                 | `undefined` |
| `level`     | `level`      | The heading level (1 to 6) of the title of a collapsible panel: the title is then a heading (`role="heading"`, `aria-level`) that holds its button, as in the WAI-ARIA accordion pattern. Default: the level of an `h1`…`h6` element put in the `title` slot (which gets `role="none"`: the title is the heading), else none. | `number \| string`       | `undefined` |
| `minHeight` | `min-height` | The minimum height of the content (a CSS length).                                                                                                                                                                                                                                                                             | `string`                 | `'0'`       |
| `mods`      | `mods`       | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                            | `string \| string[]`     | `[]`        |
| `type`      | `type`       | `tab` (in a `ds-panel-group` of tabs) or `collapsible`. `ds-panel-group` sets it on its panels.                                                                                                                                                                                                                               | `"collapsible" \| "tab"` | `'tab'`     |


## Events

| Event         | Description                                                                                                    | Type               |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ------------------ |
| `panelHidden` | Emitted when the panel is collapsed, at the end of the transition of its content (at once when there is none). | `CustomEvent<any>` |
| `panelHide`   | Emitted when the panel starts to collapse (`detail.index`: its index).                                         | `CustomEvent<any>` |
| `panelShow`   | Emitted when the panel starts to expand (`detail.index`: its index).                                           | `CustomEvent<any>` |
| `panelShown`  | Emitted when the panel is expanded, at the end of the transition of its content (at once when there is none).  | `CustomEvent<any>` |


## Methods

### `hide() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setIndex(index: number) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `index` | `number` |             |

#### Returns

Type: `Promise<void>`



### `setTab(isTab: boolean) => Promise<void>`

Makes the panel a tab of the tab list of its `ds-panel-group` (`true`), or not: `ds-panel-group` calls it. A `tab`
panel that is not in a tab list has no role (its title is not a control).

#### Parameters

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| `isTab` | `boolean` |             |

#### Returns

Type: `Promise<void>`



### `setType(type: PanelType) => Promise<void>`



#### Parameters

| Name   | Type                     | Description |
| ------ | ------------------------ | ----------- |
| `type` | `"tab" \| "collapsible"` |             |

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `toggle(mustShow?: boolean) => Promise<void>`



#### Parameters

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| `mustShow` | `boolean` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot      | Description                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
|           | The content.                                                                                     |
| `"title"` | The title: a text, or a heading (`h1`…`h6`), whose level the title of a collapsible panel takes. |


## CSS Custom Properties

| Name                             | Description                                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--ds-panel-active-color`        | Text and line color of the title of the expanded tab.                                                                                    |
| `--ds-panel-border-color`        | Color of the line under a collapsible panel and under a tab title.                                                                       |
| `--ds-panel-tab-color`           | Text color of a tab title.                                                                                                               |
| `--ds-panel-title-font-size`     | Font size of the title.                                                                                                                  |
| `--ds-panel-transition-duration` | Duration of the transitions when the panel expands or collapses (the content of a tab fades, the height of a collapsible panel changes). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
