import type { Components, JSX } from "../dist/types/components";

interface DsMapMarker extends Components.DsMapMarker, HTMLElement {}
export const DsMapMarker: {
  prototype: DsMapMarker;
  new (): DsMapMarker;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
