import type { Components, JSX } from "../dist/types/components";

interface DsSidebar extends Components.DsSidebar, HTMLElement {}
export const DsSidebar: {
  prototype: DsSidebar;
  new (): DsSidebar;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
