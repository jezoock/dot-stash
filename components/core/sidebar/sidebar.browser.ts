import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, mount, nextEvent, recordEvents } from '../../../test/helpers/browser';

type Sidebar = HTMLDsSidebarElement & HTMLElement;

describe('ds-sidebar in a browser', () => {
  const render = async () => {
    await mount(
      '<button id="opener">Menu</button><ds-sidebar label="Main menu"><a href="#home" id="home">Home</a><a href="#about">About</a></ds-sidebar><button id="after">After</button>',
    );
    const sidebar = document.querySelector<Sidebar>('ds-sidebar');
    const opener = document.querySelector<HTMLElement>('#opener');
    opener.addEventListener('click', () => sidebar.show());
    return { sidebar, opener };
  };

  it('hidden, it is out of the Tab order (inert); shown, it is a named landmark that has the focus', async () => {
    const { sidebar, opener } = await render();
    opener.focus();

    await userEvent.tab();
    expect(focused()).toBe(document.querySelector('#after'));
    expect(sidebar.matches('[inert]') || !!sidebar.querySelector('[inert]')).toBe(true);

    const shown = nextEvent(sidebar, 'sidebarShown');
    await userEvent.click(opener);
    await shown;

    expect(focused()).toBe(sidebar.querySelector('#home'));
    expect([sidebar.getAttribute('role'), sidebar.getAttribute('aria-label')]).toEqual(['complementary', 'Main menu']);
    expect(getComputedStyle(sidebar).visibility).toBe('visible');
  });

  it('Escape, with the focus in it, hides it and gives the focus back to the opener', async () => {
    const { sidebar, opener } = await render();
    const events = recordEvents(sidebar, ['sidebarShow', 'sidebarShown', 'sidebarHide', 'sidebarHidden']);
    const shown = nextEvent(sidebar, 'sidebarShown');
    await userEvent.click(opener);
    await shown;
    expect(focused()).toBe(sidebar.querySelector('#home'));

    const hidden = nextEvent(sidebar, 'sidebarHidden');
    await userEvent.keyboard('{Escape}');
    await hidden;

    expect(sidebar.isShown).toBe(false);
    expect(focused()).toBe(opener);
    expect(events).toEqual(['sidebarShow', 'sidebarShown', 'sidebarHide', 'sidebarHidden']);
  });

  it('Escape with the focus outside leaves it shown', async () => {
    const { sidebar, opener } = await render();
    await userEvent.click(opener);
    await expect.poll(focused).toBe(sidebar.querySelector('#home'));
    document.querySelector<HTMLElement>('#after').focus();

    await userEvent.keyboard('{Escape}');

    expect(sidebar.isShown).toBe(true);
  });
});
