import {
  Component,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  Method,
  Element
} from "@stencil/core";

@Component({
  tag: "ds-panel",
  styleUrl: "panel.scss"
})
export class DSPanel {
  @Element() container: HTMLElement;
  
  @Prop() minHeight = "0";
  @Prop({ mutable: true, reflect: true }) expanded = false;
  @Prop({ mutable: true, reflect: true }) type = "tab";

  @Event() notify_togglerCollapsed_event: EventEmitter;
  @Event() notify_togglerExpanded_event: EventEmitter;

  @Method()
  async show() {
    this.setExpanded(true);
  }

  @Method()
  async hide() {
    this.setExpanded(false);
  }

  @Method()
  async toggle(mustShow?: boolean) {
    this.setExpanded(mustShow);
  }

  constructor() {
    this.titleClickHandler = this.titleClickHandler.bind(this);
  }

  setExpanded(mustShow?: boolean) {
    const expanded = typeof mustShow === "boolean" ? mustShow : !this.expanded;
    this.expanded = expanded;
  }

  titleClickHandler() {
    this.setExpanded();
  }

  render() {
    return (
      <Host
        class={{
          "ds-panel": true,
          [`--${this.type}`]: true
        }}
      >
        <div
          class="ds-panel__title"
          onClick={this.titleClickHandler}
        >
          <slot name="title" />
        </div>
        <div class="ds-panel__content">
          <div
            class="ds-panel__content-wrapper"
            style={{ "min-height": this.minHeight }}
          >
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
