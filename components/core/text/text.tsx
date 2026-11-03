import { Prop, Component, h, Host } from '@stencil/core';
import { toClassList } from '../../utils/props';

@Component({
  tag: 'ds-text',
  styleUrl: 'text.scss',
})
export class DSText {
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop() type: 'p' | 'code' | 'quote' = 'p';
  @Prop() inline: boolean;
  @Prop() sup: boolean;
  @Prop() sub: boolean;
  @Prop() weight: 'thin' | 'light' | 'normal' | 'bold' | 'bolder';

  render() {
    return (
      <Host class={toClassList('ds-text', this.mods)}>
        <slot />
      </Host>
    );
  }
}
