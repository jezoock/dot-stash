import { readFileSync } from 'fs';
import { join } from 'path';
import { newSpecPage } from '@stencil/core/testing';
import { DSPanel } from './panel';

describe('ds-panel', () => {
  const render = async (type: 'tab' | 'collapsible') => {
    const page = await newSpecPage({ components: [DSPanel], html: `<ds-panel type="${type}" index="0"><span slot="title">Title</span><p>Content</p></ds-panel>` });
    const events: string[] = [];
    ['panelShow', 'panelShown', 'panelHide', 'panelHidden'].forEach(name => page.root.addEventListener(name, () => events.push(name)));
    return { page, events };
  };

  // The panel reaches its state with the reflected expanded attribute, which the transitions of its stylesheet follow:
  // it waits for no transitionend event (none comes with durations of 0, or with less motion).
  it.each(['tab', 'collapsible'] as const)('a %s panel expands and collapses without waiting for a transition', async type => {
    const { page, events } = await render(type);

    await page.root.show();
    await page.waitForChanges();
    expect(page.root).toHaveAttribute('expanded');

    await page.root.hide();
    await page.waitForChanges();
    expect(page.root).not.toHaveAttribute('expanded');
    expect(events).toEqual(['panelShow', 'panelHide']);
  });

  it('a click on the title toggles a collapsible panel, and expands a tab', async () => {
    const { page } = await render('collapsible');
    const title = page.root.querySelector<HTMLElement>('.ds-panel__title');

    title.click();
    await page.waitForChanges();
    expect(page.root.expanded).toBe(true);
    title.click();
    await page.waitForChanges();
    expect(page.root.expanded).toBe(false);

    await page.root.setType('tab');
    title.click();
    title.click();
    await page.waitForChanges();
    expect(page.root.expanded).toBe(true);
  });

  it('transitions on the expanded attribute, with a duration that can be 0', () => {
    const stylesheet = readFileSync(join(__dirname, 'panel.scss'), 'utf8');

    expect(stylesheet).toContain('transition: opacity var(--ds-panel-transition-duration, 0.4s) ease;');
    expect(stylesheet).toContain('transition: grid-template-rows var(--ds-panel-transition-duration, 0.4s) ease;');
    expect(stylesheet).toContain('&[expanded]');
    expect(readFileSync(join(__dirname, 'panel.tsx'), 'utf8')).not.toMatch(/transitionend|animationend/);
  });
});
