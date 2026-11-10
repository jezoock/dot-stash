# ds-pagination

A pagination: the links (or buttons) to the pages of a list of results, around the current page, with the previous and next pages.

```html
<ds-pagination total="12" current="3" href-template="/results?page={page}"></ds-pagination>
```

## Modes

- **Links** (`href-template`): each control is a link to its page, `{page}` replaced with its number (`/results?page=4`). The browser follows it, as any link (a click with Ctrl or Cmd opens the page in a new tab): the next page is a new page, which renders the pagination with its own `current`. Nothing to manage on a click, no event, no script that changes the page. The previous and next links have `rel="prev"` and `rel="next"`.
- **Buttons** (no `href-template`): each control is a `<button type="button">`, for a list that a script pages (a table, results loaded without a new page). A click (or Enter, Space) emits `pageChange` (`detail.page`, the page asked for; `detail.previous`; cancelable), then sets `current` to that page, unless the event was cancelled (`preventDefault()`: the page sets `current` itself once its results are there). The page loads the results of `detail.page`. Setting `current` or `total` from a script changes the pagination without an event.

The pages shown: the `boundaries` first and last pages (1 by default), the current page and its `siblings` on each side (1 by default), and an ellipsis for each run of 2 pages or more between them (a single page is shown instead). The list keeps the same number of items, `2 × boundaries + 2 × siblings + 3` (7 by default), wherever the current page is, so that the controls do not move under the pointer: `1 2 3 4 5 … 12`, `1 … 4 5 6 … 12`, `1 … 8 9 10 11 12`. `current` out of the range of the pages is the closest page; `siblings` and `boundaries` go from 0 to 10. A pagination without pages (`total` 0, or not a number) renders nothing; one page renders that page, between the unavailable previous and next controls.

## Styling

