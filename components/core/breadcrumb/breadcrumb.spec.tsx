import { describe, expect, it, vi } from 'vitest';
import './breadcrumb';
import { renderPage, trackFocus } from '../../../test/helpers';

type Breadcrumb = HTMLElement & { label: string; labels: unknown; collapse: number | string };

/** A trail of `count` levels: links to `/1`, `/2`…, named Level 1, Level 2…; the last one a text with `lastText`. */
const trail = (count: number, { lastText = false, attributes = '' } = {}) =>
  `<ds-breadcrumb ${attributes}><ol>${Array.from({ length: count }, (_, index) =>
    lastText && index === count - 1 ? `<li>Level ${index + 1}</li>` : `<li><a href="/${index + 1}">Level ${index + 1}</a></li>`,
  ).join('')}</ol></ds-breadcrumb>`;

/**
 * The simulated DOM has no MutationObserver: a fake one, whose callback a test calls with the records of a change of the
 * page (`notify()`), as a browser does after it.
 */
const fakeMutationObserver = () => {
  const observers: { callback: MutationCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; takeRecords: ReturnType<typeof vi.fn> }[] = [];
  vi.stubGlobal(
    'MutationObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      constructor(public callback: MutationCallback) {
        observers.push(this);
      }
    },
  );
  return {
    observers,
    notify: (...records: Partial<MutationRecord>[]) => observers.at(-1).callback(records as MutationRecord[], null),
  };
};

