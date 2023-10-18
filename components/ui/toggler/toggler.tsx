import { Component, Element, h, Prop } from "@stencil/core";
import { AnyHTMLElement } from "@stencil/core/internal";

@Component({
  tag: "ds-toggler",
  styleUrl: "toggler.scss"
})
export class DSToggler {

  @Element() container: AnyHTMLElement;

  @Prop({ mutable: true }) items: any[] = [];
  @Prop({ attribute: 'active', reflect: true }) isActive = true;
  @Prop({ attribute: 'toggler-mods', reflect: true }) togglerMods = "";

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
      <div
        class={{
          "ds-toggler": true,
          [`--${this.togglerMods}`]: this.togglerMods && this.togglerMods !== ''
        }}
      >
        {this.items?.length > 0 && (
          this.items.map(item => {
            return (
              <ds-toggler-item titleContent={item.title}>
                {item.content}
              </ds-toggler-item>
            );
          })
        )}
        <slot/>
      </div>
    );
  }
}
