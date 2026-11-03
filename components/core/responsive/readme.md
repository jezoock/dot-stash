# ds-rsp

## Styling

`<ds-rsp>` renders nothing: an empty element, without class, stylesheet or custom property. It reads the breakpoints of the theme from its `--ds-bp-*` tokens (see [Breakpoints shared with JavaScript](../../../README.md#breakpoints-shared-with-javascript)), or from its `breakpoints` attribute.

<!-- Auto Generated Below -->


## Overview

Tracks the theme breakpoints and, when the breakpoint changes, sets on the elements with a `data-use-rsp`
attribute the properties their `data-rsp` attribute declares for it (see the README).
Subscribers added later (`subscribe()`, or inserted in the document) get the params of the current breakpoint at once.
The theme breakpoints are its `--ds-bp-labels` and `--ds-bp-<label>` custom properties (`tokens.getBreakpoints()`).
Without breakpoints (theme stylesheet not loaded and no `breakpoints` property) it only logs a warning, and starts
when `refresh()` finds some: ds-rsp calls it when a stylesheet `<link>` loads.

## Properties

| Property              | Attribute             | Description                                                                                                                                                                               | Type                      | Default                                 |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------- |
| `breakpointsFromProp` | `breakpoints`         | Breakpoints to use instead of the theme ones: label: minimum width in px. As an attribute, a JSON string: `breakpoints='{"sm": 0, "lg": 992}'`. A new value is applied as by `refresh()`. | `RawBreakpoint \| string` | `undefined`                             |
| `debounceDelay`       | `debounce-delay`      |                                                                                                                                                                                           | `number`                  | `500`                                   |
| `propertyName`        | `property-name`       |                                                                                                                                                                                           | `string`                  | `'data-rsp'`                            |
| `subscriberSelector`  | `subscriber-selector` |                                                                                                                                                                                           | `string`                  | `'[data-use-rsp]:not([data-rsp-init])'` |


## Events

| Event              | Description                                                                                                                                                                                                                                                                                                            | Type                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `breakpointChange` | Emitted by ds-rsp when the breakpoint changes (and when it starts), once the subscribers have their params. It bubbles. Each subscriber also receives a `breakpointChange` event on itself, which does not bubble: a subscriber that contains ds-rsp gets both, and should only handle the one whose target is itself. | `CustomEvent<BreakpointChangeDetail>` |


## Methods

### `getBreakpoint(rawBreakpoints: { [label: string]: number[]; }) => Promise<Breakpoint>`

Get the current breakpoint

#### Parameters

| Name             | Type                             | Description                             |
| ---------------- | -------------------------------- | --------------------------------------- |
| `rawBreakpoints` | `{ [label: string]: number[]; }` | JSON Object containings all breakpoints |

#### Returns

Type: `Promise<Breakpoint>`

current breakpoint ( label & limits )

### `getBreakpoints() => Promise<Breakpoints>`

The theme breakpoints (`tokens.getBreakpoints()`), as limits: `{ xxs: [0, 575], …, xxl: [1600] }`; `{}` without the theme.

#### Returns

Type: `Promise<Breakpoints>`



### `getCurrentBreakpoint() => Promise<Breakpoint>`



#### Returns

Type: `Promise<Breakpoint>`



### `getData() => Promise<{ breakpoints: Breakpoints; }>`



#### Returns

Type: `Promise<{ breakpoints: Breakpoints; }>`



### `getParamsForBreakpoint(currentBreakpoint: Breakpoint, params: { [breakpointLabel: string]: Record<string, unknown>; }) => Promise<Record<string, unknown>>`



#### Parameters

| Name                | Type                                                      | Description |
| ------------------- | --------------------------------------------------------- | ----------- |
| `currentBreakpoint` | `Breakpoint`                                              |             |
| `params`            | `{ [breakpointLabel: string]: Record<string, unknown>; }` |             |

#### Returns

Type: `Promise<Record<string, unknown>>`



### `getSubscribers() => Promise<Element[]>`



#### Returns

Type: `Promise<Element[]>`



### `processBreakpoints(breakpoints: RawBreakpoint) => Promise<Breakpoints>`



#### Parameters

| Name          | Type            | Description |
| ------------- | --------------- | ----------- |
| `breakpoints` | `RawBreakpoint` |             |

#### Returns

Type: `Promise<Breakpoints>`



### `refresh() => Promise<void>`

Reads the breakpoints again (from the `breakpoints` property, else from the theme custom properties) and applies them:
subscribes the matching elements not subscribed yet, sets the params of the current breakpoint on every subscriber
again, and emits `breakpointChange` only when the label or the limits of the current breakpoint changed.
Without breakpoints until then (theme stylesheet loaded after ds-rsp), it starts, as when the theme is there at load.
When it finds none, it keeps the current ones (if any) and logs a warning, once until it finds some again.

ds-rsp calls it when a stylesheet `<link>` of the document loads (a theme added, or its `href` changed). Call it after
changing the theme otherwise: a `<style>` element, a constructed stylesheet, a `media` attribute changed after the load…
Before ds-rsp has loaded, it does nothing: ds-rsp reads the breakpoints when it loads.

#### Returns

Type: `Promise<void>`



### `subscribe(target: Element) => Promise<void>`

Adds a subscriber. Once ds-rsp has started, the element gets the params of the current breakpoint at once
(before, when ds-rsp starts).

#### Parameters

| Name     | Type      | Description |
| -------- | --------- | ----------- |
| `target` | `Element` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
