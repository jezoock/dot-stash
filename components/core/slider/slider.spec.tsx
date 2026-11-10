import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { DSSlider } from './slider';
import './slider';
import './slider-item/slider-item';
import './slider-menu/slider-menu';
import '../trigger/trigger';
import { DSSliderParams } from './slider.types';
import { componentClass, mockLayout, mockTransition, renderPage, trackFocus, wait } from '../../../test/helpers';

/**
 * The simulated DOM has no layout: the slider items are 100 x 50 px and the slider 250 px wide (three slides in view), so
 * the list scrolls. Returns the function that removes the sizes.
 */
const mockSliderLayout = () =>
  mockLayout({
    offsetWidth: element => (element.tagName === 'DS-SLIDER-ITEM' ? 100 : element.classList?.contains('ds-slider') ? 250 : 0),
    offsetHeight: element => (element.tagName === 'DS-SLIDER-ITEM' ? 50 : 0),
  });

describe('ds-slider', () => {
  // `menu` is a flag: this assignment is type-checked (`npm run typecheck` type-checks the spec files).
  const withMenu: DSSliderParams = { menu: true, controls: false };
  let removeLayout: () => void;
  // The sliders of a test are removed after it: their rotation timers stop (disconnectedCallback).
  let sliders: Element[] = [];

  afterEach(() => {
    sliders.forEach(slider => slider.remove());
    sliders = [];
    removeLayout?.();
    removeLayout = undefined;
    vi.restoreAllMocks();
  });

  /**
   * A slider of 4 slides, three in view. `transitionDuration`: the computed transition of the list (the spec tests have
   * no CSS engine).
   */
  const render = async (attributes = '', { slides = 4, transitionDuration = '0s', items = '' } = {}) => {
    const page = await renderPage('');
    removeLayout = mockSliderLayout();
    mockTransition(transitionDuration);
    const events: { slide: string; currentIndex?: number }[] = [];
    page.doc.addEventListener('sliderEvent', (event: CustomEvent) => events.push(event.detail));

    await page.setContent(
      `<ds-slider ${attributes}>${items || Array.from({ length: slides }, (_, index) => `<ds-slider-item><a href="#${index}">Slide ${index + 1}</a></ds-slider-item>`).join('')}</ds-slider>`,
    );
    await page.waitForChanges();
    sliders.push(page.root);

    const slider = page.root.querySelector<HTMLElement>('.ds-slider');
    const list = page.root.querySelector<HTMLElement>('.ds-slider__list');
    const slidesOf = () => Array.from(list.querySelectorAll<HTMLElement>('ds-slider-item'));
    const names = () => slidesOf().map(item => item.getAttribute('aria-label'));
    const inert = () => slidesOf().map(item => item.hasAttribute('inert'));
    const button = (name: string) => page.root.querySelector<HTMLElement>(`.ds-slider__${name}-button`);
    return { page, events, slider, list, names, inert, button, slidesOf };
  };

  it('renders the slider menu when the menu flag is set', async () => {
    const page = await renderPage('<ds-slider><ds-slider-item>1</ds-slider-item></ds-slider>');

    expect(page.root.querySelector('ds-slider-menu')).toBeNull();

    page.root.params = withMenu;
    await page.waitForChanges();

    expect(page.root.querySelector('ds-slider-menu')).not.toBeNull();
  });

  it('renders the measured state (prev/next triggers, classes) once after the load, without Stencil warning', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const renderSpy = vi.spyOn(componentClass<DSSlider>('ds-slider').prototype, 'render');
    const page = await renderPage('');
    removeLayout = mockSliderLayout();

    await page.setContent(`<ds-slider>${'<ds-slider-item>item</ds-slider-item>'.repeat(4)}</ds-slider>`);
    const slider = page.root.querySelector('.ds-slider');

    expect(slider).toHaveClasses(['--scrollable', '--isReady']);
    // The classes the slider gives its triggers (ds-trigger, defined in this file, adds its own).
    expect(Array.from(page.root.querySelectorAll('ds-trigger')).map(trigger => trigger.className.split(' ').filter(name => name.startsWith('ds-slider__')))).toEqual([
      ['ds-slider__prev-button'],
      ['ds-slider__next-button'],
    ]);
    expect(renderSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy.mock.calls.filter(args => String(args[0]).includes('changed during'))).toEqual([]);
  });

  it('is a carousel region named by label; its slides are groups named by their place, and those out of view are inert', async () => {
    const { slider, list, names, inert, slidesOf, button } = await render('label="Featured"');

    expect(slider).toEqualAttributes({ 'role': 'region', 'aria-roledescription': 'carousel', 'aria-label': 'Featured' });
    expect(slidesOf().map(item => [item.getAttribute('role'), item.getAttribute('aria-roledescription')])).toEqual(Array(4).fill(['group', 'slide']));
    expect(names()).toEqual(['1 of 4', '2 of 4', '3 of 4', '4 of 4']);
    expect(inert()).toEqual([false, false, false, true]);
    expect(list).toEqualAttribute('aria-live', 'polite');
    expect(button('prev')).toEqualAttributes({ 'role': 'button', 'tabindex': '0', 'aria-label': 'Previous slide' });
    expect(button('next')).toEqualAttributes({ 'role': 'button', 'tabindex': '0', 'aria-label': 'Next slide' });
    expect(button('rotation')).toBeNull();
  });

  it('translates its texts with labels; a slide keeps an aria-label of its own', async () => {
    const labels = { carousel: 'carrousel', slide: 'diapositive', slideName: '{index} sur {count}', previous: 'Précédente', next: 'Suivante' };
    const { page, slider, names, slidesOf, button } = await render(`labels='${JSON.stringify(labels)}'`, {
      items: '<ds-slider-item>A</ds-slider-item><ds-slider-item aria-label="Offer">B</ds-slider-item><ds-slider-item>C</ds-slider-item><ds-slider-item>D</ds-slider-item>',
    });

    expect(slider).toEqualAttribute('aria-roledescription', 'carrousel');
    expect(slidesOf()[0]).toEqualAttribute('aria-roledescription', 'diapositive');
    expect(names()).toEqual(['1 sur 4', 'Offer', '3 sur 4', '4 sur 4']);
    expect(button('prev')).toEqualAttribute('aria-label', 'Précédente');
    expect(button('next')).toEqualAttribute('aria-label', 'Suivante');

    page.root.labels = { slideName: 'Slide {index}' };
    await page.waitForChanges();
    expect(names()).toEqual(['Slide 1', 'Offer', 'Slide 3', 'Slide 4']);
  });

  it('a slider without a slide to scroll has no inert slide and no buttons', async () => {
    const { names, inert, button } = await render('', { slides: 1 });

    expect(names()).toEqual(['1 of 1']);
    expect(inert()).toEqual([false]);
    expect(button('prev')).toBeNull();
    expect(button('next')).toBeNull();
  });

  it('next() slides at once without a transition (it does not wait for transitionend), and moves the window of inert slides', async () => {
    const { page, events, names, inert } = await render();

    await page.root.next();
    await wait(80);
    await page.waitForChanges();

    expect(events.map(({ slide, currentIndex }) => `${slide}:${currentIndex}`)).toEqual(['start-slide:0', 'stop-slide:1']);
    expect(names()).toEqual(['2 of 4', '3 of 4', '4 of 4', '1 of 4']);
    expect(inert()).toEqual([false, false, false, true]);
  });

  it('prev() from the first slide goes to the last one', async () => {
    const { page, events, names, inert } = await render();

    await page.root.prev();
    await wait(80);
    await page.waitForChanges();

    expect(events.map(({ slide, currentIndex }) => `${slide}:${currentIndex}`)).toEqual(['start-slide:0', 'stop-slide:3']);
    expect(names()).toEqual(['4 of 4', '1 of 4', '2 of 4', '3 of 4']);
    expect(inert()).toEqual([false, false, false, true]);
  });

  it('ends a slide on the transitionend event of its list, or once its duration is over', async () => {
    const { page, events, list } = await render('', { transitionDuration: '0.6s' });

    await page.root.next();
    await wait(80);
    // The end of a transition in a slide is not the end of the slide.
    list.querySelector('a').dispatchEvent(new Event('transitionend', { bubbles: true }));
    expect(events.map(({ slide }) => slide)).toEqual(['start-slide']);

    list.dispatchEvent(new Event('transitionend'));
    expect(events.map(({ slide }) => slide)).toEqual(['start-slide', 'stop-slide']);
  });

  it('the dots of the menu are buttons named by their slide, the current one aria-current; a click shows its slide', async () => {
    const { page, events } = await render(`params='{"menu": true}' labels='{"menu": "Slides"}'`);
    const menu = page.root.querySelector('ds-slider-menu ul');
    const dots = () => Array.from(menu.querySelectorAll<HTMLButtonElement>('li > button'));

    expect(menu).toEqualAttribute('aria-label', 'Slides');
    expect(dots().map(dot => [dot.getAttribute('type'), dot.getAttribute('aria-label'), dot.getAttribute('aria-current')])).toEqual([
      ['button', 'Slide 1', 'true'],
      ['button', 'Slide 2', null],
      ['button', 'Slide 3', null],
      ['button', 'Slide 4', null],
    ]);

    dots()[2].click();
    await wait(80);
    await page.waitForChanges();

    expect(events.map(({ slide, currentIndex }) => `${slide}:${currentIndex}`)).toEqual(['start-slide:0', 'stop-slide:2']);
    expect(dots().map(dot => dot.getAttribute('aria-current'))).toEqual([null, null, 'true', null]);
  });

  describe('params.index: the first slide in view', () => {
    const current = (page: Awaited<ReturnType<typeof render>>['page']) =>
      Array.from(page.root.querySelectorAll('ds-slider-menu button')).findIndex(dot => dot.getAttribute('aria-current') === 'true');

    it('shows the slide of index first, its dot current, the slides named by their place and those out of view inert', async () => {
      const { page, events, names, inert } = await render(`params='{"index": 2, "menu": true}'`);

      expect(names()).toEqual(['3 of 4', '4 of 4', '1 of 4', '2 of 4']);
      expect(inert()).toEqual([false, false, false, true]);
      expect(current(page)).toBe(2);

      await page.root.next();
      await wait(80);
      await page.waitForChanges();
      expect(events.map(({ slide, currentIndex }) => `${slide}:${currentIndex}`)).toEqual(['start-slide:2', 'stop-slide:3']);
      expect(names()).toEqual(['4 of 4', '1 of 4', '2 of 4', '3 of 4']);
      expect(current(page)).toBe(3);
    });

    it('a dot goes to its slide from there', async () => {
      const { page, events, names } = await render(`params='{"index": 3, "menu": true}'`);

      page.root.querySelectorAll<HTMLElement>('ds-slider-menu button')[1].click();
      await wait(80);
      await page.waitForChanges();

      expect(events.map(({ slide, currentIndex }) => `${slide}:${currentIndex}`)).toEqual(['start-slide:3', 'stop-slide:1']);
      expect(names()[0]).toBe('2 of 4');
      expect(current(page)).toBe(1);
    });

    it('loops: an index out of the slides counts round them (-1 is the last one)', async () => {
      const { page, names } = await render(`params='{"index": -1, "menu": true}'`);

      expect(names()[0]).toBe('4 of 4');
      expect(current(page)).toBe(3);
    });

    it('without loop: the first slide of the last view at most, the previous button shown, not the next one', async () => {
      const { page, names, inert, button } = await render(`params='{"index": 3, "loop": false, "menu": true}'`);

      // Three slides in view: the last view starts at the second slide.
      expect(names()).toEqual(['2 of 4', '3 of 4', '4 of 4', '1 of 4']);
      expect(inert()).toEqual([false, false, false, true]);
      expect(current(page)).toBe(1);
      expect(button('prev')).not.toBeNull();
      expect(button('next')).toBeNull();
    });

    it('refresh(true) shows the slide of index again', async () => {
      const { page, names } = await render(`params='{"index": 1}'`);

      await page.root.next();
      await wait(80);
      await page.waitForChanges();
      expect(names()[0]).toBe('3 of 4');

      await page.root.refresh(true);
      expect(names()[0]).toBe('2 of 4');
    });
  });

  it('gives the focus to the other button when the focused one is removed (no loop, first slide)', async () => {
    const { page, button } = await render(`params='{"loop": false}'`);
    const getFocused = trackFocus();

    await page.root.next();
    await wait(80);
    await page.waitForChanges();
    button('prev').focus();

    await page.root.prev();
    await wait(80);
    await page.waitForChanges();

    expect(button('prev')).toBeNull();
    expect(getFocused()).toBe(button('next'));
  });

  describe('automatic rotation', () => {
    const autoplay = `params='{"autoplay": true, "duration": 30}'`;

    it('renders a rotation button first, and the list is not a live region while the slides rotate', async () => {
      const { page, slider, list, button, events } = await render(autoplay);

      expect(slider.querySelector('ds-trigger')).toBe(button('rotation'));
      expect(button('rotation')).toEqualAttributes({ 'role': 'button', 'aria-label': 'Stop automatic slide show' });
      expect(button('rotation')).toHaveClasses(['--slider', '--pause']);
      expect(list).toEqualAttribute('aria-live', 'off');

      await wait(150);
      expect(events.filter(({ slide }) => slide === 'stop-slide').length).toBeGreaterThan(0);

      button('rotation').click();
      await page.waitForChanges();
      expect(button('rotation')).toEqualAttribute('aria-label', 'Start automatic slide show');
      expect(button('rotation')).toHaveClass('--play');
      expect(list).toEqualAttribute('aria-live', 'polite');
      const count = events.length;
      await wait(150);
      expect(events.length).toBeLessThanOrEqual(count + 2);
      const stopped = events.length;
      await wait(100);
      expect(events.length).toBe(stopped);

      button('rotation').click();
      await page.waitForChanges();
      expect(list).toEqualAttribute('aria-live', 'off');
      await wait(150);
      expect(events.length).toBeGreaterThan(stopped);
    });

    it('stops when the focus enters the slider, not when it moves in it', async () => {
      const { page, button, list } = await render(autoplay);

      button('next').dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: null }));
      await page.waitForChanges();
      expect(button('rotation')).toEqualAttribute('aria-label', 'Start automatic slide show');
      expect(list).toEqualAttribute('aria-live', 'polite');

      await page.root.play();
      button('prev').dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: button('next') }));
      await page.waitForChanges();
      expect(button('rotation')).toEqualAttribute('aria-label', 'Stop automatic slide show');
    });

    it('pauses while the pointer is over the slider', async () => {
      const { page, list, events } = await render(autoplay);

      page.root.dispatchEvent(new MouseEvent('mouseenter'));
      await page.waitForChanges();
      expect(list).toEqualAttribute('aria-live', 'polite');
      await wait(100);
      const paused = events.length;
      await wait(100);
      expect(events.length).toBe(paused);

      page.root.dispatchEvent(new MouseEvent('mouseleave'));
      await page.waitForChanges();
      expect(list).toEqualAttribute('aria-live', 'off');
      await wait(150);
      expect(events.length).toBeGreaterThan(paused);
    });

    it('does not start with less motion', async () => {
      const page = await renderPage('');
      removeLayout = mockSliderLayout();
      vi.spyOn(window, 'matchMedia').mockImplementation(media => ({ media, matches: media === '(prefers-reduced-motion: reduce)' }) as MediaQueryList);
      const events: unknown[] = [];
      page.doc.addEventListener('sliderEvent', event => events.push(event));

      await page.setContent(`<ds-slider ${autoplay}>${'<ds-slider-item>item</ds-slider-item>'.repeat(4)}</ds-slider>`);
      await page.waitForChanges();
      sliders.push(page.root);
      await wait(100);

      expect(page.root.querySelector('.ds-slider__rotation-button')).toEqualAttribute('aria-label', 'Start automatic slide show');
      expect(events).toEqual([]);
    });
  });

  it('waits for the end of a slide with waitForTransition, and drops the slide transition with less motion', () => {
    const source = readFileSync(join(__dirname, 'slider.tsx'), 'utf8');
    const stylesheet = readFileSync(join(__dirname, 'slider.scss'), 'utf8');

    expect(source).toContain('waitForTransition(this.list');
    expect(source).not.toMatch(/addEventListener\(\s*'transitionend'/);
    expect(stylesheet).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*&\.--sliding \{\s*transition-property: none;/);
  });
});
