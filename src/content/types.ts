export const PAGE_IDS = [
  'opening', 'station-1', 'station-2', 'station-3', 'station-4', 'station-5',
  'station-6', 'station-7', 'station-8', 'station-9', 'station-10',
  'station-11', 'station-12', 'station-13', 'station-14', 'closing',
] as const;

export type PageId = (typeof PAGE_IDS)[number];
export type Language = 'en' | 'fil';

export type SourceLocation = {
  document: string;
  // Physical PDF page numbers, starting at 1; a passage may span pages.
  pages: readonly number[];
};

// Transcription review and text permission are independent: an authorized text
// can remain a draft until its wording has completed editorial review.
export type BookletText =
  | { status: 'placeholder'; text: string }
  | { status: 'draft'; text: string; source: SourceLocation; rights: 'unconfirmed' | 'user-confirmed-text-permission'; reviewNotes: readonly string[] }
  | { status: 'verified'; text: string; source: SourceLocation; rights: string };

export type Section = {
  // Use the source heading verbatim, or null if the source has no heading.
  heading?: string | null;
  note?: BookletText;
} & (
  | { kind: 'scripture'; reading: BookletText; reference: BookletText; referencePosition?: 'before' | 'after' }
  | { kind: 'responses'; turns: { role: 'leader' | 'all'; cue?: string | null; text: BookletText }[] }
  | { kind: 'reflection' | 'prayer' | 'hymn'; text: BookletText }
  | { kind: 'pause'; text: BookletText }
);

export type Illustration =
  | { status: 'placeholder'; description: string }
  | { status: 'verified'; asset: number; description: string; source: string; rights: string };

export type BookletPage = {
  id: PageId;
  station?: number;
  numeral?: string;
  title: string;
  titleStatus: 'station-label' | 'placeholder' | 'draft';
  titleSource?: SourceLocation;
  illustration?: Illustration;
  sections: Section[];
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'] as const;

export const placeholder = (text: string): BookletText => ({ status: 'placeholder', text });
