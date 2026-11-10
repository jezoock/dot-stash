import { describe, expect, it } from 'vitest';
import { accessibleNode, mount, nextFrame, setForcedColors } from '../../../test/helpers/browser';

/** The relative luminance of an `rgb()` color (WCAG 2). */
const luminance = (color: string) => {
  const [r, g, b] = color
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(value => Number(value) / 255)
    .map(value => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

describe('ds-badge in a browser', () => {
  it('is part of the name of its link or button: its label instead of its visible text, with the true count', async () => {
    await mount(`
      <a id="labelled" href="#">Inbox <ds-badge count="150" max="99" label='{"one": "{count} unread message", "other": "{count} unread messages"}'></ds-badge></a>
      <a id="one" href="#">Inbox <ds-badge count="1" label='{"one": "{count} unread message", "other": "{count} unread messages"}'></ds-badge></a>
      <a id="plain" href="#">Inbox <ds-badge count="150" max="99"></ds-badge></a>
      <a id="text" href="#">Orders <ds-badge type="success">Paid</ds-badge></a>
      <button id="dot" type="button">Messages <ds-badge dot type="error" label="New messages"></ds-badge></button>
      <p>Status: <ds-badge id="alone" type="warning">Late</ds-badge></p>`);

    expect(await accessibleNode('#labelled')).toMatchObject({ role: 'link', name: 'Inbox 150 unread messages' });
    expect(await accessibleNode('#one')).toMatchObject({ role: 'link', name: 'Inbox 1 unread message' });
    expect(await accessibleNode('#plain')).toMatchObject({ role: 'link', name: 'Inbox 99+' });
    expect(await accessibleNode('#text')).toMatchObject({ role: 'link', name: 'Orders Paid' });
    expect(await accessibleNode('#dot')).toMatchObject({ role: 'button', name: 'Messages New messages' });
    // Not interactive, no role of its own (a generic element, its text in the paragraph), not a live region.
    const alone = await accessibleNode('#alone');
    expect([alone?.role ?? 'none', alone?.name ?? '', alone?.properties.live, alone?.properties.focusable]).toEqual([
      expect.stringMatching(/^(generic|none)$/),
      '',
      undefined,
      undefined,
    ]);
    expect(Array.from(document.querySelectorAll('ds-badge')).filter(badge => badge.closest('[aria-live], [role="status"], [role="alert"]'))).toEqual([]);
  });

  it('hides its label on the screen and shows the capped count; a figure in a circle', async () => {
    const badge = await mount('<ds-badge count="150" max="99" label="{count} unread messages"></ds-badge><ds-badge id="one" count="3"></ds-badge>');
    const label = badge.querySelector('.ds-badge__label');
    const one = document.querySelector('#one').getBoundingClientRect();

    expect([label.getBoundingClientRect().width, getComputedStyle(label).clipPath]).toEqual([1, 'inset(50%)']);
    expect(badge.querySelector('.ds-badge__text').getBoundingClientRect().width).toBeGreaterThan(10);
    expect(Math.abs(one.width - one.height)).toBeLessThan(1);
  });

  it('gives its text a contrast of 4.5:1 at least with its background, for each type', async () => {
    await mount(['neutral', 'info', 'success', 'warning', 'error'].map(type => `<ds-badge type="${type}">${type}</ds-badge>`).join(' '));

    for (const badge of Array.from(document.querySelectorAll('ds-badge'))) {
      const style = getComputedStyle(badge);
      expect([badge.textContent, contrast(style.color, style.backgroundColor)]).toEqual([badge.textContent, expect.any(Number)]);
      expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('draws a dot in the color of its type, its text hidden on the screen', async () => {
    const dot = await mount('<ds-badge dot type="error">New</ds-badge>');
    const style = getComputedStyle(dot);
    const box = dot.getBoundingClientRect();

    // 0.625 em of the small text of the badge.
    expect([box.width, box.height]).toEqual([parseFloat(style.fontSize) * 0.625, parseFloat(style.fontSize) * 0.625]);
    expect([style.backgroundColor, style.borderRadius]).toEqual(['rgb(220, 38, 38)', '999px']);
    expect(getComputedStyle(dot.querySelector('.ds-badge__text')).clipPath).toBe('inset(50%)');
  });

  it('keeps the outline of a badge and the dot visible in forced colors', async () => {
    await mount(
      '<p>Status: <ds-badge id="text" type="success">Paid</ds-badge></p><button type="button">Messages <ds-badge id="dot" dot type="error" label="New"></ds-badge></button>',
    );
    await setForcedColors(true);
    await nextFrame();
    const text = getComputedStyle(document.querySelector('#text'));
    const dot = getComputedStyle(document.querySelector('#dot'));
    const button = getComputedStyle(document.querySelector('button'));

    // The text badge: an outline in the color of its text, which the background of the page does not hide.
    expect([text.borderTopStyle, text.borderTopWidth, text.borderTopColor]).toEqual(['solid', '1px', text.color]);
    expect(contrast(text.color, text.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    // The dot: painted in the color of the text of its button, not the background.
    expect([dot.forcedColorAdjust, dot.backgroundColor]).toEqual(['preserve-parent-color', button.color]);
    expect(dot.backgroundColor).not.toBe(button.backgroundColor);
  });

  it('right to left: in the flow of the text, after the word before it', async () => {
    document.documentElement.dir = 'rtl';
    const link = await mount<HTMLAnchorElement>('<a href="#">صندوق <ds-badge count="3"></ds-badge></a>');
    const badge = link.querySelector('ds-badge').getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(link.firstChild);

    expect(badge.right).toBeLessThanOrEqual(range.getBoundingClientRect().left + 1);
  });
});
