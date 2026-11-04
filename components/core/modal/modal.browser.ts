import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, mount, recordEvents, textOfIds } from '../../../test/helpers/browser';

type Modal = HTMLDsModalElement & HTMLElement;

describe('ds-modal in a browser', () => {
  const render = async (
    content = '<h2 slot="title">Delete the file?</h2><p slot="description">It cannot be undone.</p><a href="#help">Help</a><button id="cancel">Cancel</button><button id="ok">OK</button>',
  ) => {
    await mount(`<button id="opener">Delete</button><ds-modal>${content}</ds-modal><button id="outside">Outside</button>`);
    const modal = document.querySelector<Modal>('ds-modal');
    const opener = document.querySelector<HTMLElement>('#opener');
    opener.addEventListener('click', () => (modal.shown = true));
    const dialog = () => modal.querySelector<HTMLElement>('[role="dialog"]');
    return { modal, opener, dialog };
  };

  it('a click on its opener shows it: the focus moves to its first focusable element; the dialog is named and described', async () => {
    const { modal, opener, dialog } = await render();

    await userEvent.click(opener);

    await expect.poll(focused).toBe(modal.querySelector('a'));
    expect(dialog().getAttribute('aria-modal')).toBe('true');
    expect(textOfIds(dialog().getAttribute('aria-labelledby'))).toBe('Delete the file?');
    expect(textOfIds(dialog().getAttribute('aria-describedby'))).toBe('It cannot be undone.');
  });

  it('Tab and Shift+Tab stay in the dialog (focus trap)', async () => {
    const { modal, opener } = await render();
    await userEvent.click(opener);
    await expect.poll(focused).toBe(modal.querySelector('a'));

    await userEvent.tab();
    expect(focused()).toBe(modal.querySelector('#cancel'));
    await userEvent.tab();
    expect(focused()).toBe(modal.querySelector('#ok'));
    await userEvent.tab();
    expect(focused()).toBe(modal.querySelector('a'));
    await userEvent.tab({ shift: true });
    expect(focused()).toBe(modal.querySelector('#ok'));
  });

  it('Escape hides it, gives the focus back to the opener, and the key press goes no further', async () => {
    const { modal, opener } = await render();
    const events = recordEvents(modal, ['modalOpen', 'modalClose']);
    const keys = recordEvents(document.body, ['keydown'], event => (event as KeyboardEvent).key);
    await userEvent.click(opener);
    await expect.poll(focused).toBe(modal.querySelector('a'));

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => modal.shown).toBe(false);
    expect(focused()).toBe(opener);
    expect(events).toEqual(['modalOpen', 'modalClose']);
    expect(keys).toEqual([]);
  });

  it('a modal without focusable element gives the focus to its dialog, and Tab keeps it there', async () => {
    const { modal, opener, dialog } = await render('<h2 slot="title">Saved</h2><p>Your file is saved.</p>');
    await userEvent.click(opener);
    await expect.poll(focused).toBe(dialog());

    await userEvent.tab();

    expect(focused()).toBe(dialog());
    expect(modal.shown).toBe(true);
  });

  it('Escape hides the modal on top only, and the focus goes back to the one below', async () => {
    const { modal, opener } = await render(
      '<h2 slot="title">First</h2><button id="next">Next</button><ds-modal id="second"><h2 slot="title">Second</h2><button id="close">Close</button></ds-modal>',
    );
    const second = modal.querySelector<Modal>('#second');
    modal.querySelector('#next').addEventListener('click', () => (second.shown = true));
    await userEvent.click(opener);
    await expect.poll(focused).toBe(modal.querySelector('#next'));
    await userEvent.keyboard('{Enter}');
    await expect.poll(focused).toBe(second.querySelector('#close'));

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => [modal.shown, second.shown]).toEqual([true, false]);
    expect(focused()).toBe(modal.querySelector('#next'));
  });
});
