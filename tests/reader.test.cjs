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
const { pagePassages, paragraphs } = require('../src/content/format.ts');
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
  assert.equal(booklets.en[14].title, 'Jesus Rises from Death');
  assert.equal(booklets.en.reduce((count, page) => count + page.sections.length, 0), 63);
  assert.equal(booklets.en[6].sections[1].kind, 'reflection');
  assert.equal(booklets.en.at(-1).sections.filter(section => section.kind === 'hymn').length, 3);
});

test('both text editions are permission-confirmed drafts and artwork slots remain empty', () => {
  for (const pages of Object.values(booklets)) {
    for (const page of pages) {
      if (page.illustration) assert.equal(page.illustration.status, 'placeholder');
      for (const section of page.sections) {
        const passages = section.kind === 'responses' ? section.turns.map(turn => turn.text)
          : section.kind === 'scripture' ? [section.reference, section.reading] : [section.text];
        assert.ok(passages.every(text => text.status === 'draft' && text.rights === 'user-confirmed-text-permission'));
      }
    }
  }
  booklets.fil.slice(1, 15).forEach((page, i) => {
    assert.equal(page.titleStatus, 'draft');
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

test('paragraph rendering preserves words, pause markers, single line breaks and empty paragraphs', () => {
  const text = 'First paragraph. * Pause.\n\nVerse line one\nVerse line two\n\n\n\nLast paragraph.';
  assert.equal(paragraphs(text).join('\n\n'), text);
  assert.deepEqual(paragraphs('One\r\n\r\nTwo\r\nThree'), ['One', 'Two\nThree']);
});

test('bundled scripture has references and all text has user-confirmed permission', () => {
  for (const pages of Object.values(booklets)) {
    for (const page of pages) {
      assert.ok(pagePassages(page).every(text => text.status === 'draft' && text.rights === 'user-confirmed-text-permission'));
      if (page.illustration) assert.equal(page.illustration.status, 'placeholder');
      for (const section of page.sections.filter(section => section.kind === 'scripture')) {
        assert.ok(section.reference.text.length > 0);
        assert.ok(section.reading.text.length > 0);
      }
    }
  }
});

test('normal and release resolution use authorized content even with the old draft flag', () => {
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const config = require('../metro.config.js');
  const previous = process.env.BOOKLET_LOCAL_DRAFT;
  const context = {
    dev: true,
    originModulePath: path.join(root, 'src', 'content', 'index.ts'),
    resolveRequest: (_, moduleName) => ({ type: 'sourceFile', filePath: moduleName }),
  };
  try {
    delete process.env.BOOKLET_LOCAL_DRAFT;
    assert.equal(config.resolver.resolveRequest(context, './en', 'android').filePath, './en');
    process.env.BOOKLET_LOCAL_DRAFT = '1';
    assert.equal(config.resolver.resolveRequest(context, './en', 'android').filePath, './en');
    assert.equal(config.resolver.resolveRequest({ ...context, dev: false }, './en', 'android').filePath, './en');
    assert.equal(config.resolver.resolveRequest({ ...context, dev: undefined }, './en', 'android').filePath, './en');
    assert.throws(() => config.resolver.resolveRequest({ ...context, dev: false }, path.join(root, 'private-booklet', 'en.draft.ts'), 'android'), /cannot be included/);
  } finally {
    if (previous === undefined) delete process.env.BOOKLET_LOCAL_DRAFT;
    else process.env.BOOKLET_LOCAL_DRAFT = previous;
  }
});

test('bundled English covers the complete source sequence and all 19 scan pages', () => {
  const english = booklets.en;
  assert.deepEqual(english.map(page => page.id), [...PAGE_IDS]);
  assert.equal(english.reduce((sum, page) => sum + page.sections.length, 0), 63);
  const covered = new Set();
  const expectedReferences = ['(1 Cor 11:23-26)', '(Lk 22:39-42.44-45)', '(Mk 14:60-64.15:1)', '(Mt 27:22-30, passim)', '(Mt 27:31)', null, '(Mk 15:21)', '(Lk 23:27-31)', '(Lk 23:33-35)', '(Lk 23:39-43)', '(Jn 19:25-27)', '(Lk 23:44.46, Jn 19:28-30)', '(Mt 27:57-60)', '(Mt 28:1-2.5-6)'];
  for (const page of english) {
    for (const passage of pagePassages(page)) {
      assert.equal(passage.status, 'draft');
      assert.equal(passage.rights, 'user-confirmed-text-permission');
      assert.ok(passage.text.length > 0);
      assert.ok(!/[\uFFFD]/.test(passage.text));
      for (const number of passage.source.pages) {
        assert.ok(Number.isInteger(number) && number >= 1 && number <= 19);
        covered.add(number);
      }
    }
    if (!page.station) continue;
    const scripture = page.sections.filter(section => section.kind === 'scripture');
    const expectedReference = expectedReferences[page.station - 1];
    assert.equal(scripture.length, expectedReference ? 1 : 0);
    if (expectedReference) assert.equal(scripture[0].reference.text, expectedReference);
    assert.equal(page.sections.filter(section => section.kind === 'prayer').length, 1);
    const hymn = page.sections.find(section => section.kind === 'hymn');
    assert.ok(hymn);
    assert.equal(hymn.text.text.split('\n').length, 4);
    assert.ok(page.sections.find(section => section.kind === 'prayer').text.text.includes('*'));
    assert.deepEqual(page.sections[0].turns.map(turn => turn.role), ['leader', 'all']);
  }
  assert.deepEqual([...covered].sort((a, b) => a - b), Array.from({ length: 19 }, (_, i) => i + 1));
  assert.deepEqual(english[0].sections[0].turns.map(turn => turn.role), ['all', 'leader', 'all']);
  const closing = english.at(-1);
  assert.equal(closing.sections.filter(section => section.kind === 'hymn').length, 3);
  assert.deepEqual(closing.sections[1].turns.map(turn => turn.role), ['leader', 'all', 'leader', 'all']);
  const stanzas = paragraphs(closing.sections[2].text.text);
  assert.equal(stanzas.length, 14);
  assert.ok(stanzas.every((stanza, index) => stanza.startsWith(`${index + 1}. `)));
  assert.equal(paragraphs(closing.sections[3].text.text).length, 5);
  assert.equal(paragraphs(closing.sections[4].text.text).length, 4);
});

test('Filipino includes its own readings, reflections, responses and closing without invented songs', () => {
  const filipino = booklets.fil;
  assert.equal(filipino.reduce((count, page) => count + page.sections.length, 0), 90);
  const covered = new Set();
  const references = ['(26:26-30) (Ihambing sa Mk 14:22-25; Lk 22:3-6)',
    '(26:36-46) (Mk 14:32-42; Lk 22:39-46; Jn 18:1-9)',
    '(27:15-26) (Mk 15:6-15;Lk 23:1-25;Jn 18:28-19:16)',
    '(27:27-31) (Mk 15:16-20;Jn 19:2-31)', '(19:16-17)', null,
    '(27:32) (Mk 15:21;Lk 23:26)', '(23:27-31)', '(27:33-35)(Lk 23:34)',
    '(23:39-43)', '(19:25-27)', '(27:45-50)(Mk 15:33-41;Lk 23:44-49; Jn 19:28-30)',
    '(27:57-61)(Mk 15:42-47; Lk 23:50-56; Jn 19:38-42)',
    '(28:1-10)(Mk 16:1-20;Lk 24:1-53; Jn 20:1-21,25)'];
  for (const page of filipino) {
    assert.ok(!page.sections.some(section => section.kind === 'hymn'));
    for (const passage of pagePassages(page)) {
      assert.equal(passage.source.document, 'bagong-daan-ng-krus.pdf');
      assert.ok(passage.text.trim().length > 0 && !passage.text.includes('\uFFFD'));
      for (const number of passage.source.pages) {
        assert.ok(Number.isInteger(number) && number >= 1 && number <= 37);
        covered.add(number);
      }
    }
    if (!page.station) continue;
    const scripture = page.sections.find(section => section.kind === 'scripture');
    const expected = references[page.station - 1];
    if (expected) {
      assert.equal(scripture.reference.text, expected);
      assert.equal(scripture.referencePosition, 'before');
      assert.match(scripture.heading, /^Pagbasa sa ebanghelyo ayon kay San /);
      const acclamation = page.sections[2];
      assert.deepEqual(acclamation.turns.map(turn => turn.cue), [null, 'TUGON']);
      assert.equal(acclamation.turns[1].text.text, 'Salamat sa Diyos.');
    } else {
      assert.equal(scripture, undefined);
      assert.match(page.sections[1].text.text, /^\(Walang pagbasa\./);
    }
    assert.deepEqual(page.sections[0].turns.map(turn => turn.cue), ['NAMUMUNO', 'TUGON']);
    assert.equal(page.sections.filter(section => section.kind === 'reflection').length, 1);
    assert.equal(page.sections.filter(section => section.kind === 'prayer').length, 2);
    assert.match(page.sections.at(-1).text.text, /^Luwalhati sa Ama,/);
  }
  assert.deepEqual([...covered].sort((a, b) => a - b), Array.from({ length: 37 }, (_, index) => index + 1));
  assert.match(filipino[0].sections[0].text.text, /^MAGNILAY-NILAY SA BAGONG DAAN NG KRUS$/);
  assert.equal(filipino[3].title, 'SI HESUS AY HINATULANG MAMATAY');
  assert.equal(filipino[9].title, 'SI HESUS AY HINUBARAN AT IPINAKO SA KRUS');
  // Paragraphs that span physical pages must remain continuous on the phone.
  assert.match(filipino[1].sections[4].text.text, /bahagi ng iyong Katawan\. Nakikiisa/);
  assert.match(filipino[2].sections[1].reading.text, /manalangin upang huwag/);
  assert.deepEqual(filipino.at(-1).sections[2].turns.map(turn => turn.cue),
    ['NAMUMUNO', 'TUGON', 'NAMUMUNO', 'TUGON', 'NAMUMUNO', 'TUGON']);
  assert.equal(filipino.at(-1).sections.at(-1).text.text, 'Ama Namin, Aba Ginoong Maria, Luwalhati sa Ama');
});

test('edition source maps cover every station once without treating editions as identical', () => {
  const { sources } = require('../src/content/sources.ts');
  for (const source of Object.values(sources)) {
    assert.equal(source.stations.length, 14);
    const pages = [...source.opening, ...source.stations.flat(), ...source.closing, ...source.supplementaryHymns];
    assert.equal(pages.length, new Set(pages).size);
    assert.deepEqual(pages, Array.from({ length: source.pageCount - pages[0] + 1 }, (_, index) => index + pages[0]));
  }
  assert.notDeepEqual(sources.en.stations, sources.fil.stations);
});

test('the resolver rejects source scans even when requested as assets', () => {
  const config = require('../metro.config.js');
  for (const name of ['stations-of-the-cross.pdf', 'bagong-daan-ng-krus.pdf']) {
    for (const dev of [true, false]) {
      const context = { dev, originModulePath: __filename,
        resolveRequest: () => ({ type: 'assetFiles', filePaths: [require('node:path').resolve('assets', name)] }),
      };
      assert.throws(() => config.resolver.resolveRequest(context, name, 'android'), /scans must not be bundled/);
    }
  }
});
