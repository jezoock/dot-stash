# ds-app



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



### `getStylesJSON() => Promise<SassStyles>`



#### Returns

Type: `Promise<SassStyles>`



### `getSubscribers() => Promise<Element[]>`



#### Returns

Type: `Promise<Element[]>`



### `loadScript(scriptUrl: string, scriptId: string) => Promise<unknown>`



#### Returns

Type: `Promise<unknown>`



### `processBreakpoints(breakpoints: RawBreakpoint) => Promise<Breakpoints>`



#### Returns

Type: `Promise<Breakpoints>`



### `propGetClassList(mainClass: string | string[], mods?: string | string[]) => Promise<Record<string, boolean>>`

Generate an css class ready object

#### Returns

Type: `Promise<Record<string, boolean>>`

Record<string, boolean>

### `propToBool(prop: string | boolean) => Promise<boolean>`

Convert an HTML property to a boolean

#### Returns

Type: `Promise<boolean>`

boolean

### `propToFloat(prop: string | number) => Promise<number>`

Convert an HTML property to a float

#### Returns

Type: `Promise<number>`

number

### `propToJSON<T = string | Record<string, unknown> | unknown[]>(prop: T, rootKey?: string) => Promise<Record<string, unknown>>`

Convert an HTML property to JSON

#### Returns

Type: `Promise<Record<string, unknown>>`

string[]

### `propToNumber(prop: string | number) => Promise<number>`

Convert an HTML property to a number

#### Returns

Type: `Promise<number>`

number

### `propToStringArray<T = string>(prop: string | T[]) => Promise<T[]>`

Convert an HTML property ( coma separated string ) to an array

#### Returns

Type: `Promise<T[]>`

string[]

### `removeQuotes(quotedString: string) => Promise<string>`



#### Returns

Type: `Promise<string>`



### `subscribe(target: Element) => Promise<number>`



#### Returns

Type: `Promise<number>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
