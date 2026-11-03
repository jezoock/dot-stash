# ds-sidebar

## Styling

- **Classes**: `ds-sidebar` on `<ds-sidebar>`, `--shown` or `--hidden`, `--h-pos-<h-pos>` (`left` or `right`) and `--v-pos-<v-pos>` (`top` or `bottom`); `mods` → `--<mod>`.
- **Elements**: `__content` (the default slot).
- **Attributes** (reflected): `is-shown`, `h-pos`, `v-pos`, `ctx`, `mods`. The stylesheet slides the sidebar on `is-shown` and `h-pos`, which are set before the first render.
- **Structure** (`sidebar.scss`): a fixed panel on its `h-pos` side, at its `v-pos` edge, as high as the screen (`show()` sets the height left below its top); its content scrolls, without scrolling the page at its end. Hidden, it is translated out of the screen on its side; `show()` and `hide()` slide it in and out with a `transform` transition of `--ds-sidebar-transition-duration`, and emit `sidebarShown` / `sidebarHidden` on its `transitionend` event: keep it above 0. Its width, maximum width and stack level are `--ds-sidebar-width`, `--ds-sidebar-max-width` and `--ds-sidebar-z-index`.
- **Look** (default theme, `components/_sidebar.scss`): a white panel with a shadow, as wide as the screen up to the `xxs` breakpoint, from the custom properties below, set on `ds-sidebar`.

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

<!-- Auto Generated Below -->


## Properties

| Property  | Attribute  | Description                                                                                        | Type                 | Default                 |
| --------- | ---------- | -------------------------------------------------------------------------------------------------- | -------------------- | ----------------------- |
| `ctx`     | `ctx`      |                                                                                                    | `boolean`            | `true`                  |
| `hPos`    | `h-pos`    |                                                                                                    | `"left" \| "right"`  | `SIDEBAR_POSITION.LEFT` |
| `isShown` | `is-shown` |                                                                                                    | `boolean`            | `false`                 |
| `mods`    | `mods`     | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`                    |
| `vPos`    | `v-pos`    |                                                                                                    | `"bottom" \| "top"`  | `SIDEBAR_POSITION.TOP`  |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `sidebarHidden` |             | `CustomEvent<any>` |
| `sidebarHide`   |             | `CustomEvent<any>` |
| `sidebarShow`   |             | `CustomEvent<any>` |
| `sidebarShown`  |             | `CustomEvent<any>` |


## Methods

### `hide() => Promise<void>`

Hide the sidebar (nothing happens when it is already hidden)

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Show the sidebar (nothing happens when it is already shown)

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

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


## CSS Custom Properties

| Name                               | Description                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `--ds-sidebar-background`          | Background of the sidebar.                                                                    |
| `--ds-sidebar-max-width`           | Maximum width of the sidebar.                                                                 |
| `--ds-sidebar-padding`             | Padding of the sidebar.                                                                       |
| `--ds-sidebar-shadow`              | Shadow of the sidebar.                                                                        |
| `--ds-sidebar-transition-duration` | Duration of the slide in and out (`sidebarShown` and `sidebarHidden` are emitted at its end). |
| `--ds-sidebar-width`               | Width of the sidebar.                                                                         |
| `--ds-sidebar-z-index`             | Stack level of the sidebar.                                                                   |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
