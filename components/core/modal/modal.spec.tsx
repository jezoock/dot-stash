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

  it('closes on Escape when rendered open', async () => {
    const { page } = await render('<ds-modal shown></ds-modal>');

    expect(page.body).toHaveClass('ds-js--modal-open');

    pressEscape();
    await page.waitForChanges();
    expect(page.root.shown).toBe(false);
    expect(page.body).not.toHaveClass('ds-js--modal-open');
  });
});
