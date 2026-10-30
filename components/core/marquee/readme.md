# ds-marquee



<!-- Auto Generated Below -->


## Overview

Scrolling messages. The `--transition-<DSMarqueeTransitionEnum>` class names the transition
(`slide-rtl` by default); the messages scroll to the left at `speed` (see `start()`).

## Properties

| Property       | Attribute        | Description                                                                                         | Type                 | Default                             |
| -------------- | ---------------- | --------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------- |
| `bgColor`      | `bg-color`       |                                                                                                     | `string`             | `undefined`                         |
| `color`        | `color`          |                                                                                                     | `string`             | `undefined`                         |
| `mods`         | `mods`           |                                                                                                     | `string \| string[]` | `[]`                                |
| `pauseOnHover` | `pause-on-hover` |                                                                                                     | `boolean \| string`  | `false`                             |
| `speed`        | `speed`          | Scrolling speed: `speed / 10` px every 4 ms (10 = 250 px/s); `0` does not scroll.                   | `number \| string`   | `10`                                |
| `transition`   | `transition`     | Transition class (`DSMarqueeTransitionEnum`): `slide-ttb`, `slide-btt`, `slide-ltr` or `slide-rtl`. | `string`             | `DSMarqueeDefaultParams.transition` |


## Methods

### `start() => Promise<void>`

Starts scrolling the messages to the left, from the beginning (a running animation is replaced).
The offset grows by `speed / 10` px every 4 ms: the pace of the former `setInterval(…, 0)`, which browsers
run every 4 ms; it is now computed on animation frames, which follow the display and stop in background tabs.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
