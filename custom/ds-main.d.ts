import type { Components, JSX } from "../dist/types/components";

interface DsMain extends Components.DsMain, HTMLElement {}
export const DsMain: {
  prototype: DsMain;
  new (): DsMain;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
