import { defineVitestConfig } from '@stencil/vitest/config';
import { stencilVitestPlugin } from '@stencil/vitest/plugin';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import type { BrowserCommand } from 'vitest/node';

/** Emulates media features of the page (test/helpers/browser.ts: setReducedMotion(), setForcedColors()). */
const emulateMedia: BrowserCommand<[Parameters<import('playwright').Page['emulateMedia']>[0]]> = async ({ page }, options) => {
  await page.emulateMedia(options);
};

/** Compiles SCSS with the engine on the load path (test/helpers/browser.ts: commands.compileScss()), for a stylesheet of a test. */
const compileScss: BrowserCommand<[source: string]> = (_context, source) =>
  sass.compileString(source, { loadPaths: [fileURLToPath(new URL('./scss', import.meta.url))], style: 'expanded' }).css;

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    // The tests import describe, it, expect… from vitest.
    globals: false,
    projects: [
      {
        // Unit tests: the components and the utilities in Stencil's simulated DOM (mock-doc), without a browser. The
        // plugin compiles the components from their sources, as the test files import them (no build needed).
        plugins: [stencilVitestPlugin()],
        test: {
          name: 'unit',
          include: ['components/**/*.spec.{ts,tsx}'],
          exclude: ['components/sass.spec.ts'],
          environment: 'stencil',
          setupFiles: ['./test/setup/unit.ts'],
          // Before each test: the spies (vi.spyOn) get their original back, and the globals of vi.stubGlobal() too.
          restoreMocks: true,
          unstubGlobals: true,
        },
      },
      {
        // Browser tests: the build of the components and of the theme (npm run build:all) in Chromium, driven by Playwright,
        // with a real keyboard, focus, layout, viewport, forms and transitions. CHROMIUM_PATH: a Chromium of the machine,
        // instead of the one `npx playwright install chromium` downloads for the version of Playwright of the project.
        test: {
          name: 'browser',
          include: ['components/**/*.browser.ts'],
          setupFiles: ['./test/setup/browser.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined }, actionTimeout: 5000 }),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1280, height: 800 },
            commands: { emulateMedia, compileScss },
            // No screenshot files in the repository: the error and the DOM say what failed.
            screenshotFailures: false,
          },
        },
      },
      {
        // The stylesheets, compiled with the Sass JavaScript API, in Node.
        test: {
          name: 'styles',
          include: ['components/sass.spec.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
