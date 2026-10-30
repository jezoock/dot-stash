# ds-tooltip



<!-- Auto Generated Below -->


## Overview

Simple icon tooltip component

## Properties

| Property            | Attribute            | Description                                                                                        | Type                                                                                                                                                                                                                     | Default               |
| ------------------- | -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `containerSelector` | `container-selector` |                                                                                                    | `string`                                                                                                                                                                                                                 | `''`                  |
| `hasArrow`          | `has-arrow`          |                                                                                                    | `boolean`                                                                                                                                                                                                                | `true`                |
| `icon`              | `icon`               | Displayed tooltip icon                                                                             | `string`                                                                                                                                                                                                                 | `''`                  |
| `isActive`          | `is-active`          |                                                                                                    | `boolean`                                                                                                                                                                                                                | `true`                |
| `isDisabled`        | `disabled`           |                                                                                                    | `boolean`                                                                                                                                                                                                                | `false`               |
| `mode`              | `mode`               | Used for applying modifier on main container                                                       | `string`                                                                                                                                                                                                                 | `undefined`           |
| `mods`              | `mods`               | Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. | `string \| string[]`                                                                                                                                                                                                     | `[]`                  |
| `position`          | `position`           |                                                                                                    | `TooltipPosition.BOTTOM \| TooltipPosition.BOTTOM_LEFT \| TooltipPosition.BOTTOM_RIGHT \| TooltipPosition.LEFT \| TooltipPosition.RIGHT \| TooltipPosition.TOP \| TooltipPosition.TOP_LEFT \| TooltipPosition.TOP_RIGHT` | `TooltipPosition.TOP` |


## Slots

| Slot             | Description            |
| ---------------- | ---------------------- |
| `"content slot"` |                        |
| `"message"`      | slot to put message in |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
