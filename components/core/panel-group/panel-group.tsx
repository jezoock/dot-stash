import { Component, Element, h, Host, Listen, Prop, Watch, Method } from "@stencil/core";
import CssClassList from "../../types/css-class-list.interface";
import _ds from "../../../typescript/dot-stash";
import { PanelType } from "../panel/panel";

@Component({
  tag: "ds-panel-group",
  styleUrl: "panel-group.scss"
})
export class DSPanelGroup {

  CSSClassList: CssClassList;
  activeItemIndex = 0;

	@Element() container: HTMLElement;

	@Prop({ reflect: true, mutable: true }) type: PanelType = "tab";
	@Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ attribute: 'active', reflect: true }) isActive = true;
  @Prop({ reflect: true }) soloContent = false;

  @Watch('type')
  async typeChangeHandler( type: PanelType ) {
    const items = await this.getItems();
    if (this.isActive) {
      items.forEach( item => item.setType(type) );
    }
  }

  @Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-panel-group", _ds.props.toArray(mods));
  }

  @Listen('panelShow')
  panelShowHandler({ detail: { index } }) {
    this.shownPanelHandler(index);
  }

  @Listen('panelHide')
  panelHideHandler() { }

  @Method()
  async getItems(): Promise<HTMLDsPanelElement[]> {
    return Array.from(this.container.querySelectorAll("ds-panel"));
  }

  @Method() 
  async showPanel(index: number): Promise<void> {
    const { activeItemIndex: previousActiveIndex } = this;
    if (index !== previousActiveIndex) {
      (Array.from( this.container.querySelectorAll("ds-panel:not(ds-panel ds-panel)") )[index] as HTMLDsPanelElement).show();
    }
  }
  
  @Method()
  async hidePanel(index?: number) {
    console.log(index);
  }

  componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-panel-group", _ds.props.toArray(this.mods));
	}

  async componentDidLoad() {
    const { type } = this;
    const items = await this.getItems();

    items.forEach((item, index: number) => 
      (item.setIndex(index),
      (this.isActive
        ? item.setType(type)
        : item.show()))
    );
  }

  shownPanelHandler(index: number) {
    const { activeItemIndex: previousActiveIndex } = this;

    if (index !== previousActiveIndex) {
      this.activeItemIndex = index;
      if ((this.soloContent && this.type === "collapsible") || this.type === "tab") {
        (Array.from( this.container.querySelectorAll("ds-panel:not(ds-panel ds-panel)") )[previousActiveIndex] as HTMLDsPanelElement).hide();
      }
    }
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