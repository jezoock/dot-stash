import type { Components, JSX } from "../dist/types/components";

interface DsNavMenuItem extends Components.DsNavMenuItem, HTMLElement {}
export const DsNavMenuItem: {
  prototype: DsNavMenuItem;
  new (): DsNavMenuItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
