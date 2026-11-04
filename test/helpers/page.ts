import { render, VNode } from '@stencil/core';

/**
 * A page of the unit tests: the document of Stencil's simulated DOM (mock-doc), with the component under test in its body.
 * The components are those the test file imports (`import './toggle'`): the Vitest plugin of `@stencil/vitest` compiles
 * them from their sources and defines them when they are imported.
 */
/** An element with any property, as Stencil's spec pages type their root: the tests read the props of a component and call its methods. */
export interface AnyHTMLElement extends HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface SpecPage<Root extends HTMLElement = AnyHTMLElement> {
  /** The first defined component of the body (depth first), or else its first element. */
  readonly root: Root;
  readonly body: HTMLElement;
  readonly doc: Document;
  readonly win: Window & typeof globalThis;
  /** Waits for the components to render their changes. */
  waitForChanges(): Promise<void>;
  /** Replaces the content of the body, then waits for its components. */
  setContent(html: string): Promise<void>;
}

/** A Stencil component: its element, with the method the runtime adds to it. */
type ComponentElement = HTMLElement & { componentOnReady?: () => Promise<unknown> };

/** The own properties of the document before the tests (an `activeElement` a test gives it is not one of them). */
const documentKeys = new Set(Object.keys(document));

/** Removes the event listeners of a node of the simulated DOM, which keeps them in `__listeners`. */
const removeListeners = (node: object) => ((node as { __listeners?: unknown }).__listeners = null);

/**
 * Gives a fresh page, as a browser opening a new one: a new, empty body (the components of the former one are
 * disconnected), an empty head, no attribute and no event listener on the document, its root and its head, no event
 * listener on the window, and none of the properties a test gave the document. Called before each test
 * (test/setup/unit.ts) and by renderPage().
 */
export const resetPage = () => {
  document.body.innerHTML = '';
  // A new body: Stencil's render() keeps the virtual DOM of the last one it rendered a template into.
  document.documentElement.replaceChild(document.createElement('body'), document.body);
  document.head.innerHTML = '';
  for (const element of [document.documentElement, document.head]) {
    Array.from(element.attributes).forEach(({ name }) => element.removeAttribute(name));
    removeListeners(element);
  }
  removeListeners(document);
  removeListeners(window);
  Object.keys(document)
    .filter(key => !documentKeys.has(key))
    .forEach(key => delete (document as unknown as Record<string, unknown>)[key]);
};

/** The defined components in a node, depth first. */
const componentsIn = (node: ParentNode): ComponentElement[] =>
  Array.from(node.querySelectorAll<ComponentElement>('*')).filter(element => !!customElements.get(element.nodeName.toLowerCase()));

/**
 * Waits for the components of the document to render their changes. Stencil renders in an animation frame (a 0 ms
 * timeout in the simulated DOM); a component that loads waits for its `componentWillLoad()`. A few frames let the updates
 * a render starts in other components (a prop it sets, an event they handle) be rendered too.
 */
export const waitForChanges = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await Promise.all(componentsIn(document).map(element => element.componentOnReady?.()));
  }
};

/**
 * Renders a page: a fresh document (resetPage()) whose body gets the HTML, or the JSX of the template (to give props
 * that are not strings: `() => <ds-combo options={colors}></ds-combo>`), then waits for its components.
 */
export const renderPage = async <Root extends HTMLElement = AnyHTMLElement>(content: string | (() => VNode)): Promise<SpecPage<Root>> => {
  resetPage();
  if (typeof content === 'function') render(content(), document.body);
  else document.body.innerHTML = content;
  await waitForChanges();

  let root: Root | undefined;
  return {
    get root() {
      root ??= componentsIn(document.body)[0] as Root;
      return root ?? (document.body.firstElementChild as Root);
    },
    body: document.body,
    doc: document,
    win: window as Window & typeof globalThis,
    waitForChanges,
    async setContent(html: string) {
      document.body.innerHTML = html;
      await waitForChanges();
    },
  };
};

/** Waits for a time, in milliseconds (the timers of the components are real ones). */
export const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * The class of a component the test file imported (as registered: a spy on a method of its prototype applies to the
 * elements of that component). `T`: the class of the component (`import type { DSBlock } from './block'`).
 */
export const componentClass = <T>(tag: string) => {
  const constructor = customElements.get(tag);
  if (!constructor) throw new Error(`${tag} is not defined: import its component in the test file`);
  return constructor as unknown as { prototype: T };
};
