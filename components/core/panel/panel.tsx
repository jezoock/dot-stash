import { Component, Event, EventEmitter, h, Host, Prop, Method, Element, Watch } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { PanelType } from './panel.types';

@Component({
  tag: 'ds-panel',
  styleUrl: 'panel.scss',
})
export class DSPanel {
  @Element() container: HTMLDsPanelElement;

  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop() minHeight = '0';
  @Prop({ mutable: true, reflect: true }) expanded = false;
  @Prop({ mutable: true, reflect: true }) index: number;
  @Prop({ mutable: true, reflect: true }) type: PanelType = 'tab';

  @Watch('expanded')
  expandedChangeHandler(expanded: boolean) {
    this[`panel${expanded ? 'Show' : 'Hide'}`].emit({ index: this.index });
  }

  @Event() panelShow: EventEmitter;
  @Event() panelShown: EventEmitter;
  @Event() panelHide: EventEmitter;
  @Event() panelHidden: EventEmitter;

  @Method()
  async setIndex(index: number) {
    if (typeof index === 'number') {
      this.index = index;
    }
  }

  @Method()
  async setType(type: PanelType) {
    if (['tab', 'collapsible'].includes(type)) {
      this.type = type;
    }
  }

  @Method()
  async show() {
    this.setExpanded(true);
  }

  @Method()
  async hide() {
    this.setExpanded(false);
  }

  @Method()
  async toggle(mustShow?: boolean) {
    this.setExpanded(mustShow);
  }

  constructor() {
    this.titleClickHandler = this.titleClickHandler.bind(this);
  }

  setExpanded(mustShow?: boolean) {
    const expanded = typeof mustShow === 'boolean' ? mustShow : !this.expanded;
    this.expanded = expanded;
  }

  titleClickHandler() {
    if (this.type === 'tab') {
      if (!this.expanded) {
        this.setExpanded();
      }
    } else {
      this.setExpanded();
    }
  }

  render() {
    return (
      <Host
        class={{
          ...toClassList('ds-panel', this.mods),
          [`--${this.type}`]: true,
        }}
      >
        <div class="ds-panel__title" onClick={this.titleClickHandler}>
          <slot name="title" />
        </div>
        <div class="ds-panel__content">
          <div class="ds-panel__content-wrapper" style={{ 'min-height': this.minHeight }}>
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
