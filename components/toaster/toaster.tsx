import { Component, h, Method, State, Host, Event, EventEmitter } from "@stencil/core";
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

  @Event() toasterShow: EventEmitter;
  @Event() toasterShown: EventEmitter;
  @Event() toasterHide: EventEmitter;
  @Event() toasterHidden: EventEmitter;

  @Method()
  async displayToast(params) {
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
      this.show();
      if (this.closingDelay !== 0) {
        setTimeout(() => {
          this.hide();
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
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  @Method()
  async show() {
    this.toasterShow.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = true;
  }
  
  @Method()
  async hide() {
    this.toasterHide.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = false;
  }

  //#region HANDLERS

  animationEndHandler() {
    this.container.removeEventListener("transitionend", this.animationEndHandler);
    this[ `toaster${this.isShown ? 'Shown' : 'Hidden'}` ].emit();
  }  

  //#endregion

  render() {
    return (
      <Host>
        {this.isShown && (
          <div
            class={{
              "ds-toaster": true,
              [`ds-toaster--position-vertical-${this.position[0]}`]: true,
              [`ds-toaster--position-horizontal-${this.position[1]}`]: true,
              ...this.toasterClass
            }}
            ref={el => {
              this.container = el as HTMLDivElement;
            }}
            onClick={this.hide}
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
                          onClick={this.hide}>
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
