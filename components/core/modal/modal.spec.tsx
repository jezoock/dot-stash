import { afterEach, describe, expect, it, vi } from 'vitest';
import './modal';
import { keydown, renderPage, trackFocus } from '../../../test/helpers';

describe('ds-modal', () => {
  afterEach(() => vi.restoreAllMocks());

  const render = async (html = '<ds-modal><p>Content</p></ds-modal>') => {
    const page = await renderPage(html);
    const onOpen = vi.fn();
    const onClose = vi.fn();
    page.root.addEventListener('modalOpen', onOpen);
    page.root.addEventListener('modalClose', onClose);
    return { page, onOpen, onClose };
  };

  // Escape with the focus outside the modals (on the body): the keydown listener of the document.
  const pressEscape = () => keydown(document, 'Escape');

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

  it('closes on Escape (keydown), emitting modalClose once', async () => {
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
    const page = await renderPage('<ds-modal id="a"></ds-modal><ds-modal id="b"></ds-modal>');
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
    const page = await renderPage('<ds-modal id="a" shown></ds-modal><ds-modal id="b" shown></ds-modal><ds-modal id="c"></ds-modal>');
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

  describe('dialog pattern', () => {
    const dialogOf = (modal: Element) => modal.querySelector<HTMLElement>('.ds-lightbox__container > .ds-modal');

    it('renders a modal dialog, named and described by its title and description slots', async () => {
      const { page } = await render('<ds-modal><h2 slot="title">Delete the file?</h2><p slot="description">It cannot be undone.</p><button>Delete</button></ds-modal>');
      const dialog = dialogOf(page.root);
      const title = page.root.querySelector('[slot="title"]');
      const description = page.root.querySelector('[slot="description"]');

      expect(dialog).toEqualAttributes({ 'role': 'dialog', 'aria-modal': 'true', 'tabindex': '-1' });
      expect(title.id).toMatch(/^ds-modal-\d+-title$/);
      expect(description.id).toMatch(/^ds-modal-\d+-description$/);
      expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
      expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
      expect(dialog.hasAttribute('aria-label')).toBe(false);
      // The title and description are in the dialog, before the content.
      expect(Array.from(dialog.children).map(child => child.getAttribute('slot') ?? child.className)).toEqual(['title', 'description', 'ds-modal__content']);
    });

    it('keeps the ids of the title and description, and does not take the ones of a modal in its content', async () => {
      const { page } = await render(
        '<ds-modal id="outer"><h2 slot="title" id="my-title">Outer</h2><ds-modal id="inner" label="Inner"><p slot="description">Inner text</p></ds-modal></ds-modal>',
      );
      const outer = page.body.querySelector('#outer');
      const inner = page.body.querySelector('#inner');

      expect(dialogOf(outer).getAttribute('aria-labelledby')).toBe('my-title');
      expect(dialogOf(outer).hasAttribute('aria-describedby')).toBe(false);
      expect(dialogOf(inner).hasAttribute('aria-labelledby')).toBe(false);
      expect(dialogOf(inner).getAttribute('aria-label')).toBe('Inner');
      expect(dialogOf(inner).getAttribute('aria-describedby')).toMatch(/^ds-modal-\d+-description$/);
    });

    it('is named by label (aria-label) without a title', async () => {
      const { page } = await render('<ds-modal label="Settings"><p>Content</p></ds-modal>');

      expect(dialogOf(page.root).getAttribute('aria-label')).toBe('Settings');
      expect(dialogOf(page.root).hasAttribute('aria-labelledby')).toBe(false);
    });

    it('moves the focus to the first focusable element when shown, and gives it back to the opener when hidden', async () => {
      const { page } = await render('<ds-modal><h2 slot="title">Title</h2><p>Text</p><a href="#a">Link</a><button>OK</button></ds-modal>');
      const getFocused = trackFocus();
      const opener = page.doc.createElement('button');
      page.body.appendChild(opener);
      opener.focus();

      page.root.shown = true;
      await page.waitForChanges();
      expect(getFocused()).toBe(page.root.querySelector('a'));

      keydown(getFocused(), 'Escape');
      await page.waitForChanges();
      expect(page.root.shown).toBe(false);
      expect(getFocused()).toBe(opener);
    });

    it('focuses an autofocus element first, else the dialog itself when it has no focusable element', async () => {
      const { page } = await render('<ds-modal><a href="#a">Link</a><input autofocus /></ds-modal>');
      const getFocused = trackFocus();

      page.root.shown = true;
      await page.waitForChanges();
      expect(getFocused()).toBe(page.root.querySelector('input'));

      const { page: empty } = await render('<ds-modal label="Notice"><p>Nothing to focus</p><button disabled>Off</button></ds-modal>');
      const getEmptyFocused = trackFocus();
      empty.root.shown = true;
      await empty.waitForChanges();
      expect(getEmptyFocused()).toBe(dialogOf(empty.root));
    });

    it('moves the focus into a modal rendered open', async () => {
      const page = await renderPage('<div></div>');
      const getFocused = trackFocus();
      page.body.innerHTML = '<ds-modal shown><button>OK</button></ds-modal>';
      await page.waitForChanges();

      expect(getFocused()).toBe(page.body.querySelector('ds-modal button'));
    });

    it('keeps Tab and Shift+Tab in the dialog', async () => {
      const { page } = await render('<ds-modal><button id="first">First</button><button id="hidden" hidden>Hidden</button><a href="#a" id="last">Last</a></ds-modal>');
      const getFocused = trackFocus();
      page.root.shown = true;
      await page.waitForChanges();
      const first = page.root.querySelector<HTMLElement>('#first');
      const last = page.root.querySelector<HTMLElement>('#last');
      expect(getFocused()).toBe(first);

      // In the middle, the browser moves the focus (the event is not prevented).
      expect(keydown(first, 'Tab').defaultPrevented).toBe(false);

      last.focus();
      expect(keydown(last, 'Tab').defaultPrevented).toBe(true);
      expect(getFocused()).toBe(first);

      expect(keydown(first, 'Tab', { shiftKey: true }).defaultPrevented).toBe(true);
      expect(getFocused()).toBe(last);

      // From the dialog itself (a click on its text), Shift+Tab goes to the last element.
      dialogOf(page.root).focus();
      expect(keydown(dialogOf(page.root), 'Tab', { shiftKey: true }).defaultPrevented).toBe(true);
      expect(getFocused()).toBe(last);
    });

    it('keeps the focus on the dialog on Tab when it has no focusable element', async () => {
      const { page } = await render('<ds-modal label="Notice"><p>Text</p></ds-modal>');
      const getFocused = trackFocus();
      page.root.shown = true;
      await page.waitForChanges();

      expect(keydown(getFocused(), 'Tab').defaultPrevented).toBe(true);
      expect(getFocused()).toBe(dialogOf(page.root));
    });

    it('brings the focus back into the dialog when it moves out', async () => {
      const { page } = await render('<ds-modal><button>OK</button></ds-modal>');
      const getFocused = trackFocus();
      const outside = page.doc.createElement('button');
      page.body.appendChild(outside);
      page.root.shown = true;
      await page.waitForChanges();

      outside.focus();
      expect(getFocused()).toBe(page.root.querySelector('button'));
    });

    it('closes the modal on top only on Escape, and the event goes no further', async () => {
      const page = await renderPage('<div id="page"><ds-modal id="a"><button id="in-a">A</button></ds-modal></div><ds-modal id="b"><button id="in-b">B</button></ds-modal>');
      const getFocused = trackFocus();
      const [a, b] = Array.from(page.body.querySelectorAll('ds-modal'));
      const outer = vi.fn();
      page.body.querySelector('#page').addEventListener('keydown', outer);

      a.shown = true;
      await page.waitForChanges();
      b.shown = true;
      await page.waitForChanges();
      expect(getFocused().id).toBe('in-b');

      // A key held down (repeat) does not close the next modal.
      keydown(getFocused(), 'Escape');
      keydown(getFocused(), 'Escape', { repeat: true });
      await page.waitForChanges();
      expect([a.shown, b.shown]).toEqual([true, false]);
      expect(getFocused().id).toBe('in-a');

      keydown(getFocused(), 'Escape');
      await page.waitForChanges();
      expect(a.shown).toBe(false);
      expect(outer).not.toHaveBeenCalled();
    });

    it('does not move the focus from the backdrop on a mouse down', async () => {
      const { page } = await render();
      page.root.shown = true;
      await page.waitForChanges();

      const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      page.root.querySelector('.ds-lightbox__container').dispatchEvent(mousedown);
      await page.waitForChanges();

      expect(mousedown.defaultPrevented).toBe(true);
      expect(page.root.shown).toBe(false);
    });

    // The modal reaches its states with the reflected shown attribute: it waits for no transition (none comes with less
    // motion, or durations of 0).
    it('shows and hides without waiting for a transition', async () => {
      const { page, onOpen, onClose } = await render('<ds-modal><button>OK</button></ds-modal>');
      const getFocused = trackFocus();

      page.root.shown = true;
      await page.waitForChanges();
      expect(page.root).toHaveAttribute('shown');
      expect(getFocused()).toBe(page.root.querySelector('button'));
      expect(onOpen).toHaveBeenCalledTimes(1);

      page.root.shown = false;
      await page.waitForChanges();
      expect(page.root).not.toHaveAttribute('shown');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
