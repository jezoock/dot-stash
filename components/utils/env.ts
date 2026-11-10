/**
 * Browser capabilities.
 */

/**
 * Whether the browser has touch events, i.e. a touch screen: the window has an `ontouchstart` property
 * (the check `ds-tooltip` makes too). On such a device a tap also fires `mouseover`.
 */
export const touchSupport = (): boolean => typeof window !== 'undefined' && 'ontouchstart' in window;
