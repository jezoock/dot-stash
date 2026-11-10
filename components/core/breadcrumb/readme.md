# ds-breadcrumb

A breadcrumb trail: the links to the pages above the current one, from the top level of the site, that tell where the page is and lead back up. The page writes the trail as a list of links in the element: it works, and is read, before the script runs or without it.

```html
<ds-breadcrumb>
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/women">Women</a></li>
    <li><a href="/women/shoes">Shoes</a></li>
  </ol>
</ds-breadcrumb>
```

## Structure

The trail is the first list in the element, an `ol` (the order of the levels matters; a `ul` works too), one `li` per level, from the top. The component never moves, wraps nor replaces these nodes: it sets attributes on them (`aria-current`, `hidden`), and inserts the item of the "Show full path" button while the trail is collapsed.

- **The last item is the current page**: a link to itself (`<a href="/women/shoes">Shoes</a>`: the trail is the same on every page, and the link can be copied), or a text (`<li>Shoes</li>`: nothing to follow on the page itself). Both are marked as the current page.
- **The current page**: when no element of the list has an `aria-current`, the component gives the last item `aria-current="page"`: on its link, else on the `li` itself. An `aria-current` of the page (on any element of the list) is kept, and the component marks nothing: `aria-current="page"` on a link that is not the last one, or `aria-current="false"` on the last item, for a trail that ends with a parent of the page. The mark follows the trail when a script changes it (a `MutationObserver`).
- **A `nav` of the page**: the element can be in a `nav` element (`<nav aria-label="Breadcrumb"><ds-breadcrumb>…</ds-breadcrumb></nav>`), or hold one around its list: a landmark that the page has before the script runs. The component then adds none (see [Accessibility](#accessibility)).
- **No separator in the markup**: the theme draws them, in CSS.

## Styling

- **Classes**: `ds-breadcrumb` on `<ds-breadcrumb>`; `--collapsed` while the trail is collapsed; `mods` → `--<mod>`.
- **Elements**: the list of the page and its items, read with element selectors (`.ds-breadcrumb li`): the component adds no class to them. `__collapsed`, the item the component inserts in a collapsed trail, with `__expand`, the "Show full path" button.
- **Attributes**: `mods` (reflected). The component sets `role` and `aria-label` on `<ds-breadcrumb>`, `aria-current="page"` on the current page, `hidden` on the items a collapsed trail hides, `aria-expanded` and `aria-label` on the button (see [Accessibility](#accessibility)).
- **Structure** (`breadcrumb.scss`): a block; the list without its markers, margins and padding, its items in a row that wraps (`flex-wrap`): a small screen gets more lines, never a horizontal scroll. Each item is a row of its separator and its content, centered; a long name breaks (`overflow-wrap: anywhere`). The items a collapsed trail hides are not rendered (`li[hidden]`: the attribute wins over the display of the items).
- **Look** (default theme, `components/_breadcrumb.scss`): small text (`--ds-breadcrumb-font-size`, `ds-token(font-size, 100)`), links in the link color, darker under the pointer, underlined (the links of the theme). A chevron (`angle-right`) before each item but the first, in a gray (`--ds-breadcrumb-separator-color`), `--ds-breadcrumb-gap` on each side, mirrored from right to left. The current page in the text color (`--ds-breadcrumb-current-color`), bold and not underlined: not a color only. The "Show full path" button: three dots (`ellipsis`) in the link color, in a box of 24 px at least, on a gray background under the pointer. In forced colors, the separators and the dots take the color of the text and of the button, the current page stays bold and not underlined, and the button has an outline (its transparent border).

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-breadcrumb {
  --ds-breadcrumb-font-size: var(--ds-font-size-200);
  --ds-breadcrumb-separator-color: var(--ds-color-gray-darker);
}

/* Another separator, in the breadcrumbs only: the image of the icon they draw */
ds-breadcrumb {
  --ds-icons-angle-right: url('data:image/svg+xml,…');
}
```

**Right to left**: the theme mirrors the chevrons on a page (or in an element) with `dir="rtl"`, from the attribute: `[dir='rtl'] .ds-breadcrumb li + li::before`, as `:dir(rtl)` needs Chrome 120 and the theme supports Chrome 104. A trail in a `dir="ltr"` element of a right-to-left page is mirrored too: there, set `transform: none` on its separators.

## Accessibility

The trail follows the WAI-ARIA [breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/): a navigation landmark, a list of links, the current page marked.

- **Landmark**: the element is a navigation landmark (`role="navigation"`, or the `role` it already has), named by `label` (`aria-label`, "Breadcrumb" by default): screen readers list it with the other landmarks ("Breadcrumb navigation") and jump to it. As for `ds-nav`, it is not a landmark when it is in a `nav` element or another navigation landmark, nor when it holds one (a landmark of the page, which then names it): no role, no name. One landmark, never two nested ones.
- **List**: the list of the page tells the number of levels ("list, 3 items"), and each item its position.
- **Current page**: `aria-current="page"` on the last item (see [Structure](#structure)): read as "current page" with its name. In the default theme, it is bold and not underlined, in the text color: not a color only.
- **Separators**: drawn by the theme, in CSS (`li + li::before`), with an empty alternative text (`content: "" / ""`): not read, nor part of the name of an item or of a link. The markup holds no separator character that a screen reader would read ("greater than").
- **Keyboard**: the links, in the Tab order, Enter follows them. No arrow keys: a trail is not a widget.
- **Collapsed trail** (`collapse`): the first item, then a "Show full path" button (`aria-expanded="false"`, named by `labels.expand`, `aria-label`), then the last `collapse` items (2 without a number); the items between are `hidden`: not rendered, out of the Tab order and of the accessibility tree (the list tells its visible items only). Enter or Space on the button (or a click) shows the whole trail, and the button goes away; the focus it had goes to the link of the first item it showed: Tab goes on from there, in the order of the trail. The trail stays expanded until it changes (a script writes another trail: collapsed again). A trail is collapsed only when the button would hide 2 items at least. When it collapses while the focus is in an item it hides (`collapse` set by a script, or a breakpoint of [`ds-rsp`](../responsive/readme.md)), the focus goes to the button.
- **Small screens**: the trail wraps on more lines; nothing is cut nor scrolled. To collapse it on small screens only, give `collapse` per breakpoint with `ds-rsp` (`data-rsp`, see the examples).
- **Forced colors**: the separators, the current page (bold, not underlined) and the outline of the button show.

## Texts

`label` is the name of the landmark: `Breadcrumb` by default, in English. `labels` (JSON as an attribute, or an object) translates the name of the button of a collapsed trail:

| Key      | Default          | What it is                                                                                                             |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `expand` | `Show full path` | The name of the button that shows the hidden levels; `{count}` the number of hidden levels, with the plural categories |

```html
<html lang="fr">
  …
  <ds-breadcrumb label="Fil d’Ariane" collapse="2" labels='{"expand": {"one": "Afficher {count} niveau masqué", "other": "Afficher les {count} niveaux masqués"}}'>…</ds-breadcrumb>
</html>
```

## Examples

```html
<!-- The current page as a text -->
<ds-breadcrumb>
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/help">Help</a></li>
    <li>Delivery</li>
  </ol>
</ds-breadcrumb>

<!-- A long trail, collapsed: Home › … › Running › Trail -->
<ds-breadcrumb collapse="2">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/catalog">Catalog</a></li>
    <li><a href="/catalog/women">Women</a></li>
    <li><a href="/catalog/women/shoes">Shoes</a></li>
    <li><a href="/catalog/women/shoes/running">Running</a></li>
    <li><a href="/catalog/women/shoes/running/trail">Trail</a></li>
  </ol>
</ds-breadcrumb>

<!-- Collapsed below md only (ds-rsp, once in the page) -->
<ds-rsp></ds-rsp>
<ds-breadcrumb collapse="1" data-use-rsp data-rsp='{"md": {"collapse": 0}}'>…</ds-breadcrumb>

<!-- A nav element of the page: the landmark before the script runs -->
<nav aria-label="Breadcrumb">
  <ds-breadcrumb>
    <ol>
      …
    </ol>
  </ds-breadcrumb>
</nav>
```

**New**: `ds-breadcrumb` is new.

<!-- Auto Generated Below -->


## Overview

A breadcrumb trail (WAI-ARIA breadcrumb pattern): the links to the pages above the current one, from the top level. The
page writes the trail in the element, as an ordered list of links (`<ol><li><a href="/">Home</a></li>…</ol>`), which
works without the script; the last item is the current page, a link or a text. The component never moves nor replaces
those nodes. It makes the element a navigation landmark (`role="navigation"`) named by `label` ("Breadcrumb"), unless the
element is in a `nav` element (or another navigation landmark) or holds one, and marks the last item as the current page
(`aria-current="page"` on its link, else on the item) when no element of the list has an `aria-current` of its own. The
theme draws the separators between the items, in CSS: they are not read.

`collapse` shortens a long trail: the first item, a "Show full path" button (`aria-expanded="false"`), and the last
items; the hidden items are `hidden` (not rendered, not focusable, not read). The button shows them all, moves the focus
to the first one, and goes away. The component inserts the item of that button in the list, after the first item, while
the trail is collapsed.

## Properties

| Property   | Attribute  | Description                                                                                                                                                                                                                                                                                                            | Type                           | Default     |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------- |
| `collapse` | `collapse` | Collapses a long trail: the number of items it keeps at its end (`collapse="2"`; `2` without a number), after the first item and a "Show full path" button that shows the others. A trail is collapsed only when that hides 2 items at least. Without it (or `0`), the whole trail shows, and wraps on a small screen. | `number \| string`             | `undefined` |
| `label`    | `label`    | The name of the navigation landmark (`aria-label`): `Breadcrumb` by default. Give it in the language of the page.                                                                                                                                                                                                      | `string`                       | `undefined` |
| `labels`   | `labels`   | The texts of the trail (JSON as an attribute), to translate them: `expand`, the name of the button of a collapsed trail.                                                                                                                                                                                               | `DSBreadcrumbLabels \| string` | `{}`        |
| `mods`     | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                     | `string \| string[]`           | `[]`        |


## Slots

| Slot | Description                                                                                                                                                                                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      | The trail, written by the page: an ordered list of links (`<ol>`, or `<ul>`), one `li` per page, the current page last. The component renders no `<slot>`: the list stays where it is, enhanced in place. |


## CSS Custom Properties

| Name                              | Description                                                            |
| --------------------------------- | ---------------------------------------------------------------------- |
| `--ds-breadcrumb-color`           | Text color of the links, and of the "Show full path" button.           |
| `--ds-breadcrumb-current-color`   | Text color of the current page (the element with `aria-current`).      |
| `--ds-breadcrumb-font-size`       | Font size of the trail.                                                |
| `--ds-breadcrumb-gap`             | Space on each side of a separator.                                     |
| `--ds-breadcrumb-hover-color`     | Text color of a link, or of the button, under the pointer.             |
| `--ds-breadcrumb-separator-color` | Color of the separators.                                               |
| `--ds-breadcrumb-separator-size`  | Size of the separators (their font size: the icon is a square of 1em). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
