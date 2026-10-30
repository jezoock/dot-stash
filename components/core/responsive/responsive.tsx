import { Component, Event, EventEmitter, h, Host, Method, Prop } from '@stencil/core';
import debounce from '../../utils/debounce';
import { fromJSON } from '../../utils/props';
import { getBreakpoint, getParamsForBreakpoint, getStylesJSON, processBreakpoints } from '../../utils/responsive';
import { Breakpoint, BreakpointChangeDetail, Breakpoints, RawBreakpoint } from '../../utils/interfaces/sass-styles';

/** `hGap` → `h-gap`: the attribute of a camelCase property. */
const toKebabCase = (name: string): string => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/**
 * Tracks the theme breakpoints and, when the breakpoint changes, sets on the elements with a `data-use-rsp`
 * attribute the properties their `data-rsp` attribute declares for it (see the README).
 * Subscribers added later (`subscribe()`, or inserted in the document) get the params of the current breakpoint at once.
 * Without breakpoints (theme stylesheet not loaded and no `breakpoints` property) it only logs a warning.
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

  @Prop() debounceDelay = 500;
  @Prop() subscriberSelector = '[data-use-rsp]:not([data-rsp-init])';
  @Prop() propertyName = 'data-rsp';
  /**
   * Breakpoints to use instead of the theme ones, as Sass writes them: label: minimum width in px.
   * As an attribute, a JSON string: `breakpoints='{"sm": 0, "lg": 992}'`.
   */
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: string | RawBreakpoint;

  /**
   * Adds a subscriber. Once ds-rsp has started, the element gets the params of the current breakpoint at once
   * (before, when ds-rsp starts).
   */
  @Method()
  async subscribe(target: Element): Promise<void> {
    this.addSubscribers([target]);
  }

  @Method()
  async getData(): Promise<{ breakpoints: Breakpoints }> {
    return { breakpoints: this.breakpoints };
  }

  @Method()
  async getSubscribers() {
    return Array.from(document.querySelectorAll('[data-use-rsp]'));
  }

  // The breakpoint methods below delegate to the pure functions of utils/responsive.

  @Method()
  async processBreakpoints(breakpoints: RawBreakpoint): Promise<Breakpoints> {
    return processBreakpoints(breakpoints);
  }

  @Method()
  async getBreakpoints(): Promise<Breakpoints> {
    const { breakpoints } = getStylesJSON();
    return this.processBreakpoints(breakpoints);
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
  }

  async componentWillLoad() {
    this.breakpoints = this.breakpointsFromProp ? processBreakpoints(fromJSON(this.breakpointsFromProp)) : await this.getBreakpoints();

    if (!this.hasBreakpoints()) {
      console.warn(
        '[ds-rsp] no breakpoints: load the theme stylesheet (it writes them in the content of body::before) or set the breakpoints property. Breakpoint changes are not tracked.',
      );
    }
  }

  componentDidLoad() {
    if (this.hasBreakpoints()) {
      this.resizeHandler = debounce(this.notifySubscribers, this.debounceDelay);
      this.start();
    }
  }

  connectedCallback() {
    // componentDidLoad only runs once: start again when the element is moved or put back in the document.
    if (this.resizeHandler) {
      this.start();
    }
  }

  disconnectedCallback() {
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
  }

  hasBreakpoints(): boolean {
    return Object.keys(this.breakpoints ?? {}).length > 0;
  }

  /** Collects the subscribers, listens to `resize` and to the insertions in the document, and applies the current breakpoint. */
  start() {
    const subscribers = Array.from(document.querySelectorAll(this.subscriberSelector));
    this.waitingSubscribers = Array.from(new Set([...this.waitingSubscribers, ...subscribers]));
    window.addEventListener('resize', this.resizeHandler, false);
    this.observe();
    this.notifySubscribers();
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

  notifySubscribers() {
    const { currentBreakpoint: previousBreakpoint } = this;
    const newBreakpoint = getBreakpoint(this.breakpoints);

    if (newBreakpoint.label === previousBreakpoint?.label) {
      return;
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
