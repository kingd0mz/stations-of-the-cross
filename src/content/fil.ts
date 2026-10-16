import { BookletPage, PAGE_IDS, placeholder, ROMAN, Section } from './types';

// These are editorial placeholders, not translations of an English prayer edition.
function sections(): Section[] {
  return [
    { kind: 'responses', turns: [
      { role: 'leader', text: placeholder('Wala pang beripikadong tugon sa Filipino para sa namumuno.') },
      { role: 'all', text: placeholder('Wala pang beripikadong tugon sa Filipino para sa lahat.') },
    ] },
    { kind: 'scripture', reference: placeholder('Beripikahin pa ang sanggunian sa Kasulatan.'), reading: placeholder('Wala pang beripikadong pagbasa sa Filipino.') },
    { kind: 'reflection', text: placeholder('Wala pang beripikadong pagninilay sa Filipino.') },
    { kind: 'prayer', text: placeholder('Wala pang beripikadong panalangin sa Filipino para sa estasyong ito.') },
    { kind: 'hymn', text: placeholder('Wala pang beripikadong awit at mga taludtod sa Filipino.') },
  ];
}

export const filipino: BookletPage[] = [
  { id: 'opening', title: 'Pambungad na Panalangin', titleStatus: 'station-label', sections: [
    { kind: 'prayer', text: placeholder('Wala pang beripikadong pambungad na panalangin sa Filipino. Idaragdag lamang ang teksto matapos ang pagsusuri at pahintulot sa muling pamamahagi.') },
  ] },
  ...ROMAN.map((numeral, index): BookletPage => ({
    id: PAGE_IDS[index + 1], station: index + 1, numeral,
    title: `Estasyon ${numeral} — pamagat na beripikahin`, titleStatus: 'placeholder',
    illustration: { status: 'placeholder', description: 'Larawan: hinihintay ang pahintulot at beripikasyon.' },
    sections: sections(),
  })),
  { id: 'closing', title: 'Pangwakas na Panalangin', titleStatus: 'station-label', sections: [
    { kind: 'prayer', text: placeholder('Wala pang beripikadong pangwakas na panalangin sa Filipino. Idaragdag lamang ang teksto matapos ang pagsusuri at pahintulot sa muling pamamahagi.') },
    { kind: 'hymn', text: placeholder('Wala pang beripikadong pangwakas na awit sa Filipino.') },
  ] },
];
