import { Component, h, Prop, Watch, Host } from '@stencil/core';
import { toArray, toClassList } from '../../utils/props';
import CssClassList from '../../utils/interfaces/css-class-list';

@Component({
  tag: 'ds-title',
  styleUrl: 'title.scss',
})
export class DSTitle {
  CSSClassList: CssClassList;

  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ reflect: true }) article: boolean;
  @Prop({ reflect: true }) form: boolean;
  @Prop({ reflect: true }) page: boolean;
  @Prop({ reflect: true }) section: boolean;
  @Prop({ reflect: true }) block: boolean;
  @Prop({ reflect: true }) sub: boolean;
  @Prop({ reflect: true }) sup: boolean;

  @Watch('mods')
  modsChangeHandler(mods: string | string[]) {
    this.CSSClassList = toClassList('ds-title', toArray(mods));
  }

  componentWillLoad() {
    this.CSSClassList = toClassList('ds-title', toArray(this.mods));
  }

  render() {
    return (
      <Host class={this.CSSClassList}>
        <slot />
      </Host>
    );
  }
}
