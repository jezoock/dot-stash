import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, nextEvent, recordEvents, setReducedMotion } from '../../../test/helpers/browser';

type Panel = HTMLDsPanelElement & HTMLElement;

const EVENTS = ['panelShow', 'panelShown', 'panelHide', 'panelHidden'];

describe('ds-panel in a browser: its transitions (the default theme, 0.4s)', () => {
  const render = async (html: string) => {
    await mount(html);
    const panels = Array.from(document.querySelectorAll<Panel>('ds-panel'));
    const control = (index: number) => panels[index].querySelector<HTMLElement>('.ds-panel__control');
    const content = (index: number) => panels[index].querySelector<HTMLElement>('.ds-panel__content');
    const events = recordEvents(document, EVENTS, event => `${(event.target as HTMLElement).id} ${event.type}`);
    return { panels, control, content, events };
  };

  const COLLAPSIBLE = '<ds-panel id="a" type="collapsible"><span slot="title">Shipping</span><p>Free from 50 €.</p></ds-panel>';

  it('a collapsible panel emits panelShow at once and panelShown at the end of its transition, then panelHide and panelHidden', async () => {
    const { panels, control, content, events } = await render(COLLAPSIBLE);

    const shown = nextEvent(panels[0], 'panelShown');
    const transitionEnd = nextEvent<TransitionEvent>(content(0), 'transitionend');
    const start = performance.now();
    await userEvent.click(control(0));
    expect(events).toEqual(['a panelShow']);
    await transitionEnd;
    await shown;
    expect(performance.now() - start).toBeGreaterThanOrEqual(300);
    expect(events).toEqual(['a panelShow', 'a panelShown']);
    expect(content(0).inert).toBe(false);

    const hidden = nextEvent(panels[0], 'panelHidden');
    await userEvent.click(control(0));
    await hidden;
    expect(events).toEqual(['a panelShow', 'a panelShown', 'a panelHide', 'a panelHidden']);
    expect(content(0).inert).toBe(true);
  });

  it('with less motion, the transition ends at once (0.01ms) and the events still come', async () => {
    await setReducedMotion(true);
    const { panels, control, events } = await render(COLLAPSIBLE);

    const shown = nextEvent(panels[0], 'panelShown');
    const start = performance.now();
    await userEvent.click(control(0));
    await shown;

    expect(performance.now() - start).toBeLessThan(300);
    expect(events).toEqual(['a panelShow', 'a panelShown']);
  });

  it('selecting a tab: the former panel is hidden and the new one shown, each with its events', async () => {
    const { panels, control, events } = await render(
      '<ds-panel-group label="Product"><ds-panel id="one"><span slot="title">One</span><p>One</p></ds-panel><ds-panel id="two"><span slot="title">Two</span><p>Two</p></ds-panel></ds-panel-group>',
    );
    await expect.poll(() => panels[0].expanded).toBe(true);
    events.length = 0;

    const shown = nextEvent(panels[1], 'panelShown');
    const hidden = nextEvent(panels[0], 'panelHidden');
    await userEvent.click(control(1));
    await Promise.all([shown, hidden]);

    expect(events.filter(event => event.startsWith('one'))).toEqual(['one panelHide', 'one panelHidden']);
    expect(events.filter(event => event.startsWith('two'))).toEqual(['two panelShow', 'two panelShown']);
  });
});
