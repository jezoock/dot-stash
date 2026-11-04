import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, formEntries, mount, recordEvents, textOfIds } from '../../../test/helpers/browser';

type Combo = HTMLDsComboElement & HTMLElement;

const FRUITS = JSON.stringify(['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry', 'Date'].map(name => ({ name, value: name.toLowerCase() })));

describe('ds-combo in a browser', () => {
  const render = async (attributes = '', before = '<button type="button" id="before">Before</button>') => {
    await mount(`<form>${before}<ds-combo name="fruit" label="Fruit" options='${FRUITS}' ${attributes}></ds-combo><button type="button" id="after">After</button></form>`);
    const form = document.querySelector('form');
    const combo = form.querySelector<Combo>('ds-combo');
    const combobox = combo.querySelector<HTMLButtonElement>('.ds-combo__selected-option');
    const isOpen = () => combobox.getAttribute('aria-expanded') === 'true';
    const active = () => document.getElementById(combobox.getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? null;
    const selected = () => (combo.selectedOptions as { name: string }[]).map(option => option.name);
    return { form, combo, combobox, isOpen, active, selected };
  };

  describe('keyboard (select-only combobox)', () => {
    it('Tab reaches the combobox, which is named by label and keeps the focus while the keys move the active option', async () => {
      const { combobox, isOpen, active } = await render();
      document.querySelector<HTMLElement>('#before').focus();

      await userEvent.tab();
      expect(focused()).toBe(combobox);
      expect([combobox.getAttribute('role'), combobox.getAttribute('aria-label')]).toEqual(['combobox', 'Fruit']);

      await userEvent.keyboard('{ArrowDown}');
      expect([isOpen(), active()]).toEqual([true, 'Apple']);
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      expect(active()).toBe('Banana');
      await userEvent.keyboard('{End}');
      expect(active()).toBe('Date');
      await userEvent.keyboard('{ArrowDown}');
      expect(active()).toBe('Date');
      await userEvent.keyboard('{Home}');
      expect(active()).toBe('Apple');
      expect(focused()).toBe(combobox);
    });

    it('Enter selects the active option and closes the list, the focus on the combobox; Space opens it on the selected option', async () => {
      const { combo, combobox, isOpen, active, selected } = await render();
      const selections = recordEvents(combo, ['optionSelected'], event => (event as CustomEvent).detail.option.name);
      combobox.focus();

      await userEvent.keyboard('{Enter}');
      expect(isOpen()).toBe(true);
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      expect([isOpen(), selected(), focused()]).toEqual([false, ['Banana'], combobox]);
      expect(combobox.textContent).toContain('Banana');

      await userEvent.keyboard(' ');
      expect([isOpen(), active()]).toEqual([true, 'Banana']);
      expect(selections).toEqual(['Banana']);
    });

    it('type-ahead: the characters typed together move the active option to the next name that starts with them', async () => {
      const { combobox, isOpen, active } = await render();
      combobox.focus();

      await userEvent.keyboard('b');
      expect([isOpen(), active()]).toEqual([true, 'Banana']);
      await userEvent.keyboard('l');
      expect(active()).toBe('Blackberry');
    });

    it('type-ahead: the same character typed again goes round the names that start with it', async () => {
      const { combobox, active } = await render();
      combobox.focus();

      // Opened on the first option, Apple: the search starts after it, as in a native select.
      await userEvent.keyboard('a');
      expect(active()).toBe('Apricot');
      await userEvent.keyboard('a');
      expect(active()).toBe('Apple');
      await userEvent.keyboard('a');
      expect(active()).toBe('Apricot');
    });

    it('Escape closes the list without changing the selection, and the key press goes no further', async () => {
      const { combobox, isOpen, selected } = await render(`selected='{"value": "cherry"}'`);
      const escapes = recordEvents(document, ['keydown'], event => (event as KeyboardEvent).key);
      combobox.focus();

      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      await userEvent.keyboard('{Escape}');

      expect([isOpen(), selected(), focused()]).toEqual([false, ['Cherry'], combobox]);
      expect(escapes).toEqual(['ArrowDown', 'ArrowDown']);
    });

    it('Tab closes the list of a single combo, selecting the active option, and the focus moves on', async () => {
      const { combobox, isOpen, selected } = await render();
      combobox.focus();

      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      await userEvent.tab();

      expect([isOpen(), selected(), focused()]).toEqual([false, ['Apricot'], document.querySelector('#after')]);
    });

    it('a multiple combo: Enter and Space toggle the active option, the list stays open', async () => {
      const { combobox, isOpen, selected } = await render('multiple custom-label="Fruits"');
      combobox.focus();

      await userEvent.keyboard('{ArrowDown}{Enter}{ArrowDown}{ArrowDown} ');
      expect([isOpen(), selected()]).toEqual([true, ['Apple', 'Banana']]);
      await userEvent.keyboard('{ArrowUp}{ArrowUp}{Enter}');
      expect(selected()).toEqual(['Banana']);
    });
  });

  describe('form', () => {
    it('submits the value of its selected option; a multiple combo one entry per option; nothing without a selection', async () => {
      const { form } = await render('', '');
      expect(formEntries(form)).toEqual([]);

      await mount(
        `<form><ds-combo name="fruit" label="Fruit" options='${FRUITS}' selected='{"value": "date"}'></ds-combo><ds-combo name="fruits" label="Fruits" multiple options='${FRUITS}'></ds-combo></form>`,
      );
      const [, multiple] = Array.from(document.querySelectorAll<Combo>('ds-combo'));
      const multipleBox = multiple.querySelector<HTMLElement>('.ds-combo__selected-option');
      multipleBox.focus();
      await userEvent.keyboard('{ArrowDown}{Enter}{ArrowDown}{ArrowDown}{Enter}{Escape}');

      expect(formEntries(document.querySelector('form'))).toEqual([
        ['fruit', 'date'],
        ['fruits', 'apple'],
        ['fruits', 'banana'],
      ]);
    });

    it('a form reset gives back the selection of the load, without an optionSelected event', async () => {
      const { form, combo, combobox, selected } = await render(`selected='{"value": "cherry"}'`);
      combobox.focus();
      await userEvent.keyboard('{Home}{Enter}');
      expect(formEntries(form)).toEqual([['fruit', 'apple']]);
      const selections = recordEvents(combo, ['optionSelected']);

      form.reset();

      await expect.poll(selected).toEqual(['Cherry']);
      expect(formEntries(form)).toEqual([['fruit', 'cherry']]);
      expect(selections).toEqual([]);
    });

    it('a fieldset disabled at runtime disables its combobox: nothing submitted, out of the Tab order', async () => {
      await mount(
        `<form><button type="button" id="before">Before</button><fieldset><ds-combo name="fruit" label="Fruit" options='${FRUITS}' selected='{"index": 0}'></ds-combo></fieldset><button type="button" id="after">After</button></form>`,
      );
      const form = document.querySelector('form');
      const combobox = form.querySelector<HTMLButtonElement>('.ds-combo__selected-option');

      form.querySelector('fieldset').disabled = true;
      await expect.poll(() => combobox.disabled).toBe(true);
      expect(formEntries(form)).toEqual([]);
      document.querySelector<HTMLElement>('#before').focus();
      await userEvent.tab();
      expect(focused()).toBe(document.querySelector('#after'));

      form.querySelector('fieldset').disabled = false;
      await expect.poll(() => combobox.disabled).toBe(false);
      expect(formEntries(form)).toEqual([['fruit', 'apple']]);
    });

    it('required: the submission is blocked, the focus goes to the combobox, aria-invalid once invalid, until an option is selected', async () => {
      const { form, combobox } = await render('required', '').then(async rendered => {
        rendered.form.querySelector('#after').setAttribute('type', 'submit');
        return rendered;
      });
      const submits = recordEvents(form, ['submit']);
      form.addEventListener('submit', event => event.preventDefault());

      expect([combobox.getAttribute('aria-required'), combobox.getAttribute('aria-invalid')]).toEqual(['true', 'false']);
      await userEvent.click(form.querySelector('#after'));

      expect(submits).toEqual([]);
      expect(focused()).toBe(combobox);
      await expect.poll(() => combobox.getAttribute('aria-invalid')).toBe('true');

      await userEvent.keyboard('{ArrowDown}{Enter}');
      await expect.poll(() => combobox.getAttribute('aria-invalid')).toBeNull();
      await userEvent.click(form.querySelector('#after'));
      expect(submits).toEqual(['submit']);
    });

    it('a click on its <label for> gives the focus to the combobox, which the label names', async () => {
      await mount(`<label for="fruit">Fruit of the day</label><ds-combo id="fruit" name="fruit" options='${FRUITS}'></ds-combo>`);
      const combobox = document.querySelector<HTMLElement>('.ds-combo__selected-option');

      await userEvent.click(document.querySelector('label'));

      expect(focused()).toBe(combobox);
      expect(textOfIds(combobox.getAttribute('aria-labelledby'))).toBe('Fruit of the day');
    });
  });
});
