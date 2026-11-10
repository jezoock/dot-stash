import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { focused, mount, recordEvents } from '../../../test/helpers/browser';

const NAV = `<ds-nav mods="main" label="Main">
  <ds-nav-item is-active><a href="#home">Home</a></ds-nav-item>
  <ds-nav-item has-children><a href="#about">About</a>
    <ds-nav slot="children">
      <ds-nav-item><a href="#team">Team</a></ds-nav-item>
      <ds-nav-item><a href="#jobs">Jobs</a></ds-nav-item>
    </ds-nav>
  </ds-nav-item>
  <ds-nav-item><a href="#contact">Contact</a></ds-nav-item>
</ds-nav><button id="after">After</button>`;

/** Below md (992 px, the theme): the collapsible sub-navigation; from md: the drop-down one. */
const COLLAPSIBLE = 800;
const DROP_DOWN = 1280;

describe('ds-nav in a browser', () => {
  const render = async (width: number) => {
    await page.viewport(width, 800);
    await mount(NAV);
    const item = (text: string) => Array.from(document.querySelectorAll('ds-nav-item')).find(element => element.querySelector('a').textContent === text);
    const link = (text: string) => item(text).querySelector<HTMLElement>('a');
    const toggle = (text: string) => item(text).querySelector<HTMLElement>('.ds-nav-item__expand-button > ds-trigger');
    const subNav = (text: string) => item(text).querySelector<HTMLElement>('.ds-nav-item__sub-nav');
    const expandButton = (text: string) => item(text).querySelector<HTMLElement>('.ds-nav-item__expand-button');
    // The theme hides a collapsed sub-navigation (visibility) and a drop-down one (opacity, which fades).
    const isShown = (text: string) => {
      const style = getComputedStyle(subNav(text));
      return style.visibility === 'visible' && style.opacity === '1';
    };
    const clicks = recordEvents(document, ['dsMenuItemClick'], event => (event as CustomEvent).detail.isSelected);
    return { item, link, toggle, expandButton, subNav, isShown, clicks };
  };

  describe('collapsible sub-navigation (below md): disclosure', () => {
    it('Tab skips the collapsed sub-navigation; Enter and Space on the expand button open and close it', async () => {
      const { link, toggle, isShown, clicks } = await render(COLLAPSIBLE);
      expect(toggle('About').getAttribute('aria-expanded')).toBe('false');
      expect(isShown('About')).toBe(false);

      link('About').focus();
      await userEvent.tab();
      expect(focused()).toBe(toggle('About'));
      expect(toggle('About').getAttribute('aria-label')).toBe('About submenu');
      await userEvent.tab();
      expect(focused()).toBe(link('Contact'));

      toggle('About').focus();
      await userEvent.keyboard('{Enter}');
      expect(toggle('About').getAttribute('aria-expanded')).toBe('true');
      await expect.poll(() => isShown('About')).toBe(true);
      await userEvent.tab();
      expect(focused()).toBe(link('Team'));

      toggle('About').focus();
      await userEvent.keyboard(' ');
      expect(toggle('About').getAttribute('aria-expanded')).toBe('false');
      await expect.poll(() => isShown('About')).toBe(false);
      expect(clicks).toEqual([true, false]);
    });

    it('Escape in the open sub-navigation closes it and gives the focus to its expand button; the key press goes no further', async () => {
      const { link, toggle, isShown } = await render(COLLAPSIBLE);
      toggle('About').focus();
      await userEvent.keyboard('{Enter}');
      await expect.poll(() => isShown('About')).toBe(true);
      link('Jobs').focus();
      const keys = recordEvents(document.body, ['keydown'], event => (event as KeyboardEvent).key);

      await userEvent.keyboard('{Escape}');

      expect(focused()).toBe(toggle('About'));
      expect(toggle('About').getAttribute('aria-expanded')).toBe('false');
      await expect.poll(() => isShown('About')).toBe(false);
      expect(keys).toEqual([]);
    });
  });

  describe('drop-down sub-navigation (from md)', () => {
    it('has no expand button: the sub-navigation shows while the focus is in the item, its links after the link of the item', async () => {
      const { link, expandButton, isShown } = await render(DROP_DOWN);
      expect(getComputedStyle(expandButton('About')).display).toBe('none');
      expect(isShown('About')).toBe(false);

      link('About').focus();
      await expect.poll(() => isShown('About')).toBe(true);
      await userEvent.tab();
      expect(focused()).toBe(link('Team'));
    });

    it('Escape hides it and gives the focus to the link of the item; it shows again when the focus moves into it', async () => {
      const { link, item, isShown } = await render(DROP_DOWN);
      link('Team').focus();
      await expect.poll(() => isShown('About')).toBe(true);

      await userEvent.keyboard('{Escape}');

      expect(focused()).toBe(link('About'));
      await expect.poll(() => isShown('About')).toBe(false);
      expect(item('About').querySelector('.ds-nav-item')).toHaveClass('--dismissed');

      await userEvent.tab();
      expect(focused()).toBe(link('Team'));
      await expect.poll(() => isShown('About')).toBe(true);
    });

    it('Escape with the focus elsewhere hides the one under the pointer', async () => {
      const { link, isShown } = await render(DROP_DOWN);
      await userEvent.hover(link('About'));
      await expect.poll(() => isShown('About')).toBe(true);
      document.querySelector<HTMLElement>('#after').focus();

      await userEvent.keyboard('{Escape}');

      await expect.poll(() => isShown('About')).toBe(false);
    });
  });

  describe('responsive: the mode follows the media query of md', () => {
    it('crossing md switches the mode at once: an open collapsible sub-navigation closes, without dsMenuItemClick', async () => {
      const { toggle, expandButton, subNav, isShown, clicks } = await render(COLLAPSIBLE);
      toggle('About').focus();
      await userEvent.keyboard('{Enter}');
      await expect.poll(() => isShown('About')).toBe(true);
      document.querySelector<HTMLElement>('#after').focus();

      await page.viewport(991, 800);
      expect(toggle('About').getAttribute('aria-expanded')).toBe('true');

      await page.viewport(992, 800);
      await expect.poll(() => toggle('About').getAttribute('aria-expanded')).toBe('false');
      expect(getComputedStyle(expandButton('About')).display).toBe('none');
      await expect.poll(() => isShown('About')).toBe(false);

      // Back below md: closed (collapsed at once, hidden at the end of the transition of the theme).
      await page.viewport(991, 800);
      await expect.poll(() => getComputedStyle(expandButton('About')).display).not.toBe('none');
      expect([toggle('About').getAttribute('aria-expanded'), subNav('About').offsetHeight]).toEqual(['false', 0]);
      await expect.poll(() => isShown('About')).toBe(false);
      expect(clicks).toEqual([true]);
    });
  });
});
