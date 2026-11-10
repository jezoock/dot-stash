# ds-back-to-top

A "Back to top" link, fixed in the bottom corner of the viewport, that shows once the page is scrolled far enough, scrolls back to the top and brings the keyboard focus there.

```html
<body>
  <header>…</header>
  <main id="main">…</main>
  <ds-back-to-top target="#main"></ds-back-to-top>
</body>
```

## Styling

- **Classes**: `ds-back-to-top` on `<ds-back-to-top>`; `--shown` (the page is scrolled past `threshold`, or the link has the focus) or `--hidden`; `mods` → `--<mod>`.
- **Elements**: `__link`, the link (`<a href="#top">`, or the id of `target`), and in it `__label`, its name, hidden on the screen.
- **Attributes** (reflected): `mods`. A hidden link is `inert`.
- **Structure** (`back-to-top.scss`): a box fixed in the bottom corner of the end side of the viewport (the right; the left from right to left), `--ds-back-to-top-offset` away from the bottom and end edges, plus the safe areas of the screen (`env(safe-area-inset-bottom)`, and the larger of the left and right ones: they are physical sides), above the page (`--ds-back-to-top-z-index`: 9, below the sidebars, the modals and the toasts). It takes no room in the page: showing it moves nothing. `--hidden` fades it out (opacity and visibility, `--ds-back-to-top-transition-duration`) and it is not rendered: no pointer, no focus, not read. With less motion, it shows and hides at once; in print, it is not printed. The link is a flex box that centers its arrow; its name is hidden on the screen (a 1 px clipped box).
- **Look** (default theme, `components/_back-to-top.scss`): a round button of 2.75 rem (44 px, `--ds-back-to-top-size`) in the primary color, darker under the pointer, with a shadow and a white chevron up (the `angle-up` icon, 1.5 rem), 1 rem from the edges below `md`, 2 rem from `md`. The focus indicator of the theme is around it. In forced colors, its outline (a transparent border, drawn by the browser in the color of the link) and its arrow (in the color of the link) show.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-back-to-top {
  --ds-back-to-top-radius: var(--ds-radius-md);
  --ds-back-to-top-background: var(--ds-color-secondary-dark);
}

/* Above a fixed bar at the bottom of the page */
ds-back-to-top {
  --ds-back-to-top-offset: 5rem;
}
```

## Accessibility

- **A link**: going back to the top is moving within the page, a navigation: the element is a native link, `<a href="#top">` (or `href` the id of `target`), named "Back to top" by its text (`label`), hidden on the screen. Tab reaches it, Enter follows it, and a browser follows it by itself if the script does not run (`#top` is the top of the document, even without an element of that id): the link works before its enhancement. A button would say that it acts on the page, and would do nothing without the script. With the script, a click or Enter (without a modifier key: Ctrl+click still opens it as a link) scrolls to the top and moves the focus, without changing the URL nor the history.
- **Scroll**: to the top of the page, smoothly, or at once with less motion (`prefers-reduced-motion: reduce`: a smooth scroll is a movement across the screen, which those users ask not to get).
- **Focus**: the focus goes to the top too, so that Tab and the reading of a screen reader go on from there, not from the bottom of the page where the link was (a scroll alone leaves the focus on the link). The element that takes it: `target` (a CSS selector: the main title, the main content, the skip link of the page); else the element of `id="top"`; else the main landmark (`main`, `role="main"`); else the first heading; else the body. An element that cannot take the focus (a `main`, a heading) gets `tabindex="-1"`, removed when it loses the focus: Tab does not stop on it later. The focus moves without scrolling to it (`preventScroll`): choose a target at the top of the page. The focus indicator of the theme shows on it after a key (`:focus-visible`). `backToTop` (`detail.target`) is emitted then.
- **Hidden**: before the threshold, the link is not shown, and it is not only transparent: `visibility: hidden` and `inert` take it out of the Tab order and of the accessibility tree. Once shown, it stays at the end of the Tab order of the page, where it is written (put the element at the end of the `body`). When it has the focus, it stays shown until it loses it, even above the threshold (a page scrolled up with the keys).
- **Threshold**: `threshold`, in px (`400`, `400px`) or in hundredths of the viewport height (`100vh`, the default: one screen; `50vh`), compared with the scroll of the page (`window.scrollY`), read once per animation frame with a passive `scroll` listener (and `resize`, for the `vh`), removed when the element leaves the document.
- **Target size**: 44 × 44 px in the default theme (WCAG 2.5.5, 2.5.8).
- **Forced colors**: the outline of the button, the arrow and the focus indicator show.

