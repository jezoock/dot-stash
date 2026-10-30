# ds-rsp



<!-- Auto Generated Below -->


## Overview

Tracks the theme breakpoints and, when the breakpoint changes, sets on the elements with a `data-use-rsp`
attribute the properties their `data-rsp` attribute declares for it (see the README).
Subscribers added later (`subscribe()`, or inserted in the document) get the params of the current breakpoint at once.
Without breakpoints (theme stylesheet not loaded and no `breakpoints` property) it only logs a warning.

## Properties

| Property              | Attribute             | Description                                                                                                                                                          | Type                      | Default                                 |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------- |
| `breakpointsFromProp` | `breakpoints`         | Breakpoints to use instead of the theme ones, as Sass writes them: label: minimum width in px. As an attribute, a JSON string: `breakpoints='{"sm": 0, "lg": 992}'`. | `RawBreakpoint \| string` | `undefined`                             |
| `debounceDelay`       | `debounce-delay`      |                                                                                                                                                                      | `number`                  | `500`                                   |
| `propertyName`        | `property-name`       |                                                                                                                                                                      | `string`                  | `'data-rsp'`                            |
| `subscriberSelector`  | `subscriber-selector` |                                                                                                                                                                      | `string`                  | `'[data-use-rsp]:not([data-rsp-init])'` |


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



### `subscribe(target: Element) => Promise<void>`

Adds a subscriber. Once ds-rsp has started, the element gets the params of the current breakpoint at once
(before, when ds-rsp starts).

#### Parameters

| Name     | Type      | Description |
| -------- | --------- | ----------- |
| `target` | `Element` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ds-main](../../demo)

### Graph
```mermaid
graph TD;
  ds-main --> ds-rsp
  style ds-rsp fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
