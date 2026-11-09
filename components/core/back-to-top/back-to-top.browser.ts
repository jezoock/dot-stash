import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { accessibleNode, focused, mount, nextEvent, nextFrame, setForcedColors, setReducedMotion } from '../../../test/helpers/browser';

/** A long page: a header with a link, a main landmark with a heading and a link, then the back-to-top link. */
const PAGE = `
  <header><a id="home" href="#">Home</a></header>
  <main id="main"><h1 id="title">Products</h1><div id="long" style="height: 3000px"></div><a id="last" href="#">Last link</a></main>
  <ds-back-to-top threshold="400"></ds-back-to-top>`;

/** Scrolls the window and waits for the frame that reads it. */
const scrollWindow = async (y: number) => {
  window.scrollTo({ top: y, behavior: 'instant' });
  await nextFrame();
  await nextFrame();
};

describe('ds-back-to-top in a browser', () => {
  it('before the threshold: not shown, not focusable, not in the accessibility tree; after it: a link named "Back to top"', async () => {
    await mount(PAGE);
    const element = document.querySelector('ds-back-to-top');
    const link = element.querySelector<HTMLAnchorElement>('.ds-back-to-top__link');

    expect([getComputedStyle(element).visibility, link.inert]).toEqual(['hidden', true]);
    await expect.poll(() => getComputedStyle(element).opacity).toBe('0');
    expect(await accessibleNode('.ds-back-to-top__link')).toBeNull();
    document.querySelector<HTMLElement>('#last').focus();
    await userEvent.tab();
    expect(focused()).not.toBe(link);

    await scrollWindow(401);
    await expect.poll(() => getComputedStyle(element).visibility).toBe('visible');
    expect(await accessibleNode('.ds-back-to-top__link')).toMatchObject({ role: 'link', name: 'Back to top', properties: { focusable: true } });
    document.querySelector<HTMLElement>('#last').focus();
    await userEvent.tab();
    expect(focused()).toBe(link);
  });

  it('shows without moving the page: fixed in the bottom right corner, a target of 44 px', async () => {
    await mount(PAGE);
    const element = document.querySelector('ds-back-to-top');
    const title = document.querySelector('#title');
    const before = [title.getBoundingClientRect().top, document.documentElement.scrollHeight];

    await scrollWindow(500);
    await expect.poll(() => element.classList.contains('--shown')).toBe(true);

    expect([title.getBoundingClientRect().top + 500, document.documentElement.scrollHeight]).toEqual(before);
    const box = element.querySelector('.ds-back-to-top__link').getBoundingClientRect();
    expect([box.width, box.height]).toEqual([44, 44]);
    // 2rem from the edges from md (the viewport of the tests is 1280 px wide).
    expect([window.innerWidth - box.right, window.innerHeight - box.bottom]).toEqual([32, 32]);
    expect(getComputedStyle(element).position).toBe('fixed');
  });

  it('Enter scrolls smoothly to the top and moves the focus to the target', async () => {
    await mount(PAGE.replace('threshold="400"', 'threshold="400" target="#title"'));
    const element = document.querySelector('ds-back-to-top');
    const link = element.querySelector<HTMLElement>('.ds-back-to-top__link');
    const title = document.querySelector<HTMLElement>('#title');
    await scrollWindow(2000);
    await expect.poll(() => link.inert).toBe(false);
    link.focus();
    const event = nextEvent<CustomEvent<{ target: HTMLElement }>>(element, 'backToTop');

    await userEvent.keyboard('{Enter}');

    expect((await event).detail.target).toBe(title);
    expect([focused(), title.getAttribute('tabindex'), location.hash]).toEqual([title, '-1', '']);
    // Smooth: still on its way just after.
    expect(window.scrollY).toBeGreaterThan(0);
    await expect.poll(() => window.scrollY, { timeout: 3000 }).toBe(0);
    await expect.poll(() => element.classList.contains('--hidden')).toBe(true);

    // Tab goes on from the top; the heading loses its tabindex with the focus.
    await userEvent.tab();
    expect([focused()?.id, title.hasAttribute('tabindex')]).toEqual(['last', false]);
  });

  it('with less motion, a click scrolls to the top at once; without a target, the focus goes to the main landmark', async () => {
    await setReducedMotion(true);
    await mount(PAGE);
    const link = document.querySelector<HTMLElement>('.ds-back-to-top__link');
    const main = document.querySelector<HTMLElement>('main');
    await scrollWindow(2000);
    await expect.poll(() => link.inert).toBe(false);

    // The link of the page, by its role and name, as the browser computes them.
    await page.getByRole('link', { name: 'Back to top' }).click();

    expect(window.scrollY).toBe(0);
    expect([focused(), main.getAttribute('tabindex')]).toEqual([main, '-1']);
    expect(await accessibleNode('main')).toMatchObject({ role: 'main', properties: { focused: true } });
  });

  it('stays shown while it has the focus, above the threshold too', async () => {
    await mount(PAGE);
    const element = document.querySelector('ds-back-to-top');
    const link = element.querySelector<HTMLElement>('.ds-back-to-top__link');
    await scrollWindow(1000);
    await expect.poll(() => link.inert).toBe(false);
    link.focus();

    await scrollWindow(0);
    expect([element.classList.contains('--shown'), focused()]).toEqual([true, link]);

    document.querySelector<HTMLElement>('#home').focus();
    await expect.poll(() => element.classList.contains('--hidden')).toBe(true);
  });

  it('right to left: in the bottom left corner', async () => {
    document.documentElement.dir = 'rtl';
    await mount(PAGE);
    await scrollWindow(500);
    const box = document.querySelector('.ds-back-to-top__link').getBoundingClientRect();

    expect([box.left, window.innerHeight - box.bottom]).toEqual([32, 32]);
  });

  it('keeps its outline, its arrow and the focus indicator visible in forced colors', async () => {
    await mount(PAGE);
    await scrollWindow(500);
    await setForcedColors(true);
    await nextFrame();
    const link = document.querySelector<HTMLElement>('.ds-back-to-top__link');
    const style = getComputedStyle(link);
    const arrow = getComputedStyle(link, '::before');

    expect([style.borderTopStyle, style.borderTopColor]).toEqual(['solid', style.color]);
    expect([arrow.forcedColorAdjust, arrow.backgroundColor, arrow.content]).toEqual(['preserve-parent-color', style.color, '"" / ""']);
    document.querySelector<HTMLElement>('#last').focus();
    await userEvent.tab();
    expect([focused(), getComputedStyle(link).outlineStyle, getComputedStyle(link).outlineWidth]).toEqual([link, 'solid', '2px']);
  });
});
