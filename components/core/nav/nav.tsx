import { Component, Element, h, Listen, Prop, Watch } from '@stencil/core/internal';
import { toClassList } from '../../utils/props';
import CssClassList from '../../utils/interfaces/css-class-list';

@Component({
  tag: 'ds-nav',
  styleUrl: 'nav.scss',
})
export class DSNav {
  @Element() container: HTMLDivElement;

  @Prop() currentActiveItemId: string;
  @Prop() mods: string | string[];

  CSSClassList: CssClassList;

  @Watch('mods')
  modsChangeHandler(newMods) {
    this.CSSClassList = toClassList('ds-nav', newMods);
  }

  @Listen('DSMenuItemClick')
  onDSMenuItemClick({ detail: { menuItem } }) {
    console.log(menuItem);
  }

  componentWillLoad() {
    this.CSSClassList = toClassList('ds-nav', this.mods);
  }

  componentDidLoad() {
    this.setActiveMenuItem();
  }

  getItems(itemLevel: number): any {
    const depth = typeof itemLevel === 'number' ? `='${Math.abs(itemLevel)}'` : '';
    const items = this.container.querySelectorAll(`ds-nav-item[ds-depth${depth}]`);
    return items.length ? items : [];
  }

  setActiveMenuItem() {
    //const items = this.getItems(0);
    //items.forEach( item => item.dsIsSelected = item.dsItemId === this.currentActiveItemId );
  }

  render() {
    return (
      <div class={this.CSSClassList}>
        <slot />
      </div>
    );
  }
}
