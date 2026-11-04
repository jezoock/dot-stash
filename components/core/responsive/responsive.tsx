import { Component, Event, EventEmitter, h, Host, Method, Prop, Watch } from '@stencil/core';
import debounce from '../../utils/debounce';
import { fromJSON } from '../../utils/props';
import { getBreakpoint, getParamsForBreakpoint, processBreakpoints } from '../../utils/responsive';
import { getBreakpoints as getThemeBreakpoints, getToken } from '../../utils/tokens';
import { Breakpoint, BreakpointChangeDetail, Breakpoints, RawBreakpoint } from '../../utils/interfaces/breakpoints';

/** `hGap` → `h-gap`: the attribute of a camelCase property. */
const toKebabCase = (name: string): string => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/** Whether two breakpoints have the same label and limits. */
const isSameBreakpoint = (a: Breakpoint | undefined, b: Breakpoint | undefined): boolean => a?.label === b?.label && String(a?.limits) === String(b?.limits);

/** Whether an event is the `load` event of a stylesheet `<link>`. */
const isStylesheetLoad = (event: Event): boolean => {
  const target = event.target as Element;
  return target?.nodeName?.toLowerCase() === 'link' && /(^|\s)stylesheet(\s|$)/i.test(target.getAttribute?.('rel') ?? '');
};

/**
 * Tracks the theme breakpoints and, when the breakpoint changes, sets on the elements with a `data-use-rsp`
 * attribute the properties their `data-rsp` attribute declares for it (see the README).
 * Subscribers added later (`subscribe()`, or inserted in the document) get the params of the current breakpoint at once.
 * The theme breakpoints are its `--ds-bp-labels` and `--ds-bp-<label>` custom properties (`tokens.getBreakpoints()`).
 * Without breakpoints (theme stylesheet not loaded and no `breakpoints` property) it only logs a warning, and starts
 * when `refresh()` finds some: ds-rsp calls it when a stylesheet `<link>` loads.
 */
@Component({
  tag: 'ds-rsp',
})
export class DSRsp {
  breakpoints: Breakpoints = {};
  currentBreakpoint: Breakpoint;
  subscribers: Element[] = [];
  waitingSubscribers: Element[] = [];
  /** The debounced `resize` listener, kept so that the same function is removed. */
  resizeHandler: () => void;
  /** Subscribes the matching elements inserted in the document later (when the browser has MutationObserver). */
  observer: MutationObserver;
  /** Whether componentDidLoad ran. */
  loaded = false;
  /** Whether the element is in the document. */
  connected = false;
  /** Whether it tracks the breakpoints: it has some, listens to `resize` and has initialised its subscribers. */
  started = false;
  /** Whether the "no breakpoints" warning was logged since breakpoints were last found, so that it is logged once. */
  warnedNoBreakpoints = false;

  @Prop() debounceDelay = 500;
  @Prop() subscriberSelector = '[data-use-rsp]:not([data-rsp-init])';
  @Prop() propertyName = 'data-rsp';
  /**
   * Breakpoints to use instead of the theme ones: label: minimum width in px.
   * As an attribute, a JSON string: `breakpoints='{"sm": 0, "lg": 992}'`. A new value is applied as by `refresh()`.
   */
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: string | RawBreakpoint;

  @Watch('breakpointsFromProp')
  breakpointsFromPropChanged() {
    this.update();
  }

  /**
   * Adds a subscriber. Once ds-rsp has started, the element gets the params of the current breakpoint at once
   * (before, when ds-rsp starts).
   */
  @Method()
  async subscribe(target: Element): Promise<void> {
    this.addSubscribers([target]);
  }

  /**
   * Reads the breakpoints again (from the `breakpoints` property, else from the theme custom properties) and applies them:
   * subscribes the matching elements not subscribed yet, sets the params of the current breakpoint on every subscriber
   * again, and emits `breakpointChange` only when the label or the limits of the current breakpoint changed.
   * Without breakpoints until then (theme stylesheet loaded after ds-rsp), it starts, as when the theme is there at load.
   * When it finds none, it keeps the current ones (if any) and logs a warning, once until it finds some again.
   *
   * ds-rsp calls it when a stylesheet `<link>` of the document loads (a theme added, or its `href` changed). Call it after
   * changing the theme otherwise: a `<style>` element, a constructed stylesheet, a `media` attribute changed after the load…
   * Before ds-rsp has loaded, it does nothing: ds-rsp reads the breakpoints when it loads.
   */
  @Method()
  async refresh(): Promise<void> {
    this.update();
  }

