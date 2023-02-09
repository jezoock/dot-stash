import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
  tag: 'ds-section',
  styleUrl: 'section.scss'
})
export class DSSection {

  @Prop({ mutable: true, reflect: true}) mods: string | string[] = "";
/*   @Prop({ mutable: true, reflect: true}) background: string;
  @Prop({ mutable: true, reflect: true}) backgroundMobile: string;
 */
  CSSClassList: Record<string, boolean>;

  @Watch('mods')
  modsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-section", newMods);
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-section", this.mods);
    console.log(this.mods)
  }
  
  render() {
    return (
      <div
        class={this.CSSClassList}
      >
        <div class="ds-section__content">
          <slot />
        </div>
      </div>
    );
  }
}