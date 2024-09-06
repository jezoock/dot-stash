import { Component, EventEmitter, h, Host, Prop, Watch } from '@stencil/core';
import _ds from '../../../../../typescript/dot-stash';
import { Event } from '@stencil/core';
import { PanelFormConfig } from '../types';

@Component({
  tag: 'ds-panel-configurator',
})
export class DSPanelConfigurator {
  
  @Prop({ mutable: true }) settings: any;
  @Prop() panelId: string;

  @Prop({ mutable: true }) isMain: boolean;

  fields: any[];
  formSize: 'sm' | 'md' | 'lg' = "md";

  @Watch("settings")
  settingsChangeHandler(newSettings) {
    this.processFields(newSettings);
  }

  @Event() panelChange: EventEmitter;
  @Event() requestDeletePanel: EventEmitter;
  
  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
    this.deleteButtonClickHandler = this.deleteButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.processFields(this.settings);
  }

  processFields(settings) {
    const fields = PanelFormConfig.map( ({ name, label, type }) => ({
      label,
      name,
      type,
      defaultValue: settings[name],
    }));

    this.fields = fields;
  }

  valueChangeHandler(event: CustomEvent) {
    event.stopPropagation();
    event.preventDefault();

    const { detail: { name, value }} = event;
    this.panelChange.emit({id: this.panelId, name, value});
  }

  deleteButtonClickHandler() {
    this.requestDeletePanel.emit({ id: this.panelId });
  }

  render() {
    return (
      <Host>
        <pronto-form size={this.formSize} fields={this.fields} onValueChange={this.valueChangeHandler}>
          <ds-trigger type="button" mods="xs, stl-1" onClick={this.deleteButtonClickHandler} slot="title">
            Supprimer
          </ds-trigger>
        </pronto-form>
      </Host>
    );
  }
}