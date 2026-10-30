import { Component, Event, EventEmitter, h, Host, Method, Prop } from '@stencil/core';
import debounce from '../../utils/debounce';
import { fromJSON } from '../../utils/props';
import { getBreakpoint, getParamsForBreakpoint, getStylesJSON, processBreakpoints } from '../../utils/responsive';
import { Breakpoint, Breakpoints, RawBreakpoint } from '../../utils/interfaces/sass-styles';

@Component({
  tag: 'ds-rsp',
})
export class DSRsp {
  breakpoints: Breakpoints;
  currentBreakpoint: Breakpoint;
  subscribers: Element[] = [];
  waitingSubscribers: Element[] = [];

  @Prop() debounceDelay = 500;
  @Prop() subscriberSelector = '[data-use-rsp]:not([data-rsp-init])';
  @Prop() propertyName = 'data-rsp';
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: Record<string, number>;

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
    this.breakpoints = this.breakpointsFromProp ? fromJSON(this.breakpointsFromProp) : await this.getBreakpoints();
  }

  componentDidLoad() {
    this.waitingSubscribers = Array.from(document.querySelectorAll(this.subscriberSelector));
    window.addEventListener('resize', debounce(this.notifySubscribers, this.debounceDelay), false);
    this.notifySubscribers();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', debounce(this.notifySubscribers, this.debounceDelay));
    const subscribers = document.querySelectorAll('[data-use-rsp]');
    subscribers.forEach(subscriber => subscriber.removeEventListener('breakpointChange', this.breakpointChangeHandler));
  }

  initSubscribers = () => {
    this.waitingSubscribers.forEach(subscriber => {
      const paramsFormProps = fromJSON(subscriber.getAttribute('data-rsp'));
      const minBreakpointParams: { xxs?: Record<string, unknown> } = {};

      if (paramsFormProps && !paramsFormProps.xxs) {
        const changingProps = [];
        Object.values(paramsFormProps).map(params => {
          Object.keys(params).map(key => {
            if (!changingProps.includes(key)) {
              changingProps.push(key);
            }
          });
        });
        if (changingProps.length) {
          minBreakpointParams.xxs = {};
          changingProps.map(prop => (minBreakpointParams['xxs'][prop] = subscriber.getAttribute(prop)));
        }
      }

      const responsiveParams = JSON.stringify({ ...minBreakpointParams, ...paramsFormProps });

      subscriber.setAttribute('data-use-rsp', 'true');
      subscriber.setAttribute('data-rsp', responsiveParams);
      subscriber['data-rsp-init'] = 'true';
      subscriber.addEventListener('breakpointChange', this.breakpointChangeHandler, false);
    });
    this.subscribers = [...this.waitingSubscribers];
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
        isGrowing: newBreakpoint.limits[1] > previousBreakpoint?.limits[1],
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

    const attributeValue = (element as Element).getAttribute(this.propertyName);
    const params: { [breakpointLabel: string]: Record<string, unknown> } = fromJSON(attributeValue) || {};

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
