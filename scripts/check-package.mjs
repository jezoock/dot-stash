// Checks the package as a project installs it from the address of its archive (npm run check:package), as the archive
// attached to a GitHub release (.github/workflows/release.yml) is installed:
//
//   node scripts/check-package.mjs [<archive>]
//
//   <archive>  the archive of npm pack to check (dot-stash-<version>.tgz). Without it, the script packs the package
//              (npm pack, in a temporary folder): run npm run build:all first, the package is the build.
//
// The script serves the archive over HTTP on 127.0.0.1, installs it by its address in a new, empty project
// (`npm install http://127.0.0.1:<port>/dot-stash-<version>.tgz`), then checks in that project what the README promises
// (Using the components): the entry points `dot-stash` and `dot-stash/loader` as ES modules and CommonJS, the theme
// stylesheet and the licence texts of its icons, and the types, compiled by the TypeScript of the repository with the
// module resolution `bundler` (the typings of the elements included). The package has no dependency: nothing is fetched
// from a registry. The temporary folders are deleted at the end. Exits with code 1 when a check fails. CI runs it.

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = fileURLToPath(new URL('..', import.meta.url));
const run = promisify(execFile);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/** Runs npm in a folder; its output, or an error with it. */
const runNpm = async (args, cwd) => {
  try {
    // The address is local: no proxy of the machine between npm and the server.
    const env = { ...process.env, NO_PROXY: '127.0.0.1', no_proxy: '127.0.0.1' };
    return (await run(npm, args, { cwd, env, shell: process.platform === 'win32', maxBuffer: 16 * 1024 * 1024 })).stdout;
  } catch (error) {
    throw new Error(`npm ${args.join(' ')} failed:\n${error.stderr || error.stdout || error.message}`, { cause: error });
  }
};

/** Serves one file over HTTP on 127.0.0.1 (a free port); resolves with its address and a function that stops the server. */
const serve = file =>
  new Promise((resolve, reject) => {
    const name = `/${path.basename(file)}`;
    const server = http.createServer((request, response) => {
      if (request.url !== name) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, { 'content-type': 'application/gzip', 'content-length': fs.statSync(file).size });
      fs.createReadStream(file).pipe(response);
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}${name}`, close: () => new Promise(done => server.close(done)) });
    });
  });

/** The checks of the installed package, run by Node in the project: the entry points, the stylesheets. */
const ENTRY_POINTS_CHECK = `
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const failures = [];
const check = (condition, message) => condition || failures.push(message);

const utilities = await import('dot-stash');
check(typeof utilities.ds === 'object' && typeof utilities.tokens?.getToken === 'function', 'import of dot-stash: no ds, tokens');
const loader = await import('dot-stash/loader');
check(typeof loader.defineCustomElements === 'function', 'import of dot-stash/loader: no defineCustomElements');
check(typeof require('dot-stash').tokens?.getToken === 'function', 'require of dot-stash: no tokens');
check(typeof require('dot-stash/loader').defineCustomElements === 'function', 'require of dot-stash/loader: no defineCustomElements');
for (const file of ['dot-stash/dist/css/default.css', 'dot-stash/dist/css/LICENSE-icons.txt', 'dot-stash/dist/dot-stash/dot-stash.esm.js']) {
  const resolved = fileURLToPath(import.meta.resolve(file));
  check(fs.existsSync(resolved) && fs.statSync(resolved).size > 0, file + ': missing or empty');
}
if (failures.length) {
  console.error(failures.join('\\n'));
  process.exit(1);
}
`;

/** A module of the project that uses the types of the package (tsc --noEmit fails on a missing or wrong type). */
const TYPES_CHECK = `
import { defineCustomElements } from 'dot-stash/loader';
import { tokens, type JSX } from 'dot-stash';

defineCustomElements();
const color: string | undefined = tokens.getToken('color-primary-base');
const alert: HTMLDsAlertElement | null = document.querySelector('ds-alert');
const props: JSX.DsAlert = {};
export { alert, color, props };
`;

const TSCONFIG = {
  compilerOptions: {
    target: 'es2022',
    module: 'esnext',
    moduleResolution: 'bundler',
    lib: ['es2022', 'dom', 'dom.iterable'],
    strict: true,
    noEmit: true,
    types: [],
  },
  files: ['index.ts'],
};

/** Packs the package into a folder; the path of the archive. */
const pack = async destination => {
  const [{ filename }] = JSON.parse(await runNpm(['pack', '--json', '--pack-destination', destination], root));
  return path.join(destination, filename);
};

/** Checks an archive of npm pack, installed by its address in a new project; throws with what failed. */
export const checkPackage = async archive => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dot-stash-package-'));
  let server;
  try {
    const file = archive ? path.resolve(archive) : await pack(temp);
    if (!fs.existsSync(file)) {
      throw new Error(`${file}: no such archive`);
    }
    const project = path.join(temp, 'project');
    fs.mkdirSync(project);
    fs.writeFileSync(path.join(project, 'package.json'), `${JSON.stringify({ name: 'dot-stash-package-check', private: true, type: 'module' }, null, 2)}\n`);

    server = await serve(file);
    console.log(`npm install ${server.url}`);
    await runNpm(['install', '--no-audit', '--no-fund', '--ignore-scripts', server.url], project);
    const dependency = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8')).dependencies?.['dot-stash'];
    if (dependency !== server.url) {
      throw new Error(`the project does not depend on dot-stash by the address of the archive (dependencies: ${dependency})`);
    }

    fs.writeFileSync(path.join(project, 'check.mjs'), ENTRY_POINTS_CHECK);
    try {
      await run(process.execPath, ['check.mjs'], { cwd: project });
    } catch (error) {
      throw new Error(`the entry points of the installed package:\n${error.stderr || error.message}`, { cause: error });
    }
    console.log('Entry points (import, require) and stylesheets: ok');

    fs.writeFileSync(path.join(project, 'index.ts'), TYPES_CHECK);
    fs.writeFileSync(path.join(project, 'tsconfig.json'), JSON.stringify(TSCONFIG));
    try {
      await run(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', project], { cwd: project });
    } catch (error) {
      throw new Error(`the types of the installed package:\n${error.stdout || error.stderr || error.message}`, { cause: error });
    }
    console.log('Types (moduleResolution bundler): ok');
    return file;
  } finally {
    await server?.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => arg.startsWith('-'))) {
    console.error('Usage: node scripts/check-package.mjs [<archive>]');
    process.exit(2);
  }
  try {
    const file = await checkPackage(args[0]);
    console.log(`${path.basename(file)} installs by its address.`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
