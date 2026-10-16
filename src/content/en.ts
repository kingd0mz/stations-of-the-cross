import { BookletPage, PAGE_IDS, placeholder, ROMAN, Section } from './types';

// Topic labels only. No prayer text or artwork is reproduced from the reference edition.
const titles = [
  'The Last Supper',
  'The Agony in Gethsemane',
  'Jesus Before the Sanhedrin',
  'The Scourging and Crowning with Thorns',
  'Jesus Receives the Cross',
  'Jesus Falls Under the Weight of the Cross',
  'Simon of Cyrene Carries the Cross of Jesus',
  'Jesus Meets the Women of Jerusalem',
  'Jesus Is Nailed to the Cross',
  'The Repentant Thief',
  'Mary and John at the Foot of the Cross',
  'Jesus Dies on the Cross',
  'Jesus Is Laid in the Tomb',
  'Jesus Rises from the Dead',
];

function sections(): Section[] {
  return [
    { kind: 'responses', turns: [
      { role: 'leader', text: placeholder('Verified English Leader response is not yet available.') },
      { role: 'all', text: placeholder('Verified English All response is not yet available.') },
    ] },
    { kind: 'scripture', reference: placeholder('Scripture reference awaiting edition verification.'), reading: placeholder('Verified English scripture reading is not yet available.') },
    { kind: 'reflection', text: placeholder('Verified English reflection is not yet available.') },
    { kind: 'prayer', text: placeholder('Verified English station prayer is not yet available.') },
    { kind: 'hymn', text: placeholder('Verified English hymn and verses are not yet available.') },
  ];
}

export const english: BookletPage[] = [
  { id: 'opening', title: 'Opening Prayer', titleStatus: 'station-label', sections: [
    { kind: 'prayer', text: placeholder('Verified English opening prayer is not yet available. Text will be included after proofreading and redistribution permission are confirmed.') },
  ] },
  ...titles.map((title, index): BookletPage => ({
    id: PAGE_IDS[index + 1], station: index + 1, numeral: ROMAN[index], title,
    titleStatus: 'station-label',
    illustration: { status: 'placeholder', description: 'Station artwork pending permission and verification.' },
    sections: sections(),
  })),
  { id: 'closing', title: 'Concluding Prayer', titleStatus: 'station-label', sections: [
    { kind: 'prayer', text: placeholder('Verified English concluding prayer is not yet available. Text will be included after proofreading and redistribution permission are confirmed.') },
    { kind: 'hymn', text: placeholder('Verified English concluding hymn is not yet available.') },
  ] },
];
