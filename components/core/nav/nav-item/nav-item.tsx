import { Component, Event, EventEmitter, h, Host, Listen, Prop, Element, State, Fragment } from '@stencil/core';
import { formatLabel } from '../../../utils/labels';
import { isTrue, toNumber } from '../../../utils/props';
import { ThemeBreakpointWatch, watchThemeBreakpoint } from '../../../utils/responsive';
import { TransitionWait, waitForTransition } from '../../../utils/transition';

let navItemIds = 0;

/**
 * The breakpoint from which the theme drops the sub-navigations down (`break-p(md)` in components/_nav.scss), and its width
 * without the theme.
 */
const DROP_DOWN_BREAKPOINT = 'md';
const DROP_DOWN_FALLBACK_WIDTH = 992;

const isEscape = (event: KeyboardEvent) => event.key === 'Escape' || event.key === 'Esc';

/**
 * An item of a `ds-nav`: a link (the default slot) and, with `has-children`, a sub-navigation (slot `children`, a
 * `ds-nav`) and its expand button. It follows the WAI-ARIA disclosure navigation pattern (not a menu): the expand button
 * (`aria-expanded`, `aria-controls`) shows and hides the sub-navigation, which is hidden from the keyboard and from
 * assistive technologies while it is collapsed (the theme: `visibility: hidden` once it has collapsed); Escape closes the
 * sub-navigation that has the focus and gives the focus back to its button. Where the theme drops the sub-navigation
 * down on hover and focus instead (from `md`: no expand button), Escape hides it until the focus or the pointer leaves
 * the item. `is-active` marks the current page: its link gets `aria-current="page"`.
 * The item knows the mode of the theme from the same breakpoint, `md`: the media query `(min-width: <--ds-bp-md>)`
 * (`matchMedia()`). When the viewport crosses it, the item starts again as at load in the new mode.
 *
 * @slot - The link of the item.
 * @slot children - The sub-navigation: a `ds-nav` of `ds-nav-item` elements.
 */
@Component({
  tag: 'ds-nav-item',
  styleUrl: 'nav-item.scss',
})
export class DSNavMenuItem {
  @Element() host: HTMLElement;

  @Prop() itemId: string;
  @Prop({ reflect: true, mutable: true }) type = 'page';
  @Prop({ reflect: true, mutable: true }) depth = 0;
  @Prop({ reflect: true, mutable: true }) hasChildren = false;
  /** The item of the current page: its link gets `aria-current="page"` (unless it has an `aria-current` of its own). */
  @Prop({ reflect: true, mutable: true }) isActive = false;
  /** Whether the expand button animates the height of the sub-navigation (`false`: the theme opens it, on `--open`). */
  @Prop({ reflect: true, mutable: true }) isAnimated = true;
  /** The name of the item in the name of its expand button. Default: the text of its link. */
  @Prop() label: string;
  /** The name of the expand button (`aria-label`): `{label}` is the name of the item. */
  @Prop() toggleLabel = '{label} submenu';

  /** Whether the sub-navigation is open (the expand button: `aria-expanded`). */
  @State() isOpened = false;
  /** Whether Escape hid the drop-down sub-navigation (the theme from `md`), until the focus and the pointer leave the item. */
  @State() isDismissed = false;

  @Event() dsMenuItemClick: EventEmitter;

  private uid: string;
  private linkWrapper: HTMLElement;
  private toggleButton: HTMLElement;
  private subNav: HTMLElement;
  /** The wait for the end of the height transition of the sub-navigation, while it runs. */
  private subNavTransition: TransitionWait;
  /** The link that got `aria-current="page"` from the component (it had none of its own). */
  private currentLink: HTMLElement | null = null;
  /** The delay before the height of a closing sub-navigation goes to 0. */
  private hideTimer: ReturnType<typeof setTimeout>;
  /** The media query of the theme's `md` breakpoint, while the item is in the document. */
  private dropDownWatch: ThemeBreakpointWatch;
  /**
   * Whether the theme drops the sub-navigation down on hover and focus (from `md`: no expand button), rather than
   * collapsing it under the expand button (below `md`).
   */
  private isDropDown = false;

  constructor() {
    this.itemClickHandler = this.itemClickHandler.bind(this);
  }

  connectedCallback() {
    this.uid ??= `ds-nav-item-${++navItemIds}`;
    this.dropDownWatch?.stop();
    this.dropDownWatch = watchThemeBreakpoint(DROP_DOWN_BREAKPOINT, DROP_DOWN_FALLBACK_WIDTH, isDropDown => this.setDropDown(isDropDown));
    this.setDropDown(this.dropDownWatch.matches);
  }

