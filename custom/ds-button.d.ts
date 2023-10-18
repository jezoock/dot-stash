import type { Components, JSX } from "../dist/types/components";

interface DsButton extends Components.DsButton, HTMLElement {}
export const DsButton: {
  prototype: DsButton;
  new (): DsButton;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
