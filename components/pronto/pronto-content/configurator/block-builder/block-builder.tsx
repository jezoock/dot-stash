import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';
import _ds from '../../../../../typescript/dot-stash';

let globalBlockId = 0;

@Component({
  tag: 'ds-block-builder',
})
export class DsBlockBuilder {

  @Element() hostContainer: HTMLDsFeatureConfiguratorElement;
  @Prop({ mutable: true, reflect: true }) settings: string | any = [];
  @Prop({ mutable: true }) name: string;

  @State() config: any[] = [];
  @State() showModal: boolean;

  @Event() saveConfiguration: EventEmitter;
  @Event() configChange: EventEmitter;

  @Watch("settings")
  settingsChangeHandler(newSettings) {
    this.config = [..._ds.props.fromJSON(newSettings)];
    
  }

  constructor() {
    this.addBlockButtonClickHandler = this.addBlockButtonClickHandler.bind(this);
    this.saveButtonClickHandler = this.saveButtonClickHandler.bind(this);
    /* this.previewButtonClickHandler = this.previewButtonClickHandler.bind(this); */
    this.requestDeleteBlockHandler = this.requestDeleteBlockHandler.bind(this);
  }

  addBlockButtonClickHandler() {
    this.showModal = true;
  }

  saveButtonClickHandler() {

  }

  requestDeleteBlockHandler() {

  }

  componentWillLoad() {
    this.config = _ds.props.fromJSON(this.settings || []);
    globalBlockId += this.config.length;
    /* this.saveData = [...this.config]; */
  }

  requestDeleteFeatureHandler({detail: { id: featureId }}) {
    const { config } = this;
    const newConfig = config.filter( ({id}) => featureId !== id );
    this.config = [...newConfig];
    this.configChange.emit({ config: this.config, name: this.name });
  }
  
  render() {
    return (
      <Host>
        <slot />

        <ds-trigger onClick={this.addBlockButtonClickHandler}>
          <strong>Ajouter</strong>
        </ds-trigger>

        {this.showModal && (
          <pronto-modal>
            <ds-toggle-group name="block-type" mods="icon">
              <ds-toggle name="block-type" value=""></ds-toggle>
            </ds-toggle-group>
          </pronto-modal>
        )}
      </Host>
    );
  }
}