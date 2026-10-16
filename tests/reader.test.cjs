const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');

// Test the actual pure TS modules using the project's TypeScript compiler, with no test framework dependency.
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};

const { PAGE_IDS } = require('../src/content/types.ts');
const { booklets } = require('../src/content/index.ts');
const { adjacentPage, createSwipeTracker, gestureDirection, swipeStep } = require('../src/reader/navigation.ts');
const { createPreferenceStore, DEFAULT_PREFERENCES, parsePreferences, STORAGE_KEY } = require('../src/reader/preferences.ts');

test('both bundled editions have the same 16 unique, ordered stable IDs', () => {
  for (const pages of Object.values(booklets)) {
    assert.deepEqual(pages.map(page => page.id), [...PAGE_IDS]);
    assert.equal(new Set(pages.map(page => page.id)).size, 16);
    assert.deepEqual(pages.slice(1, 15).map(page => page.station), Array.from({ length: 14 }, (_, i) => i + 1));
    assert.ok(pages.every(page => page.sections.length > 0 && page.title.length > 0));
  }
  assert.equal(booklets.en[1].title, 'The Last Supper');
  assert.equal(booklets.en[14].title, 'Jesus Rises from the Dead');
});

test('unverified passages and Filipino station titles remain explicit placeholders', () => {
  for (const pages of Object.values(booklets)) {
    for (const page of pages) {
      if (page.illustration) assert.equal(page.illustration.status, 'placeholder');
      for (const section of page.sections) {
        const passages = section.kind === 'responses' ? section.turns.map(turn => turn.text)
          : section.kind === 'scripture' ? [section.reference, section.reading] : [section.text];
        assert.ok(passages.every(text => text.status === 'placeholder'));
      }
    }
  }
  booklets.fil.slice(1, 15).forEach((page, i) => {
    assert.equal(page.titleStatus, 'placeholder');
    assert.notEqual(page.title, booklets.en[i + 1].title);
  });
});

test('navigation reaches every page and clamps at booklet boundaries', () => {
  let page = 'opening';
  for (const expected of PAGE_IDS.slice(1)) {
    page = adjacentPage(page, 1);
    assert.equal(page, expected);
  }
  assert.equal(adjacentPage(page, 1), 'closing');
  assert.equal(adjacentPage('opening', -1), 'opening');
  assert.equal(adjacentPage('station-1', -1), 'opening');
});

test('short, vertical and diagonal gestures do not navigate', () => {
  assert.equal(gestureDirection(8, 30), 'vertical');
  assert.equal(gestureDirection(30, 8), 'horizontal');
  assert.equal(gestureDirection(4, 4), null);
  assert.equal(swipeStep(40, 2), 0);
  assert.equal(swipeStep(70, 50), 0);
  assert.equal(swipeStep(10, 140), 0);
  assert.equal(swipeStep(-80, 10), 1);
  assert.equal(swipeStep(80, 10), -1);
});

test('preferences survive valid round trips, validating each field independently', () => {
  const saved = { pageId: 'station-9', language: 'fil', fontSize: 28 };
  assert.deepEqual(parsePreferences(JSON.stringify(saved)), saved);
  for (const invalid of [null, '', '{', 'null', 'false', '[]', '42']) {
    assert.deepEqual(parsePreferences(invalid), DEFAULT_PREFERENCES);
  }
  assert.deepEqual(parsePreferences(JSON.stringify({ pageId: 'station-99', language: 'fr', fontSize: 100 })), DEFAULT_PREFERENCES);
  assert.deepEqual(parsePreferences(JSON.stringify({ pageId: 'station-4', language: 'fil', fontSize: '28' })), {
    pageId: 'station-4', language: 'fil', fontSize: 21,
  });
});

test('a vertical drag stays locked, cancelled and multi-touch swipes never turn pages', () => {
  const swipe = createSwipeTracker();
  swipe.start(1);
  assert.equal(swipe.move(4, 25, 1), false);
  assert.equal(swipe.move(-150, 30, 1), false);
  assert.equal(swipe.finish(-150, 30), 0);
  swipe.start(1);
  assert.equal(swipe.move(-70, 5, 1), true);
  swipe.addTouch(2);
  assert.equal(swipe.finish(-100, 5), 0);
  swipe.start(1);
  swipe.move(-70, 5, 1);
  swipe.cancel();
  assert.equal(swipe.finish(-100, 5), 0);
  swipe.start(1);
  swipe.move(-70, 5, 1);
  assert.equal(swipe.finish(-100, 5), 1);
});

test('loading saved preferences does not overwrite storage', async () => {
  let writes = 0;
  const saved = { pageId: 'closing', language: 'fil', fontSize: 24 };
  const store = createPreferenceStore({
    async getItem(key) { assert.equal(key, STORAGE_KEY); return JSON.stringify(saved); },
    async setItem() { writes++; },
  });
  assert.deepEqual(await store.load(), saved);
  assert.equal(writes, 0);
});

test('rapid writes wait in order and recover after a storage error', async () => {
  let release;
  let calls = 0;
  const values = [];
  const store = createPreferenceStore({
    async getItem() { throw new Error('unavailable'); },
    async setItem(key, value) {
      assert.equal(key, STORAGE_KEY);
      calls++;
      if (calls === 1) {
        await new Promise(resolve => { release = resolve; });
        throw new Error('disk full');
      }
      values.push(JSON.parse(value));
    },
  });
  await assert.rejects(store.load(), /unavailable/);
  const first = store.save(DEFAULT_PREFERENCES);
  const failedWrite = assert.rejects(first, /disk full/);
  const last = { pageId: 'station-7', language: 'fil', fontSize: 28 };
  const second = store.save(last);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 1);
  release();
  await failedWrite;
  await second;
  assert.deepEqual(values, [last]);
});