  @Method()
  async getData(): Promise<{ breakpoints: Breakpoints }> {
    return { breakpoints: this.breakpoints };
  }

  @Method()
  async getSubscribers() {
    return Array.from(document.querySelectorAll('[data-use-rsp]'));
  }

  // The breakpoint methods below delegate to the pure functions of utils/responsive and utils/tokens.

  @Method()
  async processBreakpoints(breakpoints: RawBreakpoint): Promise<Breakpoints> {
    return processBreakpoints(breakpoints);
  }

  /** The theme breakpoints (`tokens.getBreakpoints()`), as limits: `{ xxs: [0, 575], …, xxl: [1600] }`; `{}` without the theme. */
  @Method()
  async getBreakpoints(): Promise<Breakpoints> {
    return processBreakpoints(getThemeBreakpoints());
  }

  @Method()
  async getCurrentBreakpoint(): Promise<Breakpoint> {
    return this.currentBreakpoint;
  }

  /**
   * Get the current breakpoint
   * @param rawBreakpoints JSON Object containings all breakpoints
   * @returns current breakpoint ( label & limits )
   */
  @Method()
  async getBreakpoint(rawBreakpoints: { [label: string]: number[] }): Promise<Breakpoint> {
    return getBreakpoint(rawBreakpoints);
  }

  @Method()
  async getParamsForBreakpoint(currentBreakpoint: Breakpoint, params: { [breakpointLabel: string]: Record<string, unknown> }) {
    return getParamsForBreakpoint(currentBreakpoint, params, this.breakpoints);
  }

  /**
   * Emitted by ds-rsp when the breakpoint changes (and when it starts), once the subscribers have their params.
   * It bubbles. Each subscriber also receives a `breakpointChange` event on itself, which does not bubble: a
   * subscriber that contains ds-rsp gets both, and should only handle the one whose target is itself.
   */
  @Event() breakpointChange: EventEmitter<BreakpointChangeDetail>;

  constructor() {
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.breakpointChangeHandler = this.breakpointChangeHandler.bind(this);
    this.stylesheetLoadHandler = this.stylesheetLoadHandler.bind(this);
  }

  connectedCallback() {
    this.connected = true;
    // componentDidLoad only runs once: start again when the element is moved or put back in the document.
    if (this.loaded) {
      this.listenToStylesheets();
      this.update();
    }
  }

  componentDidLoad() {
    this.loaded = true;
    this.listenToStylesheets();
    this.update();
  }

  disconnectedCallback() {
    this.connected = false;
    document.removeEventListener('load', this.stylesheetLoadHandler, true);
    this.stop();
  }

  /** The breakpoints, as limits: from the `breakpoints` property, else from the theme; `{}` without any. */
  readBreakpoints(): Breakpoints {
    if (this.breakpointsFromProp) {
      try {
        return processBreakpoints(fromJSON(this.breakpointsFromProp) as RawBreakpoint);
      } catch {
        console.warn(`[ds-rsp] the breakpoints property is not valid JSON, it is ignored: ${this.breakpointsFromProp}`);
        return {};
      }
    }

    // Checked first, so that ds-rsp logs its own warning instead of the one of getBreakpoints().
    return getToken('bp-labels') ? processBreakpoints(getThemeBreakpoints()) : {};
  }

