import { describe, expect, it } from 'vitest';
import './thumb';
import { renderPage } from '../../../test/helpers';
import { hueOf, initialsOf, toRatio } from './thumb.utils';

type Thumb = HTMLElement & { src: string; alt: string; label: string; decorative: boolean; ratio: string; loading: string };

describe('ds-thumb', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const thumb = page.body.querySelector('ds-thumb') as Thumb;
    const image = () => thumb.querySelector<HTMLImageElement>('.ds-thumb__image');
    const placeholder = () => thumb.querySelector<HTMLElement>('.ds-thumb__placeholder');
    return { page, thumb, image, placeholder };
  };

  describe('an image', () => {
    it('loads lazily and asynchronously, named by alt, its proportions from ratio, loading until its load event', async () => {
      const { page, thumb, image, placeholder } = await render('<ds-thumb src="/poster.jpg" alt="The Matrix" ratio="2/3"></ds-thumb>');

      expect(thumb).toHaveClasses(['ds-thumb', '--loading']);
      expect(image()).toEqualAttributes({ src: '/poster.jpg', alt: 'The Matrix', loading: 'lazy', decoding: 'async' });
      expect(thumb.style.getPropertyValue('--ds-thumb-ratio')).toBe('2 / 3');
      expect(placeholder()).toBeNull();

      image().dispatchEvent(new Event('load'));
      await page.waitForChanges();
      expect(thumb).toHaveClasses(['ds-thumb', '--loaded']);
      expect(thumb).not.toHaveClass('--loading');
    });

    it('srcset, sizes and loading="eager" go to the image; label names it without alt', async () => {
      const { image } = await render('<ds-thumb srcset="/a-200.jpg 200w, /a-400.jpg 400w" sizes="200px" loading="eager" label="Arte"></ds-thumb>');

      expect(image()).toEqualAttributes({ srcset: '/a-200.jpg 200w, /a-400.jpg 400w', sizes: '200px', loading: 'eager', alt: 'Arte' });
      expect(image().hasAttribute('src')).toBe(false);
    });

    it('an unknown loading is lazy', async () => {
      const { image } = await render('<ds-thumb src="/a.jpg" alt="A" loading="later"></ds-thumb>');

      expect(image().getAttribute('loading')).toBe('lazy');
    });

    it('fails: the placeholder takes its place, named as the image', async () => {
      const { page, thumb, image, placeholder } = await render('<ds-thumb src="/missing.jpg" alt="The Matrix poster" label="The Matrix"></ds-thumb>');

      image().dispatchEvent(new Event('error'));
      await page.waitForChanges();

      expect(thumb).toHaveClasses(['ds-thumb', '--error', '--placeholder']);
      expect(image()).toBeNull();
      expect(placeholder()).toEqualAttributes({ 'role': 'img', 'aria-label': 'The Matrix poster' });
      expect(placeholder().textContent).toBe('TM');
    });

    it('a new source after a failure: loading again', async () => {
      const { page, thumb, image } = await render('<ds-thumb src="/missing.jpg" alt="A"></ds-thumb>');

      image().dispatchEvent(new Event('error'));
      await page.waitForChanges();
      thumb.src = '/other.jpg';
      await page.waitForChanges();

      expect(thumb).toHaveClasses(['ds-thumb', '--loading']);
      expect(image().getAttribute('src')).toBe('/other.jpg');
    });
  });

  describe('the placeholder', () => {
    it('without a source: the initials of label on its hue, named by label', async () => {
      const { thumb, image, placeholder } = await render('<ds-thumb label="The Matrix"></ds-thumb>');
      const initials = placeholder().querySelector('.ds-thumb__initials');

      expect(thumb).toHaveClasses(['ds-thumb', '--placeholder']);
      expect(image()).toBeNull();
      expect(placeholder()).toEqualAttributes({ 'role': 'img', 'aria-label': 'The Matrix' });
      expect(initials.textContent).toBe('TM');
      expect(initials.getAttribute('aria-hidden')).toBe('true');
      expect(placeholder().style.getPropertyValue('--ds-thumb-hue')).toBe(String(hueOf('The Matrix')));
    });

    it('decorative, or an empty alt: out of the accessibility tree, the image without alternative', async () => {
      const { page, thumb, placeholder, image } = await render('<ds-thumb label="Arte" decorative></ds-thumb>');

      expect(placeholder().getAttribute('aria-hidden')).toBe('true');
      expect(placeholder().hasAttribute('role')).toBe(false);
      expect(placeholder().hasAttribute('aria-label')).toBe(false);

      thumb.decorative = false;
      thumb.alt = '';
      thumb.src = '/arte.png';
      await page.waitForChanges();
      expect(image().getAttribute('alt')).toBe('');
    });

    it('without a name: not read', async () => {
      const { placeholder } = await render('<ds-thumb></ds-thumb>');

      expect(placeholder().getAttribute('aria-hidden')).toBe('true');
      expect(placeholder().querySelector('.ds-thumb__initials')).toBeNull();
    });

    it('follows label: its initials and its hue', async () => {
      const { page, thumb, placeholder } = await render('<ds-thumb label="Arte"></ds-thumb>');

      thumb.label = 'France Culture';
      await page.waitForChanges();

      expect(placeholder().textContent).toBe('FC');
      expect(placeholder().style.getPropertyValue('--ds-thumb-hue')).toBe(String(hueOf('France Culture')));
    });

    it('the initials in the upper case of the language of the page', async () => {
      const { placeholder } = await render('<div lang="tr"><ds-thumb label="istanbul"></ds-thumb></div>');

      expect(placeholder().textContent).toBe('İ');
    });
  });

  it('mods: a class per modifier', async () => {
    const { thumb } = await render('<ds-thumb mods="poster, rounded" label="A"></ds-thumb>');

    expect(thumb).toHaveClasses(['ds-thumb', '--poster', '--rounded']);
  });
});

