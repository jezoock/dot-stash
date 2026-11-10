import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { accessibleNode, focused, formEntries, mount, nextFrame, setForcedColors } from '../../../test/helpers/browser';
import { DS_FIELD_COUNTER_DELAY } from './field.constants';

type Field = HTMLElement & { refresh(): Promise<void> };

/** The controls of the form of the tests, each one in a field. */
const FIELDS = `
  <ds-field label="Name"><input id="name" name="name" value="Ada" autocomplete="name"></ds-field>
  <ds-field label="Email" hint="For the receipt" messages='{"valueMissing": "Enter your email"}'><input id="email" name="email" type="email" required></ds-field>
  <ds-field label="Password" counter><input id="password" name="password" type="password" value="secret" maxlength="20"></ds-field>
  <ds-field label="Amount"><span slot="prefix">€</span><input id="amount" name="amount" type="number" value="5"><span slot="suffix"><ds-icon type="cart"></ds-icon></span></ds-field>
  <ds-field label="Message" counter><textarea id="message" name="message" maxlength="50">Hi</textarea></ds-field>
  <ds-field label="Country"><select id="country" name="country"><option>FR</option><option>BE</option></select></ds-field>
  <ds-field label="Size"><ds-select name="size"><option value="s">S</option><option value="m">M</option></ds-select></ds-field>`;

/**
 * Renders a form, watching it from before its components load: the nodes removed from it (a control moved by a component
 * would be removed, then inserted again).
 */
const renderForm = async (html: string) => {
  const form = document.createElement('form');
  const removed: Node[] = [];
  new MutationObserver(records => records.forEach(record => removed.push(...Array.from(record.removedNodes)))).observe(form, { childList: true, subtree: true });
  form.innerHTML = html;
  document.body.append(form);
  const components = Array.from(form.querySelectorAll<HTMLElement & { componentOnReady?: () => Promise<unknown> }>('*')).filter(element => element.localName.includes('-'));
  await Promise.all([...new Set(components.map(element => element.localName))].map(tag => customElements.whenDefined(tag)));
  await Promise.all(components.map(element => element.componentOnReady?.()));
  await nextFrame();
  await nextFrame();
  const field = (selector: string) => form.querySelector<HTMLElement>(selector).closest('ds-field') as Field;
  return { form, removed, field };
};

