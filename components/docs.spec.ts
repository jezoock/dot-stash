import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { basename, dirname, join } from 'path';

// The repository paths that the README, the changelog and the notes of docs/ name (`scss/…`, `components/…`, `scripts/…`, `test/…`,
// `docs/…`) and their relative links exist: a file moved or removed leaves no stale path in them.

const root = join(__dirname, '..');

/** The paths that the archive notes and the changelog name as removed, archived or replaced, on purpose. */
const FORMER_PATHS = ['components/core/button/button.tsx', 'components/demo', 'scss/themes/legacy/', 'scss/variables', 'scss/tools'];

const documents = [
  'README.md',
  'CHANGELOG.md',
  ...readdirSync(join(root, 'docs'))
    .filter(name => name.endsWith('.md'))
    .map(name => `docs/${name}`),
];

/** A path exists as a file or a folder, or as a Sass module (`scss/engine/tools/references`: `_references.scss`). */
const exists = (path: string) => {
  const file = join(root, path.replace(/\/$/, ''));
  return existsSync(file) || existsSync(join(dirname(file), `_${basename(file)}.scss`)) || existsSync(`${file}.scss`);
};

describe('paths named by the documentation', () => {
  it.each(documents)('the repository paths %s names exist', document => {
    const text = readFileSync(join(root, document), 'utf8');
    const paths = [...text.matchAll(/`((?:scss|components|scripts|test|docs)\/[^`\s]*)`/g)]
      .map(([, path]) => path)
      // Patterns (`<theme>`, `*.spec.ts`, `{page}`, `…`), not paths.
      .filter(path => !/[<>*{}…]/.test(path) && !FORMER_PATHS.includes(path));

    expect(paths.filter(path => !exists(path))).toEqual([]);
  });

  it.each(documents)('the relative links of %s lead to a file', document => {
    const text = readFileSync(join(root, document), 'utf8');
    const links = [...text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)].map(([, link]) => link).filter(link => !/^[a-z]+:/.test(link));

    expect(links.filter(link => !existsSync(join(root, dirname(document), link)))).toEqual([]);
  });
});
