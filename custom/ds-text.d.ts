import type { Components, JSX } from "../dist/types/components";

interface DsText extends Components.DsText, HTMLElement {}
export const DsText: {
  prototype: DsText;
  new (): DsText;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
