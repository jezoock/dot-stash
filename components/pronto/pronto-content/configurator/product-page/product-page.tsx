import { Component, h, Host, Element, Prop, State, Watch, Event, EventEmitter, Method } from '@stencil/core';
import _ds from '../../../../../typescript/dot-stash';
import { ProductPageConfig } from '../types';


@Component({
  tag: 'ds-product-page-configurator',
})
export class DsProductPageConfigurator {

  @Element() hostContainer: HTMLElement;

  @Prop({mutable: true, reflect: true }) defaultValue: string;
  @Prop({ mutable: true }) settings: string | any = {};

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

    const fields = ProductPageConfig.map( ({ name, label, type }) => ({
      label,
      name,
      type,
      defaultValue: config[name],
    }));

    this.setFields(fields);
  }

  @Event() configChange: EventEmitter;
  @Event() saveConfiguration: EventEmitter;
  @Event() preview: EventEmitter;

  @Method()
  async getConfig(extraProps?: Record<string, any>): Promise<{markup: string; config: Record<string, unknown>}> {
    const { config } = this;

    console.log(extraProps);

    let markup = '';
    const blockConfig = Object.entries(config);

    for (let i = 0; i < blockConfig.length; i++) {
      const [ field, value ]: [string, any] = blockConfig[i];
    /* blockConfig.forEach( async ([field, value]: [string, any]) => { */
      let componentMarkup = "";
      const { active } = value;

      if ( active ) {
        if (field === "product-details-1") {
          const { text } = value;
          const { markup: imageMarkup, config: { position: imagePosition } } = await this.getBlockImage(`.${field}`);

          let textMarkup = '';
          const hasText = Boolean(text);
          if (hasText) {
            textMarkup = `
              <div slot="description">
                ${text}
              </div>
            `;
          }

          const props = _ds.props.toString({
            mods: ["image-text", field],
            ['image-position']: imagePosition
          });

          const blockProps = _ds.props.toString({
            section: true,
            id: field,
            mods: ["content", "lg", field]
          })

          componentMarkup = `
            <ds-block ${blockProps}>
              ${(hasText || imageMarkup) && (`
                <ds-heading ${props}>
                  ${imageMarkup}
                  ${textMarkup}
                </ds-heading>
              `)}
            </ds-block>
          `;
          
        }
      }

      if (field === "product-details-2") {
        const { active, text } = value as any;

        if (active) {
          const { markup: imageMarkup, config: { position: imagePosition } } = await this.getBlockImage((`.${field}`));

          let textMarkup = '';
          const hasText = Boolean(text);

          if (hasText) {
            textMarkup = `
              <div slot="description">
                ${text}
              </div>
            `;
          }

          const blockProps = _ds.props.toString({
            section: true,
            id: field,
            mods: ["content", "lg", field]
          })

          const props = _ds.props.toString({
            mods: ["image-text", field],
            ['image-position']: imagePosition
          });

          componentMarkup = `
            <ds-block ${blockProps}>
              ${(hasText) && (`
                <ds-heading ${props}>
                  ${imageMarkup}
                  ${textMarkup}
                </ds-heading>
              `)}
            </ds-block>
          `;
        }
      }

      if (field === "product-details-3") {
        const { active, text } = value as any;

        if (active) {
          const { markup: imageMarkup, config: { position: imagePosition } } = await this.getBlockImage((`.${field}`));

          let textMarkup = '';
          const hasText = Boolean(text);

          if (hasText) {
            textMarkup = `
              <div slot="description">
                ${text}
              </div>
            `;
          }

          const blockProps = _ds.props.toString({
            section: true,
            id: field,
            mods: ["content", "lg", field]
          })

          const props = _ds.props.toString({
            mods: ["image-text", field],
            ['image-position']: imagePosition
          });

          componentMarkup = `
            <ds-block ${blockProps}>
              ${(hasText) && (`
                <ds-heading ${props}>
                  ${imageMarkup}
                  ${textMarkup}
                </ds-heading>
              `)}
            </ds-block>
          `;
        }
      }

      if (field === "product-details-4") {
        const { active, text } = value as any;

        if (active) {
          const { markup: imageMarkup, config: { position: imagePosition } } = await this.getBlockImage((`.${field}`));

          let textMarkup = '';
          const hasText = Boolean(text);

          if (hasText) {
            textMarkup = `
              <div slot="description">
                ${text}
              </div>
            `;
          }

          const blockProps = _ds.props.toString({
            section: true,
            id: field,
            mods: ["content", "lg", field]
          })

          const props = _ds.props.toString({
            mods: ["image-text", field],
            ['image-position']: imagePosition
          });

          componentMarkup = `
            <ds-block ${blockProps}>
              ${(hasText) && (`
                <ds-heading ${props}>
                  ${imageMarkup}
                  ${textMarkup}
                </ds-heading>
              `)}
            </ds-block>
          `;
        }
      }

      if (field === "product-usage") {
        const { active, title, elements = [] } = value as any;

        if (active && elements.length > 0) {
          const blockMods = ["content", "lg", "feature-list", "with-slider", field];
          let titleMarkup = '';

          const hasTitle = Boolean(title);
          const hasChildren = Boolean(elements?.length > 0);

          if (hasTitle) {
            titleMarkup = `
              <ds-title section sup slot="header">
                ${title}
              </ds-title>
            `;
          }

          componentMarkup = `
            <ds-block section id="${field}" mods="${blockMods.join(',')}">
              ${titleMarkup}
              ${hasChildren && (`
                <ds-slider params='{ "isActive": false }' data-use-rsp data-rsp='{ "xxs": { "params": { "isActive": true } },  "md": { "params": { "isActive": false } } }'>
                  ${(await Promise.all( elements.map( async ({ id, title, description }) => `
                    <ds-slider-item>
                      <ds-heading mods="feature, usage">
                        ${title}
                        ${(await this.getBlockImage((`[feature-id=${id}]`))).markup}
                        <div slot="description">${description}</div>
                      </ds-heading>
                    </ds-slider-item>
                  `))).join('')}
                </ds-slider>
              `)}
            </ds-block>
          `;
        }
      }

      if (field === "product-features") {
        const { active, title, elements } = value as any;

        if (active) {
          const mods = ["image-text", field];
          const blockMods = ["content", "lg", field];
          let titleMarkup = '';

          const hasChildren = Boolean(elements?.length > 0);
          const hasTitle = Boolean(title);
          const { markup: imageMarkup, config: { position: imagePosition } } = await this.getBlockImage(`.${field}`);

          if (hasTitle) {
            titleMarkup = title;
          }

          componentMarkup = `
            <ds-block section id="${field}" mods="${blockMods.join(',')}">
              <ds-heading mods="${mods.join(',')}" image-position="${imagePosition}">
                ${imageMarkup}
                ${titleMarkup}
                ${hasChildren && (`
                  <ds-panel-group slot="description" type="collapsible" solo-content>
                    ${(await Promise.all( elements.map( async ({ title, content, id }) => `
                      <ds-panel type="collapsible" image="${(await this.getBlockImage(`[panel-id=${id}]`)).config.path[0]}">
                        <ds-title block mods="panel, feature" slot="title">${title}</ds-title>
                        ${content}
                      </ds-panel>
                    `))).join("")}
                  </ds-panel-group>
                `)}
              </ds-heading>
            </ds-block>
          `;
        }
      }

      if (field === "product-faq") {
        const { active, title, elements } = value as any;

        if (active) {
          const blockMods = ["content", "lg", field];
          const mods = ["image-text", field];
          let titleMarkup = '';

          const hasChildren = Boolean(elements?.length > 0);
          const hasTitle = Boolean(title);
          const { markup: imageMarkup, config: { position: imagePosition } } = await this.getBlockImage(`.${field}`);

          if (hasTitle) {
            titleMarkup = title;
          }

          componentMarkup = `
            <ds-block section id="${field}" mods="${blockMods.join(',')}">
              <ds-heading mods="${mods.join(',')}" image-position="${imagePosition}">
                ${imageMarkup}
                ${titleMarkup}
                ${hasChildren && (`
                  <ds-panel-group slot="description" type="collapsible" solo-content>
                    ${elements.map( ({ title, content }) => `
                      <ds-panel type="collapsible">
                        <ds-title block mods="panel, feature" slot="title">${title}</ds-title>
                        ${content}
                      </ds-panel>
                    `).join("")}
                  </ds-panel-group>
                `)}
              </ds-heading>
            </ds-block>
          `;
        }
      }

      if (field === "product-video") {
        const { active, video: { path: video } } = value as any;

        if (active && Boolean(video)) {
          const blockMods = ["content", "full-width", field];

          componentMarkup = `
            <ds-block section id="${field}" mods="${blockMods.join(',')}">
              <ds-video sources="${video}" autoplay loop playsinline />
            </ds-block>
          `;
        }
      }

      /* if( field === "product-details-1" ) console.log(componentMarkup); */
      markup += componentMarkup;
    }
   /*  }); */

    return {
      markup,
      config
    }
  }

  async getBlockImage(fieldSelector: string) {
    const imageAttributes = { slot: "image" };
    const mediaConfiguratorTag = this.hostContainer.querySelector(`${fieldSelector} ds-media[name='image']`) as HTMLDsMediaElement;
    
    return await mediaConfiguratorTag.getConfig(imageAttributes);
  }

  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
  }

  componentWillLoad() {
    this.config = _ds.props.fromJSON(this.settings);
    const fields = ProductPageConfig.map( ({ name, label, type }) => ({
        label,
        name,
        type,
        defaultValue: this.settings[name],
    }));

    this.fields = fields;
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
      <Host class="ds-component-configurator">
        <pronto-form size={"xl"} fields={this.fields} onValueChange={this.valueChangeHandler}>
          <h2 slot="title">
            {"Product page configurator"}
          </h2>
        </pronto-form>
      </Host>
    );
  }
}