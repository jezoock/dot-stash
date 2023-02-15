import { Component, Event, EventEmitter, h, Prop, Element, State } from '@stencil/core';
import  _ds from '../../../../dot-stash';

@Component({
  tag: 'ds-nav-menu-item',
  styleUrl: 'nav-menu-item.scss'
  
})
export class DSNavMenuItem {

  @Element() host: HTMLElement;

  @Prop() dsItemId: string;
  @Prop({ reflect: true, mutable: true }) type = 'page';
  @Prop({ reflect: true, mutable: true }) depth = 0;
  @Prop({ reflect: true, mutable: true }) hasChildren = false;
  @Prop({ reflect: true, mutable: true }) isActive = false;
  @Prop({ reflect: true, mutable: true }) isAnimated = true;

  @State() isOpened = false;

  @Event() dsMenuItemClick: EventEmitter;
  
  constructor() {
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.removeTransition = this.removeTransition.bind(this);
  }

  componentWillLoad() {
    this.isActive = _ds.props.isTrue(this.isActive);
    this.hasChildren = _ds.props.isTrue(this.hasChildren);
    this.isAnimated = _ds.props.isTrue(this.isAnimated);
    this.depth = _ds.props.toNumber(this.depth);
  }

  toggleSubNav( mustShow = false ): void {
    this.isOpened = mustShow;
    this[ `${mustShow ? 'show' : 'hide'}SubNav`]();
  }

  removeTransition() {
    const subNav = this.host.querySelector(".ds-nav-menu-item__sub-nav") as HTMLDivElement;
    if(subNav.offsetHeight !== 0 ) {
      subNav.style.height = "auto";
    }
    subNav.removeEventListener( "transitionend", this.removeTransition);
  }

  showSubNav(): void {
    const subNav = this.host.querySelector(".ds-nav-menu-item__sub-nav") as HTMLDivElement;
    const subNavContent = this.host.querySelector(".ds-nav-menu-item__sub-nav > ds-nav-menu > .ds-nav-menu") as HTMLDivElement;
    if( subNav && subNavContent) {
      subNav.addEventListener("transitionend", this.removeTransition );
      subNav.style.height = `${subNavContent.offsetHeight}px`;
    }
  }
  
  hideSubNav(): void {
    const subNav = this.host.querySelector(".ds-nav-menu-item__sub-nav") as HTMLDivElement;
    subNav.style.height = `${subNav.offsetHeight}px`;
    subNav.addEventListener("transitionend", this.removeTransition );
    setTimeout( () => { subNav.style.height = "0"; }, 0);
  }

  toggleIsSelected() {
    const isSelected = !this.isActive;
    this.isActive = isSelected;
    this.dsMenuItemClick.emit({ isSelected });
    if( this.isAnimated ) {
      this.toggleSubNav(isSelected);
    }
  }

  itemClickHandler( event ) {
    const menuItem = event.target;
    const link = menuItem.getAttribute("href");

    if (!link || link === '/' || link === '' || link === '#') {
      event.preventDefault();
    }

    this.toggleIsSelected();
  }

  expandButtonClickHandler() {
    this.toggleIsSelected();
  }

  render() {
    return (
      <div
        class={{
          "ds-nav-menu-item": true,
          "--with-children": this.hasChildren,
          "--active": this.isActive,
          "--open": this.isOpened,
          [`--depth-${this.depth}`]: true,
          [`--${this.type}-${this.dsItemId}`]: true,
        }}
      >
        <div class="ds-nav-menu-item__link">
          <slot />
        </div>
        {this.hasChildren && (
          <div class="ds-nav-menu-item__expand-button">
            <ds-button
              ds-mods="menu-item"
              onClick={this.itemClickHandler}
            />
          </div>
        )}
        <div class="ds-nav-menu-item__sub-nav">
          <slot name="children" />
        </div>
      </div>
    );
  }
}