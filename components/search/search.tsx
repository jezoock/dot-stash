import { Component, h, Host, Method, Prop, State, Element } from '@stencil/core';

@Component({
  tag: 'ds-search',
  styleUrl: 'search.scss'
})
export class DSSearch {
  
  @Element() container: HTMLDsSearchElement;

  @Prop() url: string;
  @Prop() value: string;
  @Prop() placeholder: string;

  @State() isCollapsed: boolean = false;

  @Method()
  async toggle( mustShow?: boolean ): Promise<void> {
    let isCollapsed = !this.isCollapsed;
    if (typeof mustShow === "boolean") {
      isCollapsed = mustShow;
    }
    this.isCollapsed = isCollapsed;
  }

  constructor() {
    this.iconClickHandler = this.iconClickHandler.bind(this);
    this.clearButtonClickHandler = this.clearButtonClickHandler.bind(this);
  }

  iconClickHandler() {
    this.toggle();
  }

  clearButtonClickHandler() {
    const form = this.container.querySelector('form');
    form.reset();
    this.toggle(false);
  }

  render() {
    return (
      <Host
        class={{
          "ds-search": true,
          "--is-collapsed": this.isCollapsed
        }}
      >

        <ds-trigger 
          class="ds-search__expand-button" 
          type="button" 
          onClick={this.iconClickHandler} 
        />

        <div class="ds-search__form">
          <form 
            name="searchbar-form" 
            id="searchbar-form" 
            method="get" 
            action={this.url}
          >
            <fieldset>
              <input 
                type="hidden" 
                name="controller" 
                value="search" 
              />
              
              <span class="ds-search__icon" />

              <input 
                type="text" 
                name="s" 
                value={this.value}
                placeholder={this.placeholder}
                class="ds-search__input"
              />

              <ds-trigger 
                type="button" 
                onClick={this.clearButtonClickHandler} 
                class="ds-search__clear-button"
              />
            </fieldset> 
          </form>
        </div>
        
      </Host>
    );
  }
}