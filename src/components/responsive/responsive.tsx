import { Component, h, Host } from '@stencil/core';
import { Method, Prop } from '@stencil/core/internal';
import { getBreakpoint, getStylesJSON } from '../../tools/sass';
import debounce from '../../tools/debounce';
import _ds from '../../dot-stash';

export interface Breakpoint {
  label: string;
  group?: string;
  limits: number[];
}

@Component({
  tag: 'ds-rsp',
})
export class DSRsp {
  breakpoints: Breakpoint[];
  currentBreakpoint: Breakpoint;
  subscribers: Element[] = [];
  waitingSubscribers: Element[] = [];

  @Prop() debounceDelay = 200;
  @Prop() subscriberSelector = '[data-use-rsp]:not([data-rsp-init])';
  @Prop() propertyName = 'data-rsp';
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: string | Record<string, unknown>;

  @Method()
  async subscribe(target: Element) {
    return await this.waitingSubscribers.push(target);
  }

  @Method()
  async getData(): Promise<{ breakpoints: Breakpoint[]}> {
    return await { breakpoints: this.breakpoints };
  }

  @Method()
  async getSubscribers() {
    return await Array.from(document.querySelectorAll("[data-use-rsp]"));
  }

  constructor() {
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.breakpointChangeHandler = this.breakpointChangeHandler.bind(this);
  }

  componentWillLoad() {
   // this.breakpoints = _ds.props.fromJSON(this.breakpointsFromProp);
  }

  componentDidLoad() {
    const { breakpoints } = getStylesJSON();
    this.breakpoints = breakpoints;
    window.addEventListener('resize', this.notifySubscribers, false);
    this.notifySubscribers();
  }
  
  initSubscribers() {
    const allSubscribers = [
      ...Array.from(document.querySelectorAll(this.subscriberSelector)),
      ...this.waitingSubscribers
    ];
    allSubscribers.forEach(subscriber => {
      subscriber.setAttribute("data-use-rsp", "true");
      subscriber["data-rsp-init"] = "true";
      subscriber.addEventListener('breakpointChange', this.breakpointChangeHandler, false)
    });
    this.subscribers = [ ...allSubscribers ];
    this.waitingSubscribers = [];
  }
  
  disconnectedCallback() {
    window.removeEventListener('resize', this.notifySubscribers);
    const subscribers = document.querySelectorAll("[data-use-rsp]");
    subscribers.forEach(subscriber => subscriber.removeEventListener('breakpointChange', this.breakpointChangeHandler));
  }
  
  notifySubscribers = debounce((): void => {
    this.initSubscribers();

    this.currentBreakpoint = getBreakpoint(this.breakpoints);
    const eventDetails = {
      current: this.currentBreakpoint,
      all: this.breakpoints,
    };
    const event = new CustomEvent('breakpointChange', { detail: eventDetails });
    const subscribers = document.querySelectorAll("[data-use-rsp]");

    subscribers.forEach(element => element.dispatchEvent(event));
  }, this.debounceDelay);

  breakpointChangeHandler(event: CustomEvent): void {
    const {
      target: element,
      detail: { current },
    } = event;
    const attributeValue = (element as Element).getAttribute(this.propertyName);
    const params: Record<string, unknown> = _ds.props.fromJSON(attributeValue) || {};
    const breakpointParams = params[current.label];

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
