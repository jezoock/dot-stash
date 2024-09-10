import { Component, Element, h, Host, Prop, State, Listen, Event, EventEmitter, Watch } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

interface PanelConfig {
  id: string;
  title?: string;
  content?: string;
  image?: string;
}

const emptyPanel = {
  title: "",
  content: "",
};

let globalPanelId = 0;

@Component({
  tag: 'ds-panels-configurator',
  styleUrl: 'panels.scss'
})
export class DSPanelsConfigurator {
  
  @Element() hostContainer: HTMLDsPanelsConfiguratorElement;
  @Prop({ mutable: true, reflect: true }) settings: string | any = [];
  @Prop({ mutable: true }) name: string;
  @Prop({ mutable: true }) showActions: boolean = true;

  @State() config: PanelConfig[] = [];
  @State() isPreviewMode: boolean = false;

  saveData: any;
  markup: string = "";

  @Event() saveConfiguration: EventEmitter;
  @Event() configChange: EventEmitter;

  @Watch("settings")
  settingsChangeHandler(newSettings) {
    this.config = [..._ds.props.fromJSON(newSettings)];
    
  }

  @Listen("panelChange")
  panelChangeHandler(event: CustomEvent) {
    const { detail: { id, name, value }} = event;
    const { config } = this;
    const index = config.findIndex( ({id: featureId}) => featureId === id );

    config[index][name] = value;
    this.config = config;
    this.configChange.emit({config, name: this.name });
  }

  constructor() {
    this.addPanelButtonClickHandler = this.addPanelButtonClickHandler.bind(this);
    this.savePanelsButtonClickHandler = this.savePanelsButtonClickHandler.bind(this);
    this.requestDeletePanelHandler = this.requestDeletePanelHandler.bind(this);
  }

  componentWillLoad() {
    this.config = _ds.props.fromJSON(this.settings || []);
    globalPanelId += this.config.length;
    this.saveData = [...this.config];
  }

  addPanelButtonClickHandler() {
    const { config } = this;
    globalPanelId++;
    console.log(this.config);
    this.config = [...config, { ...emptyPanel, id: `panel-${globalPanelId.toString()}` }];
  }

  savePanelsButtonClickHandler() {
    let markup = "";

    this.config.map( block => {
      const { title, content/* , image */ } = block;
      const mods = ["feature"];

      /* let imageMarkup = ''; */
      let contentMarkup = '';
      if (content) {
        contentMarkup = `<ds-text>${content}</ds-text>`;
      }
      
      markup += (`
        <ds-panel mods="${mods.join(',')}">
          <ds-text slot="title">${title}</ds-text>
          ${contentMarkup}
        </ds-panel>
      `)
    });

    markup = (`
      <ds-panel-group>
        ${markup}
      </ds-panel-group>
    `).replace(/\>[\r\n ]+\</g, "><")
    .replace(/(<.*?>)|\s+/g, (_, $1) => $1 || ' ');

    this.saveConfiguration.emit({
      config: JSON.stringify(this.config),
      markup
    });
  }

  requestDeletePanelHandler({detail: { id: featureId }}) {
    const { config } = this;
    const newConfig = config.filter( ({id}) => featureId !== id );
    this.config = [...newConfig];
    this.configChange.emit({config: this.config, name: this.name });
  }

  render() {
    return (
      <Host>
        <ds-block section name="panels-configurator" prefix="pronto">
          <h2 slot="header">{"Panel list configurator"}</h2>
        
          <div class="pronto-panels-configurator-section__form">

            {this.config.map( block => (
              <ds-panel-configurator 
                onRequestDeletePanel={this.requestDeletePanelHandler}
                key={block.id} 
                panel-id={block.id} 
                settings={block} 
              />
            ) )}
            
            <div class="pronto-panels-configurator-section__add-button">
              <ds-trigger onClick={this.addPanelButtonClickHandler}>
                <strong>Ajouter</strong>
              </ds-trigger>
            </div>

          </div>

          {this.showActions && (
            <menu class="pronto-panels-configurator-section__actions">
              <ds-trigger type="button" mods="md, stl-1" onClick={this.savePanelsButtonClickHandler}>
                Save
              </ds-trigger>
            </menu>
          )}
        </ds-block>
      </Host>
    );
  }
}