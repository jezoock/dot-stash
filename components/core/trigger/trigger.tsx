import { Element, Prop, Component, Host, h, State } from '@stencil/core';
import { fromJSON, toClassList } from '../../utils/props';

type TargetComponent = undefined | typeof window | typeof document | Element;

/** The elements of the content that are controls of their own: the trigger then adds no role, no focus and no keys. */
const NATIVE_CONTROL_SELECTOR = ['a[href]', 'button', 'input', 'select', 'textarea', 'summary', '[tabindex]', '[contenteditable]:not([contenteditable="false"])'].join(',');

const isSpace = (event: KeyboardEvent) => event.key === ' ' || event.key === 'Spacebar';

/**
 * Calls a method of a target element on an event: `<ds-trigger target="#slider" action="next">`.
 * `action` is the method name, optionally followed by JSON arguments: `action='goTo:[2]'`.
 * When it is the control (it calls on `click`, and its content has no link, button or other control of its own), the
 * element is a button (WAI-ARIA button pattern): `role="button"` (or the `role` it already has), `tabindex="0"`, Enter
 * and Space click it, and a disabled trigger is `aria-disabled` and cannot be focused. A content with its own control
 * (a native `button`, a link) keeps its semantics: the trigger adds nothing, and the click of that control calls the action.
 *
 * @slot - The content of the trigger: its text (its name, when it is the control), or a native button or link.
 */
@Component({
  tag: 'ds-trigger',
  styleUrl: 'trigger.scss',
})
export class DSTrigger {
  targetComponent: TargetComponent;

  @Element() hostContainer: HTMLElement;

  /** A disabled trigger does not call the action; when it is the control, it is `aria-disabled` and cannot be focused. */
  @Prop({ reflect: true }) disabled = false;
  /** Method of the target to call, optionally followed by its JSON arguments (`goTo:[2]`). */
  @Prop({ reflect: true }) action: string;
  /** Event of the trigger that calls the action. With another event than `click`, the trigger is not a button. */
  @Prop({ reflect: true }) on = 'click';
  /** The target: a CSS selector, `window` or `document`. */
  @Prop() target: string;
  /** `control` (no skin), `button` (the `.ds-button` skin) or `link` (the `.ds-link` skin): the look only, all are buttons. */
  @Prop() type: 'button' | 'control' | 'link' = 'control';
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /** The accessible name of the trigger (`aria-label`) when it is the control, for a trigger without a text (an icon). */
  @Prop() label: string;

  /** Whether the content holds a control of its own (a link, a button…): the trigger is then not the control. */
  @State() hasNativeControl = false;

  /** The `role` the element had before the first render: kept when the trigger is the control (`link`, `tab`…). */
  private ownRole: string | null = null;
  /** Watches the content: a control added later makes the trigger give up its role. */
  private observer: MutationObserver;
  /** Space clicks the trigger on keyup, after a keydown on it (as a native button). */
  private isSpacePressed = false;

  /** Whether the element is the control: it calls the action on a click, and its content has no control of its own. */
  get isControl(): boolean {
    return this.on === 'click' && !this.hasNativeControl;
  }

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

    this.updateNativeControl();
    if (typeof MutationObserver !== 'undefined' && !this.observer) {
      this.observer = new MutationObserver(() => this.updateNativeControl());
      this.observer.observe(this.hostContainer, { childList: true, subtree: true });
    }
  }

  componentWillLoad() {
    this.ownRole = this.hostContainer.getAttribute('role');
  }

  disconnectedCallback() {
    if (this.target && this.targetComponent) {
      this.hostContainer.removeEventListener(this.on, this.eventHandler);
    }
    this.observer?.disconnect();
    this.observer = undefined;
  }

  //#endregion

  //#region HANDLERS

  eventHandler() {
    if (this.targetComponent && !this.disabled) {
      const [action, args] = this.action.split(/:(.*)/g);
      this.targetComponent[action](...fromJSON(args || []));
    }
  }

  updateNativeControl() {
    this.hasNativeControl = !!this.hostContainer.querySelector(NATIVE_CONTROL_SELECTOR);
  }

  /** Whether a key of the element itself (not of its content) must be handled: it is the control, enabled, no modifier. */
  private isOwnKey(event: KeyboardEvent): boolean {
    return this.isControl && !this.disabled && event.target === this.hostContainer && !event.altKey && !event.ctrlKey && !event.metaKey;
  }

  /**
   * Enter clicks the trigger (a click event, as a native button: the `on="click"` action and the page's listeners); Space
   * too, on keyup, but not for a `role="link"`. Space does not scroll the page; a key held down does not repeat.
   */
  keyDownHandler = (event: KeyboardEvent) => {
    if (!this.isOwnKey(event)) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) {
        this.hostContainer.click();
      }
    } else if (isSpace(event) && this.ownRole !== 'link') {
      event.preventDefault();
      this.isSpacePressed = true;
    }
  };

  keyUpHandler = (event: KeyboardEvent) => {
    if (isSpace(event) && this.isSpacePressed) {
      this.isSpacePressed = false;
      if (this.isOwnKey(event)) {
        event.preventDefault();
        this.hostContainer.click();
      }
    }
  };

  //#endregion

  render() {
    const isControl = this.isControl;

    return (
      <Host
        class={toClassList(`ds-${this.type}`, this.mods)}
        role={isControl ? this.ownRole || 'button' : this.ownRole || undefined}
        tabindex={isControl && !this.disabled ? '0' : undefined}
        aria-disabled={isControl && this.disabled ? 'true' : undefined}
        aria-label={isControl ? this.label : undefined}
        onKeyDown={this.keyDownHandler}
        onKeyUp={this.keyUpHandler}
      >
        <slot />
      </Host>
    );
  }
}
