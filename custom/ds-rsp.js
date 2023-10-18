import { proxyCustomElement, HTMLElement, createEvent, h, Host } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const DSRsp = /*@__PURE__*/ proxyCustomElement(class DSRsp extends HTMLElement {
  async subscribe(target) {
    return this.waitingSubscribers.push(target);
  }
  async getData() {
    return { breakpoints: this.breakpoints };
  }
  async getSubscribers() {
    return Array.from(document.querySelectorAll("[data-use-rsp]"));
  }
  async processBreakpoints(breakpoints) {
    const newBreakpoints = Object.entries(breakpoints);
    const [firstBreakpointLabel, firstBreakpointValue] = newBreakpoints.shift();
    const processedBreakpoints = { [firstBreakpointLabel]: [0, firstBreakpointValue] };
    let previousBreakpoint = '';
    newBreakpoints.map(([breakpointLabel, breakpointValue], index) => {
      processedBreakpoints[breakpointLabel] = [breakpointValue];
      if (index > 0) {
        processedBreakpoints[previousBreakpoint].push(breakpointValue - 1);
      }
      previousBreakpoint = breakpointLabel;
    });
    return processedBreakpoints;
  }
  async getBreakpoints() {
    const { breakpoints } = _ds.tools.getStylesJSON();
    return this.processBreakpoints(breakpoints);
  }
  async getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }
  /**
   * Get the current breakpoint
   * @param rawBreakpoints JSON Object containings all breakpoints
   * @returns current breakpoint ( label & limits )
   */
  async getBreakpoint(rawBreakpoints) {
    const currentBreakpoint = {
      label: '',
      limits: [],
    };
    const windowWidth = window.innerWidth;
    const breakpoints = Object.entries(rawBreakpoints);
    if ((breakpoints === null || breakpoints === void 0 ? void 0 : breakpoints.length) > 0) {
      const [minBreakPointLabel, [minBreakpointValue]] = breakpoints.shift();
      const [maxBreakPointLabel, [maxBreakpointValue]] = breakpoints.pop();
      if (windowWidth < minBreakpointValue) {
        currentBreakpoint.label = minBreakPointLabel;
        currentBreakpoint.limits = [0, minBreakpointValue];
      }
      else if (windowWidth >= maxBreakpointValue) {
        currentBreakpoint.label = maxBreakPointLabel;
        currentBreakpoint.limits = [maxBreakpointValue, windowWidth];
      }
      else {
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
  async getParamsForBreakpoint(currentBreakpoint, params) {
    let currentBreakpointParams;
    const { label, limits: [, max] } = currentBreakpoint;
    for (const breakpointLabel in params) {
      if (label === breakpointLabel) {
        return params[breakpointLabel];
      }
      const [, paramsMax] = this.breakpoints[breakpointLabel];
      if (paramsMax > max) {
        return currentBreakpointParams || params[breakpointLabel];
      }
      else {
        currentBreakpointParams = params[breakpointLabel];
      }
    }
    return currentBreakpointParams;
  }
  constructor() {
    super();
    this.__registerHost();
    this.breakpointChange = createEvent(this, "breakpointChange", 7);
    this.subscribers = [];
    this.waitingSubscribers = [];
    this.initSubscribers = () => {
      this.waitingSubscribers.forEach(subscriber => {
        subscriber.setAttribute("data-use-rsp", "true");
        subscriber["data-rsp-init"] = "true";
        subscriber.addEventListener('breakpointChange', this.breakpointChangeHandler, false);
      });
      this.subscribers = [...this.waitingSubscribers];
      this.waitingSubscribers = [];
    };
    this.debounceDelay = 500;
    this.subscriberSelector = '[data-use-rsp]:not([data-rsp-init])';
    this.propertyName = 'data-rsp';
    this.breakpointsFromProp = undefined;
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.breakpointChangeHandler = this.breakpointChangeHandler.bind(this);
  }
  async componentWillLoad() {
    this.breakpoints = this.breakpointsFromProp ? _ds.props.fromJSON(this.breakpointsFromProp) : await this.getBreakpoints();
  }
  async componentDidLoad() {
    this.waitingSubscribers = Array.from(document.querySelectorAll(this.subscriberSelector));
    window.addEventListener('resize', debounce(this.notifySubscribers, this.debounceDelay), false);
    this.notifySubscribers();
  }
  disconnectedCallback() {
    window.removeEventListener('resize', debounce(this.notifySubscribers, this.debounceDelay));
    const subscribers = document.querySelectorAll("[data-use-rsp]");
    subscribers.forEach(subscriber => subscriber.removeEventListener('breakpointChange', this.breakpointChangeHandler));
  }
  async notifySubscribers() {
    const { currentBreakpoint: previousBreakpoint } = this;
    this.initSubscribers();
    this.currentBreakpoint = await this.getBreakpoint(this.breakpoints);
    const eventDetails = {
      current: this.currentBreakpoint,
      all: this.breakpoints,
    };
    const event = new CustomEvent('breakpointChange', { detail: eventDetails });
    const subscribers = document.querySelectorAll("[data-use-rsp]");
    subscribers.forEach(element => element.dispatchEvent(event));
    this.breakpointChange.emit({ all: this.breakpoints, current: this.currentBreakpoint, previous: previousBreakpoint });
  }
  async breakpointChangeHandler(event) {
    const { target: element, detail: { current }, } = event;
    const attributeValue = element.getAttribute(this.propertyName);
    const params = _ds.props.fromJSON(attributeValue) || {};
    // Calculate limits from parameters
    const breakpointParams = await this.getParamsForBreakpoint(current, params);
    if (breakpointParams) {
      Object.entries(breakpointParams).map(([prop, value]) => {
        element[prop] = value;
      });
    }
  }
  render() {
    return h(Host, null);
  }
}, [0, "ds-rsp", {
    "debounceDelay": [2, "debounce-delay"],
    "subscriberSelector": [1, "subscriber-selector"],
    "propertyName": [1, "property-name"],
    "breakpointsFromProp": [16],
    "subscribe": [64],
    "getData": [64],
    "getSubscribers": [64],
    "processBreakpoints": [64],
    "getBreakpoints": [64],
    "getCurrentBreakpoint": [64],
    "getBreakpoint": [64],
    "getParamsForBreakpoint": [64]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-rsp"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-rsp":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSRsp);
      }
      break;
  } });
}

const DsRsp = DSRsp;
const defineCustomElement = defineCustomElement$1;

export { DsRsp, defineCustomElement };

//# sourceMappingURL=ds-rsp.js.map