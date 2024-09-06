import { Component, h, Element, Host, Event, Prop, State, EventEmitter, Watch, Method } from '@stencil/core';
import { ImageTextConfig } from '../types';
import _ds from '../../../../../typescript/dot-stash';

@Component({
  tag: 'ds-txt-img-configurator',
})
export class DSTxtImgConfigurator {

  @Element() hostContainer: HTMLElement;
  
  @Prop({mutable: true, reflect: true }) defaultValue: string = "";
  @Prop({ mutable: true }) settings: string | any = {};

  @State() config: any = {};
  @State() showPreview: boolean;

  componentId: string;
  fields: any[];
  saveData: any;
  markup: string = "";

  @Watch("settings")
  settingsChangeHandler(newSettings) {
    this.config = [..._ds.props.fromJSON(newSettings)];
  }

  @Event() configChange: EventEmitter;
  @Event() saveConfiguration: EventEmitter;

  @Method()
  async getConfig(extraProps: Record<string, unknown>): Promise<{ config: Record<string, unknown>, markup: string }> {
    const { config } = this;
    const { title, subTitle, description, mediaLink } = config;

    let titleMarkup = "";
    if (title) {
      titleMarkup = title;
    }

    const imageAttributes = { slot: "image" };
    const mediaConfiguratorTag = this.hostContainer.querySelector("ds-media[name='media']") as HTMLDsMediaElement;
    let { markup: mediaMarkup, config: { position: imagePosition } } = await mediaConfiguratorTag.getConfig(imageAttributes);

    const buttonConfiguratorTag = this.hostContainer.querySelector("ds-button-configurator[name='button']") as HTMLDsButtonConfiguratorElement;
    const { markup: buttonMarkup } = await buttonConfiguratorTag.getConfig({});

    let subTitleMarkup = '';
    if (subTitle) {
      subTitleMarkup = `<div slot="sub-title">${subTitle}</div>`;
    }
    
    let descriptionMarkup = '';
    if (description) {
      descriptionMarkup = description;
    }

    if(descriptionMarkup || buttonMarkup) {
      descriptionMarkup = `<div slot="description">${descriptionMarkup}${buttonMarkup}</div>`;
    }

    if (Boolean(mediaLink)) {
      mediaMarkup = `<a href="${mediaLink}" slot="image">${mediaMarkup.replace('slot="image"', "")}</a>`
    }

    const props = _ds.props.toString({
      ['image-position']: imagePosition,
      ...extraProps 
    });

    const markup = _ds.tools.cleanHTML(`
      <ds-heading ${props}>
        ${mediaMarkup}
        ${titleMarkup}
        ${subTitleMarkup}
        ${descriptionMarkup}
      </ds-heading>
    `);

    return {
      config,
      markup
    }
  }

  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
  }

  componentWillLoad() {
    const config = _ds.props.fromJSON(this.settings);
    /* Used for cleanup replace image by media in component config */
    if (config.image) {
      const { image: media } = config;
      delete config.image;
      config.media = media;
    }
    this.config = config;
    
    const fields = ImageTextConfig.map( ({ name, label, type, positions }) => {
      return ({
        label,
        name,
        type,
        defaultValue: this.settings[name] || '',
        positions
    })});

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
      <Host class="ds-component-configurator">
        <pronto-form size={"lg"} fields={this.fields} onValueChange={this.valueChangeHandler}>
          <h2 slot="title">
            {"Text with image configurator"}
          </h2>
        </pronto-form>
      </Host>
    );
  }
}