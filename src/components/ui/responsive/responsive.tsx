import { Component, h, Host } from '@stencil/core';
import { AnyHTMLElement, Prop } from '@stencil/core/internal';
import Breakpoint from '../../../interfaces/breakpoint';
import { getBreakpoint, getStylesJSON } from '../../../tools/sass';
import debounce from '../../../tools/debounce';
import _ds from '../../../dot-stash';

@Component({
  tag: 'ds-rsp',
})
export class DSRsp {
  @Prop() debounceDelay = 200;
  @Prop() subscriberSelector = '[data-use-rsp]';
  @Prop() propertyName = 'data-rsp';
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: string | Record<string, unknown>;

  private breakpoints: Breakpoint[];
  private currentBreakpoint: Breakpoint;

  constructor() {
    this.notifySubscribers = this.notifySubscribers.bind(this);
  }

  componentWillLoad() {
    this.breakpoints = _ds.props.fromJSON(this.breakpointsFromProp);
  }

  componentDidLoad() {
    const { breakpoints } = getStylesJSON();
    this.breakpoints = breakpoints;
    window.addEventListener('resize', this.notifySubscribers, false);
    const subscribers = document.querySelectorAll(this.subscriberSelector);
    subscribers.forEach(subscriber => subscriber.addEventListener('breakpointChange', this.breakpointChangeHandler, false));
    this.notifySubscribers();
  }

  register() {}

  disconnectedCallback() {
    window.removeEventListener('resize', this.notifySubscribers);
    const subscribers = document.querySelectorAll(this.subscriberSelector);
    subscribers.forEach(subscriber => subscriber.removeEventListener('breakpointChange', this.breakpointChangeHandler));
  }

  notifySubscribers = debounce((): void => {
    this.currentBreakpoint = getBreakpoint(this.breakpoints);
    const eventDetails = {
      current: this.currentBreakpoint,
      all: this.breakpoints,
    };
    const event = new CustomEvent('breakpointChange', { detail: eventDetails });
    const subscribers = document.querySelectorAll(this.subscriberSelector);
    subscribers.forEach(element => element.dispatchEvent(event));
  }, this.debounceDelay);

  breakpointChangeHandler(event: CustomEvent) {
    const {
      target: element,
      detail: { current },
    } = event;
    const attributeValue = (element as AnyHTMLElement).getAttribute(this.propertyName);
    const params: Record<string, unknown> = (typeof attributeValue === 'string' ? JSON.parse(attributeValue) : attributeValue) || {};
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
