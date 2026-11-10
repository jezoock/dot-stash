/** Dispatches a key event, which bubbles and can be cancelled, as a browser does. Returns the event. */
export const dispatchKey = (target: EventTarget, type: 'keydown' | 'keyup', key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

/** Dispatches a `keydown` event (see dispatchKey()). */
export const keydown = (target: EventTarget, key: string, init: KeyboardEventInit = {}) => dispatchKey(target, 'keydown', key, init);

/** Dispatches a `keyup` event (see dispatchKey()). */
export const keyup = (target: EventTarget, key: string, init: KeyboardEventInit = {}) => dispatchKey(target, 'keyup', key, init);
