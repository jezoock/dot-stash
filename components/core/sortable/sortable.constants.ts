import { DSSortableLabels } from './sortable.types';

/** The texts of ds-sortable (`labels`), in English by default. */
export const DSSortableDefaultLabels: Required<DSSortableLabels> = {
  instructions: 'To move this item, press Space or Enter, then the arrow keys; press Space or Enter again to drop it, or Escape to cancel.',
  grabbed: '{label} picked up, position {index} of {count}.',
  moved: '{label} moved to position {index} of {count}.',
  dropped: '{label} dropped at position {index} of {count}.',
  cancelled: '{label} back to position {index} of {count}.',
  moveBefore: 'Move {label} before {other}',
  moveAfter: 'Move {label} after {other}',
};

/** The orientations of ds-sortable. */
export const DS_SORTABLE_ORIENTATIONS = ['vertical', 'horizontal'] as const;