- **Classes**: `ds-pagination` on `<ds-pagination>`; `--links` or `--buttons` (the mode), `--compact` (compact layout), `--empty` (no pages); `mods` → `--<mod>`.
- **Elements**: `__control`, each link or button, with `--first`, `--previous`, `--next`, `--last` (its kind), or `--page` (a page; `--current` for the current one), and `--disabled` (an unavailable control: the first or the last page); `__list` (the `ul` of the pages), `__item` (each `li`; `--ellipsis` for the pages left out, an empty item); `__status`, the text of the compact layout ("Page 3 of 10").
- **Attributes** (reflected): `current` (it follows a page change in buttons mode), `mods`. The component sets `role` and `aria-label` on `<ds-pagination>`, `aria-label` and `aria-current` on the controls, `aria-hidden` on the ellipses (see [Accessibility](#accessibility)).
- **Structure** (`pagination.scss`): a row of the controls, in the direction of the text: the first and previous controls, the list of the pages (without its markers, margins and padding) or the compact text, then the next and last controls; `--ds-pagination-gap` between them (`0.25rem` without the theme). The list takes the room left between the arrows and wraps there (`flex-wrap`): a narrow column or a small screen gets another line of pages, never a horizontal scroll, and the arrows stay at the ends of the list, centered on its height. Each control and each item centers its content; the compact text breaks rather than overflows. `--empty` is not rendered.
- **Look** (default theme, `components/_pagination.scss`): controls of 40 × 40 px at least (`--ds-pagination-size`, 2.5 rem), the numbers in the link color (`--ds-pagination-color`) in semi-bold tabular figures, a light primary background under the pointer. The current page filled with the primary color (`--ds-pagination-current-background`), its number white and bold, framed by a border of its background color. The arrows: `angle-left`, `angle-right`, and `angle-double-left`, `angle-double-right` for the first and last controls (`--ds-pagination-icon-size`), mirrored from right to left; unavailable, faded (`--ds-pagination-disabled-color`, a light gray), without a background under the pointer. The ellipsis: three dots (`ellipsis`) in a gray, in the place of a control. The compact text in the text color. In forced colors, the current page is the one with a frame (its border) and stays bold; an unavailable link takes the color of the text (it has no `href`: not a link), an unavailable button the color of a disabled text; the arrows and the ellipsis take the color of their control and of the text; the focus indicator shows.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-pagination {
  --ds-pagination-radius: var(--ds-radius-circle);
  --ds-pagination-current-background: var(--ds-color-secondary-dark);
}

/* Centered under the results */
.ds-pagination,
.ds-pagination__list {
  justify-content: center;
}
```

**Right to left**: the controls follow the direction (the previous pages on the right), and the theme mirrors the arrows on a page (or in an element) with `dir="rtl"`, from the attribute: `[dir='rtl'] .ds-pagination__control…::before`, as `:dir(rtl)` needs Chrome 120 and the theme supports Chrome 104. A pagination in a `dir="ltr"` element of a right-to-left page has its arrows mirrored too: there, set `transform: none` on them.

## Accessibility

- **Landmark**: the element is a navigation landmark (`role="navigation"`, or the `role` it already has), named by `label` (`aria-label`, "Pagination" by default). As for `ds-nav`, it is not a landmark in a `nav` element or another navigation landmark (no role, no name). Two paginations of the same list (above and below it) are two landmarks: give them two names ("Pagination, top", "Pagination, bottom"), or render one.
- **List**: the pages are a list (`ul`): screen readers tell the number of pages shown ("list, 5 items": the ellipses are not items for them). The previous, next, first and last controls are around the list, not in it.
- **Names**: each page shows its number and is named "Page 3" (`labels.page`, `aria-label`, which keeps the visible number: WCAG 2.5.3 Label in Name); the arrows are named "Previous page", "Next page", "First page", "Last page" (`labels`); their icons are decorative (CSS, with an empty alternative text).
- **Ellipsis**: decorative, `aria-hidden="true"`, empty (the theme draws three dots): not read, not an item of the list. The numbers around it tell the pages left out.
- **Current page**: `aria-current="page"`, read as "current page" with its name. It stays a link to itself in links mode (`href` of its own page) and a button in buttons mode, as in the paginations of GOV.UK and of the U.S. Web Design System: the list keeps its items, Tab and the lists of links of screen readers reach it and say that it is the current page, and in buttons mode it is where the focus can go after a page change (below). Activating it does nothing in buttons mode (no event); in links mode, it reloads the page. In the default theme, it is filled and bold: not a color only.
- **Unavailable previous and next**: on the first page, the previous and first controls are unavailable; on the last page, the next and last ones. They stay in their place, so that the other controls do not move (a pointer that clicks "Next" again and again stays on it), and are told as unavailable rather than left out: in links mode, a link without `href` (`role="link"`, `aria-disabled="true"`), in buttons mode a disabled button (`disabled`). Neither is focusable: Tab skips them, as there is nothing to do there; a screen reader in browse mode reads them as unavailable ("Previous page, link, unavailable"), which tells that this is the first page. In the default theme they are faded.
- **Keyboard**: Tab goes through the controls, in their order on the screen (right to left too); Enter follows a link; Enter and Space press a button. No arrow keys: a pagination is a set of links, not a widget.
- **Focus after a page change** (buttons mode, or a page that sets `current` itself, as a router does with the links): the focus stays on the control the user pressed while it is there and available: "Next page" pressed again and again stays on "Next page", a page number stays on that number (the list moves around it: the control is kept, or the focus is given back to it). When that control became unavailable or went away (the last page reached with "Next page", the first one with "Previous page" or "First page", a number no longer shown), the focus goes to the current page; in the compact layout, which has no page numbers, to the closest control of the pagination that the user can reach (`getNeighbourTabbable()`: the next one, else the previous one: "Previous page" once "Next page" reached the last page). It is never lost on the body. When a `pageChange` listener moves the focus (to the heading of the results), it stays there.
- **Telling the change** (buttons mode): a page change is not announced by the pagination itself (no live region): the focus stays on the control. Move the focus to the results (their heading, `tabindex="-1"`) in `pageChange` when that suits the page, or tell the change in a polite live region ("Page 4 of 12", a `ds-alert` with `live="polite"`). In links mode, the browser loads the new page, which screen readers announce.
- **Compact layout**: below the `sm` breakpoint of the theme (`compact-below`: the media query `(width < 768px)` of `break-p(null, sm)`, read from `--ds-bp-sm`; `none`, never), or always with `compact`: the previous and next controls (and the first and last ones) around the text "Page 3 of 10" (`labels.status`), the page numbers left out. The controls keep their names, the landmark its name; no horizontal scroll at 320 px. The layout follows the viewport across the breakpoint (`matchMedia()`), at once; the focus that was on a page number then goes to the first control of the pagination that the user can reach.
- **Target size**: 40 × 40 px in the default theme (WCAG 2.5.8 asks for 24 × 24 px at least).
- **Forced colors**: the current page (its frame and its bold number), the unavailable controls (another color), the arrows, the ellipsis and the focus indicator show.

## Texts

`label` is the name of the landmark: `Pagination` by default, in English. `labels` (JSON as an attribute, or an object) translates the other texts:

| Key        | Default                  | What it is                                                                                                                  |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `first`    | `First page`             | The name of the control of the first page (`first-last`)                                                                    |
| `previous` | `Previous page`          | The name of the control of the previous page                                                                                |
| `next`     | `Next page`              | The name of the control of the next page                                                                                    |
| `last`     | `Last page`              | The name of the control of the last page (`first-last`)                                                                     |
| `page`     | `Page {page}`            | The name of the control of a page, `{page}` its number                                                                      |
| `status`   | `Page {page} of {total}` | The text of the compact layout; one template per plural category of `{total}` (also `{count}`), in the language of the page |

```html
<html lang="fr">
  …
  <ds-pagination
    total="12"
    current="3"
    href-template="?page={page}"
    label="Pagination des résultats"
    labels='{"previous": "Page précédente", "next": "Page suivante", "page": "Page {page}", "status": "Page {page} sur {total}"}'
  ></ds-pagination>
</html>
```

## Examples

```html
<!-- Links: the browser loads the pages -->
<ds-pagination total="12" current="3" href-template="/results?page={page}"></ds-pagination>

<!-- More pages around the current one, the first and last controls -->
<ds-pagination total="250" current="120" siblings="2" first-last href-template="?page={page}"></ds-pagination>

<!-- Buttons: the page loads the results itself -->
<h2 id="results-title" tabindex="-1">Results</h2>
<ul id="results">
  …
</ul>
<ds-pagination id="pages" total="12" label="Results pages"></ds-pagination>

<!-- Always compact (a narrow column) -->
<ds-pagination total="12" current="3" compact href-template="?page={page}"></ds-pagination>
```

```js
const pages = document.querySelector('#pages');
pages.addEventListener('pageChange', async event => {
  event.preventDefault(); // the current page changes once the results are there
  await loadResults(event.detail.page);
  pages.current = event.detail.page;
  document.querySelector('#results-title').focus();
});
```

**New**: `ds-pagination` is new.

<!-- Auto Generated Below -->


## Overview

A pagination: a navigation landmark (`role="navigation"`) named by `label` ("Pagination"), with a list of the pages
(`total`) around the current one (`current`): the first and last pages (`boundaries`), the pages next to the current one
(`siblings`), and an ellipsis for the others (decorative, `aria-hidden`); the previous and next controls around it, and
the first and last ones with `first-last`. Each page shows its number and is named "Page 3" (`labels`); the current
page has `aria-current="page"`. On the first page, the previous and first controls are unavailable, on the last page the
next and last ones: rendered in their place, not focusable.

With `href-template` (`?page={page}`), the controls are links to the pages: the browser follows them, no script changes
the page, and the next page is a new page. Without it, they are buttons: a click emits `pageChange` (`detail.page`, cancelable), then
`current` changes, and the focus stays on the control the user pressed, or goes to the equivalent one (the current page,
when that control became unavailable): it is never lost.

Below a breakpoint of the theme (`compact-below`, `sm`), or with `compact`, it is compact: the previous and next
controls (and first and last) around "Page 3 of 10", with the same names.

## Properties

| Property       | Attribute       | Description                                                                                                                                                                                                                                 | Type                           | Default     |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------- |
| `boundaries`   | `boundaries`    | The number of pages shown at each end of the list: `1` by default (the first and the last page), `10` at most.                                                                                                                              | `number \| string`             | `1`         |
| `compact`      | `compact`       | Always compact: "Page 3 of 10" between the previous and next controls, whatever the width of the viewport.                                                                                                                                  | `boolean`                      | `false`     |
| `compactBelow` | `compact-below` | The breakpoint of the theme below which the pagination is compact (`xs`, `sm`, `md`…: the media query of `break-p(null, <breakpoint>)`): `sm` by default; `none` never.                                                                     | `string`                       | `'sm'`      |
| `current`      | `current`       | The current page, from 1 to `total` (a number out of that range is the closest page). A page change in button mode sets it.                                                                                                                 | `number \| string`             | `1`         |
| `firstLast`    | `first-last`    | Renders the controls of the first and of the last page, at each end.                                                                                                                                                                        | `boolean`                      | `false`     |
| `hrefTemplate` | `href-template` | The link of a page, `{page}` its number (`?page={page}`, `/results/page/{page}`): the controls are then links (links mode). Without it, they are buttons, and a page change emits `pageChange` (buttons mode).                              | `string`                       | `undefined` |
| `label`        | `label`         | The name of the navigation landmark (`aria-label`): `Pagination` by default. Give it in the language of the page.                                                                                                                           | `string`                       | `undefined` |
| `labels`       | `labels`        | The texts of the pagination (JSON as an attribute), to translate them: `first`, `previous`, `next`, `last` (the names of the controls), `page` (the name of a page, `{page}` its number), `status` (the compact text, `{page}`, `{total}`). | `DSPaginationLabels \| string` | `{}`        |
| `mods`         | `mods`          | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                          | `string \| string[]`           | `[]`        |
| `siblings`     | `siblings`      | The number of pages shown on each side of the current page: `1` by default, `10` at most.                                                                                                                                                   | `number \| string`             | `1`         |
| `total`        | `total`         | The number of pages. Without pages (`0`, or not a number), nothing is rendered.                                                                                                                                                             | `number \| string`             | `undefined` |


## Events

| Event        | Description                                                                                                                                                                                                                                         | Type                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `pageChange` | Emitted in buttons mode when the user asks for another page (`detail.page`; `detail.previous`, the current page), before `current` changes: `preventDefault()` keeps the current page. Not emitted in links mode, nor when a script sets `current`. | `CustomEvent<DSPaginationChangeDetail>` |


## CSS Custom Properties

| Name                                 | Description                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `--ds-pagination-color`              | Text color of the controls: the page numbers and the arrows.                                        |
| `--ds-pagination-current-background` | Background of the current page.                                                                     |
| `--ds-pagination-current-color`      | Text color of the current page.                                                                     |
| `--ds-pagination-disabled-color`     | Color of the arrows of the unavailable controls (previous on the first page, next on the last one). |
| `--ds-pagination-font-size`          | Font size of the page numbers and of the compact text.                                              |
| `--ds-pagination-gap`                | Space between the controls, and between the pages.                                                  |
| `--ds-pagination-hover-background`   | Background of a control under the pointer.                                                          |
| `--ds-pagination-icon-size`          | Size of the arrows and of the ellipsis (their font size: an icon is a square of 1em).               |
| `--ds-pagination-radius`             | Corner radius of the controls.                                                                      |
| `--ds-pagination-size`               | Width (at least) and height of a control: its target size.                                          |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
