import { h } from '@stencil/core';
import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSButton } from './button';

describe('ds-button', () => {
  const render = (html: string) => newSpecPage({ components: [DSButton], html });

  const control = (page: SpecPage) => page.root.querySelector('.ds-button__control') as HTMLElement;

  describe('button', () => {
    it('renders a native button of type button, holding the content', async () => {
      const page = await render('<ds-button>Save</ds-button>');

      expect(page.root).toHaveClass('ds-button');
      expect(page.root.children).toHaveLength(1);
      expect(control(page).tagName).toBe('BUTTON');
      expect(control(page).getAttribute('type')).toBe('button');
      expect(control(page).textContent).toBe('Save');
      expect(page.root.querySelector('a')).toBeNull();
    });

    it.each(['submit', 'reset', 'button'])('renders a native button of type %s', async type => {
      const page = await render(`<ds-button type="${type}">Save</ds-button>`);

      expect(control(page).getAttribute('type')).toBe(type);
    });

    it('renders a native button of type button for an unknown type', async () => {
      const page = await render('<ds-button type="unknown">Save</ds-button>');

      expect(control(page).getAttribute('type')).toBe('button');
    });

    it('sets the accessible name from label', async () => {
      const page = await render('<ds-button label="Close"><span class="icon"></span></ds-button>');

      expect(control(page).getAttribute('aria-label')).toBe('Close');
    });

    it('puts the before, default and after slots in this order in the button', async () => {
      const page = await render('<ds-button><span slot="after">A</span>Label<span slot="before">B</span></ds-button>');

      expect(control(page).textContent).toBe('BLabelA');
      expect(control(page).querySelector('[slot="before"]')).not.toBeNull();
      expect(control(page).querySelector('[slot="after"]')).not.toBeNull();
    });
  });

  describe('link', () => {
    it('renders a link to href, with target and rel', async () => {
      const page = await render('<ds-button href="/docs" target="_blank" rel="noopener" type="submit">Docs</ds-button>');

      expect(control(page).tagName).toBe('A');
      expect(control(page).getAttribute('href')).toBe('/docs');
      expect(control(page).getAttribute('target')).toBe('_blank');
      expect(control(page).getAttribute('rel')).toBe('noopener');
      expect(control(page).textContent).toBe('Docs');
      expect(control(page).hasAttribute('type')).toBe(false);
      expect(control(page).hasAttribute('aria-disabled')).toBe(false);
      expect(control(page).hasAttribute('tabindex')).toBe(false);
      expect(page.root.querySelector('button')).toBeNull();
    });

    it('updates the URL of the link when href changes', async () => {
      const page = await render('<ds-button href="/docs">Docs</ds-button>');

      page.root.href = '/home';
      await page.waitForChanges();

      expect(control(page).getAttribute('href')).toBe('/home');
      expect(control(page).textContent).toBe('Docs');
    });

    it.each([
      ['a button stays a button when href is set', '<ds-button>Docs</ds-button>', '/docs', 'BUTTON'],
      ['a link stays a link when href is removed', '<ds-button href="/docs">Docs</ds-button>', undefined, 'A'],
    ])('%s after the load, keeping its content', async (_, html, href, tagName) => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const page = await render(html);

      page.root.href = href;
      await page.waitForChanges();

      expect(control(page).tagName).toBe(tagName);
      expect(control(page).textContent).toBe('Docs');
      expect(control(page).hasAttribute('href')).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('[ds-button] href chooses between a link and a button when the component loads'));
      consoleWarn.mockRestore();
    });
  });

  describe('disabled', () => {
    it('disables the native button and reflects the attribute', async () => {
      const page = await render('<ds-button disabled>Save</ds-button>');

      expect(page.root).toHaveAttribute('disabled');
      expect(control(page)).toHaveAttribute('disabled');

      page.root.disabled = false;
      await page.waitForChanges();

      expect(page.root).not.toHaveAttribute('disabled');
      expect(control(page)).not.toHaveAttribute('disabled');
    });

    it('removes the href of a link, which is aria-disabled and out of the tab order, until it is enabled', async () => {
      const page = await render('<ds-button href="/docs" disabled>Docs</ds-button>');

      expect(control(page).tagName).toBe('A');
      expect(control(page).hasAttribute('href')).toBe(false);
      expect(control(page).getAttribute('role')).toBe('link');
      expect(control(page).getAttribute('aria-disabled')).toBe('true');
      expect(control(page).getAttribute('tabindex')).toBe('-1');

      page.root.disabled = false;
      await page.waitForChanges();

      expect(control(page).getAttribute('href')).toBe('/docs');
      expect(control(page).hasAttribute('role')).toBe(false);
      expect(control(page).hasAttribute('aria-disabled')).toBe(false);
      expect(control(page).hasAttribute('tabindex')).toBe(false);
    });

    it.each([
      ['a button', {}],
      ['a link', { href: '/docs' }],
    ])('stops the clicks of %s before the listeners of the host and of the document, and prevents their default action', async (_, props) => {
      const hostClick = jest.fn();
      const documentClick = jest.fn();
      const page = await newSpecPage({
        components: [DSButton],
        template: () => (
          <ds-button {...props} disabled onClick={hostClick}>
            <span class="label">Save</span>
          </ds-button>
        ),
      });
      page.doc.addEventListener('click', documentClick);
      const click = (element: Element) => {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event;
      };

      expect(click(page.root.querySelector('.label')).defaultPrevented).toBe(true);
      expect(click(control(page)).defaultPrevented).toBe(true);
      expect(hostClick).not.toHaveBeenCalled();
      expect(documentClick).not.toHaveBeenCalled();

      page.root.disabled = false;
      await page.waitForChanges();

      expect(click(page.root.querySelector('.label')).defaultPrevented).toBe(false);
      expect(hostClick).toHaveBeenCalledTimes(1);
      expect(documentClick).toHaveBeenCalledTimes(1);

      page.doc.removeEventListener('click', documentClick);
    });
  });
});
