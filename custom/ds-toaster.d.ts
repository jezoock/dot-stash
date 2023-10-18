import type { Components, JSX } from "../dist/types/components";

interface DsToaster extends Components.DsToaster, HTMLElement {}
export const DsToaster: {
  prototype: DsToaster;
  new (): DsToaster;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
