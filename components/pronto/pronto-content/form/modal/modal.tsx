import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch } from "@stencil/core";
import throttle from "../../../../../typescript/throttle";
import CssClassList from "../../../../types/css-class-list.interface";
import _ds from "../../../../../typescript/dot-stash";

@Component({
  tag: "pronto-modal",
  styleUrls: [
    "modal.scss",
  ]
})
export class ProntoModal {

  @Element() container: HTMLDsModalElement;

  @Prop() overlay = false;
  @Prop() name: string;
  @Prop() associatedRoute: string;
  @Prop() type: string;
  @Prop() value: any;
  @Prop({ reflect: true }) mods: string | string[] = [];

  CSSClassList: CssClassList;
  
	@Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList(
      `ds-${this.type}`,
      _ds.props.toArray(mods)
    );
  }

  @State() isReady = false;

  @Event() modalClose: EventEmitter;
  @Event() modalOpen: EventEmitter;

  constructor() {
    this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);
    this.modalMouseDownHandler = this.modalMouseDownHandler.bind(this);
    this.modalMouseUpHandler = this.modalMouseUpHandler.bind(this);
  }

  connectedCallback() {
    document.addEventListener(
      "keyup",
      this.documentKeyDownHandler
    );
  this.isReady = true;
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList(
      `pronto-modal`,
      _ds.props.toArray(this.mods)
    );
  }

  disconnectedCallback() {
    const body = document.querySelector("body");

    body.classList.remove("ds-js--modal-open");
    body.style.overflow = "visible";

    document.removeEventListener(
      "keyup",
      this.documentKeyDownHandler
    );
  }

  /**
   * Request modal hide
   */
  hide(): void {
    this.modalClose.emit();
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

  modalMouseDownHandler(event: MouseEvent): void {
    if ( !(event.target as HTMLDivElement).closest(".pronto-modal") ) {
      this.hide();
    }
  }

  modalMouseUpHandler(event: MouseEvent): void {
    event.preventDefault();
  }

  closeButtonClickHandler(): void {
    this.modalClose.emit();
  }

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          "--overlay": this.overlay,
        }}
        onMouseDown={this.modalMouseDownHandler}
        onMouseUp={this.modalMouseUpHandler}
      >
        <div class="pronto-modal__container">
          <div class="pronto-modal__body">
            <div class="pronto-modal__content">
              <slot />
              {/* {this.type === "html" && (
                <ds-html-editor onCancel={this.closeButtonClickHandler} content={this.value} />
              )}
              {this.type === "image" && (
                <ds-cms-image filemanager-url={this.associatedRoute} name={this.name} />
              )}
              {this.type === "video" && (
                <ds-cms-video filemanager-url={this.associatedRoute} name={this.name} />
              )} */}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
