import type { Components, JSX } from "../dist/types/components";

interface DsToggler extends Components.DsToggler, HTMLElement {}
export const DsToggler: {
  prototype: DsToggler;
  new (): DsToggler;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
