import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, mount, nextEvent, setReducedMotion } from '../../../test/helpers/browser';

type Slider = HTMLDsSliderElement & HTMLElement;
type SliderEvent = CustomEvent<{ slide: string; direction: number; currentIndex?: number }>;

/** A slider 500 px wide of `count` slides of 200 px: two in view, so the list scrolls. */
const SLIDER = (params: object = {}, count = 5) =>
  `<button id="before">Before</button>
  <ds-slider label="Featured" style="display: block; width: 500px" params='${JSON.stringify(params)}'>
    ${Array.from({ length: count }, (_, index) => `<ds-slider-item><a href="#${index + 1}" style="display: block; width: 200px; height: 80px">Slide ${index + 1}</a></ds-slider-item>`).join('')}
  </ds-slider>
  <button id="after">After</button>`;

describe('ds-slider in a browser', () => {
  const render = async (params: object = {}) => {
    await mount(SLIDER(params));
    const slider = document.querySelector<Slider>('ds-slider');
    const button = (name: 'prev' | 'next' | 'rotation') => slider.querySelector<HTMLElement>(`.ds-slider__${name}-button`);
    const list = slider.querySelector<HTMLElement>('.ds-slider__list');
    /** The next end of a slide: the index of the first slide in view. */
    const slideEnd = async () => {
      for (;;) {
        const { detail } = await nextEvent<SliderEvent>(slider, 'sliderEvent');
        if (detail.slide === 'stop-slide') return detail.currentIndex;
      }
    };
    // The buttons are rendered once the slider has measured its slides, then shown (their hydrated visibility).
    await expect.poll(() => ['prev', 'next'].every((name: 'prev' | 'next') => button(name) && getComputedStyle(button(name)).visibility === 'visible')).toBe(true);
    const slidesInView = () => Array.from(list.querySelectorAll<HTMLElement>('ds-slider-item')).filter(item => !item.inert);
    return { slider, button, list, slideEnd, slidesInView };
  };

  describe('keyboard', () => {
    it('the previous and next buttons are in the Tab order, with the slides in view between them, and Enter and Space slide', async () => {
      const { button, slideEnd, slidesInView } = await render();
      const inView = slidesInView();
      expect(inView.length).toBeGreaterThan(0);
      expect(inView.length).toBeLessThan(5);
      document.querySelector<HTMLElement>('#before').focus();

      await userEvent.tab();
      expect(focused()).toBe(button('prev'));
      expect(button('prev').getAttribute('aria-label')).toBe('Previous slide');
      for (const slide of inView) {
        await userEvent.tab();
        expect(focused()).toBe(slide.querySelector('a'));
      }
      // The slides out of view are inert: skipped.
      await userEvent.tab();
      expect(focused()).toBe(button('next'));
      expect(button('next').getAttribute('aria-label')).toBe('Next slide');

      let end = slideEnd();
      await userEvent.keyboard('{Enter}');
      expect(await end).toBe(1);
      end = slideEnd();
      await userEvent.keyboard(' ');
      expect(await end).toBe(2);

      button('prev').focus();
      end = slideEnd();
      await userEvent.keyboard('{Enter}');
      expect(await end).toBe(1);
    });

    it('the dots of the menu are buttons: Enter on one goes to its slide, which becomes the current one', async () => {
      const { slider, slideEnd } = await render({ menu: true });
      const dots = () => Array.from(slider.querySelectorAll<HTMLElement>('ds-slider-menu button, ds-slider-menu [role="button"]'));
      await expect.poll(() => dots().length).toBe(5);
      expect(dots()[0].getAttribute('aria-current')).toBe('true');

      dots()[3].focus();
      const end = slideEnd();
      await userEvent.keyboard('{Enter}');
      await end;

      await expect.poll(() => dots().map(dot => dot.getAttribute('aria-current'))).toEqual([null, null, null, 'true', null]);
    });
  });

  describe('automatic rotation', () => {
    const AUTOPLAY = { autoplay: true, duration: 200 };

    it('rotates, the list not a live region; the focus entering the slider stops it, until its rotation button starts it again', async () => {
      const { button, list, slideEnd } = await render(AUTOPLAY);
      expect(button('rotation').getAttribute('aria-label')).toBe('Stop automatic slide show');
      expect(list.getAttribute('aria-live')).toBe('off');
      await slideEnd();

      document.querySelector<HTMLElement>('#before').focus();
      await userEvent.tab();
      expect(focused()).toBe(button('rotation'));
      await expect.poll(() => button('rotation').getAttribute('aria-label')).toBe('Start automatic slide show');
      expect(list.getAttribute('aria-live')).toBe('polite');

      await userEvent.keyboard('{Enter}');
      await expect.poll(() => button('rotation').getAttribute('aria-label')).toBe('Stop automatic slide show');
      expect(list.getAttribute('aria-live')).toBe('off');
      await slideEnd();
    });

    it('pauses while the pointer is over the slider, and goes on when it leaves', async () => {
      const { slider, list, slideEnd } = await render(AUTOPLAY);
      await slideEnd();

      await userEvent.hover(slider);
      await expect.poll(() => list.getAttribute('aria-live')).toBe('polite');

      await userEvent.unhover(slider);
      await expect.poll(() => list.getAttribute('aria-live')).toBe('off');
      await slideEnd();
    });

    it('does not start with less motion: its rotation button starts it', async () => {
      await setReducedMotion(true);
      const { button, list } = await render(AUTOPLAY);

      expect(button('rotation').getAttribute('aria-label')).toBe('Start automatic slide show');
      expect(list.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('transitions', () => {
    it.each([
      ['with less motion (the slides do not slide)', true],
      ['with a transition of 0s: no transitionend event', false],
    ])('a slide ends %s: the next slide comes at once, and the slider takes the keys again', async (_, reducedMotion) => {
      await setReducedMotion(reducedMotion);
      const { button, list, slideEnd } = await render();
      if (!reducedMotion) list.style.transitionDuration = '0s';

      button('next').focus();
      let end = slideEnd();
      await userEvent.keyboard('{Enter}');
      expect(await end).toBe(1);
      end = slideEnd();
      await userEvent.keyboard('{Enter}');
      expect(await end).toBe(2);
    });
  });
});
