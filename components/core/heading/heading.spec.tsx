import { describe, expect, it } from 'vitest';
import './heading';
import '../title/title';
import { renderPage } from '../../../test/helpers';

describe('ds-heading', () => {
  it('groups the titles in an hgroup', async () => {
    const page = await renderPage('<ds-heading><h1>Title</h1></ds-heading>');

    expect(page.root.querySelector('hgroup.ds-heading__content')).not.toBeNull();
    expect(page.root.querySelector('hlgroup')).toBeNull();
  });

  it('renders the sub-title when there is one, without image', async () => {
    const page = await renderPage('<ds-heading><h1>Title</h1><h2 slot="sub-title">Sub-title</h2></ds-heading>');
    const subTitle = page.root.querySelector('.ds-heading__sub-title');

    expect(subTitle).not.toBeNull();
    expect(subTitle.textContent).toContain('Sub-title');
    expect(page.root.querySelector('.ds-heading__image')).toBeNull();
  });

  it('renders no sub-title for an image alone', async () => {
    const page = await renderPage('<ds-heading><img slot="image" src="/a.png" alt="" /><h1>Title</h1></ds-heading>');

    expect(page.root.querySelector('.ds-heading__image')).not.toBeNull();
    expect(page.root.querySelector('.ds-heading__sub-title')).toBeNull();
  });

  it('its main title is the heading: a heading element, or a text with level', async () => {
    const withHeading = await renderPage('<ds-heading level="2"><h1>Title</h1><span slot="sub-title">Sub</span></ds-heading>');
    const [main, sub] = Array.from(withHeading.root.querySelectorAll('ds-title'));
    expect(main).not.toHaveAttribute('role');
    expect(sub).not.toHaveAttribute('role');

    const withLevel = await renderPage('<ds-heading level="2">Title<span slot="sub-title">Sub</span></ds-heading>');
    const [textMain, textSub] = Array.from(withLevel.root.querySelectorAll('ds-title'));
    expect(textMain).toEqualAttributes({ 'role': 'heading', 'aria-level': '2' });
    expect(textSub).not.toHaveAttribute('role');
  });
});
