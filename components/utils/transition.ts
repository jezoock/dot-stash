/**
 * Waiting for the end of a CSS transition without hanging when it does not run: durations of 0 (a project setting,
 * `transition: none`), an element that is not rendered, a value that does not change. The `transitionend` event then
 * never comes.
 */

/** The time given to `transitionend` after the end of the longest transition, before the wait ends without it. */
export const TRANSITION_END_MARGIN = 50;

/** A time of a computed style (`0.4s`, `150ms`) in ms. */
const toMs = (time: string): number => {
  const value = parseFloat(time);

  if (Number.isNaN(value)) {
    return 0;
  }

  return /ms\s*$/.test(time) ? value : value * 1000;
};

/**
 * The end of the longest transition of an element, in ms from its start: the largest duration + delay of its computed
 * `transition-duration` and `transition-delay` lists (the shorter list repeated, as CSS does). `0` when no transition
 * runs (`transition-property: none` too); `undefined` when the computed style has no transition at all (no CSS engine,
 * as in the spec tests).
 */
export const getTransitionTime = (element: Element): number | undefined => {
  const style = typeof window.getComputedStyle === 'function' ? window.getComputedStyle(element) : undefined;
  const durations = style?.transitionDuration;

  if (typeof durations !== 'string' || durations.trim() === '') {
    return undefined;
  }

  if (style.transitionProperty?.trim() === 'none') {
    return 0;
  }

  const durationList = durations.split(',').map(toMs);
  const delayList = (style.transitionDelay || '0s').split(',').map(toMs);
  let time = 0;

  for (let index = 0; index < Math.max(durationList.length, delayList.length); index++) {
    time = Math.max(time, durationList[index % durationList.length] + delayList[index % delayList.length]);
  }

  return time;
};

/** A wait for the end of a transition (see `waitForTransition()`). */
export interface TransitionWait {
  /**
   * Reads the transitions of the element, once the state change that starts them is rendered: ends the wait at once when
   * none runs, else sets the time after which it ends without `transitionend`.
   */
  measure(): void;
  /** Stops the wait: `done` is not called. */
  cancel(): void;
}

/**
 * Calls `done` once, at the end of the transition that a state change of `element` starts: on the `transitionend` event of
 * the element itself (not one of its content), listened to from now on. Call `measure()` once the change is rendered:
 * with no transition to wait for, `done` is called at once; otherwise, it is called when the longest transition should
 * have ended (`TRANSITION_END_MARGIN` ms later) if the event has not come. Call `cancel()` before a new state change.
 */
export const waitForTransition = (element: HTMLElement, done: () => void): TransitionWait => {
  let timer: ReturnType<typeof setTimeout>;
  let isWaiting = true;

  const cancel = () => {
    isWaiting = false;
    clearTimeout(timer);
    element.removeEventListener('transitionend', listener);
  };

  const finish = () => {
    if (isWaiting) {
      cancel();
      done();
    }
  };

  function listener(event: Event) {
    if (event.target === element) {
      finish();
    }
  }

  element.addEventListener('transitionend', listener);

  return {
    measure() {
      if (!isWaiting) {
        return;
      }

      const time = getTransitionTime(element);

      clearTimeout(timer);
      if (time === 0) {
        finish();
      } else if (time !== undefined) {
        timer = setTimeout(finish, time + TRANSITION_END_MARGIN);
      }
    },
    cancel,
  };
};
