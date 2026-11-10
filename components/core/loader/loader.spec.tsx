import { describe, expect, it } from 'vitest';
import './loader';
import { renderPage } from '../../../test/helpers';

type Loader = HTMLElement & { value: number | string; max: number | string; label: string; showLabel: boolean; inline: boolean; size: string };

describe('ds-loader', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const loader = page.body.querySelector('ds-loader') as Loader;
    const part = (name: string) => loader.querySelector<HTMLElement>(`.ds-loader__${name}`);
    return { page, loader, part };
  };

  it('indeterminate by default: a progress bar named "Loading", without a value, with a spinner', async () => {
    const { loader, part } = await render('<ds-loader></ds-loader>');

    expect(loader).toHaveClasses(['ds-loader', '--indeterminate']);
    expect(loader).toEqualAttributes({ 'role': 'progressbar', 'aria-label': 'Loading' });
    for (const name of ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext', 'aria-live', 'tabindex']) expect(loader.hasAttribute(name)).toBe(false);
    expect(part('spinner')).not.toBeNull();
    expect([part('track'), part('label')]).toEqual([null, null]);
  });

  it('label names it, in the language of the page; an empty one is "Loading"', async () => {
    const { page, loader } = await render('<ds-loader label="Chargement des résultats"></ds-loader>');

    expect(loader.getAttribute('aria-label')).toBe('Chargement des résultats');

    loader.label = '  ';
    await page.waitForChanges();
    expect(loader.getAttribute('aria-label')).toBe('Loading');
  });

  describe('determinate', () => {
    it('with a value: the value, its minimum and maximum, and a bar filled to its share', async () => {
      const { loader, part } = await render('<ds-loader value="40" label="Uploading"></ds-loader>');

      expect(loader).toHaveClasses(['ds-loader', '--determinate']);
      expect(loader).toEqualAttributes({ 'role': 'progressbar', 'aria-label': 'Uploading', 'aria-valuenow': '40', 'aria-valuemin': '0', 'aria-valuemax': '100' });
      expect(part('spinner')).toBeNull();
      expect(part('track').firstElementChild).toBe(part('bar'));
      expect(part('bar').style.width).toBe('40%');
    });

    it.each([
      ['3', '8', '3', '8', '37.5%'],
      ['150', '', '100', '100', '100%'],
      ['-5', '10', '0', '10', '0%'],
      ['12', '10', '10', '10', '100%'],
      ['5', '0', '5', '100', '5%'],
      ['5', '-2', '5', '100', '5%'],
      ['5', 'all', '5', '100', '5%'],
      ['0', '', '0', '100', '0%'],
      ['0.5', '1', '0.5', '1', '50%'],
    ])('value %s, max %s: aria-valuenow %s, aria-valuemax %s, a bar of %s', async (value, max, now, valueMax, width) => {
      const { loader, part } = await render(`<ds-loader value="${value}" max="${max}"></ds-loader>`);

      expect([loader.getAttribute('aria-valuenow'), loader.getAttribute('aria-valuemax'), part('bar').style.width]).toEqual([now, valueMax, width]);
    });

    it.each(['', 'nope'])('value="%s" is no value: indeterminate', async value => {
      const { loader, part } = await render(`<ds-loader value="${value}" max="10"></ds-loader>`);

      expect(loader).toHaveClass('--indeterminate');
      expect([loader.hasAttribute('aria-valuenow'), loader.hasAttribute('aria-valuemax'), !!part('spinner')]).toEqual([false, false, true]);
    });

    it('switches between indeterminate and determinate with its value', async () => {
      const { page, loader, part } = await render('<ds-loader></ds-loader>');

      loader.value = 25;
      await page.waitForChanges();
      expect([loader.getAttribute('aria-valuenow'), part('bar').style.width, part('spinner')]).toEqual(['25', '25%', null]);

      loader.value = 80;
      loader.max = 200;
      await page.waitForChanges();
      expect([loader.getAttribute('aria-valuenow'), loader.getAttribute('aria-valuemax'), part('bar').style.width]).toEqual(['80', '200', '40%']);

      loader.value = undefined;
      await page.waitForChanges();
      expect(loader).toHaveClass('--indeterminate');
      expect([loader.hasAttribute('aria-valuenow'), loader.hasAttribute('aria-valuemin'), part('track'), !!part('spinner')]).toEqual([false, false, null, true]);
    });
  });

  describe('look', () => {
    it('show-label shows the name after the indicator, hidden from assistive technologies (the element is named)', async () => {
      const { loader, part } = await render('<ds-loader show-label label="Loading the map"></ds-loader>');

      expect(Array.from(loader.children).map(child => child.className)).toEqual(['ds-loader__spinner', 'ds-loader__label']);
      expect(part('label').textContent).toBe('Loading the map');
      expect(part('label')).toEqualAttribute('aria-hidden', 'true');
    });

    it.each([
      ['sm', '--sm'],
      ['md', '--md'],
      ['lg', '--lg'],
    ])('size="%s": %s', async (size, className) => {
      const { loader } = await render(`<ds-loader size="${size}"></ds-loader>`);

      expect(loader).toHaveClasses(['ds-loader', '--indeterminate', className]);
    });

    it('an unknown size has no class; inline and mods are classes', async () => {
      const { loader } = await render('<ds-loader size="xl" inline mods="light"></ds-loader>');

      expect(loader.className.split(' ').sort()).toEqual(['--indeterminate', '--inline', '--light', 'ds-loader']);
      expect(loader.getAttribute('inline')).toBe('');
    });
  });
});
