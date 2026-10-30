import { Component, h, Element, Host, Prop, State } from '@stencil/core';
import _ds from '../../utils/dot-stash';

/**
 * A simple component to load ajax content
 * Version: 1.0
 */

@Component({
  tag: 'ds-ajax',
})
export class DSAjax {
  @Element() hostContainer: HTMLElement;

  //#region PROPS

  url: string;

  /**
   * Event that will trigger the loading of the ajax content
   */
  @Prop({ reflect: true }) on: 'load' | 'click';

  /**
   * Where to display the content, can be the component itself
   * or an element specified by a css selector
   */
  @Prop({ reflect: true }) target: 'self' | string = 'self';

  /**
   * If the url can be crawled by search bots, one should pass
   * an additional query param to tell server to render url in
   * "ajax mode"
   */
  @Prop({ reflect: true }) suffix: string = '';

  @State() isLoading: boolean = false;

  //#endregion

  //#region LYFECYCLES

  constructor() {
    this.eventHandler = this.eventHandler.bind(this);
  }

  componentDidLoad() {
    const link = this.hostContainer.querySelector('a');

    if (link) {
      this.url = link.getAttribute('href');

      if (this.on === 'load') {
        this.eventHandler();
      } else {
        this.hostContainer.addEventListener(this.on, this.eventHandler);
      }
    } else {
      console.log('[ Error ] DSLink - no anchor found');
    }
  }

  //#endregion

  //#region HANDLERS

  async eventHandler(event?: Event) {
    event?.preventDefault();

    if (this.target === 'self') {
      this.isLoading = true;

      const queryParam = this.url.indexOf('?') > -1 ? '&' : '?' + this.suffix;
      const markup = await _ds.ajax.get(this.url + queryParam);
      const content = new DOMParser().parseFromString(markup, 'text/html');

      this.hostContainer.innerHTML = content.querySelector('.ds-ajax-content').innerHTML;
      this.isLoading = false;
    }
  }

  //#endregion

  //#region RENDER

  render() {
    return (
      <Host
        class={{
          'ds-ajax': true,
          '--is-loading': this.isLoading,
        }}
      >
        <slot />
      </Host>
    );
  }

  //#endregion
}
