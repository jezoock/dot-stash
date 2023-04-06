import { AnyHTMLElement } from "@stencil/core/internal";

const _ds = {
  env: {
    touchSupport: () => 'touchend' in window,
  },
  css: {
    set: ( pairs, elements ) => {
      Object.keys( pairs ).forEach( prop => {
        elements.forEach( element => {
          element.style[prop] = pairs[prop];
        })
      });
    },
    get: ( props, element ) => {
      const allCSSProps = getComputedStyle(element);
      const CSSProps = {};
      props.map( prop => CSSProps[prop] = allCSSProps[prop] )
      return CSSProps;
    },
    toNumber: (prop, element) => parseInt(getComputedStyle(element)[prop].replace('px',''), 10),
  },
  
  props: {
    isTrue: ( prop: string|boolean ): boolean => typeof prop === 'undefined'
      ? false
      : typeof prop === 'boolean'
        ? prop
        : prop.toLowerCase() === 'true' || prop.toLowerCase() === '',
    toNumber: ( prop: string|number ): number => typeof prop === 'number' ? prop : parseInt(prop, 10),
    toFloat: ( prop: string|number ): number => typeof prop === 'number' ? prop : parseFloat(prop),
    toArray: ( prop: string|any[] ): any[] => typeof prop === 'string' ? (prop as string).split(',') : prop,
    fromJSON: ( prop: string | Record<string, unknown> | any[], rootKey?: string ) => typeof prop === 'string' ? ( rootKey ? JSON.parse(prop)[rootKey] : JSON.parse(prop)) : rootKey ? prop[rootKey] : prop,
    toClassList: ( mainClass: string, mods: string|string[] ): any => {
      const classList = {};
      if( mainClass && mainClass.trim() !== '' ) {
        classList[`${mainClass}`] = true;
      }
      if( mods.length ) {
        const modsList = _ds.props.toArray(mods);
        modsList.forEach( CSSClass => {
          if (CSSClass && CSSClass.trim() !== '') {
            classList[`--${CSSClass.trim()}`] = true;
          }
        });
      }
      return classList;
    }
  },
  responsive: {
    isMobile: () => window.innerWidth < 768,
    isTablet: () => window.innerWidth > 767 && window.innerWidth < 992,
    isDesktop: () => window.innerWidth > 991,
  },
  form: {
    submit: ( form ) => form.dispatchEvent(new Event('submit')),
    reset: ( form ) => form.dispatchEvent(new Event('reset')),
  },
  ajax: {
    buildQuery: queryParams => Object.entries(queryParams).map(pair => pair.map(encodeURIComponent).join('=')).join('&'),
    get: ( url: string, queryParams?: any ): Promise<any> =>
      fetch(`${url}${queryParams ? `?${_ds.ajax.buildQuery(queryParams)}` : ''}`)
        .then((response: any) => new Promise((resolve, reject) => {
          response
            .json()
            .then(response.ok ? resolve : reject)
            .catch(reject)
          })
        ),
    
    post: (url: string, payload: any = {}): Promise<any> => {
      return fetch(url, {
        headers: new Headers({
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Access-Control-Origin": "*"
        }),
        method: "POST",
        body: new URLSearchParams(payload)
      }).then((response: any) => new Promise((resolve, reject) => {
        response
          .json()
          .then(response.ok ? resolve : reject)
          .catch(reject)
        })
      )},
  },
  data: {
    set: (dataSet: any, contener: AnyHTMLElement, index?: number) => {
      dataSet.map(data => {
        const entry = data;
        const [key, value] = entry;

        let element: AnyHTMLElement;
        if (typeof index !== 'undefined') {
          element = contener.querySelectorAll(`[data-${key}]`)[index] as AnyHTMLElement;
        } else {
          element = contener.querySelector(`[data-${key}]`);
        }

        const type = element.dataset[key.toLowerCase()];

        if (element) {
          if (type === 'prop') {
            element[key] = value;
          } else {
            let stringValue = value;
            if (typeof value === 'number') {
              stringValue = value.toString();
            }
            element.innerText = stringValue;
          }
        }

        /* if (element[key] || element.hasAttribute(key)) {
            console.log('here');
            element[key] = value;
          } else if (element.setData) {
            element.collection = value;
          } else if (element.from === `data-${key}`) {
            element[`data-${key}`] = value;
          } else if (element.collection) {
            element.collection = value;
          } else if (typeof value === 'number') {
            element.innerText = value.toString();
          } else if (typeof value === 'string') {
            element.innerText = value;
          } */
      });
    },
  },
  tools: {

    loadScript: (scriptUrl: string, scriptId: string) => {
      return new Promise((resolve, reject) => {
        if (!document.querySelector(`#${scriptId}`)) {
          const script = document.createElement('script');
        
          script.id = scriptId;
          script.async = true;
          script.defer = true;
          script.src = scriptUrl;
          script.onerror = (err) => reject(err);
          script.onload = () => resolve(true);
      
          document.querySelector('head').appendChild(script);
        } else {
          reject(`[WARNING] ds loadScript - script already loaded: ${scriptUrl}`);
        }
      })
    },

    scrollTo: (element: string, offset = 100): void => {
      const scrollY = (document.querySelector(element) as AnyHTMLElement).offsetTop - offset;
      window.scroll(0, scrollY);
    },
    getFileExtension: ( fileLocation: string ): string => {
      const filename = fileLocation.split('/').pop();
      return filename.substr(filename.lastIndexOf('.')+1,filename.length);
    },
    animate: (function () {
      const easings = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        easeInCubic: t => t * t * t,
        easeOutCubic: t => --t * t * t + 1,
        easeInOutCubic: t =>
          t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - --t * t * t * t,
        easeInOutQuart: t =>
          t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + --t * t * t * t * t,
        easeInOutQuint: t =>
          t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
      };
      const promiseMap = {};
      return async function (
        element,
        prop,
        value,
        duration = 200,
        easing = "linear"
      ) {
        if (!promiseMap[element]) {
          promiseMap[element] = Promise.resolve();
        }
    
        const _animate = async () =>
          new Promise(resolve => {
            const startTime =
              "now" in window.performance
                ? performance.now()
                : new Date().getTime();
            if ("requestAnimationFrame" in window === false) {
              element[prop] = value;
              return;
            }
            const initial = element[prop];
            const delta = value - element[prop];
    
            function scroll() {
              const now =
                "now" in window.performance
                  ? performance.now()
                  : new Date().getTime();
              const time = Math.min(1, (now - startTime) / duration);
              const timeFunction = easings[easing](time);
              const increment = Math.ceil(timeFunction * delta);
              element[prop] = initial + increment;
              if (
                (delta >= 0 && increment >= delta) ||
                (delta < 0 && increment <= delta)
              ) {
                element[prop] = value;
                return resolve(true);
              }
              requestAnimationFrame(scroll);
            }
    
            return scroll();
          });
    
        const promise = promiseMap[element].then(_animate);
        promiseMap[element] = promise;
        return promise;
      };
    })(),
    getOffset: (el) => {
      const box = el.getBoundingClientRect();
    
      return {
        top: box.top + window.pageYOffset - document.documentElement.clientTop,
        left: box.left + window.pageXOffset - document.documentElement.clientLeft
      };
    },
    throttle: (
      func,
      wait,
      leading = false,
      trailing = false,
      context?
    ) => {
      let ctx, args, result;
      let timeout = null;
      let previous: any = 0;
      const later = function () {
        previous = new Date();
        timeout = null;
        result = func.apply(ctx, args);
      };
      return function (...rest) {
        const now: any = new Date();
        if (!previous && !leading) {
          previous = now;
        }
        const remaining = wait - (now - previous);
        ctx = context || this;
        args = rest;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(ctx, args);
        } else if (!timeout && trailing) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },
    waitUntil: (
      func: () => void,
      pollingRate = 100,
      leading = false,
      maxIterations = 1000,
      context?: any
    ): Promise<any> => {
      return new Promise((resolve, reject) => {
        const ctx = context || this;
        //let args = arguments;
        let i = 0;
        const rFunc = async () => {
          try {
            const result = await func.apply(ctx/* , args */);
            if (result) {
              return resolve(result);
            }
          } catch (e) {
            return reject(e);
          }
          if (i++ >= maxIterations) {
            return reject("max iteration limit reached");
          }
          setTimeout(rFunc, pollingRate);
        };
        leading ? rFunc() : setTimeout(rFunc, pollingRate);
      });
    }
  }
}

export default _ds;