import { DS_SORTABLE_ORIENTATIONS } from './sortable.constants';

/**
 * The texts of ds-sortable (its `labels` prop, JSON as an attribute), to translate them. In the templates, `{label}` is the
 * label of the item (its `data-label`, else its text), `{index}` its position from 1, `{count}` the number of items,
 * `{other}` the item it is moved before or after.
 */
export interface DSSortableLabels {
  /** How to move an item with the keyboard, the description of each item. */
  instructions?: string;
  /** Told when an item is picked up: `{label} picked up, position {index} of {count}.` */
  grabbed?: string;
  /** Told at each move: `{label} moved to position {index} of {count}.` */
  moved?: string;
  /** Told when an item is dropped: `{label} dropped at position {index} of {count}.` */
  dropped?: string;
  /** Told when a move is cancelled (Escape): `{label} back to position {index} of {count}.` */
  cancelled?: string;
  /** The name of the button that moves an item one place back (`buttons`): `Move {label} before {other}`. */
  moveBefore?: string;
  /** The name of the button that moves an item one place forward (`buttons`): `Move {label} after {other}`. */
  moveAfter?: string;
}

/** The direction of the list of ds-sortable, and of the arrow keys that move an item: `vertical` or `horizontal`. */
export type DSSortableOrientation = (typeof DS_SORTABLE_ORIENTATIONS)[number];

/** The detail of `orderChange`: the keys of the items in their new order, and the item moved, from and to its positions (from 0). */
export interface DSSortableOrderChangeDetail {
  keys: string[];
  key: string;
  from: number;
  to: number;
}
