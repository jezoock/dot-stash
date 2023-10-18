import type { Components, JSX } from "../dist/types/components";

interface DsHeader extends Components.DsHeader, HTMLElement {}
export const DsHeader: {
  prototype: DsHeader;
  new (): DsHeader;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
