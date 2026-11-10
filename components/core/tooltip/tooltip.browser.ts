import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, mount, textOfIds } from '../../../test/helpers/browser';
import { TOOLTIP_HIDE_DELAY } from './tooltip.constants';

describe('ds-tooltip in a browser', () => {
  const render = async () => {
    await mount('<button id="before">Before</button> <ds-tooltip><button id="help">Help</button><span slot="message">Opens the help center</span></ds-tooltip>');
    const box = document.querySelector<HTMLElement>('.ds-tooltip');
    const help = document.querySelector<HTMLElement>('#help');
    const message = document.querySelector<HTMLElement>('[slot="message"]');
    const isShown = () => box.classList.contains('--is-shown') && getComputedStyle(message).visibility === 'visible';
    return { box, help, message, isShown };
  };

  it('the keyboard focus shows the message, which describes the focused button; Tab away hides it', async () => {
    const { help, message, isShown } = await render();
    document.querySelector<HTMLElement>('#before').focus();

    await userEvent.tab();
    expect(focused()).toBe(help);
    await expect.poll(isShown).toBe(true);
    expect(message.getAttribute('role')).toBe('tooltip');
    expect(textOfIds(help.getAttribute('aria-describedby'))).toBe('Opens the help center');

    await userEvent.tab({ shift: true });
    await expect.poll(isShown).toBe(false);
  });

  it('Escape hides the message without moving the focus, and the key press goes no further; Escape again goes on', async () => {
    const { help, isShown } = await render();
    const keys: string[] = [];
    document.addEventListener('keydown', event => keys.push(event.key));
    help.focus();
    await expect.poll(isShown).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expect.poll(isShown).toBe(false);
    expect(focused()).toBe(help);
    expect(keys).toEqual([]);

    await userEvent.keyboard('{Escape}');
    expect(keys).toEqual(['Escape']);
  });

  it(`the pointer over the content shows the message; it hides ${TOOLTIP_HIDE_DELAY} ms after the pointer leaves`, async () => {
    const { help, isShown } = await render();

    await userEvent.hover(help);
    await expect.poll(isShown).toBe(true);

    const left = performance.now();
    await userEvent.unhover(help);
    expect(isShown()).toBe(true);
    await expect.poll(isShown, { timeout: TOOLTIP_HIDE_DELAY + 1000 }).toBe(false);
    expect(performance.now() - left).toBeGreaterThanOrEqual(TOOLTIP_HIDE_DELAY - 20);
  });
});
