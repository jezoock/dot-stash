import { readFileSync } from 'fs';
import { join } from 'path';
import { newSpecPage } from '@stencil/core/testing';
import { DSSidebar } from './sidebar';
import { TRANSITION_END_MARGIN } from '../../utils/transition';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// The spec tests have no CSS engine: the computed transition of the sidebar is given here.
const mockTransition = (transitionDuration: string, transitionDelay = '0s') =>
  jest.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration, transitionDelay } as CSSStyleDeclaration);

describe('ds-sidebar', () => {
  afterEach(() => jest.restoreAllMocks());

  const render = async (html = '<ds-sidebar><nav>Menu</nav></ds-sidebar>') => {
    const page = await newSpecPage({ components: [DSSidebar], html });
    const events: string[] = [];
    ['sidebarShow', 'sidebarShown', 'sidebarHide', 'sidebarHidden'].forEach(name => page.root.addEventListener(name, () => events.push(name)));
    return { page, events };
  };

  it('toggle(false) keeps a hidden sidebar hidden', async () => {
    const { page, events } = await render();

    await page.root.toggle(false);
    await page.waitForChanges();

    expect(page.root.isShown).toBe(false);
    expect(page.root).toHaveClass('--hidden');
    expect(events).toEqual([]);
  });

  it('toggle(true) keeps a shown sidebar shown', async () => {
    const { page, events } = await render('<ds-sidebar is-shown></ds-sidebar>');

    await page.root.toggle(true);
    await page.waitForChanges();

    expect(page.root.isShown).toBe(true);
    expect(events).toEqual([]);
  });

  it('toggle() without argument shows then hides, emitting the events', async () => {
    const { page, events } = await render();

    await page.root.toggle();
    await page.waitForChanges();
    expect(page.root.isShown).toBe(true);
    expect(page.root).toHaveAttribute('is-shown');
    page.root.dispatchEvent(new Event('transitionend'));

    await page.root.toggle();
    await page.waitForChanges();
    expect(page.root.isShown).toBe(false);
    expect(page.root).not.toHaveAttribute('is-shown');
    page.root.dispatchEvent(new Event('transitionend'));

    expect(events).toEqual(['sidebarShow', 'sidebarShown', 'sidebarHide', 'sidebarHidden']);
  });

  it('waits for its own transition, not the ones of its content', async () => {
    const { page, events } = await render();

    await page.root.show();
    page.root.querySelector('nav').dispatchEvent(new Event('transitionend', { bubbles: true }));
    expect(events).toEqual(['sidebarShow']);

    page.root.dispatchEvent(new Event('transitionend'));
    expect(events).toEqual(['sidebarShow', 'sidebarShown']);
  });

  it('emits sidebarShown and sidebarHidden at once when it does not slide (durations of 0, less motion)', async () => {
    const { page, events } = await render();
    mockTransition('0s, 0s', '0s, 0s');

    await page.root.show();
    await page.waitForChanges();
    expect(events).toEqual(['sidebarShow', 'sidebarShown']);

    await page.root.hide();
    await page.waitForChanges();
    expect(events).toEqual(['sidebarShow', 'sidebarShown', 'sidebarHide', 'sidebarHidden']);
    expect(page.root.isShown).toBe(false);
  });

  it('emits sidebarShown when the slide is over, without its transitionend event, once', async () => {
    const { page, events } = await render();
    mockTransition('0.02s, 0s', '0s, 0.02s');

    await page.root.show();
    await page.waitForChanges();
    expect(events).toEqual(['sidebarShow']);

    await wait(20 + TRANSITION_END_MARGIN + 10);
    page.root.dispatchEvent(new Event('transitionend'));
    expect(events).toEqual(['sidebarShow', 'sidebarShown']);
  });

  it('emits the event of the last change only when it changes during the slide', async () => {
    const { page, events } = await render();
    mockTransition('0.02s');

    await page.root.show();
    await page.waitForChanges();
    await page.root.hide();
    await page.waitForChanges();
    await wait(20 + TRANSITION_END_MARGIN + 10);

    expect(events).toEqual(['sidebarShow', 'sidebarHide', 'sidebarHidden']);
  });

  it('does not cancel touchmove events', async () => {
    const { page } = await render();
    const touchmove = new Event('touchmove', { bubbles: true, cancelable: true });

    page.root.querySelector('nav').dispatchEvent(touchmove);

    expect(touchmove.defaultPrevented).toBe(false);
  });

  it('styles the reflected is-shown attribute and contains the scroll chaining', () => {
    const stylesheet = readFileSync(join(__dirname, 'sidebar.scss'), 'utf8');

    expect(stylesheet).not.toContain('[isShown]');
    expect(stylesheet).toContain('[is-shown]');
    expect(stylesheet).toContain('overscroll-behavior: contain');
  });

  it('hides off-screen on the side of its reflected h-pos, not on a from attribute it does not have', async () => {
    const stylesheet = readFileSync(join(__dirname, 'sidebar.scss'), 'utf8');
    const { page } = await render('<ds-sidebar h-pos="right"></ds-sidebar>');

    expect(page.root).toHaveAttribute('h-pos');
    expect(page.root).not.toHaveAttribute('from');
    expect(stylesheet).not.toContain('[from=');
    // Out of sight while it slides out on load: the visibility changes at the end of the slide.
    expect(stylesheet).toMatch(
      /transition:\s*transform ease var\(--ds-sidebar-transition-duration, 0\.4s\),\s*visibility 0s linear var\(--ds-sidebar-transition-duration, 0\.4s\);/,
    );
    expect(stylesheet).toMatch(/ {2}&:not\(\[is-shown\]\) \{\s*transform: translate3d\(-100%, 0, 0\);/);
    expect(stylesheet).toMatch(/&\[h-pos='right'\]:not\(\[is-shown\]\) \{\s*transform: translate3d\(100%, 0, 0\);/);
  });
});
