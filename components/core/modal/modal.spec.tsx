import { newSpecPage } from '@stencil/core/testing';
import { DSModal } from './modal';

describe('ds-modal', () => {
  const render = async (html = '<ds-modal><p>Content</p></ds-modal>') => {
    const page = await newSpecPage({ components: [DSModal], html });
    const onOpen = jest.fn();
    const onClose = jest.fn();
    page.root.addEventListener('modalOpen', onOpen);
    page.root.addEventListener('modalClose', onClose);
    return { page, onOpen, onClose };
  };

  const pressEscape = () => document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

  it('opens and closes on the request events, emitting each event once', async () => {
    const { page, onOpen, onClose } = await render();

    page.root.dispatchEvent(new CustomEvent('request_showModal_event'));
    await page.waitForChanges();
    expect(page.root.shown).toBe(true);
    expect(page.body).toHaveClass('ds-js--modal-open');

    page.root.dispatchEvent(new CustomEvent('request_hideModal_event'));
    await page.waitForChanges();
    expect(page.root.shown).toBe(false);
    expect(page.body).not.toHaveClass('ds-js--modal-open');

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reads the request_toggleModal_event detail', async () => {
    const { page } = await render();

    page.root.dispatchEvent(new CustomEvent('request_toggleModal_event', { detail: { show: true } }));
    await page.waitForChanges();
    expect(page.root.shown).toBe(true);

    page.root.dispatchEvent(new CustomEvent('request_toggleModal_event', { detail: { show: false } }));
    await page.waitForChanges();
    expect(page.root.shown).toBe(false);

    // Without a detail, the event toggles the modal.
    page.root.dispatchEvent(new CustomEvent('request_toggleModal_event'));
    await page.waitForChanges();
    expect(page.root.shown).toBe(true);
  });

  it('closes on Escape, emitting modalClose once', async () => {
    const { page, onClose } = await render();

    page.root.shown = true;
    await page.waitForChanges();
    pressEscape();
    await page.waitForChanges();

    expect(page.root.shown).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on a mouse down outside the dialog', async () => {
    const { page, onClose } = await render();

    page.root.shown = true;
    await page.waitForChanges();

    page.root.querySelector('.ds-modal__content p').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await page.waitForChanges();
    expect(page.root.shown).toBe(true);

    page.root.querySelector('.ds-lightbox__container').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await page.waitForChanges();
    expect(page.root.shown).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('leaves the inline styles of the body as they were', async () => {
    const { page } = await render();

    page.root.shown = true;
    await page.waitForChanges();
    page.root.shown = false;
    await page.waitForChanges();
    expect(page.body.hasAttribute('style')).toBe(false);

    page.body.style.overflow = 'scroll';
    page.root.shown = true;
    await page.waitForChanges();
    pressEscape();
    await page.waitForChanges();
    expect(page.body.style.overflow).toBe('scroll');
  });

  it('keeps the body class until the last shown modal is hidden', async () => {
    const page = await newSpecPage({ components: [DSModal], html: '<ds-modal id="a"></ds-modal><ds-modal id="b"></ds-modal>' });
    const [a, b] = Array.from(page.body.querySelectorAll('ds-modal'));

    a.shown = true;
    b.shown = true;
    await page.waitForChanges();

    a.shown = false;
    await page.waitForChanges();
    expect(page.body).toHaveClass('ds-js--modal-open');

    b.shown = false;
    await page.waitForChanges();
    expect(page.body).not.toHaveClass('ds-js--modal-open');
  });

  it('releases the body when it is removed while shown, but not while another modal is shown', async () => {
    const page = await newSpecPage({ components: [DSModal], html: '<ds-modal id="a" shown></ds-modal><ds-modal id="b" shown></ds-modal><ds-modal id="c"></ds-modal>' });
    const [a, b, c] = Array.from(page.body.querySelectorAll('ds-modal'));
    expect(page.body).toHaveClass('ds-js--modal-open');

    // A hidden modal removed from the document does not release the body either.
    c.remove();
    a.remove();
    await page.waitForChanges();
    expect(page.body).toHaveClass('ds-js--modal-open');

    b.remove();
    await page.waitForChanges();
    expect(page.body).not.toHaveClass('ds-js--modal-open');
    expect(page.body.hasAttribute('style')).toBe(false);

    // Put back while shown, it applies its open state again, Escape listener included.
    page.body.appendChild(b);
    await page.waitForChanges();
    expect(page.body).toHaveClass('ds-js--modal-open');
    pressEscape();
    await page.waitForChanges();
    expect(b.shown).toBe(false);
    expect(page.body).not.toHaveClass('ds-js--modal-open');
  });

  it('closes on Escape when rendered open', async () => {
    const { page } = await render('<ds-modal shown></ds-modal>');

    expect(page.body).toHaveClass('ds-js--modal-open');

    pressEscape();
    await page.waitForChanges();
    expect(page.root.shown).toBe(false);
    expect(page.body).not.toHaveClass('ds-js--modal-open');
  });
});