## Texts

`label` is the name of the link: `Back to top` by default, in English. Give it in the language of the page:

```html
<html lang="fr">
  …
  <ds-back-to-top label="Retour en haut de la page"></ds-back-to-top>
</html>
```

## Examples

```html
<!-- Shown after one screen; the focus to the element of id="top", else the main landmark, else the first heading -->
<ds-back-to-top></ds-back-to-top>

<!-- Shown after 600 px, the focus to the title of the page -->
<h1 id="page-title">Our products</h1>
…
<ds-back-to-top threshold="600" target="#page-title"></ds-back-to-top>

<!-- Shown after half a screen -->
<ds-back-to-top threshold="50vh"></ds-back-to-top>
```

**New**: `ds-back-to-top` is new.

<!-- Auto Generated Below -->


## Overview

A "Back to top" link, fixed in the bottom corner of the end side of the viewport, shown once the page is scrolled past
`threshold` (one viewport height by default). It is a native link to `#top`, which a browser follows by itself (the top
of the document); a click or Enter scrolls to the top (smoothly, at once with less motion) and moves the focus to the
`target` (else the `#top` element, the main landmark, the first heading, else the body), so that the keyboard and
screen readers go on from the top too, then emits `backToTop`.

Hidden, it is not rendered for the pointer, the keyboard or assistive technologies (`visibility: hidden`, `inert`), and
takes no room (fixed): the page does not move when it shows. It follows the scroll with a passive listener, read once
per animation frame, removed when it leaves the document.

## Properties

| Property    | Attribute   | Description                                                                                                                                                                                                                                                                                                                                                | Type                 | Default     |
| ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `label`     | `label`     | The name of the link (its text, hidden on the screen): `Back to top` by default. Give it in the language of the page.                                                                                                                                                                                                                                      | `string`             | `undefined` |
| `mods`      | `mods`      | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.                                                                                                                                                                                                                                                         | `string \| string[]` | `[]`        |
| `target`    | `target`    | The element that takes the focus after the scroll, a CSS selector (`#page-title`). Without it, or when it matches nothing: the `#top` element, else the main landmark, else the first heading, else the body. An element that cannot take the focus gets `tabindex="-1"` until it loses it. An id selector (`#page-title`) is also the `href` of the link. | `string`             | `undefined` |
| `threshold` | `threshold` | How far the page is scrolled before the link shows: a number of px (`400`, `400px`) or of hundredths of the viewport height (`100vh`, the default: one screen; `50vh`). Another value is the default.                                                                                                                                                      | `number \| string`   | `'100vh'`   |


## Events

| Event       | Description                                                                                                    | Type                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `backToTop` | Emitted once the link scrolled the page to the top and moved the focus (`detail.target`: the element focused). | `CustomEvent<{ target: HTMLElement; }>` |


## Methods

### `scrollToTop() => Promise<void>`

Scrolls to the top and moves the focus, as the link does.

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                                   | Description                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `--ds-back-to-top-background`          | Background of the link.                                                        |
| `--ds-back-to-top-color`               | Color of the arrow.                                                            |
| `--ds-back-to-top-hover-background`    | Background of the link under the pointer.                                      |
| `--ds-back-to-top-icon-size`           | Size of the arrow (its font size: the icon is a square of 1em).                |
| `--ds-back-to-top-offset`              | Distance from the bottom and end edges of the viewport (and their safe areas). |
| `--ds-back-to-top-radius`              | Corner radius of the link.                                                     |
| `--ds-back-to-top-shadow`              | Shadow of the link.                                                            |
| `--ds-back-to-top-size`                | Width and height of the link.                                                  |
| `--ds-back-to-top-transition-duration` | Duration of the fade in and out.                                               |
| `--ds-back-to-top-z-index`             | Stack level of the link, above the page.                                       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
