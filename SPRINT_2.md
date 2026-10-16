# Sprint 2 handoff

Work follows GitHub issues #2 and #4. Updated 2026-10-16 after the user confirmed
text permission and chose original illustrations. English text is included in
normal previews and release exports. It remains a transcription draft pending
final proofreading. Filipino is now fully transcribed from its own 37-page PDF,
also pending final proofreading.

## Files changed

| Files | Purpose |
| --- | --- |
| `src/content/en.ts` | Complete English text: 16 pages, 63 sections, all 19 source PDF pages; user-confirmed text permission and editorial review notes |
| `src/content/fil.ts`, `sources.ts` | Full Filipino draft: 16 pages, 90 sections, all 37 source pages; separate page ranges and source-specific cues |
| `src/content/types.ts`, `format.ts`, `index.ts` | Separate permission from transcription status; source locations, paragraph/verse preservation, localized proofreading notices |
| `src/reader/BookletPage.tsx` | Mobile booklet styling, speaker cues, distinct scripture/reflection/song styles and readable native text |
| `metro.config.js` | Normal English import in all modes; exclude source PDFs and private editorial files from release graphs |
| `scripts/start-draft.cjs`, `package.json` | Existing draft command retained as a compatibility alias; no private copy or flag required |
| `.gitignore` | Keep PDFs containing scanned artwork and private working files out of Git |
| `tests/reader.test.cjs` | Coverage, references, permission metadata, navigation, preferences and source-scan exclusion |
| `CONTENT.md`, `TRANSCRIPTION_REVIEW.md`, `README.md`, `SPRINT_2.md` | Current permission status, editorial checklist, acceptance status and manual test steps |

No new runtime dependencies, networking, accounts, analytics or cloud features.
The existing language toggle, horizontal swipe, vertical scroll, page selector,
font sizes and saved preferences are preserved. Only the current page is mounted.

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: all 15 tests passed; both editions’ content checks run on the actual bundled
  edition without depending on an ignored local copy.
- `npm run export:android`: passed; bytecode inspection confirms both editions and
  permission metadata are bundled, obsolete permission warning absent, no PDF assets.
- Android Hermes bytecode: 1,573,807 bytes.
- Content checks: sixteen unique ordered IDs, fourteen stations, 63 sections,
  all nineteen English and thirty-seven Filipino source pages, thirteen attached
  scripture references per edition, source speaker cues, and English hymn counts.
  Filipino has 90 sections and no fabricated hymn or Station VI reading.
- Source scans remain untracked and excluded from app bundles.
- Physical phone, large font, small-screen overflow, gestures and cold offline
  checks remain manual. No phone or simulator validation is claimed.
- JavaScript bytecode size is not APK or store download size; the under-10-MB
  release download goal remains unmeasured.

## Expo Go manual test

1. Run `npm run start:go -- --clear` with Expo Go compatible with SDK 57. Connect
   phone and computer to the same Wi-Fi and scan the QR code. On PowerShell use
   `npm.cmd` if required. Full English text should appear immediately, with a
   proofreading draft notice and original-artwork placeholders. No private files
   are required. `npm run start:draft` opens the same content for compatibility.
2. Compare opening, fourteen stations, ending and three hymns against PDF pages
   1-19. Check speaker cues, asterisks, paragraphs, references, tune instructions
   and verse breaks. VI has uncited reflection; closing prayer cues are abbreviated.
3. Swipe both ways and scroll long pages vertically. Vertical drags should stay
   vertical even when moving sideways later. Short drags and multi-touch should
   not turn pages. Previous/Next must stop at booklet boundaries.
4. Use Pages to jump to every station and ending, then restart from beginning.
   Check selector Close and Android Back. Reader Back steps to the previous page;
   at opening it exits normally.
5. Switch EN/FIL mid-station: preserve the selected station. Filipino must show
   its own prayers and titles, NAMUMUNO/TUGON cues, and a proofreading notice.
   Check opening posture, cross-page readings, VI no-reading note and six closing
   response turns against its PDF. No Filipino songs or English fallback passages
   should appear. Switch back to EN.
6. Try text sizes 18, 21, 24 and 28 with large OS font/display settings on a small
   phone (about 320 logical pixels wide). Check titles, responses, references,
   songs, selector and controls for clipping or sideways overflow. Scroll to each
   page's end. Font changes should preserve the mounted scroll view.
7. Select FIL, station IX and the largest font, then close and reopen the project.
   Confirm all preferences restore. Language/page changes reset scroll to the top.
8. Once loaded, enable airplane mode and navigate/read/toggle. Expo Go can require
   Metro for a cold reload; a standalone preview APK is needed for cold offline
   launch validation. Scanned illustrations must never enter the bundle.

## Acceptance status

| Issue | Completed | Outstanding |
| --- | --- | --- |
| #2 | Full structured English text bundled with user-confirmed permission; scan-based first review; source cues, references, pauses, songs and ordering; full Filipino text transcribed and checked against 37 rendered pages, with source-specific cues, references and review notes | Final independent proofreading of both editions and decisions on source typos/citations; exact attribution details from the permission arrangement. Both editions are fully transcribed; final proofread acceptance remains pending. |
| #4 | Warm paper/red styling, readable native text, distinct speaker/readings/prayers/songs, bounded reading width, preserved paragraphs/verses, no remote assets | Original illustrations to be created; low-end/small-phone and large-font validation; final source-fidelity approval; actual release download-size measurement |

Text permission is no longer an outstanding blocker. Neither issue is claimed
fully complete: final editorial review, device testing and original artwork remain.