describe('ds-field in a browser', () => {
  describe('the form', () => {
    it('submits the controls as without the field: no entry more, the password toggle not submitted, no control moved', async () => {
      const { form, removed } = await renderForm(`${FIELDS}<button id="send">Send</button>`);
      const plain = document.createElement('form');
      plain.innerHTML = FIELDS.replace(/<\/?ds-field[^>]*>/g, '').replace(/<ds-select name="size">([\s\S]*?)<\/ds-select>/, '<select name="size">$1</select>');
      const named = (target: HTMLFormElement) => Array.from(target.elements, element => (element as HTMLInputElement).name).filter(Boolean);

      expect(formEntries(form)).toEqual([
        ['name', 'Ada'],
        ['email', ''],
        ['password', 'secret'],
        ['amount', '5'],
        ['message', 'Hi'],
        ['country', 'FR'],
        ['size', 's'],
      ]);
      expect(formEntries(form)).toEqual(formEntries(plain));
      expect(named(form)).toEqual(named(plain));
      // The field renders one control, the password toggle: a button without a name.
      expect(Array.from(form.elements, element => element.className).filter(name => name.startsWith('ds-field'))).toEqual(['ds-field__toggle']);

      await userEvent.click(form.querySelector('.ds-field__toggle'));
      expect(formEntries(form)).toEqual(formEntries(plain));
      // The controls the page wrote were never removed from the form (moved).
      expect(removed.filter(node => node instanceof Element && node.matches('input, select, textarea'))).toEqual([]);
    });

    it('a submission with an invalid control: the browser focuses it, the field shows its error first, aria-invalid and the description follow', async () => {
      const { form, field } = await renderForm(`${FIELDS}<button id="send">Send</button>`);
      const email = form.querySelector<HTMLInputElement>('#email');
      const submits: string[] = [];
      form.addEventListener('submit', event => {
        event.preventDefault();
        submits.push('submit');
      });
      let atFocus: [string, string] | undefined;
      email.addEventListener('focus', () => (atFocus = [email.getAttribute('aria-invalid'), field('#email').querySelector('.ds-field__error')?.textContent]), { once: true });

      // Before: required and empty, not shown (Chromium would tell assistive technologies it is invalid from the start).
      expect(await accessibleNode('#email')).toMatchObject({ name: 'Email', description: 'For the receipt', properties: { invalid: 'false', required: true } });

      await userEvent.click(form.querySelector('#send'));
      expect([submits, focused(), atFocus]).toEqual([[], email, ['true', 'Enter your email']]);
      expect(await accessibleNode('#email')).toMatchObject({ name: 'Email', description: 'For the receipt Enter your email', properties: { invalid: 'true', required: true } });
      await expect.poll(() => field('#email').classList.contains('--invalid')).toBe(true);
      // The error is not a live region: it is read with the control, which has the focus.
      expect(field('#email').querySelector('.ds-field__error').closest('[aria-live], [role="alert"], [role="status"]')).toBeNull();

      await userEvent.type(email, 'ada@example.com');
      expect([email.hasAttribute('aria-invalid'), field('#email').querySelector('.ds-field__error')]).toEqual([false, null]);
      await userEvent.click(form.querySelector('#send'));
      expect(submits).toEqual(['submit']);
    });

    it('reportValidity() of a control focuses it and shows its error; checkValidity() shows it without the focus', async () => {
      const { form, field } = await renderForm(FIELDS);
      const email = form.querySelector<HTMLInputElement>('#email');
      form.querySelector<HTMLInputElement>('#name').focus();

      expect(form.checkValidity()).toBe(false);
      expect([focused().id, field('#email').querySelector('.ds-field__error').textContent]).toEqual(['name', 'Enter your email']);

      form.reset();
      await expect.poll(() => field('#email').querySelector('.ds-field__error')).toBeNull();
      expect(email.reportValidity()).toBe(false);
      expect([focused(), email.getAttribute('aria-invalid'), field('#email').querySelector('.ds-field__error').textContent]).toEqual([email, 'true', 'Enter your email']);
    });

    it('shows the error once the user leaves a value that is not valid, not while they type, as :user-invalid', async () => {
      const { form, field } = await renderForm(FIELDS);
      const email = form.querySelector<HTMLInputElement>('#email');
      const error = () => field('#email').querySelector('.ds-field__error')?.textContent ?? null;

      await userEvent.click(email);
      await userEvent.keyboard('ada');
      expect([error(), email.getAttribute('aria-invalid'), email.matches(':user-invalid')]).toEqual([null, 'false', false]);

      await userEvent.tab();
      expect([error(), email.getAttribute('aria-invalid'), email.matches(':user-invalid')]).toEqual([email.validationMessage, 'true', true]);
      expect(error()).toMatch(/@/);

      // Shown, it follows the value while the user types.
      await userEvent.click(email);
      await userEvent.keyboard('@example.com');
      expect([error(), email.hasAttribute('aria-invalid')]).toEqual([null, false]);
    });

    it('a form reset hides the errors and gives the counters their count back', async () => {
      const { form, field } = await renderForm(FIELDS);
      const message = form.querySelector<HTMLTextAreaElement>('#message');
      const counter = () => field('#message').querySelector('.ds-field__counter').textContent;
      form.checkValidity();
      await userEvent.type(message, ' there');
      expect([counter(), field('#email').querySelector('.ds-field__error')]).toEqual(['42 characters remaining', expect.any(HTMLElement)]);

      form.reset();

      await expect.poll(counter).toBe('48 characters remaining');
      expect([field('#email').querySelector('.ds-field__error'), form.querySelector('#email').getAttribute('aria-invalid')]).toEqual([null, 'false']);
      expect(field('#message').querySelector('.ds-field__status').textContent).toBe('');
    });

    it('a fieldset disabled at runtime disables the field and its password toggle: nothing submitted', async () => {
      const { form, field } = await renderForm(`<fieldset>${FIELDS}</fieldset>`);
      const fieldset = form.querySelector('fieldset');

      fieldset.disabled = true;
      await expect.poll(() => field('#password').classList.contains('--disabled')).toBe(true);
      expect(form.querySelectorAll('ds-field.--disabled').length).toBe(7);
      expect([form.querySelector('.ds-field__toggle').matches(':disabled'), formEntries(form)]).toEqual([true, []]);

      fieldset.disabled = false;
      await expect.poll(() => field('#password').classList.contains('--disabled')).toBe(false);
      expect(formEntries(form).length).toBe(7);
    });
  });

  describe('accessibility', () => {
    it('names the controls by their label (the required mark left out) and describes them by the hint, the counter and a prefix', async () => {
      await renderForm(FIELDS.replace('<input id="name"', '<input id="name" required'));

      expect(await accessibleNode('#name')).toMatchObject({ role: 'textbox', name: 'Name', description: '', properties: { required: true } });
      expect(await accessibleNode('#password')).toMatchObject({ name: 'Password', description: '14 characters remaining' });
      expect(await accessibleNode('#message')).toMatchObject({ role: 'textbox', name: 'Message', description: '48 characters remaining' });
      // The prefix has a text: it describes the amount; the suffix is an icon: hidden.
      expect(await accessibleNode('#amount')).toMatchObject({ role: 'spinbutton', name: 'Amount', description: '€' });
      expect(await accessibleNode('#amount + [slot="suffix"]')).toBeNull();
      expect(await accessibleNode('#country')).toMatchObject({ role: 'combobox', name: 'Country' });
      expect(await accessibleNode('ds-select select')).toMatchObject({ role: 'combobox', name: 'Size' });
      expect(await accessibleNode('.ds-field__toggle')).toMatchObject({ role: 'button', name: 'Show password', properties: { pressed: 'false' } });
      // The visible counter is hidden: the control reads it; the live region tells it once the user stops typing.
      expect(await accessibleNode('#password ~ .ds-field__counter')).toBeNull();
    });

    it('aria-invalid: Chromium tells a wrong value invalid from the load and at each key, never an empty required control; a field tells both once the user should see them', async () => {
      const form = await mount<HTMLFormElement>(`<form>
        <input id="bare-email" type="email" value="ada"><input id="bare-required" required>
        <ds-field><input id="email" type="email" value="ada"></ds-field><ds-field><input id="required" required></ds-field></form>`);
      const invalidOf = async (id: string) => (await accessibleNode(`#${id}`)).properties.invalid;

      expect([await invalidOf('bare-email'), await invalidOf('bare-required')]).toEqual(['true', 'false']);
      expect([await invalidOf('email'), await invalidOf('required')]).toEqual(['false', 'false']);

      form.checkValidity();
      expect([await invalidOf('bare-required'), await invalidOf('email'), await invalidOf('required')]).toEqual(['false', 'true', 'true']);
    });

    it('tells screen readers the count once the user stopped typing: the live region changes once', async () => {
      const { form, field } = await renderForm(FIELDS);
      const status = field('#message').querySelector('.ds-field__status');
      const texts: string[] = [];
      new MutationObserver(() => texts.push(status.textContent)).observe(status, { childList: true, characterData: true, subtree: true });

      await userEvent.type(form.querySelector('#message'), ' there, how are you');
      expect([field('#message').querySelector('.ds-field__counter').textContent, texts]).toEqual(['29 characters remaining', []]);

      await expect.poll(() => texts, { timeout: DS_FIELD_COUNTER_DELAY * 3 }).toEqual(['29 characters remaining']);
      await new Promise(resolve => setTimeout(resolve, DS_FIELD_COUNTER_DELAY));
      expect(texts).toEqual(['29 characters remaining']);
    });
  });

  describe('the password toggle', () => {
    it('shows and hides the password with the keyboard: the value and the focus kept, the caret given back to the input', async () => {
      const { form } = await renderForm(FIELDS);
      const password = form.querySelector<HTMLInputElement>('#password');
      const toggle = form.querySelector<HTMLButtonElement>('.ds-field__toggle');
      password.focus();
      password.setSelectionRange(2, 2);

      await userEvent.tab();
      expect(focused()).toBe(toggle);
      await userEvent.keyboard(' ');
      expect([password.type, password.value, toggle.getAttribute('aria-pressed'), focused()]).toEqual(['text', 'secret', 'true', toggle]);
      expect(await accessibleNode('.ds-field__toggle')).toMatchObject({ name: 'Show password', properties: { pressed: 'true' } });
      await expect.poll(() => toggle.closest('ds-field').classList.contains('--password-shown')).toBe(true);

      // Back to the input: the caret where it was (the browser would select the whole value, which a key would replace).
      await userEvent.tab({ shift: true });
      expect([focused(), password.selectionStart, password.selectionEnd]).toEqual([password, 2, 2]);
      await userEvent.keyboard('X');
      expect(password.value).toBe('seXcret');

      await userEvent.tab();
      await userEvent.keyboard('{Enter}');
      expect([password.type, password.value, focused()]).toEqual(['password', 'seXcret', toggle]);
      // Tab goes on to the next field.
      await userEvent.tab();
      expect(focused().id).toBe('amount');
    });

    it('hides the password when the form is submitted, before the submit listeners of the page', async () => {
      const { form } = await renderForm(`${FIELDS.replace(' required', '')}<button id="send">Send</button>`);
      const password = form.querySelector<HTMLInputElement>('#password');
      let typeAtSubmit = '';
      form.addEventListener('submit', event => {
        event.preventDefault();
        typeAtSubmit = password.type;
      });

      await userEvent.click(form.querySelector('.ds-field__toggle'));
      expect(password.type).toBe('text');
      await userEvent.click(form.querySelector('#send'));

      expect([typeAtSubmit, password.type, form.querySelector('.ds-field__toggle').getAttribute('aria-pressed')]).toEqual(['password', 'password', 'false']);
    });

    it('a mouse click shows the password, and keeps the focus on the toggle', async () => {
      const { form } = await renderForm(FIELDS);
      const toggle = form.querySelector<HTMLButtonElement>('.ds-field__toggle');

      await userEvent.click(toggle);
      expect([form.querySelector<HTMLInputElement>('#password').type, focused()]).toEqual(['text', toggle]);
    });
  });

  describe('layout and look', () => {
    it('places the label above the box, the hint, the error and the counter below, the parts of the box on one row', async () => {
      await page.viewport(800, 800);
      const { form, field } = await renderForm(FIELDS.replace('<input id="password"', '<input id="password" pattern="[0-9]+"'));
      form.checkValidity();
      await nextFrame();
      const box = (element: Element) => element.getBoundingClientRect();
      const password = field('#password');
      const [label, input, toggle, error, counter] = ['label', 'input', '.ds-field__toggle', '.ds-field__error', '.ds-field__counter'].map(selector =>
        box(password.querySelector(selector)),
      );

      expect(label.bottom).toBeLessThanOrEqual(input.top);
      expect([toggle.top, toggle.height, Math.round(toggle.left)]).toEqual([input.top, input.height, Math.round(input.right)]);
      expect(Math.round(toggle.right)).toBe(Math.round(box(password).right));
      expect(input.bottom).toBeLessThanOrEqual(error.top);
      expect(error.bottom).toBeLessThanOrEqual(counter.top);

      const amount = field('#amount');
      const [prefix, number, suffix] = ['[slot="prefix"]', 'input', '[slot="suffix"]'].map(selector => box(amount.querySelector(selector)));
      expect([Math.round(prefix.right), Math.round(number.right)]).toEqual([Math.round(number.left), Math.round(suffix.left)]);
      expect([prefix.height, suffix.height]).toEqual([number.height, number.height]);

      // Right to left: the row is reversed, the toggle on the left of the input.
      document.documentElement.dir = 'rtl';
      await nextFrame();
      expect(Math.round(box(password.querySelector('.ds-field__toggle')).right)).toBe(Math.round(box(password.querySelector('input')).left));
    });

    it('draws the invalid border and the error in the error color, the disabled box dimmed', async () => {
      const { form, field } = await renderForm(`${FIELDS}<ds-field label="Coupon"><input id="coupon" disabled></ds-field>`);
      form.checkValidity();
      await expect.poll(() => field('#email').classList.contains('--invalid')).toBe(true);
      const error = field('#email').querySelector('.ds-field__error');
      const errorColor = getComputedStyle(error).color;

      expect(errorColor).toBe('rgb(220, 38, 38)');
      expect(getComputedStyle(form.querySelector('#email')).borderTopColor).toBe(errorColor);
      expect(getComputedStyle(error, '::before')).toMatchObject({ maskImage: expect.stringMatching(/^url\("data:image\/svg\+xml,/), backgroundColor: errorColor });
      expect(getComputedStyle(form.querySelector('#coupon')).opacity).toBe('0.5');
      // Only the controls of the fields are styled by the field: a control out of a field keeps the base styles.
      const outside = document.createElement('input');
      form.append(outside);
      expect(getComputedStyle(outside).borderTopColor).not.toBe(getComputedStyle(form.querySelector('#name')).borderTopColor);
    });

    it('keeps the borders, the focus indicator and the icons visible in forced colors', async () => {
      const { form, field } = await renderForm(FIELDS);
      form.checkValidity();
      await setForcedColors(true);
      await nextFrame();
      const toggle = form.querySelector<HTMLButtonElement>('.ds-field__toggle');
      const icon = getComputedStyle(toggle, '::before');

      for (const element of [form.querySelector('#name'), toggle, form.querySelector('[slot="prefix"]')]) {
        const style = getComputedStyle(element);
        expect([style.borderTopStyle, style.borderTopWidth, style.borderTopColor === 'rgba(0, 0, 0, 0)']).toEqual(['solid', '1px', false]);
      }
      expect([icon.forcedColorAdjust, icon.backgroundColor, icon.width]).toEqual(['preserve-parent-color', getComputedStyle(toggle).color, getComputedStyle(toggle).fontSize]);
      const errorIcon = getComputedStyle(field('#email').querySelector('.ds-field__error'), '::before');
      expect(errorIcon.backgroundColor).toBe(getComputedStyle(field('#email').querySelector('.ds-field__error')).color);

      toggle.focus();
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await userEvent.tab();
      expect([focused(), getComputedStyle(toggle).outlineStyle, getComputedStyle(toggle).outlineWidth]).toEqual([toggle, 'solid', '2px']);
    });
  });

  describe('changes of the page', () => {
    it('follows a control replaced by another one, a new required state and a hint added with slot="hint"', async () => {
      const { form, field } = await renderForm('<ds-field label="Comment"><input id="comment" maxlength="10"></ds-field>');
      const comment = field('#comment');
      const input = form.querySelector<HTMLInputElement>('#comment');
      const textarea = document.createElement('textarea');
      textarea.id = 'long-comment';

      input.replaceWith(textarea);
      await expect.poll(() => comment.querySelector('label').htmlFor).toBe('long-comment');
      textarea.required = true;
      await expect.poll(() => comment.querySelector('.ds-field__required')?.textContent).toBe('*');
      const hint = document.createElement('p');
      hint.slot = 'hint';
      hint.textContent = 'Be kind';
      comment.append(hint);
      await expect.poll(() => hint.id).toMatch(/-hint$/);
      await expect.poll(() => textarea.getAttribute('aria-describedby')).toBe(hint.id);
      expect(await accessibleNode('#long-comment')).toMatchObject({ role: 'textbox', name: 'Comment', description: 'Be kind', properties: { required: true } });
      expect(input.outerHTML).toBe('<input id="comment" maxlength="10">');
      await expect.poll(() => comment.classList.contains('--textarea')).toBe(true);
    });

    it('a custom error of the page shows its message; refresh() follows one set out of an event', async () => {
      const { form, field } = await renderForm(FIELDS);
      const name = form.querySelector<HTMLInputElement>('#name');
      const error = () => field('#name').querySelector('.ds-field__error')?.textContent ?? null;
      name.addEventListener('input', () => name.setCustomValidity(name.value === 'admin' ? 'This name is taken' : ''));

      await userEvent.fill(name, 'admin');
      await userEvent.tab();
      expect(error()).toBe('This name is taken');

      name.setCustomValidity('');
      expect(error()).toBe('This name is taken');
      await (field('#name') as Field).refresh();
      expect(error()).toBeNull();
    });
  });
});
