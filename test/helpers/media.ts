import { vi } from 'vitest';

/** A `change` listener of a media query list. */
type ChangeListener = (event: { matches: boolean; media: string }) => void;

/** A media query list of the fake matchMedia: its query, its change listeners, and its state when it last notified them. */
export interface FakeMediaQueryList {
  media: string;
  readonly matches: boolean;
  listeners: Set<ChangeListener>;
  notified: boolean;
  addEventListener: (type: string, listener: ChangeListener) => void;
  removeEventListener: (type: string, listener: ChangeListener) => void;
}

/**
 * The simulated DOM has no viewport: its matchMedia() never matches. This gives the window a matchMedia that evaluates
 * the width queries of utils/responsive (`(min-width: …px)`, `(width < …px)`, `all`, joined by `and`) at a width, and
 * that dispatches `change`, as a browser does, on each list whose state changes when the width does (every list is up
 * to date when the first listener runs). An other query throws. The window gets back its own after the test.
 */
export const fakeMatchMedia = (initialWidth = 1000) => {
  let width = initialWidth;
  const lists: FakeMediaQueryList[] = [];
  const evaluate = (query: string): boolean =>
    query.split(' and ').every(part => {
      const min = /^\(min-width: ([\d.]+)px\)$/.exec(part);
      const max = /^\(width < ([\d.]+)px\)$/.exec(part);
      if (min) return width >= Number(min[1]);
      if (max) return width < Number(max[1]);
      if (part === 'all') return true;
      throw new Error(`unexpected media query: ${query}`);
    });

  const matchMedia = vi.fn((query: string) => {
    const list: FakeMediaQueryList = {
      media: query,
      get matches() {
        return evaluate(query);
      },
      listeners: new Set(),
      notified: evaluate(query),
      addEventListener: (type, listener) => type === 'change' && list.listeners.add(listener),
      removeEventListener: (type, listener) => type === 'change' && list.listeners.delete(listener),
    };
    lists.push(list);
    return list as unknown as MediaQueryList;
  });
  vi.stubGlobal('matchMedia', matchMedia);

  return {
    matchMedia,
    lists,
    /** The media queries of the lists that have a change listener. */
    watched: () => lists.filter(list => list.listeners.size).map(list => list.media),
    /** The media queries of the change listeners, one entry per listener. */
    listened: () => lists.flatMap(list => Array.from(list.listeners, () => list.media)),
    /** Resizes the viewport: the lists whose state changes dispatch their change event, at once. */
    resize(newWidth: number) {
      width = newWidth;
      lists.forEach(list => {
        if (list.matches !== list.notified) {
          list.notified = list.matches;
          list.listeners.forEach(listener => listener({ matches: list.matches, media: list.media }));
        }
      });
    },
  };
};
