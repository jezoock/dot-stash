import type { Components, JSX } from "../dist/types/components";

interface DsControl extends Components.DsControl, HTMLElement {}
export const DsControl: {
  prototype: DsControl;
  new (): DsControl;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
