import { describe, expect, it } from 'vitest';
import { mount, nextFrame, setReducedMotion } from '../../test/helpers/browser';
import { getTransitionTime, waitForTransition } from './transition';

describe('waitForTransition() in a browser, with the default theme', () => {
  /** A box whose opacity changes in 10 s: the wait ends on its transitionend, not on the timer of the duration. */
  const render = async () => {
    const box = await mount<HTMLElement>('<div style="width: 10px; height: 10px; transition: opacity 10s"></div>');
    const done = new Promise<number>(resolve => {
      const transition = waitForTransition(box, () => resolve(performance.now()));
      box.style.opacity = '0';
      requestAnimationFrame(() => transition.measure());
    });
    return { box, done };
  };

  it('with less motion, reads the duration of the theme (0.01ms) and ends on the transitionend event, at once', async () => {
    await setReducedMotion(true);
    const { box, done } = await render();
    // The time of the event: the listener of the wait, added first, is called before this one.
    const transitionEnd = new Promise<number>(resolve => box.addEventListener('transitionend', event => resolve(event.timeStamp), { once: true }));
    const start = performance.now();

    const [end, eventTime] = await Promise.all([done, transitionEnd]);

    expect(getTransitionTime(box)).toBeCloseTo(0.01);
    expect(end).toBeGreaterThanOrEqual(eventTime);
    expect(end - start).toBeLessThan(1000);
  });

  it('without less motion, the same transition is still running after a frame', async () => {
    const { box, done } = await render();
    let ended = false;
    done.then(() => (ended = true));

    await nextFrame();
    await nextFrame();

    expect(getTransitionTime(box)).toBe(10000);
    expect(box.getAnimations().length).toBe(1);
    expect(ended).toBe(false);
  });
});
