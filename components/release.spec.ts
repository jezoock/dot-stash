import { describe, expect, it } from 'vitest';
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

// The release: the notes the release workflow (.github/workflows/release.yml) gives to the GitHub release, from the
// changelog (scripts/release-notes.mjs), and the workflow itself. The archive, installed by its address in a new project,
// is checked by scripts/check-package.mjs, on the build (CI, and the release workflow).

const root = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const CHANGELOG = `# Changelog

## [Unreleased]

### Added

- Something new.

## [1.2.0] - 2026-12-01

The notes of 1.2.0, see the [README](README.md#install), [Removed](#removed) and [the site](https://example.com/page).

### Removed

- Something old, in [docs/backlog.md](./docs/backlog.md).

## [1.1.0] - 2026-11-20

## [1.0.0] - 2026-11-10

The last section.

[Unreleased]: https://github.com/owner/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/owner/repo/releases/tag/v1.2.0
`;

describe('release notes (scripts/release-notes.mjs)', () => {
  it('are the section of the version, without its heading', async () => {
    const { releaseNotes } = await import('../scripts/release-notes.mjs');

    expect(releaseNotes(CHANGELOG, '1.2.0')).toBe(
      'The notes of 1.2.0, see the [README](README.md#install), [Removed](#removed) and [the site](https://example.com/page).\n\n### Removed\n\n- Something old, in [docs/backlog.md](./docs/backlog.md).',
    );
    // The last section ends before the link definitions.
    expect(releaseNotes(CHANGELOG, '1.0.0')).toBe('The last section.');
    expect(releaseNotes(CHANGELOG, 'Unreleased')).toBe('### Added\n\n- Something new.');
  });

  it('make the relative links absolute, to the files of the repository at the tag', async () => {
    const { releaseNotes } = await import('../scripts/release-notes.mjs');
    const notes = releaseNotes(CHANGELOG, '1.2.0', 'https://github.com/owner/repo/blob/v1.2.0/');

    expect(notes).toContain('[README](https://github.com/owner/repo/blob/v1.2.0/README.md#install)');
    expect(notes).toContain('[Removed](https://github.com/owner/repo/blob/v1.2.0/CHANGELOG.md#removed)');
    expect(notes).toContain('[docs/backlog.md](https://github.com/owner/repo/blob/v1.2.0/docs/backlog.md)');
    expect(notes).toContain('[the site](https://example.com/page)');
  });

  it('fail without a section for the version, or with an empty one', async () => {
    const { releaseNotes } = await import('../scripts/release-notes.mjs');

    expect(() => releaseNotes(CHANGELOG, '2.0.0')).toThrow('CHANGELOG.md has no section for the version 2.0.0');
    // 1.2.0 is not 1.2.0-beta.1, nor 1.2 a prefix of 1.2.0.
    expect(() => releaseNotes(CHANGELOG, '1.2.0-beta.1')).toThrow('no section');
    expect(() => releaseNotes(CHANGELOG, '1.2')).toThrow('no section');
    expect(() => releaseNotes(CHANGELOG, '1.1.0')).toThrow('The section of the version 1.1.0 of CHANGELOG.md is empty');
  });

  it('name the tag v<version> and the repository of package.json', async () => {
    const { repositoryUrl, tagOf } = await import('../scripts/release-notes.mjs');

    expect(tagOf('0.1.0')).toBe('v0.1.0');
    expect(repositoryUrl(pkg)).toBe('https://github.com/jezoock/dot-stash');
    expect(repositoryUrl({ repository: 'git+ssh://git@github.com/owner/repo.git' })).toBe('https://github.com/owner/repo');
    expect(() => repositoryUrl({})).toThrow('not on GitHub');
  });

  it('exist for the version of package.json, and the script refuses another tag', () => {
    const script = join(root, 'scripts/release-notes.mjs');
    const notes = execFileSync(process.execPath, [script, '--tag', `v${pkg.version}`], { cwd: root, encoding: 'utf8' });

    expect(notes.trim()).not.toBe('');
    expect(notes).not.toMatch(/\]\((?![a-z]+:)/);
    expect(() => execFileSync(process.execPath, [script, '--tag', 'v0.0.0-not-the-version'], { cwd: root, stdio: 'pipe' })).toThrow(/does not match the version/);
  });
});

describe('release workflow (.github/workflows/release.yml)', () => {
  const workflow = readFileSync(join(root, '.github/workflows/release.yml'), 'utf8');

  it('runs on the tags v* and on a published release, with the write access to the contents only', () => {
    expect(workflow).toMatch(/^ {2}push:\n {4}tags: \['v\*'\]$/m);
    expect(workflow).toMatch(/^ {2}release:\n {4}types: \[published\]$/m);
    expect(workflow).toMatch(/^permissions:\n {2}contents: write\n\n/m);
    expect(workflow.match(/permissions:/g)).toHaveLength(1);
  });

  it('checks the tag, tests, checks the archive installed by its address and attaches it to the release', () => {
    const steps = [
      'run: node scripts/release-notes.mjs --tag',
      'run: npm run build:all',
      'run: npm test',
      '$(npm pack',
      'run: node scripts/check-package.mjs',
      'gh release create',
    ];
    const positions = steps.map(step => workflow.indexOf(step));

    expect(positions.every(position => position !== -1)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    // The tag reaches the shell through an environment variable, never as an expression in a script: the expressions are
    // only whole values (`TAG: ${{ github.ref_name }}`).
    const expressions = workflow.split('\n').filter(line => line.includes('${{'));
    expect(expressions.filter(line => !/^\s+[\w-]+: [\w-]*\$\{\{ [\w.]+ \}\}$/.test(line))).toEqual([]);
  });
});
