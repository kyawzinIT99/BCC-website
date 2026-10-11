import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = await readFile(new URL('../app/lib/hostinger-runtime.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('"mysql2/promise"', JSON.stringify(pathToFileURL(require.resolve('mysql2/promise')).href));
const { dbValue } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('MySQL adapter preserves bound text, identifiers, flags, nulls and binary uploads', () => {
  for (const value of ['committee history', 42, 42n, true, false, null, new Date('2026-10-11T00:00:00Z'), Buffer.from('%PDF-'), new Uint8Array([0, 255])]) {
    assert.equal(dbValue(value), value);
  }
  assert.deepEqual(dbValue(new Uint8Array([1, 2]).buffer), new Uint8Array([1, 2]));
});

test('MySQL adapter retains ISO timestamp conversion and rejects unsupported bindings', () => {
  assert.equal(dbValue('2026-10-11T05:06:07.123Z'), '2026-10-11 05:06:07.123');
  assert.equal(dbValue('2026-10-11T05:06:07Z'), '2026-10-11 05:06:07');
  for (const value of [undefined, {}, [], () => 1]) assert.throws(() => dbValue(value), TypeError);
});
