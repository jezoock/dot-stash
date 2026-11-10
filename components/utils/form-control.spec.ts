import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import {
  checkValidity,
  DEFAULT_VALUE_MISSING_MESSAGES,
  getLabelIds,
  getLabels,
  getErrorMessage,
  getLabelText,
  getValidationMessage,
  getValidity,
  getValueMissingMessage,
  getWillValidate,
  isDisabledControl,
  isFormInternals,
  reportValidity,
  setCustomState,
  setFormValue,
  setValueMissing,
  updateIdRefs,
} from './form-control';

/** The methods of a browser's ElementInternals that the helpers call, as mocks. */
const fakeInternals = () =>
  ({
    setFormValue: vi.fn(),
    setValidity: vi.fn(),
    checkValidity: vi.fn(() => false),
    reportValidity: vi.fn(() => false),
    validity: { valid: false, valueMissing: true },
    validationMessage: 'Missing',
    willValidate: true,
    labels: [],
    states: new Set<string>(),
  }) as unknown as ElementInternals & { states: Set<string> };

describe('form-control', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('gives the English message of a required control left empty where the DOM has no message of its own', () => {
    // The simulated DOM has no constraint validation (a browser gives its own message, in its language).
    expect(getValueMissingMessage('checkbox')).toBe('Please check this box if you want to proceed.');
    expect(getValueMissingMessage('radio')).toBe(DEFAULT_VALUE_MISSING_MESSAGES.radio);
    expect(getValueMissingMessage('select')).toBe(DEFAULT_VALUE_MISSING_MESSAGES.select);
  });

  it('tells the internals of a browser from those of the simulated DOM, without reading them', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const simulated = document.createElement('div').attachInternals();

    expect(isFormInternals(simulated)).toBe(false);
    expect(isFormInternals(undefined)).toBe(false);
    expect(isFormInternals(fakeInternals())).toBe(true);
    // Reading a property of the simulated internals logs an error: the test did not read any.
    expect(errors).not.toHaveBeenCalled();
  });

  it('does nothing, and gives a valid state, without form internals', () => {
    const host = document.createElement('div');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const simulated = host.attachInternals();

    setFormValue(simulated, 'on');
    setValueMissing(simulated, host, true, 'Missing', host);
    setCustomState(simulated, 'user-invalid', true);

    expect([checkValidity(simulated), reportValidity(simulated), getValidity(simulated), getValidationMessage(simulated), getWillValidate(simulated)]).toEqual([
      true,
      true,
      undefined,
      '',
      false,
    ]);
    expect(getLabels(simulated)).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  });

  it('sets the form value and the state to restore (the value by default)', () => {
    const internals = fakeInternals();
    const entries = new FormData();

    setFormValue(internals, 'on');
    setFormValue(internals, null, 'unchecked');
    setFormValue(internals, entries, '["a"]');

    expect((internals.setFormValue as Mock).mock.calls).toEqual([
      ['on', 'on'],
      [null, 'unchecked'],
      [entries, '["a"]'],
    ]);
  });

  it('sets valueMissing with its message at an anchor inside the element, or a valid state', () => {
    const internals = fakeInternals();
    const host = document.createElement('div');
    host.innerHTML = '<button></button>';
    const button = host.querySelector('button');
    const outside = document.createElement('button');

    setValueMissing(internals, host, true, 'Pick one', button);
    setValueMissing(internals, host, true, 'Check it', host);
    setValueMissing(internals, host, true, 'Check it', outside);
    setValueMissing(internals, host, false, 'Pick one', button);

    expect((internals.setValidity as Mock).mock.calls).toEqual([
      [{ valueMissing: true }, 'Pick one', button],
      [{ valueMissing: true }, 'Check it', host],
      // An anchor that is not in the element would make the browser throw.
      [{ valueMissing: true }, 'Check it', undefined],
      [{}],
    ]);
  });

  it('gives the validity of the internals', () => {
    const internals = fakeInternals();

    expect([checkValidity(internals), reportValidity(internals), getValidity(internals).valueMissing, getValidationMessage(internals), getWillValidate(internals)]).toEqual([
      false,
      false,
      true,
      'Missing',
      true,
    ]);
  });

  it('adds and removes a custom state, and ignores a browser that refuses its name', () => {
    const internals = fakeInternals();

    setCustomState(internals, 'user-invalid', true);
    expect(internals.states.has('user-invalid')).toBe(true);
    setCustomState(internals, 'user-invalid', false);
    expect(internals.states.has('user-invalid')).toBe(false);

    vi.spyOn(internals.states, 'add').mockImplementation(() => {
      throw new DOMException('The name must start with --', 'SyntaxError');
    });
    expect(() => setCustomState(internals, 'user-invalid', true)).not.toThrow();
  });

  it('gives the labels ids for an aria-labelledby, keeping their own', () => {
    document.body.innerHTML = '<label id="own">Color</label><label>Colour</label>';
    const labels = Array.from(document.querySelectorAll('label'));

    expect(getLabelIds(labels, 'ds-combo-1')).toBe('own ds-combo-1-label-2');
    expect(labels[1].id).toBe('ds-combo-1-label-2');
    expect(getLabelIds([], 'ds-combo-1')).toBeUndefined();
    expect(getLabels({ ...fakeInternals(), labels } as unknown as ElementInternals)).toEqual(labels);
  });

  it('gives the text of a label around an element without the text of the element', () => {
    document.body.innerHTML = '<label>Sizes <span>(pick <b>some</b>)</span> <ds-combo><button>sizes (2)</button></ds-combo>\n  </label>';
    const label = document.querySelector('label');

    expect(getLabelText(label, document.querySelector('ds-combo'))).toBe('Sizes (pick some)');
  });

  it('tells a disabled control: its own disabled attribute (the browser also gives a disabled fieldset around it)', () => {
    document.body.innerHTML = '<input disabled><input>';
    const [disabled, enabled] = Array.from(document.querySelectorAll('input'));

    expect([isDisabledControl(disabled), isDisabledControl(enabled), isDisabledControl(null)]).toEqual([true, false, false]);
  });

  it('chooses the error message of a control: a custom error, the message of its flag, the fallback, the browser message', () => {
    const messages = { valueMissing: 'Enter your email', typeMismatch: 'Enter an email address, like name@example.com' };

    expect(getErrorMessage({ valid: true }, '', messages, 'Check this field')).toBe('');
    expect(getErrorMessage(undefined, 'Please fill out this field.', messages)).toBe('');
    expect(getErrorMessage({ valid: false, valueMissing: true }, 'Please fill out this field.', messages, 'Check this field')).toBe('Enter your email');
    expect(getErrorMessage({ valid: false, typeMismatch: true }, 'Please include an @.', messages)).toBe('Enter an email address, like name@example.com');
    // No message for the flag: the fallback, else the browser message.
    expect(getErrorMessage({ valid: false, tooShort: true }, 'Please lengthen this text.', messages, 'Check this field')).toBe('Check this field');
    expect(getErrorMessage({ valid: false, tooShort: true }, 'Please lengthen this text.', messages)).toBe('Please lengthen this text.');
    // A custom error: the message its author gave, before the other flags.
    expect(getErrorMessage({ valid: false, customError: true, valueMissing: true }, 'This username is taken', messages, 'Check this field')).toBe('This username is taken');
    // The first flag in the order of VALIDITY_FLAGS.
    expect(getErrorMessage({ valid: false, rangeOverflow: true, stepMismatch: true }, '', { stepMismatch: 'Step', rangeOverflow: 'Too high' })).toBe('Too high');
  });

  it('adds and removes its own ids in an id reference list, keeping the ids of the author and their order', () => {
    document.body.innerHTML = '<input aria-describedby="author-1  author-2">';
    const input = document.querySelector('input');

    let own = updateIdRefs(input, 'aria-describedby', [], ['hint', 'error']);
    expect([own, input.getAttribute('aria-describedby')]).toEqual([['hint', 'error'], 'author-1 author-2 hint error']);
    // The author adds an id: it stays, before the ids of the component, which replaces its own.
    input.setAttribute('aria-describedby', 'author-1 author-2 hint error author-3');
    own = updateIdRefs(input, 'aria-describedby', own, ['hint']);
    expect([own, input.getAttribute('aria-describedby')]).toEqual([['hint'], 'author-1 author-2 author-3 hint']);
    // An id the author already references is not added twice, nor removed with those of the component.
    own = updateIdRefs(input, 'aria-describedby', own, ['author-1', 'counter', 'counter']);
    expect([own, input.getAttribute('aria-describedby')]).toEqual([['counter'], 'author-1 author-2 author-3 counter']);
    own = updateIdRefs(input, 'aria-describedby', own, []);
    expect([own, input.getAttribute('aria-describedby')]).toEqual([[], 'author-1 author-2 author-3']);

    // Without ids of the author: the attribute goes with the last id of the component; an unchanged list is not written.
    const other = document.createElement('input');
    own = updateIdRefs(other, 'aria-describedby', [], ['hint']);
    expect(other.getAttribute('aria-describedby')).toBe('hint');
    other.setAttribute('aria-describedby', ' hint ');
    updateIdRefs(other, 'aria-describedby', own, ['hint']);
    expect(other.getAttribute('aria-describedby')).toBe(' hint ');
    updateIdRefs(other, 'aria-describedby', own, []);
    expect(other.hasAttribute('aria-describedby')).toBe(false);
  });
});
