import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import '../panel/panel';
import './panel-group';
import { keydown, renderPage, trackFocus } from '../../../test/helpers';

const panel = (title: string, attributes = '', content = `<p>${title} content</p>`) => `<ds-panel ${attributes}><span slot="title">${title}</span>${content}</ds-panel>`;

describe('ds-panel-group', () => {
  afterEach(() => vi.restoreAllMocks());

  const render = async (html: string) => {
    const page = await renderPage(html);
    await page.waitForChanges();
    const group = page.body.querySelector('ds-panel-group');
    const panels = Array.from(group.children).filter((child): child is HTMLDsPanelElement => child.tagName === 'DS-PANEL');
    const tabs = panels.map(item => item.querySelector<HTMLElement>('.ds-panel__control'));
    const tabpanels = panels.map(item => item.querySelector<HTMLElement>('.ds-panel__content'));
    const selected = () => panels.map(item => item.expanded);
    return { page, panels, tabs, tabpanels, selected };
  };

  describe('tab', () => {
    const tabGroup = (attributes = 'label="Sections"', expanded = '') =>
      `<ds-panel-group type="tab" ${attributes}>${panel('One')}${panel('Two', expanded)}${panel('Three', '', '<a href="/three">Three</a>')}</ds-panel-group>`;

    it('renders a tab list, named by label, that owns the tabs of its panels', async () => {
      const { page, tabs } = await render(tabGroup());
      const tabList = page.root.querySelector('.ds-panel-group__tablist');

      expect(tabList).toEqualAttributes({ 'role': 'tablist', 'aria-label': 'Sections' });
      expect(tabList.getAttribute('aria-owns')).toBe(tabs.map(tab => tab.id).join(' '));
      expect(tabs.map(tab => tab.getAttribute('role'))).toEqual(['tab', 'tab', 'tab']);
      expect(new Set(tabs.map(tab => tab.id)).size).toBe(3);
    });

    it('names the tab list by labelledby, rather than label', async () => {
      const { page } = await render(tabGroup('label="Sections" labelledby="title"'));
      const tabList = page.root.querySelector('.ds-panel-group__tablist');

      expect(tabList).toEqualAttribute('aria-labelledby', 'title');
      expect(tabList).not.toHaveAttribute('aria-label');
    });

    it('selects the first tab when none is expanded: one tab in the Tab order, the other panels inert', async () => {
      const { tabs, tabpanels, selected } = await render(tabGroup());

      expect(selected()).toEqual([true, false, false]);
      expect(tabs.map(tab => [tab.getAttribute('aria-selected'), tab.getAttribute('tabindex')])).toEqual([
        ['true', '0'],
        ['false', '-1'],
        ['false', '-1'],
      ]);
      expect(tabpanels.map(tabpanel => tabpanel.hasAttribute('inert'))).toEqual([false, true, true]);
      tabpanels.forEach((tabpanel, index) => {
        expect(tabpanel).toEqualAttributes({ 'role': 'tabpanel', 'aria-labelledby': tabs[index].id });
        expect(tabs[index]).toEqualAttribute('aria-controls', tabpanel.id);
      });
    });

    it('keeps the expanded tab selected', async () => {
      const { selected } = await render(tabGroup(undefined, 'expanded'));

      expect(selected()).toEqual([false, true, false]);
    });

    it('a click on a tab selects it and deselects the previous one', async () => {
      const { page, tabs, selected } = await render(tabGroup());

      tabs[2].click();
      await page.waitForChanges();

      expect(selected()).toEqual([false, false, true]);
      expect(tabs.map(tab => tab.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
    });

    it.each([
      ['ArrowRight', 0, 1],
      ['ArrowRight', 2, 0],
      ['ArrowLeft', 1, 0],
      ['ArrowLeft', 0, 2],
      ['Home', 2, 0],
      ['End', 0, 2],
    ])('%s on tab %i moves the focus to tab %i and selects it', async (key, from, to) => {
      const { page, tabs, selected } = await render(tabGroup());
      const getFocused = trackFocus();

      tabs[from].click();
      await page.waitForChanges();
      const event = keydown(tabs[from], key);
      await page.waitForChanges();

      expect(event.defaultPrevented).toBe(true);
      expect(getFocused()).toBe(tabs[to]);
      expect(selected()).toEqual([0, 1, 2].map(index => index === to));
    });

    it('reverses Left and Right Arrow from right to left', async () => {
      const { page, tabs, selected } = await render(`<div dir="rtl">${tabGroup()}</div>`);

      keydown(tabs[0], 'ArrowLeft');
      await page.waitForChanges();
      expect(selected()).toEqual([false, true, false]);

      keydown(tabs[1], 'ArrowRight');
      await page.waitForChanges();
      expect(selected()).toEqual([true, false, false]);
    });

    it('leaves the other keys, the keys with a modifier and the keys of the content to the browser', async () => {
      const { page, tabs, tabpanels, selected } = await render(tabGroup());

      expect(keydown(tabs[0], 'ArrowDown').defaultPrevented).toBe(false);
      expect(keydown(tabs[0], 'ArrowRight', { altKey: true }).defaultPrevented).toBe(false);
      expect(keydown(tabpanels[0], 'ArrowRight').defaultPrevented).toBe(false);
      await page.waitForChanges();

      expect(selected()).toEqual([true, false, false]);
    });

    it('Enter and Space select a focused tab', async () => {
      const { page, tabs, selected } = await render(tabGroup());

      keydown(tabs[1], 'Enter');
      await page.waitForChanges();
      expect(selected()).toEqual([false, true, false]);

      keydown(tabs[2], ' ');
      tabs[2].dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
      await page.waitForChanges();
      expect(selected()).toEqual([false, false, true]);
    });

    it('showPanel() selects a tab', async () => {
      const { page, selected } = await render(tabGroup());

      await page.root.showPanel(1);
      await page.waitForChanges();

      expect(selected()).toEqual([false, true, false]);
    });

    it('becomes collapsible panels without a tab list when its type changes', async () => {
      const { page, tabs } = await render(tabGroup());

      page.root.type = 'collapsible';
      await page.waitForChanges();
      await page.waitForChanges();

      expect(page.root.querySelector('.ds-panel-group__tablist')).toBeNull();
      expect(tabs.map(tab => tab.getAttribute('role'))).toEqual(['button', 'button', 'button']);
    });

    it('a group that is not active renders no tab list and shows its panels, which have no role', async () => {
      const { page, tabs, selected } = await render(tabGroup('active="false"'));

      expect(page.root.querySelector('.ds-panel-group__tablist')).toBeNull();
      expect(selected()).toEqual([true, true, true]);
      expect(tabs.map(tab => tab.hasAttribute('role'))).toEqual([false, false, false]);
    });
  });

  describe('nested panels', () => {
    const nested = `<ds-panel-group type="tab" label="Outer">
        ${panel('One', '', `<ds-panel-group type="tab" label="Inner">${panel('Inner one')}${panel('Inner two')}</ds-panel-group>`)}
        ${panel('Two', '', panel('Nested', 'type="collapsible"'))}
      </ds-panel-group>`;

    it('a group only has its own panels: not those of a nested group or panel', async () => {
      const { page } = await render(nested);
      const [outer, inner] = Array.from(page.body.querySelectorAll('ds-panel-group'));

      expect((await outer.getItems()).map(item => item.querySelector('[slot="title"]').textContent)).toEqual(['One', 'Two']);
      expect((await inner.getItems()).map(item => item.querySelector('[slot="title"]').textContent)).toEqual(['Inner one', 'Inner two']);
      expect(page.body.querySelector<HTMLDsPanelElement>('ds-panel[type="collapsible"]').index).toBeUndefined();
    });

    it('the panels of a nested group do not change the selection of the outer group', async () => {
      const { page, selected } = await render(nested);
      const innerTabs = Array.from(page.body.querySelectorAll<HTMLElement>('ds-panel-group ds-panel-group .ds-panel__control'));

      innerTabs[1].click();
      await page.waitForChanges();

      expect(selected()).toEqual([true, false]);
      expect(Array.from(page.body.querySelectorAll<HTMLDsPanelElement>('ds-panel-group ds-panel-group ds-panel')).map(item => item.expanded)).toEqual([false, true]);
    });
  });

  describe('collapsible', () => {
    const accordion = (attributes = '') => `<ds-panel-group type="collapsible" ${attributes}>${panel('One')}${panel('Two', 'expanded')}${panel('Three')}</ds-panel-group>`;

    it('renders no tab list: each panel has a button', async () => {
      const { page, tabs, selected } = await render(accordion());

      expect(page.root.querySelector('[role="tablist"]')).toBeNull();
      expect(tabs.map(tab => tab.getAttribute('aria-expanded'))).toEqual(['false', 'true', 'false']);
      expect(selected()).toEqual([false, true, false]);

      tabs[0].click();
      await page.waitForChanges();
      expect(selected()).toEqual([true, true, false]);
    });

    it('solo-content: expanding a panel collapses the expanded one', async () => {
      const { page, tabs, selected } = await render(accordion('solo-content'));

      tabs[0].click();
      await page.waitForChanges();
      expect(selected()).toEqual([true, false, false]);

      tabs[2].click();
      await page.waitForChanges();
      expect(selected()).toEqual([false, false, true]);
    });
  });

  it('clips its row only while a tab fades in or out', () => {
    const stylesheet = readFileSync(join(__dirname, 'panel-group.scss'), 'utf8');

    expect(stylesheet).toMatch(/&:has\(> \.ds-panel\.--transition\) \{\s*overflow: hidden;\s*\}/);
    expect(stylesheet.match(/overflow: hidden/g)).toHaveLength(1);
  });
});
