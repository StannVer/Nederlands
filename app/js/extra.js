// Two "virtual themes" built from data rather than content files: the learner's own words and the
// words the teacher adds after a conversation. They go through the same lesson and review engine.
import * as store from './store.js';
import { CONFIG } from './config.js';

const asItem = (w) => ({ id: w.id, nl: w.nl, fr: w.fr, note: w.note || '', ex_nl: '', ex_fr: '' });

export const VIRTUAL = ['perso', 'stan'];

export function virtualTheme(id) {
  if (id === 'perso') return { id, nl: 'Mes mots', fr: 'Mes mots', virtual: true, items: (store.db().mywords || []).map(asItem), grammar: {} };
  if (id === 'stan') return { id, nl: `Mots de ${CONFIG.teacherName}`, fr: `Mots de ${CONFIG.teacherName}`, virtual: true, items: (store.db().teacherItems || []).map(asItem), grammar: {} };
  return null;
}

// Items added but not yet learned (no review card yet).
export const pending = (id) => (virtualTheme(id)?.items || []).filter((it) => !store.getCard(`${id}/${it.id}`));
