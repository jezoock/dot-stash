# ds-panel

## Styling

- **Classes**: `ds-panel` on `<ds-panel>`, and `--tab` or `--collapsible` (`type`, which `ds-panel-group` sets); `mods` → `--<mod>`.
- **Elements**: `__title` (slot `title`: a click expands the panel), and `__content`, which holds `__content-wrapper` (the default slot; `min-height` sets its minimum height).
- **Attributes** (reflected): `expanded`, `type`, `index`, `mods`.
- **Structure** (`panel.scss`): a tab has `display: contents`, so that its title and content are items of the row of its `ds-panel-group`: the titles first, the contents below them at full width. The content of a tab that is not expanded is transparent, under the expanded one, and does not take the pointer; the expanded one fades in. The content of a collapsible panel collapses to a height of 0 (a grid row from `0fr` to `1fr`). Both transitions last `--ds-panel-transition-duration`.
- **Look** (default theme, `components/_panel.scss`): the title (padding, title font, a chevron on a collapsible panel, turned when expanded), the space below the content, the line under a collapsible panel or a tab title, and the colors of the tabs, from the custom properties below, set on `ds-panel`.

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

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                                        | Type                     | Default     |
| ----------- | ------------ | -------------------------------------------------------------------------------------------------- | ------------------------ | ----------- |
| `expanded`  | `expanded`   |                                                                                                    | `boolean`                | `false`     |
| `index`     | `index`      |                                                                                                    | `number`                 | `undefined` |
| `minHeight` | `min-height` |                                                                                                    | `string`                 | `'0'`       |
| `mods`      | `mods`       | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]`     | `[]`        |
| `type`      | `type`       |                                                                                                    | `"collapsible" \| "tab"` | `'tab'`     |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `panelHidden` |             | `CustomEvent<any>` |
| `panelHide`   |             | `CustomEvent<any>` |
| `panelShow`   |             | `CustomEvent<any>` |
| `panelShown`  |             | `CustomEvent<any>` |


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

| Slot      | Description      |
| --------- | ---------------- |
|           | The default slot |
| `"title"` |                  |


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
