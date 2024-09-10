import { Component, h, Host, Event, EventEmitter, Prop, Method } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

const ButtonConfig = [
  {
    label: "Label",
    name: "label",
    type: "text",
  },
  {
    label: "Lien",
    name: "link",
    type: "text",
  },
  {
    label: "Taille",
    name: "size",
    type: "select",
    values: [
      {label: "xs", value: "xs"},
      {label: "sm", value: "sm"},
      {label: "md", value: "md"},
      {label: "lg", value: "lg"},
      {label: "xl", value: "xl"},
    ]
  },
  {
    label: "Couleur",
    name: "color",
    type: "select",
    values: [
      {label: "Couleur 1", value: "stl-1"},
      {label: "Couleur 2", value: "stl-2"},
      {label: "Couleur 3", value: "stl-3"},
      {label: "Couleur 4", value: "stl-4"},
    ]
  },
  {
    label: "Arrondi",
    name: "rounded",
    type: "switch",
  },
];

const emptyButtonConfig = {
  label: "",
  link: "",
  size: "md",
  color: "stl-1",
  rounded: false
};

@Component({
  tag: 'ds-button-configurator'
})
export class ProntoButton {

  @Prop({ mutable: true }) inputId: string;
  @Prop({ mutable: true }) defaultValue: any;
  @Prop({ mutable: true }) value: any = emptyButtonConfig;

  fields: any[];
  config: any = {};

  @Event() valueChange: EventEmitter;

  @Method()
  async getConfig(extraProps) {
    let markup = '';
    const { size = "md", color = "stl-1", label, link, rounded, type = "button"} = this.value;
    
    if (!!link && !!label) {
      const mods = [
        size,
        color,
        ...(extraProps.mods ? _ds.props.toArray(extraProps.mods) : [])
      ];

      const props = _ds.props.toString({ 
        ...extraProps,
        type,
        mods, 
        rounded
      });

      markup = `
        <ds-trigger ${props}>
          <a href="${link}">
            ${label}
          </a>
        </ds-trigger>
      `
    }

    return {
      config: this.value,
      markup
    }
  }
  
  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
  }

  componentWillLoad() {
    console.log(this.value);
    if (this.value === "") {
      this.value = emptyButtonConfig;
    }
    this.processFields(this.value);
  }

  processFields(settings) {
    const fields = ButtonConfig.map( ({ name, label, type, values }) => ({
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
    const { value: config, inputId } = this;

    config[name] = value;
    this.value = config;
    this.valueChange.emit({name: inputId, value: config});
  }
  
  render() {
    return (
      <Host>
        <pronto-form size={"md"} fields={this.fields} onValueChange={this.valueChangeHandler} />
      </Host>
    );
  }
}