import type { Components, JSX } from "../dist/types/components";

interface DsNavMenu extends Components.DsNavMenu, HTMLElement {}
export const DsNavMenu: {
  prototype: DsNavMenu;
  new (): DsNavMenu;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