describe('ds-breadcrumb', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const element = page.body.querySelector('ds-breadcrumb') as Breadcrumb;
    const list = element.querySelector('ol');
    const items = () => Array.from(list.children) as HTMLElement[];
    const link = (level: number) => element.querySelector<HTMLAnchorElement>(`a[href="/${level}"]`);
    const button = () => element.querySelector<HTMLButtonElement>('.ds-breadcrumb__expand');
    /** The texts of the items shown: the button is `…`, the hidden items are left out. */
    const shown = () =>
      items()
        .map(item => (item.hasAttribute('hidden') ? null : item.querySelector('button') ? '…' : item.textContent.trim()))
        .filter(Boolean);
    return { page, element, list, items, link, button, shown };
  };

  describe('landmark', () => {
    it('is a navigation landmark named "Breadcrumb", and renders the trail of the page as it is', async () => {
      const { element, list, items } = await render(trail(3));

      expect(element).toEqualAttributes({ 'role': 'navigation', 'aria-label': 'Breadcrumb' });
      expect(element).toHaveClass('ds-breadcrumb');
      expect(element).not.toHaveClass('--collapsed');
      expect(Array.from(element.children)).toEqual([list]);
      expect(items().map(item => item.outerHTML)).toEqual([
        '<li><a href="/1">Level 1</a></li>',
        '<li><a href="/2">Level 2</a></li>',
        '<li><a href="/3" aria-current="page">Level 3</a></li>',
      ]);
    });

    it('label names it; an empty label is the default name; mods are classes', async () => {
      const { page, element } = await render(trail(2, { attributes: 'label="Fil d’Ariane" mods="small,muted"' }));

      expect(element.getAttribute('aria-label')).toBe('Fil d’Ariane');
      expect(element).toHaveClasses(['ds-breadcrumb', '--small', '--muted']);
      element.label = ' ';
      await page.waitForChanges();
      expect(element.getAttribute('aria-label')).toBe('Breadcrumb');
    });

    it.each([
      ['in a nav element', '<nav aria-label="Breadcrumb">%s</nav>'],
      ['in a navigation landmark', '<div role="navigation" aria-label="Breadcrumb"><div>%s</div></div>'],
    ])('is not a landmark %s: no role, no name', async (_, wrapper) => {
      const { element } = await render(wrapper.replace('%s', trail(2)));

      expect([element.hasAttribute('role'), element.hasAttribute('aria-label')]).toEqual([false, false]);
      expect(element.querySelector('a[href="/2"]').getAttribute('aria-current')).toBe('page');
    });

    it('is not a landmark when it holds a nav element of the page, which stays where it is', async () => {
      const { element } = await render('<ds-breadcrumb><nav aria-label="Breadcrumb"><ol><li><a href="/1">Home</a></li><li>Shoes</li></ol></nav></ds-breadcrumb>');

      expect([element.hasAttribute('role'), element.hasAttribute('aria-label')]).toEqual([false, false]);
      expect(element.firstElementChild.localName).toBe('nav');
      expect(element.querySelector('li:last-child').getAttribute('aria-current')).toBe('page');
    });

    it('keeps a role of its own, named by label', async () => {
      const { element } = await render(trail(2, { attributes: 'role="region" label="Path"' }));

      expect(element).toEqualAttributes({ 'role': 'region', 'aria-label': 'Path' });
    });

    it('moved into a nav element, it is no longer a landmark; moved out, it is one again', async () => {
      const { page, element } = await render(`<nav id="nav"></nav><div id="div"></div>${trail(2)}`);

      page.body.querySelector('#nav').appendChild(element);
      await page.waitForChanges();
      expect(element.hasAttribute('role')).toBe(false);

      page.body.querySelector('#div').appendChild(element);
      await page.waitForChanges();
      expect(element.getAttribute('role')).toBe('navigation');
    });
  });

  describe('current page', () => {
    it('marks the link of the last item', async () => {
      const { link } = await render(trail(4));

      expect([1, 2, 3, 4].map(level => link(level).getAttribute('aria-current'))).toEqual([null, null, null, 'page']);
    });

    it('marks the last item itself when it has no link', async () => {
      const { items } = await render(trail(3, { lastText: true }));

      expect(items().map(item => item.getAttribute('aria-current'))).toEqual([null, null, 'page']);
      expect(items()[2].outerHTML).toBe('<li aria-current="page">Level 3</li>');
    });

    it('a link without href is not a link: the item is marked', async () => {
      const { items } = await render('<ds-breadcrumb><ol><li><a href="/">Home</a></li><li><a>Shoes</a></li></ol></ds-breadcrumb>');

      expect(items()[1].outerHTML).toBe('<li aria-current="page"><a>Shoes</a></li>');
    });

    it.each([
      ['aria-current="page" on another link', '<li><a href="/1">Home</a></li><li><a href="/2" aria-current="page">Shoes</a></li><li><a href="/3">Filters</a></li>'],
      ['aria-current="location" on the last link', '<li><a href="/1">Home</a></li><li><a href="/2" aria-current="location">Shoes</a></li>'],
      ['aria-current="false" on the last item: a trail that ends with a parent of the page', '<li><a href="/1">Home</a></li><li aria-current="false"><a href="/2">Shoes</a></li>'],
    ])('keeps the mark of the page and adds none: %s', async (_, html) => {
      const { list } = await render(`<ds-breadcrumb><ol>${html}</ol></ds-breadcrumb>`);

      expect(list.innerHTML).toBe(html);
    });

    it('follows a trail a script changes: the new last item, and the mark of the page', async () => {
      const { notify } = fakeMutationObserver();
      const { page, list, link } = await render(trail(2));
      const item = page.doc.createElement('li');
      item.innerHTML = '<a href="/3">Level 3</a>';

      list.appendChild(item);
      notify({ type: 'childList', target: list, addedNodes: [item] as unknown as NodeList });
      await page.waitForChanges();
      expect([link(2).hasAttribute('aria-current'), link(3).getAttribute('aria-current')]).toEqual([false, 'page']);

      // The page marks another one: the mark of the component goes.
      link(2).setAttribute('aria-current', 'page');
      notify({ type: 'attributes', target: link(2), attributeName: 'aria-current', oldValue: null });
      await page.waitForChanges();
      expect([link(2).getAttribute('aria-current'), link(3).hasAttribute('aria-current')]).toEqual(['page', false]);
    });

    it('the page that changes the mark of the component owns it', async () => {
      const { notify } = fakeMutationObserver();
      const { page, link } = await render(trail(2));

      link(2).setAttribute('aria-current', 'false');
      notify({ type: 'attributes', target: link(2), attributeName: 'aria-current', oldValue: 'page' });
      await page.waitForChanges();

      expect(link(2).getAttribute('aria-current')).toBe('false');
    });

    it('observes the trail for the changes of the page, and stops when it leaves; gives the trail back as it was', async () => {
      const { observers } = fakeMutationObserver();
      const { page, element, link } = await render(trail(2));
      const [observer] = observers;

      expect(observer.observe).toHaveBeenCalledWith(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-current', 'href', 'role'],
        attributeOldValue: true,
      });
      element.remove();
      await page.waitForChanges();
      expect(observer.disconnect).toHaveBeenCalled();
      expect(link(2).hasAttribute('aria-current')).toBe(false);
    });

    it('without a list: a landmark, nothing else', async () => {
      const { root: element } = await renderPage('<ds-breadcrumb><a href="/">Home</a></ds-breadcrumb>');

      expect(element.getAttribute('role')).toBe('navigation');
      expect(element.innerHTML).toBe('<a href="/">Home</a>');
    });
  });

  describe('collapse', () => {
    it('collapse="2": the first item, the "Show full path" button, the last 2 items; the others hidden', async () => {
      const { element, items, button, shown } = await render(trail(6, { attributes: 'collapse="2"' }));

      expect(element).toHaveClass('--collapsed');
      expect(shown()).toEqual(['Level 1', '…', 'Level 5', 'Level 6']);
      expect(items().map(item => item.hasAttribute('hidden'))).toEqual([false, false, true, true, true, false, false]);
      expect(items()[1].outerHTML).toBe(
        '<li class="ds-breadcrumb__collapsed"><button type="button" class="ds-breadcrumb__expand" aria-expanded="false" aria-label="Show full path"></button></li>',
      );
      expect(button().textContent).toBe('');
    });

    it.each([
      ['2', 6, ['Level 1', '…', 'Level 5', 'Level 6']],
      ['', 6, ['Level 1', '…', 'Level 5', 'Level 6']],
      ['1', 4, ['Level 1', '…', 'Level 4']],
      ['3.9', 7, ['Level 1', '…', 'Level 5', 'Level 6', 'Level 7']],
      // A button in place of one item: not collapsed.
      ['2', 4, ['Level 1', 'Level 2', 'Level 3', 'Level 4']],
      ['3', 5, ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']],
      ['10', 6, ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']],
      ['0', 6, ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']],
      ['-2', 6, ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']],
      ['many', 6, ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']],
    ])('collapse="%s", %s items: %j', async (collapse, count, expected) => {
      const { element, shown } = await render(trail(count, { attributes: `collapse="${collapse}"` }));

      expect(shown()).toEqual(expected);
      expect(element.classList.contains('--collapsed')).toBe(expected.includes('…'));
    });

    it('the button shows the whole trail and goes away; the focus it had goes to the link of the first item it showed', async () => {
      const focused = trackFocus();
      const { page, element, items, link, button, shown } = await render(trail(6, { attributes: 'collapse="2"' }));
      button().focus();

      button().click();
      await page.waitForChanges();

      expect(shown()).toEqual(['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']);
      expect(items().some(item => item.hasAttribute('hidden'))).toBe(false);
      expect([button(), element.classList.contains('--collapsed')]).toEqual([null, false]);
      expect(focused()).toBe(link(2));
    });

    it('a click without the focus on the button leaves the focus where it is', async () => {
      const focused = trackFocus();
      const { page, button, shown } = await render(`<button id="other">Other</button>${trail(5, { attributes: 'collapse="1"' })}`);
      const other = page.body.querySelector<HTMLElement>('#other');
      other.focus();

      button().click();
      await page.waitForChanges();

      expect(shown()).toHaveLength(5);
      expect(focused()).toBe(other);
    });

    it('stays expanded until the trail changes: a new trail is collapsed again', async () => {
      const { notify } = fakeMutationObserver();
      const { page, element, list, button, shown } = await render(trail(5, { attributes: 'collapse="1"' }));
      button().click();
      await page.waitForChanges();
      expect(shown()).toHaveLength(5);

      // The same trail (an attribute of a link changed): still expanded.
      notify({ type: 'attributes', target: list.querySelector('a'), attributeName: 'href', oldValue: '/0' });
      await page.waitForChanges();
      expect(shown()).toHaveLength(5);

      // Another trail.
      list.innerHTML = Array.from({ length: 6 }, (_, index) => `<li><a href="/${index + 1}">Page ${index + 1}</a></li>`).join('');
      notify({ type: 'childList', target: list });
      await page.waitForChanges();
      expect(shown()).toEqual(['Page 1', '…', 'Page 6']);
      expect(element).toHaveClass('--collapsed');
    });

    it('follows collapse set by a script: collapses, expands, and moves the button', async () => {
      const { page, element, items, shown } = await render(trail(6));

      element.collapse = 3;
      await page.waitForChanges();
      expect(shown()).toEqual(['Level 1', '…', 'Level 4', 'Level 5', 'Level 6']);

      element.collapse = 1;
      await page.waitForChanges();
      expect(shown()).toEqual(['Level 1', '…', 'Level 6']);
      expect(items()).toHaveLength(7);

      element.collapse = 0;
      await page.waitForChanges();
      expect(shown()).toEqual(['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']);
      expect(items()).toHaveLength(6);
      expect(element).not.toHaveClass('--collapsed');
    });

    it('collapsing while the focus is in an item it hides: the focus goes to the button', async () => {
      const focused = trackFocus();
      const { page, element, link, button } = await render(trail(6));
      link(3).focus();

      element.collapse = 2;
      await page.waitForChanges();

      expect(focused()).toBe(button());
    });

    it('keeps an item the page hid itself hidden', async () => {
      const { page, element, items } = await render(
        '<ds-breadcrumb collapse="1"><ol><li><a href="/1">A</a></li><li hidden><a href="/2">B</a></li><li><a href="/3">C</a></li><li><a href="/4">D</a></li></ol></ds-breadcrumb>',
      );
      expect(items().map(item => item.hasAttribute('hidden'))).toEqual([false, false, true, true, false]);

      element.collapse = 0;
      await page.waitForChanges();
      expect(items().map(item => item.hasAttribute('hidden'))).toEqual([false, true, false, false]);
    });

    it('labels names the button: {count} is the number of hidden items, with the plural of the language of the page', async () => {
      const labels = JSON.stringify({ expand: { few: 'Pokaż {count} poziomy', many: 'Pokaż {count} poziomów', other: 'Pokaż {count} poziomu' } });
      const { page, element, button } = await render(`<div lang="pl">${trail(8, { attributes: `collapse="1" labels='${labels}'` })}</div>`);

      expect(button().getAttribute('aria-label')).toBe('Pokaż 6 poziomów');
      element.collapse = 4;
      await page.waitForChanges();
      expect(button().getAttribute('aria-label')).toBe('Pokaż 3 poziomy');
      element.labels = { expand: 'Show {count} more' };
      await page.waitForChanges();
      expect(button().getAttribute('aria-label')).toBe('Show 3 more');
    });

    it('labels that are not valid JSON: the default texts, and an error', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { button } = await render(trail(5, { attributes: 'collapse="1" labels="{expand"' }));

      expect(button().getAttribute('aria-label')).toBe('Show full path');
      expect(error).toHaveBeenCalledWith('[ds-breadcrumb] labels is not valid JSON');
    });

    it('leaving the document gives the trail back as the page wrote it', async () => {
      const { page, element, list, items } = await render(trail(5, { attributes: 'collapse="1"' }));
      const html = list.innerHTML;

      element.remove();
      await page.waitForChanges();

      expect(items()).toHaveLength(5);
      expect(items().some(item => item.hasAttribute('hidden') || item.querySelector('[aria-current]'))).toBe(false);
      expect(html).toContain('ds-breadcrumb__collapsed');

      // Back in the document: collapsed again.
      page.body.appendChild(element);
      await page.waitForChanges();
      expect(list.innerHTML).toBe(html);
    });
  });
});
