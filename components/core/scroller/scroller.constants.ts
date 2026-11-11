import { DSScrollerLabels } from './scroller.types';

/** The texts of ds-scroller (`labels`), in English by default. */
export const DSScrollerDefaultLabels: Required<DSScrollerLabels> = {
  previous: 'Previous items',
  next: 'Next items',
};

/** The orientations of ds-scroller. */
export const DS_SCROLLER_ORIENTATIONS = ['horizontal', 'vertical'] as const;
