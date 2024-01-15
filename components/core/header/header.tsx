import { Component, h, Prop, Watch, Element, Host } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

@Component({
  tag: 'ds-bar',
  styleUrl: 'header.scss',
})
export class DSHeader {
  contextName = "header";
  CSSClassList: CssClassList;
  hasContentBefore: boolean;
  hasContentAfter: boolean;
  titleProps: {
    block?: boolean;
    page?: boolean;
    content?: boolean;
    section?: boolean;
  } = {};

  @Element() container: HTMLElement;

  @Prop({ reflect: true }) ctx: boolean;
  @Prop({ reflect: true }) mods: string | string[] = [];

  @Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-header", _ds.props.toArray(mods));
  }

  connectedCallback() {
    this.hasContentBefore = this.container.querySelector("[slot='before']") !== null;
    this.hasContentAfter = this.container.querySelector("[slot='after']") !== null;
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-header", _ds.props.toArray(this.mods));
  }
  
  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
        }}
      >
        {this.hasContentBefore && (
          <div class="ds-header__before">
            <slot name="before" />
          </div>
        )}
        <div class="ds-header__content">
          <slot />
        </div>
        {this.hasContentAfter && (
          <div class="ds-header__after">
            <slot name="after" />
          </div>
        )}
      </Host>
    );
  }
}


