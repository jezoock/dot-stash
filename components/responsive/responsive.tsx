import { Component, h, Host } from '@stencil/core/internal';
import { Method, Prop } from '@stencil/core/internal';
import debounce from '../tools/debounce';
import _ds from '../dot-stash';
import { Breakpoint, Breakpoints, RawBreakpoint } from '../interfaces/sass-styles';

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
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: string | Record<string, unknown>;

  @Method()
  async subscribe(target: Element) {
    return this.waitingSubscribers.push(target);
  }

  @Method()
  async getData(): Promise<{ breakpoints: Breakpoints}> {
    return { breakpoints: this.breakpoints };
  }

  @Method()
  async getSubscribers() {
    return Array.from(document.querySelectorAll("[data-use-rsp]"));
  }

  @Method()
  async processBreakpoints(breakpoints: RawBreakpoint): Promise<Breakpoints> {
    const newBreakpoints = Object.entries(breakpoints);
    const [firstBreakpointLabel, firstBreakpointValue] = newBreakpoints.shift();
    const processedBreakpoints: Breakpoints = { [firstBreakpointLabel]: [0, firstBreakpointValue] };
    let previousBreakpoint = '';
    newBreakpoints.map( ([breakpointLabel, breakpointValue], index) => {
      processedBreakpoints[breakpointLabel] = [breakpointValue];
      if (index > 0) {
        processedBreakpoints[previousBreakpoint].push(breakpointValue as number - 1);
      }
      previousBreakpoint = breakpointLabel;
    });
    return processedBreakpoints;
  }

  @Method()
  async getBreakpoints(): Promise<Breakpoints> {
    const { breakpoints } = _ds.tools.getStylesJSON();
    return this.processBreakpoints(breakpoints);
  }

  /**
   * Get the current breakpoint
   * @param rawBreakpoints JSON Object containings all breakpoints
   * @returns current breakpoint ( label & limits )
   */
  @Method()
  async getBreakpoint(rawBreakpoints: {[label: string]: number[]; }): Promise<Breakpoint> {
    const currentBreakpoint: Breakpoint = {
      label: '',
      limits: [],
    };

    const windowWidth = window.innerWidth;
    const breakpoints = Object.entries(rawBreakpoints);
    
    if (breakpoints?.length > 0) {
      const [minBreakPointLabel, [minBreakpointValue]] = breakpoints.shift();
      const [maxBreakPointLabel, [maxBreakpointValue]] = breakpoints.pop();
      
      if (windowWidth < minBreakpointValue) {

        currentBreakpoint.label = minBreakPointLabel;
        currentBreakpoint.limits = [0, minBreakpointValue];

      } else if (windowWidth >= maxBreakpointValue) {

        currentBreakpoint.label = maxBreakPointLabel;
        currentBreakpoint.limits = [maxBreakpointValue, windowWidth];

      } else {

        for (let index = 0; index < breakpoints.length; index++) {

          const loopBreakpoint = breakpoints[index];
          const [label, [min, max]] = loopBreakpoint;

          if (windowWidth < max) {

            currentBreakpoint.label = label;
            currentBreakpoint.limits = [min, max];
            break;
          }
        }
      }
    }

    return currentBreakpoint;
  }

  constructor() {
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.breakpointChangeHandler = this.breakpointChangeHandler.bind(this);
    
  }

  componentWillLoad() {
   // this.breakpoints = _ds.props.fromJSON(this.breakpointsFromProp);
  }

  async componentDidLoad() {
    this.breakpoints = await this.getBreakpoints();
    this.waitingSubscribers = Array.from(document.querySelectorAll(this.subscriberSelector));
    window.addEventListener('resize', debounce(this.notifySubscribers, this.debounceDelay), false);
    this.notifySubscribers();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', debounce(this.notifySubscribers, this.debounceDelay));
    const subscribers = document.querySelectorAll("[data-use-rsp]");
    subscribers.forEach(subscriber => subscriber.removeEventListener('breakpointChange', this.breakpointChangeHandler));
  }
  
  initSubscribers = () => {
    this.waitingSubscribers.forEach(subscriber => {
      subscriber.setAttribute("data-use-rsp", "true");
      subscriber["data-rsp-init"] = "true";
      subscriber.addEventListener('breakpointChange', this.breakpointChangeHandler, false)
    });
    this.subscribers = [ ...this.waitingSubscribers ];
    this.waitingSubscribers = [];
  }
  
  async notifySubscribers() {
    this.initSubscribers();
    this.currentBreakpoint = await this.getBreakpoint(this.breakpoints);
    const eventDetails = {
      current: this.currentBreakpoint,
      all: this.breakpoints,
    };
    const event = new CustomEvent('breakpointChange', { detail: eventDetails });
    const subscribers = document.querySelectorAll("[data-use-rsp]");

    subscribers.forEach(element => element.dispatchEvent(event));
  }

  breakpointChangeHandler(event: CustomEvent) {
    const {
      target: element,
      detail: { current },
    } = event;
    /* const attributeValue = (element as Element).getAttribute(this.propertyName); */
    /* const params: Record<string, unknown> = _ds.props.fromJSON(attributeValue) || {}; */
    // Calculate limits from parameters
    const breakpointParams = ''/* getParamsForBreakpoint(params, current, this.breakpoints) */;

    console.log(current)

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
