import { Component, Element, h, Host, Prop } from "@stencil/core";
import { AnyHTMLElement } from "@stencil/core/internal";

@Component({
  tag: "ds-panel-group",
  styleUrl: "panel-group.scss"
})
export class DSPanelGroup {

  @Element() container: AnyHTMLElement;

  items: any[] = [];
  @Prop({ attribute: 'active', reflect: true }) isActive = true;
  @Prop({ reflect: true }) mods = "";

  componentDidLoad() {
    if (!this.isActive) {
      const items = this.container.querySelectorAll("ds-toggler-item");
      const contents = this.container.querySelectorAll(".ds-toggler-item__content") as NodeListOf<HTMLDivElement>;
      if (items?.length > 0) {
        items.forEach((item: any, index: number) => {
          item.expanded = true;
          if (contents[index]) {
            contents[index].style.height = "auto";
          }
        });
      }
    }
  }

  render() {
    return (
      <Host
        class={{
          "ds-panel-group": true,
          [`--${this.mods}`]: this.mods && this.mods !== ''
        }}
      >
        <slot/>
      </Host>
    );
  }
}
