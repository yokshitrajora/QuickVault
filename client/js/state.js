// ── Client-side state store ────────────────────────────────────────────────
export const state = {
  items:       [],
  tags:        [],
  filter:      'ALL',      // ALL | BOOKMARK | SNIPPET | NOTE | FAVORITES
  selectedTag: null,
  searchQuery: '',
  viewMode:    'grid',     // grid | list
  theme:       localStorage.getItem('theme') || 'light',
};

/** Listeners registered with onChange() */
const listeners = [];

export function onChange(fn) {
  listeners.push(fn);
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}
