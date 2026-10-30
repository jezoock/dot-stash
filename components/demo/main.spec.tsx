import { newSpecPage } from '@stencil/core/testing';
import { DSButton } from '../core/button/button';
import { DSCombo } from '../core/combo/combo';
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

  it('only uses existing components: ds-heading, no ds-header', async () => {
    const page = await newSpecPage({ components: [DSMainTest], html: '<ds-main></ds-main>' });

    expect(page.root.querySelector('ds-header')).toBeNull();
    expect(Array.from(page.root.querySelectorAll('ds-block > ds-heading')).map(heading => heading.textContent)).toEqual([
      "TitreSous-titreTexte d'introduction",
      'Combos',
      'Boutons',
    ]);
  });

  it('renders a single and a multiple combo, and buttons: disabled, link, submit', async () => {
    const page = await newSpecPage({ components: [DSMainTest, DSCombo, DSButton], html: '<ds-main></ds-main>' });
    const single = page.root.querySelector('#demo-combo-single') as HTMLDsComboElement;
    const multiple = page.root.querySelector('#demo-combo-multiple') as HTMLDsComboElement;

    expect(single.multiple).toBe(false);
    expect(single.selectedOptions.map(option => option.name)).toEqual(['Vert']);
    expect(multiple.multiple).toBe(true);
    expect(multiple.selectedOptions.map(option => option.name)).toEqual(['S']);
    expect(page.root.querySelector('#demo-button-disabled button').hasAttribute('disabled')).toBe(true);
    expect(page.root.querySelector('#demo-button-link a').getAttribute('href')).toBe('#demo-form');
    expect(page.root.querySelector('#demo-button-link-disabled a').hasAttribute('href')).toBe(false);
    expect(page.root.querySelector('form #demo-button-submit button').getAttribute('type')).toBe('submit');
  });
});
