import { newSpecPage } from '@stencil/core/testing';
import { DSBlock } from '../core/block/block';
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
    expect(Array.from(page.root.querySelectorAll('ds-block > ds-heading[slot="header"]')).map(heading => heading.textContent)).toEqual([
      "TitreSous-titreTexte d'introduction",
      'Combos',
      'Boutons',
    ]);
  });

  it('puts the block headings and footers in the header and footer wrappers of ds-block', async () => {
    const page = await newSpecPage({ components: [DSMainTest, DSBlock], html: '<ds-main></ds-main>' });
    const parentClass = (selector: string) => Array.from(page.root.querySelectorAll(selector)).map(element => element.parentElement.className);

    expect(parentClass('ds-heading[slot="header"]')).toEqual(['ds-block__header', 'ds-demo-combos-section__header', 'ds-demo-buttons-section__header']);
    expect(parentClass('ds-title-bar[slot="header"]')).toEqual(['ds-homepage-history-section__header']);
    expect(parentClass('footer[slot="footer"]')).toEqual(['ds-block__footer', 'ds-homepage-history-section__footer']);
  });

  it('renders a single and a multiple combo, and a form submit button', async () => {
    const page = await newSpecPage({ components: [DSMainTest, DSCombo], html: '<ds-main></ds-main>' });
    const single = page.root.querySelector('#demo-combo-single') as HTMLDsComboElement;
    const multiple = page.root.querySelector('#demo-combo-multiple') as HTMLDsComboElement;

    expect(single.multiple).toBe(false);
    expect(single.selectedOptions.map(option => option.name)).toEqual(['Vert']);
    expect(multiple.multiple).toBe(true);
    expect(multiple.selectedOptions.map(option => option.name)).toEqual(['S']);
    expect(page.root.querySelector('form #demo-button-submit').getAttribute('type')).toBe('submit');
  });
});
