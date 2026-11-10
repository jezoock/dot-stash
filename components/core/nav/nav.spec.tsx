import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import './nav';
import './nav-item/nav-item';
import '../trigger/trigger';
import { fakeMatchMedia, keydown, mockComputedStyle, mockLayout, renderPage, trackFocus, wait } from '../../../test/helpers';

/**
 * The spec tests have no CSS engine: the computed style the components read. The transition of the sub-navigation, and
 * the theme tokens (`--ds-bp-md`), none by default: the mode then comes from the fallback width, 992 px. `display` is
 * `none`, as the expand button from md: the mode does not come from it.
 */
const mockStyle = (transitionDuration = '0s', tokens: Record<string, string> = {}) =>
  mockComputedStyle({ display: 'none', transitionDuration, transitionDelay: '0s', getPropertyValue: (name: string) => tokens[name] ?? '' });

/** Widths below and from md (992 px, the fallback): the collapsible and the drop-down sub-navigations. */
const COLLAPSIBLE = 800;
const DROP_DOWN = 1280;

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
  afterEach(() => vi.restoreAllMocks());

  const render = async (html = NAV, { width = COLLAPSIBLE, transitionDuration = '0s', tokens = {} } = {}) => {
    const page = await renderPage('');
    // The page is reset first, then getComputedStyle and matchMedia are mocked for its content.
    mockStyle(transitionDuration, tokens);
    const media = fakeMatchMedia(width);
    await page.setContent(html);
    await page.waitForChanges();
    const item = (text: string) => Array.from(page.body.querySelectorAll('ds-nav-item')).find(element => element.querySelector('a').textContent.startsWith(text));
    const toggle = (text: string) => item(text).querySelector<HTMLElement>('.ds-nav-item__expand-button > ds-trigger');
    const link = (text: string) => item(text).querySelector<HTMLElement>('a');
    const subNav = (text: string) => item(text).querySelector<HTMLElement>('.ds-nav-item__sub-nav');
    const events: boolean[] = [];
    page.body.addEventListener('dsMenuItemClick', (event: CustomEvent) => events.push(event.detail.isSelected));
    const resizeTo = async (newWidth: number) => {
      media.resize(newWidth);
      await page.waitForChanges();
    };
    return { page, item, toggle, link, subNav, events, media, resizeTo };
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
    const removeLayout = mockLayout({ offsetHeight: () => 80 });

    try {
      toggle('About').click();
      await page.waitForChanges();
      expect(subNav('About').style.height).toBe('auto');

      toggle('About').click();
      await page.waitForChanges();
      await wait(10);
      expect(subNav('About').style.height).toBe('0');
    } finally {
      removeLayout();
    }
  });

  it('Escape in an open sub-navigation closes it and gives the focus to its expand button; the key press goes no further', async () => {
    const { page, toggle, link, events } = await render();
    const getFocused = trackFocus();
    const outer = vi.fn();
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
    const getFocused = trackFocus();

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
    const { page, item, link } = await render(NAV, { width: DROP_DOWN });
    const getFocused = trackFocus();
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
    const { page, item } = await render(NAV, { width: DROP_DOWN });
    const about = item('About');
    const matches = about.matches.bind(about);
    vi.spyOn(about, 'matches').mockImplementation((selector: string) => selector === ':hover' || matches(selector));

    keydown(page.body, 'Escape');
    await page.waitForChanges();
    expect(about.querySelector('.ds-nav-item')).toHaveClass('--dismissed');

    about.dispatchEvent(new MouseEvent('mouseleave'));
    await page.waitForChanges();
    expect(about.querySelector('.ds-nav-item')).not.toHaveClass('--dismissed');
  });

  describe('the mode of the theme (md)', () => {
    /** Escape in the link of Team (in the sub-navigation of About): closed (collapsible) or dismissed (drop-down). */
    const escapeInTeam = async ({ page, link }: Awaited<ReturnType<typeof render>>) => {
      link('Team').focus();
      const event = keydown(link('Team'), 'Escape');
      await page.waitForChanges();
      return event.defaultPrevented;
    };

    it('watches the media query of the md breakpoint of the theme, not the display of the expand button', async () => {
      const { media } = await render(NAV, { tokens: { '--ds-bp-md': '1024px' } });

      // One per item: the five items of NAV.
      expect(media.listened()).toEqual(Array(5).fill('(min-width: 1024px)'));
    });

    it('is collapsible below md and drop-down from md, at the fallback width without the theme (992 px)', async () => {
      const collapsible = await render(NAV, { width: 991.5 });
      collapsible.toggle('About').click();
      await collapsible.page.waitForChanges();
      expect(await escapeInTeam(collapsible)).toBe(true);
      expect(collapsible.toggle('About')).toEqualAttribute('aria-expanded', 'false');
      expect(collapsible.item('About').querySelector('.ds-nav-item')).not.toHaveClass('--dismissed');

      const dropDown = await render(NAV, { width: 992 });
      expect(await escapeInTeam(dropDown)).toBe(true);
      expect(dropDown.item('About').querySelector('.ds-nav-item')).toHaveClass('--dismissed');
    });

    it('closes an open sub-navigation when the viewport reaches md, without dsMenuItemClick, and leaves its height to the theme', async () => {
      const nav = await render();
      const { page, item, toggle, subNav, events, resizeTo } = nav;
      const removeLayout = mockLayout({ offsetHeight: () => 80 });

      try {
        toggle('About').click();
        await page.waitForChanges();
        expect(subNav('About').style.height).toBe('auto');

        await resizeTo(DROP_DOWN);
        expect(toggle('About')).toEqualAttribute('aria-expanded', 'false');
        expect(item('About').querySelector('.ds-nav-item')).not.toHaveClasses(['--open', '--active']);
        expect(subNav('About').style.height).toBe('');
        expect(events).toEqual([true]);

        // Back below md: still closed, its links hidden by the theme (no inline height).
        await resizeTo(COLLAPSIBLE);
        expect(toggle('About')).toEqualAttribute('aria-expanded', 'false');
        expect(subNav('About').style.height).toBe('');
      } finally {
        removeLayout();
      }
    });

    it('drops the height a closing sub-navigation was going to get when the viewport reaches md', async () => {
      const { page, toggle, subNav, resizeTo } = await render();

      toggle('About').click();
      await page.waitForChanges();
      toggle('About').click();
      await resizeTo(DROP_DOWN);
      await wait(10);

      expect(subNav('About').style.height).toBe('');
    });

    it('shows a dismissed drop-down again below md, and keeps open there the sub-navigation that has the focus', async () => {
      const nav = await render(NAV, { width: DROP_DOWN });
      const { page, item, toggle, link, resizeTo } = nav;
      const getFocused = trackFocus();

      expect(await escapeInTeam(nav)).toBe(true);
      expect(item('About').querySelector('.ds-nav-item')).toHaveClass('--dismissed');
      link('Team').focus();
      await page.waitForChanges();

      await resizeTo(COLLAPSIBLE);
      expect(item('About').querySelector('.ds-nav-item')).not.toHaveClass('--dismissed');
      // The focus is in the sub-navigation of About: it is open, so that its link stays shown.
      expect(getFocused()).toBe(link('Team'));
      expect(toggle('About')).toEqualAttribute('aria-expanded', 'true');
      expect(toggle('Jobs')).toEqualAttribute('aria-expanded', 'false');

      // The Escape of the collapsible mode: it closes it, and gives the focus to its expand button.
      expect(await escapeInTeam(nav)).toBe(true);
      expect(toggle('About')).toEqualAttribute('aria-expanded', 'false');
      expect(getFocused()).toBe(toggle('About'));
    });

    it('stops watching the media query when it leaves the document, and watches it again when it is put back', async () => {
      const { page, media, item } = await render(NAV, { width: DROP_DOWN });
      const nav = page.body.querySelector('ds-nav');

      nav.remove();
      await page.waitForChanges();
      expect(media.listened()).toEqual([]);

      page.body.appendChild(nav);
      await page.waitForChanges();
      expect(media.listened()).toHaveLength(5);
      expect(item('About').querySelector('.ds-nav-item')).not.toHaveClass('--dismissed');
    });
  });

  it('waits for the sub-navigation with waitForTransition', () => {
    const source = readFileSync(join(__dirname, 'nav-item/nav-item.tsx'), 'utf8');

    expect(source).toContain('waitForTransition(subNav');
    expect(source).not.toMatch(/addEventListener\(\s*'transitionend'/);
  });
});
