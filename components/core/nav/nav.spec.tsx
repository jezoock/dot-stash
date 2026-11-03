import { readFileSync } from 'fs';
import { join } from 'path';
import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSNav } from './nav';
import { DSNavMenuItem } from './nav-item/nav-item';
import { DSTrigger } from '../trigger/trigger';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The simulated DOM of the spec tests has no focus: `focus()` only dispatches a `focus` event. This gives the document an
 * `activeElement`, which `focus()` sets, dispatching `focusout` and `focusin` as a browser does.
 */
const trackFocus = (page: SpecPage) => {
  const focus: { active: HTMLElement | null } = { active: null };
  let owner = Object.getPrototypeOf(page.body);
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);

  jest.spyOn(owner, 'focus').mockImplementation(function (this: HTMLElement) {
    const previous = focus.active;
    if (previous === this) return;
    focus.active = this;
    previous?.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: this }));
    this.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: previous }));
  });
  Object.defineProperty(page.doc, 'activeElement', { configurable: true, get: () => focus.active ?? page.body });

  return () => page.doc.activeElement as HTMLElement;
};

const keydown = (target: EventTarget, key: string) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

/**
 * The spec tests have no CSS engine: the computed style the components read. `display` of the expand button (none: the
 * theme drops the sub-navigations down, from md), the transition of the sub-navigation.
 */
const mockStyle = (display = 'block', transitionDuration = '0s') =>
  jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display, transitionDuration, transitionDelay: '0s' } as CSSStyleDeclaration);

const NAV = `<ds-nav mods="main" label="Main">
  <ds-nav-item is-active><a href="/">Home</a></ds-nav-item>
  <ds-nav-item has-children><a href="/about">About <span>us</span></a>
    <ds-nav slot="children">
      <ds-nav-item><a href="/team">Team</a></ds-nav-item>
      <ds-nav-item has-children><a href="/jobs">Jobs</a>
        <ds-nav slot="children"><ds-nav-item><a href="/dev">Developers</a></ds-nav-item></ds-nav>
      </ds-nav-item>
    </ds-nav>
  </ds-nav-item>
</ds-nav>`;