  componentWillLoad() {
    this.isActive = isTrue(this.isActive);
    this.hasChildren = isTrue(this.hasChildren);
    this.isAnimated = isTrue(this.isAnimated);
    this.depth = toNumber(this.depth);
  }

  componentDidRender() {
    this.updateCurrentLink();
  }

  disconnectedCallback() {
    this.subNavTransition?.cancel();
    this.subNavTransition = undefined;
    clearTimeout(this.hideTimer);
    this.dropDownWatch?.stop();
    this.dropDownWatch = undefined;
  }

  /**
   * The theme switches the sub-navigation from collapsed under the expand button (below `md`) to drop-down (from `md`), or
   * back: the item starts again as at load in the new mode. Its sub-navigation is closed, not dismissed, and its height is
   * left to the theme (the collapsed sub-navigation is hidden, `visibility: hidden`); below `md`, it stays open while the
   * focus is in it, so that the focus is not hidden. No `dsMenuItemClick`: the user did not open nor close it.
   */
  setDropDown(isDropDown: boolean) {
    if (isDropDown === this.isDropDown) {
      return;
    }
    this.isDropDown = isDropDown;
    this.subNavTransition?.cancel();
    this.subNavTransition = undefined;
    clearTimeout(this.hideTimer);
    this.isDismissed = false;
    this.isOpened = !isDropDown && !!this.subNav?.contains(document.activeElement);
    this.subNav?.style.removeProperty('height');
  }

  /** The link of the item: the first link of its default slot. */
  getLink(): HTMLElement | null {
    return this.linkWrapper?.querySelector<HTMLElement>('a[href]') ?? null;
  }

