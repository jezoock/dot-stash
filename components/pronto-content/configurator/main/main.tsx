import { Component, h, Host } from '@stencil/core';


let globalComponentId = 0;

@Component({
  tag: 'ds-main-configurator',
  /* styleUrl: 'main.css' */
})
export class DsMainConfigurator {

  addComponentButtonClickHandler() {
    /* const { config } = this;
    this.config = [...config, { ...(config.length === 0 ? emptyMainFeature : emptyFeature), id: `feat-${globalComponentId.toString()}` }];
     */globalComponentId++;
  }
  
  render() {
    return (
      <Host>
        <ds-trigger onClick={this.addComponentButtonClickHandler}>
          <span>+</span>
          <strong>Ajouter</strong>
        </ds-trigger>
      </Host>
    );
  }
}