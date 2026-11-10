import { Component, Event, EventEmitter, h, Host, Prop, Method, Element, State, Watch } from '@stencil/core';
import { toClassList, toNumber } from '../../utils/props';
import { getFocusedElement, getTabbableElements } from '../../utils/focus';
import { TransitionWait, waitForTransition } from '../../utils/transition';
import { PanelType } from './panel.types';

let panelIds = 0;

const isSpace = (event: KeyboardEvent) => event.key === ' ' || event.key === 'Spacebar';

/**
 * A panel: a title and a content, which expands and collapses. Two types, which `ds-panel-group` sets on its panels:
 * - `collapsible` (WAI-ARIA disclosure / accordion pattern): the title holds a button (`role="button"`, `aria-expanded`,
 *   `aria-controls`), which Enter, Space and a click toggle; with a heading level (`level`, or the level of a heading put
 *   in the `title` slot, which then gets `role="none"`), the title is a heading (`role="heading"`, `aria-level`) around
 *   that button.
 * - `tab`: in a `ds-panel-group` (WAI-ARIA tabs pattern), the title is a `tab` (`aria-selected`, `aria-controls`) of the
 *   tab list of the group and the content a `tabpanel` (`aria-labelledby`); the group handles the arrow keys.
 * The content of a panel that is not expanded is inert: out of the Tab order and of the accessibility tree.
 * `panelShow` / `panelHide` are emitted when the state changes, `panelShown` / `panelHidden` at the end of its transition
 * (at once when there is none).
 *
 * @slot title - The title: a text, or a heading (`h1`…`h6`), whose level the title of a collapsible panel takes.
 * @slot - The content.
 */
@Component({
  tag: 'ds-panel',
  styleUrl: 'panel.scss',
})
export class DSPanel {
  @Element() container: HTMLDsPanelElement;

  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /** The minimum height of the content (a CSS length). */
  @Prop() minHeight = '0';
  /** Whether the content is shown. */
  @Prop({ mutable: true, reflect: true }) expanded = false;
  /** The place of the panel in its `ds-panel-group` (set by the group). */
  @Prop({ mutable: true, reflect: true }) index: number;
  /** `tab` (in a `ds-panel-group` of tabs) or `collapsible`. `ds-panel-group` sets it on its panels. */
  @Prop({ mutable: true, reflect: true }) type: PanelType = 'tab';
  /**
   * The heading level (1 to 6) of the title of a collapsible panel: the title is then a heading (`role="heading"`,
   * `aria-level`) that holds its button, as in the WAI-ARIA accordion pattern. Default: the level of an `h1`…`h6` element
   * put in the `title` slot (which gets `role="none"`: the title is the heading), else none.
   */
  @Prop() level: number | string;

  /** Whether the content is between two states: from a change of `expanded` to the end of its transition. */
  @State() isTransitioning = false;
  /** Whether the panel is a tab of the tab list of its `ds-panel-group` (see `setTab()`). */
  @State() isTab = false;

  /** The ids of the title control and of the content, for `aria-controls` and `aria-labelledby`. */
  private uid: string;
  /** A heading element (`h1`…`h6`) put in the `title` slot, found before the first render. */
  private titleHeading: HTMLElement | undefined;
  /** Whether the component set `role="none"` on that heading (it had no role of its own). */
  private isTitleHeadingNeutralized = false;
  private control: HTMLElement;
  private content: HTMLElement;
  private wrapper: HTMLElement;
  /** The wait for the end of the transition of the content, while it runs. */
  private transition: TransitionWait;
  /** Whether the duration of that transition was read, once its state was rendered. */
  private isTransitionMeasured = false;
  /** Space activates the control on keyup, after a keydown on it (as a native button). */
  private isSpacePressed = false;

