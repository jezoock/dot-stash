export interface Breakpoint {
  label: string;
  limits: number[];
}

export interface Breakpoints {
  [label: string]: number[];
}

export interface RawBreakpoint {
  [label: string]: number;
}

export interface SassStyles {
  breakpoints: RawBreakpoint;
}
