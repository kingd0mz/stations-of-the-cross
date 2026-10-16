export const PAGE_IDS = [
  'opening', 'station-1', 'station-2', 'station-3', 'station-4', 'station-5',
  'station-6', 'station-7', 'station-8', 'station-9', 'station-10',
  'station-11', 'station-12', 'station-13', 'station-14', 'closing',
] as const;

export type PageId = (typeof PAGE_IDS)[number];
export type Language = 'en' | 'fil';

// Approved text must record both its source and permission/ public-domain basis.
export type BookletText =
  | { status: 'placeholder'; text: string }
  | { status: 'verified'; text: string; source: string; rights: string };

export type Section =
  | { kind: 'scripture'; reading: BookletText; reference: BookletText }
  | { kind: 'responses'; turns: { role: 'leader' | 'all'; text: BookletText }[] }
  | { kind: 'reflection' | 'prayer' | 'hymn'; text: BookletText }
  | { kind: 'pause'; text: BookletText };

export type Illustration =
  | { status: 'placeholder'; description: string }
  | { status: 'verified'; asset: number; description: string; source: string; rights: string };

export type BookletPage = {
  id: PageId;
  station?: number;
  numeral?: string;
  title: string;
  titleStatus: 'station-label' | 'placeholder';
  illustration?: Illustration;
  sections: Section[];
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'] as const;

export const placeholder = (text: string): BookletText => ({ status: 'placeholder', text });
