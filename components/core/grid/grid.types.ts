export type DSGridAlignment = 'start' | 'center' | 'end';
export type DSGridType = 'fixed' | 'fluid';

/**
 * Inline styles for `ds-grid-item`'s `setStyles()`.
 * @deprecated ds-grid lays its items out with CSS Grid: it no longer computes their widths and paddings.
 */
export interface DSGridItemStyles {
  width?: string;
  paddingBlockStart?: string;
  paddingInlineEnd?: string;
  paddingBlockEnd?: string;
  paddingInlineStart?: string;
}
