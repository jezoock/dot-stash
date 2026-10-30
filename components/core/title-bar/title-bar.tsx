import { Component, h, Prop, Element, Host } from '@stencil/core';
import { toClassList } from '../../utils/props';

@Component({
  tag: 'ds-title-bar',
  styleUrl: 'title-bar.scss',
})
export class DSTitleBar {
  contextName = 'title-bar';
  hasContentBefore: boolean;
  hasContentAfter: boolean;

  @Element() container: HTMLElement;

  @Prop({ reflect: true }) ctx: boolean;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  connectedCallback() {
    this.hasContentBefore = this.container.querySelector("[slot='before']") !== null;
    this.hasContentAfter = this.container.querySelector("[slot='after']") !== null;
  }

  render() {
    return (
      <Host class={toClassList('ds-title-bar', this.mods)}>
        {this.hasContentBefore && (
          <div class="ds-title-bar__before">
            <slot name="before" />
          </div>
        )}
        <div class="ds-title-bar__content">
          <slot />
        </div>
        {this.hasContentAfter && (
          <div class="ds-title-bar__after">
            <slot name="after" />
          </div>
        )}
      </Host>
    );
  }
}
