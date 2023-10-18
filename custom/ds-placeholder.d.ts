import type { Components, JSX } from "../dist/types/components";

interface DsPlaceholder extends Components.DsPlaceholder, HTMLElement {}
export const DsPlaceholder: {
  prototype: DsPlaceholder;
  new (): DsPlaceholder;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