  /** Reads the breakpoints again and applies them (see `refresh()`). */
  update() {
    if (!this.loaded || !this.connected) {
      return;
    }

    const breakpoints = this.readBreakpoints();

    if (!Object.keys(breakpoints).length) {
      if (!this.warnedNoBreakpoints) {
        this.warnedNoBreakpoints = true;
        console.warn(
          this.started
            ? '[ds-rsp] refresh: no breakpoints found (theme stylesheet removed, or not loaded yet): the current ones are kept.'
            : '[ds-rsp] no breakpoints: load the theme stylesheet (its --ds-bp-labels and --ds-bp-<label> custom properties) or set the breakpoints property. Breakpoint changes are not tracked until refresh() finds some (ds-rsp calls it when a stylesheet <link> loads).',
        );
      }
      return;
    }

    this.warnedNoBreakpoints = false;
    this.breakpoints = breakpoints;

    if (!this.started) {
      this.start();
      return;
    }

    this.addSubscribers(Array.from(document.querySelectorAll(this.subscriberSelector)));

    // Without a change, no event: the params are set again on the subscribers here.
    if (!this.notifySubscribers()) {
      this.subscribers.forEach(subscriber => this.applyParams(subscriber, this.currentBreakpoint));
    }
  }

  /** A stylesheet `<link>` loaded (`load` does not bubble: listened to on the document, in the capture phase). */
  stylesheetLoadHandler(event: Event) {
    if (!this.breakpointsFromProp && isStylesheetLoad(event)) {
      this.update();
    }
  }

  listenToStylesheets() {
    document.addEventListener('load', this.stylesheetLoadHandler, true);
  }

  /** Collects the subscribers, listens to `resize` and to the insertions in the document, and applies the current breakpoint. */
  start() {
    this.started = true;
    if (!this.resizeHandler) {
      this.resizeHandler = debounce(this.notifySubscribers, this.debounceDelay);
    }
    const subscribers = Array.from(document.querySelectorAll(this.subscriberSelector));
    this.waitingSubscribers = Array.from(new Set([...this.waitingSubscribers, ...subscribers]));
    window.addEventListener('resize', this.resizeHandler, false);
    this.observe();
    this.notifySubscribers();
  }

