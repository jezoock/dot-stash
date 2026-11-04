import { afterEach, describe, expect, it, vi } from 'vitest';
import './toaster';
import { TOASTER_HORIZONTAL_POSITION, TOASTER_VERTICAL_POSITION } from './toaster-positions.enum';
import { TRANSITION_END_MARGIN } from '../../utils/transition';
import { mockTransition, renderPage, wait } from '../../../test/helpers';

describe('ds-toaster', () => {
  afterEach(() => vi.restoreAllMocks());

  const render = async (html: string) => {
    const page = await renderPage(html);
    const toaster = page.root.querySelector<HTMLDivElement>('.ds-toaster');
    return { page, toaster };
  };

  it('has distinct vertical positions', () => {
    expect(Object.values(TOASTER_VERTICAL_POSITION)).toEqual(['top', 'middle', 'bottom']);
    expect(Object.values(TOASTER_HORIZONTAL_POSITION)).toEqual(['left', 'center', 'right']);
  });

  it('renders the modifiers, and the ds-toaster class list when they change', async () => {
    const { page, toaster } = await render('<ds-toaster mods="dark"></ds-toaster>');

    expect(toaster).toHaveClasses(['ds-toaster', '--dark']);

    page.root.mods = 'light,wide';
    await page.waitForChanges();

    expect(toaster).toHaveClasses(['ds-toaster', '--light', '--wide']);
    expect(toaster).not.toHaveClass('--dark');
    expect(toaster).not.toHaveClass('ds-title');
  });

  it('renders each message as a toast', async () => {
    const { toaster } = await render('<ds-toaster messages="Saved,Sent"></ds-toaster>');
    const toasts = toaster.querySelectorAll('.ds-toaster__container > .ds-toaster__toast');

    expect(toasts).toHaveLength(2);
    expect(toasts[0].querySelector('.ds-toaster__content > .ds-toaster__message').textContent).toBe('Saved');
    expect(toasts[1].textContent).toBe('Sent');
    expect(toaster.querySelector('ds-toast')).toBeNull();
  });

  it('displays the last max-displayed-toast messages (3 by default), dropping the oldest first; 0 displays them all', async () => {
    const { page, toaster } = await render('<ds-toaster messages="1,2,3,4,5"></ds-toaster>');
    const displayed = () => Array.from(toaster.querySelectorAll('.ds-toaster__message')).map(message => message.textContent);

    expect(displayed()).toEqual(['3', '4', '5']);

    page.root.messages = [...(page.root.messages as string).split(','), '6'];
    await page.waitForChanges();
    expect(displayed()).toEqual(['4', '5', '6']);

    page.root.maxDisplayedToast = 1;
    await page.waitForChanges();
    expect(displayed()).toEqual(['6']);

    page.root.maxDisplayedToast = 0;
    await page.waitForChanges();
    expect(displayed()).toEqual(['1', '2', '3', '4', '5', '6']);

    const { toaster: two } = await render('<ds-toaster messages="a,b,c" max-displayed-toast="2"></ds-toaster>');
    expect(Array.from(two.querySelectorAll('.ds-toaster__message')).map(message => message.textContent)).toEqual(['b', 'c']);
  });

  it('renders without messages', async () => {
    const { toaster } = await render('<ds-toaster></ds-toaster>');

    expect(toaster.querySelectorAll('.ds-toaster__toast')).toHaveLength(0);
  });

  it.each([
    ['', ['--v-pos-top', '--h-pos-left']],
    [' position="bottom, right"', ['--v-pos-bottom', '--h-pos-right']],
    [' position="middle,center"', ['--v-pos-middle', '--h-pos-center']],
  ])('<ds-toaster%s> has the %j position classes', async (attribute, classes) => {
    const { toaster } = await render(`<ds-toaster${attribute}></ds-toaster>`);

    expect(toaster).toHaveClasses(classes);
  });

  it('takes the position as a [vertical, horizontal] array', async () => {
    const { page, toaster } = await render('<ds-toaster></ds-toaster>');

    page.root.position = [TOASTER_VERTICAL_POSITION.BOTTOM, TOASTER_HORIZONTAL_POSITION.CENTER];
    await page.waitForChanges();

    expect(toaster).toHaveClasses(['--v-pos-bottom', '--h-pos-center']);
  });

  it('shows and hides, emitting toasterShown and toasterHidden at the end of the transition', async () => {
    const { page, toaster } = await render('<ds-toaster messages="Saved"></ds-toaster>');
    const events: string[] = [];
    ['toasterShow', 'toasterShown', 'toasterHide', 'toasterHidden'].forEach(name => page.root.addEventListener(name, () => events.push(name)));

    expect(toaster).toHaveClass('--hidden');

    await page.root.show();
    await page.waitForChanges();
    expect(toaster).toHaveClass('--shown');
    toaster.dispatchEvent(new Event('transitionend'));

    await page.root.hide();
    await page.waitForChanges();
    expect(toaster).toHaveClass('--hidden');
    toaster.dispatchEvent(new Event('transitionend'));
    toaster.dispatchEvent(new Event('transitionend'));

    expect(events).toEqual(['toasterShow', 'toasterShown', 'toasterHide', 'toasterHidden']);
  });

  it('emits toasterShown and toasterHidden at once when it does not fade (durations of 0, less motion)', async () => {
    const { page } = await render('<ds-toaster messages="Saved"></ds-toaster>');
    const events: string[] = [];
    ['toasterShow', 'toasterShown', 'toasterHide', 'toasterHidden'].forEach(name => page.root.addEventListener(name, () => events.push(name)));
    mockTransition('0s, 0s');

    await page.root.show();
    await page.waitForChanges();
    await page.root.hide();
    await page.waitForChanges();

    expect(events).toEqual(['toasterShow', 'toasterShown', 'toasterHide', 'toasterHidden']);
  });

  it('emits toasterHidden when the fade is over, without its transitionend event', async () => {
    const { page, toaster } = await render('<ds-toaster messages="Saved"></ds-toaster>');
    const events: string[] = [];
    ['toasterShown', 'toasterHidden'].forEach(name => page.root.addEventListener(name, () => events.push(name)));
    mockTransition('0.02s, 0.02s');

    await page.root.show();
    await page.waitForChanges();
    toaster.dispatchEvent(new Event('transitionend'));
    await page.root.hide();
    await page.waitForChanges();
    expect(events).toEqual(['toasterShown']);

    await wait(20 + TRANSITION_END_MARGIN + 10);
    expect(events).toEqual(['toasterShown', 'toasterHidden']);
  });

  describe('live region', () => {
    const liveOf = (toaster: HTMLElement) => toaster.querySelector<HTMLElement>('.ds-toaster__live');
    const announced = (toaster: HTMLElement) => Array.from(liveOf(toaster).children).map(child => child.textContent);

    it('is rendered from the start, empty, as a polite status; the toasts are hidden from screen readers', async () => {
      const { toaster } = await render('<ds-toaster messages="Saved"></ds-toaster>');

      expect(liveOf(toaster)).toEqualAttributes({ 'role': 'status', 'aria-live': 'polite', 'aria-atomic': 'false' });
      expect(announced(toaster)).toEqual([]);
      expect(toaster.querySelector('.ds-toaster__container')).toEqualAttributes({ 'aria-hidden': 'true' });
    });

    it('gets the displayed messages when shown, in the same element, and is emptied when hidden', async () => {
      const { page, toaster } = await render('<ds-toaster messages="1,2,3,4"></ds-toaster>');
      const live = liveOf(toaster);

      await page.root.show();
      await page.waitForChanges();
      expect(liveOf(toaster)).toBe(live);
      expect(announced(toaster)).toEqual(['2', '3', '4']);

      await page.root.hide();
      await page.waitForChanges();
      expect(announced(toaster)).toEqual([]);

      await page.root.displayToast();
      await page.waitForChanges();
      expect(announced(toaster)).toEqual(['2', '3', '4']);
    });

    it('adds a message that comes while shown, keeping the elements of the other ones', async () => {
      const { page, toaster } = await render('<ds-toaster messages="Saved,Sent"></ds-toaster>');

      await page.root.show();
      await page.waitForChanges();
      const [saved, sent] = Array.from(liveOf(toaster).children);

      page.root.messages = ['Saved', 'Sent', 'Archived'];
      await page.waitForChanges();
      const children = Array.from(liveOf(toaster).children);
      expect(children.map(child => child.textContent)).toEqual(['Saved', 'Sent', 'Archived']);
      expect(children[0]).toBe(saved);
      expect(children[1]).toBe(sent);
    });

    it('is an assertive alert with the error modifier', async () => {
      const { page, toaster } = await render('<ds-toaster mods="error" messages="Payment refused"></ds-toaster>');

      expect(liveOf(toaster)).toEqualAttributes({ 'role': 'alert', 'aria-live': 'assertive' });

      page.root.mods = ['success'];
      await page.waitForChanges();
      expect(liveOf(toaster)).toEqualAttributes({ 'role': 'status', 'aria-live': 'polite' });
    });

    it('does not take the focus', async () => {
      const { page } = await render('<ds-toaster messages="Saved" closing-delay="0"></ds-toaster>');
      let owner = Object.getPrototypeOf(page.body);
      while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);
      const focus = vi.spyOn(owner, 'focus');

      await page.root.displayToast();
      await page.waitForChanges();

      expect(focus).not.toHaveBeenCalled();
    });
  });

  it('hides when clicked', async () => {
    const { page, toaster } = await render('<ds-toaster messages="Saved"></ds-toaster>');

    await page.root.show();
    await page.waitForChanges();
    toaster.querySelector<HTMLElement>('.ds-toaster__toast').click();
    await page.waitForChanges();

    expect(toaster).toHaveClass('--hidden');
  });

  it('hides closing-delay ms after the last displayToast()', async () => {
    const { page, toaster } = await render('<ds-toaster messages="Saved" closing-delay="60"></ds-toaster>');

    await page.root.displayToast();
    await wait(40);
    await page.root.displayToast();
    await wait(40);
    await page.waitForChanges();
    expect(toaster).toHaveClass('--shown');

    await wait(40);
    await page.waitForChanges();
    expect(toaster).toHaveClass('--hidden');
  });
});
