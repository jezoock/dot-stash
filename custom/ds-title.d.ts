import type { Components, JSX } from "../dist/types/components";

interface DsTitle extends Components.DsTitle, HTMLElement {}
export const DsTitle: {
  prototype: DsTitle;
  new (): DsTitle;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
