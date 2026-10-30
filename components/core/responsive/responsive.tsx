import { Component, Event, EventEmitter, h, Host, Method, Prop } from '@stencil/core';
import debounce from '../../utils/debounce';
import { fromJSON } from '../../utils/props';
import { getBreakpoint, getParamsForBreakpoint, getStylesJSON, processBreakpoints } from '../../utils/responsive';
import { Breakpoint, Breakpoints, RawBreakpoint } from '../../utils/interfaces/sass-styles';

/**
 * Tracks the theme breakpoints and, when the breakpoint changes, sets on the elements with a `data-use-rsp`
 * attribute the properties their `data-rsp` attribute declares for it (see the README).
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

  @Prop() debounceDelay = 500;
  @Prop() subscriberSelector = '[data-use-rsp]:not([data-rsp-init])';
  @Prop() propertyName = 'data-rsp';
  /**
   * Breakpoints to use instead of the theme ones, as Sass writes them: label: minimum width in px.
   * As an attribute, a JSON string: `breakpoints='{"sm": 0, "lg": 992}'`.
   */
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: string | RawBreakpoint;

  @Method()
  async subscribe(target: Element) {
    return this.waitingSubscribers.push(target);
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

  @Event() breakpointChange: EventEmitter;

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

  /** Collects the subscribers, listens to `resize` and applies the current breakpoint. */
  start() {
    const subscribers = Array.from(document.querySelectorAll(this.subscriberSelector));
    this.waitingSubscribers = Array.from(new Set([...this.waitingSubscribers, ...subscribers]));
    window.addEventListener('resize', this.resizeHandler, false);
    this.notifySubscribers();
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
          changingProps.map(prop => (minBreakpointParams[smallestLabel][prop] = subscriber.getAttribute(prop)));
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

  async notifySubscribers() {
    const { currentBreakpoint: previousBreakpoint } = this;
    const newBreakpoint = await this.getBreakpoint(this.breakpoints);
    if (newBreakpoint.label !== previousBreakpoint?.label) {
      this.currentBreakpoint = newBreakpoint;
      this.initSubscribers();
      const eventDetails = {
        all: this.breakpoints,
        current: this.currentBreakpoint,
        previous: previousBreakpoint,
        // Compared on the minimum: the last breakpoint has no maximum.
        isGrowing: previousBreakpoint !== undefined && newBreakpoint.limits[0] > previousBreakpoint.limits[0],
      };
      const event = new CustomEvent('breakpointChange', { detail: eventDetails });
      const subscribers = document.querySelectorAll('[data-use-rsp]');

      subscribers.forEach(element => element.dispatchEvent(event));

      // The breakpointChange @Event is not emitted here: it might reach the registered
      // components a second time (needs testing).
    }
  }

  async breakpointChangeHandler(event: CustomEvent<{ current: Breakpoint }>) {
    const {
      target: element,
      detail: { current },
    } = event;

    const params = this.readParams(element as Element);

    // Calculate limits from parameters
    const breakpointParams = await this.getParamsForBreakpoint(current, params);

    if (breakpointParams) {
      Object.entries(breakpointParams).map(([prop, value]) => {
        element[prop] = value;
      });
    }
  }

  render() {
    return <Host />;
  }
}
