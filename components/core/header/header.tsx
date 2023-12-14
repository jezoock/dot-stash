import { Component, h, Prop, Watch, Element, Host } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

@Component({
  tag: 'ds-header',
  styleUrl: 'header.scss',
})
export class DSHeader {
  contextName = "header";
  CSSClassList: CssClassList;
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
        {this.container.querySelector("[slot='before']") !== null && (
          <div class="ds-header__before">
            <slot name="before" />
          </div>
        )}
        <div class="ds-header__content">
          {(this.container.querySelector("[slot='title']") !== null || this.container.querySelector("[slot='sub-title']") !== null) && (
            <hlgroup class="ds-header__title-wrapper">
              {this.container.querySelector("[slot='title']") !== null && (
                <ds-title class="ds-header__main-title">
                  <slot name="title" />
                </ds-title>
              )}
              {this.container.querySelector("[slot='sub-title']") !== null && (
                <ds-title sub class="ds-header__sub-title">
                  <slot name="sub-title" />
                </ds-title>
              )}
            </hlgroup>
          )}
          <ds-text class="ds-header__text">
            <slot />
          </ds-text>
        </div>
        {this.container.querySelector("[slot='before']") !== null && (
          <div class="ds-header__after">
            <slot name="after" />
          </div>
        )}
      </Host>
    );
  }
}


