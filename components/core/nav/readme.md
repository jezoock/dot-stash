# ds-nav-menu

## Styling

- **Classes**: `<ds-nav>` renders a `div` with the main class, `ds-nav`, and its modifiers; the default slot holds the `ds-nav-item` elements.
- **Modifiers**: `mods` → `--<mod>`. The default theme reads `--main`: from the `md` breakpoint, the items of a main navigation are in a row.
- **Structure** (`nav.scss`): none, the wrapper has no layout of its own. The row of a main navigation depends on the breakpoints, which the component stylesheets cannot read: it is in the theme (`components/_nav.scss`).
- **Look** (default theme): the space between the items of a main navigation, `--ds-nav-gap`, set on `ds-nav`. The items are styled by the `--ds-nav-item-*` properties (see `ds-nav-item`).

Override it after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-nav {
  --ds-nav-gap: var(--ds-space-4);
}
```

<!-- Auto Generated Below -->


## Properties

| Property              | Attribute                | Description                                                                                        | Type                 | Default     |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `currentActiveItemId` | `current-active-item-id` |                                                                                                    | `string`             | `undefined` |
| `mods`                | `mods`                   | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]` | `[]`        |


## CSS Custom Properties

| Name           | Description                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `--ds-nav-gap` | Space between the items of a `main` navigation, from the `md` breakpoint (where they are in a row). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
