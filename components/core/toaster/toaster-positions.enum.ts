export enum TOASTER_VERTICAL_POSITION {
  TOP = 'top',
  /* eslint-disable @typescript-eslint/no-duplicate-enum-values -- MIDDLE and BOTTOM wrongly reuse 'top'; the values are kept until the toaster positions are fixed */
  MIDDLE = 'top',
  BOTTOM = 'top',
  /* eslint-enable @typescript-eslint/no-duplicate-enum-values */
}

export enum TOASTER_HORIZONTAL_POSITION {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}