describe('ds-nav', () => {
  afterEach(() => jest.restoreAllMocks());

  const render = async (html = NAV, { display = 'block', transitionDuration = '0s' } = {}) => {
    const page = await newSpecPage({ components: [DSNav, DSNavMenuItem, DSTrigger], html: '' });
    // newSpecPage resets the window: its getComputedStyle is mocked once the page exists.
    mockStyle(display, transitionDuration);
    await page.setContent(html);
    await page.waitForChanges();
    const item = (text: string) => Array.from(page.body.querySelectorAll('ds-nav-item')).find(element => element.querySelector('a').textContent.startsWith(text));
    const toggle = (text: string) => item(text).querySelector<HTMLElement>('.ds-nav-item__expand-button > ds-trigger');
    const link = (text: string) => item(text).querySelector<HTMLElement>('a');
    const subNav = (text: string) => item(text).querySelector<HTMLElement>('.ds-nav-item__sub-nav');
    const events: boolean[] = [];
    page.body.addEventListener('dsMenuItemClick', (event: CustomEvent) => events.push(event.detail.isSelected));
    return { page, item, toggle, link, subNav, events };
  };

  it('a main navigation is a navigation landmark named by label, and a list of its items', async () => {
    const { page } = await render();
    const [main, sub, subSub] = Array.from(page.body.querySelectorAll('ds-nav'));

    expect(main).toEqualAttributes({ 'role': 'navigation', 'aria-label': 'Main' });
    expect(main.querySelector('.ds-nav')).toEqualAttribute('role', 'list');
    expect(Array.from(main.querySelectorAll('ds-nav-item')).map(item => item.getAttribute('role'))).toEqual(['listitem', 'listitem', 'listitem', 'listitem', 'listitem']);
    // A sub-navigation is a list, not a landmark.
    for (const nav of [sub, subSub]) {
      expect(nav).not.toHaveAttribute('role');
      expect(nav.querySelector('.ds-nav')).toEqualAttribute('role', 'list');
    }
  });

  it('is not a landmark in a nav element, and keeps a role of its own', async () => {
    const { page } = await render(
      '<nav aria-label="Site"><ds-nav label="Main"><ds-nav-item><a href="/">Home</a></ds-nav-item></ds-nav></nav><ds-nav role="menu" label="Tools"></ds-nav>',
    );
    const [inNav, withRole] = Array.from(page.body.querySelectorAll('ds-nav'));

    expect(inNav).not.toHaveAttribute('role');
    expect(inNav).not.toHaveAttribute('aria-label');
    expect(withRole).toEqualAttributes({ 'role': 'menu', 'aria-label': 'Tools' });
  });

  it('an item outside of a ds-nav is not a list item', async () => {
    const { page } = await render('<ds-nav-item><a href="/">Home</a></ds-nav-item>');

    expect(page.body.querySelector('ds-nav-item')).not.toHaveAttribute('role');
  });

  it('the link of the current page (is-active) has aria-current="page", unless it has its own', async () => {
    const { page, link, item } = await render();

    expect(link('Home')).toEqualAttribute('aria-current', 'page');
    expect(link('About')).not.toHaveAttribute('aria-current');

    item('Home').isActive = false;
    await page.waitForChanges();
    expect(link('Home')).not.toHaveAttribute('aria-current');

    const own = await render('<ds-nav><ds-nav-item is-active><a href="/a" aria-current="location">A</a></ds-nav-item></ds-nav>');
    own.item('A').isActive = false;
    await own.page.waitForChanges();
    expect(own.link('A')).toEqualAttribute('aria-current', 'location');
  });

  it('the expand button is named after the item, and controls the sub-navigation (aria-expanded, aria-controls)', async () => {
    const { toggle, subNav } = await render();

    expect(toggle('About')).toEqualAttributes({
      'role': 'button',
      'tabindex': '0',
      'aria-label': 'About us submenu',
      'aria-expanded': 'false',
      'aria-controls': subNav('About').id,
    });
    expect(subNav('About').id).toMatch(/^ds-nav-item-\d+-sub-nav$/);
  });

  it('label and toggle-label name the expand button', async () => {
    const { toggle } = await render(
      '<ds-nav><ds-nav-item has-children label="Company" toggle-label="Sous-menu {label}"><a href="/a">A</a><ds-nav slot="children"></ds-nav></ds-nav-item></ds-nav>',
    );

    expect(toggle('A')).toEqualAttribute('aria-label', 'Sous-menu Company');
  });

  it('a click on the expand button opens and closes the sub-navigation; is-active stays the current page', async () => {
    const { page, item, toggle, events } = await render();
    const about = item('About');

    toggle('About').click();
    await page.waitForChanges();
    expect(toggle('About')).toEqualAttribute('aria-expanded', 'true');
    expect(about.querySelector('.ds-nav-item')).toHaveClasses(['--open', '--active']);
    expect(about).not.toHaveAttribute('is-active');

    toggle('About').click();
    await page.waitForChanges();
    await wait(10);
    expect(toggle('About')).toEqualAttribute('aria-expanded', 'false');
    expect(about.querySelector('.ds-nav-item')).not.toHaveClass('--open');
    expect(about.querySelector('.ds-nav-item')).not.toHaveClass('--active');
    expect(events).toEqual([true, false]);
  });

  it('animates the height of the sub-navigation, and lets it follow its content once open, without waiting for transitionend', async () => {
    const { page, toggle, subNav } = await render();
    const elementPrototype = Object.getPrototypeOf(Object.getPrototypeOf(page.doc.createElement('div')));
    Object.defineProperty(elementPrototype, 'offsetHeight', { configurable: true, get: () => 80 });

    try {
      toggle('About').click();
      await page.waitForChanges();
      expect(subNav('About').style.height).toBe('auto');

      toggle('About').click();
      await page.waitForChanges();
      await wait(10);
      expect(subNav('About').style.height).toBe('0');
    } finally {
      delete elementPrototype.offsetHeight;
    }
  });

  it('Escape in an open sub-navigation closes it and gives the focus to its expand button; the key press goes no further', async () => {
    const { page, toggle, link, events } = await render();
    const getFocused = trackFocus(page);
    const outer = jest.fn();
    page.body.addEventListener('keydown', outer);

    toggle('About').click();
    await page.waitForChanges();
    link('Team').focus();
    const event = keydown(link('Team'), 'Escape');
    await page.waitForChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
    expect(getFocused()).toBe(toggle('About'));
    expect(toggle('About')).toEqualAttribute('aria-expanded', 'false');
    expect(events).toEqual([true, false]);

    // Nothing to close: the key press goes on.
    expect(keydown(toggle('About'), 'Escape').defaultPrevented).toBe(false);
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it('Escape closes the innermost open sub-navigation only', async () => {
    const { page, toggle, link } = await render();
    const getFocused = trackFocus(page);

    toggle('About').click();
    await page.waitForChanges();
    toggle('Jobs').click();
    await page.waitForChanges();
    keydown(link('Developers'), 'Escape');
    await page.waitForChanges();

    expect(getFocused()).toBe(toggle('Jobs'));
    expect(toggle('Jobs')).toEqualAttribute('aria-expanded', 'false');
    expect(toggle('About')).toEqualAttribute('aria-expanded', 'true');
  });

  it('where the sub-navigation drops down (no expand button), Escape hides it until the focus and the pointer leave the item', async () => {
    const { page, item, link } = await render(NAV, { display: 'none' });
    const getFocused = trackFocus(page);
    const about = item('About').querySelector('.ds-nav-item');

    link('Team').focus();
    const event = keydown(link('Team'), 'Escape');
    await page.waitForChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(about).toHaveClass('--dismissed');
    expect(getFocused()).toBe(link('About'));

    // The focus that moves into the sub-navigation shows it again.
    link('Team').focus();
    await page.waitForChanges();
    expect(about).not.toHaveClass('--dismissed');

    keydown(link('Team'), 'Escape');
    await page.waitForChanges();
    expect(about).toHaveClass('--dismissed');
    link('Home').focus();
    await page.waitForChanges();
    expect(about).not.toHaveClass('--dismissed');
  });

  it('where the sub-navigation drops down, Escape hides the one under the pointer while the focus is elsewhere', async () => {
    const { page, item } = await render(NAV, { display: 'none' });
    const about = item('About');
    const matches = about.matches.bind(about);
    jest.spyOn(about, 'matches').mockImplementation((selector: string) => selector === ':hover' || matches(selector));

    keydown(page.body, 'Escape');
    await page.waitForChanges();
    expect(about.querySelector('.ds-nav-item')).toHaveClass('--dismissed');

    about.dispatchEvent(new MouseEvent('mouseleave'));
    await page.waitForChanges();
    expect(about.querySelector('.ds-nav-item')).not.toHaveClass('--dismissed');
  });

  it('waits for the sub-navigation with waitForTransition', () => {
    const source = readFileSync(join(__dirname, 'nav-item/nav-item.tsx'), 'utf8');

    expect(source).toContain('waitForTransition(subNav');
    expect(source).not.toMatch(/addEventListener\(\s*'transitionend'/);
  });
});
