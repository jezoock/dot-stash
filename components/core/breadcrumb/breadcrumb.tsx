import { Component, Element, h, Host, Prop, State, Watch } from '@stencil/core';
import { getFocusedElement, getNeighbourTabbable } from '../../utils/focus';
import { formatPluralLabel } from '../../utils/labels';
import { fromJSON, toClassList } from '../../utils/props';
import { DS_BREADCRUMB_DEFAULT_COLLAPSE, DS_BREADCRUMB_DEFAULT_LABEL, DS_BREADCRUMB_MIN_HIDDEN, DSBreadcrumbDefaultLabels } from './breadcrumb.constants';
import { DSBreadcrumbLabels } from './breadcrumb.types';

/**
 * A breadcrumb trail (WAI-ARIA breadcrumb pattern): the links to the pages above the current one, from the top level. The
 * page writes the trail in the element, as an ordered list of links (`<ol><li><a href="/">Home</a></li>…</ol>`), which
 * works without the script; the last item is the current page, a link or a text. The component never moves nor replaces
 * those nodes. It makes the element a navigation landmark (`role="navigation"`) named by `label` ("Breadcrumb"), unless the
 * element is in a `nav` element (or another navigation landmark) or holds one, and marks the last item as the current page
 * (`aria-current="page"` on its link, else on the item) when no element of the list has an `aria-current` of its own. The
 * theme draws the separators between the items, in CSS: they are not read.
 *
 * `collapse` shortens a long trail: the first item, a "Show full path" button (`aria-expanded="false"`), and the last
 * items; the hidden items are `hidden` (not rendered, not focusable, not read). The button shows them all, moves the focus
 * to the first one, and goes away. The component inserts the item of that button in the list, after the first item, while
 * the trail is collapsed.
 */
@Component({
  tag: 'ds-breadcrumb',
  styleUrl: 'breadcrumb.scss',
})
export class DSBreadcrumb {
  @Element() host: HTMLElement;

  /** The name of the navigation landmark (`aria-label`): `Breadcrumb` by default. Give it in the language of the page. */
  @Prop() label: string;
  /** The texts of the trail (JSON as an attribute), to translate them: `expand`, the name of the button of a collapsed trail. */
  @Prop() labels: DSBreadcrumbLabels | string = {};
  /**
   * Collapses a long trail: the number of items it keeps at its end (`collapse="2"`; `2` without a number), after the first
   * item and a "Show full path" button that shows the others. A trail is collapsed only when that hides 2 items at least.
   * Without it (or `0`), the whole trail shows, and wraps on a small screen.
   */
  @Prop() collapse: number | string;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** Whether the element is a navigation landmark: not in a `nav` element (or navigation landmark), nor holding one. */
  @State() isLandmark = false;
  /** Whether the trail is collapsed: items hidden behind the "Show full path" button. */
  @State() isCollapsed = false;

  /** The `role` the element had before the first render. */
  private ownRole: string | null = null;
  /** Whether the user showed the whole trail with the button: it stays expanded until the trail changes. */
  private isExpanded = false;
  /** The items of the trail at the last update, to tell a new trail. */
  private items: HTMLElement[] = [];
  /** The element that got `aria-current="page"` from the component (no element of the list had one). */
  private currentElement: HTMLElement | null = null;
  /** The items the component hid (`hidden`) in the collapsed trail. */
  private hiddenItems = new Set<HTMLElement>();
  /** The item of the "Show full path" button, inserted in the list while the trail is collapsed. */
  private collapseItem: HTMLLIElement | undefined;
  private expandButton: HTMLButtonElement | undefined;
  private observer: MutationObserver | undefined;

  @Watch('collapse')
  @Watch('labels')
  propWatcher() {
    this.update();
  }

