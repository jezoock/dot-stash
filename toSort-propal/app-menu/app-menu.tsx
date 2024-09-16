import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'ds-app-menu',
  styleUrl: 'app-menu.scss'
})
export class DSAppMenu {

  @State() isMenuOpen: boolean = false;

  constructor() {
   this.menuButtonPressHandler = this.menuButtonPressHandler.bind(this);
   this.menuCloseButtonPressHandler = this.menuCloseButtonPressHandler.bind(this);
  }

  componentDidLoad() { }

  togglemenuDisplay() {
    const isMenuOpen = !this.isMenuOpen;
    this.isMenuOpen = isMenuOpen;
  }

  menuButtonPressHandler() {
    this.togglemenuDisplay();
  }

  menuCloseButtonPressHandler() {
    this.togglemenuDisplay();
  }

  render() {
    return (
      <div
        class={{
          "ds-app-menu": true,
          "--opened": this.isMenuOpen,
          "--closed": !this.isMenuOpen
        }}
      >
        
        <ds-trigger
          type="button"
          class="ds-app-menu__mobile-menu-button"
          mods={['mobile-nav']}
          onClick={this.menuButtonPressHandler}
        />

        <div class="ds-app-menu__content">
          
          <ds-trigger
            type="button"
            class="ds-app-menu__mobile-menu-close-button"
            mods={['mobile-nav-close']}
            onClick={this.menuCloseButtonPressHandler}
          />
          
          <div class="ds-app-menu__primary-nav">
            <slot name="primaryNav" />
          </div>

        </div>

        <div class="ds-app-menu__secondary-nav">
          <slot name="secondaryNav" />
        </div>

      </div>
    );
  }
}