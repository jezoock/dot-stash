import type { Components, JSX } from "../dist/types/components";

interface DsMapLocation extends Components.DsMapLocation, HTMLElement {}
export const DsMapLocation: {
  prototype: DsMapLocation;
  new (): DsMapLocation;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
