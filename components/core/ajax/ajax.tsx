import { Component, h, Element, Host, Prop, State } from '@stencil/core';
import { get as ajaxGet } from '../../utils/ajax';

/**
 * A simple component to load ajax content: on `click` (default) or `load`, it requests the URL of its link
 * as text (HTML) and puts the content of the response's `.ds-ajax-content` element in the target.
 * Version: 1.0
 */

@Component({
  tag: 'ds-ajax',
  styleUrl: 'ajax.scss',
})
export class DSAjax {
  @Element() hostContainer: HTMLElement;

  //#region PROPS

  url: string;

  /**
   * Event that will trigger the loading of the ajax content: `click` (default) or `load`
   */
  @Prop({ reflect: true }) on: 'load' | 'click' = 'click';

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
      console.error('[ds-ajax] no anchor found');
    }
  }

  disconnectedCallback() {
    this.hostContainer.removeEventListener(this.on, this.eventHandler);
  }

  //#endregion

  //#region HANDLERS

  /** The URL to request: the link URL, plus the suffix query parameter when there is one. */
  getRequestUrl(): string {
    if (!this.suffix) {
      return this.url;
    }
    return `${this.url}${this.url.includes('?') ? '&' : '?'}${this.suffix}`;
  }

  async eventHandler(event?: Event) {
    event?.preventDefault();

    const targetElement = this.target === 'self' ? this.hostContainer : document.querySelector<HTMLElement>(this.target);

    if (!targetElement) {
      console.error(`[ds-ajax] no target element matches "${this.target}"`);
      return;
    }

    this.isLoading = true;

    try {
      const markup = await ajaxGet<string>(this.getRequestUrl(), undefined, { responseType: 'text' });
      const content = new DOMParser().parseFromString(markup, 'text/html').querySelector('.ds-ajax-content');

      if (content) {
        targetElement.innerHTML = content.innerHTML;

        if (targetElement === this.hostContainer) {
          // The link is replaced: stop intercepting the clicks on the loaded content.
          this.hostContainer.removeEventListener(this.on, this.eventHandler);
        }
      } else {
        console.error(`[ds-ajax] the response of ${this.url} has no .ds-ajax-content element`);
      }
    } catch (error) {
      console.error(`[ds-ajax] loading ${this.url} failed`, error);
    } finally {
      this.isLoading = false;
    }
  }

  //#endregion

  //#region RENDER

  // No <slot>: the content stays the light DOM children of the component, as written, and the loaded content
  // replaces them. With a <slot>, Stencil (4.41 and later) would hide, on the next render, the children
  // that the innerHTML of a load puts in place of the slotted ones.
  render() {
    return (
      <Host
        class={{
          'ds-ajax': true,
          '--is-loading': this.isLoading,
        }}
      />
    );
  }

  //#endregion
}
