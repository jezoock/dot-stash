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

/** A node of the accessibility tree of Chromium, as the browser tests read it (test/helpers/browser.ts: accessibleNode()). */
export interface AccessibleNode {
  role: string;
  name: string;
  description: string;
  /** The states and properties of the node (`invalid`, `required`, `disabled`, `pressed`, `focusable`…): name → value. */
  properties: Record<string, unknown>;
}

/** CDP nodes, as the commands below read them. */
type CdpDomNode = { nodeId: number; frameId?: string; contentDocument?: CdpDomNode; children?: CdpDomNode[] };
type CdpFrameTree = { frame: { id: string; url: string }; childFrames?: CdpFrameTree[] };
type CdpAXValue = { value?: unknown };
type CdpAXNode = { ignored: boolean; role?: CdpAXValue; name?: CdpAXValue; description?: CdpAXValue; properties?: { name: string; value: CdpAXValue }[] };

/**
 * The node of the first element of the page of the tests that matches a selector in the accessibility tree of Chromium
 * (Chrome DevTools Protocol), as assistive technologies get it: its role, name, description and states. `null` when the
 * element is not in the tree (hidden, or ignored).
 */
const accessibleNode: BrowserCommand<[selector: string]> = async ({ page, frame }, selector): Promise<AccessibleNode | null> => {
  const session = await page.context().newCDPSession(page);
  try {
    const url = (await frame()).url();
    const findFrame = (tree: CdpFrameTree): string | undefined => (tree.frame.url === url ? tree.frame.id : tree.childFrames?.map(findFrame).find(Boolean));
    const frameId = findFrame(((await session.send('Page.getFrameTree')) as { frameTree: CdpFrameTree }).frameTree);
    const { root } = (await session.send('DOM.getDocument', { depth: -1, pierce: true })) as { root: CdpDomNode };
    const findDocument = (node: CdpDomNode): CdpDomNode | undefined =>
      node.frameId === frameId && node.contentDocument ? node.contentDocument : [node.contentDocument, ...(node.children ?? [])].filter(Boolean).map(findDocument).find(Boolean);
    const document = findDocument(root);
    if (!frameId || !document) {
      throw new Error('accessibleNode: the document of the tests was not found');
    }
    const { nodeId } = (await session.send('DOM.querySelector', { nodeId: document.nodeId, selector })) as { nodeId: number };
    if (!nodeId) {
      throw new Error(`accessibleNode: no element matches ${selector}`);
    }
    const { nodes } = (await session.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })) as { nodes: CdpAXNode[] };
    const [node] = nodes;
    if (!node || node.ignored) {
      return null;
    }
    return {
      role: String(node.role?.value ?? ''),
      name: String(node.name?.value ?? ''),
      description: String(node.description?.value ?? ''),
      properties: Object.fromEntries((node.properties ?? []).map(({ name, value }) => [name, value.value])),
    };
  } finally {
    await session.detach();
  }
};

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
            commands: { emulateMedia, compileScss, accessibleNode },
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
