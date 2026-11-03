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

/**
 * Whether an element of the selector above can take the focus: not disabled, not inert, not hidden (`hidden`,
 * `display: none`, `visibility: hidden`, where the browser can tell: `checkVisibility()`).
 */
const isFocusable = (element: Element): boolean => {
  if (FORM_CONTROLS.includes(element.tagName) && (element.hasAttribute('disabled') || element.closest('fieldset[disabled]'))) {
    return false;
  }

  if (element.closest('[inert], [hidden]')) {
    return false;
  }

  const { checkVisibility } = element as Element & { checkVisibility?: (options?: Record<string, boolean>) => boolean };

  return typeof checkVisibility === 'function' ? checkVisibility.call(element, { checkVisibilityCSS: true, visibilityProperty: true }) : true;
};

/** Whether Tab can reach the element: it can take the focus and is not out of the Tab order (`tabindex="-1"`). */
export const isTabbable = (element: Element): boolean => {
  const tabindex = element.getAttribute('tabindex');

  return !(tabindex !== null && tabindex.trim() !== '' && parseInt(tabindex, 10) < 0) && element.matches(TABBABLE_SELECTOR) && isFocusable(element);
};

/** The elements Tab reaches in `root` (not `root` itself), in the document order. */
export const getTabbableElements = (root: Element): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(isTabbable);

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
