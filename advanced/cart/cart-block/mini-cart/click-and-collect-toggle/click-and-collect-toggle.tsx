import { Component, Prop, Event, EventEmitter, h, Listen } from "@stencil/core";
import { DS_eventDispatch, DS_getDataCy, DS_isMobile, DS_setTranslations } from "../../../../../../../utils";
import { TooltipPosition } from "../../../../../../ui/tooltip/tooltip-position.enum";
import Translations from "./translations";
import componentName from "./component-name";
import { PageName } from "../../../../../../../enums/page-name.enum";

@Component({
  tag: 'ds-click-and-collect-toggle',
  styleUrl: './click-and-collect-toggle.scss'
})
export class ClickAndCollectToggle {
  @Prop() isTakeawayAvailable: boolean;
  @Prop() cartId: string;
  @Prop() reducibleAmount: string;
  @Prop() reduciblePercentage: number;

  @Event() request_switchToClickAndCollect_event: EventEmitter;

  @Listen('notify_updateDeliveryModeOutcome_event')
  notify_updateDeliveryModeOutcome_eventHandler({ detail: { success } }: { detail: { success: boolean } }) {
    const toasterPosition = DS_isMobile() ? "top" : "bottom";
    const toasterSettings = {
      innerJSX: <span>{this.translations[`deliveryModeUpdate${success ? 'Success' : 'Failure'}`]}</span>,
      closingDelay: 4000,
      type: success ? 'valid' : 'warning',
      posiion: [toasterPosition, 'right']
    };

    DS_eventDispatch('body', 'toaster_show_event', toasterSettings);
  }

  private translations = DS_setTranslations(Translations, componentName);

  constructor() {
    this.hereButtonClickHandler = this.hereButtonClickHandler.bind(this);
  }

  private hereButtonClickHandler() {
    this.request_switchToClickAndCollect_event.emit({ id: this.cartId });
  }

  private buildClickAndCollectPrompt() {
    return (
      <span class={`${componentName}__switch-prompt`}>
        {this.translations.switchPromptFirstPart.replace('%percentage%', this.reduciblePercentage)}
        <button
          onClick={this.hereButtonClickHandler}
          data-cy={DS_getDataCy({
            pageName: PageName.CART,
            elementName: 'click-n-collect-toggle'
          })}
          class={`${componentName}__switch-link`}
        >
          {this.translations.hereWord}
        </button>
        {this.translations.switchPromptSecondPart.replace('%percentage%', this.reduciblePercentage)}
      </span>
    );
  }

  render() {

    return (
      <ds-two-columns class={componentName}>
        <div
          slot="first-column-content"
          class={`${componentName}__icon-container`}
        >

          <ds-tooltip
            icon="info"
            position={TooltipPosition.TOP_LEFT}
            class={`${componentName}__info-icon`}
          >
            <div slot="message">
              {this.translations.switchToClickNCollectTooltip.replace('%percentage%', this.reduciblePercentage)}
            </div>
          </ds-tooltip>

        </div>
        <div
          slot="second-column-content"
          class={`${componentName}__prompt-container`}
        >
          {this.buildClickAndCollectPrompt()}
          {Boolean(+this.reducibleAmount) && (
            <span class={`${componentName}__reducible-amount`}>
              -{this.reducibleAmount}
            </span>
          )}
        </div>
      </ds-two-columns>
    );
  }
}
