import { describe, expect, it } from 'vitest';
import { h } from '@stencil/core';
import './block/block';
import './combo/combo';
import './grid/grid';
import './heading/heading';
import './nav/nav';
import './panel/panel';
import './panel-group/panel-group';
import './select/select';
import './sidebar/sidebar';
import './slider/slider';
import './text/text';
import './title/title';
import './title-bar/title-bar';
import './toaster/toaster';
import './toggle/toggle';
import './toggle-group/toggle-group';
import './tooltip/tooltip';
import './trigger/trigger';
import { renderPage, type SpecPage } from '../../test/helpers';

/** Where the class list is rendered: on the host, or on the root element the component renders in it. */
type ClassTarget = 'host' | 'root';

// [tag, main class, class target, other props the component needs to render]: the components imported above.
const components: [string, string, ClassTarget, Record<string, string>?][] = [
  ['ds-block', 'ds-block', 'host'],
  ['ds-combo', 'ds-combo', 'root'],
  ['ds-grid', 'ds-grid', 'root'],
  ['ds-heading', 'ds-heading', 'host'],
  ['ds-nav', 'ds-nav', 'root'],
  ['ds-panel', 'ds-panel', 'host'],
  ['ds-panel-group', 'ds-panel-group', 'host'],
  ['ds-select', 'ds-select', 'host'],
  ['ds-sidebar', 'ds-sidebar', 'host'],
  ['ds-slider', 'ds-slider', 'root'],
  ['ds-text', 'ds-text', 'host'],
  ['ds-title', 'ds-title', 'host'],
  ['ds-title-bar', 'ds-title-bar', 'host'],
  ['ds-toaster', 'ds-toaster', 'root'],
  ['ds-toggle', 'ds-toggle', 'host'],
  ['ds-toggle-group', 'ds-toggle-group', 'host'],
  ['ds-tooltip', 'ds-tooltip', 'root'],
  // The main class of ds-trigger is `ds-<type>`: `control` by default.
  ['ds-trigger', 'ds-control', 'host'],
];

describe.each(components)('%s mods', (tag, mainClass, classTarget, props = {}) => {
  const classElement = (page: SpecPage) => (classTarget === 'host' ? page.root : page.root.firstElementChild);

  it('renders the main class and a class per modifier of a comma-separated string, reflected to the attribute', async () => {
    const attributes = Object.entries(props)
      .map(([name, value]) => ` ${name}='${value}'`)
      .join('');
    const page = await renderPage(`<${tag} mods="x, y"${attributes}></${tag}>`);

    expect(classElement(page)).toHaveClasses([mainClass, '--x', '--y']);
    expect(page.root.getAttribute('mods')).toBe('x, y');
  });

  it('renders a class per modifier of an array', async () => {
    const page = await renderPage(() => h(tag, { ...props, mods: ['x', 'y'] }));

    expect(classElement(page)).toHaveClasses([mainClass, '--x', '--y']);
  });

  it('updates the classes when the modifiers change after the load', async () => {
    const page = await renderPage(() => h(tag, { ...props, mods: ['x', 'y'] }));

    page.root.mods = 'z';
    await page.waitForChanges();

    expect(classElement(page)).toHaveClasses([mainClass, '--z']);
    expect(classElement(page)).not.toHaveClass('--x');
    expect(page.root.getAttribute('mods')).toBe('z');

    page.root.mods = ['w'];
    await page.waitForChanges();

    expect(classElement(page)).toHaveClasses([mainClass, '--w']);
    expect(classElement(page)).not.toHaveClass('--z');

    page.root.mods = [];
    await page.waitForChanges();

    expect(classElement(page)).toHaveClass(mainClass);
    expect(classElement(page)).not.toHaveClass('--w');
  });

  it('has no modifier and no mods attribute by default', async () => {
    const page = await renderPage(() => h(tag, props));

    expect(page.root.mods).toEqual([]);
    expect(classElement(page)).toHaveClass(mainClass);
    expect(page.root.hasAttribute('mods')).toBe(false);
  });
});
