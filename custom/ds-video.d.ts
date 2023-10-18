import type { Components, JSX } from "../dist/types/components";

interface DsVideo extends Components.DsVideo, HTMLElement {}
export const DsVideo: {
  prototype: DsVideo;
  new (): DsVideo;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
