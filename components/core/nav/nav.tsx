import { Component, Element, h, Host, Prop } from '@stencil/core';
import { toClassList } from '../../utils/props';

/**
 * A navigation: a list of `ds-nav-item` elements. A main `ds-nav` is a navigation landmark (`role="navigation"`, or the
 * `role` its element has), named by `label`; a `ds-nav` in a `ds-nav-item` (a sub-navigation), or in a `nav` element or
 * another navigation landmark, is a list only. Its items are the items of the list (`role="list"`, `role="listitem"`).
 *
 * @slot - The `ds-nav-item` elements (only them: they are the items of the list).
 */
@Component({
  tag: 'ds-nav',
  styleUrl: 'nav.scss',
})
export class DSNav {
  @Element() container: HTMLDivElement;

  @Prop() currentActiveItemId: string;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /**
   * The accessible name of the navigation landmark (`aria-label`), which tells it from the other navigations of the page:
   * "Main", "Footer". Not rendered on a sub-navigation.
   */
  @Prop() label: string;

  /** The `role` the element had before the first render. */
  private ownRole: string | null = null;
  /** Whether the navigation is a landmark: not in a `ds-nav-item`, a `nav` element or another navigation landmark. */
  private isLandmark = false;

  componentWillLoad() {
    this.ownRole = this.container.getAttribute('role');
    this.isLandmark = !this.container.parentElement?.closest('ds-nav-item, nav, [role="navigation"]');
  }

  componentDidLoad() {
    this.setActiveMenuItem();
  }

  getItems(itemLevel: number): NodeListOf<Element> | Element[] {
    const depth = typeof itemLevel === 'number' ? `='${Math.abs(itemLevel)}'` : '';
    const items = this.container.querySelectorAll(`ds-nav-item[ds-depth${depth}]`);
    return items.length ? items : [];
  }

  setActiveMenuItem() {}

  render() {
    const role = this.ownRole || (this.isLandmark ? 'navigation' : undefined);

    return (
      <Host role={role} aria-label={role ? this.label : undefined}>
        <div class={toClassList('ds-nav', this.mods)} role="list">
          <slot />
        </div>
      </Host>
    );
  }
}
