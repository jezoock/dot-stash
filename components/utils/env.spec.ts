import { afterEach, describe, expect, it } from 'vitest';
import { touchSupport } from './env';

describe('env', () => {
  describe('touchSupport', () => {
    afterEach(() => {
      delete (window as { ontouchstart?: unknown }).ontouchstart;
    });

    it('is false without touch events', () => {
      expect(touchSupport()).toBe(false);
    });

    // Browsers with touch events have an ontouchstart property, whose value is null until a handler is set.
    it('is true when the window has an ontouchstart property, even null', () => {
      (window as { ontouchstart?: unknown }).ontouchstart = null;

      expect(touchSupport()).toBe(true);
    });
  });
});
