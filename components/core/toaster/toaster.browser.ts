import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { mount, nextEvent } from '../../../test/helpers/browser';

type Toaster = HTMLDsToasterElement & HTMLElement;

describe('ds-toaster in a browser', () => {
  const render = async (attributes = '') => {
    const toaster = await mount<Toaster>(`<ds-toaster messages="Saved" position="bottom,right" ${attributes}></ds-toaster>`);
    const box = toaster.querySelector<HTMLElement>('.ds-toaster');
    const container = toaster.querySelector<HTMLElement>('.ds-toaster__container');
    const isShown = () => box.classList.contains('--shown');
    return { toaster, box, container, isShown };
  };

  describe('countdown (WCAG 2.2.1, Timing Adjustable)', () => {
    it('pauses while the pointer is over the toasts, and hides closing-delay ms after it leaves', async () => {
      const { toaster, box, container, isShown } = await render('closing-delay="1000"');
      await toaster.displayToast();
      // The toaster slides in and fades in (0.5 s): the pointer goes over the box once it stands still.
      await Promise.all(box.getAnimations({ subtree: true }).map(animation => animation.finished));

      await userEvent.hover(container);
      // Longer than the delay under the pointer: still shown.
      await new Promise(resolve => setTimeout(resolve, 1200));
      expect(isShown()).toBe(true);

      const hidden = nextEvent(toaster, 'toasterHide');
      const left = performance.now();
      await userEvent.unhover(container);
      await hidden;
      expect(performance.now() - left).toBeGreaterThanOrEqual(1000 - 20);
      await expect.poll(isShown).toBe(false);
    });

    it('closing-delay="0" keeps it shown; the pointer leaving starts no countdown', async () => {
      const { toaster, box, container, isShown } = await render('closing-delay="0"');
      await toaster.displayToast();
      await Promise.all(box.getAnimations({ subtree: true }).map(animation => animation.finished));

      await userEvent.hover(container);
      await userEvent.unhover(container);
      await new Promise(resolve => setTimeout(resolve, 300));
      expect(isShown()).toBe(true);
    });
  });

  describe('layout', () => {
    const LONG = 'Your changes to the delivery address were saved, and they apply to your next order';
    const positions = ['top,left', 'top,center', 'middle,center', 'bottom,right'];

    it.each([320, 375])('at %i px, the box of the toasts is within the viewport, less 1rem on each side, in every position', async width => {
      await page.viewport(width, 700);
      for (const position of positions) {
        const { container } = await render(`position="${position}" messages="${LONG}"`);
        const { left, right, width: boxWidth } = container.getBoundingClientRect();
        expect([position, left >= 0, right <= document.documentElement.clientWidth, boxWidth]).toEqual([position, true, true, width - 32]);
        // The text wraps in the box: nothing overflows it.
        expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
      }
    });

    it.each([800, 1280])('at %i px, the box keeps its minimum width, 500 px (the default theme)', async width => {
      await page.viewport(width, 700);
      for (const position of positions) {
        const { container } = await render(`position="${position}"`);
        expect([position, container.getBoundingClientRect().width]).toEqual([position, 500]);
      }
    });
  });
});
