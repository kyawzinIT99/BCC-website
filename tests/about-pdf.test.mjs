import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../app/lib/bcc-profile.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { defaultAboutProfile, normalizeAboutProfile, validWelcomePdfUrl } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('existing stored About content gains the guide without replacing committee or history', () => {
  const legacy = { ...defaultAboutProfile, historyTitle: 'Saved story', committee: defaultAboutProfile.committee.map((member, index) => ({ ...member, name: `Saved member ${index}` })) };
  delete legacy.welcomePdfUrl;
  const result = normalizeAboutProfile(legacy);
  assert.equal(result.welcomePdfUrl, '/documents/bcc-welcome-guide-2026.pdf');
  assert.equal(result.historyTitle, 'Saved story');
  assert.deepEqual(result.committee, legacy.committee);
});

test('uploaded and replacement PDF links survive serialization; clearing hides the attachment', () => {
  for (const url of ['/api/media?id=24', 'https://bccwac.com/documents/new-guide.pdf', '']) {
    const saved = JSON.parse(JSON.stringify(normalizeAboutProfile({ ...defaultAboutProfile, welcomePdfUrl: url })));
    assert.equal(normalizeAboutProfile(saved).welcomePdfUrl, url);
  }
});

test('unsafe document URLs are rejected and never rendered from stored content', () => {
  for (const url of ['javascript:alert(1)', '//other.example/file.pdf', '/\\other.example/file.pdf', 'https://user:pass@example.com/file.pdf', 'http://example.com/file.pdf', '/bad\npath', 'a'.repeat(501)]) {
    assert.equal(validWelcomePdfUrl(url), false, url);
    assert.equal(normalizeAboutProfile({ ...defaultAboutProfile, welcomePdfUrl: url }).welcomePdfUrl, '');
  }
});
