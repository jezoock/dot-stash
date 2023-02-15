import { Component, Element, h, Listen, Prop, Watch } from '@stencil/core';
import _ds from '../dot-stash';

@Component({
  tag: 'ds-nav-menu',
  styleUrl: 'nav-menu.scss'
})
export class DSNavMenu {

  @Element() container: HTMLDivElement;

  @Prop() currentActiveItemId: string;
  @Prop() mods: string|string[];

  CSSClassList: Record<string, boolean>;

  @Watch('mods')
  modsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-nav-menu", newMods);
  }

  @Listen('DSMenuItemClick')
  onDSMenuItemClick({detail: { menuItem }}) {
    console.log(menuItem);
  }

  constructor() {}

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-nav-menu", this.mods);
  }
  
  componentDidLoad() {
    this.setActiveMenuItem();
  }

  getItems( itemLevel: number ): any {
    const depth = typeof itemLevel === "number" ? `='${Math.abs(itemLevel)}'` : '';
    const items = this.container.querySelectorAll(`ds-nav-menu-item[ds-depth${depth}]`);
    return items.length ? items : [];
  }

  setActiveMenuItem() {
    //const items = this.getItems(0);
    //items.forEach( item => item.dsIsSelected = item.dsItemId === this.currentActiveItemId );
  }

  render() {
    return (
      <div
        class={this.CSSClassList}
      >
        <slot />
      </div>
    );
  }
}