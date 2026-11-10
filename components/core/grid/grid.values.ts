import { toFloat, toNumber } from '../../utils/props';

/**
 * The values ds-grid and ds-grid-item write in their custom properties, from their props (attributes are strings, the
 * per-breakpoint params of ds-rsp can be numbers).
 */

const UNITLESS_NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

/** The number of columns of `cols`: a whole number from 1 (`'3'`, `3`; `'2.5'` is 2), else 1. */
export const toColumnCount = (cols: string | number): number => {
  const count = toNumber(cols);
  return Number.isFinite(count) && count >= 1 ? count : 1;
};

/** The number of columns of an item `width`: a whole number from 1, rounded (`1.5` is 2), else 1. */
export const toSpan = (width: string | number): number => {
  const span = Math.round(toFloat(width));
  return Number.isFinite(span) && span >= 1 ? span : 1;
};

/**
 * A gap as a CSS length: the value as written (`20px`, `1rem`, `5%`, `calc(…)`), a unitless number in px (`'0'` is
 * `0px`, `10` is `10px`), `0px` without a value. A length, so that the gap can be computed with (`calc()`).
 */
export const toGap = (gap: string | number): string => {
  const value = String(gap ?? '').trim();
  if (value === '') {
    return '0px';
  }
  return UNITLESS_NUMBER.test(value) ? `${Number(value)}px` : value;
};

/** A ratio (height / width) greater than 0 (`'0.75'`, `1`), else `undefined`: no ratio. */
export const toRatio = (ratio: string | number): number | undefined => {
  const value = toFloat(ratio);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};
