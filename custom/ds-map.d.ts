import type { Components, JSX } from "../dist/types/components";

interface DsMap extends Components.DsMap, HTMLElement {}
export const DsMap: {
  prototype: DsMap;
  new (): DsMap;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
