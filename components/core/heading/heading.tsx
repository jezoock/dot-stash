import { Component, h, Prop, Element, Host } from '@stencil/core';
import { toClassList } from '../../utils/props';

@Component({
  tag: 'ds-heading',
  styleUrl: 'heading.scss',
})
export class DSHeading {
  contextName = 'header';
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
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ reflect: true, mutable: true }) section: boolean;
  @Prop({ reflect: true, mutable: true }) block: boolean;
  @Prop({ reflect: true, mutable: true }) imagePosition: string = 'block-before';

  connectedCallback() {
    this.hasImage = this.container.querySelector("[slot='image']") !== null;
    this.hasSubTitle = this.container.querySelector("[slot='sub-title']") !== null;
    this.hasDescription = this.container.querySelector("[slot='description']") !== null;
  }

  componentWillLoad() {
    const { section, block } = this;
    this.titleProps = {
      section,
      block,
    };
  }

  render() {
    return (
      <Host
        class={{
          ...toClassList('ds-heading', this.mods),
          [`--${this.imagePosition}`]: true,
        }}
      >
        {this.hasImage && (
          <div class="ds-heading__image">
            <slot name="image" />
          </div>
        )}
        <hgroup class="ds-heading__content">
          <ds-title sup class="ds-heading__main-title" {...this.titleProps}>
            <slot />
          </ds-title>
          {this.hasSubTitle && (
            <ds-title sub class="ds-heading__sub-title" {...this.titleProps}>
              <slot name="sub-title" />
            </ds-title>
          )}
          {this.hasDescription && (
            <ds-text class="ds-heading__description">
              <slot name="description" />
            </ds-text>
          )}
        </hgroup>
      </Host>
    );
  }
}
