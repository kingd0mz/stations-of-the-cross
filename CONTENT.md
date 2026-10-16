# Content and permissions

This is a reader MVP with **unverified placeholders**, not a publication-ready
prayer edition. No booklet scans, devotional passages, scripture quotations, hymn
lyrics, or station illustrations are reproduced. The repository does not contain
the 19-page English booklet mentioned in issue #2 or a verified Filipino edition.
No redistribution authorization has been supplied for either edition.

The English station topic labels follow the Philippine New Way sequence, from the
Last Supper through the Resurrection. The sequence was cross-checked against
[Visita Iglesia's New Way of the Cross](https://visitaiglesia.net/the-way-of-the-cross/).
This reference is for identifying topics, not permission to copy its text or images,
and does not establish identity with the user's booklet.

Filipino station titles are explicitly marked as awaiting verification. UI labels
and editorial placeholder notices are Filipino; devotional text has not been
automatically translated, paraphrased, or replaced with English fallback passages.

## Adding approved content

- Keep `opening`, `station-1` through `station-14`, and `closing` IDs stable in both
  editions. Edition-specific wording stays in its own language file.
- Identify the exact edition, publisher, copyright holder, scripture translation,
  hymn/illustration credits, and applicable redistribution terms. Record permission
  evidence or a confirmed public-domain/license basis before copying material.
- Proofread against the authorized source images, including speaker cues, verse
  breaks, pauses, references, and hymns. Do not rely on OCR alone.
- Replace a `BookletText` placeholder with `status: 'verified'`, exact `text`,
  `source`, and `rights`. These fields document an editorial decision; TypeScript
  cannot verify rights or textual accuracy. Preserve hymn line breaks with `\n`.
- Add approved illustrations as local `require(...)` assets only, with description,
  source, and rights. Never put image URLs in content. Keep optimized originals
  separate from source scans and provide meaningful accessibility descriptions.
- Add any edition differences explicitly; do not silently use an English passage
  inside the Filipino edition. Review both editions before a public release.

All current placeholder passages are marked in the UI. Update the placeholder-only
test assertions as verified content is deliberately approved and introduced.
