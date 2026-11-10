# ds-nav

## Styling

- **Classes**: `<ds-nav>` renders a `div` with the main class, `ds-nav`, and its modifiers; the default slot holds the `ds-nav-item` elements.
- **Modifiers**: `mods` → `--<mod>`. The default theme reads `--main`: from the `md` breakpoint, the items of a main navigation are in a row.
- **Attributes**: `mods` (reflected). The component sets `role` and `aria-label` on `<ds-nav>` and `role="list"` on its `div` (see [Accessibility](#accessibility)).
- **Structure** (`nav.scss`): none, the wrapper has no layout of its own. The row of a main navigation depends on the breakpoints, which the component stylesheets cannot read: it is in the theme (`components/_nav.scss`).
- **Look** (default theme): the space between the items of a main navigation, `--ds-nav-gap`, set on `ds-nav`. The items are styled by the `--ds-nav-item-*` properties (see `ds-nav-item`).

Override it after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-nav {
  --ds-nav-gap: var(--ds-space-4);
}
```

## Accessibility

The navigation follows the WAI-ARIA [disclosure navigation pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation-hybrid/) (links, and buttons that show and hide the sub-navigations), not the `menubar` pattern: its items are links to pages, which Tab reaches one after the other, with no arrow keys and no `menu` role (see [`ds-nav-item`](nav-item/readme.md#accessibility)).

- **Landmark**: a main `ds-nav` is a navigation landmark: `role="navigation"` (or the `role` the element already has), named by `label` (`aria-label`, required when the page has several navigations: "Main", "Footer"). A `ds-nav` in a `ds-nav-item` (a sub-navigation), or in a `nav` element or another `role="navigation"` element, is not a landmark (no role, no name).
- **List**: its `div` is a list (`role="list"`) and each `ds-nav-item` a list item (`role="listitem"`): screen readers tell the number of items and the level of a sub-navigation. Put only `ds-nav-item` elements in a `ds-nav`.

```html
<ds-nav mods="main" label="Main">
  <ds-nav-item is-active><a href="/">Home</a></ds-nav-item>
  <ds-nav-item has-children
    ><a href="/about">About</a>
    <ds-nav slot="children">
      <ds-nav-item><a href="/about/team">Team</a></ds-nav-item>
    </ds-nav>
  </ds-nav-item>
</ds-nav>
```

**Changed**: `label`, the navigation role and the list roles are new.

<!-- Auto Generated Below -->


## Overview

A navigation: a list of `ds-nav-item` elements. A main `ds-nav` is a navigation landmark (`role="navigation"`, or the
`role` its element has), named by `label`; a `ds-nav` in a `ds-nav-item` (a sub-navigation), or in a `nav` element or
another navigation landmark, is a list only. Its items are the items of the list (`role="list"`, `role="listitem"`).

## Properties

| Property              | Attribute                | Description                                                                                                                                                               | Type                 | Default     |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `currentActiveItemId` | `current-active-item-id` |                                                                                                                                                                           | `string`             | `undefined` |
| `label`               | `label`                  | The accessible name of the navigation landmark (`aria-label`), which tells it from the other navigations of the page: "Main", "Footer". Not rendered on a sub-navigation. | `string`             | `undefined` |
| `mods`                | `mods`                   | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                        | `string \| string[]` | `[]`        |


## Slots

| Slot | Description                                                             |
| ---- | ----------------------------------------------------------------------- |
|      | The `ds-nav-item` elements (only them: they are the items of the list). |


## CSS Custom Properties

| Name           | Description                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `--ds-nav-gap` | Space between the items of a `main` navigation, from the `md` breakpoint (where they are in a row). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
