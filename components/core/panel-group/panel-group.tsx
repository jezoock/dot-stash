import { Component, Element, h, Host, Listen, Prop, Watch, Method } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { PanelType } from '../panel/panel.types';

/** The control of the title of a panel: the tab of a tab panel. */
const getControl = (panel: HTMLDsPanelElement): HTMLElement | null => panel.querySelector<HTMLElement>('.ds-panel__control');

/**
 * Groups `ds-panel` elements, and gives them its `type`:
 * - `tab` (WAI-ARIA tabs pattern, automatic activation): the titles of the panels are the tabs of a tab list, rendered by
 *   the group (`role="tablist"`, named by `label` or `labelledby`, owning the tabs with `aria-owns`), one expanded at a
 *   time. Tab reaches the selected tab, then its panel; Left and Right Arrow, Home and End move the focus to another tab
 *   and select it.
 * - `collapsible`: accordion panels, each one expanded and collapsed by its title button; `solo-content` keeps one
 *   expanded at a time.
 * The panels of the group are its own: not those of a group or a panel nested in one of them.
 *
 * @slot - The `ds-panel` elements.
 */
@Component({
  tag: 'ds-panel-group',
  styleUrl: 'panel-group.scss',
})
export class DSPanelGroup {
  activeItemIndex = 0;

  @Element() container: HTMLElement;

  @Prop({ reflect: true, mutable: true }) type: PanelType = 'tab';
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /** `false`: the group does not set the type of its panels, which are all shown (no tab list). */
  @Prop({ attribute: 'active', reflect: true }) isActive = true;
  /** A `collapsible` group expands one panel at a time. */
  @Prop({ reflect: true }) soloContent = false;
  /** The accessible name of the tab list (`aria-label`) of a `tab` group. */
  @Prop() label: string;
  /** The id of a visible label of the tab list of a `tab` group (`aria-labelledby`), instead of `label`. */
  @Prop() labelledby: string;

  private tabList: HTMLElement;

  /** Whether the group is a tab list: a `tab` group that sets the type of its panels. */
  get isTabList(): boolean {
    return this.type === 'tab' && this.isActive;
  }

  @Watch('type')
  async typeChangeHandler(type: PanelType) {
    if (this.isActive) {
      await this.setUpPanels(type);
    }
  }

  @Listen('panelShow')
  panelShowHandler(event: CustomEvent) {
    const index = this.getPanels().indexOf(event.target as HTMLDsPanelElement);
    // The events of the panels of a nested group, or of a panel nested in a panel, are not for this group.
    if (index >= 0) {
      this.shownPanelHandler(index);
    }
  }

  /** The panels of the group: its `ds-panel` elements, but those of a nested group or panel. */
  @Method()
  async getItems(): Promise<HTMLDsPanelElement[]> {
    return this.getPanels();
  }

  @Method()
  async showPanel(index: number): Promise<void> {
    const { activeItemIndex: previousActiveIndex } = this;
    if (index !== previousActiveIndex) {
      this.getPanels()[index]?.show();
    }
  }

  /**
   * Not implemented yet: does nothing.
   */
  @Method()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- keeps the public signature until hiding is implemented
  async hidePanel(_index?: number) {}

  async componentDidLoad() {
    if (this.isActive) {
      await this.setUpPanels(this.type);
    } else {
      await Promise.all(this.getPanels().map((panel, index) => Promise.all([panel.setIndex(index), panel.show()])));
    }
  }

  componentDidRender() {
    this.updateTabList();
  }

  getPanels(): HTMLDsPanelElement[] {
    return Array.from(this.container.querySelectorAll('ds-panel')).filter(panel => {
      const ownerPanel = panel.parentElement?.closest('ds-panel');
      return panel.parentElement?.closest('ds-panel-group') === this.container && !(ownerPanel && this.container.contains(ownerPanel));
    });
  }

  /**
   * Gives the panels their index and type, and makes them tabs of the tab list (or not). A tab list has one expanded tab:
   * the first expanded panel, else the first one; a `solo-content` group keeps its first expanded panel.
   */
  async setUpPanels(type: PanelType) {
    const panels = this.getPanels();
    const isTabList = type === 'tab';

    await Promise.all(panels.map((panel, index) => Promise.all([panel.setIndex(index), panel.setType(type), panel.setTab(isTabList)])));

    const expanded = panels.findIndex(panel => panel.expanded);
    this.activeItemIndex = isTabList ? Math.max(expanded, 0) : expanded;
    if (isTabList || this.soloContent) {
      await Promise.all(panels.map((panel, index) => (index === this.activeItemIndex ? panel.show() : panel.expanded ? panel.hide() : undefined)));
    }
    this.updateTabList();
  }

  /** The tab list owns the tabs of the panels (`aria-owns`): they are in its panel in the DOM. */
  updateTabList() {
    if (this.tabList) {
      const ids = this.getPanels()
        .map(panel => getControl(panel)?.id)
        .filter(Boolean);
      if (ids.length) {
        this.tabList.setAttribute('aria-owns', ids.join(' '));
      } else {
        this.tabList.removeAttribute('aria-owns');
      }
    }
  }

  shownPanelHandler(index: number) {
    const { activeItemIndex: previousActiveIndex } = this;

    if (index !== previousActiveIndex) {
      this.activeItemIndex = index;
      // A group that is not active shows all its panels.
      if (this.isActive && ((this.soloContent && this.type === 'collapsible') || this.type === 'tab')) {
        this.getPanels()[previousActiveIndex]?.hide();
      }
    }
  }

  /**
   * The keys of a tab list (WAI-ARIA tabs pattern, horizontal): Right Arrow moves the focus to the next tab and selects
   * it, Left Arrow to the previous one, round the list (reversed from right to left); Home and End to the first and the
   * last tab.
   */
  keyDownHandler = (event: KeyboardEvent) => {
    if (!this.isTabList || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const panels = this.getPanels();
    const current = panels.findIndex(panel => getControl(panel) === event.target);
    const last = panels.length - 1;
    const step = this.container.closest('[dir]')?.getAttribute('dir') === 'rtl' ? -1 : 1;
    const nextIndex = { ArrowRight: current + step, ArrowLeft: current - step, Home: 0, End: last }[event.key];

    if (current < 0 || nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const next = panels[nextIndex > last ? 0 : nextIndex < 0 ? last : nextIndex];
    getControl(next)?.focus();
    next.show();
  };

  render() {
    return (
      <Host class={toClassList('ds-panel-group', this.mods)} onKeyDown={this.keyDownHandler}>
        {this.isTabList && (
          <div
            class="ds-panel-group__tablist"
            role="tablist"
            aria-label={this.labelledby ? undefined : this.label}
            aria-labelledby={this.labelledby}
            ref={element => (this.tabList = element)}
          />
        )}
        <slot />
      </Host>
    );
  }
}
