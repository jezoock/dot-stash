import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
  tag: 'ds-section',
  styleUrl: 'section.scss'
})
export class DSSection {

  @Prop({ mutable: true, reflect: true}) dsMods: string | string[] = "";
  @Prop({ mutable: true, reflect: true}) dsBackground: string;
  @Prop({ mutable: true, reflect: true}) dsBackgroundMobile: string;

  CSSClassList: any;

  @Watch('dsMods')
  dsModsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-section", newMods);
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-section", this.dsMods);
  }
  
  render() {
    const backgroundImage = window.innerWidth < 768 ? this.dsBackgroundMobile : this.dsBackground;
    return (
      <div
        class={this.CSSClassList}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div class="ds-section__content">
          <slot />
        </div>
      </div>
    );
  }
}