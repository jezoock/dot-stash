import { newSpecPage } from '@stencil/core/testing';
import { DSBlock } from './block';

describe('ds-block', () => {
  it.each([
    ['<ds-block></ds-block>', 'block'],
    ['<ds-block article></ds-block>', 'article'],
    ['<ds-block section></ds-block>', 'section'],
    ['<ds-block form></ds-block>', 'form'],
    ['<ds-block modal></ds-block>', 'modal'],
  ])('%s has the %p context', async (html, context) => {
    const page = await newSpecPage({ components: [DSBlock], html });

    expect(await page.root.getContext()).toBe(context);
    expect(page.root).toHaveClass(`ds-${context}`);
    expect(page.root.querySelector(`.ds-${context}__body`)).not.toBeNull();
  });

  it('builds the class from name and type, with the modifiers', async () => {
    const page = await newSpecPage({ components: [DSBlock], html: '<ds-block name="home" type="hero" mods="dark,wide"></ds-block>' });

    expect(page.root).toHaveClasses(['ds-home-hero', '--dark', '--wide']);
  });
});