  /** The name of the item: `label`, else the text of its default slot (its link). */
  getItemLabel(): string {
    if (this.label) {
      return this.label;
    }
    // Before the first render, the slotted elements are still children of the host.
    const nodes = Array.from((this.linkWrapper ?? this.host).childNodes).filter(
      node => !(node.nodeType === 1 && ((node as Element).getAttribute('slot') === 'children' || (node as Element).matches('.ds-nav-item__expand-button, .ds-nav-item__sub-nav'))),
    );
    return nodes
      .map(node => node.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** `aria-current="page"` on the link of the current page (`is-active`), unless it has an `aria-current` of its own. */
  updateCurrentLink() {
    const link = this.getLink();

    if (this.currentLink && (this.currentLink !== link || !this.isActive)) {
      this.currentLink.removeAttribute('aria-current');
      this.currentLink = null;
    }
    if (link && this.isActive && !link.hasAttribute('aria-current')) {
      link.setAttribute('aria-current', 'page');
      this.currentLink = link;
    }
  }

  toggleSubNav(mustShow = false): void {
    this.isOpened = mustShow;
    this[`${mustShow ? 'show' : 'hide'}SubNav`]();
  }

  /**
   * Waits for the end of the height transition of the sub-navigation (`waitForTransition`: at once without a transition,
   * or once its duration is over without `transitionend`): open, its height follows its content again (`auto`).
   */
  waitForSubNav(subNav: HTMLElement): TransitionWait {
    this.subNavTransition?.cancel();
    this.subNavTransition = waitForTransition(subNav, () => {
      this.subNavTransition = undefined;
      if (this.isOpened && subNav.offsetHeight !== 0) {
        subNav.style.height = 'auto';
      }
    });
    return this.subNavTransition;
  }

  showSubNav(): void {
    const subNav = this.subNav;
    const subNavContent = this.host.querySelector('.ds-nav-item__sub-nav > ds-nav > .ds-nav') as HTMLDivElement;
    if (subNav && subNavContent) {
      const transition = this.waitForSubNav(subNav);
      subNav.style.height = `${subNavContent.offsetHeight}px`;
      transition.measure();
    }
  }

  hideSubNav(): void {
    const subNav = this.subNav;
    if (!subNav) {
      return;
    }
    this.subNavTransition?.cancel();
    clearTimeout(this.hideTimer);
    subNav.style.height = `${subNav.offsetHeight}px`;
    this.hideTimer = setTimeout(() => {
      // The height in px is computed before it changes to 0, so that it transitions.
      void subNav.offsetHeight;
      const transition = this.waitForSubNav(subNav);
      subNav.style.height = '0';
      transition.measure();
    }, 0);
  }

  /** The expand button opens or closes the sub-navigation. */
  toggleIsSelected() {
    const isOpened = !this.isOpened;
    this.dsMenuItemClick.emit({ isSelected: isOpened });
    if (this.isAnimated) {
      this.toggleSubNav(isOpened);
    } else {
      this.isOpened = isOpened;
    }
  }

  itemClickHandler(event) {
    const menuItem = event.target;
    const link = menuItem.getAttribute('href');

    if (!link || link === '/' || link === '' || link === '#') {
      event.preventDefault();
    }

    this.toggleIsSelected();
  }

  expandButtonClickHandler() {
    this.toggleIsSelected();
  }

  /**
   * Escape in the item (on its link, its expand button or in its sub-navigation): closes the open sub-navigation and
   * gives the focus to its expand button; where the sub-navigation drops down (no expand button), hides it and gives the
   * focus to the link of the item. The key press goes no further. Otherwise (nothing to close), it goes on to the item
   * of the parent navigation.
   */
  @Listen('keydown')
  keyDownHandler(event: KeyboardEvent) {
    if (!isEscape(event) || !this.hasChildren || event.defaultPrevented) {
      return;
    }

    if (!this.isDropDown) {
      if (this.isOpened) {
        event.preventDefault();
        event.stopPropagation();
        this.toggleButton?.focus();
        this.toggleIsSelected();
      }
    } else if (!this.isDismissed) {
      event.preventDefault();
      event.stopPropagation();
      if (this.subNav?.contains(event.target as Node)) {
        this.getLink()?.focus();
      }
      this.isDismissed = true;
    }
  }

  /**
   * Escape while the pointer is over the item, and the focus elsewhere: hides the drop-down sub-navigation it shows (the
   * content shown on hover can be dismissed without moving the pointer). The other layers (a dialog, a sidebar, a list
   * that has the focus) handle Escape first, and stop it.
   */
  @Listen('keydown', { target: 'document' })
  documentKeyDownHandler(event: KeyboardEvent) {
    if (isEscape(event) && this.hasChildren && !event.defaultPrevented && !this.isDismissed && !this.host.contains(event.target as Node) && this.isHovered()) {
      if (this.isDropDown) {
        this.isDismissed = true;
      }
    }
  }

  /** The focus that moves into the dismissed drop-down shows it again. */
  @Listen('focusin')
  focusInHandler(event: FocusEvent) {
    if (this.isDismissed && this.subNav?.contains(event.target as Node)) {
      this.isDismissed = false;
    }
  }

  /** The drop-down dismissed by Escape shows again on hover and focus once both have left the item. */
  @Listen('focusout')
  focusOutHandler(event: FocusEvent) {
    const to = event.relatedTarget as Node | null;
    if (this.isDismissed && !(to && this.host.contains(to)) && !this.isHovered()) {
      this.isDismissed = false;
    }
  }

  @Listen('mouseleave')
  mouseLeaveHandler() {
    const focused = document.activeElement;
    if (this.isDismissed && !(focused && this.host.contains(focused))) {
      this.isDismissed = false;
    }
  }

  isHovered(): boolean {
    try {
      return this.host.matches(':hover');
    } catch {
      return false;
    }
  }

  render() {
    const subNavId = `${this.uid}-sub-nav`;

    return (
      // An item of the list of its ds-nav.
      <Host role={this.host.parentElement?.closest('ds-nav') ? 'listitem' : undefined}>
        <div
          class={{
            'ds-nav-item': true,
            '--with-children': this.hasChildren,
            // An open item is active too (its link has the active color).
            '--active': this.isActive || this.isOpened,
            '--open': this.isOpened,
            '--dismissed': this.isDismissed,
            [`--depth-${this.depth}`]: true,
            [`--${this.type}-${this.itemId}`]: true,
          }}
        >
          <div class="ds-nav-item__link" ref={element => (this.linkWrapper = element)}>
            <slot />
          </div>
          {this.hasChildren && (
            <Fragment>
              <div class="ds-nav-item__expand-button">
                <ds-trigger
                  type="button"
                  mods="menu-item"
                  onClick={this.itemClickHandler}
                  label={formatLabel(this.toggleLabel, { label: this.getItemLabel() })}
                  aria-expanded={this.isOpened ? 'true' : 'false'}
                  aria-controls={subNavId}
                  ref={element => (this.toggleButton = element)}
                />
              </div>
              <div class="ds-nav-item__sub-nav" id={subNavId} ref={element => (this.subNav = element)}>
                <slot name="children" />
              </div>
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}
