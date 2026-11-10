import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusFirstElement, getFocusedElement, getNeighbourTabbable, getTabbableElements, isTabbable } from './focus';

describe('focus', () => {
  const root = (html: string) => {
    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);
    return element;
  };

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('lists the elements Tab reaches, in the document order', () => {
    const element = root(`
      <a href="#a" id="link">Link</a>
      <a id="no-href">Not a link</a>
      <button id="button">Button</button>
      <button id="disabled" disabled>Disabled</button>
      <fieldset disabled><input id="in-disabled-fieldset" /></fieldset>
      <input type="hidden" />
      <input id="input" />
      <select id="select"></select>
      <textarea id="textarea"></textarea>
      <span tabindex="0" id="span"></span>
      <span tabindex="-1" id="out-of-order"></span>
      <div hidden><button id="hidden">Hidden</button></div>
      <div inert><button id="inert">Inert</button></div>
      <div contenteditable id="editable"></div>
      <summary id="summary">Summary</summary>
    `);

    expect(getTabbableElements(element).map(({ id }) => id)).toEqual(['link', 'button', 'input', 'select', 'textarea', 'span', 'editable', 'summary']);
    expect(isTabbable(element.querySelector('#out-of-order'))).toBe(false);
    expect(isTabbable(element.querySelector('#no-href'))).toBe(false);
  });

  it('leaves out the elements the browser does not render (checkVisibility())', () => {
    const element = root('<button id="a">A</button><button id="b">B</button>');
    const b = element.querySelector('#b') as HTMLElement & { checkVisibility?: () => boolean };
    b.checkVisibility = () => false;

    expect(getTabbableElements(element).map(({ id }) => id)).toEqual(['a']);
    expect(getTabbableElements(element, { checkVisibility: false }).map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('focuses an autofocus element first, else the first tabbable element, else the fallback', () => {
    const focus = vi.fn();
    const withAutofocus = root('<button id="a">A</button><span tabindex="-1" autofocus id="b">B</span>');
    const fallback = document.createElement('div');
    vi.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(fallback)), 'focus').mockImplementation(function (this: HTMLElement) {
      focus(this.id || this.tagName);
    });

    expect(focusFirstElement(withAutofocus, fallback).id).toBe('b');
    expect(focusFirstElement(root('<p>Text</p><button id="c">C</button>'), fallback).id).toBe('c');
    expect(focusFirstElement(root('<p>Text</p>'), fallback)).toBe(fallback);
    expect(focus.mock.calls).toEqual([['b'], ['c'], ['DIV']]);
  });

  it('finds the element the focus goes to when an element goes away: the next one Tab reaches, else the previous one', () => {
    const element = root(`
      <button id="first">First</button>
      <section id="wrapper" tabindex="-1">
        <a href="#" id="before">Before</a>
        <div id="gone"><button id="inside">Inside</button></div>
        <p>Text</p>
        <div><input id="after" /></div>
      </section>
      <button id="last" disabled>Last</button>`);
    const gone = element.querySelector('#gone');

    expect(getNeighbourTabbable(gone)?.id).toBe('after');
    element.querySelector('#after').remove();
    // The section around it is not one: it contains the element.
    expect(getNeighbourTabbable(gone)?.id).toBe('before');
    element.querySelector('#before').remove();
    expect(getNeighbourTabbable(gone)?.id).toBe('first');
    expect(getNeighbourTabbable(gone, element.querySelector('#wrapper'))).toBeNull();
    expect(getNeighbourTabbable(document.createElement('div'))).toBeNull();
  });

  it('returns null for the focused element when the body has the focus', () => {
    Object.defineProperty(document, 'activeElement', { configurable: true, get: () => document.body });
    expect(getFocusedElement()).toBeNull();

    const button = root('<button>A</button>').querySelector('button');
    Object.defineProperty(document, 'activeElement', { configurable: true, get: () => button });
    expect(getFocusedElement()).toBe(button);
    delete (document as { activeElement?: Element }).activeElement;
  });
});
