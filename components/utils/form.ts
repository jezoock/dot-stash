/**
 * Form helpers: dispatch `submit` / `reset` events, so the form's listeners run.
 */

export const submit = (form: EventTarget): boolean => form.dispatchEvent(new Event('submit'));

export const reset = (form: EventTarget): boolean => form.dispatchEvent(new Event('reset'));
