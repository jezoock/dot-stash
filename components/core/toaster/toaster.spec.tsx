import { newSpecPage } from '@stencil/core/testing';
import { DSToaster } from './toaster';
import { TOASTER_HORIZONTAL_POSITION, TOASTER_VERTICAL_POSITION } from './toaster-positions.enum';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('ds-toaster', () => {
  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSToaster], html });
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

  it('renders without messages', async () => {
    const { toaster } = await render('<ds-toaster></ds-toaster>');

    expect(toaster.querySelectorAll('.ds-toaster__toast')).toHaveLength(0);
  });

  it.each([
    ['', ['--v-pos-top', '--h-pos-left']],
    [' position="bottom, right"', ['--v-pos-bottom', '--h-pos-right']],
    [' position="middle,center"', ['--v-pos-middle', '--h-pos-center']],
  ])('<ds-toaster%s> has the %p position classes', async (attribute, classes) => {
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
