import {
  checkValidity,
  DEFAULT_VALUE_MISSING_MESSAGES,
  getLabelIds,
  getLabels,
  getLabelText,
  getValidationMessage,
  getValidity,
  getValueMissingMessage,
  getWillValidate,
  isFormInternals,
  reportValidity,
  setCustomState,
  setFormValue,
  setValueMissing,
} from './form-control';

/** The methods of a browser's ElementInternals that the helpers call, as mocks. */
const fakeInternals = () =>
  ({
    setFormValue: jest.fn(),
    setValidity: jest.fn(),
    checkValidity: jest.fn(() => false),
    reportValidity: jest.fn(() => false),
    validity: { valid: false, valueMissing: true },
    validationMessage: 'Missing',
    willValidate: true,
    labels: [],
    states: new Set<string>(),
  }) as unknown as ElementInternals & { states: Set<string> };

describe('form-control', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('gives the English message of a required control left empty where the DOM has no message of its own', () => {
    // The simulated DOM has no constraint validation (a browser gives its own message, in its language).
    expect(getValueMissingMessage('checkbox')).toBe('Please check this box if you want to proceed.');
    expect(getValueMissingMessage('radio')).toBe(DEFAULT_VALUE_MISSING_MESSAGES.radio);
    expect(getValueMissingMessage('select')).toBe(DEFAULT_VALUE_MISSING_MESSAGES.select);
  });

  it('tells the internals of a browser from those of the simulated DOM, without reading them', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const simulated = document.createElement('div').attachInternals();

    expect(isFormInternals(simulated)).toBe(false);
    expect(isFormInternals(undefined)).toBe(false);
    expect(isFormInternals(fakeInternals())).toBe(true);
    // Reading a property of the simulated internals logs an error: the test did not read any.
    expect(errors).not.toHaveBeenCalled();
  });

  it('does nothing, and gives a valid state, without form internals', () => {
    const host = document.createElement('div');
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
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

    expect((internals.setFormValue as jest.Mock).mock.calls).toEqual([
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

    expect((internals.setValidity as jest.Mock).mock.calls).toEqual([
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

    jest.spyOn(internals.states, 'add').mockImplementation(() => {
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
});
