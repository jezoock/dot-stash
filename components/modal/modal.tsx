import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch } from "@stencil/core";
import Fragment from "stencil-fragment";
import throttle from "../../typescript/throttle";

@Component({
  tag: "gbx-modal",
  styleUrls: [
    "modal.scss",
  ]
})
export class DSModal {

  @Element() container: HTMLGbxModalElement;

  @Prop({ mutable: true, reflect: true }) shown = false;
  @Prop() overlay = false;
  @Prop() redirectToSmoodOnClose = false;
  @Prop() isHeaderDisabled = false;
  @Prop() isSubtitleDisabled = false;
  @Prop() isFooterDisabled = false;
  @Prop() isLayoutDisabled = false;
  @Prop({ mutable: true }) isClosingDisabled = false;
  @Prop({ mutable: true }) lightboxClass: any = { "--dialog": true };
  @Prop() lightboxClassObject: any;
  @Prop() useSnack = false;
  @Prop() darkBackground = false;
  @Prop({mutable: true, reflect: true}) closeButtonMods: string[] = ["modal-close"];

  @State() isReady = false;

  @Event() gbxModalClose: EventEmitter;
  @Event() gbxModalOpen: EventEmitter;

  @Watch("lightboxClass")
  lightboxClassWatcher() {
    this.refreshCSSClasses();
  }

  @Watch("shown")
  shownWatchHandler() {
    const body = document.querySelector("body");
    if (this.shown) {
      body.classList.add("gbx-js--modal-open");
      this.modalInit();
    } else {
      this.modalCloseHandler();
      this.isReady = false;
    }

    this[`gbxModal${this.shown ? "Open" : "Close"}`].emit();
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

  constructor() {
    this.refreshCSSClasses();

    this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);
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
    if (this.redirectToSmoodOnClose) {
      window.location.href = window.location.origin;
    }

    if (this.gbxModalClose) {
      this.gbxModalClose.emit();
    } else {
      this.toggle(false);
    }
  }

  /**
   * Initialize modal
   */
  modalInit(): void {
    if (!this.isReady) {
      if (!this.isClosingDisabled) {
        document.addEventListener(
          "keyup",
          this.documentKeyDownHandler
        );
      }
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

    body.classList.remove("gbx-js--modal-open");
    body.style.overflow = "visible";

    document.removeEventListener(
      "keyup",
      this.documentKeyDownHandler
    );

  }

  modalMouseDownHandler(event: MouseEvent): void {
    if (
      !this.isClosingDisabled &&
      !(event.target as HTMLDivElement).closest(".gbx-modal")
    ) {
      this.hide();
    }
  }

  modalMouseUpHandler(event: MouseEvent): void {
    event.preventDefault();
  }

  closeButtonClickHandler(): void {
    this.hide();
  }

  render() {
    return (
      <Host>
        {this.shown && (
          <div
            class={{
              "gbx-lightbox": true,
              "--no-layout": this.isLayoutDisabled,
              "--overlay": this.overlay,
              "--dark-overlay": !this.overlay && this.darkBackground,
              ...this.lightboxClassObject
            }}
            onMouseDown={this.modalMouseDownHandler}
            onMouseUp={this.modalMouseUpHandler}
          >
            <div class="gbx-lightbox__container">
              <div class="gbx-modal">
                {this.isLayoutDisabled ? (
                  <div class="gbx-modal__content">
                    <slot name="content" />
                  </div>
                ) : (
                  <Fragment>
                    {!this.isHeaderDisabled && (
                      <header class="gbx-modal__header">
                        <div class="gbx-modal__title">
                          <slot name="title" />
                        </div>

                        {!this.isSubtitleDisabled && (
                          <div class="gbx-modal__sub-title">
                            <slot name="subTitle" />
                          </div>
                        )}

                        {!this.isClosingDisabled && (
                          <gbx-button
                            buttonType="button"
                            useSnack={this.useSnack}
                            buttonMods={this.closeButtonMods}
                            onGbxButtonClick={this.closeButtonClickHandler}
                          />
                        )}
                      </header>
                    )}
                    <div class="gbx-modal__content">
                      <slot />
                      <slot name="content" />
                    </div>
                    {!this.isFooterDisabled && (
                      <footer class="gbx-modal__footer">
                        <slot name="footer" />
                      </footer>
                    )}
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
