import { Component, h, Prop } from "@stencil/core";
import { PageName } from "../../../../../../../enums/page-name.enum";
import { TitleType } from "../../../../../../ui/title/title-type.enum";

@Component({
  tag: "snk-mini-cart-modal"
})
export class SNKMiniCartModal {
  @Prop({ mutable: true }) modalTitle: string = '';
  @Prop({ mutable: true }) isClosingDisabled: boolean = false;
  @Prop({ mutable: true }) isHeaderDisabled: boolean = false;
  
  closeButtonMods: string[] = [ "snack", "cart-block", "close" ];

  render() {
    return (
      <gbx-modal
        shown={true}
        closeButtonMods={[ "snack", "cart-modal", "close" ]}
        isClosingDisabled={this.isClosingDisabled}
        isFooterDisabled={true}
        isHeaderDisabled={this.modalTitle === ''}
        isSubtitleDisabled={true}
        darkBackground={true}
        lightboxClassObject={{
          '--dialog': true,
          '--mini-cart': true
        }}
      >
        {this.modalTitle && (
          <gbx-title
            slot="title"
            titleType={TitleType.TITLE2}
            titleMods={["block", "cart"]}
            heading={3}
            useSnack={true}
            dataCy={{
              pageName: PageName.LOGIN,
              elementName: "cartBlockModalTitle",
            }}
          >
            {this.modalTitle}
          </gbx-title>
        )}
        <slot name="content" />
      </gbx-modal>
    )
  }
};
