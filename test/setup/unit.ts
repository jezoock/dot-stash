import { beforeEach } from 'vitest';
import { BUILD } from '@stencil/core/internal/app-data';
import { MockWindow } from '@stencil/core/mock-doc';
// The DOM matchers of @stencil/vitest: toHaveClass(), toHaveClasses(), toHaveAttribute(), toEqualAttribute(),
// toEqualAttributes()… (those of Stencil's spec tests).
import '@stencil/vitest';
import { resetPage } from '../helpers/page';

// The build flags of the runtime, as in Stencil's spec pages: the development mode (and its warnings, which some tests
// check there are none of), the form-associated components (as the build of the components has them), and no CSS
// annotations, so no `hydrated` class on the components once they have loaded (the tests compare their class lists with
// those they render).
Object.assign(BUILD, { isDev: true, formAssociated: true, cssAnnotations: false });

// Stencil names the event of a JSX listener after the `on…` property of the window, as a browser has them: `onKeyDown`
// listens to `keydown` because the window has `onkeydown`, else to `keyDown`. The window of the environment is the global
// object, which has the properties of the simulated window but those: they are added (null, as in a browser).
for (let prototype = MockWindow.prototype; prototype; prototype = Object.getPrototypeOf(prototype)) {
  for (const name of Object.getOwnPropertyNames(prototype)) {
    if (name.startsWith('on') && !(name in globalThis)) Object.assign(globalThis, { [name]: null });
  }
}

// The events of the document bubble to its window, `document.defaultView`: the global object. Its listener methods are
// those of the simulated window, bound to it: they keep the listeners on the global object instead, where the events go.
for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent'] as const) {
  const method = MockWindow.prototype[name] as (...args: unknown[]) => unknown;
  Object.assign(globalThis, { [name]: (...args: unknown[]) => method.apply(globalThis, args) });
}

// Each test starts on a fresh page, as with a new browser page (the spies and the stubbed globals of a test are restored
// before the next one: `restoreMocks` and `unstubGlobals` in vitest.config.mts).
beforeEach(() => resetPage());
