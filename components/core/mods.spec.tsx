import { h } from '@stencil/core';
import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSBlock } from './block/block';
import { DSCombo } from './combo/combo';
import { DSGrid } from './grid/grid';
import { DSHeading } from './heading/heading';
import { DSSlideMsg } from './marquee/marquee';
import { DSNav } from './nav/nav';
import { DSPanel } from './panel/panel';
import { DSPanelGroup } from './panel-group/panel-group';
import { DSSelect } from './select/select';
import { DSSidebar } from './sidebar/sidebar';
import { DSSlider } from './slider/slider';
import { DSText } from './text/text';
import { DSTitle } from './title/title';
import { DSTitleBar } from './title-bar/title-bar';
import { DSToaster } from './toaster/toaster';
import { DSToggle } from './toggle/toggle';
import { DSToggleGroup } from './toggle-group/toggle-group';
import { DSTooltip } from './tooltip/tooltip';
import { DSTrigger } from './trigger/trigger';
import { DSVideo } from './video/video';

/** Where the class list is rendered: on the host, or on the root element the component renders in it. */
type ClassTarget = 'host' | 'root';

// [tag, component, main class, class target, other props the component needs to render]
const components: [string, unknown, string, ClassTarget, Record<string, string>?][] = [
  ['ds-block', DSBlock, 'ds-block', 'host'],
  ['ds-combo', DSCombo, 'ds-combo', 'root', { options: '[]' }],
  ['ds-grid', DSGrid, 'ds-grid', 'root'],
  ['ds-heading', DSHeading, 'ds-heading', 'host'],
  ['ds-marquee', DSSlideMsg, 'ds-marquee', 'host'],
  ['ds-nav', DSNav, 'ds-nav', 'root'],
  ['ds-panel', DSPanel, 'ds-panel', 'host'],
  ['ds-panel-group', DSPanelGroup, 'ds-panel-group', 'host'],
  ['ds-select', DSSelect, 'ds-select', 'host'],
  ['ds-sidebar', DSSidebar, 'ds-sidebar', 'host'],
  ['ds-slider', DSSlider, 'ds-slider', 'root'],
  ['ds-text', DSText, 'ds-text', 'host'],
  ['ds-title', DSTitle, 'ds-title', 'host'],
  ['ds-title-bar', DSTitleBar, 'ds-title-bar', 'host'],
  ['ds-toaster', DSToaster, 'ds-toaster', 'root'],
  ['ds-toggle', DSToggle, 'ds-toggle', 'host'],
  ['ds-toggle-group', DSToggleGroup, 'ds-toggle-group', 'host'],
  ['ds-tooltip', DSTooltip, 'ds-tooltip', 'root'],
  // The main class of ds-trigger is `ds-<type>`: `control` by default.
  ['ds-trigger', DSTrigger, 'ds-control', 'host'],
  ['ds-video', DSVideo, 'ds-video', 'host'],
];

describe.each(components)('%s mods', (tag, component, mainClass, classTarget, props = {}) => {
  const classElement = (page: SpecPage) => (classTarget === 'host' ? page.root : page.root.firstElementChild);

  it('renders the main class and a class per modifier of a comma-separated string, reflected to the attribute', async () => {
    const attributes = Object.entries(props)
      .map(([name, value]) => ` ${name}='${value}'`)
      .join('');
    const page = await newSpecPage({ components: [component], html: `<${tag} mods="x, y"${attributes}></${tag}>` });

    expect(classElement(page)).toHaveClasses([mainClass, '--x', '--y']);
    expect(page.root.getAttribute('mods')).toBe('x, y');
  });

  it('renders a class per modifier of an array', async () => {
    const page = await newSpecPage({ components: [component], template: () => h(tag, { ...props, mods: ['x', 'y'] }) });

    expect(classElement(page)).toHaveClasses([mainClass, '--x', '--y']);
  });

  it('updates the classes when the modifiers change after the load', async () => {
    const page = await newSpecPage({ components: [component], template: () => h(tag, { ...props, mods: ['x', 'y'] }) });

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
    const page = await newSpecPage({ components: [component], template: () => h(tag, props) });

    expect(page.root.mods).toEqual([]);
    expect(classElement(page)).toHaveClass(mainClass);
    expect(page.root.hasAttribute('mods')).toBe(false);
  });
});
