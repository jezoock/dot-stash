import { Component, Element, h, Host, Listen, Prop, Watch, Method } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { PanelType } from '../panel/panel.types';

@Component({
  tag: 'ds-panel-group',
  styleUrl: 'panel-group.scss',
})
export class DSPanelGroup {
  activeItemIndex = 0;

  @Element() container: HTMLElement;

  @Prop({ reflect: true, mutable: true }) type: PanelType = 'tab';
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ attribute: 'active', reflect: true }) isActive = true;
  @Prop({ reflect: true }) soloContent = false;

  @Watch('type')
  async typeChangeHandler(type: PanelType) {
    const items = await this.getItems();
    if (this.isActive) {
      items.forEach(item => item.setType(type));
    }
  }

  @Listen('panelShow')
  panelShowHandler({ detail: { index } }) {
    this.shownPanelHandler(index);
  }

  @Listen('panelHide')
  panelHideHandler() {}

  @Method()
  async getItems(): Promise<HTMLDsPanelElement[]> {
    return Array.from(this.container.querySelectorAll('ds-panel'));
  }

  @Method()
  async showPanel(index: number): Promise<void> {
    const { activeItemIndex: previousActiveIndex } = this;
    if (index !== previousActiveIndex) {
      (Array.from(this.container.querySelectorAll('ds-panel:not(ds-panel ds-panel)'))[index] as HTMLDsPanelElement).show();
    }
  }

  /**
   * Not implemented yet: does nothing.
   */
  @Method()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- keeps the public signature until hiding is implemented
  async hidePanel(_index?: number) {}

  async componentDidLoad() {
    const { type } = this;
    const items = await this.getItems();

    items.forEach((item, index: number) => (item.setIndex(index), this.isActive ? item.setType(type) : item.show()));
  }

  shownPanelHandler(index: number) {
    const { activeItemIndex: previousActiveIndex } = this;

    if (index !== previousActiveIndex) {
      this.activeItemIndex = index;
      if ((this.soloContent && this.type === 'collapsible') || this.type === 'tab') {
        (Array.from(this.container.querySelectorAll('ds-panel:not(ds-panel ds-panel)'))[previousActiveIndex] as HTMLDsPanelElement).hide();
      }
    }
  }

  render() {
    return (
      <Host class={toClassList('ds-panel-group', this.mods)}>
        <slot />
      </Host>
    );
  }
}
