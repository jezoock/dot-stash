import { describe, expect, it, vi } from 'vitest';
import './range';
import { renderPage } from '../../../test/helpers';
import type { DSRangeValue } from './range.types';

type Range = HTMLElement & { buffer: number | string; labels: string | object; formatter: (value: DSRangeValue) => string; mods: string | string[]; refresh(): Promise<void> };

/** A value set on the input (the simulated DOM keeps it as a property; a browser clamps it to the range). */
const setValue = (input: HTMLInputElement, value: string, events: string[] = []) => {
  Object.defineProperty(input, 'value', { configurable: true, writable: true, value });
  events.forEach(name => input.dispatchEvent(new Event(name, { bubbles: true })));
};

describe('ds-range', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const range = page.body.querySelector('ds-range') as Range;
    const input = range.querySelector('input') as HTMLInputElement;
    const fill = () => range.style.getPropertyValue('--ds-range-fill');
    const buffer = () => range.style.getPropertyValue('--ds-range-buffer');
    return { page, range, input, fill, buffer };
  };

  it('keeps the input, and draws a track before it, not read: its buffer and its fill', async () => {
    const { range, input } = await render('<label for="volume">Volume</label><ds-range><input id="volume" type="range" value="40" /></ds-range>');
    const track = range.querySelector('.ds-range__track');

    expect(range).toHaveClasses(['ds-range']);
    expect(Array.from(range.children)).toEqual([track, input]);
    expect(track.getAttribute('aria-hidden')).toBe('true');
    expect(Array.from(track.children).map(child => child.className)).toEqual(['ds-range__buffer', 'ds-range__fill']);
    expect(input).toHaveClass('ds-range__input');
    // The input keeps its semantics: no role, no value text, no tabindex of the range.
    for (const name of ['role', 'aria-valuetext', 'tabindex', 'aria-label']) expect([name, input.hasAttribute(name), range.hasAttribute(name)]).toEqual([name, false, false]);
  });

  it.each([
    ['value="40"', '40%'],
    ['min="0" max="10" value="2.5"', '25%'],
    ['min="-50" max="50" value="0"', '50%'],
    ['min="10" max="20" value="30"', '100%'],
    ['min="10" max="20" value="0"', '0%'],
    ['', '50%'],
    ['min="5" max="5" value="5"', '0%'],
    ['max="3" value="1"', '33.333%'],
  ])('%s: the fill is %s of the range', async (attributes, expected) => {
    const { fill } = await render(`<ds-range><input type="range" ${attributes} /></ds-range>`);

    expect(fill()).toBe(expected);
  });

  it('follows the value the user gives (input and change events), and a value set by a script after refresh()', async () => {
    const { page, range, input, fill } = await render('<ds-range><input type="range" value="10" /></ds-range>');

    setValue(input, '60', ['input']);
    await page.waitForChanges();
    expect(fill()).toBe('60%');

    setValue(input, '70', ['change']);
    await page.waitForChanges();
    expect(fill()).toBe('70%');

    setValue(input, '80');
    await range.refresh();
    await page.waitForChanges();
    expect(fill()).toBe('80%');
  });

  it('buffer: a second share of the range, clamped to it, with the --buffer class; none without it', async () => {
    const { page, range, buffer } = await render('<ds-range><input type="range" min="0" max="200" value="20" /></ds-range>');

    expect(range).not.toHaveClass('--buffer');
    expect(buffer()).toBe('');

    range.buffer = 150;
    await page.waitForChanges();
    expect(range).toHaveClass('--buffer');
    expect(buffer()).toBe('75%');

    range.buffer = '500';
    await page.waitForChanges();
    expect(buffer()).toBe('100%');

    range.buffer = '';
    await page.waitForChanges();
    expect(range).not.toHaveClass('--buffer');
    expect(buffer()).toBe('');
  });

  // A disabled fieldset around it: in the browser tests (the simulated DOM has no :disabled).
  it('a disabled input: the --disabled class', async () => {
    const { page, range, input } = await render('<ds-range><input type="range" disabled /></ds-range>');

    expect(range).toHaveClass('--disabled');

    input.removeAttribute('disabled');
    await range.refresh();
    await page.waitForChanges();
    expect(range).not.toHaveClass('--disabled');
  });

  describe('value text', () => {
    it('none by default: the browser reads the value', async () => {
      const { input } = await render('<ds-range><input type="range" value="40" /></ds-range>');

      expect(input.hasAttribute('aria-valuetext')).toBe(false);
    });

    it('labels.valueText: a template of the value, the minimum, the maximum and the percentage, followed as the value changes', async () => {
      const { input } = await render(`<ds-range labels='{"valueText": "{value} of {max} ({percent}%), from {min}"}'><input type="range" min="0" max="8" value="3" /></ds-range>`);

      expect(input.getAttribute('aria-valuetext')).toBe('3 of 8 (38%), from 0');

      setValue(input, '4', ['input']);
      await Promise.resolve();
      await Promise.resolve();
      expect(input.getAttribute('aria-valuetext')).toBe('4 of 8 (50%), from 0');
    });

    it('formatter replaces the template; an empty text removes the value text of the range, never one of the page', async () => {
      const { page, range, input } = await render(`<ds-range labels='{"valueText": "{value} %"}'><input type="range" value="90" /></ds-range>`);
      const formatter = vi.fn(({ value, max }: DSRangeValue) => `${value} seconds of ${max}`);

      range.formatter = formatter;
      await page.waitForChanges();
      expect(input.getAttribute('aria-valuetext')).toBe('90 seconds of 100');
      expect(formatter).toHaveBeenLastCalledWith({ value: 90, min: 0, max: 100, percent: 90 });

      range.formatter = () => '';
      await page.waitForChanges();
      expect(input.hasAttribute('aria-valuetext')).toBe(false);

      input.setAttribute('aria-valuetext', 'Loud');
      range.labels = {};
      await page.waitForChanges();
      expect(input.getAttribute('aria-valuetext')).toBe('Loud');
    });

    it('an invalid JSON in labels: an error, and the defaults', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { input } = await render(`<ds-range labels='{"valueText": '><input type="range" /></ds-range>`);

      expect(error).toHaveBeenCalledWith('[ds-range] labels is not valid JSON');
      expect(input.hasAttribute('aria-valuetext')).toBe(false);
    });
  });

  it('without an input of type range: no track and no fill', async () => {
    const { range, fill } = await render('<ds-range><input type="text" /></ds-range>');

    expect(range.querySelector('.ds-range__track')).toBeNull();
    expect(fill()).toBe('');
  });

  it('removed: gives the input back as it was, without its class nor its value text', async () => {
    const { page, range, input } = await render(`<div><ds-range labels='{"valueText": "{value}"}'><input type="range" value="5" /></ds-range></div>`);

    range.remove();
    await page.waitForChanges();

    expect(input.classList.contains('ds-range__input')).toBe(false);
    expect(input.hasAttribute('aria-valuetext')).toBe(false);
    expect(range.querySelector('.ds-range__track')).toBeNull();
  });

  it('mods: a class per modifier', async () => {
    const { range } = await render('<ds-range mods="volume, small"><input type="range" /></ds-range>');

    expect(range).toHaveClasses(['ds-range', '--volume', '--small']);
  });
});
