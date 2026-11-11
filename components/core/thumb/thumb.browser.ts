import { describe, expect, it } from 'vitest';
import { accessibleNode, mount, nextFrame, setForcedColors } from '../../../test/helpers/browser';

type Thumb = HTMLElement & { src: string; label: string };

/** An image of 40 × 60 px, and a file that is not an image. */
const IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="60"><rect width="40" height="60" fill="red"/></svg>')}`;
const BROKEN = 'data:image/png;base64,AAAA';

/** The relative luminance of an `rgb()` color (WCAG 2). */
const luminance = (color: string) => {
  const [r, g, b] = color
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)
    .map(value => value / 255)
    .map(value => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

describe('ds-thumb in a browser', () => {
  it('keeps its proportions, and crops the image to fill them', async () => {
    await mount(`
      <div style="width: 200px">
        <ds-thumb id="poster" ratio="2/3" src="${IMAGE}" alt="Poster"></ds-thumb>
        <ds-thumb id="still" ratio="16/9" src="${IMAGE}" alt="Still"></ds-thumb>
        <ds-thumb id="square" label="Arte"></ds-thumb>
      </div>`);
    const box = (id: string) => document.querySelector(`#${id}`).getBoundingClientRect();

    expect([box('poster').width, box('poster').height]).toEqual([200, 300]);
    expect([box('still').width, Math.round(box('still').height)]).toEqual([200, 113]);
    expect([box('square').width, box('square').height]).toEqual([200, 200]);
    await expect.poll(() => document.querySelector('#still').classList.contains('--loaded')).toBe(true);
    const image = document.querySelector('#still .ds-thumb__image').getBoundingClientRect();
    expect([image.width, Math.round(image.height)]).toEqual([200, 113]);
    expect(getComputedStyle(document.querySelector('#still .ds-thumb__image')).objectFit).toBe('cover');
  });

  it('loads lazily: --loading, then --loaded and shown; the image is named by alt', async () => {
    const thumb = await mount<Thumb>(`<ds-thumb src="${IMAGE}" alt="The Matrix" style="width: 100px"></ds-thumb>`);
    const image = thumb.querySelector('img');

    expect([image.loading, image.decoding]).toEqual(['lazy', 'async']);
    await expect.poll(() => thumb.classList.contains('--loaded')).toBe(true);
    await expect.poll(() => getComputedStyle(image).opacity).toBe('1');
    expect(await accessibleNode('ds-thumb img')).toMatchObject({ role: 'image', name: 'The Matrix' });
  });

  it('an image far below the viewport is not requested until it nears it', async () => {
    const src = `${IMAGE}#far`;
    await mount(`<div style="height: 5000px"></div><ds-thumb id="far" src="${src}" alt="Far" style="width: 100px"></ds-thumb>`);
    const thumb = document.querySelector('#far');

    await nextFrame();
    expect(thumb.classList.contains('--loading')).toBe(true);
    thumb.scrollIntoView();
    await expect.poll(() => thumb.classList.contains('--loaded')).toBe(true);
    window.scrollTo(0, 0);
  });

  it('a failed image: the placeholder, named as the image, with the initials of the label', async () => {
    const thumb = await mount<Thumb>(`<ds-thumb src="${BROKEN}" alt="The Matrix poster" label="The Matrix" loading="eager" style="width: 120px"></ds-thumb>`);

    await expect.poll(() => thumb.classList.contains('--error')).toBe(true);
    expect(thumb.querySelector('img')).toBeNull();
    expect(await accessibleNode('.ds-thumb__placeholder')).toMatchObject({ role: 'image', name: 'The Matrix poster' });
    expect(await accessibleNode('.ds-thumb__initials')).toBeNull();
    expect(thumb.querySelector('.ds-thumb__initials').textContent).toBe('TM');
  });

  it('decorative: neither the image nor the placeholder is in the accessibility tree', async () => {
    await mount(`<ds-thumb id="a" src="${IMAGE}" decorative style="width: 50px"></ds-thumb><ds-thumb id="b" label="Arte" alt=""></ds-thumb>`);

    await expect.poll(() => document.querySelector('#a').classList.contains('--loaded')).toBe(true);
    expect(await accessibleNode('#a img')).toBeNull();
    expect(await accessibleNode('#b .ds-thumb__placeholder')).toBeNull();
  });

  it('the initials are centered, at a size relative to the thumbnail, and readable on every hue (4.5:1 at least)', async () => {
    const hues = Array.from({ length: 24 }, (_, index) => index * 15);
    await mount(hues.map(hue => `<ds-thumb id="h${hue}" label="Hue ${hue}" style="width: 100px; display: inline-block"></ds-thumb>`).join(''));

    for (const hue of hues) {
      const placeholder = document.querySelector<HTMLElement>(`#h${hue} .ds-thumb__placeholder`);
      placeholder.style.setProperty('--ds-thumb-hue', String(hue));
      const style = getComputedStyle(placeholder);
      expect([hue, contrast(style.backgroundColor, style.color) >= 4.5]).toEqual([hue, true]);
    }
    const thumb = document.querySelector('#h0').getBoundingClientRect();
    const initials = document.querySelector('#h0 .ds-thumb__initials');
    const box = initials.getBoundingClientRect();
    expect(getComputedStyle(initials).fontSize).toBe('40px');
    expect(Math.abs(box.left + box.width / 2 - (thumb.left + thumb.width / 2))).toBeLessThan(1);
    expect(Math.abs(box.top + box.height / 2 - (thumb.top + thumb.height / 2))).toBeLessThan(1);
  });

  it('two labels, two colors; the same label, the same color', async () => {
    await mount('<ds-thumb id="a" label="Netflix"></ds-thumb><ds-thumb id="b" label="Plex"></ds-thumb><ds-thumb id="c" label="netflix"></ds-thumb>');
    const color = (id: string) => getComputedStyle(document.querySelector(`#${id} .ds-thumb__placeholder`)).backgroundColor;

    expect(color('a')).not.toBe(color('b'));
    expect(color('a')).toBe(color('c'));
  });

  it('in forced colors, the initials stay readable', async () => {
    await setForcedColors(true);
    await mount('<ds-thumb label="Arte" style="width: 100px"></ds-thumb>');
    const style = getComputedStyle(document.querySelector('.ds-thumb__placeholder'));

    expect(contrast(style.backgroundColor, style.color)).toBeGreaterThanOrEqual(4.5);
  });
});
