import { PluralLabel } from '../../utils/labels';

/** An item of the list of pages: a page (its number), or an ellipsis for the pages it leaves out, before or after the current one. */
export type DSPaginationItem = { type: 'page'; page: number } | { type: 'ellipsis'; position: 'start' | 'end' };

/** The controls around the list of pages. */
export type DSPaginationControl = 'first' | 'previous' | 'next' | 'last';

/** The numbers of a pagination, as it renders them: whole, in range. */
export interface DSPaginationState {
  /** The number of pages, 0 or more. */
  total: number;
  /** The current page, from 1 to `total` (0 without pages). */
  current: number;
  /** The pages shown on each side of the current one. */
  siblings: number;
  /** The pages shown at each end of the list. */
  boundaries: number;
}

/** The detail of `pageChange`: the page asked for, and the page that was current. */
export interface DSPaginationChangeDetail {
  page: number;
  previous: number;
}

/** The texts of ds-pagination (its `labels` prop), to translate them. The name of the landmark is its `label` prop. */
export interface DSPaginationLabels {
  /** The name of the control of the first page (`first-last`): `First page`. */
  first?: string;
  /** The name of the control of the previous page: `Previous page`. */
  previous?: string;
  /** The name of the control of the next page: `Next page`. */
  next?: string;
  /** The name of the control of the last page (`first-last`): `Last page`. */
  last?: string;
  /** The name of the control of a page, which shows its number: `Page {page}`. */
  page?: string;
  /**
   * The text of the compact layout, between the previous and next controls: `Page {page} of {total}`. One template, or one
   * per plural category of the number of pages, `{total}` (also `{count}`), in the language of the page.
   */
  status?: PluralLabel;
}
