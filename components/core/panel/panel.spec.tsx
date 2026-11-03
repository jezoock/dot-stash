import { readFileSync } from 'fs';
import { join } from 'path';
import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSPanel } from './panel';
import { TRANSITION_END_MARGIN } from '../../utils/transition';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// The spec tests have no CSS engine: the computed transition of the content is given here.
const mockTransition = (transitionDuration: string, transitionDelay = '0s') =>
  jest.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration, transitionDelay } as CSSStyleDeclaration);

/**
 * The simulated DOM of the spec tests has no focus: `focus()` only dispatches a `focus` event. This gives the document an
 * `activeElement`, which `focus()` sets.
 */
const trackFocus = (page: SpecPage) => {
  const focus: { active: HTMLElement | null } = { active: null };
  let owner = Object.getPrototypeOf(page.body);
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);

  jest.spyOn(owner, 'focus').mockImplementation(function (this: HTMLElement) {
    focus.active = this;
  });
  Object.defineProperty(page.doc, 'activeElement', { configurable: true, get: () => focus.active ?? page.body });

  return () => page.doc.activeElement as HTMLElement;
};

const key = (target: EventTarget, type: 'keydown' | 'keyup', name: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent(type, { key: name, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
};

describe('ds-panel', () => {
  afterEach(() => jest.restoreAllMocks());

  const render = async (type: 'tab' | 'collapsible', title = '<span slot="title">Title</span>', attributes = '', transitionDuration?: string) => {
    const page = await newSpecPage({ components: [DSPanel], html: `<ds-panel type="${type}" index="0" ${attributes}>${title}<p>Content</p></ds-panel>` });
    // newSpecPage resets the window: its getComputedStyle is mocked once the page exists.
    if (transitionDuration) {
      mockTransition(transitionDuration);
    }
    const events: string[] = [];
    ['panelShow', 'panelShown', 'panelHide', 'panelHidden'].forEach(name => page.root.addEventListener(name, () => events.push(name)));
    const control = page.root.querySelector<HTMLElement>('.ds-panel__control');
    const content = page.root.querySelector<HTMLElement>('.ds-panel__content');
    return { page, events, control, content };
  };

  it('a collapsible panel: its title holds a button that controls its content, inert while collapsed', async () => {
    const { page, control, content } = await render('collapsible');

    expect(control).toEqualAttributes({ 'role': 'button', 'tabindex': '0', 'aria-expanded': 'false', 'aria-controls': content.id });
    expect(control.querySelector('[slot="title"]').textContent).toBe('Title');
    expect(content.id).toMatch(/^ds-panel-\d+-content$/);
    expect(content).toHaveAttribute('inert');
    expect(content).not.toHaveAttribute('role');
    expect(page.root.querySelector('.ds-panel__title')).not.toHaveAttribute('role');

    await page.root.show();
    await page.waitForChanges();
    expect(control).toEqualAttribute('aria-expanded', 'true');
    expect(content).not.toHaveAttribute('inert');
  });

  it('the ids follow the id of the panel', async () => {
    const { control, content } = await render('collapsible', undefined, 'id="faq-1"');

    expect(control.id).toBe('faq-1-control');
    expect(content.id).toBe('faq-1-content');
  });

  it.each([
    ['the level of a heading in the title slot', '<h3 slot="title">Title</h3>', '', '3'],
    ['the level prop', '<span slot="title">Title</span>', 'level="2"', '2'],
    ['the level prop over the heading', '<h4 slot="title">Title</h4>', 'level="5"', '5'],
  ])('the title of a collapsible panel is a heading around its button, with %s', async (_, title, attributes, level) => {
    const { page } = await render('collapsible', title, attributes);
    const heading = page.root.querySelector('.ds-panel__title');

    expect(heading).toEqualAttributes({ 'role': 'heading', 'aria-level': level });
    expect(heading.firstElementChild).toHaveClass('ds-panel__control');
    // The title is the heading: a heading in the title slot, inside the button, has no role of its own.
    expect(page.root.querySelector('[slot="title"]').getAttribute('role')).toBe(title.startsWith('<h') ? 'none' : null);
  });

  it('gives a heading in the title slot its role back when the title is no longer a control, and keeps its own role', async () => {
    const { page } = await render('collapsible', '<h3 slot="title">Title</h3>');
    const heading = page.root.querySelector('h3');

    await page.root.setType('tab');
    await page.waitForChanges();
    expect(heading).not.toHaveAttribute('role');

    const withRole = await render('collapsible', '<h3 slot="title" role="presentation">Title</h3>');
    expect(withRole.page.root.querySelector('h3')).toEqualAttribute('role', 'presentation');
  });

  it('an invalid level gives no heading', async () => {
    const { page } = await render('collapsible', undefined, 'level="9"');

    expect(page.root.querySelector('.ds-panel__title')).not.toHaveAttribute('role');
  });

  it('a tab outside of a tab list has no role and is not focusable', async () => {
    const { page, control, content } = await render('tab', '<h3 slot="title">Title</h3>');

    expect(page.root.querySelector('h3')).not.toHaveAttribute('role');

    expect(control).not.toHaveAttribute('role');
    expect(control).not.toHaveAttribute('tabindex');
    expect(control).not.toHaveAttribute('aria-controls');
    expect(content).not.toHaveAttribute('role');
  });

  it('a tab of a tab list: a tab, selected when expanded, its content a tabpanel (focusable without focusable content)', async () => {
    const { page, control, content } = await render('tab');

    await page.root.setTab(true);
    await page.waitForChanges();
    expect(control).toEqualAttributes({ 'role': 'tab', 'tabindex': '-1', 'aria-selected': 'false', 'aria-controls': content.id });
    expect(content).toEqualAttributes({ 'role': 'tabpanel', 'aria-labelledby': control.id, 'tabindex': '0' });
    expect(content).toHaveAttribute('inert');
    expect(page.root.querySelector('.ds-panel__title')).not.toHaveAttribute('role');

    await page.root.show();
    await page.waitForChanges();
    expect(control).toEqualAttributes({ 'tabindex': '0', 'aria-selected': 'true' });
    expect(content).not.toHaveAttribute('inert');

    await page.root.setTab(false);
    await page.waitForChanges();
    expect(control).not.toHaveAttribute('role');
    expect(content).not.toHaveAttribute('tabindex');
  });

  it('a tabpanel with a focusable element is not focusable itself', async () => {
    const page = await newSpecPage({ components: [DSPanel], html: '<ds-panel type="tab" expanded><span slot="title">Title</span><a href="/a">Link</a></ds-panel>' });

    await page.root.setTab(true);
    await page.waitForChanges();

    expect(page.root.querySelector('.ds-panel__content')).not.toHaveAttribute('tabindex');
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

  it('Enter (keydown) and Space (keyup) toggle a collapsible panel, without scrolling or repeating', async () => {
    const { page, control } = await render('collapsible');

    const enter = key(control, 'keydown', 'Enter');
    await page.waitForChanges();
    expect(enter.defaultPrevented).toBe(true);
    expect(page.root.expanded).toBe(true);

    key(control, 'keydown', 'Enter', { repeat: true });
    await page.waitForChanges();
    expect(page.root.expanded).toBe(true);

    const space = key(control, 'keydown', ' ');
    expect(space.defaultPrevented).toBe(true);
    await page.waitForChanges();
    expect(page.root.expanded).toBe(true);
    key(control, 'keyup', ' ');
    await page.waitForChanges();
    expect(page.root.expanded).toBe(false);
  });

  it('ignores the keys with a modifier, and those of the elements in the title', async () => {
    const { page, control } = await render('collapsible', '<span slot="title">Title <a href="/more">more</a></span>');

    expect(key(control, 'keydown', 'Enter', { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(key(control.querySelector('a'), 'keydown', 'Enter').defaultPrevented).toBe(false);
    await page.waitForChanges();

    expect(page.root.expanded).toBe(false);
  });

  it('moves the focus from its content to its button when it collapses', async () => {
    const page = await newSpecPage({ components: [DSPanel], html: '<ds-panel type="collapsible" expanded><span slot="title">Title</span><a href="/a">Link</a></ds-panel>' });
    const getFocused = trackFocus(page);

    page.root.querySelector('a').focus();
    await page.root.hide();
    await page.waitForChanges();

    expect(getFocused()).toBe(page.root.querySelector('.ds-panel__control'));
  });

  it.each(['tab', 'collapsible'] as const)('a %s panel emits panelShown and panelHidden at once without a transition (0s)', async type => {
    const { page, events } = await render(type, undefined, '', '0s');

    await page.root.show();
    await page.waitForChanges();
    expect(page.root).toHaveAttribute('expanded');
    await page.waitForChanges();
    expect(events).toEqual(['panelShow', 'panelShown']);
    expect(page.root).not.toHaveClass('--transition');

    await page.root.hide();
    await page.waitForChanges();
    await page.waitForChanges();
    expect(page.root).not.toHaveAttribute('expanded');
    expect(events).toEqual(['panelShow', 'panelShown', 'panelHide', 'panelHidden']);
  });

  it('emits panelShown on the transitionend event of its content, with --transition until then', async () => {
    const { page, events, content } = await render('collapsible', undefined, '', '0.4s');

    await page.root.show();
    await page.waitForChanges();
    expect(page.root).toHaveClass('--transition');
    expect(events).toEqual(['panelShow']);

    // The end of the transition of an element of the content is not the end of the panel's.
    content.querySelector('p').dispatchEvent(new Event('transitionend', { bubbles: true }));
    expect(events).toEqual(['panelShow']);

    content.dispatchEvent(new Event('transitionend'));
    await page.waitForChanges();
    expect(events).toEqual(['panelShow', 'panelShown']);
    expect(page.root).not.toHaveClass('--transition');
  });

  it('emits panelHidden once the duration is over, without the transitionend event; a new change cancels the wait', async () => {
    const { page, events } = await render('tab', undefined, 'expanded', '0.01ms');

    await page.root.hide();
    await page.root.show();
    await page.waitForChanges();
    await wait(TRANSITION_END_MARGIN + 20);

    expect(events).toEqual(['panelHide', 'panelShow', 'panelShown']);
  });

  it('transitions on the expanded attribute, waits with waitForTransition, and clips its content only while needed', () => {
    const stylesheet = readFileSync(join(__dirname, 'panel.scss'), 'utf8');
    const source = readFileSync(join(__dirname, 'panel.tsx'), 'utf8');

    expect(stylesheet).toContain('transition: opacity var(--ds-panel-transition-duration, 0.4s) ease;');
    expect(stylesheet).toContain('transition: grid-template-rows var(--ds-panel-transition-duration, 0.4s) ease;');
    expect(stylesheet).toContain('&[expanded]');
    expect(source).toContain('waitForTransition(this.content');
    expect(source).not.toMatch(/addEventListener\(\s*'transition/);
    // The content of an expanded panel is not clipped (the focus indicator of its elements shows).
    expect(stylesheet).toMatch(/&__content-wrapper \{\s*display: flow-root;\s*position: relative;\s*\}/);
    expect(stylesheet).toMatch(
      /&:not\(\[expanded\]\),\s*&\.--transition \{\s*& > \.ds-panel__content,\s*& > \.ds-panel__content > \.ds-panel__content-wrapper \{\s*overflow: hidden;/,
    );
  });
});
