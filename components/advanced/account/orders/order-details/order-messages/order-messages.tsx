import { Component, h, Prop, State } from "@stencil/core";
import { translations } from "./translations";
import dayjs from "dayjs";
import { TransAddTranslations } from "../../../../../../_redux/actions/localization";
import { AddMessageOrderAction } from "../../../../../../_redux/actions/orders";
import { Store, Action } from "@stencil/redux";


@Component({
  tag: "ds-order-messages",
  styleUrl: "order-messages.scss"
})
export class DSOrderMessages {
  @Prop({ mutable: true, reflect: true }) messages: any[];
  @Prop({ context: "store" }) store: Store;
  @Prop({ mutable: true }) status: any;
  @Prop({ mutable: true }) orderId: any;
  @State() settings: any;
  @State() user: any;
  @State() translations: any;
  @State() newMessage: any;

  TransAddTranslations: Action;
  AddMessageOrderAction: Action;

  constructor() { }

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        app: { settings },
        localization: translations,
        user: { user }
      } = state;
      return {
        settings: settings,
        translations: translations,
        user: user
      };
    });

    this.store.mapDispatchToProps(this, {
      TransAddTranslations,
      AddMessageOrderAction
    });
    if (this.translations) {
      if (this.translations.gbx_orderMessages === undefined) {
        this.TransAddTranslations(translations[this.settings.locale]);
      }
    }
  }

  addMessage() {
    this.AddMessageOrderAction(this.orderId, this.user.token, this.newMessage);
  }

  handleInputMessage(evt) {
    this.newMessage = evt.target.value;
  }

  render() {
    return (
      <div class="ds-order-messages">
        <h2>{this.translations.gbx_orderMessages.title}</h2>
        {this.messages && this.messages.map(message => {
          return (
            <div
              class={{
                "ds-order-message": true,
                "--checked": message.isChecked,
                [`--${message.sender}`]: true,
              }}
            >
              <span>{dayjs(message.createdAt).format("DD/MM/YYYY HH:mm")}</span>
              <div>{message.content}</div>
            </div>
          );
        })}
        {(!this.messages || this.messages.length == 0) &&
          <span>{this.translations.gbx_orderMessages.noMessage}</span>
        }
        {["new", "new_pending", "new_flagged", "consulting"].indexOf(this.status) >= 0 && (
          <div class="ds-order-messages__add-message-container">
            <input class="ds-order-messages__add-message-input" onChange={(evt) => { this.handleInputMessage(evt) }} />
            <button class="ds-order-messages__add-message-button" onClick={() => { this.addMessage() }}></button>
          </div>
        )}
      </div>
    );
  }
}