describe('ds-thumb helpers', () => {
  it.each([
    ['2/3', '2 / 3'],
    [' 16 / 9 ', '16 / 9'],
    ['16:9', '16 / 9'],
    ['1', '1 / 1'],
    ['1.5', '1.5 / 1'],
    ['', '1 / 1'],
    ['0/3', '1 / 1'],
    ['-1', '1 / 1'],
    ['a/b', '1 / 1'],
    ['1/2/3', '1 / 1'],
    [undefined, '1 / 1'],
  ])('ratio %s is %s', (ratio, expected) => {
    expect(toRatio(ratio)).toBe(expected);
  });

  it.each([
    ['The Matrix', 'TM'],
    ['Arte', 'A'],
    ['  le  seigneur des anneaux ', 'LA'],
    ["l'Été indien", 'LI'],
    ['E\u0301te 2024', 'É2'],
    ['« Amélie »', 'A'],
    ['東京 物語', '東物'],
    ['😀 Smile', 'S'],
    ['...', ''],
    ['', ''],
  ])('the initials of %j are %j', (label, initials) => {
    expect(initialsOf(label)).toBe(initials);
  });

  it('a hue from 0 to 359, the same for the same words, whatever their case and spaces', () => {
    const hues = ['The Matrix', 'Arte', 'France Culture', 'Netflix', 'Plex', 'YouTube', 'Jellyfin', 'Twitch'].map(hueOf);

    expect(hues.every(hue => Number.isInteger(hue) && hue >= 0 && hue < 360)).toBe(true);
    // Different labels, different hues most of the time (two of these eight share one).
    expect(new Set(hues).size).toBeGreaterThanOrEqual(7);
    expect(hueOf('the  MATRIX')).toBe(hueOf('The Matrix'));
    expect(hueOf('')).toBe(hueOf('...'));
  });
});
