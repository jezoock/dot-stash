import type { Components, JSX } from "../dist/types/components";

interface DsVideoPlay extends Components.DsVideoPlay, HTMLElement {}
export const DsVideoPlay: {
  prototype: DsVideoPlay;
  new (): DsVideoPlay;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
