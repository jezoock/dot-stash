import { Component, h, Host, Element, Prop, State, Watch, Event, EventEmitter } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';
import { ProductsBlockConfig } from '../types';

/* let globalProductsBlockId = 0; */

@Component({
  tag: 'ds-products-configurator',
})
export class DSProductsConfigurator {

  @Element() hostContainer: HTMLElement;

  @Prop({mutable: true, reflect: true }) defaultValue: string;
  @Prop({ mutable: true }) settings: string | any = {};
  @Prop({ mutable: true }) associatedRoute: string;

  @State() config: any = {};
  @State() value: string;
  @State() fields: any[];

  componentId: string;
  saveData: any;
  markup: string = "";

  @Watch("settings")
  settingsChangeHandler(newSettings) {
    const config = _ds.props.fromJSON(newSettings);
    this.config = config;

    const fields = ProductsBlockConfig.map( ({ name, label, type }) => ({
      label,
      name,
      type,
      defaultValue: type === "products" ? [] : config[name] || '',
      associatedRoute: this.associatedRoute
    }));

    this.setFields(fields);
  }

  @Event() configChange: EventEmitter;

  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
  }

  componentWillLoad() {
    this.config = _ds.props.fromJSON(this.settings);
    const fields = ProductsBlockConfig.map( ({ name, label, type }) => ({
        label,
        name,
        type,
        defaultValue: this.settings[name],
        associatedRoute: this.associatedRoute
    }));

    this.fields = fields;
  }

  generateMarkup() {
    const config = JSON.stringify({...this.config});
    let markup = "";
    
    Object.entries(this.config).map( ([field, value]) => {
      let componentMarkup = "";

      console.log(field, value);

      markup += componentMarkup;
      
    });

    return {
      markup: markup.replace(/\>[\r\n ]+\</g, "><").replace(/(<.*?>)|\s+/g, (_, $1) => $1 || ' '),
      config,
    }
  }

  setFields(fields) {
    this.fields = fields;
  }

  valueChangeHandler(event: CustomEvent) {
    const { detail: { name, value }} = event;
    const { config } = this;
    config[name] = value;
    this.config = config;
    this.configChange.emit({config});
  }

  render() {
    return (
      <Host>
        <pronto-form size={"xl"} fields={this.fields} onValueChange={this.valueChangeHandler}>
          <h2 slot="title">{"Products configurator"}</h2>
        </pronto-form>
      </Host>
    );
  }
}