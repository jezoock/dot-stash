import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { accessibleNode, focused, formEntries, mount, nextFrame, setForcedColors } from '../../../test/helpers/browser';

type Range = HTMLElement & { buffer: number | string; formatter: (value: { value: number; max: number }) => string; refresh(): Promise<void> };

const rangeOf = (selector = 'ds-range') => document.querySelector<Range>(selector);
const inputOf = (selector = 'ds-range') => rangeOf(selector).querySelector('input');
const rectOf = (selector: string) => document.querySelector(selector).getBoundingClientRect();

/** Waits for the range to render a change. */
const settled = async () => {
  await nextFrame();
  await nextFrame();
};

describe('ds-range in a browser', () => {
  it('the input stays the slider: its name, its value, its keys and its form', async () => {
    await mount(`
      <form><label for="volume">Volume</label>
        <ds-range><input id="volume" name="volume" type="range" min="0" max="10" value="4" /></ds-range>
      </form>`);
    const input = inputOf();

    expect(await accessibleNode('#volume')).toMatchObject({ role: 'slider', name: 'Volume', value: 4 });
    // The track is not in the tree.
    expect(await accessibleNode('.ds-range__track')).toBeNull();

    input.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect([focused(), input.value]).toEqual([input, '6']);
    await settled();
    expect(rangeOf().style.getPropertyValue('--ds-range-fill')).toBe('60%');

    await userEvent.keyboard('{End}');
    await settled();
    expect(rangeOf().style.getPropertyValue('--ds-range-fill')).toBe('100%');
    expect(formEntries(input.form)).toEqual([['volume', '10']]);
  });

  it('the fill ends under the thumb, at every value, from left to right and from right to left', async () => {
    for (const dir of ['ltr', 'rtl']) {
      await mount(`<div dir="${dir}" style="width: 300px"><ds-range><input type="range" aria-label="Position" value="0" /></ds-range></div>`);
      const input = inputOf();
      for (const value of ['0', '25', '50', '80', '100']) {
        input.value = value;
        await rangeOf().refresh();
        await settled();
        const fill = rectOf('.ds-range__fill');
        const track = rectOf('.ds-range__track');
        const size = 18; // --ds-range-thumb-size of the default theme: 1.125rem
        const share = Number(value) / 100;
        // The center of the thumb, as the browser places it: from half a thumb to the width less half a thumb.
        const thumbCenter = dir === 'ltr' ? track.left + size / 2 + (track.width - size) * share : track.right - size / 2 - (track.width - size) * share;
        const fillEnd = dir === 'ltr' ? fill.right : fill.left;

        expect([dir, value, Math.abs(fillEnd - thumbCenter) <= size / 2 + 1]).toEqual([dir, value, true]);
        expect([dir, value, dir === 'ltr' ? fill.left : fill.right]).toEqual([dir, value, dir === 'ltr' ? track.left + 1 : track.right - 1]);
      }
    }
  });

  it('the buffer: a second part of the track, under the fill', async () => {
    await mount('<div style="width: 302px"><ds-range buffer="75"><input type="range" aria-label="Position" value="20" /></ds-range></div>');
    const buffer = rectOf('.ds-range__buffer');
    const fill = rectOf('.ds-range__fill');

    expect([Math.round(buffer.width), Math.round(fill.width)]).toEqual([225, 60]);
    expect(getComputedStyle(document.querySelector('.ds-range__buffer')).backgroundColor).not.toBe(getComputedStyle(document.querySelector('.ds-range__fill')).backgroundColor);
  });

  // The value text is the aria-valuetext of the input: the accessibility tree of the Chrome DevTools Protocol does not
  // give it (its `valuetext` is the value, for a native or an ARIA slider): what screen readers read is checked by hand.
  it('the value text of the template, or of the formatter, on the input that stays the slider', async () => {
    await mount(`<ds-range labels='{"valueText": "{percent} %"}'><input type="range" aria-label="Volume" value="30" /></ds-range>`);

    const valueText = () => inputOf().getAttribute('aria-valuetext');
    await expect.poll(valueText).toBe('30 %');
    expect(await accessibleNode('input')).toMatchObject({ role: 'slider', name: 'Volume', value: 30 });

    rangeOf().formatter = ({ value, max }) => `${value} s of ${max} s`;
    await expect.poll(valueText).toBe('30 s of 100 s');

    inputOf().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.poll(valueText).toBe('29 s of 100 s');
  });

  it('follows the attributes of the input, and a disabled fieldset around it', async () => {
    await mount('<fieldset><ds-range><input type="range" aria-label="Volume" value="5" max="10" /></ds-range></fieldset>');
    const input = inputOf();

    input.setAttribute('max', '20');
    await expect.poll(() => rangeOf().style.getPropertyValue('--ds-range-fill')).toBe('25%');

    document.querySelector('fieldset').disabled = true;
    await expect.poll(() => rangeOf().classList.contains('--disabled')).toBe(true);
    expect(getComputedStyle(rangeOf()).opacity).toBe('0.5');
    expect(await accessibleNode('input')).toMatchObject({ properties: { disabled: true } });

    document.querySelector('fieldset').disabled = false;
    await expect.poll(() => rangeOf().classList.contains('--disabled')).toBe(false);
  });

  it('a form reset gives the fill of the value back', async () => {
    await mount('<form><ds-range><input type="range" aria-label="Volume" value="20" /></ds-range></form>');
    const input = inputOf();

    input.focus();
    await userEvent.keyboard('{Home}');
    await expect.poll(() => rangeOf().style.getPropertyValue('--ds-range-fill')).toBe('0%');

    input.form.reset();
    await expect.poll(() => rangeOf().style.getPropertyValue('--ds-range-fill')).toBe('20%');
  });

  it('the keyboard focus shows an outline around the input', async () => {
    await mount('<ds-range><input type="range" aria-label="Volume" /></ds-range>');

    inputOf().focus();
    await userEvent.keyboard('{ArrowRight}');
    const style = getComputedStyle(inputOf());

    expect([style.outlineStyle, style.outlineWidth]).toEqual(['solid', '2px']);
  });

  it('in forced colors, the track and the fill still show', async () => {
    await setForcedColors(true);
    await mount('<ds-range><input type="range" aria-label="Volume" value="50" /></ds-range>');
    await settled();
    const track = getComputedStyle(document.querySelector('.ds-range__track'));
    const fill = getComputedStyle(document.querySelector('.ds-range__fill'));

    expect(track.borderTopStyle).toBe('solid');
    expect(fill.backgroundColor).toBe(fill.color);
    expect(fill.backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor);
  });
});
