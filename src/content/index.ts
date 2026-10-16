import { english } from './en';
import { filipino } from './fil';
import { Language } from './types';

export const booklets = { en: english, fil: filipino };

export const labels = {
  en: {
    app: 'New Way of the Cross', pages: 'Pages', close: 'Close', beginning: 'Start from Beginning',
    previous: 'Previous', next: 'Next', leader: 'Leader', all: 'All', scripture: 'Scripture',
    reflection: 'Reflection', prayer: 'Prayer', hymn: 'Hymn', pause: 'Pause',
    placeholder: 'UNVERIFIED PLACEHOLDER', station: 'Station', opening: 'Opening', closing: 'Closing',
    notice: 'Prayer texts await verification. This edition contains placeholders.',
    storage: 'Preferences could not be saved. You can continue reading.',
    restore: 'Saved preferences could not be read. You can continue reading.',
    smaller: 'Smaller text', larger: 'Larger text', select: 'Choose a page',
  },
  fil: {
    app: 'Bagong Daan ng Krus', pages: 'Mga pahina', close: 'Isara', beginning: 'Magsimula sa Unang Pahina',
    previous: 'Bumalik', next: 'Susunod', leader: 'Namumuno', all: 'Lahat', scripture: 'Kasulatan',
    reflection: 'Pagninilay', prayer: 'Panalangin', hymn: 'Awit', pause: 'Paghinto',
    placeholder: 'PANSAMANTALA — HINDI PA BERIPIKADO', station: 'Estasyon', opening: 'Pambungad', closing: 'Pangwakas',
    notice: 'Hinihintay ang beripikasyon ng mga teksto. Pansamantala ang nilalaman.',
    storage: 'Hindi na-save ang mga setting. Maaari pa ring magbasa.',
    restore: 'Hindi mabasa ang na-save na mga setting. Maaari pa ring magbasa.',
    smaller: 'Paliitin ang teksto', larger: 'Palakihin ang teksto', select: 'Pumili ng pahina',
  },
} satisfies Record<Language, Record<string, string>>;
