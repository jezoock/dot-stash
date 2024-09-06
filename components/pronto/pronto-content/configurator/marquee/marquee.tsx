import { Component, h, Host, Prop, Event, EventEmitter } from '@stencil/core';
import _ds from '../../../../../typescript/dot-stash';

const MarqueeConfig = [
  {
    label: "Nom de l'élément",
    name: "name",
    type: "text",
  },
  {
    label: "Défilement",
    name: "type",
    type: "select",
    values: [
      { label: "Horizontal", value: "slide-rtl"},
      { label: "Vertical", value: "slide-btt"},
    ]
  },
  {
    label: "Vitesse de défilement",
    name: "speed",
    type: "number"
  },
  {
    label: "Contenu",
    name: "messages",
    type: "html",
  },
];

const emptyMarqueeConfig = {
  name: "",
  type: "",
  speed: 30,
  messages: ""
};

let globalMaqueeId = 0;

@Component({
  tag: 'ds-marquee-configurator',
})
export class DSMarqueeConfigurator {
  
  @Prop({ mutable: true }) inputId: string;
  @Prop({ mutable: true }) settings: any = emptyMarqueeConfig;

  config: any = {};

  fields: any[];
  markup: string = "";
  marqueeId: string = `marquee-${globalMaqueeId++}`;

  @Event() saveConfiguration: EventEmitter;
  
  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
    this.saveButtonClickHandler = this.saveButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.processFields(this.settings);
    this.config = this.settings;

    if(Boolean(this.inputId)) {
      this.marqueeId = this.inputId;
    }
  }

  processFields(settings) {
    const fields = MarqueeConfig.map( ({ name, label, type, values }) => ({
      label,
      name,
      type,
      defaultValue: settings[name],
      values
    }));

    this.fields = fields;
  }

  valueChangeHandler(event: CustomEvent) {
    event.stopPropagation();
    event.preventDefault();

    const { detail: { name, value }} = event;
    const { config } = this;

    this.config = {
      ...config, 
      [name]: value 
    };
  }

  saveButtonClickHandler() {
    const { name, speed, type, messages } = this.config;

    const markup = (`
      <ds-marquee id="${this.marqueeId}" speed="${speed}" transition="${type}">
        <div class="ds-marquee-message" id="${name}">
          ${messages}
        </div>
      </ds-marquee>
    `).replace(/\>[\r\n ]+\</g, "><")
    .replace(/(<.*?>)|\s+/g, (_, $1) => $1 || ' ');

    this.saveConfiguration.emit({
      config: JSON.stringify(this.config),
      markup
    });
  }

  render() {
    return (
      <Host>
        <pronto-form size="md" fields={this.fields} onValueChange={this.valueChangeHandler}>
          <h2 slot="title">
            {"Marquee configurator"}
          </h2>
          <ds-trigger type="button" mods="stl-1, xl" onClick={this.saveButtonClickHandler} slot="footer">
            <strong>Enregistrer</strong>
          </ds-trigger>
        </pronto-form>
      </Host>
    );
  }
}