import type { Components, JSX } from "../dist/types/components";

interface DsTooltip extends Components.DsTooltip, HTMLElement {}
export const DsTooltip: {
  prototype: DsTooltip;
  new (): DsTooltip;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
