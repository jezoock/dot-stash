import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { formatLabel } from '../../utils/labels';
import { fromJSON, toClassList } from '../../utils/props';
import uuid from '../../utils/uuid';
import { DS_SORTABLE_ORIENTATIONS, DSSortableDefaultLabels } from './sortable.constants';
import { DSSortableLabels, DSSortableOrderChangeDetail, DSSortableOrientation } from './sortable.types';

/** The attributes the list sets on each item, given back as they were when the item leaves it. */
const ITEM_ATTRIBUTES = ['role', 'tabindex', 'aria-describedby', 'aria-label'] as const;

const isSpace = (event: KeyboardEvent) => event.key === ' ' || event.key === 'Spacebar';

/** Sets an attribute (`null`: removes it), when it changes. */
const setAttribute = (element: Element, name: string, value: string | null) => {
  if (value === null) {
    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
    }
  } else if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
};

/** The item being moved with the keyboard: where it was when it was picked up. */
interface Grab {
  item: HTMLElement;
  from: number;
}

/**
 * A list the user puts in order: each child of the list is an item, identified by its `data-key`. With the keyboard, an
 * item that has the focus is picked up with Space or Enter, moved with the arrow keys (Up and Down; Left and Right,
 * `horizontal`, reversed from right to left), Home and End, dropped with Space or Enter, or put back with Escape (Tab, or
 * a click elsewhere, drops it). With `buttons`, each item also gets two buttons that move it one place back or forward,
 * for the pointer and the touch. Each move is told by a polite live region (`labels`: "Netflix moved to position 2 of
 * 5"), and each order the user commits (a drop, a button) emits `orderChange`, with the keys in their new order.
 *
 * The list is a WAI-ARIA `list` (named by `label`) of `listitem` elements, each in the Tab order and described by the
 * instructions of the keyboard. The list moves the items in the page (their order in the DOM is the order shown and
 * read), never the one that has the focus: the focus stays on it.
 *
 * @slot - The items: the direct children of the list, each with a `data-key` (and a `data-label` for the texts, else its text).
 */
@Component({
  tag: 'ds-sortable',
  styleUrl: 'sortable.scss',
})
export class DSSortable {
  @Element() host: HTMLElement;

  /** The name of the list (`aria-label`): what the items are ("Order of the services"). */
  @Prop() label: string;
  /** The direction of the list, and of the arrow keys that move an item: `vertical` (Up and Down, by default) or `horizontal` (Left and Right). */
  @Prop({ reflect: true }) orientation: DSSortableOrientation = 'vertical';
  /** Gives each item two buttons that move it one place back or forward (named by `labels`). */
  @Prop({ reflect: true }) buttons = false;
  /** The texts of the list (JSON as an attribute), to translate them: the instructions, the announcements, the names of the buttons (see the readme). */
  @Prop() labels: DSSortableLabels | string = {};
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** The user committed a new order (an item dropped where it was not, or moved by a button): the keys in their new order. */
  @Event() orderChange: EventEmitter<DSSortableOrderChangeDetail>;

  /** Whether an item is picked up. */
  @State() isSorting = false;

  private rootId = `ds-sortable-${uuid()}`;
  private grab: Grab | null = null;
  /** The parts the list created: the instructions and the live region. */
  private instructions: HTMLElement | null = null;
  private status: HTMLElement | null = null;
  /** The items, with the attributes they had before the list set its own. */
  private items = new Map<HTMLElement, Partial<Record<(typeof ITEM_ATTRIBUTES)[number], string | null>>>();
  private observer: MutationObserver | undefined;

  @Watch('labels')
  @Watch('buttons')
  @Watch('orientation')
  propsWatcher() {
    this.sync();
  }

