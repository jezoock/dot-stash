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
});
