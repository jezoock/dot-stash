import { newSpecPage } from '@stencil/core/testing';
import { DSHeading } from './heading';

describe('ds-heading', () => {
  it('groups the titles in an hgroup', async () => {
    const page = await newSpecPage({ components: [DSHeading], html: '<ds-heading><h1>Title</h1></ds-heading>' });

    expect(page.root.querySelector('hgroup.ds-heading__content')).not.toBeNull();
    expect(page.root.querySelector('hlgroup')).toBeNull();
  });

  it('renders the sub-title when there is one, without image', async () => {
    const page = await newSpecPage({ components: [DSHeading], html: '<ds-heading><h1>Title</h1><h2 slot="sub-title">Sub-title</h2></ds-heading>' });
    const subTitle = page.root.querySelector('.ds-heading__sub-title');

    expect(subTitle).not.toBeNull();
    expect(subTitle.textContent).toContain('Sub-title');
    expect(page.root.querySelector('.ds-heading__image')).toBeNull();
  });

  it('renders no sub-title for an image alone', async () => {
    const page = await newSpecPage({ components: [DSHeading], html: '<ds-heading><img slot="image" src="/a.png" alt="" /><h1>Title</h1></ds-heading>' });

    expect(page.root.querySelector('.ds-heading__image')).not.toBeNull();
    expect(page.root.querySelector('.ds-heading__sub-title')).toBeNull();
  });
});
