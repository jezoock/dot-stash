import { Component, Element, Event, EventEmitter, forceUpdate, h, Host, Listen, Method, Prop, Watch } from '@stencil/core';
import { focusFirstElement, getFocusedElement, getTabbableElements } from '../../utils/focus';

/** The body class set while at least one modal is shown; the structural stylesheet locks the page scroll with it. */
const MODAL_OPEN_CLASS = 'ds-js--modal-open';

/** The shown modals of the document, in the order they were shown: the last one is on top, it has the keyboard. */
const shownModals: DSModal[] = [];

/** Numbers the modals, for the ids of their title and description. */
let modalCount = 0;

/**
 * A modal dialog in a lightbox (WAI-ARIA dialog pattern), shown while `shown` is set: a `role="dialog"` element with
 * `aria-modal="true"`, named by its `slot="title"` element (`aria-labelledby`) or by `label` (`aria-label`), and described by
 * its `slot="description"` element (`aria-describedby`). Shown, it moves the focus into the dialog (its first element
 * with `autofocus`, else its first focusable element, else the dialog itself), keeps Tab and Shift+Tab in it, closes on
 * Escape and on a mouse down outside the dialog, and gives the focus back, when it is hidden, to the element that had it.
 * While at least one modal of the document is shown, the body has the `ds-js--modal-open` class, which locks the page
 * scroll (`overflow: hidden`, no inline style): the class is removed when the last shown modal is hidden or removed from
 * the document.
 *
 * @slot - The content of the dialog.
 * @slot title - The title of the dialog (a heading), which names it: `aria-labelledby` (an id is given to it if it has none).
 * @slot description - A text that describes the dialog: `aria-describedby` (an id is given to it if it has none).
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
  /** The accessible name of the dialog (`aria-label`), for a dialog without a `slot="title"` element. */
  @Prop() label: string;

  /** Whether the modal applies its open state: its body class, its keyboard and focus listeners. Not rendered. */
  isActive = false;

  /** The element that had the focus when the modal was shown: it gets it back when the modal is hidden. */
  private returnFocusElement: HTMLElement | null = null;
  /** Whether the focus must move into the dialog once it is rendered shown. */
  private needsFocus = false;
  private hasLoaded = false;
  private readonly idPrefix = `ds-modal-${++modalCount}`;
  private titleId: string;
  private descriptionId: string;

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
      // Put back in the document: no render would move the focus into it.
      if (this.hasLoaded) {
        forceUpdate(this);
      }
    }
  }

  componentWillRender() {
    this.titleId = this.idOf('title');
    this.descriptionId = this.idOf('description');
  }

  componentDidLoad() {
    this.hasLoaded = true;
    this.focusDialog();
  }

  componentDidUpdate() {
    this.focusDialog();
  }

  disconnectedCallback() {
    this.modalCloseHandler();
  }

  private refreshCSSClasses(): void {
    this.lightboxClassObject = typeof this.lightboxClass === 'string' ? JSON.parse(this.lightboxClass) : this.lightboxClass;
  }

  /** The dialog element (`role="dialog"`), once rendered. */
  private dialog: HTMLElement | null = null;

  /** The id of the modal's own element of a slot (not one of a modal in its content), given one if it has none. */
  private idOf(slot: 'title' | 'description'): string | undefined {
    const element = Array.from(this.container.querySelectorAll(`[slot="${slot}"]`)).find(other => other.closest('ds-modal') === this.container);

    if (!element) {
      return undefined;
    }

    if (!element.id) {
      element.id = `${this.idPrefix}-${slot}`;
    }

    return element.id;
  }

  /** Whether the modal is the shown modal on top, the one that handles the keyboard and keeps the focus. */
  private isOnTop(): boolean {
    return this.isActive && shownModals[shownModals.length - 1] === this;
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
   * Applies the open state: the body class, the keyboard and focus listeners, and the focus, which moves into the dialog
   * once it is rendered.
   */
  modalInit(): void {
    document.body.classList.add(MODAL_OPEN_CLASS);
    if (!this.isActive) {
      this.isActive = true;
      shownModals.push(this);
      document.addEventListener('keydown', this.documentKeyDownHandler);
      document.addEventListener('focusin', this.documentFocusInHandler);

      const focused = getFocusedElement();
      this.returnFocusElement = focused && !this.container.contains(focused) ? focused : null;
      this.needsFocus = true;
    }
  }

  /** Moves the focus into the dialog, once, after it is shown and rendered. */
  private focusDialog(): void {
    const dialog = this.dialog;

    if (this.needsFocus && this.isActive && dialog) {
      this.needsFocus = false;
      focusFirstElement(dialog, dialog);
    }
  }

  /** Escape, when the focus is not in a modal (the keydown handler of the dialog takes it otherwise). */
  documentKeyDownHandler = (event: KeyboardEvent) => {
    if (this.isOnTop() && this.isEscape(event) && !event.repeat) {
      this.hide();
    }
  };

  /** The focus moved out of the modal on top (a click outside, a script): it comes back into it. */
  documentFocusInHandler = (event: FocusEvent) => {
    const dialog = this.dialog;

    if (this.isOnTop() && dialog && !dialog.contains(event.target as Node)) {
      focusFirstElement(dialog, dialog);
    }
  };

  private isEscape(event: KeyboardEvent): boolean {
    return event.key === 'Escape' || event.key === 'Esc';
  }

  /**
   * The keys pressed in the modal on top: Escape hides it (and goes no further: a sidebar or a modal under it stays open),
   * Tab and Shift+Tab go round its focusable elements.
   */
  modalKeyDownHandler = (event: KeyboardEvent) => {
    const dialog = this.dialog;

    if (!this.isOnTop() || !dialog) {
      return;
    }

    if (this.isEscape(event)) {
      event.stopPropagation();
      if (!event.repeat) {
        this.hide();
      }
    } else if (event.key === 'Tab') {
      const tabbables = getTabbableElements(dialog);
      const focused = getFocusedElement();
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];

      if (!first) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && (focused === first || focused === dialog || !dialog.contains(focused))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focused === last || !dialog.contains(focused))) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  /**
   * Removes the open state (modal hidden or removed from the document) and gives the focus back to the element that had
   * it when the modal was shown, if the focus is still in the modal (or nowhere). The body class stays while another
   * modal of the document is shown; the body's inline styles are never touched.
   */
  modalCloseHandler(): void {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    this.needsFocus = false;
    shownModals.splice(shownModals.indexOf(this), 1);
    document.removeEventListener('keydown', this.documentKeyDownHandler);
    document.removeEventListener('focusin', this.documentFocusInHandler);

    const isAnotherModalShown = Array.from(document.querySelectorAll('ds-modal')).some(modal => modal !== this.container && modal.shown);
    if (!isAnotherModalShown) {
      document.body.classList.remove(MODAL_OPEN_CLASS);
    }

    const focused = getFocusedElement();
    const returnFocusElement = this.returnFocusElement;
    this.returnFocusElement = null;
    if (returnFocusElement?.isConnected && (!focused || this.container.contains(focused))) {
      returnFocusElement.focus();
    }
  }

  modalMouseDownHandler(event: MouseEvent): void {
    const dialog = this.dialog;

    if (dialog && !dialog.contains(event.target as Node)) {
      // On the backdrop: no focus change from the mouse down, the focus goes back to where it was before the modal.
      event.preventDefault();
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
        onKeyDown={this.modalKeyDownHandler}
      >
        <div class="ds-lightbox__container">
          <div
            class="ds-modal"
            ref={element => {
              this.dialog = element;
            }}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            aria-labelledby={this.titleId}
            aria-label={this.titleId ? undefined : this.label}
            aria-describedby={this.descriptionId}
          >
            <slot name="title" />
            <slot name="description" />
            <div class="ds-modal__content">
              <slot />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
