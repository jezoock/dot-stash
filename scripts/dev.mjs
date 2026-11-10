// npm start: the CSS watcher (scripts/build-css.mjs --watch) and the Stencil dev server (stencil build --dev --watch --serve),
// side by side in one terminal, with their output.
//
// The watcher compiles the themes to dist/css/ first; then Stencil starts, copies dist/css/ to www/css/, which its dev server
// serves (the page: components/index.html), and watches dist/css/ (watchExternalDirs in stencil.config.ts): each stylesheet
// the watcher writes makes a rebuild, which copies it to www/css/, and the dev server reloads the page.
//
// Ctrl+C stops both. When one of them stops on its own, the other is stopped too, and the exit code is the one of the first.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const stencil = fileURLToPath(new URL('../node_modules/@stencil/core/bin/stencil', import.meta.url));

const children = new Set();
let exitCode;

/** Stops the other process(es), then exits once they are all gone. */
const stop = code => {
  exitCode ??= code;
  // SIGINT, as Ctrl+C: Stencil closes its dev server process on SIGINT, not on SIGTERM.
  children.forEach(child => child.kill('SIGINT'));
  if (children.size === 0) {
    process.exit(exitCode);
  }
};

const start = (args, stdio = 'inherit') => {
  const child = spawn(process.execPath, args, { cwd: root, stdio });
  children.add(child);
  child.on('exit', (code, signal) => {
    children.delete(child);
    stop(code ?? (signal === 'SIGINT' || signal === 'SIGTERM' ? 0 : 1));
  });
  return child;
};

// The IPC channel: the watcher sends 'ready' once the first build is written, and exits if this process goes away.
const css = start(['scripts/build-css.mjs', '--watch'], ['inherit', 'inherit', 'inherit', 'ipc']);
css.once('message', () => start([stencil, 'build', '--dev', '--watch', '--serve']));

// Ctrl+C reaches the whole process group: the children stop by themselves, and this process waits for them.
['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => stop(0)));
