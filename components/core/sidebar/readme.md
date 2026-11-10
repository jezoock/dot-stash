# ds-sidebar

## Styling

- **Classes**: `ds-sidebar` on `<ds-sidebar>`, `--shown` or `--hidden`, `--h-pos-<h-pos>` (`left` or `right`) and `--v-pos-<v-pos>` (`top` or `bottom`); `mods` → `--<mod>`.
- **Elements**: `__content` (the default slot).
- **Attributes** (reflected): `is-shown`, `h-pos`, `v-pos`, `ctx`, `mods`. The stylesheet slides the sidebar on `is-shown` and `h-pos`, which are set before the first render. The component also sets `role`, `aria-label` (`label`), `tabindex="-1"` and, while hidden, `inert` (see [Accessibility](#accessibility)).
- **Structure** (`sidebar.scss`): a fixed panel on its `h-pos` side, at its `v-pos` edge, as high as the screen (`show()` sets the height left below its top); its content scrolls, without scrolling the page at its end. Hidden, it is translated out of the screen on its side, then not rendered (`visibility: hidden`, at the end of the slide out: no shadow on the edge of the screen either); shown, it is visible at once. `show()` and `hide()` slide it in and out with a `transform` transition of `--ds-sidebar-transition-duration`, and emit `sidebarShown` / `sidebarHidden` on its `transitionend` event, or at once when it does not slide (a duration of 0), or once its duration is over when the event does not come. With less motion (`prefers-reduced-motion: reduce`), it shows and hides without sliding (no transition), and its visibility does not change (hidden, it is out of the screen and inert). Its width, maximum width and stack level are `--ds-sidebar-width`, `--ds-sidebar-max-width` and `--ds-sidebar-z-index`.
- **Look** (default theme, `components/_sidebar.scss`): a white panel with a shadow, as wide as the screen up to the `xxs` breakpoint, from the custom properties below, set on `ds-sidebar`. The padding, `--ds-sidebar-padding`, is on `__content`, inside its scrolling area, so that the focus indicator of the elements at its edges is not cut.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-sidebar {
  --ds-sidebar-max-width: 24rem;
  --ds-sidebar-background: var(--ds-color-gray-lightest);
}

#cart {
  --ds-sidebar-width: 32rem;
  --ds-sidebar-max-width: 100%;
}
```

## Accessibility

The sidebar is not modal: no backdrop, the page stays usable while it is shown, Tab goes on from its last element to the page. It is a landmark, which shows and hides.

- **Role and name**: `role="complementary"` (a landmark), or the `role` the `<ds-sidebar>` element already has (`role="navigation"` for a menu). Name it with `label` (`aria-label`), which tells it from the other landmarks: "Cart", "Main menu". It has `tabindex="-1"`, to take the focus from a script when it has no focusable element.
- **Hidden**: `inert` at once (out of the Tab order, of the accessibility tree and of the pointer, also while it slides out), then `visibility: hidden` at the end of the slide (with less motion, `inert` only): the focus cannot land in a hidden sidebar.
- **Focus**: `show()` (and `toggle()`) moves the focus into the sidebar, without scrolling the page: to its first element with an `autofocus` attribute, else to its first focusable element, else to the sidebar itself. `hide()` gives the focus back to the element that had it before `show()` (the button that opened it), when the focus is still in the sidebar. A sidebar rendered shown (`is-shown` in the HTML) does not take the focus.
- **Keyboard**: Escape hides the sidebar while the focus is in it (one per key press); the key press goes no further. In a modal or a tooltip in the sidebar, Escape closes them first.

```html
<button type="button" onclick="document.querySelector('#cart').show()">Cart</button>

<ds-sidebar id="cart" h-pos="right" label="Cart">
  <button type="button" onclick="this.closest('ds-sidebar').hide()">Close</button>
  <a href="/checkout">Checkout</a>
</ds-sidebar>

<ds-sidebar role="navigation" label="Main menu">…</ds-sidebar>
```

**Changed**: `label`, the role, `inert`, the focus management and Escape are new; a hidden sidebar is `visibility: hidden` once it has slid out; the default theme puts the padding on `__content`.

<!-- Auto Generated Below -->


## Overview

A panel fixed on a side of the screen, that slides in (`show()`) and out (`hide()`). Not modal: the page stays usable
while it is shown. It is a `complementary` landmark (or the `role` its element has, such as `navigation`), named by
`label` (`aria-label`). Hidden, it is inert: its content is neither focusable nor read by screen readers. `show()`
moves the focus into it (its first element with `autofocus`, else its first focusable element, else the sidebar
itself); Escape hides it while the focus is in it; `hide()` gives the focus back to the element that had it before.

## Properties

| Property  | Attribute  | Description                                                                                             | Type                 | Default                 |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------- |
| `ctx`     | `ctx`      |                                                                                                         | `boolean`            | `true`                  |
| `hPos`    | `h-pos`    |                                                                                                         | `"left" \| "right"`  | `SIDEBAR_POSITION.LEFT` |
| `isShown` | `is-shown` |                                                                                                         | `boolean`            | `false`                 |
| `label`   | `label`    | The accessible name of the sidebar (`aria-label`), which tells it from the other landmarks of the page. | `string`             | `undefined`             |
| `mods`    | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component.      | `string \| string[]` | `[]`                    |
| `vPos`    | `v-pos`    |                                                                                                         | `"bottom" \| "top"`  | `SIDEBAR_POSITION.TOP`  |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `sidebarHidden` |             | `CustomEvent<any>` |
| `sidebarHide`   |             | `CustomEvent<any>` |
| `sidebarShow`   |             | `CustomEvent<any>` |
| `sidebarShown`  |             | `CustomEvent<any>` |


## Methods

### `hide() => Promise<void>`

Hide the sidebar (nothing happens when it is already hidden), and give the focus back to the element that had it
before `show()`, when the focus is in the sidebar

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Show the sidebar (nothing happens when it is already shown), and move the focus into it

#### Returns

Type: `Promise<void>`



### `toggle(mustShow?: boolean) => Promise<void>`

Toggle the sidebar display

#### Parameters

| Name       | Type      | Description                                                                                     |
| ---------- | --------- | ----------------------------------------------------------------------------------------------- |
| `mustShow` | `boolean` | Used to specify wether the sidebar must be shown or hidden; without it, the display is switched |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description                                                         |
| ---- | ------------------------------------------------------------------- |
|      | The content of the sidebar, in its scrolling content (`__content`). |


## CSS Custom Properties

| Name                               | Description                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `--ds-sidebar-background`          | Background of the sidebar.                                                                    |
| `--ds-sidebar-max-width`           | Maximum width of the sidebar.                                                                 |
| `--ds-sidebar-padding`             | Padding of the sidebar, inside its scrolling content.                                         |
| `--ds-sidebar-shadow`              | Shadow of the sidebar.                                                                        |
| `--ds-sidebar-transition-duration` | Duration of the slide in and out (`sidebarShown` and `sidebarHidden` are emitted at its end). |
| `--ds-sidebar-width`               | Width of the sidebar.                                                                         |
| `--ds-sidebar-z-index`             | Stack level of the sidebar.                                                                   |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
