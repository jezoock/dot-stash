import { Component, Event, EventEmitter, h, Host } from '@stencil/core/internal';
import { Method, Prop } from '@stencil/core/internal';
import debounce from '../../utils/debounce';
import _ds from '../../utils/dot-stash';
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

  @Method()
  async getCurrentBreakpoint() : Promise<Breakpoint> {
    return this.currentBreakpoint;
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
      /* const [minBreakPointLabel, [minBreakpointValue]] = breakpoints.shift(); */
      const [maxBreakPointLabel, [maxBreakpointValue]] = breakpoints.pop();
      
      /* if (windowWidth < minBreakpointValue) {

        currentBreakpoint.label = minBreakPointLabel;
        currentBreakpoint.limits = [0, minBreakpointValue];

      } else  */if (windowWidth >= maxBreakpointValue) {

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

  @Method()
  async getParamsForBreakpoint(currentBreakpoint: Breakpoint, params: { [breakpointLabel: string]: Record<string, unknown> }) {
    let currentBreakpointParams: Record<string, unknown>;
    const {label, limits: [,max]} = currentBreakpoint;
    
    if (params[label]) {
      currentBreakpointParams = params[label];

    } else {
      /* const labels = Object.keys(params);
      const paramsBreakpointLimits = labels.map(breakpointLabel => ({limit: this.breakpoints[breakpointLabel][1], label: breakpointLabel})); */

      Object.keys(params).map(breakpointLabel => {
        if (this.breakpoints[breakpointLabel][1] < max) {
          currentBreakpointParams = params[breakpointLabel];
        }
      });

      /* for (const breakpointLabel in params) {
        const [,breakpointMax] = this.breakpoints[breakpointLabel]
        paramsBreakpointLimits.push([breakpointMax, breakpointLabel]);
      } */

      /* paramsBreakpointLimits.map( ({limit, label}) => {
        if (limit < max) {
          currentBreakpointParams = params[label];
        }
      }) */
    }

    return currentBreakpointParams;
    
    
    
    /* for (const breakpointLabel in params) {
      if (label === breakpointLabel) {
        return params[breakpointLabel];
      }
      const [,paramsMax] = this.breakpoints[breakpointLabel];
      if (paramsMax > max) {
        return currentBreakpointParams || params[breakpointLabel];
      } else {
        currentBreakpointParams = params[breakpointLabel];
      }
    } */
    
  }

  @Event() breakpointChange: EventEmitter;

  constructor() {
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.breakpointChangeHandler = this.breakpointChangeHandler.bind(this);
    
  }

  async componentWillLoad() {
    this.breakpoints = this.breakpointsFromProp ? _ds.props.fromJSON(this.breakpointsFromProp) : await this.getBreakpoints();
  }

  componentDidLoad() {
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
      const paramsFormProps = _ds.props.fromJSON(subscriber.getAttribute("data-rsp"));
      const minBreakpointParams: { xxs?: Record<string, unknown> } = {};

      if (paramsFormProps && !paramsFormProps.xxs) {
        const changingProps = [];
        Object.values(paramsFormProps).map( params => {
          Object.keys(params).map( key => {
            if (!changingProps.includes(key)) {
              changingProps.push(key);
            }
          })
        })
        if (changingProps.length) {
          minBreakpointParams.xxs = {};
          changingProps.map( prop => minBreakpointParams["xxs"][prop] = subscriber.getAttribute(prop));
        }
      }

      const responsiveParams = JSON.stringify({ ...minBreakpointParams, ...paramsFormProps });

      subscriber.setAttribute("data-use-rsp", "true");
      subscriber.setAttribute("data-rsp", responsiveParams);
      subscriber["data-rsp-init"] = "true";
      subscriber.addEventListener('breakpointChange', this.breakpointChangeHandler, false)
    });
    this.subscribers = [ ...this.waitingSubscribers ];
    this.waitingSubscribers = [];
  }
  
  async notifySubscribers() {
    const {currentBreakpoint: previousBreakpoint} = this;
    const newBreakpoint = await this.getBreakpoint(this.breakpoints);
    if (newBreakpoint.label !== previousBreakpoint?.label) {
      this.currentBreakpoint = newBreakpoint;
      this.initSubscribers();
      const eventDetails = {
        all: this.breakpoints,
        current: this.currentBreakpoint,
        previous: previousBreakpoint,
        isGrowing: newBreakpoint.limits[1] > previousBreakpoint?.limits[1]
      };
      const event = new CustomEvent('breakpointChange', { detail: eventDetails });
      const subscribers = document.querySelectorAll("[data-use-rsp]");
  
      subscribers.forEach(element => element.dispatchEvent(event));

      // Needs testing as triggering component event might also trigger the event for registred components a second time
      // this.breakpointChange.emit(eventDetails);
    }
  }

  async breakpointChangeHandler(event: CustomEvent<{current: Breakpoint}>) {
    const {
      target: element,
      detail: { current },
    } = event;

    /* console.log(event.target); */

    const attributeValue = (element as Element).getAttribute(this.propertyName);
    const params: { [breakpointLabel: string]: Record<string, unknown> } = _ds.props.fromJSON(attributeValue) || {};
    
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
