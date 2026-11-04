import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, formEntries, mount, recordEvents } from '../../../test/helpers/browser';

type Toggle = HTMLDsToggleElement & HTMLElement;
type Group = HTMLDsToggleGroupElement & HTMLElement;

/** A radio group of the sizes s, m, l, xl (l disabled), between two buttons, in a form. */
const SIZES = `<form>
  <button type="button" id="before">Before</button>
  <ds-toggle-group type="radio" name="size" label="Size">
    <ds-toggle value="s" label="Small"></ds-toggle><ds-toggle value="m" label="Medium"></ds-toggle><ds-toggle value="l" label="Large" disabled></ds-toggle><ds-toggle value="xl" label="Extra large"></ds-toggle>
  </ds-toggle-group>
  <button type="button" id="after">After</button>
</form>`;

describe('ds-toggle-group in a browser', () => {
  const render = async (html = SIZES) => {
    const form = await mount<HTMLFormElement>(html);
    const group = form.querySelector<Group>('ds-toggle-group');
    const toggles = Array.from(form.querySelectorAll<Toggle>('ds-toggle'));
    const toggle = (value: string) => toggles.find(item => item.value === value);
    const checked = () => toggles.filter(item => item.checked).map(item => item.value);
    return { form, group, toggle, checked };
  };

  describe('keyboard: a radio group (roving tabindex)', () => {
    it('Tab reaches one radio, the first enabled one without a checked one, then leaves the group', async () => {
      const { toggle } = await render();
      document.querySelector<HTMLElement>('#before').focus();

      await userEvent.tab();
      expect(focused()).toBe(toggle('s'));

      await userEvent.tab();
      expect(focused()).toBe(document.querySelector('#after'));

      await userEvent.tab({ shift: true });
      expect(focused()).toBe(toggle('s'));
    });

    it('the arrow keys move the focus and the selection over the enabled radios, round the group; Home and End too', async () => {
      const { group, toggle, checked } = await render();
      const changes = recordEvents(group, ['toggleValueChange'], event => (event as CustomEvent).detail.value);
      toggle('s').focus();

      await userEvent.keyboard('{ArrowRight}');
      expect([focused(), checked()]).toEqual([toggle('m'), ['m']]);
      // Large is disabled: skipped.
      await userEvent.keyboard('{ArrowDown}');
      expect([focused(), checked()]).toEqual([toggle('xl'), ['xl']]);
      await userEvent.keyboard('{ArrowRight}');
      expect([focused(), checked()]).toEqual([toggle('s'), ['s']]);
      await userEvent.keyboard('{ArrowLeft}');
      expect([focused(), checked()]).toEqual([toggle('xl'), ['xl']]);
      await userEvent.keyboard('{Home}');
      expect([focused(), checked()]).toEqual([toggle('s'), ['s']]);
      await userEvent.keyboard('{End}');
      expect([focused(), checked()]).toEqual([toggle('xl'), ['xl']]);

      expect(changes).toEqual([['m'], ['xl'], ['s'], ['xl'], ['s'], ['xl']]);
    });

    it('Tab comes back to the checked radio, the only one in the Tab order', async () => {
      const { toggle } = await render();
      toggle('s').focus();
      await userEvent.keyboard('{ArrowRight}');
      await userEvent.tab();
      expect(focused()).toBe(document.querySelector('#after'));

      await userEvent.tab({ shift: true });

      expect(focused()).toBe(toggle('m'));
      expect(['s', 'm', 'xl'].map(value => toggle(value).getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    });

    it('a group of checkboxes keeps each toggle in the Tab order, and the arrow keys do nothing', async () => {
      const { toggle, checked } = await render(
        '<form><ds-toggle-group type="checkbox" count="[0, 3]" name="toppings" label="Toppings"><ds-toggle value="cheese" label="Cheese"></ds-toggle><ds-toggle value="ham" label="Ham"></ds-toggle></ds-toggle-group></form>',
      );
      toggle('cheese').focus();

      await userEvent.keyboard('{ArrowRight}');
      expect([focused(), checked()]).toEqual([toggle('cheese'), []]);
      await userEvent.tab();
      expect(focused()).toBe(toggle('ham'));
      await userEvent.keyboard(' ');
      expect(checked()).toEqual(['ham']);
    });
  });

  describe('form', () => {
    it('its toggles submit their values under its name, each once: a radio group one value, checkboxes several', async () => {
      const { form, toggle } = await render(
        `${SIZES.replace('</form>', '')}<ds-toggle-group type="checkbox" count="[0, 3]" name="toppings" label="Toppings"><ds-toggle value="cheese" label="Cheese"></ds-toggle><ds-toggle value="ham" label="Ham"></ds-toggle></ds-toggle-group></form>`,
      );

      await userEvent.click(toggle('m'));
      await userEvent.click(toggle('cheese'));
      await userEvent.click(toggle('ham'));

      expect(formEntries(form)).toEqual([
        ['size', 'm'],
        ['toppings', 'cheese'],
        ['toppings', 'ham'],
      ]);
    });

    it('a form reset gives back the selection of the load', async () => {
      const { form, toggle, checked } = await render(SIZES.replace('value="xl" label="Extra large"', 'value="xl" label="Extra large" checked'));
      await userEvent.click(toggle('s'));
      expect(formEntries(form)).toEqual([['size', 's']]);

      form.reset();

      await expect.poll(checked).toEqual(['xl']);
      expect(formEntries(form)).toEqual([['size', 'xl']]);
    });

    it('a fieldset disabled at runtime disables its toggles: nothing submitted, out of the Tab order', async () => {
      const { form, group, toggle } = await render(SIZES.replace('<ds-toggle-group', '<fieldset><ds-toggle-group').replace('</ds-toggle-group>', '</ds-toggle-group></fieldset>'));
      await userEvent.click(toggle('m'));
      document.querySelector<HTMLElement>('#before').focus();

      form.querySelector('fieldset').disabled = true;
      await expect.poll(() => group.getAttribute('aria-disabled')).toBe('true');
      expect(formEntries(form)).toEqual([]);
      await userEvent.tab();
      expect(focused()).toBe(document.querySelector('#after'));

      form.querySelector('fieldset').disabled = false;
      await expect.poll(() => group.getAttribute('aria-disabled')).toBeNull();
      expect(formEntries(form)).toEqual([['size', 'm']]);
    });

    it('required: the submission is blocked and the focus goes to the radio Tab reaches, until a radio is checked', async () => {
      const { form, group, toggle } = await render(SIZES.replace('label="Size"', 'label="Size" required').replace('type="button" id="after">After', 'id="after">Send'));
      const submits = recordEvents(form, ['submit']);
      form.addEventListener('submit', event => event.preventDefault());

      expect(group.getAttribute('aria-required')).toBe('true');
      expect(group.getAttribute('aria-invalid')).toBe('false');
      await userEvent.click(document.querySelector('#after'));

      expect(submits).toEqual([]);
      expect(focused()).toBe(toggle('s'));
      await expect.poll(() => group.getAttribute('aria-invalid')).toBe('true');

      await userEvent.keyboard('{ArrowRight}');
      await expect.poll(() => group.getAttribute('aria-invalid')).toBeNull();
      await userEvent.click(document.querySelector('#after'));
      expect(submits).toEqual(['submit']);
      expect(formEntries(form)).toEqual([['size', 'm']]);
    });

    it('a click on its <label for> gives the focus to the radio Tab reaches, without changing the selection', async () => {
      const { toggle, checked } = await render(
        SIZES.replace('<ds-toggle-group type="radio" name="size" label="Size">', '<label for="size">Size</label><ds-toggle-group id="size" type="radio" name="size">'),
      );

      await userEvent.click(document.querySelector('label'));

      expect(focused()).toBe(toggle('s'));
      expect(checked()).toEqual([]);
    });
  });
});