  /** Stops listening, and lets the subscribers go (they keep their current params). */
  stop() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler, false);
    }
    this.observer?.disconnect();
    this.observer = undefined;
    this.subscribers.forEach(subscriber => {
      subscriber.removeEventListener('breakpointChange', this.breakpointChangeHandler, false);
      subscriber.removeAttribute('data-rsp-init');
    });
    this.subscribers = [];
    this.currentBreakpoint = undefined;
    this.started = false;
  }

  observe() {
    if (typeof MutationObserver === 'undefined' || this.observer) {
      return;
    }
    this.observer = new MutationObserver(records => this.mutationHandler(records));
    // data-use-rsp: a component can reflect it after ds-rsp has started (ds-grid does).
    this.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-use-rsp'] });
  }

  /** Subscribes the inserted elements (and their descendants), and the elements that got a data-use-rsp attribute, that match the subscriber selector. */
  mutationHandler(records: MutationRecord[]) {
    const elements: Element[] = [];

    records.forEach(({ type, target, addedNodes }) => {
      if (type === 'attributes') {
        if ((target as Element).matches(this.subscriberSelector)) {
          elements.push(target as Element);
        }
        return;
      }
      Array.from(addedNodes)
        .filter((node): node is Element => node.nodeType === 1)
        .forEach(element => {
          if (element.matches(this.subscriberSelector)) {
            elements.push(element);
          }
          elements.push(...Array.from(element.querySelectorAll(this.subscriberSelector)));
        });
    });

    if (elements.length) {
      this.addSubscribers(elements);
    }
  }

  /** Adds subscribers; once ds-rsp has started, they are initialised and get the params of the current breakpoint at once. */
  addSubscribers(elements: Element[]) {
    const newSubscribers = elements.filter(element => !this.subscribers.includes(element) && !this.waitingSubscribers.includes(element));
    this.waitingSubscribers = [...this.waitingSubscribers, ...newSubscribers];

    if (this.currentBreakpoint) {
      const subscribers = this.waitingSubscribers;
      this.initSubscribers();
      subscribers.forEach(subscriber => this.applyParams(subscriber, this.currentBreakpoint));
    }
  }

  /** The responsive params of an element (`{}`, with a warning, when its attribute is not valid JSON). */
  readParams(element: Element): { [breakpointLabel: string]: Record<string, unknown> } {
    const attributeValue = element.getAttribute(this.propertyName);
    try {
      return fromJSON(attributeValue) || {};
    } catch {
      console.warn(`[ds-rsp] the ${this.propertyName} attribute is not valid JSON, it is ignored: ${attributeValue}`, element);
      return {};
    }
  }

  /**
   * The current value of a property of an element: the property itself (a component's camelCase property such as
   * `hGap` included), else its attribute (`h-gap`, or the name as written), else `null`.
   */
  readInitialValue(element: Element, prop: string): unknown {
    const value = element[prop];
    return value !== undefined ? value : (element.getAttribute(toKebabCase(prop)) ?? element.getAttribute(prop));
  }

  initSubscribers = () => {
    // The smallest breakpoint gets the initial values of the changing properties, so that they come back on small screens.
    const [smallestLabel] = Object.keys(this.breakpoints);

    this.waitingSubscribers.forEach(subscriber => {
      const paramsFormProps = this.readParams(subscriber);
      const minBreakpointParams: { [breakpointLabel: string]: Record<string, unknown> } = {};

      if (!paramsFormProps[smallestLabel]) {
        const changingProps = [];
        Object.values(paramsFormProps).map(params => {
          Object.keys(params).map(key => {
            if (!changingProps.includes(key)) {
              changingProps.push(key);
            }
          });
        });
        if (changingProps.length) {
          minBreakpointParams[smallestLabel] = {};
          changingProps.map(prop => (minBreakpointParams[smallestLabel][prop] = this.readInitialValue(subscriber, prop)));
        }
      }

      const responsiveParams = JSON.stringify({ ...minBreakpointParams, ...paramsFormProps });

      subscriber.setAttribute('data-use-rsp', 'true');
      subscriber.setAttribute(this.propertyName, responsiveParams);
      // An attribute, so that the default subscriber selector (`:not([data-rsp-init])`) skips this element from now on.
      subscriber.setAttribute('data-rsp-init', 'true');
      subscriber.addEventListener('breakpointChange', this.breakpointChangeHandler, false);
    });
    this.subscribers = [...this.subscribers, ...this.waitingSubscribers];
    this.waitingSubscribers = [];
  };

  /** Applies the breakpoint of the window width when it changed (label or limits): returns whether it did. */
  notifySubscribers(): boolean {
    const { currentBreakpoint: previousBreakpoint } = this;
    const newBreakpoint = getBreakpoint(this.breakpoints, window.innerWidth);

    if (isSameBreakpoint(newBreakpoint, previousBreakpoint)) {
      return false;
    }

    this.currentBreakpoint = newBreakpoint;
    this.initSubscribers();
    const detail: BreakpointChangeDetail = {
      all: this.breakpoints,
      current: this.currentBreakpoint,
      previous: previousBreakpoint,
      // Compared on the minimum: the last breakpoint has no maximum.
      isGrowing: previousBreakpoint !== undefined && newBreakpoint.limits[0] > previousBreakpoint.limits[0],
    };

    // On each subscriber, an event that does not bubble: its own listeners, and ds-rsp's, which sets its params.
    const event = new CustomEvent('breakpointChange', { detail });
    document.querySelectorAll('[data-use-rsp]').forEach(element => element.dispatchEvent(event));

    // Then from ds-rsp, for the page: it bubbles.
    this.breakpointChange.emit(detail);
    return true;
  }

  /** Sets on an element the params its `data-rsp` attribute declares for a breakpoint. */
  applyParams(element: Element, breakpoint: Breakpoint) {
    const params = getParamsForBreakpoint(breakpoint, this.readParams(element), this.breakpoints);

    if (params) {
      Object.entries(params).forEach(([prop, value]) => {
        element[prop] = value;
      });
    }
  }

  breakpointChangeHandler(event: CustomEvent<BreakpointChangeDetail>) {
    // Only the event dispatched on the subscriber, not the one ds-rsp emits, which bubbles up to a subscriber that contains it.
    if (event.target === event.currentTarget) {
      this.applyParams(event.currentTarget as Element, event.detail.current);
    }
  }

  render() {
    return <Host />;
  }
}
