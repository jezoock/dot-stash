import { Component, h, Host, Element, Prop, Event, EventEmitter, Listen, State, Watch, Method } from '@stencil/core';
import { availableComponents, linkedIdAllowedPage, prestashopPageTypes } from './types';
import _ds from '../../typescript/dot-stash';

const componentTypeSettings = {
  "txt-img": {
    configurator: "ds-txt-img-configurator",
    modifiers: "image-text",
  },
  "product-page": {
    configurator: "ds-product-page-configurator",
    modifiers: "product-page",
  },
  "marquee": {
    configurator: "ds-marquee-configurator",
    modifiers: "marquee",
  },
  "features": {
    configurator: "ds-features-configurator",
    modifiers: "feature-list",
  },
  "block-builder": {
    configurator: "ds-block-builder",
    modifiers: "block-builder",
  },
  "products-block": {
    configurator: "ds-products-configurator",
    modifiers: "products-block",
  },
}

@Component({
  tag: 'pronto-content-admin',
  styleUrl: 'pronto-content-admin.scss'
})
export class ProntoContentAdmin {

  @Element() hostContainer: HTMLElement;
  
  @Prop({ mutable: true, reflect: true }) adminUrl: string;
  @Prop({ mutable: true, reflect: true }) filemanagerUrl: string;
  @Prop({ mutable: true, reflect: true }) tinymceApiKey: string;
  @Prop({ mutable: true, reflect: true }) controllerUrl: string;
  @Prop({ mutable: true, reflect: true }) blockTitle: string = '';
  @Prop({ mutable: true, reflect: true }) pageType: string = '';
  @Prop({ mutable: true, reflect: true }) hook: string = '';
  @Prop({ mutable: true, reflect: true }) componentType: string = '';
  @Prop({ mutable: true, reflect: true }) linkedId: string = '';
  @Prop({ mutable: true, reflect: true }) settings: any;
  @Prop({ mutable: true, reflect: true }) active: string | boolean;;
  @Prop({ mutable: true, reflect: true }) startDate: string;
  @Prop({ mutable: true, reflect: true }) endDate: string;
  @Prop({ mutable: true, reflect: true }) orderPosition: string;
  @Prop({ mutable: true, reflect: true }) modifiers: string;

  @Watch("settings")
  settingsHandler(newSettings: any) {
    this.config = _ds.props.fromJSON(newSettings);
  }
  
  @State() markup: any;
  @State() config: any;
  @State() showPreview: boolean;

  @Event() settingsChange: EventEmitter;
  @Event() saveConfiguration: EventEmitter;

  @Listen("configChange") 
  configChangeHandler(event: CustomEvent) {
    const { detail: { config }} = event;
    this.config = config;
  }

  @Method()
  async getConfig() {
    const { adminUrl, filemanagerUrl, controllerUrl, settings } = this;
    return { adminUrl, filemanagerUrl, controllerUrl, settings };
  }

  constructor() {
    this.pageTypeChangeHandler = this.pageTypeChangeHandler.bind(this);
    this.hookChangeHandler = this.hookChangeHandler.bind(this);
    this.componentTypeChangeHandler = this.componentTypeChangeHandler.bind(this);
    this.linkedIdChangeHandler = this.linkedIdChangeHandler.bind(this);
    this.positionChangeHandler = this.positionChangeHandler.bind(this);
    this.globalInfoChange = this.globalInfoChange.bind(this);
    this.importConfigButtonClickHandler = this.importConfigButtonClickHandler.bind(this);
    this.previewButtonClickHandler = this.previewButtonClickHandler.bind(this);
    this.modalCloseHandler = this.modalCloseHandler.bind(this);
    this.saveButtonClickHandler = this.saveButtonClickHandler.bind(this);
    this.backButtonClickHandler = this.backButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    if (this.settings) {
      this.config = _ds.props.fromJSON(this.settings);
    }
    window["fileManagerUrl"] = this.filemanagerUrl;
    window['tinymceApiKey'] = this.tinymceApiKey;
  }

  searchProductAutocompleteInit() {
    
  }

  settingChangeHandler() {
    const { hook, blockTitle: title, startDate, endDate, active, pageType, linkedId, componentType, modifiers } = this;

    this.settingsChange.emit({ 
      componentType, 
      pageType, 
      hook,
      title,
      startDate,
      endDate,
      active: active === '1',
      linkedId, 
      modifiers
    });
  }

  pageTypeChangeHandler(event: CustomEvent) {
    const { detail: { selectedOption: { value } } } = event;
    this.pageType = value;
    this.settingChangeHandler();
  }
  
  hookChangeHandler(event: CustomEvent) {
    const { detail: { selectedOption: { value } } } = event;
    this.hook = value;
    this.settingChangeHandler();
  }
  
  componentTypeChangeHandler(event: CustomEvent) {
    const { detail: { selectedOption: { value } } } = event;
    if (this.componentType !== value) {
      this.config = value === "features" ? [] : {};
    }
    this.componentType = value;
    this.settingChangeHandler();
  }

  linkedIdChangeHandler(event: Event) {
    const { target } = event;
    this.linkedId = (target as HTMLInputElement).value;
    this.settingChangeHandler();
  }

  getAvailableHooks() {
    const values = [];
    prestashopPageTypes.map(
      ({ value, hooks }) => this.pageType === value && (
        hooks.map( hook => values.push({label: hook, value: hook}) )
      )
    );
    return values;
  }

  positionChangeHandler(event: CustomEvent) {
    const { detail: { name, value } } = event;
    if (name === "componentType" && this.componentType !== value) {
      this.config = value === "features" ? [] : {};
    }
    this[name] = value;
    this.settingChangeHandler();
  }

