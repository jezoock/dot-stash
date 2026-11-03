import { Component, Element, Event, EventEmitter, h, Host, Listen, Method, Prop, Watch } from '@stencil/core';
import throttle from '../../utils/throttle';

/** The body class set while at least one modal is shown; the structural stylesheet locks the page scroll with it. */
const MODAL_OPEN_CLASS = 'ds-js--modal-open';

/**
 * A modal dialog in a lightbox, shown while `shown` is set. While at least one modal of the document is shown,
 * the body has the `ds-js--modal-open` class, which locks the page scroll (`overflow: hidden`, no inline style):
 * the class is removed when the last shown modal is hidden or removed from the document.
 */
@Component({
  tag: 'ds-modal',
  styleUrls: ['modal.scss'],
})
export class DSModal {
  @Element() container: HTMLDsModalElement;

  @Prop({ mutable: true, reflect: true }) shown = false;
  @Prop() overlay = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stencil derives the attribute handling from the prop type; a precise type would change it
  @Prop({ mutable: true }) lightboxClass: any = { '--dialog': true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stencil derives the attribute handling from the prop type; a precise type would change it
  @Prop() lightboxClassObject: any;

  /** Whether the modal applies its open state: its body class and its Escape listener. Not rendered. */
  isActive = false;

  @Event() modalClose: EventEmitter;
  @Event() modalOpen: EventEmitter;

  @Watch('lightboxClass')
  lightboxClassWatcher() {
    this.refreshCSSClasses();
  }

  @Watch('shown')
  shownWatchHandler() {
    if (this.shown) {
      this.modalInit();
    } else {
      this.modalCloseHandler();
    }

    this[`modal${this.shown ? 'Open' : 'Close'}`].emit();
  }

  /** `detail.show` (boolean) shows or hides the modal; without it, the event toggles it. */
  @Listen('request_toggleModal_event')
  request_toggleModal_eventHandler(event: CustomEvent<{ show?: boolean } | undefined>) {
    const show = event.detail?.show;
    this.toggle(typeof show === 'boolean' ? show : !this.shown);
  }

  @Listen('request_showModal_event')
  request_showModal_eventHandler() {
    this.toggle(true);
  }

  @Listen('request_hideModal_event')
  request_hideModal_eventHandler() {
    this.toggle(false);
  }

  @Method()
  async setContent(content: string) {
    this.container.querySelector('.ds-modal__content').innerHTML = content;
  }

  constructor() {
    this.refreshCSSClasses();

    this.modalMouseDownHandler = this.modalMouseDownHandler.bind(this);
    this.modalMouseUpHandler = this.modalMouseUpHandler.bind(this);
  }

  connectedCallback() {
    // The shown watcher does not run for the initial value: a modal rendered open, or put back in the document
    // while shown, is set up here (no modalOpen event).
    if (this.shown) {
      this.modalInit();
    }
  }

  disconnectedCallback() {
    this.modalCloseHandler();
  }

  private refreshCSSClasses(): void {
    this.lightboxClassObject = typeof this.lightboxClass === 'string' ? JSON.parse(this.lightboxClass) : this.lightboxClass;
  }

  /**
   * Shows or hides the modal. The `shown` watcher emits `modalOpen` or `modalClose`, once per change.
   *
   * @param {boolean} mustShow: Wether to show or hide modal
   */
  toggle(mustShow: boolean): void {
    this.shown = mustShow;
  }

  /**
   * Shows the modal.
   */
  show(): void {
    this.toggle(true);
  }

  /**
   * Hides the modal (Escape key, mouse down outside the dialog).
   */
  hide(): void {
    this.toggle(false);
  }

  /**
   * Applies the open state: the body class and the Escape listener.
   */
  modalInit(): void {
    document.body.classList.add(MODAL_OPEN_CLASS);
    if (!this.isActive) {
      document.addEventListener('keyup', this.documentKeyDownHandler);
      this.isActive = true;
    }
  }

  documentKeyDownHandler = throttle(
    e => {
      e = e || window.event;
      const isEscape = 'key' in e ? e.key === 'Escape' || e.key === 'Esc' : e.keyCode === 27;
      if (isEscape) {
        this.hide();
      }
    },
    500,
    true,
    false,
  );

  /**
   * Removes the open state (modal hidden or removed from the document). The body class stays while another modal
   * of the document is shown; the body's inline styles are never touched.
   */
  modalCloseHandler(): void {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    document.removeEventListener('keyup', this.documentKeyDownHandler);

    const isAnotherModalShown = Array.from(document.querySelectorAll('ds-modal')).some(modal => modal !== this.container && modal.shown);
    if (!isAnotherModalShown) {
      document.body.classList.remove(MODAL_OPEN_CLASS);
    }
  }

  modalMouseDownHandler(event: MouseEvent): void {
    if (!(event.target as HTMLDivElement).closest('.ds-modal')) {
      this.hide();
    }
  }

  modalMouseUpHandler(event: MouseEvent): void {
    event.preventDefault();
  }

  render() {
    return (
      <Host
        class={{
          'ds-lightbox': true,
          '--overlay': this.overlay,
          ...this.lightboxClassObject,
        }}
        onMouseDown={this.modalMouseDownHandler}
        onMouseUp={this.modalMouseUpHandler}
      >
        <div class="ds-lightbox__container">
          <div class="ds-modal">
            <div class="ds-modal__content">
              <slot />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
