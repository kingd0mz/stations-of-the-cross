# Content and attribution status

The user confirmed on 2026-10-16 that permission for the supplied booklet text
has already been obtained. This project records that confirmation as
`user-confirmed-text-permission`; it no longer treats text permission as a release
blocker. This records the user's confirmation rather than an independent legal
review. Transcription accuracy remains a separate editorial task.

## English

`src/content/en.ts` contains the full English transcription and is bundled in
normal Expo Go previews and release exports. No private files or preview flags
are required. The 19-page `assets/stations-of-the-cross.pdf` is the sole wording
reference. Opening: physical PDF page 1; stations I-XIV: pages 2-15; concluding
prayers: page 16; supplementary hymns: pages 17-19. Each passage records its
source pages and the user's confirmed text permission.

There are 16 reader pages and 63 sections. Speaker cues, asterisk pauses,
paragraphs, verses, tune instructions and references are preserved. Station VI
contains uncited narrative reflection; no reference is invented. Closing prayer
cues remain abbreviated. All three supplementary hymns follow in source order.

The text remains a transcription draft pending final independent proofreading
and resolution of the unusual lines identified in TRANSCRIPTION_REVIEW.md.
The reader's draft notice refers to proofreading, not permission to use the text.

Run `npm run start:go -- --clear` for the normal reader. `npm run start:draft`
is retained as a compatibility alias for the same reader with cache clearing.
Ignored `private-booklet/` files are historical editorial working copies, not
application dependencies or the active source of truth.

## Filipino

`assets/bagong-daan-ng-krus.pdf` is a separate 37-page edition headed
*Magnilay-nilay sa Bagong Daan ng Krus*. Its station III concerns the death
sentence and IX explicitly includes stripping; readings and reflections differ
from English. Page 1 is a title page, opening is page 2, stations occupy pages
3-36, closing is page 37. No supplementary hymn appendix was identified.
`src/content/sources.ts` records the individual station ranges.

`src/content/fil.ts` now contains the full Filipino transcription: 16 reader
pages and 90 sections covering all 37 physical source pages, including the title
page text within the opening. It is bundled in normal previews and releases.
The opening, fourteen stations, reflections, prayers, doxology cues and closing
responses were checked against rendered pages. Every passage records its own
source pages and the user's confirmed text permission.

Source-specific NAMUMUNO and TUGON labels are preserved. The unlabelled reading
acclamation stays unlabelled; no extra speaker cue is invented. Thirteen readings
have their original introductions and citations before the text. Station VI keeps
its explicit no-reading instruction. No hymns are supplied in this PDF, so none
are added. Abbreviated doxologies and ending prayer names remain abbreviated.

This is a complete transcription draft, not final editorial approval. Printed
misspellings, capitalization and unusual references remain as printed and are
flagged in passage reviewNotes and TRANSCRIPTION_REVIEW.md. Typesetting spaces
and split syllables have been reflowed for reading; paragraphs continuing across
PDF page boundaries are joined. No prayers are translated from English.

## Artwork, scans and attribution

The user will create original illustrations. Booklet artwork will not be copied.
Image slots remain temporary placeholders until original local artwork is supplied.
Do not label these original images as existing or verified before they are made.
Both PDFs and private working files remain Git-ignored and excluded from bundles;
permission for text is not interpreted as permission for scanned artwork.

The English scan lacks a title/copyright page naming its publisher, author,
scripture edition, hymn contributors or illustrator. Filipino PDF metadata names
Gian Carlo Pablo as document author and Word 2013 as creator; this is provenance
metadata, not a verified contributor credit. Capture exact publisher/contributor
credits and any required attribution from the permission arrangement when available.
No attribution terms have been supplied in this conversation. The software license
does not replace booklet attribution or change the text permission arrangement.

Mark text `verified` only after final proofreading. Keep its source and permission
metadata. See TRANSCRIPTION_REVIEW.md and SPRINT_2.md for remaining acceptance work.
