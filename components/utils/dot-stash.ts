import { AnyHTMLElement } from '@stencil/core/internal';
import { SassStyles } from './interfaces/sass-styles';

const config = {
  useContext: false,
};

export type AnyDsContextComponentElement = any;
export type DsComponentContextType = 'block' | 'article' | 'section' | 'form' | 'modal' | 'page';
export const DsComponentContext: DsComponentContextType[] = ['block', 'article', 'section', 'form', 'modal', 'page'];

const _ds = {
  app: {
    getConfig: (keys: string[]): Record<string, unknown> => {
      const pairs = {};
      keys.map(key => (pairs[key] = config[key]));
      return pairs;
    },
  },

  context: {
    get: (element: AnyDsContextComponentElement): DsComponentContextType => {
      return DsComponentContext.find(context => element[context]);
    },
  },

  env: {
    touchSupport: () => 'touchend' in window,
  },

  css: {
    set: (pairs: Partial<CSSStyleDeclaration>, elements: HTMLElement[]): void => {
      Object.keys(pairs).forEach(prop => {
        elements.forEach(element => {
          element.style[prop] = pairs[prop];
        });
      });
    },

    get: (props: (keyof CSSStyleDeclaration)[], element: HTMLElement): CSSRule | object => {
      const CSSProps = {};
      props.map(prop => (CSSProps[prop] = element.style[prop]));
      return CSSProps;
    },

    toNumber: (prop: keyof CSSStyleDeclaration, element: HTMLElement) => parseInt((element.style[prop] as string).replace('px', ''), 10),
  },

  props: {
    isTrue: (prop: string | boolean): boolean => (typeof prop === 'undefined' ? false : typeof prop === 'boolean' ? prop : ['true', '', '1'].includes(prop.toLowerCase())),

    toNumber: (prop: string | number): number => (typeof prop === 'number' ? prop : parseInt(prop, 10)),

    toFloat: (prop: string | number): number => (typeof prop === 'number' ? prop : parseFloat(prop)),

    toArray: <T = string>(prop: string | T[]): T[] => (typeof prop === 'string' ? (prop.split(',') as T[]) : prop),

    fromJSON: <T = string | Record<string, unknown> | unknown[]>(prop: T, rootKey?: string) =>
      typeof prop === 'string' ? (rootKey ? JSON.parse(prop)[rootKey] : JSON.parse(prop)) : rootKey ? prop[rootKey] : prop,

    toClassList: (mainClass: string | string[], mods?: string | string[]): Record<string, boolean> => {
      const classList = {};
      _ds.props.toArray(mainClass).forEach(CSSClass => {
        const className = CSSClass.trim();
        if (className !== '') {
          classList[className] = true;
        }
      });
      if (mods) {
        _ds.props.toArray(mods).forEach(CSSClass => {
          if (CSSClass) {
            const className = CSSClass.trim();
            if (className !== '') {
              classList[`--${className}`] = true;
            }
          }
        });
      }
      return classList;
    },

    toString: (attributes: Record<string, unknown>) =>
      Object.entries(attributes)
        .map(([key, value]) => `${key}${value !== true && value !== 'true' ? `="${Array.isArray(value) ? value.join(',') : value}"` : ''}`)
        .join(' '),
  },

  responsive: {
    isMobile: () => window.innerWidth < 768,
    isTablet: () => window.innerWidth > 767 && window.innerWidth < 992,
    isDesktop: () => window.innerWidth > 991,
  },

  form: {
    submit: form => form.dispatchEvent(new Event('submit')),
    reset: form => form.dispatchEvent(new Event('reset')),
  },

  ajax: {
    buildQuery: queryParams =>
      Object.entries(queryParams)
        .map(pair => pair.map(encodeURIComponent).join('='))
        .join('&'),

    get: (url: string, queryParams?: any): Promise<any> =>
      fetch(`${url}${queryParams ? `?${_ds.ajax.buildQuery(queryParams)}` : ''}`).then(
        (response: any) =>
          new Promise((resolve, reject) => {
            response
              .json()
              .then(response.ok ? resolve : reject)
              .catch(reject);
          }),
      ),

    post: (url: string, payload: any = {}): Promise<any> => {
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
    },
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
          element = contener.querySelector(`[data-${key}]`) as AnyHTMLElement;
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
    cleanHTML: (HTMLString: string): string => HTMLString.replace(/\>[\r\n ]+\</g, '><').replace(/(<.*?>)|\s+/g, (_, $1) => $1 || ' '),

    beautifyHTML: html => {
      var TAB_WIDTH = 2;

      function multi(_, spaces) {
        var i,
          indent = '';

        for (i = 0; i < spaces; i++) {
          indent += ' ';
        }

        return indent;
      }

      function squeeze(str) {
        return str.replace(/^[ \n\t]+/, '').replace(/\>[\n\t ]+/g, '>');
      }

      /* const indent = function(html) { */
      var chr,
        i,
        chrs = squeeze(html).split(''),
        result = '',
        level = 0,
        indent = '',
        pInTag,
        pCloseTag,
        tagName;

      for (i = 0; i < chrs.length; i++) {
        chr = chrs[i];
        if (chr === '<') {
          pCloseTag = chrs[i + 1] === '/';
          if (pCloseTag) {
            level--;
            indent = multi(' ', level * TAB_WIDTH);
          }
          result += '\n' + indent + '<';
        } else if (chr === '>') {
          tagName = getTagName(chrs, i - 1);
          pInTag = !pCloseTag && chrs[i - 1] !== '/' && tagName !== 'img' && tagName !== 'br';
          pCloseTag = false;
          if (pInTag) {
            level++;
          }
          indent = multi(' ', level * TAB_WIDTH);
          result += '>\n' + indent;
        } else {
          result += chr;
        }
      }

      function getTagName(chrs, i) {
        var chr = chrs[i],
          ret = '';

        while (chr !== '<') {
          ret = chr + ret;
          chr = chrs[i--];
        }

        return ret.substr(0, ret.indexOf(' '));
      }

      console.log(result);

      return result.replace(/\n *\n/g, '\n');
      /* };
    
        exports.squeeze = squeeze;
    
        exports.escape = function(str) {
            return str.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
        }; */
    },

    getStylesJSON: (): SassStyles => {
      let style = '{}';

      if (window?.getComputedStyle?.(document.body, '::before')) {
        const computedStyle = window.getComputedStyle(document.body, '::before');
        style = (computedStyle.content !== 'none' && computedStyle.content) || '{}';
      }
      return JSON.parse(_ds.tools.removeQuotes(style));
    },

    removeQuotes: (quotedString: string): string => (typeof quotedString === 'string' ? (quotedString = quotedString.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '')) : quotedString),

    loadScript: (scriptUrl: string, scriptId: string) => {
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
    },

    scrollTo: (element: string, offset = 100): void => {
      const scrollY = (document.querySelector(element) as AnyHTMLElement).offsetTop - offset;
      window.scroll(0, scrollY);
    },

    getFileExtension: (fileLocation: string): string => {
      const filename = fileLocation.split('/').pop();
      return filename?.substring(filename.lastIndexOf('.') + 1, filename.length) || '';
    },

    /* animate: (function () {
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
    })(), */

    getOffset: (el: AnyHTMLElement) => {
      const box = el.getBoundingClientRect();

      return {
        top: box.top + window.pageYOffset - document.documentElement.clientTop,
        left: box.left + window.pageXOffset - document.documentElement.clientLeft,
      };
    },

    /* waitUntil: (
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
            const result = await func.apply(ctx, args );
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
    } */
  },
};

export default _ds;