  connectedCallback() {
    if (typeof MutationObserver === 'function' && !this.observer) {
      this.observer = new MutationObserver(records => {
        if (
          records.some(
            record =>
              record.target !== this.status &&
              record.target !== this.instructions &&
              (record.type === 'characterData' || [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)].some(node => !this.isOwnNode(node))),
          )
        ) {
          this.sync();
        }
      });
      this.observer.observe(this.host, { childList: true, subtree: true, characterData: true });
    }
    this.sync();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
    this.grab = null;
    Array.from(this.items.keys()).forEach(item => this.release(item));
    this.instructions?.remove();
    this.status?.remove();
    this.instructions = this.status = null;
  }

  //#region ITEMS

  /** Whether a node is one the list created (a part, or the buttons of an item). */
  private isOwnNode(node: Node): boolean {
    return node === this.instructions || node === this.status || !!(node as Element).classList?.contains('ds-sortable__actions');
  }

  /** The items: the element children of the list but its own parts, in their order. */
  getItems(): HTMLElement[] {
    return Array.from(this.host.children).filter(child => !this.isOwnNode(child)) as HTMLElement[];
  }

  /** The key of an item: its `data-key`. */
  private keyOf(item: HTMLElement): string {
    return item.getAttribute('data-key') ?? '';
  }

  /** The label of an item in the texts: its `data-label`, else its text (without that of its buttons). */
  private labelOf(item: HTMLElement): string {
    const label = item.getAttribute('data-label');
    if (label?.trim()) {
      return label.trim();
    }
    const clone = item.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.ds-sortable__actions').forEach(actions => actions.remove());
    return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  /** The texts: `labels` over the English defaults. */
  getLabels(): Required<DSSortableLabels> {
    let labels: DSSortableLabels = {};
    try {
      labels = (fromJSON(this.labels ?? {}) as DSSortableLabels) ?? {};
    } catch {
      console.error('[ds-sortable] labels is not valid JSON');
    }
    return { ...DSSortableDefaultLabels, ...labels };
  }

  /** Sets up the items (their role, their focus, their description, their buttons) and the parts of the list. */
  private sync() {
    const labels = this.getLabels();

    if (!this.instructions) {
      this.instructions = document.createElement('div');
      this.instructions.className = 'ds-sortable__instructions';
      this.instructions.id = `${this.rootId}-instructions`;
      this.instructions.hidden = true;
    }
    if (this.instructions.textContent !== labels.instructions) {
      this.instructions.textContent = labels.instructions;
    }
    // The live region: no role, so that the list only owns its items (a status in a list is not allowed).
    if (!this.status) {
      this.status = document.createElement('div');
      this.status.className = 'ds-sortable__status';
      this.status.setAttribute('aria-live', 'polite');
      this.status.setAttribute('aria-atomic', 'true');
    }
    for (const part of [this.instructions, this.status]) {
      if (part.parentNode !== this.host || part !== this.host.lastElementChild) {
        this.host.append(part);
      }
    }

    const items = this.getItems();
    // The items that left the list: given back as they were.
    Array.from(this.items.keys())
      .filter(item => !items.includes(item))
      .forEach(item => this.release(item));

    items.forEach((item, index) => {
      if (!this.items.has(item)) {
        this.items.set(item, Object.fromEntries(ITEM_ATTRIBUTES.map(name => [name, item.getAttribute(name)])));
      }
      const own = this.items.get(item);
      if (!this.keyOf(item)) {
        console.warn('[ds-sortable] an item has no data-key: its order is not in orderChange', item);
      }
      item.classList.add('ds-sortable__item');
      setAttribute(item, 'role', own.role ?? 'listitem');
      setAttribute(item, 'tabindex', own.tabindex ?? '0');
      const describedBy = [...(own['aria-describedby'] ?? '').split(/\s+/).filter(Boolean), this.instructions.id];
      setAttribute(item, 'aria-describedby', describedBy.join(' '));
      // Its name: a list item is not named by its content in the accessibility tree; its label, unless the page names it.
      if (own['aria-label'] === null && !item.hasAttribute('aria-labelledby')) {
        setAttribute(item, 'aria-label', this.labelOf(item) || null);
      }
      item.classList.toggle('--grabbed', this.grab?.item === item);
      this.syncButtons(item, index, items, labels);
    });

    if (this.grab && !items.includes(this.grab.item)) {
      this.grab = null;
    }
    this.isSorting = !!this.grab;
  }

  /** The buttons of an item (`buttons`): named after it and its neighbours, unavailable at the ends of the list. */
  private syncButtons(item: HTMLElement, index: number, items: HTMLElement[], labels: Required<DSSortableLabels>) {
    let actions = Array.from(item.children).find(child => child.classList.contains('ds-sortable__actions')) as HTMLElement | undefined;
    if (!this.buttons) {
      actions?.remove();
      return;
    }
    if (!actions) {
      actions = document.createElement('span');
      actions.className = 'ds-sortable__actions';
      for (const direction of ['before', 'after'] as const) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `ds-sortable__move --${direction}`;
        button.addEventListener('click', () => this.moveByButton(item, direction === 'before' ? -1 : 1));
        actions.append(button);
      }
      item.append(actions);
    } else if (actions !== item.lastElementChild) {
      item.append(actions);
    }
    const label = this.labelOf(item);
    const [before, after] = Array.from(actions.children) as HTMLButtonElement[];
    const previous = items[index - 1];
    const next = items[index + 1];
    setAttribute(before, 'aria-label', formatLabel(labels.moveBefore, { label, other: previous ? this.labelOf(previous) : '' }));
    setAttribute(after, 'aria-label', formatLabel(labels.moveAfter, { label, other: next ? this.labelOf(next) : '' }));
    before.disabled = !previous;
    after.disabled = !next;
  }

  /** Gives an item back as it was before the list: its attributes, no class, no buttons. */
  private release(item: HTMLElement) {
    const own = this.items.get(item) ?? {};
    ITEM_ATTRIBUTES.forEach(name => setAttribute(item, name, own[name] ?? null));
    item.classList.remove('ds-sortable__item', '--grabbed');
    Array.from(item.children)
      .filter(child => child.classList.contains('ds-sortable__actions'))
      .forEach(actions => actions.remove());
    this.items.delete(item);
  }

  //#endregion

  //#region MOVES

  /**
   * Moves an item to a position (from 0) by moving the others around it: the item, which may have the focus, stays in the
   * document (removing it would take the focus away).
   */
  private moveTo(item: HTMLElement, to: number) {
    const items = this.getItems();
    const from = items.indexOf(item);
    const target = Math.min(Math.max(to, 0), items.length - 1);
    if (from < 0 || target === from) {
      return;
    }
    if (target > from) {
      // The items between: before it, in their order.
      items.slice(from + 1, target + 1).forEach(other => this.host.insertBefore(other, item));
    } else {
      // The items between: after it, in their order.
      const anchor = item.nextSibling;
      items.slice(target, from).forEach(other => this.host.insertBefore(other, anchor));
    }
    this.sync();
  }

  /** Tells assistive technologies a text (polite): the same text twice is told twice. */
  private announce(template: string, item: HTMLElement) {
    if (!this.status) {
      return;
    }
    const items = this.getItems();
    const text = formatLabel(template, { label: this.labelOf(item), index: items.indexOf(item) + 1, count: items.length });
    this.status.textContent = this.status.textContent === text ? `${text}\u00a0` : text;
  }

  private emitChange(item: HTMLElement, from: number) {
    const items = this.getItems();
    const to = items.indexOf(item);
    if (to !== from) {
      this.orderChange.emit({ keys: items.map(each => this.keyOf(each)), key: this.keyOf(item), from, to });
    }
  }

  private pickUp(item: HTMLElement) {
    this.grab = { item, from: this.getItems().indexOf(item) };
    this.sync();
    this.announce(this.getLabels().grabbed, item);
  }

  private drop() {
    const grab = this.grab;
    if (!grab) {
      return;
    }
    this.grab = null;
    this.sync();
    this.announce(this.getLabels().dropped, grab.item);
    this.emitChange(grab.item, grab.from);
  }

  private cancel() {
    const grab = this.grab;
    if (!grab) {
      return;
    }
    this.grab = null;
    this.moveTo(grab.item, grab.from);
    this.sync();
    this.announce(this.getLabels().cancelled, grab.item);
  }

  private moveByButton(item: HTMLElement, step: -1 | 1) {
    const from = this.getItems().indexOf(item);
    if (this.grab) {
      this.drop();
    }
    this.moveTo(item, from + step);
    this.announce(this.getLabels().moved, item);
    this.emitChange(item, from);
    // A button that became unavailable (an end of the list) with the focus: the focus goes to the other one.
    const focused = document.activeElement as HTMLButtonElement | null;
    if (focused?.disabled && item.contains(focused)) {
      item.querySelector<HTMLButtonElement>('.ds-sortable__move:not(:disabled)')?.focus();
    }
  }

  //#endregion

  //#region EVENTS

  /** The item of an event on the item itself (not on an element in it), `null` for another target. */
  private ownItem(target: EventTarget | null): HTMLElement | null {
    return target && this.items.has(target as HTMLElement) ? (target as HTMLElement) : null;
  }

  @Listen('keydown')
  keyDownHandler(event: KeyboardEvent) {
    const item = this.ownItem(event.target);
    if (!item || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!this.grab || this.grab.item !== item) {
      if (isSpace(event) || event.key === 'Enter') {
        event.preventDefault();
        if (!event.repeat) {
          this.pickUp(item);
        }
      }
      return;
    }

    const items = this.getItems();
    const index = items.indexOf(item);
    const isHorizontal = this.orientation === 'horizontal';
    const isRtl = isHorizontal && getComputedStyle(this.host).direction === 'rtl';
    const backKey = isHorizontal ? (isRtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const forwardKey = isHorizontal ? (isRtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    let to: number | undefined;

    if (event.key === backKey) {
      to = index - 1;
    } else if (event.key === forwardKey) {
      to = index + 1;
    } else if (event.key === 'Home') {
      to = 0;
    } else if (event.key === 'End') {
      to = items.length - 1;
    } else if (isSpace(event) || event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) {
        this.drop();
      }
      return;
    } else if (event.key === 'Escape') {
      // The cancel is the layer the key closes: not a dialog around the list.
      event.preventDefault();
      event.stopPropagation();
      this.cancel();
      return;
    } else {
      return;
    }

    event.preventDefault();
    if (to >= 0 && to < items.length && to !== index) {
      this.moveTo(item, to);
      this.announce(this.getLabels().moved, item);
    }
  }

  /** A click on the item itself without a pointer (`element.click()`: the button A of a game pad): picks it up, or drops it. */
  @Listen('click')
  clickHandler(event: MouseEvent) {
    const item = this.ownItem(event.target);
    if (item && event.detail === 0) {
      if (this.grab?.item === item) {
        this.drop();
      } else {
        this.pickUp(item);
      }
    }
  }

  /** The focus leaves the item picked up (Tab, a click elsewhere): it is dropped where it is. */
  @Listen('focusout')
  focusOutHandler(event: FocusEvent) {
    if (this.grab && event.target === this.grab.item) {
      this.drop();
    }
  }

  //#endregion

  render() {
    const orientation = DS_SORTABLE_ORIENTATIONS.includes(this.orientation) ? this.orientation : 'vertical';
    const label = this.label?.trim();

    return (
      <Host
        class={{
          ...toClassList('ds-sortable', this.mods),
          [`--${orientation}`]: true,
          '--buttons': !!this.buttons,
          '--sorting': this.isSorting,
        }}
        role="list"
        aria-label={label || undefined}
      ></Host>
    );
  }
}