  @Watch('expanded')
  expandedChangeHandler(expanded: boolean) {
    // The content becomes inert when it collapses: the focus it holds goes to the control of the title first.
    const focused = getFocusedElement();
    if (!expanded && focused && this.content?.contains(focused)) {
      this.control?.focus();
    }
    this.waitForTransition();
    this[`panel${expanded ? 'Show' : 'Hide'}`].emit({ index: this.index });
  }

  /** Emitted when the panel starts to expand (`detail.index`: its index). */
  @Event() panelShow: EventEmitter;
  /** Emitted when the panel is expanded, at the end of the transition of its content (at once when there is none). */
  @Event() panelShown: EventEmitter;
  /** Emitted when the panel starts to collapse (`detail.index`: its index). */
  @Event() panelHide: EventEmitter;
  /** Emitted when the panel is collapsed, at the end of the transition of its content (at once when there is none). */
  @Event() panelHidden: EventEmitter;

  @Method()
  async setIndex(index: number) {
    if (typeof index === 'number') {
      this.index = index;
    }
  }

  @Method()
  async setType(type: PanelType) {
    if (['tab', 'collapsible'].includes(type)) {
      this.type = type;
    }
  }

  /**
   * Makes the panel a tab of the tab list of its `ds-panel-group` (`true`), or not: `ds-panel-group` calls it. A `tab`
   * panel that is not in a tab list has no role (its title is not a control).
   */
  @Method()
  async setTab(isTab: boolean) {
    this.isTab = !!isTab;
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

  /** The type the panel has: a tab of a tab list, a collapsible panel, or neither (a `tab` outside of a tab list). */
  get role(): 'tab' | 'collapsible' | undefined {
    return this.type === 'collapsible' ? 'collapsible' : this.type === 'tab' && this.isTab ? 'tab' : undefined;
  }

  /** The heading level of the title of a collapsible panel (`level`, else that of the heading in the `title` slot). */
  get headingLevel(): number | undefined {
    const level = this.level !== undefined && this.level !== null && this.level !== '' ? toNumber(this.level) : Number(this.titleHeading?.tagName.slice(1));
    return level >= 1 && level <= 6 ? level : undefined;
  }

  connectedCallback() {
    this.uid ??= this.container.id || `ds-panel-${++panelIds}`;
  }

  componentWillLoad() {
    // Before the first render the slotted elements are still children of the host.
    const title = Array.from(this.container.children).find(child => child.getAttribute('slot') === 'title');
    this.titleHeading = /^H[1-6]$/.test(title?.tagName ?? '') ? (title as HTMLElement) : undefined;
  }

  componentDidRender() {
    // The transition starts with the render of the new state: its duration is read from the new style. Read after the
    // render: with no transition, the wait ends at once, and the state it changes would change during the render.
    if (this.transition && !this.isTransitionMeasured) {
      this.isTransitionMeasured = true;
      const transition = this.transition;
      Promise.resolve().then(() => transition.measure());
    }

    // A heading in the title slot of a control (a tab, a button): its semantics would be a heading inside the control. It
    // gets role="none" (a collapsible panel gives its level to the title, the heading around the button), and its own role
    // back when the title is no longer a control.
    if (this.titleHeading) {
      if (this.role && !this.titleHeading.hasAttribute('role')) {
        this.titleHeading.setAttribute('role', 'none');
        this.isTitleHeadingNeutralized = true;
      } else if (!this.role && this.isTitleHeadingNeutralized) {
        this.titleHeading.removeAttribute('role');
        this.isTitleHeadingNeutralized = false;
      }
    }

    // A tab panel without a focusable element takes the focus itself, after its tab (WAI-ARIA tabs pattern).
    if (this.content) {
      if (this.role === 'tab' && getTabbableElements(this.wrapper, { checkVisibility: false }).length === 0) {
        this.content.setAttribute('tabindex', '0');
      } else {
        this.content.removeAttribute('tabindex');
      }
    }
  }

  disconnectedCallback() {
    this.transition?.cancel();
    this.transition = undefined;
    this.isTransitioning = false;
  }

  /**
   * Emits `panelShown` or `panelHidden` (the state at that time) at the end of the transition that the state change
   * starts: on the `transitionend` event of the content, at once when it has no transition (a duration of 0), or when its
   * duration is over if the event does not come. A new change cancels the wait.
   */
  waitForTransition() {
    this.transition?.cancel();
    this.transition = undefined;
    if (!this.content) {
      return;
    }

    this.isTransitioning = true;
    this.isTransitionMeasured = false;
    this.transition = waitForTransition(this.content, () => {
      this.transition = undefined;
      this.isTransitioning = false;
      this[`panel${this.expanded ? 'Shown' : 'Hidden'}`].emit({ index: this.index });
    });
  }

  setExpanded(mustShow?: boolean) {
    const expanded = typeof mustShow === 'boolean' ? mustShow : !this.expanded;
    this.expanded = expanded;
  }

  titleClickHandler() {
    if (this.type === 'tab') {
      if (!this.expanded) {
        this.setExpanded();
      }
    } else {
      this.setExpanded();
    }
  }

  /** Whether a key of the control itself must be handled: it is a control, no modifier. */
  private isOwnKey(event: KeyboardEvent): boolean {
    return !!this.role && event.target === this.control && !event.altKey && !event.ctrlKey && !event.metaKey;
  }

  /**
   * Enter clicks the control (on keydown), Space too (on keyup), as a native button: the click expands a tab, or toggles
   * a collapsible panel. Space does not scroll the page; a key held down does not repeat.
   */
  controlKeyDownHandler = (event: KeyboardEvent) => {
    if (!this.isOwnKey(event)) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) {
        this.control.click();
      }
    } else if (isSpace(event)) {
      event.preventDefault();
      this.isSpacePressed = true;
    }
  };

  controlKeyUpHandler = (event: KeyboardEvent) => {
    if (isSpace(event) && this.isSpacePressed) {
      this.isSpacePressed = false;
      if (this.isOwnKey(event)) {
        event.preventDefault();
        this.control.click();
      }
    }
  };

  render() {
    const { role } = this;
    const level = role === 'collapsible' ? this.headingLevel : undefined;
    const controlId = `${this.uid}-control`;
    const contentId = `${this.uid}-content`;

    return (
      <Host
        class={{
          ...toClassList('ds-panel', this.mods),
          [`--${this.type}`]: true,
          '--transition': this.isTransitioning,
        }}
      >
        <div class="ds-panel__title" onClick={this.titleClickHandler} role={level ? 'heading' : undefined} aria-level={level}>
          <div
            class="ds-panel__control"
            ref={element => (this.control = element)}
            id={controlId}
            role={role === 'tab' ? 'tab' : role ? 'button' : undefined}
            aria-selected={role === 'tab' ? String(this.expanded) : undefined}
            aria-expanded={role === 'collapsible' ? String(this.expanded) : undefined}
            aria-controls={role ? contentId : undefined}
            // A tab: only the selected one is in the Tab order, the arrow keys move between them (roving tabindex).
            tabindex={role === 'tab' ? (this.expanded ? '0' : '-1') : role ? '0' : undefined}
            onKeyDown={this.controlKeyDownHandler}
            onKeyUp={this.controlKeyUpHandler}
          >
            <slot name="title" />
          </div>
        </div>
        <div
          class="ds-panel__content"
          ref={element => (this.content = element)}
          id={contentId}
          role={role === 'tab' ? 'tabpanel' : undefined}
          aria-labelledby={role === 'tab' ? controlId : undefined}
          // Not expanded: out of the Tab order and of the accessibility tree, at once (also while it collapses).
          inert={!this.expanded}
        >
          <div class="ds-panel__content-wrapper" ref={element => (this.wrapper = element)} style={{ 'min-height': this.minHeight }}>
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
