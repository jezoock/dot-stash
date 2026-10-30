import { Component, h, Prop, Host } from '@stencil/core';
import { toClassList } from '../../utils/props';

@Component({
  tag: 'ds-title',
  styleUrl: 'title.scss',
})
export class DSTitle {
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ reflect: true }) article: boolean;
  @Prop({ reflect: true }) form: boolean;
  @Prop({ reflect: true }) page: boolean;
  @Prop({ reflect: true }) section: boolean;
  @Prop({ reflect: true }) block: boolean;
  @Prop({ reflect: true }) sub: boolean;
  @Prop({ reflect: true }) sup: boolean;

  render() {
    return (
      <Host class={toClassList('ds-title', this.mods)}>
        <slot />
      </Host>
    );
  }
}
