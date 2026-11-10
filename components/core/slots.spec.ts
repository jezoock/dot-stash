import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { dirname, join, relative } from 'path';

// The slots of each component, documented with JSDoc @slot tags, which Stencil lists in the Slots section of the readme it
// generates (`npm run build`), the light-DOM components included: every slot a component renders, every slot marker its
// code reads (`slot="hint"`), and the content a component expects without rendering a slot.

const CORE = __dirname;

/** The component sources of components/core/, but the tests. */
const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return entry.name.endsWith('.tsx') && !entry.name.endsWith('.spec.tsx') ? [path] : [];
  });

/** The components that expect content of the page without rendering a `<slot>`: they enhance it in place. */
const CONTENT_WITHOUT_SLOT = ['ds-ajax', 'ds-breadcrumb', 'ds-field'];

/** The default slot is `''`. */
const unique = (names: string[]) => [...new Set(names)].sort();

const components = sources(CORE)
  .map(path => {
    const source = readFileSync(path, 'utf8');
    const tag = source.match(/tag: '([\w-]+)'/)?.[1];
    // The code, without its comments: the slots it renders and the markers it reads.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const rendered = [...code.matchAll(/<slot(?:\s+name="([\w-]+)")?\s*\/?>/g)].map(match => match[1] ?? '');
    const markers = [
      ...code.matchAll(/\[slot=['"]([\w-]+)['"]\]/g),
      ...code.matchAll(/getAttribute\('slot'\) === '([\w-]+)'/g),
      ...code.matchAll(/this\.slotted\('([\w-]+)'\)/g),
    ].map(match => match[1]);
    const documented = [...source.matchAll(/@slot\s+(?:([\w-]+)\s+)?-\s/g)].map(match => match[1] ?? '');
    return { path: relative(CORE, path), tag, rendered: unique(rendered), markers: unique(markers), documented: unique(documented), readme: join(dirname(path), 'readme.md') };
  })
  .filter(component => component.tag);

/** The slots the Slots section of a generated readme lists: `''` for the default slot. */
const readmeSlots = (readme: string): string[] => {
  const section =
    readFileSync(readme, 'utf8')
      .split('\n## Slots\n')[1]
      ?.split(/\n## |\n-{10,}/)[0] ?? '';
  return unique(
    section
      .split('\n')
      .filter(line => line.startsWith('|') && !/^\| (Slot|-)/.test(line))
      .map(line =>
        line
          .split('|')[1]
          .trim()
          .replace(/^`"(.*)"`$/, '$1'),
      ),
  );
};

describe('slots of the components', () => {
  it('finds the components', () => {
    expect(components.length).toBeGreaterThanOrEqual(30);
    expect(components.map(({ tag }) => tag)).toEqual(expect.arrayContaining(CONTENT_WITHOUT_SLOT));
  });

  it.each(components.map(component => [component.tag, component] as const))('%s documents every slot it renders or reads with @slot', (_, component) => {
    const needed = unique([...component.rendered, ...component.markers, ...(CONTENT_WITHOUT_SLOT.includes(component.tag) ? [''] : [])]);

    expect(needed.filter(name => !component.documented.includes(name))).toEqual([]);
    // No @slot for a slot the component neither renders nor reads (but the content it enhances in place).
    expect(component.documented.filter(name => !needed.includes(name))).toEqual([]);
  });

  it.each(components.map(component => [component.tag, component] as const))('the generated readme of %s lists its slots', (_, component) => {
    expect(readmeSlots(component.readme)).toEqual(component.documented);
  });
});
