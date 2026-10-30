import { Component, Element, Event, EventEmitter, h, Host, Listen, Method, Prop, State, Watch } from "@stencil/core";
import throttle from "../../../typescript/throttle";

@Component({
  tag: "ds-modal",
  styleUrls: [
    "modal.scss",
  ]
})
export class DSModal {

  @Element() container: HTMLDsModalElement;

  @Prop({ mutable: true, reflect: true }) shown = false;
  @Prop() overlay = false;
  @Prop({ mutable: true }) lightboxClass: any = { "--dialog": true };
  @Prop() lightboxClassObject: any;

  @State() isReady = false;

  @Event() modalClose: EventEmitter;
  @Event() modalOpen: EventEmitter;

  @Watch("lightboxClass")
  lightboxClassWatcher() {
    this.refreshCSSClasses();
  }

  @Watch("shown")
  shownWatchHandler() {
    const body = document.querySelector("body");
    if (this.shown) {
      body.classList.add("ds-js--modal-open");
      this.modalInit();
    } else {
      this.modalCloseHandler();
      this.isReady = false;
    }

    this[`modal${this.shown ? "Open" : "Close"}`].emit();
  }

  @Listen("request_toggleModal_event")
  request_toggleModal_eventHandler(event) {
    const { show } = event.details;
    this.toggle(show);
  }

  @Listen("request_showModal_event")
  request_showModal_eventHandler() {
    this.toggle(true);
  }

  @Listen("request_hideModal_event")
  request_hideModal_eventHandler() {
    this.toggle(false);
  }

  @Method()
  async setContent(content: string) {
    this.container.querySelector(".ds-modal__content").innerHTML = content;
  }

  constructor() {
    this.refreshCSSClasses();

    this.modalMouseDownHandler = this.modalMouseDownHandler.bind(this);
    this.modalMouseUpHandler = this.modalMouseUpHandler.bind(this);
  }

  disconnectedCallback() {
    this.modalCloseHandler();
  }

  private refreshCSSClasses(): void {
    this.lightboxClassObject = typeof this.lightboxClass === "string"
      ? JSON.parse(this.lightboxClass)
      : this.lightboxClass;
  }

  /**
   * Toggle modal display
   *
   * @param {boolean} mustShow: Wether to show or hide modal
   */
  toggle(mustShow: boolean): void {
    this.shown = mustShow;
  }

  /**
   * Request modal show
   */
  show(): void {
    this.toggle(true);
  }

  /**
   * Request modal hide
   */
  hide(): void {
    if (this.modalClose) {
      this.modalClose.emit();
    } else {
      this.toggle(false);
    }
  }

  /**
   * Initialize modal
   */
  modalInit(): void {
    if (!this.isReady) {
        document.addEventListener(
          "keyup",
          this.documentKeyDownHandler
        );
      this.isReady = true;
    }
  }

  documentKeyDownHandler = throttle(
    e => {
      e = e || window.event;
      let isEscape = false;
      if ("key" in e) {
        isEscape = e.key === "Escape" || e.key === "Esc";
      } else {
        isEscape = e.keyCode === 27;
      }
      if (isEscape) {
        this.hide();
      }
    },
    500,
    true,
    false
  );

  modalCloseHandler(): void {

    const body = document.querySelector("body");

    body.classList.remove("ds-js--modal-open");
    body.style.overflow = "visible";

    document.removeEventListener(
      "keyup",
      this.documentKeyDownHandler
    );

  }

  modalMouseDownHandler(event: MouseEvent): void {
    if (
      !(event.target as HTMLDivElement).closest(".ds-modal")
    ) {
      this.hide();
    }
  }

  modalMouseUpHandler(event: MouseEvent): void {
    event.preventDefault();
  }

  render() {
    return (
      <Host class={{
          "ds-lightbox": true,
          "--overlay": this.overlay,
          ...this.lightboxClassObject
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
