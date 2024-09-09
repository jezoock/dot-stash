import {
  Component,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  Method,
  Element,
  Watch
} from "@stencil/core";
import _ds from "../../../typescript/dot-stash";
import CssClassList from "../../types/css-class-list.interface";

@Component({
  tag: "ds-panel",
  styleUrl: "panel.scss"
})
export class DSPanel {
  CSSClassList: CssClassList;

  @Element() container: HTMLElement;
  
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop() minHeight = "0";
  @Prop({ mutable: true, reflect: true }) expanded = false;
  @Prop({ mutable: true, reflect: true }) type = "tab";
  @Prop({ reflect: true }) index: number;

  @Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-panel", _ds.props.toArray(mods));
  }

  @Event() panelShow: EventEmitter;
  @Event() panelShown: EventEmitter;
  @Event() panelHide: EventEmitter;
  @Event() panelHidden: EventEmitter;

  @Method()
  async setIndex(index: number) {
    if (typeof index === "number") {
      this.index = index;
    }
  }
  @Method()
  async show() {
    this.setExpanded(true);
  }

  @Method()
  async hide() {
    this.setExpanded(false);
  }

  @Method()
  async toggle(mustShow?: boolean) {
    this.setExpanded(mustShow);
  }

  constructor() {
    this.titleClickHandler = this.titleClickHandler.bind(this);
  }

  componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-panel", _ds.props.toArray(this.mods));
	}

  setExpanded(mustShow?: boolean) {
    const expanded = typeof mustShow === "boolean" ? mustShow : !this.expanded;
    this.expanded = expanded;
    this[`panel${expanded ? 'Show' : 'Hide'}`].emit({ index: this.index });
  }

  titleClickHandler() {
    this.setExpanded();
  }

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          [`--${this.type}`]: true
        }}
      >
        <div
          class="ds-panel__title"
          onClick={this.titleClickHandler}
        >
          <slot name="title" />
        </div>
        <div class="ds-panel__content">
          <div
            class="ds-panel__content-wrapper"
            style={{ "min-height": this.minHeight }}
          >
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
