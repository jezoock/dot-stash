import { readFileSync } from 'fs';
import { join } from 'path';
import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSSidebar } from './sidebar';
import { TRANSITION_END_MARGIN } from '../../utils/transition';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// The spec tests have no CSS engine: the computed transition of the sidebar is given here.
const mockTransition = (transitionDuration: string, transitionDelay = '0s') =>
  jest.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration, transitionDelay } as CSSStyleDeclaration);

/**
 * The simulated DOM of the spec tests has no focus: `focus()` only dispatches a `focus` event. This gives the document an
 * `activeElement`, which `focus()` sets, dispatching `focusout` and `focusin` as a browser does.
 */
const trackFocus = (page: SpecPage) => {
  const focus: { active: HTMLElement | null } = { active: null };
  let owner = Object.getPrototypeOf(page.body);
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);

  const spy = jest.spyOn(owner, 'focus').mockImplementation(function (this: HTMLElement) {
    const previous = focus.active;
    if (previous === this) return;
    focus.active = this;
    previous?.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: this }));
    this.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: previous }));
  });
  Object.defineProperty(page.doc, 'activeElement', { configurable: true, get: () => focus.active ?? page.body });

  return { getFocused: () => page.doc.activeElement as HTMLElement, spy };
};

const keydown = (target: EventTarget, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
};

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

  describe('accessibility', () => {
    it('is a complementary landmark named by label, focusable by script, inert while hidden', async () => {
      const { page } = await render('<ds-sidebar label="Cart"><a href="#a">Checkout</a></ds-sidebar>');

      expect(page.root).toEqualAttributes({ 'role': 'complementary', 'aria-label': 'Cart', 'tabindex': '-1' });
      expect(page.root).toHaveAttribute('inert');

      await page.root.show();
      await page.waitForChanges();
      expect(page.root).not.toHaveAttribute('inert');

      await page.root.hide();
      await page.waitForChanges();
      expect(page.root).toHaveAttribute('inert');
    });

    it('keeps the role its element has', async () => {
      const { page } = await render('<ds-sidebar role="navigation" label="Main menu"><a href="#a">Home</a></ds-sidebar>');

      expect(page.root).toEqualAttributes({ 'role': 'navigation', 'aria-label': 'Main menu' });
    });

    it('moves the focus into the sidebar on show(), and gives it back to the opener on hide()', async () => {
      const { page } = await render('<ds-sidebar><p>Text</p><a href="#a" id="first">First</a><button>Second</button></ds-sidebar>');
      const { getFocused } = trackFocus(page);
      const opener = page.doc.createElement('button');
      page.body.appendChild(opener);
      opener.focus();

      await page.root.show();
      await page.waitForChanges();
      expect(getFocused().id).toBe('first');

      await page.root.hide();
      await page.waitForChanges();
      expect(getFocused()).toBe(opener);
    });

    it('focuses an autofocus element first, else the sidebar itself without focusable content', async () => {
      const { page } = await render('<ds-sidebar><a href="#a">First</a><input autofocus id="search" /></ds-sidebar>');
      const { getFocused } = trackFocus(page);

      await page.root.show();
      await page.waitForChanges();
      expect(getFocused().id).toBe('search');

      const { page: empty } = await render('<ds-sidebar label="Notes"><p>Text only</p></ds-sidebar>');
      const { getFocused: getEmptyFocused } = trackFocus(empty);
      await empty.root.show();
      await empty.waitForChanges();
      expect(getEmptyFocused()).toBe(empty.root);
    });

    it('leaves the focus where it is on hide() when it is no longer in the sidebar', async () => {
      const { page } = await render('<ds-sidebar><a href="#a">First</a></ds-sidebar>');
      const { getFocused } = trackFocus(page);
      const [opener, other] = ['opener', 'other'].map(id => Object.assign(page.body.appendChild(page.doc.createElement('button')), { id }));
      opener.focus();

      await page.root.show();
      await page.waitForChanges();
      other.focus();
      await page.root.hide();
      await page.waitForChanges();

      expect(getFocused()).toBe(other);
    });

    it('hides on Escape while the focus is in it; the key press goes no further', async () => {
      const page = await newSpecPage({ components: [DSSidebar], html: '<div id="page"><ds-sidebar><a href="#a">First</a></ds-sidebar></div>' });
      const { getFocused } = trackFocus(page);
      const sidebar = page.body.querySelector('ds-sidebar');
      const outer = jest.fn();
      page.body.querySelector('#page').addEventListener('keydown', outer);
      const opener = page.body.appendChild(page.doc.createElement('button'));
      opener.focus();

      await sidebar.show();
      await page.waitForChanges();
      keydown(getFocused(), 'Escape', { repeat: true });
      await page.waitForChanges();
      expect(sidebar.isShown).toBe(true);

      keydown(getFocused(), 'Escape');
      await page.waitForChanges();
      expect(sidebar.isShown).toBe(false);
      expect(getFocused()).toBe(opener);
      expect(outer).not.toHaveBeenCalled();
    });

    it('does not take the focus when rendered shown', async () => {
      const page = await newSpecPage({ components: [DSSidebar], html: '<div></div>' });
      const { spy } = trackFocus(page);
      page.body.innerHTML = '<ds-sidebar is-shown><a href="#a">First</a></ds-sidebar>';
      await page.waitForChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(page.body.querySelector('ds-sidebar')).not.toHaveAttribute('inert');
    });

    it('is hidden (visibility) once it has slid out, and visible at once when it slides in', () => {
      const stylesheet = readFileSync(join(__dirname, 'sidebar.scss'), 'utf8');

      expect(stylesheet).toMatch(/&:not\(\[is-shown\]\) \{\s*transform: translate3d\(-100%, 0, 0\);\s*visibility: hidden;/);
      expect(stylesheet).toMatch(
        /&\[is-shown\] \{\s*transform: translate3d\(0, 0, 0\);\s*transition:\s*transform ease var\(--ds-sidebar-transition-duration, 0\.4s\),\s*visibility 0s linear 0s;/,
      );
    });
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
