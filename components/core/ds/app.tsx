import { Component, h, Method, Host, Event, EventEmitter, Prop } from '@stencil/core';
import { SassStyles, Breakpoint, Breakpoints, RawBreakpoint } from '../../utils/interfaces/sass-styles';

@Component({
  tag: 'ds-app',
})
export class DSApp {
  /**
   * Responsive
   */

  breakpoints: Breakpoints;
  currentBreakpoint: Breakpoint;
  subscribers: Element[] = [];
  waitingSubscribers: Element[] = [];

  @Prop() debounceDelay = 500;
  @Prop() subscriberSelector = '[data-use-rsp]:not([data-rsp-init])';
  @Prop() propertyName = 'data-rsp';
  @Prop({ attribute: 'breakpoints' }) breakpointsFromProp: Record<string, number>;

  @Method()
  async getStylesJSON(): Promise<SassStyles> {
    let style = '{}';

    if (window?.getComputedStyle?.(document.body, '::before')) {
      const computedStyle = window.getComputedStyle(document.body, '::before');
      style = (computedStyle.content !== 'none' && computedStyle.content) || '{}';
    }
    const styles = await this.removeQuotes(style);
    return JSON.parse(styles);
  }

  @Method()
  async removeQuotes(quotedString: string): Promise<string> {
    return typeof quotedString === 'string' ? (quotedString = quotedString.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '')) : quotedString;
  }

  @Method()
  async loadScript(scriptUrl: string, scriptId: string) {
    return new Promise((resolve, reject) => {
      if (!document.querySelector(`#${scriptId}`)) {
        const script = document.createElement('script');

        script.id = scriptId;
        script.async = true;
        script.defer = true;
        script.src = scriptUrl;
        script.onerror = err => reject(err);
        script.onload = () => resolve(true);

        document.querySelector('head')?.appendChild(script);
      } else {
        reject(`[WARNING] ds loadScript - script already loaded: ${scriptUrl}`);
      }
    });
  }

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

  @Method()
  async processBreakpoints(breakpoints: RawBreakpoint): Promise<Breakpoints> {
    const newBreakpoints = Object.entries(breakpoints);
    const [firstBreakpointLabel, firstBreakpointValue] = newBreakpoints.shift();
    const processedBreakpoints: Breakpoints = { [firstBreakpointLabel]: [0, firstBreakpointValue] };
    let previousBreakpoint = '';
    newBreakpoints.map(([breakpointLabel, breakpointValue], index) => {
      processedBreakpoints[breakpointLabel] = [breakpointValue];
      if (index > 0) {
        processedBreakpoints[previousBreakpoint].push((breakpointValue as number) - 1);
      }
      previousBreakpoint = breakpointLabel;
    });
    return processedBreakpoints;
  }

  @Method()
  async getBreakpoints(): Promise<Breakpoints> {
    const { breakpoints } = await this.getStylesJSON();
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

  @Method()
  async getParamsForBreakpoint<T>(currentBreakpoint: Breakpoint, params: { [breakpointLabel: string]: T }) {
    let currentBreakpointParams: T;
    const {
      label,
      limits: [, max],
    } = currentBreakpoint;
    for (const breakpointLabel in params) {
      if (label === breakpointLabel) {
        return params[breakpointLabel];
      }
      const [, paramsMax] = this.breakpoints[breakpointLabel];
      if (paramsMax > max) {
        return currentBreakpointParams || params[breakpointLabel];
      } else {
        currentBreakpointParams = params[breakpointLabel];
      }
    }
    return currentBreakpointParams;
  }

  @Event() breakpointChange: EventEmitter;

  /**
   * Ajax
   */

  @Method()
  async buildQuery(queryParams: Record<string, unknown>) {
    return Object.entries(queryParams)
      .map(pair => pair.map(encodeURIComponent).join('='))
      .join('&');
  }

  @Method()
  async get(url: string, queryParams?: Record<string, unknown>): Promise<unknown> {
    return fetch(`${url}${queryParams ? `?${this.buildQuery(queryParams)}` : ''}`).then(
      (response: any) =>
        new Promise((resolve, reject) => {
          response
            .json()
            .then(response.ok ? resolve : reject)
            .catch(reject);
        }),
    );
  }

  @Method()
  async post(url: string, payload: string | Record<string, string> | string[][] | URLSearchParams = {}): Promise<any> {
    return fetch(url, {
      headers: new Headers({
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Access-Control-Origin': '*',
      }),
      method: 'POST',
      body: new URLSearchParams(payload),
    }).then(
      (response: any) =>
        new Promise((resolve, reject) => {
          response
            .json()
            .then(response.ok ? resolve : reject)
            .catch(reject);
        }),
    );
  }

  /**
   * Props processing
   */

  /**
   * Convert an HTML property to a boolean
   * @param prop
   * @returns boolean
   */
  @Method()
  async propToBool(prop: string | boolean): Promise<boolean> {
    return typeof prop === 'undefined' ? false : typeof prop === 'boolean' ? prop : prop.toLowerCase() === 'true' || prop.toLowerCase() === '';
  }

  /**
   * Convert an HTML property to a number
   * @param prop
   * @returns number
   */
  @Method()
  async propToNumber(prop: string | number): Promise<number> {
    return typeof prop === 'number' ? prop : parseInt(prop, 10);
  }

  /**
   * Convert an HTML property to a float
   * @param prop
   * @returns number
   */
  @Method()
  async propToFloat(prop: string | number): Promise<number> {
    return typeof prop === 'number' ? prop : parseFloat(prop);
  }

  /**
   * Convert an HTML property ( coma separated string ) to an array
   * @param prop
   * @returns string[]
   */
  @Method()
  async propToStringArray<T = string>(prop: string | T[]): Promise<T[]> {
    return typeof prop === 'string' ? (prop.split(',') as T[]) : prop;
  }

  /**
   * Convert an HTML property to JSON
   * @param prop
   * @returns string[]
   */
  @Method()
  async propToJSON<T = string | Record<string, unknown> | unknown[]>(prop: T, rootKey?: string): Promise<Record<string, unknown>> {
    return typeof prop === 'string' ? (rootKey ? JSON.parse(prop)[rootKey] : JSON.parse(prop)) : rootKey ? prop[rootKey] : prop;
  }

  /**
   * Generate an css class ready object
   * @param mainClass one or many classes to add to the object
   * @param mods one or many string which will be converted to modifier classes to add to the object
   *
   * @returns Record<string, boolean>
   */
  @Method()
  async propGetClassList(mainClass: string | string[], mods?: string | string[]): Promise<Record<string, boolean>> {
    const classList = {};

    (await this.propToStringArray(mainClass)).forEach(CSSClass => {
      const className = CSSClass.trim();
      if (className !== '') {
        classList[className] = true;
      }
    });

    if (mods) {
      (await this.propToStringArray(mods)).forEach(CSSClass => {
        const className = CSSClass.trim();
        if (className !== '') {
          classList[`--${className}`] = true;
        }
      });
    }

    return classList;
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
