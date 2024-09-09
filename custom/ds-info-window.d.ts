import type { Components, JSX } from "../dist/types/components";

interface DsInfoWindow extends Components.DsInfoWindow, HTMLElement {}
export const DsInfoWindow: {
  prototype: DsInfoWindow;
  new (): DsInfoWindow;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
