import { newSpecPage } from '@stencil/core/testing';
import { DSSelect } from './select';

describe('ds-select', () => {
  const options = '<option value="red">Red</option><option value="blue" selected>Blue</option>';

  const render = async (attributes = '', html = options) => {
    const page = await newSpecPage({ components: [DSSelect], html: `<ds-select ${attributes}>${html}</ds-select>` });
    const select = page.root.querySelector('select');
    const label = page.root.querySelector('.ds-select__label') as HTMLElement;
    return { page, select, label };
  };

  it('renders a native select with the options, its name and its id, and the label of the selected option', async () => {
    const { page, select, label } = await render('name="color"');

    expect(select).toHaveClass('ds-select__input');
    expect([select.getAttribute('name'), select.getAttribute('id')]).toEqual(['color', 'color']);
    expect(Array.from(select.querySelectorAll('option')).map(option => option.getAttribute('value'))).toEqual(['red', 'blue']);
    expect(label.textContent).toBe('Blue');
    // The simulated DOM has no option values (a browser gives "blue").
    expect((await page.root.getValue()).label).toBe('Blue');
  });

  it('selects in the native select the option the box shows: the first one, without a selected option', async () => {
    const { select, label } = await render('', '<option value="s">S</option><option value="m">M</option>');
    const [first, second] = Array.from(select.querySelectorAll('option'));

    expect(label.textContent).toBe('S');
    // The simulated DOM has no selectedness: the property set by the component.
    expect([first.selected, second.selected]).toEqual([true, undefined]);
  });

  it('hides the label of the box from assistive technologies: the select gives its value', async () => {
    const { label } = await render();

    expect(label.getAttribute('aria-hidden')).toBe('true');
  });

  it.each([
    ['label', 'label="Color"', 'Color', null],
    ['labelledby', 'labelledby="color-title" label="Color"', null, 'color-title'],
    ['nothing (a <label> around it or a <label for> names it)', '', null, null],
  ])('is named by %s', async (_, attributes, ariaLabel, ariaLabelledby) => {
    const { select } = await render(attributes);

    expect([select.getAttribute('aria-label'), select.getAttribute('aria-labelledby')]).toEqual([ariaLabel, ariaLabelledby]);
  });

  it('disables the native select (no focus, no change) while disabled', async () => {
    const { page, select } = await render('disabled');

    // The simulated DOM has no disabled property: the attribute is written.
    expect(select.hasAttribute('disabled')).toBe(true);
    expect(page.root).toHaveClass('--disabled');

    page.root.disabled = false;
    await page.waitForChanges();

    expect(select.hasAttribute('disabled')).toBe(false);
    expect(page.root).not.toHaveClass('--disabled');
  });

  it('shows the label of the option selected with the select, and emits valueChange', async () => {
    const { page, select, label } = await render();
    const onChange = jest.fn();
    page.root.addEventListener('valueChange', onChange);

    // The simulated DOM has no selectedOptions, nor option values: as a browser gives them.
    const red = select.querySelector('option');
    Object.defineProperty(red, 'value', { value: 'red' });
    Object.defineProperty(select, 'selectedOptions', { value: [red] });
    select.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(label.textContent).toBe('Red');
    expect(await page.root.getValue()).toEqual({ value: 'red', label: 'Red' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
