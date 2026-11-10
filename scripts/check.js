import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Only project sources; the vendored engine stays unchanged.
const files = ['game.js'];
for (const dir of ['src', 'scripts', 'tests']) {
  for (const file of await readdir(dir, { recursive: true })) {
    if (file.endsWith('.js')) files.push(path.join(dir, file));
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${file}\n${result.stderr}`);
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    await readFile(path.resolve(path.dirname(file), match[1]));
  }
}
console.log(`Syntax and local imports checked: ${files.length} files`);
