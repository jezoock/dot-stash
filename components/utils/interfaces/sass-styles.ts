/** A breakpoint and its limits in px: `[min, max]`, both included, or `[min]` for the last breakpoint (no maximum). */
export interface Breakpoint {
  label: string;
  limits: number[];
}

/** Breakpoint limits by label, as returned by `processBreakpoints`: `{ xxs: [0, 575], …, xxl: [1600] }`. */
export interface Breakpoints {
  [label: string]: number[];
}

/** Breakpoints as written by Sass: label: minimum width in px (`{ xxs: 360, xs: 576, … }`). */
export interface RawBreakpoint {
  [label: string]: number;
}

export interface SassStyles {
  breakpoints: RawBreakpoint;
}

/** The detail of the `breakpointChange` events of `ds-rsp`. */
export interface BreakpointChangeDetail {
  /** All the breakpoints, as returned by `processBreakpoints`. */
  all: Breakpoints;
  current: Breakpoint;
  /** The former breakpoint; `undefined` for the first event, when ds-rsp starts. */
  previous: Breakpoint | undefined;
  /** Whether the window grew, compared on the minimum widths; `false` for the first event. */
  isGrowing: boolean;
}
