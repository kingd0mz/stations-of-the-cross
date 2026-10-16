import { BookletPage, BookletText } from './types';

// Keep wording, single line breaks, asterisks and empty paragraphs intact.
// Only normalize platform newline encoding for native text rendering.
export function paragraphs(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split('\n\n');
}

export function pagePassages(page: BookletPage): BookletText[] {
  return page.sections.flatMap(section => {
    const passages = section.kind === 'responses' ? section.turns.map(turn => turn.text)
      : section.kind === 'scripture' ? [section.reading, section.reference] : [section.text];
    return section.note ? [...passages, section.note] : passages;
  });
}
