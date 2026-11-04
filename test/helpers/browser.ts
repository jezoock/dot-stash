import { commands } from 'vitest/browser';

// The helpers of the browser tests (Chromium, with the build of the components and the theme: test/setup/browser.ts).

declare module 'vitest/browser' {
  interface BrowserCommands {
    /** Emulates media features of the page, as Playwright's `page.emulateMedia()` (vitest.config.mts). */
    emulateMedia: (options: { reducedMotion?: 'reduce' | 'no-preference' | null; forcedColors?: 'active' | 'none' | null }) => Promise<void>;
    /** Compiles SCSS with the Sass of the project, `scss/` on its load path (`@use 'engine' as *;`), in Node: the CSS. */
    compileScss: (source: string) => Promise<string>;
  }
}

/** The size of the page of the tests (vitest.config.mts), which each test gets back. */
export const DEFAULT_VIEWPORT = { width: 1280, height: 800 };

/** A component element: the method the Stencil runtime adds to it. */
type ComponentElement = HTMLElement & { componentOnReady?: () => Promise<unknown> };

/** Waits for the next animation frame. */
export const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

/**
 * Renders HTML in the body and waits for its components: defined (their bundle loaded), loaded and rendered, and one more
 * frame, so that their hydrated visibility (a transition of the theme for some of them) lets them take the focus.
 * Returns the first element.
 */
export const mount = async <T extends HTMLElement = HTMLElement>(html: string): Promise<T> => {
  document.body.innerHTML = html;
  const components = Array.from(document.body.querySelectorAll<ComponentElement>('*')).filter(element => element.localName.includes('-'));
  await Promise.all([...new Set(components.map(element => element.localName))].map(tag => customElements.whenDefined(tag)));
  await Promise.all(components.map(element => element.componentOnReady?.()));
  await nextFrame();
  await nextFrame();
  return document.body.firstElementChild as T;
};

/** The next event of a type on a target. */
export const nextEvent = <E extends Event = Event>(target: EventTarget, type: string) =>
  new Promise<E>(resolve => target.addEventListener(type, event => resolve(event as E), { once: true }));

/** Collects the events of some types on a target, in order: their types, or what `map` gives. */
export const recordEvents = <T = string>(target: EventTarget, types: string[], map: (event: Event) => T = event => event.type as T) => {
  const events: T[] = [];
  types.forEach(type => target.addEventListener(type, event => events.push(map(event))));
  return events;
};

/** The entries of the FormData of a form, as the browser submits them: `[name, value]` pairs. */
export const formEntries = (form: HTMLFormElement) => Array.from(new FormData(form) as unknown as Iterable<[string, FormDataEntryValue]>);

/** The element that has the focus. */
export const focused = () => document.activeElement;

/** Asks for less motion (`prefers-reduced-motion: reduce`), as the system setting of the user does, or not. */
export const setReducedMotion = (reduce: boolean) => commands.emulateMedia({ reducedMotion: reduce ? 'reduce' : 'no-preference' });

/**
 * Emulates forced colors (`forced-colors: active`, a high contrast theme of the system), as Chromium renders them: the
 * colors of the page replaced with the system colors. Or not.
 */
export const setForcedColors = (active: boolean) => commands.emulateMedia({ forcedColors: active ? 'active' : 'none' });

/** The text of the elements an `aria-labelledby` or `aria-describedby` references, as their accessible name or description. */
export const textOfIds = (ids: string | null) =>
  (ids ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(id => document.getElementById(id)?.textContent.trim())
    .join(' ');
