import { Component, Element, h, Prop } from '@stencil/core';
import { toClassList } from '../../utils/props';

@Component({
  tag: 'ds-nav',
  styleUrl: 'nav.scss',
})
export class DSNav {
  @Element() container: HTMLDivElement;

  @Prop() currentActiveItemId: string;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

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
    return (
      <div class={toClassList('ds-nav', this.mods)}>
        <slot />
      </div>
    );
  }
}
