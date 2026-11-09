import { describe, expect, it } from 'vitest';
import { h } from '@stencil/core';
import './badge';
import { renderPage } from '../../../test/helpers';

type Badge = HTMLElement & { count: number | string; max: number | string; label: unknown; dot: boolean; type: string };

describe('ds-badge', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const badge = page.body.querySelector('ds-badge') as Badge;
    const part = (name: string) => badge.querySelector<HTMLElement>(`.ds-badge__${name}`);
    return { page, badge, part };
  };

  it('renders its content as its text, read as it is: no role, no label, no live region', async () => {
    const { badge, part } = await render('<ds-badge>New</ds-badge>');

    expect(badge).toHaveClasses(['ds-badge', '--neutral']);
    expect(part('text').textContent).toBe('New');
    expect(part('text').hasAttribute('aria-hidden')).toBe(false);
    expect(part('label')).toBeNull();
    for (const name of ['role', 'aria-live', 'tabindex', 'aria-label']) expect(badge.hasAttribute(name)).toBe(false);
  });

  it.each([
    ['info', '--info'],
    ['success', '--success'],
    ['warning', '--warning'],
    ['error', '--error'],
    ['neutral', '--neutral'],
    ['purple', '--neutral'],
  ])('type="%s": the %s class', async (type, className) => {
    const { badge } = await render(`<ds-badge type="${type}" mods="pill">Text</ds-badge>`);

    expect(badge).toHaveClasses(['ds-badge', '--pill', className]);
  });

  describe('count', () => {
    it('shows the count instead of the content', async () => {
      const { badge, part } = await render('<ds-badge count="3">ignored</ds-badge>');

      expect(badge).toHaveClass('--count');
      expect(part('text').textContent).toBe('3');
    });

    it.each([
      ['99', '99', '99'],
      ['100', '99', '99+'],
      ['150', '99', '99+'],
      ['10', '9', '9+'],
      ['0', '9', '0'],
      ['5', '', '5'],
      ['5', 'nope', '5'],
    ])('count %s, max %s: shows %s', async (count, max, text) => {
      const { part } = await render(`<ds-badge count="${count}" max="${max}"></ds-badge>`);

      expect(part('text').textContent).toBe(text);
    });

    it('a count that is not a number is no count: the content shows', async () => {
      const { badge, part } = await render('<ds-badge count="many">Many</ds-badge>');

      expect(badge).not.toHaveClass('--count');
      expect(part('text').textContent).toBe('Many');
    });

    it('follows a change of the count', async () => {
      const { page, badge, part } = await render('<ds-badge count="3" max="9" label="{count} unread messages"></ds-badge>');

      badge.count = 12;
      await page.waitForChanges();

      expect([part('text').textContent, part('label').textContent]).toEqual(['9+', '12 unread messages']);
    });
  });

  describe('label', () => {
    it('replaces the visible text for assistive technologies: the text aria-hidden, the label with the true count', async () => {
      const { part } = await render('<ds-badge count="150" max="99" label="{count} unread messages"></ds-badge>');

      expect(part('text')).toEqualAttribute('aria-hidden', 'true');
      expect([part('text').textContent, part('label').textContent]).toEqual(['99+', '150 unread messages']);
    });

    it.each([
      ['en', 1, '1 unread message'],
      ['en', 0, '0 unread messages'],
      ['en', 2, '2 unread messages'],
      ['fr', 0, '0 message non lu'],
      ['fr', 1, '1 message non lu'],
      ['fr', 2, '2 messages non lus'],
    ])('a plural label, in the language of the page (%s), count %s: %s', async (lang, count, text) => {
      const label = lang === 'fr' ? { one: '{count} message non lu', other: '{count} messages non lus' } : { one: '{count} unread message', other: '{count} unread messages' };
      const { part } = await render(`<div lang="${lang}"><ds-badge count="${count}" label='${JSON.stringify(label)}'></ds-badge></div>`);

      expect(part('label').textContent).toBe(text);
    });

    it('a plural label as an object, given as a property', async () => {
      const page = await renderPage(() => <ds-badge count={1} label={{ one: '{count} item', other: '{count} items' }}></ds-badge>);

      expect(page.body.querySelector('.ds-badge__label').textContent).toBe('1 item');
    });

    it('a label without a count: the template as it is (the "other" one of a plural label)', async () => {
      const { part } = await render(`<ds-badge label="New product">New</ds-badge>`);
      const plural = await render(`<ds-badge label='{"one": "one thing", "other": "Several things"}'>Some</ds-badge>`);

      expect([part('text').textContent, part('text').getAttribute('aria-hidden'), part('label').textContent]).toEqual(['New', 'true', 'New product']);
      expect(plural.part('label').textContent).toBe('Several things');
    });

    it('a template that starts with the count is not JSON', async () => {
      const { part } = await render('<ds-badge count="4" label="{count} new"></ds-badge>');

      expect(part('label').textContent).toBe('4 new');
    });

    it('an empty label is no label', async () => {
      const { part } = await render('<ds-badge count="4" label=""></ds-badge>');

      expect([part('label'), part('text').hasAttribute('aria-hidden')]).toEqual([null, false]);
    });
  });

  describe('dot', () => {
    it('a dot with a label: the label is read, the text hidden', async () => {
      const { badge, part } = await render('<ds-badge dot type="error" label="New messages"></ds-badge>');

      expect(badge).toHaveClasses(['ds-badge', '--error', '--dot']);
      expect(part('label').textContent).toBe('New messages');
      expect(part('text')).toEqualAttribute('aria-hidden', 'true');
    });

    it('a dot with a text: the text is read (hidden on the screen by the stylesheet)', async () => {
      const { part } = await render('<ds-badge dot>New</ds-badge>');

      expect([part('text').textContent, part('text').hasAttribute('aria-hidden'), part('label')]).toEqual(['New', false, null]);
    });

    it('follows dot', async () => {
      const { page, badge } = await render('<ds-badge>New</ds-badge>');

      badge.dot = true;
      await page.waitForChanges();

      expect(badge).toHaveClass('--dot');
      expect(badge.getAttribute('dot')).toBe('');
    });
  });
});
