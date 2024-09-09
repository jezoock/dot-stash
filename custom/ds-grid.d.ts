import type { Components, JSX } from "../dist/types/components";

interface DsGrid extends Components.DsGrid, HTMLElement {}
export const DsGrid: {
  prototype: DsGrid;
  new (): DsGrid;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
