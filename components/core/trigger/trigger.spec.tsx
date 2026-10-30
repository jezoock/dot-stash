import { newSpecPage } from '@stencil/core/testing';
import { DSTrigger } from './trigger';

describe('ds-trigger', () => {
  const render = async (triggerAttributes: string) => {
    const page = await newSpecPage({ components: [DSTrigger], html: `<div id="slider"></div><ds-trigger ${triggerAttributes}>Go</ds-trigger>` });
    const target = page.body.querySelector('#slider') as HTMLElement & Record<string, jest.Mock>;
    target.next = jest.fn();
    target.goTo = jest.fn();
    const trigger = page.body.querySelector('ds-trigger');
    return { page, target, trigger };
  };

  it('calls the target action on click by default', async () => {
    const { target, trigger } = await render('target="#slider" action="next"');

    trigger.click();

    expect(target.next).toHaveBeenCalledTimes(1);
    expect(target.next).toHaveBeenCalledWith();
  });

  it('passes the JSON arguments of the action', async () => {
    const { target, trigger } = await render(`target="#slider" action='goTo:[2, "smooth"]'`);

    trigger.click();

    expect(target.goTo).toHaveBeenCalledWith(2, 'smooth');
  });

  it('listens to the event named by on', async () => {
    const { target, trigger } = await render('target="#slider" action="next" on="mouseenter"');

    trigger.click();
    expect(target.next).not.toHaveBeenCalled();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    expect(target.next).toHaveBeenCalledTimes(1);
  });

  it('does nothing while disabled', async () => {
    const { page, target, trigger } = await render('target="#slider" action="next" disabled');

    trigger.click();
    expect(target.next).not.toHaveBeenCalled();

    trigger.disabled = false;
    await page.waitForChanges();
    trigger.click();
    expect(target.next).toHaveBeenCalledTimes(1);
  });

  it('stops listening once removed', async () => {
    const { page, target, trigger } = await render('target="#slider" action="next"');

    trigger.remove();
    await page.waitForChanges();
    trigger.click();

    expect(target.next).not.toHaveBeenCalled();
  });
});