  connectedCallback() {
    if (typeof MutationObserver === 'function') {
      this.observer = new MutationObserver(records => this.mutationHandler(records));
      this.observer.observe(this.host, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'href', 'role'], attributeOldValue: true });
    }
    this.update();
  }

  componentWillLoad() {
    this.ownRole = this.host.getAttribute('role');
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
    // The trail as the page wrote it.
    this.collapseItem?.remove();
    this.hiddenItems.forEach(item => item.removeAttribute('hidden'));
    this.hiddenItems.clear();
    if (this.currentElement?.getAttribute('aria-current') === 'page') {
      this.currentElement.removeAttribute('aria-current');
    }
    this.currentElement = null;
  }

  /** The trail: the first list (`ol`, or `ul`) in the element; `null` without one. */
  getList(): HTMLElement | null {
    return this.host.querySelector<HTMLElement>('ol, ul');
  }

  /** The items of the trail: the `li` children of its list, but the item of the "Show full path" button. */
  getItems(list = this.getList()): HTMLElement[] {
    return list ? (Array.from(list.children) as HTMLElement[]).filter(child => child.localName === 'li' && child !== this.collapseItem) : [];
  }

  /** The number of items a collapsed trail keeps at its end: `collapse`, `2` without a number; `0`: not collapsed. */
  get collapseCount(): number {
    const collapse = this.collapse;
    if (collapse === '' || collapse === 'true') {
      return DS_BREADCRUMB_DEFAULT_COLLAPSE;
    }
    const count = Math.floor(Number(collapse));
    return Number.isFinite(count) && count > 0 ? count : 0;
  }

  /** The texts: `labels` over the English defaults. */
  private getLabels(): Required<DSBreadcrumbLabels> {
    let labels: DSBreadcrumbLabels = {};
    try {
      labels = (fromJSON(this.labels ?? {}) ?? {}) as DSBreadcrumbLabels;
    } catch {
      console.error('[ds-breadcrumb] labels is not valid JSON');
    }
    return { ...DSBreadcrumbDefaultLabels, ...labels };
  }

  private mutationHandler(records: MutationRecord[]) {
    // The page changed the aria-current the component set: it is the page's from now on.
    if (
      records.some(
        record =>
          record.type === 'attributes' &&
          record.attributeName === 'aria-current' &&
          record.target === this.currentElement &&
          this.currentElement.getAttribute('aria-current') !== 'page',
      )
    ) {
      this.currentElement = null;
    }
    this.update();
  }

  /** Applies the trail: the landmark, the current page, the collapsed items. Writes only what changes. */
  private update() {
    const list = this.getList();
    const items = this.getItems(list);

    this.isLandmark = !this.host.parentElement?.closest('nav, [role="navigation"]') && !this.host.querySelector('nav, [role="navigation"]');
    // A new trail (another page): collapsed again.
    if (items.length !== this.items.length || items.some((item, index) => item !== this.items[index])) {
      this.isExpanded = false;
    }
    this.items = items;
    this.updateCurrent(list, items);
    this.updateCollapse(list, items);
    // The changes of the component are not changes of the page.
    this.observer?.takeRecords();
  }

  /** `aria-current="page"` on the last item (its link, else the item), when no element of the list has an `aria-current`. */
  private updateCurrent(list: HTMLElement | null, items: HTMLElement[]) {
    const isMarked = !!list && Array.from(list.querySelectorAll('[aria-current]')).some(element => element !== this.currentElement);
    const last = items[items.length - 1];
    const target = isMarked || !last ? null : (last.querySelector<HTMLElement>('a[href]') ?? last);

    if (this.currentElement && this.currentElement !== target) {
      if (this.currentElement.getAttribute('aria-current') === 'page') {
        this.currentElement.removeAttribute('aria-current');
      }
      this.currentElement = null;
    }
    if (target) {
      if (target.getAttribute('aria-current') !== 'page') {
        target.setAttribute('aria-current', 'page');
      }
      this.currentElement = target;
    }
  }

  /** Hides the middle items of a collapsed trail behind the "Show full path" button, or shows them again. */
  private updateCollapse(list: HTMLElement | null, items: HTMLElement[]) {
    const keep = this.collapseCount;
    const hiddenCount = items.length - 1 - keep;
    const isCollapsed = !!list && keep > 0 && !this.isExpanded && hiddenCount >= DS_BREADCRUMB_MIN_HIDDEN;
    const toHide = isCollapsed ? items.slice(1, items.length - keep) : [];
    const focused = getFocusedElement();
    const isFocusHidden = !!focused && toHide.some(item => !item.hasAttribute('hidden') && item.contains(focused));

    this.hiddenItems.forEach(item => {
      if (!toHide.includes(item)) {
        item.removeAttribute('hidden');
        this.hiddenItems.delete(item);
      }
    });
    // An item the page hid itself stays the page's.
    toHide
      .filter(item => !item.hasAttribute('hidden'))
      .forEach(item => {
        item.setAttribute('hidden', '');
        this.hiddenItems.add(item);
      });

    if (isCollapsed) {
      const collapseItem = this.getCollapseItem();
      if (collapseItem.parentNode !== list || collapseItem.previousElementSibling !== items[0]) {
        list.insertBefore(collapseItem, items[0].nextSibling);
      }
      const name = formatPluralLabel(this.getLabels().expand, hiddenCount, this.host.closest('[lang]')?.getAttribute('lang') || undefined);
      if (this.expandButton.getAttribute('aria-label') !== name) {
        this.expandButton.setAttribute('aria-label', name);
      }
      // The focus was in an item it hides (the trail collapsed again): to the button that shows it.
      if (isFocusHidden) {
        this.expandButton.focus();
      }
    } else {
      this.collapseItem?.remove();
    }
    this.isCollapsed = isCollapsed;
  }

  /** The item of the "Show full path" button: a `li` with a `button` (`aria-expanded="false"`), named by `labels.expand`. */
  private getCollapseItem(): HTMLLIElement {
    if (!this.collapseItem) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      item.className = 'ds-breadcrumb__collapsed';
      button.type = 'button';
      button.className = 'ds-breadcrumb__expand';
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', this.expandHandler);
      item.appendChild(button);
      this.collapseItem = item;
      this.expandButton = button;
    }
    return this.collapseItem;
  }

  /**
   * The "Show full path" button: shows the whole trail, and gives the focus it had to the first item it showed (its link),
   * as the button goes away.
   */
  private expandHandler = () => {
    const hadFocus = getFocusedElement() === this.expandButton;
    const [first] = this.items;

    this.isExpanded = true;
    this.update();
    if (hadFocus && first) {
      getNeighbourTabbable(first)?.focus();
    }
  };

  render() {
    const role = this.ownRole || (this.isLandmark ? 'navigation' : undefined);

    return (
      <Host
        class={{
          ...toClassList('ds-breadcrumb', this.mods),
          '--collapsed': this.isCollapsed,
        }}
        role={role}
        aria-label={role ? this.label?.trim() || DS_BREADCRUMB_DEFAULT_LABEL : undefined}
      ></Host>
    );
  }
}
