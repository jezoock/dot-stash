import { Component, h, State, Listen, Host, Event, EventEmitter } from "@stencil/core";
@Component({
  tag: "ds-toaster",
  styleUrl: "toaster.scss"
})

export class DSToaster {

  container: HTMLDivElement = null;

  @State() isShown = false;
  @State() isButtonDisabled: boolean;
  @State() message: string;
  @State() innerJSX: any;
  @State() buttonText: string;
  @State() closingDelay: number;
  @State() toasterClass: any;
  @State() position: string[];
  @State() type: string;

  @Event() notify_toasterShow_event: EventEmitter;
  @Event() notify_toasterHide_event: EventEmitter;

  @Listen("toaster_show_event", { target: "body" })
  toaster_show_eventHandler(event) {
    const { detail: params } = event;
    this.setToDefaults();
    const {
      message,
      closingDelay,
      disableButton,
      buttonText,
      toasterClass,
      position,
      type,
      innerJSX
    } = params;

    if (message) {
      this.message = message;
    }
    if (disableButton) {
      this.isButtonDisabled = disableButton;
    }
    if (typeof closingDelay !== "undefined") {
      this.closingDelay = closingDelay;
      if (this.closingDelay === 0 && this.isButtonDisabled) {
        this.closingDelay = 4000;
      }
    }
    if (buttonText) {
      this.buttonText = buttonText;
    }
    if (toasterClass) {
      this.toasterClass = toasterClass;
    }
    if (position) {
      this.position = position;
    }
    if (type) {
      this.type = type;
    }
    if (innerJSX) {
      this.innerJSX = innerJSX;
    }

    setTimeout(() => {
      this.open();
      if (this.closingDelay !== 0) {
        setTimeout(() => {
          this.close();
        }, this.closingDelay);
      }
    }, 10);
  }

  private setToDefaults(): void {
    this.message = "";
    this.closingDelay = 4000;
    this.isButtonDisabled = false;
    this.buttonText = "OK";
    this.toasterClass = {};
    this.position = ["bottom", "right"];
    this.type = "info";
    this.innerJSX = null;
  }

  constructor() {
    this.setToDefaults();
    this.close = this.close.bind(this);
  }

  /**
   * Display toaster
   */
  open(): void {
    this.isShown = true;
    this.notify_toasterShow_event.emit();
  }

  /**
   * Hide toaster
   */
  close(): void {
    this.isShown = false;
    this.notify_toasterHide_event.emit();
  }

  render() {
    const positionClasses = {};
    positionClasses[
      `ds-toaster--position-vertical-${this.position[0]}`
    ] = true;
    positionClasses[
      `ds-toaster--position-horizontal-${this.position[1]}`
    ] = true;

    return (
      <Host>
        {this.isShown && (
          <div
            class={{
              "ds-toaster": true,
              ...positionClasses,
              ...this.toasterClass
            }}
            ref={el => {
              this.container = el as HTMLDivElement;
            }}
            onClick={this.close}
          >
            <div class={`ds-toaster__container ds-toaster__container--${this.type}`}>
              {this.innerJSX ? (
                <div class="ds-toaster__content">
                  {this.innerJSX}
                </div>
              ) : (
                  <div class="ds-toaster__content">
                    <span
                      class={`ds-toaster__message ds-toaster__message--${this.type}`}>
                      {this.message}
                    </span>
                    {!this.isButtonDisabled && (
                      <div class="ds-toaster__action">
                        <button
                          class="ds-toaster__close-button"
                          onClick={this.close}>
                          {this.buttonText || "OK"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        )}
      </Host>
    );
  }
}
