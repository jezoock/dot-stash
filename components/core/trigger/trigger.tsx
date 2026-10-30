import { Element, Prop, Component, Host, h, Watch } from '@stencil/core';
import { fromJSON, toArray, toClassList } from '../../utils/props';
import CssClassList from '../../utils/interfaces/css-class-list';

type TargetComponent = undefined | typeof window | typeof document | Element;

@Component({
  tag: 'ds-trigger',
  styleUrl: 'trigger.scss',
})
export class DSTrigger {
  targetComponent: TargetComponent;
  CSSClassList: CssClassList;

  @Element() hostContainer: HTMLElement;

  @Prop({ reflect: true }) disabled = false;
  @Prop({ reflect: true }) action: string;
  @Prop({ reflect: true }) on: string;
  @Prop() target: string;
  @Prop() type: 'button' | 'control' | 'link' = 'control';
  @Prop({ reflect: true }) mods: string | string[] = [];

  @Watch('mods')
  modsChangeHandler(mods: string | string[]) {
    this.CSSClassList = toClassList(`ds-${this.type}`, toArray(mods));
  }

  //#region LYFECYCLE CALLBACKS

  constructor() {
    this.eventHandler = this.eventHandler.bind(this);
  }

  componentWillLoad() {
    this.CSSClassList = toClassList(`ds-${this.type}`, toArray(this.mods));
  }

  connectedCallback() {
    if (this.target) {
      let target: TargetComponent;
      if (this.target === 'window') {
        target = window;
      } else if (this.target === 'document') {
        target = document;
      } else {
        target = document.querySelector(this.target);
      }

      if (target) {
        this.targetComponent = target;
        this.hostContainer.addEventListener(this.on, this.eventHandler);
      } else {
        console.error(`[ds-trigger] can't find target component, selector: ${this.target}, type: ${this.type}`);
      }
    }
  }

  disconnectedCallback() {
    if (this.target && this.targetComponent) {
      this.hostContainer.removeEventListener(this.on, this.eventHandler);
    }
  }

  //#endregion

  //#region HANDLERS

  eventHandler() {
    if (this.targetComponent) {
      const [action, args] = this.action.split(/:(.*)/g);
      this.targetComponent[action](...fromJSON(args || []));
    }
  }

  //#endregion

  render() {
    return (
      <Host class={this.CSSClassList}>
        <slot />
      </Host>
    );
  }
}
