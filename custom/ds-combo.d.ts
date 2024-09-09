import type { Components, JSX } from "../dist/types/components";

interface DsCombo extends Components.DsCombo, HTMLElement {}
export const DsCombo: {
  prototype: DsCombo;
  new (): DsCombo;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
