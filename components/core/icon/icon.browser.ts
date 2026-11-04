import { afterEach, describe, expect, it } from 'vitest';
import { commands, page } from 'vitest/browser';
import { mount, nextFrame, setForcedColors } from '../../../test/helpers/browser';

// The icons of the theme: SVG images (data URIs of the stylesheet) drawn as masks, a box of 1em painted in the color of the
// text (scss/engine/tools/_icons.scss). They request no file, show in the color and at the size of the text, and stay
// visible in forced colors.

/** The pixels of a screenshot of an element, and their scale (device pixels per CSS pixel). */
const snapshot = async (element: Element) => {
  const image = new Image();
  image.src = `data:image/png;base64,${await page.screenshot({ element, save: false })}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = [image.width, image.height];
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const box = element.getBoundingClientRect();
  return { data: context.getImageData(0, 0, image.width, image.height), box, scale: image.width / box.width };
};

type Snapshot = Awaited<ReturnType<typeof snapshot>>;
type Rgb = [number, number, number];

/** The pixels of a snapshot in the box of an element (its border box, in CSS pixels), as [r, g, b]. */
const pixelsIn = ({ data, box, scale }: Snapshot, rect: DOMRect): Rgb[] => {
  const pixels: Rgb[] = [];
  const [left, top] = [Math.round((rect.left - box.left) * scale), Math.round((rect.top - box.top) * scale)];
  const [right, bottom] = [Math.round((rect.right - box.left) * scale), Math.round((rect.bottom - box.top) * scale)];
  for (let y = Math.max(top, 0); y < Math.min(bottom, data.height); y++) {
    for (let x = Math.max(left, 0); x < Math.min(right, data.width); x++) {
      const index = (y * data.width + x) * 4;
      pixels.push([data.data[index], data.data[index + 1], data.data[index + 2]]);
    }
  }
  return pixels;
};

const rgb = (color: string): Rgb => (color.match(/\d+/g) ?? []).slice(0, 3).map(Number) as Rgb;
const isNear = (color: Rgb, target: Rgb, tolerance = 40) => color.every((value, index) => Math.abs(value - target[index]) <= tolerance);
/** The share of the pixels of a list that are near a color. */
const shareOf = (pixels: Rgb[], target: Rgb) => pixels.filter(pixel => isNear(pixel, target)).length / pixels.length;
/** The color of most of the pixels of a list: the background. */
const backgroundOf = (pixels: Rgb[]): Rgb => {
  const counts = new Map<string, number>();
  pixels.forEach(pixel => counts.set(pixel.join(), (counts.get(pixel.join()) ?? 0) + 1));
  return [...counts]
    .sort(([, a], [, b]) => b - a)[0][0]
    .split(',')
    .map(Number) as Rgb;
};

/** The mean difference of the channels of two images of the same size, from 0 to 255. */
const difference = (a: ImageData, b: ImageData) => a.data.reduce((sum, value, index) => sum + Math.abs(value - b.data[index]), 0) / a.data.length;
/** An image mirrored, its left on the right. */
const mirrored = ({ data, width, height }: ImageData) => {
  const result = new ImageData(width, height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) result.data.set(data.subarray((y * width + x) * 4, (y * width + x) * 4 + 4), (y * width + width - 1 - x) * 4);
  return result;
};

/** The computed style of the icon of an element: its pseudo-element. */
const iconStyle = (element: Element, pseudo = '::before') => getComputedStyle(element, pseudo);

describe('the icons of the theme in a browser', () => {
  const styles: HTMLStyleElement[] = [];

  /** Adds a stylesheet compiled from SCSS (the engine on its load path) to the page, for one test. */
  const addStylesheet = async (scss: string) => {
    const style = document.createElement('style');
    style.textContent = await commands.compileScss(scss);
    document.head.append(style);
    styles.push(style);
  };

  afterEach(() => {
    styles.splice(0).forEach(style => style.remove());
  });

  // The skins of the default theme that draw an icon, and ds-icon: the elements whose ::before or ::after is an icon.
  const SKINS = `
    <p id="text">Cart <ds-icon type="cart"></ds-icon> <ds-icon type="arrow-down" style="--ds-icon-size: 24px"></ds-icon></p>
    <ds-panel type="collapsible"><span slot="title">Shipping</span><p>Free from 50 €.</p></ds-panel>
    <ds-combo label="Fruit" options='[{"name": "Apple", "value": "apple"}]'></ds-combo>
    <ds-select label="Color"><option value="red">Red</option></ds-select>
    <ds-nav label="Main"><ds-nav-item has-children><a href="#about">About</a><ds-nav slot="children"><ds-nav-item><a href="#team">Team</a></ds-nav-item></ds-nav></ds-nav-item></ds-nav>
    <div class="ds-message --info">Info</div><div class="ds-message --warning">Warning</div><div class="ds-message --error">Error</div><div class="ds-message --success">Done</div>
    <div class="ds-toggler-item"><div class="ds-toggler-item__title">Details</div></div>
    <div class="ds-ajax --is-loading" style="height: 80px">Loading</div>`;

  /** The icons of SKINS: [description, element, pseudo-element]. */
  const skinIcons = (): [string, Element, string][] => [
    ['ds-icon cart', document.querySelector('ds-icon[type="cart"]'), '::before'],
    ['ds-icon arrow-down', document.querySelector('ds-icon[type="arrow-down"]'), '::before'],
    ['ds-panel', document.querySelector('.ds-panel__title'), '::after'],
    ['ds-combo', document.querySelector('.ds-combo__selected-option'), '::after'],
    ['ds-select', document.querySelector('.ds-select__label'), '::before'],
    ['ds-nav-item', document.querySelector('.ds-button.--menu-item'), '::before'],
    ...Array.from(document.querySelectorAll('.ds-message'), (message): [string, Element, string] => [`ds-message ${message.className}`, message, '::before']),
    ['toggler', document.querySelector('.ds-toggler-item__title'), '::after'],
    ['ds-ajax', document.querySelector('.ds-ajax'), '::after'],
  ];

  it('load with the theme without requesting a font, an image or a file that fails', async () => {
    await page.viewport(800, 800); // below md: the expand button of ds-nav-item shows
    await mount(SKINS);
    await document.fonts.ready;
    await nextFrame();

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    expect(resources.length).toBeGreaterThan(0); // the scripts and the stylesheet of the tests
    expect(resources.filter(resource => resource.initiatorType === 'css' || /\.(woff2?|ttf|otf|eot|svg)([?#]|$)/.test(resource.name)).map(({ name }) => name)).toEqual([]);
    expect(resources.filter(resource => resource.responseStatus >= 400).map(({ name }) => name)).toEqual([]);
    const fonts: string[] = [];
    document.fonts.forEach(font => fonts.push(`${font.family} ${font.status}`));
    expect(fonts).toEqual([]); // no @font-face in the theme
    for (const [name, element, pseudo] of skinIcons()) expect([name, iconStyle(element, pseudo).maskImage]).toEqual([name, expect.stringMatching(/^url\("data:image\/svg\+xml,/)]);
  });

  it('draw every icon of $icons: a mask of 1em that paints pixels in the color of the text, and nothing around them', async () => {
    await addStylesheet(`
      @use 'engine' as *;
      .gallery { display: flex; flex-wrap: wrap; gap: 8px; width: 760px; padding: 8px; background: #fff; color: rgb(200, 0, 0); font-size: 28px; }
      .gallery > span { display: flex; }
      @each $name, $image in $icons { .icon-#{$name}::before { @include ds-icon($name); } }
      @include ds-icon-tokens();
    `);
    const names = (await commands.compileScss(`@use 'engine' as *; @use 'sass:map'; a { names: map.keys($icons); }`)).match(/names: (.*);/)[1].split(', ');
    const gallery = await mount(`<div class="gallery">${names.map(name => `<span class="icon-${name}"></span>`).join('')}</div>`);
    const shot = await snapshot(gallery);

    expect(names.length).toBeGreaterThan(90);
    for (const span of Array.from(gallery.children)) {
      const name = span.className.slice('icon-'.length);
      const style = iconStyle(span);
      expect([name, style.maskImage, style.width, style.height, style.backgroundColor]).toEqual([
        name,
        expect.stringMatching(/^url\("data:image\/svg\+xml,/),
        '28px',
        '28px',
        'rgb(200, 0, 0)',
      ]);
      // Its pixels: the strokes in the color of the text (their edges partly covered), the others white (the background shows).
      const pixels = pixelsIn(shot, span.getBoundingClientRect());
      expect([name, pixels.filter(pixel => !isNear(pixel, [255, 255, 255], 30)).length / pixels.length > 0.04]).toEqual([name, true]);
      expect([name, shareOf(pixels, [200, 0, 0]) > 0.01]).toEqual([name, true]);
      expect([name, shareOf(pixels, [255, 255, 255]) > 0.25]).toEqual([name, true]);
    }
    // Between the icons: only the background.
    const gap = new DOMRect(shot.box.left, shot.box.top, shot.box.width, 8);
    expect(shareOf(pixelsIn(shot, gap), [255, 255, 255])).toBe(1);
  });

  it('draw the icons of the skins and of ds-icon at the size and in the color of their text, and follow a change of color', async () => {
    await page.viewport(800, 800);
    await mount(SKINS);

    for (const [name, element, pseudo] of skinIcons()) {
      const style = iconStyle(element, pseudo);
      // A square of 1em, painted with the color of the text of the pseudo-element (currentColor).
      expect([name, style.width, style.height, style.backgroundColor]).toEqual([name, style.fontSize, style.fontSize, style.color]);
      expect([name, parseFloat(style.width) > 10]).toEqual([name, true]);
    }
    // ds-icon: its element is the box of its icon, of the size of --ds-icon-size.
    const [cart, arrow] = Array.from(document.querySelectorAll('ds-icon'));
    expect([cart.getBoundingClientRect().width, cart.getBoundingClientRect().height]).toEqual([16, 16]);
    expect([arrow.getBoundingClientRect().width, arrow.getBoundingClientRect().height]).toEqual([24, 24]);

    // The color of the text paints the icon: a green icon, then a blue one.
    const icon = document.querySelector<HTMLElement>('ds-icon[type="arrow-down"]');
    for (const color of [
      [0, 128, 0],
      [0, 0, 220],
    ] as Rgb[]) {
      icon.style.setProperty('--ds-icon-color', `rgb(${color.join(', ')})`);
      expect(iconStyle(icon).backgroundColor).toBe(`rgb(${color.join(', ')})`);
      expect(shareOf(pixelsIn(await snapshot(icon), icon.getBoundingClientRect()), color)).toBeGreaterThan(0.05);
    }
  });

  // Forced colors replace the colors of the page with the system colors: the background of the box of an icon would be
  // the background of the page (Canvas), and the icon would not show. The icons keep their background, in the color their
  // parent is given: CanvasText in a text, LinkText in a link, ButtonText in a button.
  it('stay visible in forced colors, in the system color of the text, of a link or of a button around them', async () => {
    await page.viewport(800, 800);
    await mount(`${SKINS}<p><a href="#help" id="link">Help <ds-icon type="help"></ds-icon></a> <button type="button" id="button"><ds-icon type="plus"></ds-icon> Add</button></p>`);
    await setForcedColors(true);
    await nextFrame();

    expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const canvas = rgb(getComputedStyle(document.body).backgroundColor);
    const icons: [string, Element, string][] = [
      ...skinIcons(),
      ['ds-icon in a link', document.querySelector('#link ds-icon'), '::before'],
      ['ds-icon in a button', document.querySelector('#button ds-icon'), '::before'],
    ];
    for (const [name, element, pseudo] of icons) {
      const style = iconStyle(element, pseudo);
      // The parent of the pseudo-element is its element: the color the browser gives it, a system color.
      expect([name, style.backgroundColor]).toEqual([name, getComputedStyle(element).color]);
      expect([name, isNear(rgb(style.backgroundColor), canvas, 60)]).toEqual([name, false]);
    }
    expect(getComputedStyle(document.querySelector('#link')).color).not.toBe(getComputedStyle(document.querySelector('#text')).color); // LinkText, not CanvasText
    // The icons paint pixels over the background, of their color (a thin stroke: some pixels only partly covered).
    for (const selector of ['#text ds-icon', '#link ds-icon', '#button ds-icon']) {
      const element = document.querySelector(selector);
      const pixels = pixelsIn(await snapshot(element), element.getBoundingClientRect());
      const background = backgroundOf(pixels);
      const color = rgb(iconStyle(element).backgroundColor);
      expect([selector, pixels.filter(pixel => !isNear(pixel, background, 30)).length / pixels.length > 0.05]).toEqual([selector, true]);
      expect([selector, pixels.some(pixel => isNear(pixel, color, 100) && !isNear(pixel, background, 100))]).toEqual([selector, true]);
    }
  });

  // The theme draws its arrows and chevrons in the physical directions (the arrow types of ds-icon, the chevron of ds-panel
  // on the right): right to left, they are neither mirrored nor moved, as before.
  it('keep their direction and their side from right to left', async () => {
    await mount(`<div id="icons" style="background: #fff; color: #000; font-size: 24px"><div><ds-icon type="arrow-right"></ds-icon></div><div><ds-icon type="right"></ds-icon></div><div><ds-icon type="dir-left"></ds-icon></div></div>
      <ds-panel type="collapsible" style="width: 400px"><span slot="title">Shipping</span><p>Free from 50 €.</p></ds-panel>`);
    const icons = Array.from(document.querySelectorAll('#icons ds-icon'));
    const title = document.querySelector('.ds-panel__title');
    const state = async () => ({
      // Each icon as it is drawn (on the left of its line, then on the right: at whole pixels both times).
      images: await Promise.all(icons.map(async icon => (await snapshot(icon)).data)),
      chevron: [iconStyle(title, '::after').left, iconStyle(title, '::after').right, iconStyle(title, '::after').transform],
      title: [title.getBoundingClientRect().width, getComputedStyle(title).paddingRight],
    });
    const ltr = await state();

    document.documentElement.dir = 'rtl';
    await nextFrame();
    const rtl = await state();

    expect(rtl.chevron).toEqual(ltr.chevron);
    expect(rtl.title).toEqual(ltr.title);
    // The same images (but for the rendering of the edges, at another place), not mirrored ones.
    ltr.images.forEach((image, index) => {
      expect(difference(image, rtl.images[index])).toBeLessThan(1);
      expect(difference(mirrored(image), rtl.images[index])).toBeGreaterThan(5);
    });
    expect(icons[0].getBoundingClientRect().right).toBe(document.querySelector('#icons').getBoundingClientRect().right); // the line starts on the right
    // The chevron on the right of the title: its box ends at the right edge of the title.
    const chevron = iconStyle(title, '::after');
    expect(parseFloat(chevron.left) + parseFloat(chevron.width)).toBeCloseTo(title.getBoundingClientRect().width, 0);
  });
});
