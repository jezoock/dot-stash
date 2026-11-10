import { DSPaginationLabels } from './pagination.types';

/** The name of the navigation landmark of ds-pagination without `label`. */
export const DS_PAGINATION_DEFAULT_LABEL = 'Pagination';

/** The texts of ds-pagination (`labels`), in English by default. */
export const DSPaginationDefaultLabels: Required<DSPaginationLabels> = {
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
  page: 'Page {page}',
  status: 'Page {page} of {total}',
};

/** The pages shown on each side of the current one, without `siblings`. */
export const DS_PAGINATION_DEFAULT_SIBLINGS = 1;

/** The pages shown at each end of the list, without `boundaries`. */
export const DS_PAGINATION_DEFAULT_BOUNDARIES = 1;

/** The largest `siblings` and `boundaries`: a larger value counts as this one (a list of 43 items at most). */
export const DS_PAGINATION_MAX_RANGE = 10;

/** The breakpoint below which the pagination is compact, without `compact-below`. */
export const DS_PAGINATION_DEFAULT_COMPACT_BELOW = 'sm';

/**
 * The widths of the breakpoints of the engine (its defaults, in px), for `compact-below` without the theme stylesheet:
 * the theme gives them with its custom properties (`--ds-bp-sm`).
 */
export const DS_PAGINATION_BREAKPOINT_FALLBACKS: Record<string, number> = { xxs: 360, xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: 1600 };
