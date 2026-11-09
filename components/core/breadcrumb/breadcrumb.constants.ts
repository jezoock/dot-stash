import { DSBreadcrumbLabels } from './breadcrumb.types';

/** The name of the navigation landmark of ds-breadcrumb without `label`. */
export const DS_BREADCRUMB_DEFAULT_LABEL = 'Breadcrumb';

/** The texts of ds-breadcrumb (`labels`), in English by default. */
export const DSBreadcrumbDefaultLabels: Required<DSBreadcrumbLabels> = {
  expand: 'Show full path',
};

/** The number of items a collapsed trail shows at its end, for `collapse` without a number (`<ds-breadcrumb collapse>`). */
export const DS_BREADCRUMB_DEFAULT_COLLAPSE = 2;

/**
 * The fewest items a collapsed trail hides behind its button: a button in place of one item would save no room, and would
 * add a step to reach it.
 */
export const DS_BREADCRUMB_MIN_HIDDEN = 2;
