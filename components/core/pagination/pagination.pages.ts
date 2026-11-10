import { DS_PAGINATION_DEFAULT_BOUNDARIES, DS_PAGINATION_DEFAULT_SIBLINGS, DS_PAGINATION_MAX_RANGE } from './pagination.constants';
import { DSPaginationItem, DSPaginationState } from './pagination.types';

/** A whole number of a prop given as an attribute or a property (`'3'`, `3.7`: 3), else `fallback`. */
const toWhole = (value: unknown, fallback: number): number => {
  const number = typeof value === 'string' && value.trim() === '' ? NaN : Number(value);
  return value !== null && Number.isFinite(number) ? Math.floor(number) : fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * The numbers of a pagination from its props, as it renders them: `total` a whole number from 0 (0 when it is not a
 * number), at most `Number.MAX_SAFE_INTEGER`; `current` from 1 to `total` (1 when it is not a number; 0 without pages);
 * `siblings` and `boundaries` from 0 to `DS_PAGINATION_MAX_RANGE` (1 when they are not numbers).
 */
export const getPaginationState = (props: { total?: unknown; current?: unknown; siblings?: unknown; boundaries?: unknown }): DSPaginationState => {
  const total = clamp(toWhole(props.total, 0), 0, Number.MAX_SAFE_INTEGER);

  return {
    total,
    current: total === 0 ? 0 : clamp(toWhole(props.current, 1), 1, total),
    siblings: clamp(toWhole(props.siblings, DS_PAGINATION_DEFAULT_SIBLINGS), 0, DS_PAGINATION_MAX_RANGE),
    boundaries: clamp(toWhole(props.boundaries, DS_PAGINATION_DEFAULT_BOUNDARIES), 0, DS_PAGINATION_MAX_RANGE),
  };
};

/** The pages from `start` to `end`, both included. */
const pages = (start: number, end: number): DSPaginationItem[] => Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => ({ type: 'page', page: start + index }));

/**
 * The items of the list of pages: the `boundaries` first and last pages, the current page and its `siblings` on each side,
 * and an ellipsis for each run of pages left out between them. The list has always the same number of items,
 * `2 × boundaries + 2 × siblings + 3` (or `total`, when there are not more pages), whatever the current page: the
 * controls do not move as the user goes through the pages. An ellipsis always stands for 2 pages at least: a single page
 * left out is shown instead.
 *
 * `getPaginationItems({ total: 10, current: 5, siblings: 1, boundaries: 1 })`: 1 … 4 5 6 … 10.
 */
export const getPaginationItems = ({ total, current, siblings, boundaries }: DSPaginationState): DSPaginationItem[] => {
  const length = 2 * boundaries + 2 * siblings + 3;

  if (total <= length) {
    return pages(1, total);
  }

  // The run of the current page and its siblings, kept away from the ends so that the list keeps its length: its first
  // page after the first boundaries and the slot of an ellipsis, its last one before the slot of an ellipsis and the last
  // boundaries.
  const start = Math.max(Math.min(current - siblings, total - boundaries - 2 * siblings - 1), boundaries + 2);
  const end = Math.min(Math.max(current + siblings, boundaries + 2 * siblings + 2), total - boundaries - 1);

  return [
    ...pages(1, boundaries),
    start > boundaries + 2 ? { type: 'ellipsis', position: 'start' } : { type: 'page', page: boundaries + 1 },
    ...pages(start, end),
    end < total - boundaries - 1 ? { type: 'ellipsis', position: 'end' } : { type: 'page', page: total - boundaries },
    ...pages(total - boundaries + 1, total),
  ];
};
