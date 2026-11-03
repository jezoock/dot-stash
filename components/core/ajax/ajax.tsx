import { Component, h, Element, Event, EventEmitter, Host, Prop, State } from '@stencil/core';
import { get as ajaxGet } from '../../utils/ajax';
import { getFocusedElement } from '../../utils/focus';

/**
 * A simple component to load ajax content: on `click` (default) or `load`, it requests the URL of its link
 * as text (HTML) and puts the content of the response's `.ds-ajax-content` element in the target.
 * While it loads, the target is `aria-busy="true"`. Loaded in the component itself (the link is replaced), the content
 * takes the focus when the link had it; loaded in another target after a click, the target is a polite live region, which
 * screen readers read. A failed load shows `error-message` in an alert (`role="alert"`) after the link, and emits
 * `ajaxError`; a load emits `ajaxLoaded`.
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

  /**
   * The message shown (and announced: `role="alert"`) after the link when the content could not be loaded. Empty: no
   * message (listen to `ajaxError`).
   */
  @Prop() errorMessage: string = 'The content could not be loaded.';

  @State() isLoading: boolean = false;

  /** The error message shown after a failed load, removed by the next one. */
  private errorElement: HTMLElement | null = null;

  //#endregion

  //#region EVENTS

  /** Emitted once the content is in the target (`detail.target`, `detail.url`). */
  @Event() ajaxLoaded: EventEmitter<{ target: HTMLElement; url: string }>;
  /** Emitted when the content could not be loaded (`detail.url`, `detail.error`). */
  @Event() ajaxError: EventEmitter<{ url: string; error: unknown }>;

  //#endregion

  //#region LYFECYCLES

  constructor() {
    this.eventHandler = this.eventHandler.bind(this);
  }

  componentWillLoad() {
    const link = this.hostContainer.querySelector('a');

    if (link) {
      this.url = link.getAttribute('href');

      // Before the first render: it renders the loading state at once (a state change in componentDidLoad would render
      // the component again).
      if (this.on === 'load') {
        this.eventHandler();
      }
    } else {
      console.error('[ds-ajax] no anchor found');
    }
  }

  componentDidLoad() {
    if (this.url && this.on !== 'load') {
      this.hostContainer.addEventListener(this.on, this.eventHandler);
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

    // One load at a time: the link is under the loading overlay, but the keyboard still reaches it.
    if (this.isLoading) {
      return;
    }

    const targetElement = this.target === 'self' ? this.hostContainer : document.querySelector<HTMLElement>(this.target);

    if (!targetElement) {
      console.error(`[ds-ajax] no target element matches "${this.target}"`);
      return;
    }

    this.removeError();
    this.isLoading = true;
    targetElement.setAttribute('aria-busy', 'true');
    // Another target, after a click: a polite live region, read once the content is in (aria-busy removed).
    if (event && targetElement !== this.hostContainer && !targetElement.hasAttribute('aria-live')) {
      targetElement.setAttribute('aria-live', 'polite');
    }

    try {
      const markup = await ajaxGet<string>(this.getRequestUrl(), undefined, { responseType: 'text' });
      const content = new DOMParser().parseFromString(markup, 'text/html').querySelector('.ds-ajax-content');

      if (content) {
        const focused = getFocusedElement();
        const hadFocus = !!focused && targetElement.contains(focused);

        targetElement.innerHTML = content.innerHTML;

        if (targetElement === this.hostContainer) {
          // The link is replaced: stop intercepting the clicks on the loaded content.
          this.hostContainer.removeEventListener(this.on, this.eventHandler);
        }
        // The focus was in the replaced content (the link): it goes to the loaded content, rather than to the page.
        if (hadFocus) {
          if (!targetElement.hasAttribute('tabindex')) {
            targetElement.setAttribute('tabindex', '-1');
          }
          targetElement.focus({ preventScroll: true });
        }
        this.ajaxLoaded.emit({ target: targetElement, url: this.url });
      } else {
        console.error(`[ds-ajax] the response of ${this.url} has no .ds-ajax-content element`);
        this.showError(new Error('No .ds-ajax-content element'));
      }
    } catch (error) {
      console.error(`[ds-ajax] loading ${this.url} failed`, error);
      this.showError(error);
    } finally {
      this.isLoading = false;
      targetElement.removeAttribute('aria-busy');
    }
  }

  /** Shows `errorMessage` in an alert after the link (screen readers read it at once), and emits `ajaxError`. */
  showError(error: unknown) {
    if (this.errorMessage) {
      const message = document.createElement('p');
      message.className = 'ds-ajax__error ds-message --error';
      message.setAttribute('role', 'alert');
      message.textContent = this.errorMessage;
      this.hostContainer.appendChild(message);
      this.errorElement = message;
    }
    this.ajaxError.emit({ url: this.url, error });
  }

  removeError() {
    this.errorElement?.remove();
    this.errorElement = null;
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
