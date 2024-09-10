import { Component, h, Prop, State } from "@stencil/core";
import { translations } from "./translations";

import { TransAddTranslations } from "../../../../../../_redux/actions/localization";
import { Store, Action } from "@stencil/redux";

@Component({
  tag: "ds-order-step",
  styleUrl: "order-step.scss"
})
export class DSOrderStep {
  @Prop({ mutable: true }) status: string;
  @Prop() takeaway: any;
  @State() currentStep = 0;
  @State() steps: any[];

  @Prop({ context: "store" }) store: Store;
  @State() settings: any;
  @State() translations: any;

  TransAddTranslations: Action;

  constructor() {

  }

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        app: { settings },
        localization: translations
      } = state;
      return {
        settings: settings,
        translations: translations
      };
    });

    this.store.mapDispatchToProps(this, {
      TransAddTranslations
    });
    if (this.translations) {
      if (this.translations.ds_orderSteps === undefined) {
        this.TransAddTranslations(translations[this.settings.locale]);
      }
    }
  }

  componentDidLoad() {

    this.currentStep =
      this.status === "new" || this.status === "new_flagged"
        ? 1
        : this.status === "making" || this.status === "ready" || this.status === "picked"
          ? 2
          : this.status === "delivering"
            ? 3
            : this.status === "complete"
              ? 4
              : 0;
    const steps = [];

    if (this.status === "canceled" || this.status === "deleted") {
      steps.push({
        active: true,
        label: this.translations.ds_orderSteps.newOrder
      });
      steps.push({
        active: true,
        label: this.translations.ds_orderSteps.cancelOrder
      });
    } else if (!this.takeaway) {
      steps.push({
        active: true,
        label: this.translations.ds_orderSteps.newOrder
      });
      steps.push({
        active: this.currentStep > 1,
        label: this.translations.ds_orderSteps.makingOrder
      });
      steps.push({
        active: this.currentStep > 2,
        label: this.translations.ds_orderSteps.deliveringOrder
      });
      steps.push({
        active: this.currentStep > 3,
        label: this.translations.ds_orderSteps.completeOrder
      });
    } else {
      steps.push({
        active: true,
        label: this.translations.ds_orderSteps.newOrder
      });
      steps.push({
        active: this.currentStep > 1,
        label: this.translations.ds_orderSteps.makingOrder
      });
      steps.push({
        active: this.currentStep > 2,
        label: this.translations.ds_orderSteps.completeTakeaway
      });
    }

    this.steps = steps;
  }

  render() {
    return (
      this.steps &&
      <ul class={"ds-step-list ds-step-list--steps-" + this.steps.length}>
        {this.steps.length > 0 &&
          this.steps.map(step => {
            return (
              <li class={"ds-step" + (step.active ? " ds-step--active" : "")}>
                <span>{step.label}</span>
              </li>
            );
          })}
      </ul>
    );
  }
}
