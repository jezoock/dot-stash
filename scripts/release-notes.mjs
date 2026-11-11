// Prints the notes of a release: the section of CHANGELOG.md for the version of package.json (npm run release:notes),
// which the release workflow (.github/workflows/release.yml) gives to the GitHub release:
//
//   node scripts/release-notes.mjs [--tag <tag>]
//
//   --tag  the git tag of the release: exits with code 1 unless it is v<version> (v0.1.0 for the version 0.1.0), so a
//          release is never made from a tag that does not match the version of the package.
//
// The section is the text between its heading, `## [<version>]` (with ` - <date>` after it or not), and the next heading
// of that level. Its relative links (`README.md#install`, `docs/backlog.md`, `#removed`) are made absolute, to the files
// of the repository at the tag (`https://github.com/<owner>/<repo>/blob/<tag>/…`): a release page would resolve them
// against its own address. The script exits with code 1 when the changelog has no section for the version, or an empty
// one: CI runs it, so a version is never bumped without its changelog.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = fileURLToPath(new URL('..', import.meta.url));

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The tag of a version: `v0.1.0`. */
export const tagOf = version => `v${version}`;

/** The address of the repository on GitHub, from the `repository` of package.json: `https://github.com/<owner>/<repo>`. */
export const repositoryUrl = pkg => {
  const url = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
  const match = /github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?\/?$/.exec(url ?? '');
  if (!match) {
    throw new Error(`package.json: the repository is not on GitHub (${url ?? 'no repository'})`);
  }
  return `https://github.com/${match[1]}`;
};

/**
 * The section of a changelog for a version, without its heading, trimmed; its relative links made absolute against
 * `base` (the address of the files of the repository at the tag, ending with a slash), when given. Throws when the
 * changelog has no section for the version, or an empty one.
 */
export const releaseNotes = (changelog, version, base) => {
  const lines = changelog.split(/\r?\n/);
  const heading = new RegExp(`^## \\[${escapeRegExp(version)}\\](?:\\s|$)`);
  const start = lines.findIndex(line => heading.test(line));
  if (start === -1) {
    throw new Error(`CHANGELOG.md has no section for the version ${version} (a heading "## [${version}] - <date>")`);
  }
  // The next section, or the link definitions at the end of the file (`[0.1.0]: https://…`).
  const end = lines.findIndex((line, index) => index > start && (/^## /.test(line) || /^\[[^\]]+\]: /.test(line)));
  const notes = lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim();
  if (!notes) {
    throw new Error(`The section of the version ${version} of CHANGELOG.md is empty`);
  }
  if (!base) {
    return notes;
  }
  // [text](target): a target without a scheme (https:, mailto:) is a path of the repository, or an anchor of the changelog.
  return notes.replace(/\]\(([^)\s]+)\)/g, (link, target) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
      return link;
    }
    return `](${base}${target.startsWith('#') ? `CHANGELOG.md${target}` : target.replace(/^\.\//, '')})`;
  });
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  let flags;
  try {
    ({ values: flags } = parseArgs({ options: { tag: { type: 'string' } } }));
  } catch (error) {
    console.error(`${error.message}\nUsage: node scripts/release-notes.mjs [--tag <tag>]`);
    process.exit(2);
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const tag = tagOf(pkg.version);
    if (flags.tag !== undefined && flags.tag !== tag) {
      throw new Error(`the tag ${flags.tag} does not match the version of package.json, ${pkg.version}: tag ${tag}, or change the version`);
    }
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    console.log(releaseNotes(changelog, pkg.version, `${repositoryUrl(pkg)}/blob/${tag}/`));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
