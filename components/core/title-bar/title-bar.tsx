import { Component, h, Prop, Watch, Element, Host } from '@stencil/core/internal';
import _ds from '../../utils/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

@Component({
  tag: 'ds-title-bar',
  styleUrl: 'title-bar.scss',
})
export class DSTitleBar {
  contextName = 'title-bar';
  CSSClassList: CssClassList;
  hasContentBefore: boolean;
  hasContentAfter: boolean;

  @Element() container: HTMLElement;

  @Prop({ reflect: true }) ctx: boolean;
  @Prop({ reflect: true }) mods: string | string[] = [];

  @Watch('mods')
  modsChangeHandler(mods: string | string[]) {
    this.CSSClassList = _ds.props.toClassList('ds-title-bar', _ds.props.toArray(mods));
  }

  connectedCallback() {
    this.hasContentBefore = this.container.querySelector("[slot='before']") !== null;
    this.hasContentAfter = this.container.querySelector("[slot='after']") !== null;
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-title-bar', _ds.props.toArray(this.mods));
  }

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
        }}
      >
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
