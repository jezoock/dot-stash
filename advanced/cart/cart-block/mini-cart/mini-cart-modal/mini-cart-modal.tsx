import { Component, h, Prop } from "@stencil/core";
import { PageName } from "../../../../../../../enums/page-name.enum";
import { TitleType } from "../../../../../../ui/title/title-type.enum";

@Component({
  tag: "ds-mini-cart-modal"
})
export class DSMiniCartModal {
  @Prop({ mutable: true }) modalTitle = '';
  @Prop({ mutable: true }) isClosingDisabled = false;
  @Prop({ mutable: true }) isHeaderDisabled = false;
  
  closeButtonMods: string[] = [  "cart-block", "close" ];

  render() {
    return (
      <ds-modal
        shown={true}
        closeButtonMods={[  "cart-modal", "close" ]}
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
          <ds-title
            slot="title"
            titleType={TitleType.TITLE2}
            mods={["block", "cart"]}
            heading={3}
            
            dataCy={{
              pageName: PageName.LOGIN,
              elementName: "cartBlockModalTitle",
            }}
          >
            {this.modalTitle}
          </ds-title>
        )}
        <slot name="content" />
      </ds-modal>
    )
  }
}
