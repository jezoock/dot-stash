import { Element, Prop, Component, Host, h, Watch } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

@Component({
  tag: 'ds-trigger',
  styleUrl: 'trigger.scss',
})
export class DSTrigger {
  targetComponent: HTMLElement;
  CSSClassList: CssClassList;

  @Element() hostContainer: HTMLElement;

  @Prop({ reflect: true }) disabled = false;
  @Prop({ reflect: true }) action: string;
  @Prop({ reflect: true }) on = 'click';
  @Prop() target: string;
  @Prop() type: 'button' | 'control' | 'link' = 'control';
  @Prop({ reflect: true }) mods: string | string[] = [];
  
	@Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.processClassList(mods);
  }

  //#region LYFECYCLE CALLBACKS

  constructor() {
    this.eventHandler = this.eventHandler.bind(this);
  }

	componentWillLoad() {
		this.processClassList(this.mods);
	}

  connectedCallback() {
    if (this.target) {
      this.targetComponent = document.querySelector(this.target);
      if(this.targetComponent) {
        this.hostContainer.addEventListener( this.on, this.eventHandler );
      } else {
        console.log(
          `[ERROR] DSControl: can't find target component, selector: ${this.target}, type: ${this.type}`
        );
      } 
    }
  }

  disconnectedCallback() {
    if (this.target && this.targetComponent) {
      this.hostContainer.removeEventListener( this.on, this.eventHandler );
    }
  }

  //#endregion

  //#region TOOLS

  processClassList( modifiers: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList(
      `ds-${this.type}`,
      _ds.props.toArray(modifiers)
    );
  }

  //#endregion

  //#region HANDLERS

  eventHandler() {
    if(this.targetComponent) {
      const [ action, args ] = this.action.split(/:(.*)/s);
      this.targetComponent[action](..._ds.props.fromJSON(args||[]));
    }
  }

  //#endregion

  render() {
    return (
      <Host
        class={this.CSSClassList}
      >
        <slot />
      </Host>
    );
  }
}