import { describe, expect, it, vi } from 'vitest';
import './sortable';
import { keydown, renderPage, trackFocus } from '../../../test/helpers';

type Sortable = HTMLElement & { label: string; orientation: string; buttons: boolean; labels: string | object };

const LIST = `
  <ds-sortable label="Services">
    <div data-key="netflix">Netflix</div>
    <div data-key="plex" data-label="Plex Media Server">Plex <small>local</small></div>
    <div data-key="arte">Arte</div>
    <div data-key="youtube">YouTube</div>
  </ds-sortable>`;

describe('ds-sortable', () => {
  const render = async (html = LIST) => {
    const page = await renderPage(html);
    const sortable = page.body.querySelector('ds-sortable') as Sortable;
    const items = () => Array.from(sortable.children).filter(child => child.hasAttribute('data-key')) as HTMLElement[];
    const keys = () => items().map(item => item.getAttribute('data-key'));
    const item = (key: string) => sortable.querySelector<HTMLElement>(`[data-key="${key}"]`);
    const status = () => sortable.querySelector('.ds-sortable__status').textContent.replace(/\u00a0$/, '');
    const changes: unknown[] = [];
    sortable.addEventListener('orderChange', (event: CustomEvent) => changes.push(event.detail));
    return { page, sortable, items, keys, item, status, changes };
  };

  it('a list of items, each one in the Tab order and described by the instructions; a hidden instructions part and a polite live region', async () => {
    const { sortable, items } = await render();
    const instructions = sortable.querySelector<HTMLElement>('.ds-sortable__instructions');
    const status = sortable.querySelector('.ds-sortable__status');

    expect(sortable).toHaveClasses(['ds-sortable', '--vertical']);
    expect(sortable).toEqualAttributes({ 'role': 'list', 'aria-label': 'Services' });
    expect(items().map(item => [item.getAttribute('role'), item.getAttribute('tabindex'), item.getAttribute('aria-describedby')])).toEqual(
      Array.from({ length: 4 }, () => ['listitem', '0', instructions.id]),
    );
    expect(items().every(item => item.classList.contains('ds-sortable__item'))).toBe(true);
    expect(instructions.hidden).toBe(true);
    expect(instructions.textContent).toMatch(/^To move this item, press Space or Enter/);
    expect(status).toEqualAttributes({ 'aria-live': 'polite', 'aria-atomic': 'true' });
    expect(status.hasAttribute('role')).toBe(false);
  });

  it('keeps the attributes of the page: its own role, tabindex and description', async () => {
    const { item, sortable } = await render(`
      <ds-sortable><div data-key="a" role="option" tabindex="-1" aria-describedby="hint">A</div></ds-sortable><p id="hint">Hint</p>`);
    const instructions = sortable.querySelector('.ds-sortable__instructions');

    expect(item('a')).toEqualAttributes({ 'role': 'option', 'tabindex': '-1', 'aria-describedby': `hint ${instructions.id}`, 'aria-label': 'A' });
  });

  describe('keyboard', () => {
    it('Space picks an item up, the arrows move it, Space drops it: each step told, and orderChange with the new order', async () => {
      const { page, sortable, keys, item, status, changes } = await render();
      const focused = trackFocus();
      item('netflix').focus();

      keydown(item('netflix'), ' ');
      await page.waitForChanges();
      expect(sortable).toHaveClass('--sorting');
      expect(item('netflix')).toHaveClass('--grabbed');
      expect(status()).toBe('Netflix picked up, position 1 of 4.');

      keydown(item('netflix'), 'ArrowDown');
      expect(keys()).toEqual(['plex', 'netflix', 'arte', 'youtube']);
      expect(status()).toBe('Netflix moved to position 2 of 4.');
      keydown(item('netflix'), 'ArrowDown');
      expect(keys()).toEqual(['plex', 'arte', 'netflix', 'youtube']);
      expect(focused()).toBe(item('netflix'));
      expect(changes).toEqual([]);

      keydown(item('netflix'), ' ');
      await page.waitForChanges();
      expect(status()).toBe('Netflix dropped at position 3 of 4.');
      expect(sortable).not.toHaveClass('--sorting');
      expect(item('netflix')).not.toHaveClass('--grabbed');
      expect(changes).toEqual([{ keys: ['plex', 'arte', 'netflix', 'youtube'], key: 'netflix', from: 0, to: 2 }]);
    });

    it('Enter picks up and drops; Home and End; the arrows stop at the ends; the label is data-label, else the text', async () => {
      const { keys, item, status, changes } = await render();

      keydown(item('plex'), 'Enter');
      expect(status()).toBe('Plex Media Server picked up, position 2 of 4.');
      keydown(item('plex'), 'End');
      expect(keys()).toEqual(['netflix', 'arte', 'youtube', 'plex']);
      keydown(item('plex'), 'ArrowDown');
      expect(keys()).toEqual(['netflix', 'arte', 'youtube', 'plex']);
      keydown(item('plex'), 'Home');
      expect(keys()).toEqual(['plex', 'netflix', 'arte', 'youtube']);
      keydown(item('plex'), 'ArrowUp');
      expect(keys()).toEqual(['plex', 'netflix', 'arte', 'youtube']);
      keydown(item('plex'), 'Enter');
      expect(changes).toEqual([{ keys: ['plex', 'netflix', 'arte', 'youtube'], key: 'plex', from: 1, to: 0 }]);
    });

    it('Escape puts the item back where it was picked up, without orderChange, and goes no further', async () => {
      const { keys, item, status, changes, page } = await render();
      const outer = vi.fn();

      keydown(item('arte'), ' ');
      keydown(item('arte'), 'ArrowUp');
      keydown(item('arte'), 'ArrowUp');
      expect(keys()).toEqual(['arte', 'netflix', 'plex', 'youtube']);
      page.body.addEventListener('keydown', outer);
      const escape = keydown(item('arte'), 'Escape');

      expect(keys()).toEqual(['netflix', 'plex', 'arte', 'youtube']);
      expect(status()).toBe('Arte back to position 3 of 4.');
      expect(changes).toEqual([]);
      expect(escape.defaultPrevented).toBe(true);
      expect(outer).not.toHaveBeenCalled();
    });

    it('dropped where it was picked up: told, without orderChange', async () => {
      const { item, status, changes } = await render();

      keydown(item('arte'), ' ');
      keydown(item('arte'), 'ArrowDown');
      keydown(item('arte'), 'ArrowUp');
      keydown(item('arte'), ' ');
      expect(status()).toBe('Arte dropped at position 3 of 4.');
      expect(changes).toEqual([]);
    });

    it('the keys of an element in an item, and the arrows of an item not picked up, are not handled', async () => {
      const { keys, item, sortable } = await render(`<ds-sortable><div data-key="a">A <button>Edit</button></div><div data-key="b">B</div></ds-sortable>`);

      const space = keydown(item('a').querySelector('button'), ' ');
      expect([space.defaultPrevented, sortable.classList.contains('--sorting')]).toEqual([false, false]);
      const arrow = keydown(item('a'), 'ArrowDown');
      expect([arrow.defaultPrevented, keys()]).toEqual([false, ['a', 'b']]);
    });

    it('horizontal: Left and Right move the item', async () => {
      const { keys, item, sortable } = await render(`<ds-sortable orientation="horizontal"><div data-key="a">A</div><div data-key="b">B</div></ds-sortable>`);

      expect(sortable).toHaveClass('--horizontal');
      keydown(item('a'), ' ');
      keydown(item('a'), 'ArrowDown');
      expect(keys()).toEqual(['a', 'b']);
      keydown(item('a'), 'ArrowRight');
      expect(keys()).toEqual(['b', 'a']);
      keydown(item('a'), 'ArrowLeft');
      expect(keys()).toEqual(['a', 'b']);
    });

    it('the focus leaves the item picked up: it is dropped where it is', async () => {
      const { item, changes, sortable } = await render();

      keydown(item('netflix'), ' ');
      keydown(item('netflix'), 'ArrowDown');
      item('netflix').dispatchEvent(new FocusEvent('focusout', { bubbles: true }));

      expect(sortable).not.toHaveClass('--grabbed');
      expect(changes).toEqual([{ keys: ['plex', 'netflix', 'arte', 'youtube'], key: 'netflix', from: 0, to: 1 }]);
    });

    it('a click without a pointer on an item (a game pad) picks it up, and drops it', async () => {
      const { page, item, sortable } = await render();

      item('arte').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
      await page.waitForChanges();
      expect(sortable).toHaveClass('--sorting');
      item('arte').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      await page.waitForChanges();
      expect(sortable).toHaveClass('--sorting');
      item('arte').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
      await page.waitForChanges();
      expect(sortable).not.toHaveClass('--sorting');
    });
  });

  describe('buttons', () => {
    it('two buttons per item, named after it and its neighbours, unavailable at the ends', async () => {
      const { sortable, item } = await render(LIST.replace('label="Services"', 'label="Services" buttons'));
      const names = (key: string) => Array.from(item(key).querySelectorAll('button')).map(button => [button.getAttribute('aria-label'), button.disabled]);

      expect(sortable).toHaveClass('--buttons');
      expect(names('netflix')).toEqual([
        ['Move Netflix before ', true],
        ['Move Netflix after Plex Media Server', false],
      ]);
      expect(names('plex')).toEqual([
        ['Move Plex Media Server before Netflix', false],
        ['Move Plex Media Server after Arte', false],
      ]);
      expect(names('youtube')[1]).toEqual(['Move YouTube after ', true]);
      expect(item('plex').querySelector('.ds-sortable__actions').getAttribute('class')).toBe('ds-sortable__actions');
    });

    it('a button moves the item one place, tells it, emits orderChange, and gives the focus to the other button at an end', async () => {
      const { sortable, keys, item, status, changes } = await render(LIST.replace('label="Services"', 'buttons'));
      const focused = trackFocus();
      const after = item('arte').querySelector<HTMLButtonElement>('.--after');
      after.focus();

      after.click();
      expect(keys()).toEqual(['netflix', 'plex', 'youtube', 'arte']);
      expect(status()).toBe('Arte moved to position 4 of 4.');
      expect(changes).toEqual([{ keys: ['netflix', 'plex', 'youtube', 'arte'], key: 'arte', from: 2, to: 3 }]);
      expect(after.disabled).toBe(true);
      expect(focused()).toBe(item('arte').querySelector('.--before'));
      expect(item('youtube').querySelector('.--after').getAttribute('aria-label')).toBe('Move YouTube after Arte');
      expect(sortable).not.toHaveClass('--sorting');
    });

    it('buttons removed: the items lose them', async () => {
      const { page, sortable } = await render(LIST.replace('label="Services"', 'buttons'));

      sortable.buttons = false;
      await page.waitForChanges();
      expect(sortable.querySelectorAll('.ds-sortable__actions').length).toBe(0);
    });
  });

  it('labels translates the texts; an invalid JSON: an error, and the defaults', async () => {
    const { item, status, sortable, page } = await render(`
      <ds-sortable labels='{"grabbed": "{label} saisi, position {index} sur {count}", "instructions": "Espace pour saisir"}'>
        <div data-key="a">Arte</div><div data-key="b">BBC</div>
      </ds-sortable>`);

    expect(sortable.querySelector('.ds-sortable__instructions').textContent).toBe('Espace pour saisir');
    keydown(item('a'), ' ');
    expect(status()).toBe('Arte saisi, position 1 sur 2');

    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sortable.setAttribute('labels', '{');
    await page.waitForChanges();
    expect(error).toHaveBeenCalledWith('[ds-sortable] labels is not valid JSON');
    expect(sortable.querySelector('.ds-sortable__instructions').textContent).toMatch(/^To move this item/);
  });

  it('names each item by its data-label, else its text without its buttons, unless the page names it', async () => {
    const { item } = await render(`
      <ds-sortable buttons>
        <div data-key="a" data-label="Arte TV">Arte <small>live</small></div>
        <div data-key="b">BBC  <small>One</small></div>
        <div data-key="c" aria-label="Canal plus">C+</div>
        <div data-key="d" aria-labelledby="x">D</div>
      </ds-sortable><span id="x">Dee</span>`);

    expect(['a', 'b', 'c', 'd'].map(key => item(key).getAttribute('aria-label'))).toEqual(['Arte TV', 'BBC One', 'Canal plus', null]);
  });

  it('an item without data-key: a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render('<ds-sortable><div>A</div></ds-sortable>');

    expect(warn).toHaveBeenCalledWith('[ds-sortable] an item has no data-key: its order is not in orderChange', expect.anything());
  });

  it('removed: gives the items back as they were', async () => {
    const { page, sortable, items } = await render(LIST.replace('label="Services"', 'buttons'));
    const children = items();

    sortable.remove();
    await page.waitForChanges();

    for (const child of children) {
      expect([child.getAttribute('role'), child.getAttribute('tabindex'), child.getAttribute('aria-describedby'), child.className]).toEqual([null, null, null, '']);
      expect(child.querySelector('button')).toBeNull();
    }
    expect(sortable.querySelector('.ds-sortable__status')).toBeNull();
  });

  it('mods: a class per modifier', async () => {
    const { sortable } = await render('<ds-sortable mods="compact, cards"></ds-sortable>');

    expect(sortable).toHaveClasses(['ds-sortable', '--compact', '--cards']);
  });
});
