import { readFileSync } from 'fs';
import { join } from 'path';
import { newSpecPage } from '@stencil/core/testing';
import { DSBlock } from './block';

/** The classes of the host (sorted) and of its wrappers, as rendered. */
const structure = (block: HTMLElement) => ({
  host: block.className.split(' ').sort(),
  wrappers: Array.from(block.children).map(child => child.className),
});

describe('ds-block', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ['<ds-block></ds-block>', 'block'],
    ['<ds-block article></ds-block>', 'article'],
    ['<ds-block section></ds-block>', 'section'],
    ['<ds-block form></ds-block>', 'form'],
    ['<ds-block modal></ds-block>', 'modal'],
  ])('%s has the %p context', async (html, context) => {
    const page = await newSpecPage({ components: [DSBlock], html });

    expect(await page.root.getContext()).toBe(context);
    expect(page.root).toHaveClass(`ds-${context}`);
    expect(page.root.querySelector(`.ds-${context}__body`)).not.toBeNull();
  });

  it('builds the class from name and type, with the modifiers', async () => {
    const page = await newSpecPage({ components: [DSBlock], html: '<ds-block name="home" type="hero" mods="dark,wide"></ds-block>' });

    expect(page.root).toHaveClasses(['ds-home-hero', '--dark', '--wide']);
  });

  it('wraps its header and footer slots', async () => {
    const page = await newSpecPage({
      components: [DSBlock],
      html: '<ds-block section name="home"><h2 slot="header">Title</h2><p>Text</p><footer slot="footer">End</footer></ds-block>',
    });

    expect(structure(page.root)).toEqual({ host: ['ds-home-section'], wrappers: ['ds-home-section__header', 'ds-home-section__body', 'ds-home-section__footer'] });
    expect(page.root.querySelector('.ds-home-section__header > h2').textContent).toBe('Title');
    expect(page.root.querySelector('.ds-home-section__body > p').textContent).toBe('Text');
    expect(page.root.querySelector('.ds-home-section__footer > footer').textContent).toBe('End');
  });

  // In browsers, the former async connectedCallback ended after the first render, which no later render corrected:
  // no host class, `ds-block__body` for a named block, header and footer not wrapped. The spec DOM renders after
  // the promises, so an async step is simulated here by a getContext() that resolves after the first render.
  it('renders its classes and its header and footer wrappers in the first render', async () => {
    const renders: { host: unknown; wrappers: unknown[] }[] = [];
    const render = DSBlock.prototype.render;
    jest.spyOn(DSBlock.prototype, 'render').mockImplementation(function (this: DSBlock) {
      const vnode = render.call(this);
      renders.push({ host: vnode.$attrs$?.class, wrappers: (vnode.$children$ ?? []).map(child => child.$attrs$?.class) });
      return vnode;
    });
    jest.spyOn(DSBlock.prototype, 'getContext').mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('section'), 50)));

    await newSpecPage({ components: [DSBlock], html: '<ds-block section name="home"><h2 slot="header">Title</h2><p>Text</p><footer slot="footer">End</footer></ds-block>' });

    expect(renders[0]).toEqual({
      host: 'ds-home-section',
      wrappers: ['ds-home-section__header', 'ds-home-section__body', 'ds-home-section__footer'],
    });
  });

  it('follows the name, type and context when they change after the load', async () => {
    const page = await newSpecPage({ components: [DSBlock], html: '<ds-block name="home" mods="dark"><p>Text</p></ds-block>' });

    page.root.name = 'news';
    page.root.section = true;
    await page.waitForChanges();
    expect(structure(page.root)).toEqual({ host: ['--dark', 'ds-news-section'], wrappers: ['ds-news-section__body'] });
    expect(await page.root.getContext()).toBe('section');

    page.root.type = 'hero';
    await page.waitForChanges();
    expect(structure(page.root)).toEqual({ host: ['--dark', 'ds-news-hero'], wrappers: ['ds-news-hero__body'] });
  });

  it('only wraps its own header and footer, not those of a nested block', async () => {
    const page = await newSpecPage({
      components: [DSBlock],
      html: '<ds-block name="outer"><ds-block name="inner"><h2 slot="header">Inner title</h2><p slot="footer">Inner end</p></ds-block></ds-block>',
    });
    const inner = page.root.querySelector<HTMLElement>('[name="inner"]');

    expect(structure(page.root).wrappers).toEqual(['ds-outer-block__body']);
    expect(structure(inner).wrappers).toEqual(['ds-inner-block__header', 'ds-inner-block__body', 'ds-inner-block__footer']);
  });

  // The spec DOM has no styles: the stylesheet is read instead (checked in Chromium too).
  it('only hides a header or footer wrapper without its slot, named as block.tsx names it', () => {
    const stylesheet = readFileSync(join(__dirname, 'block.scss'), 'utf8');

    expect(stylesheet).toContain(":not(:has([slot='header']))");
    expect(stylesheet).toContain(":not(:has([slot='footer']))");
    expect(stylesheet).not.toMatch(/block-header|block-footer/);
  });
});
