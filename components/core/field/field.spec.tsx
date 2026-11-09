import { afterEach, describe, expect, it, vi } from 'vitest';
import './field';
import '../select/select';
import { renderPage } from '../../../test/helpers';
import { DS_FIELD_COUNTER_DELAY } from './field.constants';

/**
 * The validity a browser gives a control (the simulated DOM has no constraint validation): `flags` of the ValidityState,
 * the message of the browser. Returns the function that changes them.
 */
const setValidity = (control: Element, flags: Partial<Record<keyof ValidityState, boolean>> = {}, message = '') => {
  const state = { flags, message };
  const isValid = () => !Object.entries(state.flags).some(([name, value]) => name !== 'valid' && value);
  Object.defineProperty(control, 'validity', { configurable: true, get: () => ({ ...state.flags, valid: isValid() }) });
  Object.defineProperty(control, 'validationMessage', { configurable: true, get: () => (isValid() ? '' : state.message) });
  Object.defineProperty(control, 'willValidate', { configurable: true, get: () => !control.hasAttribute('disabled') && !control.hasAttribute('readonly') });
  return (newFlags: Partial<Record<keyof ValidityState, boolean>>, newMessage = state.message) => Object.assign(state, { flags: newFlags, message: newMessage });
};

/** A value typed in a control (the simulated DOM keeps the value of an input in its attribute, that of a textarea in its text). */
const type = (control: HTMLInputElement | HTMLTextAreaElement, value: string, events = ['input']) => {
  Object.defineProperty(control, 'value', { configurable: true, writable: true, value });
  events.forEach(name => control.dispatchEvent(new Event(name, { bubbles: true })));
};

/** An invalid event, as `checkValidity()` or a submission dispatches it: in a browser, it does not bubble and the field gets it in the capture phase, which the simulated DOM does not have. */
const invalid = (control: Element) => control.dispatchEvent(new Event('invalid', { bubbles: true, cancelable: true }));

