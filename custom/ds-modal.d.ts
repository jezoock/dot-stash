import type { Components, JSX } from "../dist/types/components";

interface DsModal extends Components.DsModal, HTMLElement {}
export const DsModal: {
  prototype: DsModal;
  new (): DsModal;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
