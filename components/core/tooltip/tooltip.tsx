import { Component, Element, h, Listen, Prop, State, Watch } from '@stencil/core';
import { TooltipPosition } from './tooltip-position.enum';
import { toClassList } from '../../utils/props';
import { getTabbableElements } from '../../utils/focus';
import { TOOLTIP_HIDE_DELAY } from './tooltip.constants';

/** Numbers the tooltips, for the ids of their messages. */
let tooltipCount = 0;

/** Adds `id` to the `aria-describedby` id list of `element`, or removes it, keeping the other ids. */
const setDescribedBy = (element: Element, id: string, isDescribed: boolean) => {
  const ids = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(other => other && other !== id);

  if (isDescribed) {
    ids.push(id);
  }

  if (ids.length) {
    element.setAttribute('aria-describedby', ids.join(' '));
  } else {
    element.removeAttribute('aria-describedby');
  }
};

/** Whether the element got the focus from the keyboard (the browser shows its focus ring), not from a click or a tap. */
const hasFocusVisible = (element: Element): boolean => {
  try {
    return element.matches(':focus-visible');
  } catch {
    // A DOM without :focus-visible (the spec tests).
    return true;
  }
};

/**
 * A tooltip (WAI-ARIA tooltip pattern): a message (`slot="message"`, given `role="tooltip"` and an id) that describes the
 * content of the tooltip. The first focusable element of the content gets the message in its `aria-describedby`; without
 * one, the tooltip box (`.ds-tooltip`) is made focusable (`tabindex="0"`) and gets it. The message is shown while the
 * pointer is over the content or the message, and while the content has the keyboard focus; Escape hides it, without
 * moving the focus or the pointer. On touch screens, a tap shows or hides it.
 *
 * @slot - The content the tooltip is about (an icon, a text, a button).
 * @slot message - The message: a short text, without interactive element.
 */
@Component({
  tag: 'ds-tooltip',
  styleUrl: 'tooltip.scss',
})
export class DSTooltip {
  @Element() container: HTMLDsTooltipElement;

  /**
   * Displayed tooltip icon
   */
  @Prop() icon = '';

  /**
   * @type {string} Tooltip position (top, left, right or bottom)
   */
  @Prop() position: TooltipPosition = TooltipPosition.TOP;

