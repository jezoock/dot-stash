import { vi } from 'vitest';

/** The form callbacks the browser calls on a form-associated element (not in the element types). */
export type FormCallbacks = { formResetCallback(): void; formStateRestoreCallback(state: unknown, mode: string): void; formDisabledCallback(isDisabled: boolean): void };

/** The form callbacks of an element, which a test calls as a browser does (a form reset, a disabled fieldset…). */
export const formCallbacks = (element: Element) => element as unknown as FormCallbacks;

/** What the fake ElementInternals below records, read by the tests. */
export type FakeInternals = ElementInternals & { value: unknown; state: unknown; anchor: HTMLElement | undefined; states: Set<string> };

/**
 * The simulated DOM has no ElementInternals (its `attachInternals()` gives an object without methods, and the components
 * then leave the form alone). This gives the elements a fake one, which records the form value, the state and the
 * validity, dispatches `invalid` as a browser does and gives the `<label>` elements of the document. Call it before the
 * components are rendered (they attach their internals when they are created). Returns the internals of an element.
 */
export const mockElementInternals = () => {
  const internalsOf = new WeakMap<Element, FakeInternals>();
  let owner = Object.getPrototypeOf(document.createElement('div'));
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'attachInternals')) owner = Object.getPrototypeOf(owner);

  const createInternals = (host: HTMLElement) => {
    let flags: ValidityStateFlags = {};
    let message = '';
    const internals = {
      value: null,
      state: null,
      anchor: undefined,
      states: new Set<string>(),
      setFormValue(value: unknown, state: unknown = value) {
        Object.assign(internals, { value, state });
      },
      setValidity(newFlags: ValidityStateFlags = {}, newMessage = '', anchor?: HTMLElement) {
        flags = newFlags;
        message = newMessage;
        internals.anchor = anchor;
      },
      get validity() {
        return { valid: !Object.values(flags).some(Boolean), ...flags };
      },
      get validationMessage() {
        return internals.validity.valid ? '' : message;
      },
      get willValidate() {
        return !host.hasAttribute('disabled');
      },
      get labels() {
        const labels = Array.from(host.ownerDocument.querySelectorAll('label')) as HTMLLabelElement[];
        return labels.filter(label => (label.hasAttribute('for') ? !!host.id && label.getAttribute('for') === host.id : label.contains(host)));
      },
      checkValidity() {
        const { valid } = internals.validity;
        if (!valid) host.dispatchEvent(new Event('invalid', { cancelable: true }));
        return valid;
      },
      reportValidity() {
        const valid = internals.checkValidity();
        if (!valid) (internals.anchor ?? host).focus();
        return valid;
      },
    };
    internalsOf.set(host, internals as unknown as FakeInternals);
    return internals as unknown as ElementInternals;
  };
  vi.spyOn(owner as HTMLElement, 'attachInternals').mockImplementation(function (this: HTMLElement) {
    return createInternals(this);
  });

  return (element: Element) => internalsOf.get(element);
};
