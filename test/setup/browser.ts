import { afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { DEFAULT_VIEWPORT, setForcedColors, setReducedMotion } from '../helpers/browser';

// The browser tests run the components as they are published: the browser build of the package (dist/dot-stash/) and
// the default theme (dist/css/default.css), both made by `npm run build:all`, loaded once per test file.
const BUILD_MISSING = 'run `npm run build:all` first: the browser tests load the build of the components and of the theme';

await new Promise((resolve, reject) => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/dist/css/default.css';
  stylesheet.onload = resolve;
  stylesheet.onerror = () => reject(new Error(`dist/css/default.css did not load: ${BUILD_MISSING}`));
  document.head.appendChild(stylesheet);
});

// A variable, so that the type check does not look for the file (the stylesheet above tells when the build is missing).
const loader = '/dist/dot-stash/dot-stash.esm.js';
await import(/* @vite-ignore */ loader);

// Each test starts on an empty page, at the default size, without the media features a test emulated, and with the
// pointer in the bottom right corner (the page keeps it where the last test left it: over an element, it would be :hover).
afterEach(async () => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute('dir');
  await setReducedMotion(false);
  await setForcedColors(false);
  await page.viewport(DEFAULT_VIEWPORT.width, DEFAULT_VIEWPORT.height);
  const corner = document.createElement('div');
  corner.style.cssText = 'position: fixed; right: 0; bottom: 0; z-index: 2147483647; width: 2px; height: 2px';
  document.body.append(corner);
  await userEvent.hover(corner, { force: true });
  corner.remove();
});