  /**
   * @type {boolean} isDisabled( attr => disabled ) Specify wether the tooltip is disabled or not
   */
  @Prop({ mutable: true, reflect: true, attribute: 'disabled' }) isDisabled = false;
  @Prop({ mutable: true }) hasArrow = true;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true }) containerSelector = '';

  @State() isShown = false;

  private isTouchMobile: boolean = 'ontouchstart' in window;
  /** The tooltip box (`.ds-tooltip`), once rendered. */
  private box: HTMLDivElement;
  private readonly defaultMessageId = `ds-tooltip-${++tooltipCount}-message`;
  /** The id of the message, set in componentWillRender(). */
  private messageId: string;
  /** The element of the content that has the message in its aria-describedby: the box itself when it is focusable. */
  private describedElement: Element | null = null;
  /** Whether the box is focusable: no focusable element in the content. */
  private isBoxFocusable = false;
  private isHovered = false;
  private isFocused = false;
  /** Hidden with Escape: shown again once the pointer and the focus have left the tooltip and come back. */
  private isDismissed = false;
  private hideTimer: ReturnType<typeof setTimeout>;

  @Listen('request_tooltipShow_event')
  request_tooltipShow_eventHandler() {
    this.toggle(true);
  }
  @Listen('request_tooltipHide_event')
  request_tooltipHide_eventHandler() {
    this.toggle(false);
  }

  @Listen('request_tooltipToggle_event')
  request_tooltipToggle_eventHandler({ detail: { mustShow } }) {
    this.toggle(mustShow);
  }

  /** While the message is shown, Escape hides it. */
  @Watch('isShown')
  isShownChangeHandler(isShown: boolean) {
    if (isShown) {
      document.addEventListener('keydown', this.documentKeyDownHandler, true);
    } else {
      document.removeEventListener('keydown', this.documentKeyDownHandler, true);
    }
  }

  public constructor() {
    this.tooltipHandler = this.tooltipHandler.bind(this);
  }

  disconnectedCallback() {
    clearTimeout(this.hideTimer);
    document.removeEventListener('keydown', this.documentKeyDownHandler, true);
  }

  /** The message element of the tooltip (not one of a tooltip in its content). */
  private getMessage(): HTMLElement | undefined {
    return Array.from(this.container.querySelectorAll<HTMLElement>('[slot="message"]')).find(message => message.closest('ds-tooltip') === this.container);
  }

  componentWillRender() {
    // The message and the element it describes. Before the first render, the content is not in its slot yet: it is
    // looked for in the whole component, but for the message. The elements are kept even when they are not rendered for
    // now (a tooltip in a closed modal).
    const message = this.getMessage();

    if (message) {
      message.setAttribute('role', 'tooltip');
      if (!message.id) {
        message.id = this.defaultMessageId;
      }
    }

    const focusable =
      message && !this.isDisabled
        ? getTabbableElements(this.container, { checkVisibility: false }).find(
            element => !message.contains(element) && element !== this.box && element.closest('ds-tooltip') === this.container,
          )
        : undefined;
    const describedElement = message && !this.isDisabled ? (focusable ?? null) : null;

    if (this.describedElement && this.describedElement !== describedElement && this.describedElement !== this.box) {
      setDescribedBy(this.describedElement, this.messageId, false);
    }
    this.messageId = message?.id;
    this.isBoxFocusable = !!message && !this.isDisabled && !focusable;
    if (describedElement) {
      setDescribedBy(describedElement, this.messageId, true);
    }
    this.describedElement = describedElement;
  }

  componentDidRender() {
    if (this.isBoxFocusable) {
      this.describedElement = this.box;
    }

    if (!!this.containerSelector && this.isShown) {
      const messageLayer = this.container.querySelector("[slot='message']") as HTMLDivElement;
      const limitContainer = document.querySelector<HTMLElement>(this.containerSelector);
      if (messageLayer && limitContainer) {
        /* Horizontal positionning for only 2 positions */
        /* Need to split position prop in 2 props => vertical-position, horizontal-position */
        if ([TooltipPosition.TOP, TooltipPosition.BOTTOM].includes(this.position)) {
          const messageLayerWidth = messageLayer.offsetWidth;
          const messageLayerOffset = messageLayer.getBoundingClientRect().left;
          const limitContainerWidth = limitContainer.offsetWidth;
          const limitContainerOffset = limitContainer.getBoundingClientRect().left;

          if (messageLayerOffset + messageLayerWidth > limitContainerWidth + limitContainerOffset) {
            messageLayer.style.marginLeft = `${limitContainerWidth + limitContainerOffset - (messageLayerOffset + messageLayerWidth)}px`;
          } else if (messageLayerOffset < limitContainerOffset) {
            messageLayer.style.marginLeft = `${-(messageLayerOffset - limitContainerOffset)}px`;
          }
        }
      }
    }
  }

  private toggle(isShown?: boolean): void {
    clearTimeout(this.hideTimer);
    this.isShown = typeof isShown === 'boolean' ? isShown : !this.isShown;
  }

  /** Shows the message, unless it was dismissed with Escape. */
  private showFromInteraction(): void {
    clearTimeout(this.hideTimer);
    if (!this.isDismissed) {
      this.toggle(true);
    }
  }

  /** Hides the message once neither the pointer nor the focus is on the tooltip, after `delay` ms. */
  private hideFromInteraction(delay = 0): void {
    if (this.isHovered || this.isFocused) {
      return;
    }

    this.isDismissed = false;
    clearTimeout(this.hideTimer);
    if (delay > 0) {
      this.hideTimer = setTimeout(() => this.toggle(false), delay);
    } else {
      this.toggle(false);
    }
  }

  private isInTooltip(node: EventTarget | null): boolean {
    return !!node && !!this.box && this.box.contains(node as Node);
  }

  private tooltipHandler = (event: Event) => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    if (this.isTouchMobile) {
      if (event.type === 'mouseover' || event.type === 'mouseout') {
        event.preventDefault();
      }
      if (event.type === 'touchend') {
        this.toggle();
      }
    } else if (event.type === 'mouseover') {
      this.isHovered = true;
      this.showFromInteraction();
    } else if (event.type === 'mouseout' && !this.isInTooltip((event as MouseEvent).relatedTarget)) {
      // Out of the content and of the message (moving between their elements is not leaving).
      this.isHovered = false;
      this.hideFromInteraction(TOOLTIP_HIDE_DELAY);
    }
  };

  /** The keyboard focus on the content (not a click or a tap on it) shows the message. */
  private focusInHandler = (event: FocusEvent) => {
    if (this.isDisabled || !hasFocusVisible(event.target as Element)) {
      return;
    }

    this.isFocused = true;
    this.showFromInteraction();
  };

  private focusOutHandler = (event: FocusEvent) => {
    if (!this.isFocused || this.isInTooltip(event.relatedTarget)) {
      return;
    }

    this.isFocused = false;
    this.hideFromInteraction();
  };

  /**
   * Escape hides the shown message, without moving the focus or the pointer (WCAG 1.4.13, dismissible). Listened to in the
   * capture phase, and stopped there: the same key press does not also close a modal or a sidebar around the tooltip.
   */
  private documentKeyDownHandler = (event: KeyboardEvent) => {
    if (this.isShown && (event.key === 'Escape' || event.key === 'Esc')) {
      event.stopPropagation();
      this.isDismissed = this.isHovered || this.isFocused;
      this.toggle(false);
    }
  };

  render() {
    return (
      <div
        class={{
          ...toClassList('ds-tooltip', this.mods),
          '--is-shown': this.isShown,
          '--icon': !!this.icon,
          [`--${this.icon}`]: this.icon !== '',
          '--disabled': this.isDisabled,
          '--with-arrow': this.hasArrow,
          [`--${this.position}`]: true,
        }}
        ref={element => {
          this.box = element as HTMLDivElement;
        }}
        tabindex={this.isBoxFocusable ? '0' : undefined}
        aria-describedby={this.isBoxFocusable ? this.messageId : undefined}
        onMouseOver={this.tooltipHandler}
        onMouseOut={this.tooltipHandler}
        onTouchEnd={this.tooltipHandler}
        onFocusin={this.focusInHandler}
        onFocusout={this.focusOutHandler}
      >
        <div class="ds-tooltip__content">
          <slot />
        </div>
        <slot name="message" />
      </div>
    );
  }
}
