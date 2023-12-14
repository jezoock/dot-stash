import { Component, Element, h, Host, Listen, Prop, Watch } from "@stencil/core";
import CssClassList from "../../types/css-class-list.interface";
import _ds from "../../../typescript/dot-stash";

@Component({
  tag: "ds-panel-group",
  styleUrl: "panel-group.scss"
})
export class DSPanelGroup {

  CSSClassList: CssClassList;
  activeItem = 0;

	@Element() container: HTMLElement;

	@Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ attribute: 'active', reflect: true }) isActive = true;

  @Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-panel-group", _ds.props.toArray(mods));
  }

  @Listen('panelShow')
  panelShowHandler({ detail: { index } }) {
    const { activeItem } = this;
    this.activeItem = index;
    Array.from( this.container.querySelectorAll("ds-panel") )[activeItem].hide();
  }

  @Listen('panelHide')
  panelHideHandler() {
    console.log("hide");
  }

  componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-panel-group", _ds.props.toArray(this.mods));
	}

  componentDidLoad() {
    const items: HTMLDsPanelElement[] = Array.from(this.container.querySelectorAll("ds-panel"));
    items.forEach((item, index: number) => 
      this.isActive
        ? item.setIndex(index)
        : item.show()
    );
  }

  render() {
    return (
      <Host
        class={this.CSSClassList}
      >
        <slot/>
      </Host>
    );
  }
}
