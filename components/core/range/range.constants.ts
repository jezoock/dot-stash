import { DSRangeLabels } from './range.types';

/** The texts of ds-range (`labels`), in English by default: no value text, the browser reads the value. */
export const DSRangeDefaultLabels: Required<DSRangeLabels> = {
  valueText: '',
};

/** The attributes of the input that ds-range follows (set by a script or by the page). */
export const DS_RANGE_OBSERVED_ATTRIBUTES = ['min', 'max', 'step', 'value', 'disabled', 'type'];
