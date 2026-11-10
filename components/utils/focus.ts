/**
 * Keyboard focus helpers: the elements Tab reaches in a part of the page, and moving the focus into it.
 */

/** The elements that can be in the Tab order (`isTabbable()` then leaves out the disabled, hidden and inert ones). */
const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

const FORM_CONTROLS = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

/** `checkVisibility`: whether an element the browser does not render is left out (the default). */
export interface FocusQueryOptions {
  checkVisibility?: boolean;
}

/**
 * Whether an element of the selector above can take the focus: not disabled, not inert, not hidden (`hidden`, and with
 * `checkVisibility`, `display: none` or `visibility: hidden`, where the browser can tell: `checkVisibility()`).
 */
const isFocusable = (element: Element, { checkVisibility: mustBeRendered = true }: FocusQueryOptions = {}): boolean => {
  if (FORM_CONTROLS.includes(element.tagName) && (element.hasAttribute('disabled') || element.closest('fieldset[disabled]'))) {
    return false;
  }

  if (element.closest('[inert], [hidden]')) {
    return false;
  }

  const { checkVisibility } = element as Element & { checkVisibility?: (options?: Record<string, boolean>) => boolean };

  return mustBeRendered && typeof checkVisibility === 'function' ? checkVisibility.call(element, { checkVisibilityCSS: true, visibilityProperty: true }) : true;
};

/** Whether Tab can reach the element: it can take the focus and is not out of the Tab order (`tabindex="-1"`). */
export const isTabbable = (element: Element, options?: FocusQueryOptions): boolean => {
  const tabindex = element.getAttribute('tabindex');

  return !(tabindex !== null && tabindex.trim() !== '' && parseInt(tabindex, 10) < 0) && element.matches(TABBABLE_SELECTOR) && isFocusable(element, options);
};

/**
 * The elements Tab reaches in `root` (not `root` itself), in the document order. With `checkVisibility: false`, the
 * ones that are not rendered at that time are kept (a part of the page that is hidden for now).
 */
export const getTabbableElements = (root: Element, options?: FocusQueryOptions): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(element => isTabbable(element, options));

/**
 * The element the focus goes to when `element`, which holds it, goes away (hidden, removed): the first element Tab reaches
 * after it in `root`, else the last one before it (not an element that contains it); `null` when there is none.
 */
export const getNeighbourTabbable = (element: Element, root: Element = document.body): HTMLElement | null => {
  const order = new Map<Element, number>(Array.from(root.querySelectorAll('*')).map((other, index) => [other, index]));
  const start = order.get(element);

  if (start === undefined) {
    return null;
  }

  const end = start + element.querySelectorAll('*').length;
  const tabbable = getTabbableElements(root).filter(other => !other.contains(element));

  return tabbable.find(other => order.get(other) > end) ?? tabbable.reverse().find(other => order.get(other) < start) ?? null;
};

/** The element that has the focus, `null` when none has (the body, or no document focus). */
export const getFocusedElement = (): HTMLElement | null => {
  const element = document.activeElement as HTMLElement | null | undefined;

  return element && element !== document.body && typeof element.focus === 'function' ? element : null;
};

/**
 * Moves the focus into `root`: to its first element with an `autofocus` attribute, else to the first element Tab reaches
 * in it, else to `fallback` (an element with `tabindex="-1"`). Returns the element focused.
 */
export const focusFirstElement = (root: Element, fallback: HTMLElement, options?: FocusOptions): HTMLElement => {
  const autofocus = Array.from(root.querySelectorAll<HTMLElement>('[autofocus]')).find(element => element.matches(TABBABLE_SELECTOR) && isFocusable(element));
  const target = autofocus ?? getTabbableElements(root)[0] ?? fallback;

  target.focus(options);
  return target;
};
