export type DSGridAlignment = 'start' | 'center' | 'end';
export type DSGridType = 'fixed' | 'fluid';

export interface DSGridItemStyles {
  width?: string;
  paddingBlockStart?: string;
  paddingInlineEnd?: string;
  paddingBlockEnd?: string;
  paddingInlineStart?: string;
}

export interface DSGridParams {
  type: DSGridType;
  cols: number;
  hGap: string;
  vGap: string;
  align: DSGridAlignment;
  vAlign: DSGridAlignment;
  cellRatio?: number;
}
