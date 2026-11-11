import { DS_SCROLLER_ORIENTATIONS } from './scroller.constants';

/** The texts of ds-scroller (its `labels` prop, JSON as an attribute), to translate them. */
export interface DSScrollerLabels {
  /** The name of the button that scrolls back by a page: `Previous items`. */
  previous?: string;
  /** The name of the button that scrolls forward by a page: `Next items`. */
  next?: string;
}

/** The direction ds-scroller scrolls in: `horizontal` (a row, by default) or `vertical` (a column). */
export type DSScrollerOrientation = (typeof DS_SCROLLER_ORIENTATIONS)[number];
