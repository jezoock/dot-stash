import { getTransitionTime, TRANSITION_END_MARGIN, waitForTransition } from './transition';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('transition', () => {
  // The spec tests have no CSS engine: the computed style of an element is given here.
  const mockTransition = (transitionDuration: string, transitionDelay = '0s') =>
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration, transitionDelay } as CSSStyleDeclaration);

  afterEach(() => jest.restoreAllMocks());

  describe('getTransitionTime()', () => {
    it.each([
      ['0s', '0s', 0],
      ['0.4s', '0s', 400],
      ['150ms', '50ms', 200],
      ['0.4s, 0s', '0s, 0.4s', 400], // the slide of ds-sidebar and its visibility, changed at its end
      ['0.3s, 0.1s', '0s', 300],
      ['0.2s', '0s, 0.5s', 700], // the shorter list is repeated
      ['0.01ms', '0s', 0.01], // reduced motion: the base styles of the theme
    ])('reads %s (delay %s) as %p ms', (duration, delay, time) => {
      mockTransition(duration, delay);

      expect(getTransitionTime(document.createElement('div'))).toBeCloseTo(time);
    });

    it('returns 0 without a transition property', () => {
      jest.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration: '0.4s', transitionDelay: '0s', transitionProperty: 'none' } as CSSStyleDeclaration);

      expect(getTransitionTime(document.createElement('div'))).toBe(0);
    });

    it('returns undefined without a computed transition (no CSS engine)', () => {
      expect(getTransitionTime(document.createElement('div'))).toBeUndefined();
    });
  });

  describe('waitForTransition()', () => {
    it('ends on the transitionend event of the element, not on the ones of its content, once', () => {
      const element = document.createElement('div');
      const child = element.appendChild(document.createElement('span'));
      const done = jest.fn();

      const transition = waitForTransition(element, done);
      transition.measure();
      child.dispatchEvent(new Event('transitionend', { bubbles: true }));
      expect(done).not.toHaveBeenCalled();

      element.dispatchEvent(new Event('transitionend'));
      element.dispatchEvent(new Event('transitionend'));
      expect(done).toHaveBeenCalledTimes(1);
    });

    it('ends at once when no transition runs (durations of 0)', () => {
      const element = document.createElement('div');
      const done = jest.fn();
      mockTransition('0s, 0s', '0s');

      waitForTransition(element, done).measure();

      expect(done).toHaveBeenCalledTimes(1);
      element.dispatchEvent(new Event('transitionend'));
      expect(done).toHaveBeenCalledTimes(1);
    });

    it('ends after the longest transition when the event does not come', async () => {
      const done = jest.fn();
      mockTransition('0.02s');

      waitForTransition(document.createElement('div'), done).measure();
      await wait(10);
      expect(done).not.toHaveBeenCalled();

      await wait(20 + TRANSITION_END_MARGIN);
      expect(done).toHaveBeenCalledTimes(1);
    });

    it('does not end once cancelled', async () => {
      const element = document.createElement('div');
      const done = jest.fn();
      mockTransition('0.01s');

      const transition = waitForTransition(element, done);
      transition.measure();
      transition.cancel();
      element.dispatchEvent(new Event('transitionend'));
      transition.measure();
      await wait(10 + TRANSITION_END_MARGIN + 10);

      expect(done).not.toHaveBeenCalled();
    });

    it('waits for the event only, without a computed transition', async () => {
      const element = document.createElement('div');
      const done = jest.fn();

      waitForTransition(element, done).measure();
      await wait(TRANSITION_END_MARGIN + 10);
      expect(done).not.toHaveBeenCalled();

      element.dispatchEvent(new Event('transitionend'));
      expect(done).toHaveBeenCalledTimes(1);
    });
  });
});
