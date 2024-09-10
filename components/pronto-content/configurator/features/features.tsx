import { Component, Element, h, Host, Prop, State, Listen, Event, EventEmitter, Watch } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';
import { Media } from '../types';

interface FeatureConfig {
  id: string;
  title?: string;
  subTitle?: string;
  description?: string;
  image?: Media;
  isMain?: boolean;
}

const emptyMedia: Media = {
  path: ["", ""],
  type: "image",
  urlType: "local",
}

const emptyFeature = {
  title: "",
  subTitle: "",
  description: "",
  isMain: false,
  image: emptyMedia,
};

const emptyMainFeature = {
  ...emptyFeature,
  type: "",
}

let globalFeatureId = 0;

@Component({
  tag: 'ds-features-configurator',
  styleUrl: 'features.scss'
})
export class DSFeaturesConfigurator {
  
  @Element() hostContainer: HTMLDsFeatureConfiguratorElement;
  @Prop({ mutable: true, reflect: true }) settings: string | any = [];
  @Prop({ mutable: true }) name: string;
  @Prop({ mutable: true }) showActions: boolean = true;

  @State() config: FeatureConfig[] = [];
  @State() isPreviewMode: boolean = false;

  saveData: any;
  markup: string = "";

  @Event() saveConfiguration: EventEmitter;
  @Event() configChange: EventEmitter;

  @Watch("settings")
  settingsChangeHandler(newSettings) {
    this.config = [..._ds.props.fromJSON(newSettings)];
    
  }

  @Listen("featureChange")
  featureChangeHandler(event: CustomEvent) {
    const { detail: { id, name, value }} = event;
    const { config } = this;
    const index = config.findIndex( ({id: featureId}) => featureId === id );

    config[index][name] = value;
    this.config = config;
    this.configChange.emit({config, name: this.name });
  }

  constructor() {
    this.addFeatureButtonClickHandler = this.addFeatureButtonClickHandler.bind(this);
    this.saveFeaturesButtonClickHandler = this.saveFeaturesButtonClickHandler.bind(this);
    /* this.previewButtonClickHandler = this.previewButtonClickHandler.bind(this); */
    this.requestDeleteFeatureHandler = this.requestDeleteFeatureHandler.bind(this);
  }

  componentWillLoad() {
    this.config = _ds.props.fromJSON(this.settings || []);
    globalFeatureId += this.config.length;
    this.saveData = [...this.config];
  }

  addFeatureButtonClickHandler() {
    const { config } = this;
    this.config = [...config, { ...(config.length === 0 ? emptyMainFeature : emptyFeature), id: `feat-${globalFeatureId.toString()}` }];
    globalFeatureId++;
  }

  saveFeaturesButtonClickHandler() {
    let markup = "";

    this.config.map( block => {
      const { title, subTitle, description, image: { path: image, position: imagePosition, attributes }, isMain } = block;
      const mods = ["feature"];

      if (isMain) {
        mods.push("main");
      }

      let imageMarkup = "" ;
      if (image) {
        imageMarkup = `<img slot="image" src="${image}" alt="${attributes?.alt || ''}" title="${attributes?.title || ''}" />`;
      }

      let subTitleMarkup = '';
      if (subTitle) {
        subTitleMarkup = `<strong slot="sub-title">${subTitle}</strong>`;
      }

      let descriptionMarkup = '';
      if (description) {
        descriptionMarkup = `<div slot="description">${description}</div>`;
      }

      markup += (`
        <ds-heading mods="${mods.join(',')}" image-position="${imagePosition}">
          ${imageMarkup}
          ${title}
          ${subTitleMarkup}
          ${descriptionMarkup}
        </ds-heading>
      `)
    });

    markup = (`
      <ds-block mods="feature-list">
        ${markup}
      </ds-block>
    `).replace(/\>[\r\n ]+\</g, "><")
    .replace(/(<.*?>)|\s+/g, (_, $1) => $1 || ' ');

    this.saveConfiguration.emit({
      config: JSON.stringify(this.config),
      markup
    });
  }
/* 
  previewButtonClickHandler() {
    const { isPreviewMode } = this;
    this.isPreviewMode = !isPreviewMode;
  } */

  requestDeleteFeatureHandler({detail: { id: featureId }}) {
    const { config } = this;
    const newConfig = config.filter( ({id}) => featureId !== id );
    this.config = [...newConfig];
    this.configChange.emit({config: this.config, name: this.name });
  }

  render() {
    return (
      <Host>
        <ds-block section name="features-configurator" prefix="pronto">
          <h2 slot="header">{"Feature list configurator"}</h2>
        
          <div class="ds-features-configurator-section__form">

            {this.config.map( block => (
              <ds-feature-configurator 
                onRequestDeleteFeature={this.requestDeleteFeatureHandler}
                key={block.id} 
                feature-id={block.id} 
                settings={block} 
                isMain={block.isMain}
              />
            ) )}
            
            <div class="ds-features-configurator-section__add-button">
              <ds-trigger onClick={this.addFeatureButtonClickHandler}>
                <strong>Ajouter</strong>
              </ds-trigger>
            </div>

          </div>

          {this.showActions && (
            <menu class="ds-features-configurator-section__actions">
              <ds-trigger type="button" mods="md, stl-1" onClick={this.saveFeaturesButtonClickHandler}>
                Save
              </ds-trigger>
            </menu>
          )}

          {/* <div class={{
            "preview": true,
            "--is-shown": this.isPreviewMode
          }}>
            {this.config.map( block => {
              const { title, subTitle, description, isMain, image, imagePosition } = block;
              const headingProps: any = {
                mods: ["feature"]
              };
              if (image && imagePosition) {
                headingProps.mods.push(imagePosition);
              }

              if (isMain) {
                headingProps.mods.push("main");
              }

              return (
                <ds-heading {...headingProps}>
                  {image && (
                    <img src={image} alt={title} />
                  )}
                  <strong>{title}</strong>
                  {subTitle && (
                    <strong slot="sub-title">
                      {subTitle}
                    </strong>
                  )}
                  {description && (
                    <div slot="description">
                      {description}
                    </div>
                  )}
                </ds-heading>
              )
            })}
          </div>
          <div>
            {this.markup}
          </div> */}
        </ds-block>
      </Host>
    );
  }
}