import { newSpecPage } from '@stencil/core/testing';
import { DSIcon } from './icon';

describe('ds-icon', () => {
  it('is decorative by default: hidden from assistive technologies', async () => {
    const page = await newSpecPage({ components: [DSIcon], html: '<ds-icon type="cart"></ds-icon>' });

    expect(page.root).toHaveClasses(['ds-icon', '--cart']);
    expect(page.root).toEqualAttribute('aria-hidden', 'true');
    expect(page.root).not.toHaveAttribute('role');
    expect(page.root).not.toHaveAttribute('aria-label');
  });

  it('with label, is an image with that name', async () => {
    const page = await newSpecPage({ components: [DSIcon], html: '<ds-icon type="help" label="Help"></ds-icon>' });

    expect(page.root).toEqualAttributes({ 'role': 'img', 'aria-label': 'Help' });
    expect(page.root).not.toHaveAttribute('aria-hidden');

    page.root.label = undefined;
    await page.waitForChanges();
    expect(page.root).toEqualAttribute('aria-hidden', 'true');
    expect(page.root).not.toHaveAttribute('role');
  });

  it.each(['aria-label="Cart"', 'aria-labelledby="cart-title"'])('named by its own %s, is an image', async attribute => {
    const page = await newSpecPage({ components: [DSIcon], html: `<ds-icon type="cart" ${attribute}></ds-icon>` });

    expect(page.root).toEqualAttribute('role', 'img');
    expect(page.root).not.toHaveAttribute('aria-hidden');
  });
});
