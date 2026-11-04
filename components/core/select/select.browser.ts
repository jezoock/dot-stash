import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, formEntries, mount, recordEvents } from '../../../test/helpers/browser';

const OPTIONS = '<option value="">Choose</option><option value="red">Red</option><option value="blue">Blue</option>';

describe('ds-select in a browser', () => {
  const render = async (attributes = '', options = OPTIONS) => {
    const form = await mount<HTMLFormElement>(`<form><ds-select name="color" label="Color" ${attributes}>${options}</ds-select><button>Send</button></form>`);
    const select = form.querySelector('select');
    const label = () => form.querySelector('.ds-select__label').textContent;
    return { form, select, label };
  };

  it('its native select is the only control of the form: the value is submitted once, and follows the choice', async () => {
    const { form, select, label } = await render('', OPTIONS.replace('value="blue"', 'value="blue" selected'));
    const changes = recordEvents(form.querySelector('ds-select'), ['valueChange'], event => (event as CustomEvent).detail.selectedOption.value);

    expect(formEntries(form)).toEqual([['color', 'blue']]);
    expect(form.elements.length).toBe(2);

    await userEvent.selectOptions(select, 'red');

    expect(formEntries(form)).toEqual([['color', 'red']]);
    expect(label()).toBe('Red');
    expect(changes).toEqual(['red']);
  });

  it('a form reset shows the option the native select selects again', async () => {
    const { form, select, label } = await render('', OPTIONS.replace('value="blue"', 'value="blue" selected'));
    await userEvent.selectOptions(select, 'red');

    form.reset();

    await expect.poll(label).toBe('Blue');
    expect(formEntries(form)).toEqual([['color', 'blue']]);
  });

  it('required: the placeholder blocks the submission, the native select gets the focus and is invalid', async () => {
    const { form, select } = await render('required');
    const submits = recordEvents(form, ['submit']);
    form.addEventListener('submit', event => event.preventDefault());

    await userEvent.click(form.querySelector('button'));
    expect(submits).toEqual([]);
    expect(focused()).toBe(select);
    expect(select.matches(':invalid')).toBe(true);

    await userEvent.selectOptions(select, 'blue');
    await userEvent.click(form.querySelector('button'));
    expect(submits).toEqual(['submit']);
  });

  it('a fieldset disabled at runtime disables its native select: nothing submitted', async () => {
    const { form, select } = await render('', OPTIONS.replace('value="red"', 'value="red" selected'));
    const fieldset = document.createElement('fieldset');
    form.prepend(fieldset);
    fieldset.append(form.querySelector('ds-select'));

    fieldset.disabled = true;
    expect(select.matches(':disabled')).toBe(true);
    expect(formEntries(form)).toEqual([]);

    fieldset.disabled = false;
    expect(formEntries(form)).toEqual([['color', 'red']]);
  });

  it('is named by label (aria-label on the native select), and a <label> around it gives the focus to its select', async () => {
    await mount(`<label>Colour <ds-select name="colour">${OPTIONS}</ds-select></label><ds-select name="color" label="Color">${OPTIONS}</ds-select>`);
    const [around, named] = Array.from(document.querySelectorAll('select'));

    expect(named.getAttribute('aria-label')).toBe('Color');
    expect(around.labels[0].textContent.trim()).toMatch(/^Colour/);

    await userEvent.click(document.querySelector('label'), { position: { x: 2, y: 2 } });
    expect(focused()).toBe(around);
  });
});
