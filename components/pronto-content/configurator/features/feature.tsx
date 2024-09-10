import { Component, EventEmitter, h, Host, Prop, Watch } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';
import { Event } from '@stencil/core';
import { FeatureFormConfig, MainFeatureFormConfig } from '../types';

@Component({
  tag: 'ds-feature-configurator',
})
export class DSFeatureConfigurator {
  
  @Prop({ mutable: true }) settings: any;
  @Prop() featureId: string;

  @Prop({ mutable: true }) isMain: boolean;

  fields: any[];
  formSize: 'sm' | 'md' | 'lg' = "md";

  @Watch("settings")
  settingsChangeHandler(newSettings) {
    this.processFields(newSettings);
  }

  @Event() featureChange: EventEmitter;
  @Event() requestDeleteFeature: EventEmitter;
  
  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
    this.deleteButtonClickHandler = this.deleteButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.processFields(this.settings);
  }

  processFields(settings) {
    const fields = (this.isMain ? MainFeatureFormConfig : FeatureFormConfig).map( ({ name, label, type, positions }) => ({
      label,
      name,
      type,
      defaultValue: settings[name],
      positions
    }));

    this.fields = fields;
  }

  valueChangeHandler(event: CustomEvent) {
    event.stopPropagation();
    event.preventDefault();

    const { detail: { name, value }} = event;
    this.featureChange.emit({id: this.featureId, name, value});
  }

  deleteButtonClickHandler() {
    this.requestDeleteFeature.emit({ id: this.featureId });
  }

  render() {
    return (
      <Host class={{
        "--is-main": this.isMain
      }}>

        <pronto-form size={this.formSize} fields={this.fields} onValueChange={this.valueChangeHandler}>
          <header slot="title">
            <h2>
              {"Feature"}
            </h2>
            <ds-trigger type="button" mods="xs, stl-1" onClick={this.deleteButtonClickHandler} slot="title">
              Supprimer
            </ds-trigger>
          </header>
        </pronto-form>
      </Host>
    );
  }
}