import { describe, expect, it } from 'vitest';
import './title';
import { renderPage } from '../../../test/helpers';

describe('ds-title', () => {
  it('renders no heading of its own: a heading in it keeps its level', async () => {
    const page = await renderPage('<ds-title section><h2>Title</h2></ds-title>');

    expect(page.root).not.toHaveAttribute('role');
    expect(page.root.querySelector('h2')).not.toBeNull();
  });

  it('with level, a text title is a heading of that level', async () => {
    const page = await renderPage('<ds-title page level="1">Title</ds-title>');

    expect(page.root).toEqualAttributes({ 'role': 'heading', 'aria-level': '1' });
  });

  it.each([
    ['an invalid level', '<ds-title level="7">Title</ds-title>'],
    ['a heading in the title', '<ds-title level="2"><h3>Title</h3></ds-title>'],
  ])('is not a heading with %s', async (_, html) => {
    const page = await renderPage(html);

    expect(page.root).not.toHaveAttribute('role');
    expect(page.root).not.toHaveAttribute('aria-level');
  });
});
