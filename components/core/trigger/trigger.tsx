import { Element, Prop, Component, Host, h } from '@stencil/core';
import { fromJSON, toClassList } from '../../utils/props';

type TargetComponent = undefined | typeof window | typeof document | Element;

/**
 * Calls a method of a target element on an event: `<ds-trigger target="#slider" action="next">`.
 * `action` is the method name, optionally followed by JSON arguments: `action='goTo:[2]'`.
 */
@Component({
  tag: 'ds-trigger',
  styleUrl: 'trigger.scss',
})
export class DSTrigger {
  targetComponent: TargetComponent;

  @Element() hostContainer: HTMLElement;

  /** A disabled trigger does not call the action. */
  @Prop({ reflect: true }) disabled = false;
  /** Method of the target to call, optionally followed by its JSON arguments (`goTo:[2]`). */
  @Prop({ reflect: true }) action: string;
  /** Event of the trigger that calls the action. */
  @Prop({ reflect: true }) on = 'click';
  /** The target: a CSS selector, `window` or `document`. */
  @Prop() target: string;
  @Prop() type: 'button' | 'control' | 'link' = 'control';
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  //#region LYFECYCLE CALLBACKS

  constructor() {
    this.eventHandler = this.eventHandler.bind(this);
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
    if (this.targetComponent && !this.disabled) {
      const [action, args] = this.action.split(/:(.*)/g);
      this.targetComponent[action](...fromJSON(args || []));
    }
  }

  //#endregion

  render() {
    return (
      <Host class={toClassList(`ds-${this.type}`, this.mods)}>
        <slot />
      </Host>
    );
  }
}
