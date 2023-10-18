# ds-rsp



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute             | Description | Type                       | Default                                 |
| --------------------- | --------------------- | ----------- | -------------------------- | --------------------------------------- |
| `breakpointsFromProp` | --                    |             | `{ [x: string]: number; }` | `undefined`                             |
| `debounceDelay`       | `debounce-delay`      |             | `number`                   | `500`                                   |
| `propertyName`        | `property-name`       |             | `string`                   | `'data-rsp'`                            |
| `subscriberSelector`  | `subscriber-selector` |             | `string`                   | `'[data-use-rsp]:not([data-rsp-init])'` |


## Events

| Event              | Description | Type               |
| ------------------ | ----------- | ------------------ |
| `breakpointChange` |             | `CustomEvent<any>` |


## Methods

### `getBreakpoint(rawBreakpoints: { [label: string]: number[]; }) => Promise<Breakpoint>`

Get the current breakpoint

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



### `getParamsForBreakpoint<T>(currentBreakpoint: Breakpoint, params: { [breakpointLabel: string]: T; }) => Promise<T>`



#### Returns

Type: `Promise<T>`



### `getSubscribers() => Promise<Element[]>`



#### Returns

Type: `Promise<Element[]>`



### `processBreakpoints(breakpoints: RawBreakpoint) => Promise<Breakpoints>`



#### Returns

Type: `Promise<Breakpoints>`



### `subscribe(target: Element) => Promise<number>`



#### Returns

Type: `Promise<number>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
