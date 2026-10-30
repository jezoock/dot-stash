import { newSpecPage } from '@stencil/core/testing';
import { DSMainTest } from './main';

describe('ds-main', () => {
  it('passes the responsive params of the grid item as a JSON string', async () => {
    const page = await newSpecPage({ components: [DSMainTest], html: '<ds-main></ds-main>' });
    const responsiveItem = page.root.querySelector('ds-grid-item[data-rsp]');

    expect(JSON.parse(responsiveItem.getAttribute('data-rsp'))).toEqual({
      xs: { width: 2 },
      sm: { width: 3 },
      md: { width: 4 },
      lg: { width: 5 },
    });
  });

  it('renders the prev / next triggers of the slider', async () => {
    const page = await newSpecPage({ components: [DSMainTest], html: '<ds-main></ds-main>' });
    const triggers = Array.from(page.root.querySelectorAll('ds-trigger[target="#bob"]'));

    expect(page.root.querySelector('ds-slider#bob')).not.toBeNull();
    expect(triggers.map(trigger => trigger.getAttribute('action'))).toEqual(['prev', 'next']);
  });
});
