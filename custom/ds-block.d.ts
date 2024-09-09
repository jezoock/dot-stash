import type { Components, JSX } from "../dist/types/components";

interface DsBlock extends Components.DsBlock, HTMLElement {}
export const DsBlock: {
  prototype: DsBlock;
  new (): DsBlock;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
