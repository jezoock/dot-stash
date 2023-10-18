import type { Components, JSX } from "../dist/types/components";

interface DsRsp extends Components.DsRsp, HTMLElement {}
export const DsRsp: {
  prototype: DsRsp;
  new (): DsRsp;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