describe('ds-field', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const render = async (html: string) => {
    const page = await renderPage(html);
    const field = page.body.querySelector('ds-field') as HTMLElement & { refresh(): Promise<void>; label: string; hint: string };
    const control = field.querySelector('input, textarea, select') as HTMLInputElement;
    const part = (name: string) => field.querySelector<HTMLElement>(`.ds-field__${name}`);
    const describedBy = () => control.getAttribute('aria-describedby');
    return { page, field, control, part, describedBy };
  };

  describe('label', () => {
    it('renders a <label for> the control before it, and gives the control an id when it has none', async () => {
      const { field, control, part } = await render('<ds-field label="Email"><input type="email" name="email"></ds-field>');
      const label = part('label') as HTMLLabelElement;

      expect(control.id).toMatch(/^ds-field-[\w-]+-control$/);
      expect([label.tagName, label.getAttribute('for'), label.textContent]).toEqual(['LABEL', control.id, 'Email']);
      expect(Array.from(field.children).map(child => child.tagName)).toEqual(['LABEL', 'INPUT']);
      expect(field).toHaveClasses(['ds-field', '--input']);
    });

    it('keeps the id of the control, and leaves a <label> of the page alone', async () => {
      const { field, control, part } = await render('<ds-field label="Ignored"><label for="mail">Email <b>(work)</b></label><input id="mail"></ds-field>');

      expect(control.id).toBe('mail');
      expect(part('label')).toBeNull();
      expect(field.querySelector('label').outerHTML).toBe('<label for="mail">Email <b>(work)</b></label>');
    });

    it('marks the label of a required control, hidden from assistive technologies, with a translatable text', async () => {
      const { page, field, control, part } = await render('<ds-field label="Email"><input id="mail" required></ds-field>');
      const mark = () => part('required');

      expect([mark().textContent, mark().getAttribute('aria-hidden'), part('label').textContent]).toEqual(['*', 'true', 'Email*']);
      expect(field).toHaveClass('--required');

      field.setAttribute('labels', '{"required": "(required)"}');
      await page.waitForChanges();
      expect(mark().textContent).toBe('(required)');

      field.setAttribute('labels', '{"required": ""}');
      await page.waitForChanges();
      expect(mark()).toBeNull();

      field.removeAttribute('labels');
      control.removeAttribute('required');
      await field.refresh();
      await page.waitForChanges();
      expect(mark()).toBeNull();
      expect(field).not.toHaveClass('--required');
    });

    it('follows a new label, and removes it without one', async () => {
      const { page, field, part } = await render('<ds-field label="Email"><input></ds-field>');

      field.label = 'Work email';
      await page.waitForChanges();
      expect(part('label').textContent).toBe('Work email');

      field.label = undefined;
      await page.waitForChanges();
      expect(part('label')).toBeNull();
    });
  });

  describe('description', () => {
    it('renders the hint, and appends its id to the aria-describedby of the control, after those of the page', async () => {
      const { page, field, part, describedBy } = await render('<p id="note">Note</p><ds-field hint="Your work address"><input aria-describedby="note"></ds-field>');
      const hint = part('hint');

      expect([hint.textContent, hint.id]).toEqual(['Your work address', expect.stringMatching(/^ds-field-[\w-]+-hint$/)]);
      expect(describedBy()).toBe(`note ${hint.id}`);

      field.hint = '';
      await page.waitForChanges();
      expect([part('hint'), describedBy()]).toEqual([null, 'note']);
    });

    it('describes the control by an element of the page with slot="hint", which gets an id if it has none', async () => {
      const { field, part, describedBy } = await render('<ds-field hint="Ignored"><input><p slot="hint">At least <b>12</b> characters</p></ds-field>');
      const hint = field.querySelector('[slot="hint"]');

      expect(part('hint')).toBeNull();
      expect(hint.id).toMatch(/-hint$/);
      expect(describedBy()).toBe(hint.id);
    });

    it('keeps the ids the page adds to aria-describedby, and removes its own when it lets the control go', async () => {
      const { page, field, control, describedBy } = await render('<ds-field hint="Hint"><input aria-describedby="a"></ds-field>');
      const hintId = field.querySelector('.ds-field__hint').id;

      control.setAttribute('aria-describedby', `a ${hintId} b`);
      field.hint = 'New hint';
      await page.waitForChanges();
      expect(describedBy()).toBe(`a b ${hintId}`);

      field.remove();
      expect(describedBy()).toBe('a b');
    });

    it('describes a prefix or a suffix with a text, and hides one without text from assistive technologies', async () => {
      const { field, control, describedBy } = await render(
        '<ds-field label="Amount"><span slot="prefix" id="currency">€</span><input type="number"><span slot="suffix"><i class="icon"></i></span></ds-field>',
      );
      const [prefix, suffix] = [field.querySelector('[slot="prefix"]'), field.querySelector('[slot="suffix"]')];

      expect(describedBy()).toBe('currency');
      expect([prefix.hasAttribute('aria-hidden'), suffix.getAttribute('aria-hidden')]).toEqual([false, 'true']);
      expect(field).toHaveClasses(['--prefix', '--suffix']);
      expect(control.previousElementSibling).toBe(prefix);
    });
  });

  describe('error', () => {
    it('shows the error after an invalid event: the message of the browser, aria-invalid, its id in aria-describedby', async () => {
      const { page, field, control, part, describedBy } = await render('<form><ds-field hint="Hint"><input type="email" required></ds-field></form>');
      setValidity(control, { valueMissing: true }, 'Please fill out this field.');
      await field.refresh();

      // Invalid, not shown yet: "false" (the browser would tell assistive technologies it is invalid from the start).
      expect([part('error'), control.getAttribute('aria-invalid')]).toEqual([null, 'false']);

      invalid(control);
      expect([part('error').textContent, control.getAttribute('aria-invalid')]).toEqual(['Please fill out this field.', 'true']);
      expect(describedBy()).toBe(`${part('hint').id} ${part('error').id}`);
      // The parts under the control: the hint, then the error.
      expect(Array.from(field.children).map(child => child.className)).toEqual(['', 'ds-field__hint', 'ds-field__error']);
      await page.waitForChanges();
      expect(field).toHaveClass('--invalid');
    });

    it('shows the error once the user changed the value (change), updates it while the user types, hides it once valid', async () => {
      const { page, field, control, part } = await render('<ds-field><input type="email" required></ds-field>');
      const setFlags = setValidity(control, { valueMissing: true }, 'Please fill out this field.');
      await field.refresh();

      // Typing does not show the error: the change, once the value is committed, does.
      setFlags({ typeMismatch: true }, 'Please include an "@".');
      type(control, 'name');
      expect(part('error')).toBeNull();
      control.dispatchEvent(new Event('change', { bubbles: true }));
      expect(part('error').textContent).toBe('Please include an "@".');

      // Shown: it follows the value while the user types.
      setFlags({ typeMismatch: true }, 'Please enter a part following "@".');
      type(control, 'name@');
      expect(part('error').textContent).toBe('Please enter a part following "@".');

      setFlags({});
      type(control, 'name@example.com');
      expect([part('error'), control.hasAttribute('aria-invalid'), control.hasAttribute('aria-describedby')]).toEqual([null, false, false]);
      await page.waitForChanges();
      expect(field).not.toHaveClass('--invalid');
    });

    it('hides the error after a reset of its form, once the browser reset the values, not after another form or a cancelled reset', async () => {
      const { page, control, part } = await render('<form><ds-field><input required></ds-field></form><form id="other"></form>');
      setValidity(control, { valueMissing: true }, 'Please fill out this field.');
      const afterTimeout = () => new Promise(resolve => setTimeout(resolve));
      invalid(control);

      page.body.querySelector('#other').dispatchEvent(new Event('reset', { bubbles: true }));
      const form = page.body.querySelector('form');
      const cancel = (event: Event) => event.preventDefault();
      form.addEventListener('reset', cancel);
      form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }));
      form.removeEventListener('reset', cancel);
      await afterTimeout();
      expect(part('error')).not.toBeNull();

      form.dispatchEvent(new Event('reset', { bubbles: true }));
      expect(part('error')).not.toBeNull();
      await afterTimeout();
      expect([part('error'), control.getAttribute('aria-invalid')]).toEqual([null, 'false']);
    });

    it.each([
      ['the message of its flag in messages', { valueMissing: true }, `messages='{"valueMissing": "Enter your email"}'`, 'Enter your email'],
      [
        'error-message without a message for its flag',
        { typeMismatch: true },
        `messages='{"valueMissing": "Enter your email"}' error-message="Check your email"`,
        'Check your email',
      ],
      ['the message of the browser without either', { typeMismatch: true }, `messages='{"valueMissing": "Enter your email"}'`, 'Please include an "@".'],
      ['the message of a custom error of the page', { customError: true, valueMissing: true }, `messages='{"valueMissing": "Enter your email"}' error-message="Check"`, 'Taken'],
    ])('shows %s', async (_, flags, attributes, message) => {
      const { control, part } = await render(`<ds-field ${attributes}><input type="email" required></ds-field>`);
      setValidity(control, flags, 'customError' in flags ? 'Taken' : 'Please include an "@".');

      invalid(control);
      expect(part('error').textContent).toBe(message);
    });

    it('logs an error for messages or labels that are not valid JSON, and uses the defaults', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { control, part } = await render(`<ds-field label="Email" messages="{oops" labels="{oops"><input required></ds-field>`);
      setValidity(control, { valueMissing: true }, 'Please fill out this field.');

      invalid(control);
      expect([part('error').textContent, part('required').textContent]).toEqual(['Please fill out this field.', '*']);
      expect(error).toHaveBeenCalledWith('[ds-field] messages is not valid JSON');
      expect(error).toHaveBeenCalledWith('[ds-field] labels is not valid JSON');
    });
  });

  describe('counter', () => {
    it('shows the characters left of a maxlength, in the plural of the language, hidden but described', async () => {
      const { page, field, control, part, describedBy } = await render('<ds-field counter><textarea maxlength="10">Hello</textarea></ds-field>');
      const counter = part('counter');

      expect([counter.textContent, counter.getAttribute('aria-hidden'), describedBy()]).toEqual(['5 characters remaining', 'true', counter.id]);
      type(control as unknown as HTMLTextAreaElement, 'Hello you');
      expect(counter.textContent).toBe('1 character remaining');
      type(control as unknown as HTMLTextAreaElement, 'Hello you!');
      expect(counter.textContent).toBe('0 characters remaining');
      // Over the limit: a value set by a script (the browser stops the user at the limit).
      Object.defineProperty(control, 'value', { configurable: true, writable: true, value: 'Hello you!!!' });
      await field.refresh();
      expect([counter.textContent, counter.className]).toEqual(['2 characters over the limit', 'ds-field__counter --over']);

      Object.defineProperty(control, 'value', { configurable: true, writable: true, value: 'Hello' });
      field.setAttribute('lang', 'fr');
      field.setAttribute('labels', '{"counterRemaining": {"one": "{count} caractère restant", "other": "{count} caractères restants"}}');
      await page.waitForChanges();
      expect(counter.textContent).toBe('5 caractères restants');
      type(control as unknown as HTMLTextAreaElement, 'Hello you!');
      expect(counter.textContent).toBe('0 caractère restant');
    });

    it('tells screen readers the count once, after the user stopped typing, in a polite live region', async () => {
      const { field, control, part } = await render('<ds-field counter><input maxlength="20"></ds-field>');
      const status = part('status');

      expect([status.getAttribute('aria-live'), status.getAttribute('aria-atomic'), status.textContent, field.lastElementChild]).toEqual(['polite', 'true', '', status]);
      vi.useFakeTimers();
      for (const value of ['a', 'ab', 'abc']) {
        type(control, value);
        vi.advanceTimersByTime(DS_FIELD_COUNTER_DELAY / 2);
      }
      expect([part('counter').textContent, status.textContent]).toEqual(['17 characters remaining', '']);
      vi.advanceTimersByTime(DS_FIELD_COUNTER_DELAY / 2);
      expect(status.textContent).toBe('17 characters remaining');
    });

    it.each([
      ['without counter', '<ds-field><input maxlength="5"></ds-field>'],
      ['without a maxlength', '<ds-field counter><input></ds-field>'],
      ['for a select', '<ds-field counter><select maxlength="5"><option>a</option></select></ds-field>'],
    ])('renders no counter %s', async (_, html) => {
      const { part } = await render(html);

      expect([part('counter'), part('status')]).toEqual([null, null]);
    });
  });

  describe('password', () => {
    it('renders a toggle button after the input: not submitted, named, pressed while the password shows', async () => {
      const { page, field, control, part } = await render('<form><ds-field label="Password"><input type="password" name="pw" value="secret"></ds-field></form>');
      const toggle = part('toggle') as HTMLButtonElement;

      expect([toggle.tagName, toggle.getAttribute('type'), toggle.hasAttribute('name'), toggle.getAttribute('aria-label'), toggle.getAttribute('aria-pressed')]).toEqual([
        'BUTTON',
        'button',
        false,
        'Show password',
        'false',
      ]);
      expect(control.nextElementSibling).toBe(toggle);

      toggle.click();
      expect([control.getAttribute('type'), control.getAttribute('value'), toggle.getAttribute('aria-pressed')]).toEqual(['text', 'secret', 'true']);
      await page.waitForChanges();
      expect(field).toHaveClasses(['--password', '--password-shown']);

      toggle.click();
      expect([control.getAttribute('type'), toggle.getAttribute('aria-pressed')]).toEqual(['password', 'false']);

      field.setAttribute('labels', '{"showPassword": "Afficher le mot de passe"}');
      await page.waitForChanges();
      expect(toggle.getAttribute('aria-label')).toBe('Afficher le mot de passe');
    });

    it('hides the password when its form is submitted or reset, and when the page is left', async () => {
      const { page, control, part } = await render('<form><ds-field><input type="password"></ds-field></form>');
      const form = page.body.querySelector('form');

      for (const hide of [
        () => form.dispatchEvent(new Event('submit', { bubbles: true })),
        () => form.dispatchEvent(new Event('reset', { bubbles: true })),
        () => window.dispatchEvent(new Event('pagehide')),
      ]) {
        part('toggle').click();
        expect(control.getAttribute('type')).toBe('text');
        hide();
        expect([control.getAttribute('type'), part('toggle').getAttribute('aria-pressed')]).toEqual(['password', 'false']);
      }
    });

    it('disables the toggle with its input, and removes it when the input is no longer a password', async () => {
      const { page, field, control, part } = await render('<ds-field><input type="password" disabled></ds-field>');

      expect(part('toggle').hasAttribute('disabled')).toBe(true);
      part('toggle').click();
      expect(control.getAttribute('type')).toBe('password');

      control.setAttribute('type', 'email');
      await field.refresh();
      await page.waitForChanges();
      expect(part('toggle')).toBeNull();
      expect(field).not.toHaveClass('--password');
    });
  });

  describe('states and controls', () => {
    it.each([
      ['<input disabled>', ['--input', '--disabled']],
      ['<input readonly>', ['--input', '--readonly']],
      ['<textarea required></textarea>', ['--textarea', '--required']],
      ['<select><option>a</option></select>', ['--select']],
    ])('reflects the state of %s in its classes', async (html, classes) => {
      const { field } = await render(`<ds-field>${html}</ds-field>`);

      expect(field).toHaveClasses(['ds-field', ...classes]);
    });

    it('enhances the select of a ds-select, whose aria-invalid ds-select sets itself', async () => {
      const { page, field, part } = await render('<ds-field label="Size" hint="Hint"><ds-select name="size" required><option value="">Choose</option></ds-select></ds-field>');
      await field.refresh();
      await page.waitForChanges();
      const select = field.querySelector('select');
      setValidity(select, { valueMissing: true }, 'Please select an item in the list.');
      invalid(select);
      await page.waitForChanges();

      expect(part('label').getAttribute('for')).toBe('size');
      expect([select.getAttribute('aria-describedby'), part('error').textContent]).toEqual([`${part('hint').id} ${part('error').id}`, 'Please select an item in the list.']);
      expect(field).toHaveClasses(['--ds-select', '--required', '--invalid']);
    });

    it('enhances no checkbox, radio or other input, nor the control of a field in it', async () => {
      const { field, part } = await render('<ds-field label="A"><input type="checkbox"><input type="file"><ds-field><input id="inner"></ds-field></ds-field>');

      expect(part('label')).toBeNull();
      expect(field.querySelector('ds-field .ds-field__label')).toBeNull();
      expect(field).not.toHaveClass('--input');
    });

    it('creates no form control and moves none: the control keeps its place, its name and its value', async () => {
      const { field, control } = await render(
        '<form><ds-field label="Password" hint="Hint" counter><span slot="prefix">#</span><input type="password" name="pw" value="x" maxlength="9"></ds-field></form>',
      );
      const parts = Array.from(field.children).filter(child => child !== control && child.getAttribute('slot') !== 'prefix');

      expect(field.querySelectorAll('input, select, textarea, [name]').length).toBe(1);
      expect([control.getAttribute('name'), control.getAttribute('value'), control.previousElementSibling.getAttribute('slot')]).toEqual(['pw', 'x', 'prefix']);
      expect(parts.map(part => part.className)).toEqual(['ds-field__label', 'ds-field__toggle', 'ds-field__hint', 'ds-field__counter', 'ds-field__status']);
    });
  });

  describe('lifecycle', () => {
    it('gives the control and the page back as they were when it is removed', async () => {
      const { page, field, control, part } = await render(
        '<form><ds-field label="Password" hint="Hint" counter><span slot="suffix"></span><input type="password" maxlength="9" required aria-describedby="own"></ds-field></form>',
      );
      setValidity(control, { valueMissing: true }, 'Please fill out this field.');
      invalid(control);
      part('toggle').click();
      expect([control.getAttribute('aria-invalid'), control.getAttribute('type')]).toEqual(['true', 'text']);

      field.remove();
      const form = page.body.querySelector('form');
      form.appendChild(control);
      expect(control.outerHTML).toBe('<input type="password" maxlength="9" required="" aria-describedby="own">');
      expect(Array.from(field.children).map(child => child.outerHTML)).toEqual(['<span slot="suffix"></span>']);

      // Back in the document: it renders its parts again (the simulated DOM has no MutationObserver, which tells the field
      // its new control in a browser).
      form.appendChild(field);
      field.appendChild(control);
      await field.refresh();
      await page.waitForChanges();
      expect(part('label').getAttribute('for')).toBe(control.id);
    });

    it('follows a control replaced by another one: the former one let go, the new one described', async () => {
      const { page, field, control, part } = await render('<ds-field label="Message" hint="Hint" counter><input maxlength="5" aria-invalid="spelling"></ds-field>');
      setValidity(control, { tooShort: true }, 'Too short');
      invalid(control);
      expect(control.getAttribute('aria-invalid')).toBe('true');

      const textarea = page.doc.createElement('textarea');
      textarea.setAttribute('maxlength', '50');
      field.replaceChild(textarea, control);
      // The simulated DOM has no MutationObserver, which tells the field in a browser.
      await field.refresh();
      await page.waitForChanges();

      expect([control.hasAttribute('id'), control.hasAttribute('aria-describedby'), control.getAttribute('aria-invalid')]).toEqual([false, false, 'spelling']);
      expect([part('label').getAttribute('for'), textarea.getAttribute('aria-describedby')]).toEqual([textarea.id, `${part('hint').id} ${part('counter').id}`]);
      expect([part('counter').textContent, part('error')]).toEqual(['50 characters remaining', null]);
      expect(field).toHaveClass('--textarea');

      textarea.remove();
      await field.refresh();
      await page.waitForChanges();
      expect(field.children.length).toBe(0);
      expect(field).not.toHaveClass('--textarea');
    });
  });
});
