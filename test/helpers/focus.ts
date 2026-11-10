import { vi } from 'vitest';

/**
 * The simulated DOM has no focus: `focus()` only dispatches a `focus` event, and the document has no `activeElement`.
 * This gives the document one, which `focus()` sets, dispatching `focusout` and `focusin` as a browser does; the body
 * while no element has the focus, or once the focused element left the document.
 *
 * Returns the function that gives the focused element (`document.activeElement`), with the spy of `focus()` (`spy`).
 */
export const trackFocus = () => {
  const focus: { active: HTMLElement | null } = { active: null };
  let owner = Object.getPrototypeOf(document.body);
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);

  const spy = vi.spyOn(owner as HTMLElement, 'focus').mockImplementation(function (this: HTMLElement) {
    const previous = focus.active;
    if (previous === this) return;
    focus.active = this;
    previous?.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: this }));
    this.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: previous }));
  });
  Object.defineProperty(document, 'activeElement', { configurable: true, get: () => (focus.active?.isConnected ? focus.active : document.body) });

  return Object.assign(() => document.activeElement as HTMLElement, { spy });
};
