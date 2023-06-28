import { Component, Element, h, Prop } from "@stencil/core";
import { AnyHTMLElement } from "@stencil/core/internal";

@Component({
  tag: "gbx-toggler",
  styleUrl: "toggler.scss"
})
export class DSToggler {

  @Element() container: AnyHTMLElement;

  @Prop({ mutable: true }) items: any[] = [];
  @Prop({ attribute: 'active', reflect: true }) isActive: boolean = true;
  @Prop({ attribute: 'toggler-mods', reflect: true }) togglerMods: string = "";

  constructor() { }

  componentDidLoad() {
    if (!this.isActive) {
      const items = this.container.querySelectorAll("gbx-toggler-item");
      const contents = this.container.querySelectorAll(".gbx-toggler-item__content") as NodeListOf<HTMLDivElement>;
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
          "gbx-toggler": true,
          [`--${this.togglerMods}`]: this.togglerMods && this.togglerMods !== ''
        }}
      >
        {this.items?.length > 0 && (
          this.items.map(item => {
            return (
              <gbx-toggler-item pageName="Grocery" titleContent={item.title}>
                {item.content}
              </gbx-toggler-item>
            );
          })
        )}
        <slot/>
      </div>
    );
  }
}
