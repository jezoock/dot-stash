import { newSpecPage } from '@stencil/core/testing';
import { DSSlider } from './slider';
import { DSSliderParams } from './slider.types';

describe('ds-slider', () => {
  // `menu` is a flag: this assignment is type-checked by the build (`npm run build` type-checks the spec files).
  const withMenu: DSSliderParams = { menu: true, controls: false };

  it('renders the slider menu when the menu flag is set', async () => {
    const page = await newSpecPage({ components: [DSSlider], html: '<ds-slider><ds-slider-item>1</ds-slider-item></ds-slider>' });

    expect(page.root.querySelector('ds-slider-menu')).toBeNull();

    page.root.params = withMenu;
    await page.waitForChanges();

    expect(page.root.querySelector('ds-slider-menu')).not.toBeNull();
  });

  it('renders the measured state (prev/next triggers, classes) once after the load, without Stencil warning', async () => {
    const warnSpy = jest.spyOn(console, 'warn');
    const renderSpy = jest.spyOn(DSSlider.prototype, 'render');
    const page = await newSpecPage({ components: [DSSlider], html: '' });
    // The spec DOM has no layout: 4 items of 100 x 50 px in a 250 px wide slider, so the list scrolls.
    const elementPrototype = Object.getPrototypeOf(Object.getPrototypeOf(page.doc.createElement('div')));
    const size = (element: HTMLElement, dimension: 'width' | 'height') =>
      element.tagName === 'DS-SLIDER-ITEM' ? (dimension === 'width' ? 100 : 50) : element.classList?.contains('ds-slider') && dimension === 'width' ? 250 : 0;
    Object.defineProperty(elementPrototype, 'offsetWidth', {
      configurable: true,
      get: function () {
        return size(this, 'width');
      },
    });
    Object.defineProperty(elementPrototype, 'offsetHeight', {
      configurable: true,
      get: function () {
        return size(this, 'height');
      },
    });

    try {
      await page.setContent(`<ds-slider>${'<ds-slider-item>item</ds-slider-item>'.repeat(4)}</ds-slider>`);
      const slider = page.root.querySelector('.ds-slider');

      expect(slider).toHaveClasses(['--scrollable', '--isReady']);
      expect(Array.from(page.root.querySelectorAll('ds-trigger')).map(trigger => trigger.className)).toEqual(['ds-slider__prev-button', 'ds-slider__next-button']);
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(warnSpy.mock.calls.filter(args => String(args[0]).includes('changed during'))).toEqual([]);
    } finally {
      delete elementPrototype.offsetWidth;
      delete elementPrototype.offsetHeight;
      jest.restoreAllMocks();
    }
  });
});
