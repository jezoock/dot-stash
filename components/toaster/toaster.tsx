import { Component, h, State, Listen, Host, Event, EventEmitter } from "@stencil/core";
@Component({
  tag: "gbx-toaster",
  styleUrl: "toaster.scss"
})

export class DSToaster {

  container: HTMLDivElement = null;

  @State() isShown: boolean = false;
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
      `gbx-toaster--position-vertical-${this.position[0]}`
    ] = true;
    positionClasses[
      `gbx-toaster--position-horizontal-${this.position[1]}`
    ] = true;

    return (
      <Host>
        {this.isShown && (
          <div
            class={{
              "gbx-toaster": true,
              ...positionClasses,
              ...this.toasterClass
            }}
            ref={el => {
              this.container = el as HTMLDivElement;
            }}
            onClick={this.close}
          >
            <div class={`gbx-toaster__container gbx-toaster__container--${this.type}`}>
              {this.innerJSX ? (
                <div class="gbx-toaster__content">
                  {this.innerJSX}
                </div>
              ) : (
                  <div class="gbx-toaster__content">
                    <span
                      class={`gbx-toaster__message gbx-toaster__message--${this.type}`}>
                      {this.message}
                    </span>
                    {!this.isButtonDisabled && (
                      <div class="gbx-toaster__action">
                        <button
                          class="gbx-toaster__close-button"
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
