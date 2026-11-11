/**
 * The texts of ds-range (its `labels` prop, JSON as an attribute), to translate them.
 */
export interface DSRangeLabels {
  /**
   * The text of the value read by assistive technologies (`aria-valuetext` of the input), from a template: `{value}`,
   * `{min}`, `{max}` and `{percent}` (the share of the range, rounded) are replaced. Empty by default: no
   * `aria-valuetext`, the browser reads the value. `"{value} %"`, `"{percent}% loaded"`, `"Volume {value} of {max}"`.
   */
  valueText?: string;
}

/** The values a `formatter` of ds-range gets: the value of the input, its minimum and maximum, the share of the range in %. */
export interface DSRangeValue {
  value: number;
  min: number;
  max: number;
  percent: number;
}

/**
 * Gives the text of the value read by assistive technologies (`aria-valuetext`), instead of the `valueText` template: a
 * time (`1:23 of 45:00`), a unit, a word. An empty string: no `aria-valuetext`.
 */
export type DSRangeFormatter = (value: DSRangeValue) => string;