  globalInfoChange(event: CustomEvent) {
    const { detail: { name, value } } = event;
    this[name] = typeof value === "boolean" ? value ? '1' : '0' : value ;
    this.settingChangeHandler();
  }

  importConfigButtonClickHandler() {
    const input = document.querySelector("input[name='import-config'") as HTMLInputElement;
    if (input) {
      this.settings = _ds.props.fromJSON(input.value);
    }
  }

  getConfigComponent(): HTMLDsTxtImgConfiguratorElement {
    return this.hostContainer.querySelector("#config-component");
  }

  async getConfigFromConfigurator(stringifyConfig: boolean) {
    const mods = [ 
      ..._ds.props.toArray(this.modifiers), 
      ..._ds.props.toArray(componentTypeSettings[this.componentType].modifiers)
    ];
    const configComponent = this.getConfigComponent();
    const { config: JSONConfig, markup } = await configComponent.getConfig({ mods });
    const config = stringifyConfig ? JSON.stringify(JSONConfig) : JSONConfig;
    
    return { config, markup };
  }

  async saveButtonClickHandler() {
    this.saveConfiguration.emit( await this.getConfigFromConfigurator(true) );
  }

  async previewButtonClickHandler() {
    const { markup } = await this.getConfigFromConfigurator(true);
    this.markup = _ds.tools.beautifyHTML(markup);
    console.log(this.config);
    this.showPreview = true;
  }
  
  modalCloseHandler() {
    this.showPreview = false;
  }

  backButtonClickHandler() {
    window.history.back();
  }

  render() {
    const positionFields: any[] = [
      {
        "defaultValue": this.pageType,
        "type": "select",
        "name": "pageType",
        "label": "Type de page",
        "values": prestashopPageTypes
      },
      {
        "defaultValue": this.hook,
        "type": "select",
        "name": "hook",
        "label": "Hook",
        "values": this.getAvailableHooks()
      },
      {
        "defaultValue": this.orderPosition,
        "type": "text",
        "name": "orderPosition",
        "label": "Ordre"
      },
    ];

    if (linkedIdAllowedPage.includes(this.pageType)) {
      const fieldParams: any = {
        "defaultValue": this.linkedId,
        "name": "linkedId",
        "label": "Elements associés :",
        "associatedRoute": this.controllerUrl
      }

      if (["global", "product"].includes(this.pageType)) {
        fieldParams.type = "product";
      };

      if (["cms"].includes(this.pageType)) {
        fieldParams.type = "cms";
      };

      positionFields.push(fieldParams);
    }

    const configComponentProps = {
       id: "config-component",
       settings: this.config || {},
       associatedRoute: this.controllerUrl
    }

    let ConfigComponentTag = '';
    if (this.componentType) {
      ({ configurator: ConfigComponentTag } = componentTypeSettings[ this.componentType ]);
    }

    return (

      <Host>

        <pronto-form
          onValueChange={this.globalInfoChange}
          size="md"
          fields={[
            {
              "defaultValue": this.active,
              "type": "switch",
              "name": "active",
              "label": "Activé ?"
            },
            {
              "defaultValue": this.blockTitle,
              "type": "text",
              "name": "title",
              "label": "Titre de l'élément"
            },
            {
              "defaultValue": this.startDate,
              "type": "date",
              "name": "startDate",
              "label": "Début de publication"
            },
            {
              "defaultValue": this.endDate,
              "type": "date",
              "name": "endDate",
              "label": "Fin de publication"
            },
          ]}
        >
          <h2 slot="title">{"Général"}</h2>
        </pronto-form>

        <pronto-form
          onValueChange={this.positionChangeHandler}
          size="md"
          fields={positionFields}
        >
          <h2 slot="title">{"Position de l'élément"}</h2>
        </pronto-form>

        <pronto-form
          size="md"
          onValueChange={this.positionChangeHandler}
          fields={[
            {
              "defaultValue": this.componentType,
              "type": "select",
              "name": "componentType",
              "label": "Type de composant",
              "values": availableComponents.map(({name,type}) => ({ label: name, value: type }))
            },
            {
              "defaultValue": this.modifiers,
              "type": "text",
              "name": "modifiers",
              "label": "Modifiers"
            }
          ]}
        >
          <h2 slot="title">{"Configuration du composant"}</h2>
        </pronto-form>

        <ds-block name="config">

          {this.componentType && (
            <ConfigComponentTag {...configComponentProps} />
          )}

          <menu slot="footer">
            <ds-trigger type="button" mods="md, stl-3" onClick={this.backButtonClickHandler}>
              Retour
            </ds-trigger>
            <ds-trigger type="button" mods="md, stl-1" onClick={this.saveButtonClickHandler}>
              Save
            </ds-trigger>
            <ds-trigger type="button" mods="md, stl-2" onClick={this.previewButtonClickHandler}>
              Preview
            </ds-trigger>
            {/* <input type="text" name="import-config" value="" />
            <ds-trigger onClick={this.importConfigButtonClickHandler} type="button" mods="md, rounded, stl-2">Importer</ds-trigger> */}
          </menu>

        </ds-block>


        {this.showPreview && (
          <pronto-modal overlay onModalClose={this.modalCloseHandler}>
            <ds-block section>
              <ds-title-bar slot="header">
                <ds-title section>Config preview</ds-title>
                <ds-trigger slot="after" onClick={this.modalCloseHandler}>
                  <ds-icon type="cancel" />
                </ds-trigger>
              </ds-title-bar>
              <ds-json data={this.config} />
                <code><pre>{this.markup}</pre></code>
            </ds-block>
          </pronto-modal>
        )}

      </Host>
    );
  }
}