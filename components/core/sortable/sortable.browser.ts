import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { accessibleNode, focused, mount, recordEvents } from '../../../test/helpers/browser';

const LIST = (attributes = '') => `
  <ds-sortable label="Services" ${attributes}>
    <div data-key="netflix">Netflix</div>
    <div data-key="plex">Plex</div>
    <div data-key="arte">Arte</div>
  </ds-sortable>`;

const sortableOf = () => document.querySelector('ds-sortable');
const keys = () =>
  Array.from(sortableOf().children)
    .filter(child => child.hasAttribute('data-key'))
    .map(child => child.getAttribute('data-key'));
const item = (key: string) => document.querySelector<HTMLElement>(`[data-key="${key}"]`);
const status = () => document.querySelector('.ds-sortable__status').textContent.replace(/\u00a0$/, '');

describe('ds-sortable in a browser', () => {
  it('a named list of items, each one focusable and described by the instructions; the live region read, not shown', async () => {
    await mount(LIST());

    expect(await accessibleNode('ds-sortable')).toMatchObject({ role: 'list', name: 'Services' });
    expect(await accessibleNode('[data-key="plex"]')).toMatchObject({
      role: 'listitem',
      name: 'Plex',
      description: expect.stringMatching(/^To move this item, press Space or Enter/),
      properties: { focusable: true },
    });
    expect(await accessibleNode('.ds-sortable__instructions')).toBeNull();
    expect(await accessibleNode('.ds-sortable__status')).toMatchObject({ properties: { live: 'polite', atomic: true } });
    const box = document.querySelector('.ds-sortable__status').getBoundingClientRect();
    expect([box.width, box.height]).toEqual([1, 1]);
  });

  it('with the keyboard: Tab, Space, the arrows, Space; the focus stays on the item, each step told, orderChange once', async () => {
    await mount(`<button>Before</button>${LIST()}`);
    const changes = recordEvents(sortableOf(), ['orderChange'], event => (event as CustomEvent).detail);
    document.querySelector('button').focus();

    await userEvent.tab();
    expect(focused()).toBe(item('netflix'));
    await userEvent.keyboard(' ');
    expect(status()).toBe('Netflix picked up, position 1 of 3.');
    expect(item('netflix').classList.contains('--grabbed')).toBe(true);

    await userEvent.keyboard('{ArrowDown}');
    expect(keys()).toEqual(['plex', 'netflix', 'arte']);
    expect(status()).toBe('Netflix moved to position 2 of 3.');
    await userEvent.keyboard('{ArrowDown}');
    expect([keys(), focused()]).toEqual([['plex', 'arte', 'netflix'], item('netflix')]);
    // Space does not scroll the page, the arrows neither.
    expect(window.scrollY).toBe(0);

    await userEvent.keyboard(' ');
    expect(status()).toBe('Netflix dropped at position 3 of 3.');
    expect(changes).toEqual([{ keys: ['plex', 'arte', 'netflix'], key: 'netflix', from: 0, to: 2 }]);
    expect(focused()).toBe(item('netflix'));

    // Tab goes on to the next item, in the new order.
    await userEvent.tab({ shift: true });
    expect(focused()).toBe(item('arte'));
  });

  it('Escape puts the item back, and does not reach the document (a dialog around the list stays open)', async () => {
    await mount(LIST());
    const keysOfDocument = recordEvents(document, ['keydown'], event => (event as KeyboardEvent).key);
    item('arte').focus();

    await userEvent.keyboard(' {Home}');
    expect(keys()).toEqual(['arte', 'netflix', 'plex']);
    await userEvent.keyboard('{Escape}');

    expect(keys()).toEqual(['netflix', 'plex', 'arte']);
    expect(status()).toBe('Arte back to position 3 of 3.');
    expect(keysOfDocument).not.toContain('Escape');
    expect(focused()).toBe(item('arte'));
  });

  it('Tab while an item is picked up drops it where it is', async () => {
    await mount(LIST());
    const changes = recordEvents(sortableOf(), ['orderChange'], event => (event as CustomEvent).detail.keys);
    item('netflix').focus();

    await userEvent.keyboard(' {ArrowDown}');
    await userEvent.tab();

    expect(changes).toEqual([['plex', 'netflix', 'arte']]);
    expect(sortableOf().classList.contains('--sorting')).toBe(false);
  });

  it('horizontal, from right to left: the left arrow moves the item forward', async () => {
    await mount(`<div dir="rtl">${LIST('orientation="horizontal"')}</div>`);
    item('netflix').focus();

    await userEvent.keyboard(' {ArrowLeft}');
    expect(keys()).toEqual(['plex', 'netflix', 'arte']);
    await userEvent.keyboard('{ArrowRight}');
    expect(keys()).toEqual(['netflix', 'plex', 'arte']);
    // A row: the second item on the left of the first one.
    expect(item('plex').getBoundingClientRect().right).toBeLessThanOrEqual(item('netflix').getBoundingClientRect().left);
  });

  it('a click of the pointer on an item does not pick it up; element.click() (a game pad) does', async () => {
    await mount(LIST());

    await userEvent.click(item('plex'));
    expect(sortableOf().classList.contains('--sorting')).toBe(false);
    item('plex').focus();
    item('plex').click();
    await expect.poll(() => sortableOf().classList.contains('--sorting')).toBe(true);
    await userEvent.keyboard('{ArrowUp}');
    item('plex').click();
    await expect.poll(() => sortableOf().classList.contains('--sorting')).toBe(false);
    expect(keys()).toEqual(['plex', 'netflix', 'arte']);
  });

  describe('buttons', () => {
    it('move an item with the pointer, one place at a time, named after it and its neighbours', async () => {
      await mount(LIST('buttons'));
      const changes = recordEvents(sortableOf(), ['orderChange'], event => (event as CustomEvent).detail.keys);

      expect(await accessibleNode('[data-key="plex"] .--before')).toMatchObject({ role: 'button', name: 'Move Plex before Netflix' });
      expect(await accessibleNode('[data-key="netflix"] .--before')).toMatchObject({ properties: { disabled: true } });
      // The name of the item stays its own text.
      expect(await accessibleNode('[data-key="plex"]')).toMatchObject({ name: 'Plex' });

      await userEvent.click(item('plex').querySelector('.--before'));
      expect(keys()).toEqual(['plex', 'netflix', 'arte']);
      expect(status()).toBe('Plex moved to position 1 of 3.');
      expect(changes).toEqual([['plex', 'netflix', 'arte']]);
    });

    it('with the keyboard: the focus stays on the button, and goes to the other one at an end', async () => {
      await mount(LIST('buttons'));
      item('netflix').querySelector<HTMLElement>('.--after').focus();

      await userEvent.keyboard('{Enter}');
      expect([keys(), focused()]).toEqual([['plex', 'netflix', 'arte'], item('netflix').querySelector('.--after')]);
      await userEvent.keyboard(' ');
      expect([keys(), focused()]).toEqual([['plex', 'arte', 'netflix'], item('netflix').querySelector('.--before')]);
    });

    it('the buttons at the end of the row of each item, 24 px, with their chevrons', async () => {
      await mount(`<div style="width: 300px">${LIST('buttons')}</div>`);
      const row = item('plex').getBoundingClientRect();
      const after = item('plex').querySelector('.--after').getBoundingClientRect();

      expect([after.width, after.height]).toEqual([32, 32]);
      expect(Math.round(row.right - after.right)).toBe(12 + 1);
      expect(getComputedStyle(item('plex').querySelector('.--after'), '::before').content).toBe('"" / ""');
    });
  });

  it('the item picked up stands out, in forced colors too (a dashed outline)', async () => {
    await mount(LIST());
    item('plex').focus();
    await userEvent.keyboard(' ');
    const style = getComputedStyle(item('plex'));

    expect(style.outlineStyle).toBe('dashed');
    expect(style.boxShadow).not.toBe('none');
  });
});
