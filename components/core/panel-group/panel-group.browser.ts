import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, mount } from '../../../test/helpers/browser';

type Panel = HTMLDsPanelElement & HTMLElement;

const panel = (title: string, attributes = '', content = `<p>${title} content <a href="#${title}">${title} link</a></p>`) =>
  `<ds-panel ${attributes}><span slot="title">${title}</span>${content}</ds-panel>`;

describe('ds-panel-group in a browser', () => {
  const render = async (html: string) => {
    await mount(`<button id="before">Before</button>${html}<button id="after">After</button>`);
    const panels = Array.from(document.querySelectorAll<Panel>('ds-panel'));
    const controls = panels.map(item => item.querySelector<HTMLElement>('.ds-panel__control'));
    const contents = panels.map(item => item.querySelector<HTMLElement>('.ds-panel__content'));
    const expanded = () => panels.map(item => item.expanded);
    return { panels, controls, contents, expanded };
  };

  describe('tabs', () => {
    const TABS = `<ds-panel-group label="Product">${panel('One')}${panel('Two')}${panel('Three')}</ds-panel-group>`;

    it('Tab reaches the selected tab only, then its panel content; the other panels are inert', async () => {
      const { controls, contents } = await render(TABS);
      document.querySelector<HTMLElement>('#before').focus();

      await userEvent.tab();
      expect(focused()).toBe(controls[0]);
      expect(controls.map(control => control.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);

      await userEvent.tab();
      expect(focused()).toBe(contents[0].querySelector('a'));
      await userEvent.tab();
      expect(focused()).toBe(document.querySelector('#after'));
      expect([contents[1].inert, contents[2].inert]).toEqual([true, true]);
    });

    it('Right and Left Arrow move the focus and the selection, round the tabs; Home and End too', async () => {
      const { controls, expanded } = await render(TABS);
      controls[0].focus();

      await userEvent.keyboard('{ArrowRight}');
      expect([focused(), expanded()]).toEqual([controls[1], [false, true, false]]);
      await userEvent.keyboard('{ArrowRight}{ArrowRight}');
      expect([focused(), expanded()]).toEqual([controls[0], [true, false, false]]);
      await userEvent.keyboard('{ArrowLeft}');
      expect([focused(), expanded()]).toEqual([controls[2], [false, false, true]]);
      await userEvent.keyboard('{Home}');
      expect([focused(), expanded()]).toEqual([controls[0], [true, false, false]]);
      await userEvent.keyboard('{End}');
      expect([focused(), expanded()]).toEqual([controls[2], [false, false, true]]);
    });

    it('from right to left, Left Arrow moves to the next tab and Right Arrow to the previous one', async () => {
      const { controls, expanded } = await render(`<div dir="rtl">${TABS}</div>`);
      controls[0].focus();

      await userEvent.keyboard('{ArrowLeft}');
      expect([focused(), expanded()]).toEqual([controls[1], [false, true, false]]);
      await userEvent.keyboard('{ArrowRight}');
      expect([focused(), expanded()]).toEqual([controls[0], [true, false, false]]);
    });

    it('a tab panel without a focusable element is reached with Tab itself', async () => {
      const { controls, contents } = await render(`<ds-panel-group label="Product">${panel('One', '', '<p>Text only</p>')}${panel('Two')}</ds-panel-group>`);
      controls[0].focus();

      await userEvent.tab();

      expect(focused()).toBe(contents[0]);
    });
  });

  describe('collapsible panels (accordion)', () => {
    const ACCORDION = `<ds-panel-group type="collapsible">${panel('One')}${panel('Two', 'expanded')}${panel('Three')}</ds-panel-group>`;

    it('each title is a button in the Tab order; the collapsed contents are skipped, the expanded one is reached', async () => {
      const { controls, contents } = await render(ACCORDION);
      document.querySelector<HTMLElement>('#before').focus();

      await userEvent.tab();
      expect(focused()).toBe(controls[0]);
      await userEvent.tab();
      expect(focused()).toBe(controls[1]);
      await userEvent.tab();
      expect(focused()).toBe(contents[1].querySelector('a'));
      await userEvent.tab();
      expect(focused()).toBe(controls[2]);
      await userEvent.tab();
      expect(focused()).toBe(document.querySelector('#after'));
    });

    it('Enter and Space expand and collapse a panel; collapsing gives the focus of its content to its button', async () => {
      const { controls, contents, expanded } = await render(ACCORDION);
      controls[0].focus();

      await userEvent.keyboard('{Enter}');
      expect(expanded()).toEqual([true, true, false]);
      expect(controls[0].getAttribute('aria-expanded')).toBe('true');
      await expect.poll(() => contents[0].inert).toBe(false);

      await userEvent.keyboard(' ');
      expect(expanded()).toEqual([false, true, false]);

      contents[1].querySelector('a').focus();
      controls[1].click();
      await expect.poll(focused).toBe(controls[1]);
      expect(expanded()).toEqual([false, false, false]);
    });
  });
});
