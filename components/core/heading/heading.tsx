import { Component, h, Prop, Watch, Element, Host } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

@Component({
  tag: 'ds-heading',
  styleUrl: 'heading.scss',
})
export class DSHeading {
  contextName = "header";
  CSSClassList: CssClassList;
  titleProps: {
    block?: boolean;
    page?: boolean;
    content?: boolean;
    section?: boolean;
  } = {};
  hasImage: boolean;
  hasSubTitle: boolean;
  hasDescription: boolean;
  
  @Element() container: HTMLElement;
  
  @Prop() useContext: boolean;
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ reflect: true, mutable: true }) section: boolean;
	@Prop({ reflect: true, mutable: true }) block: boolean;
	@Prop({ reflect: true, mutable: true }) imagePosition: string = "block-before";

  @Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-heading", _ds.props.toArray(mods));
  }

  connectedCallback() {
    this.hasImage = this.container.querySelector("[slot='image']") !== null;
    this.hasSubTitle = this.container.querySelector("[slot='sub-title']") !== null;
    this.hasDescription = this.container.querySelector("[slot='description']") !== null;
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-heading", _ds.props.toArray(this.mods));
    const { section, block } = this;
    this.titleProps = {
      section,
      block
    }
  }
  
  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          [`--${this.imagePosition}`]: true,
        }}
      >
        {this.hasImage && (
          <div class="ds-heading__image">
            <slot name="image" />
          </div>
        )}
        <hlgroup class="ds-heading__content">
          <ds-title sup
            class="ds-heading__main-title"
            {...this.titleProps}
          >
            <slot />
          </ds-title>
          {this.hasImage && (
            <ds-title sub 
              class="ds-heading__sub-title"
              {...this.titleProps} 
            >
              <slot name="sub-title" />
            </ds-title>
          )}
          {this.hasDescription && (
            <ds-text class="ds-heading__description">
              <slot name="description" />
            </ds-text>
          )}
        </hlgroup>
      </Host>
    );
  }
}


