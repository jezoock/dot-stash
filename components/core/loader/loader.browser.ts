import { describe, expect, it } from 'vitest';
import { accessibleNode, mount, nextFrame, setForcedColors, setReducedMotion } from '../../../test/helpers/browser';

type Loader = HTMLElement & { value: number | string; max: number | string };

describe('ds-loader in a browser', () => {
  it('is a progress bar named by its label: without a value while indeterminate, with aria-valuenow once determinate', async () => {
    const loader = await mount<Loader>('<ds-loader label="Uploading photo.jpg" show-label></ds-loader><ds-loader id="default"></ds-loader>');

    const indeterminate = await accessibleNode('ds-loader');
    expect(indeterminate).toMatchObject({ role: 'progressbar', name: 'Uploading photo.jpg' });
    expect(indeterminate.value).toBeUndefined();
    expect(await accessibleNode('#default')).toMatchObject({ role: 'progressbar', name: 'Loading' });

    loader.value = 30;
    loader.max = 60;
    await expect.poll(async () => (await accessibleNode('ds-loader'))?.value).toBe(30);
    expect(await accessibleNode('ds-loader')).toMatchObject({ role: 'progressbar', name: 'Uploading photo.jpg', properties: { valuemin: 0, valuemax: 60 } });
    // The visible label and the indicator are not read on their own (the children of a progress bar are presentational).
    expect(await accessibleNode('ds-loader .ds-loader__label')).toBeNull();
    expect(await accessibleNode('ds-loader .ds-loader__bar')).toBeNull();

    loader.value = undefined;
    await expect.poll(async () => (await accessibleNode('ds-loader'))?.value).toBeUndefined();
    expect(loader.querySelector('.ds-loader__spinner')).not.toBeNull();
  });

  it('is not focusable and not a live region', async () => {
    await mount('<ds-loader value="10"></ds-loader>');

    const node = await accessibleNode('ds-loader');
    expect([node.properties.focusable, node.properties.live]).toEqual([undefined, undefined]);
  });

  it('a spinner of the size of its type, turning once in 2 s; with less motion, once in 4 s, still turning', async () => {
    await mount('<ds-loader id="md"></ds-loader><ds-loader id="sm" size="sm"></ds-loader><ds-loader id="lg" size="lg"></ds-loader>');
    const spinner = (id: string) => getComputedStyle(document.querySelector(`#${id} .ds-loader__spinner`), '::before');

    expect(['sm', 'md', 'lg'].map(id => spinner(id).width)).toEqual(['16px', '24px', '36px']);
    expect([spinner('md').animationName, spinner('md').animationDuration, spinner('md').animationIterationCount]).toEqual(['spin', '2s', 'infinite']);
    expect(spinner('md').content).toBe('"" / ""');

    await setReducedMotion(true);
    await nextFrame();
    expect([spinner('md').animationName, spinner('md').animationDuration, spinner('md').animationIterationCount]).toEqual(['spin', '4s', 'infinite']);
    // It still turns: its transform changes over time.
    const element = document.querySelector('#md .ds-loader__spinner');
    const first = getComputedStyle(element, '::before').transform;
    await expect.poll(() => getComputedStyle(element, '::before').transform).not.toBe(first);
  });

  it('with less motion, the bar takes its new width at once', async () => {
    await setReducedMotion(true);
    const loader = await mount<Loader>('<ds-loader value="10"></ds-loader>');
    const track = loader.querySelector('.ds-loader__track');
    const bar = () => loader.querySelector('.ds-loader__bar');

    loader.value = 50;
    await nextFrame();
    await nextFrame();

    expect(bar().getBoundingClientRect().width).toBeCloseTo(track.clientWidth / 2, 0);
  });

  it('a block loader centers its spinner; a bar takes the width of its container; inline, it is in the line of the text', async () => {
    await mount(`
      <div id="block" style="width: 400px"><ds-loader></ds-loader></div>
      <div id="bar" style="width: 400px"><ds-loader value="25"></ds-loader></div>
      <p id="line">Saving <ds-loader inline label="Saving"></ds-loader> your changes</p>`);
    const spinner = document.querySelector('#block .ds-loader__spinner').getBoundingClientRect();
    const track = document.querySelector('#bar .ds-loader__track').getBoundingClientRect();
    const fill = document.querySelector('#bar .ds-loader__bar').getBoundingClientRect();
    const inline = document.querySelector('#line ds-loader').getBoundingClientRect();
    const line = document.querySelector('#line').getBoundingClientRect();

    expect(spinner.left + spinner.width / 2).toBeCloseTo(document.querySelector('#block').getBoundingClientRect().left + 200, 0);
    expect(track.width).toBe(400);
    expect(fill.width).toBeCloseTo((track.width - 2) / 4, 0);
    // The size of the text, on its line.
    expect([inline.width, inline.height]).toEqual([16, 16]);
    expect(inline.top).toBeGreaterThanOrEqual(line.top);
    expect(inline.bottom).toBeLessThanOrEqual(line.bottom);
  });

  it('right to left: the bar is filled from the right', async () => {
    document.documentElement.dir = 'rtl';
    const loader = await mount('<ds-loader value="25"></ds-loader>');
    const track = loader.querySelector('.ds-loader__track').getBoundingClientRect();
    const fill = loader.querySelector('.ds-loader__bar').getBoundingClientRect();

    expect(fill.right).toBeCloseTo(track.right - 1, 0);
    expect(fill.left).toBeGreaterThan(track.left + track.width / 2);
  });

  it('keeps the spinner, the filled part of the bar and its track visible in forced colors', async () => {
    await mount('<p><ds-loader id="spinner"></ds-loader><ds-loader id="bar" value="50"></ds-loader></p>');
    await setForcedColors(true);
    await nextFrame();
    const text = getComputedStyle(document.querySelector('p')).color;
    const spinner = getComputedStyle(document.querySelector('#spinner .ds-loader__spinner'), '::before');
    const fill = getComputedStyle(document.querySelector('#bar .ds-loader__bar'));
    const track = getComputedStyle(document.querySelector('#bar .ds-loader__track'));

    expect([spinner.forcedColorAdjust, spinner.backgroundColor]).toEqual(['preserve-parent-color', text]);
    expect([fill.forcedColorAdjust, fill.backgroundColor]).toEqual(['preserve-parent-color', text]);
    expect([track.borderTopStyle, track.borderTopColor]).toEqual(['solid', text]);
    expect(fill.backgroundColor).not.toBe(track.backgroundColor);
  });
});
