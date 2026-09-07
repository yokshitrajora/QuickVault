import { api } from './api.js';
import { state, setState, onChange } from './state.js';
import { renderCards, setRefetch } from './render.js';
import { openAddModal, openCommandMenu, setOnSave } from './modals.js';
import { icons } from './utils.js';

// ── DOM refs ────────────────────────────────────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const canvasEl      = document.getElementById('canvas-items');
const emptyState    = document.getElementById('empty-state');
const canvasTitle   = document.getElementById('canvas-title');
const canvasCount   = document.getElementById('canvas-count');
const canvasSub     = document.getElementById('canvas-sub');
const tagCloud      = document.getElementById('tag-cloud');
const searchInput   = document.getElementById('search-input');
const viewGrid      = document.getElementById('view-grid');
const viewList      = document.getElementById('view-list');
const themeBtn      = document.getElementById('theme-btn');
const mobileMenu    = document.getElementById('mobile-menu');
const addItemBtn    = document.getElementById('add-item-btn');
const seedBtn       = document.getElementById('seed-btn');
const filterPillContainer = document.getElementById('filter-pills');

// ── Apply theme ─────────────────────────────────────────────────────────────
export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  if (themeBtn) themeBtn.innerHTML = theme === 'dark' ? icons.sun : icons.moon;
  localStorage.setItem('theme', theme);
}

export function toggleTheme() {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  setState({ theme: next });
  applyTheme(next);
}

applyTheme(state.theme);

// ── Fetch & render items ────────────────────────────────────────────────────
async function fetchItems() {
  const params = {};
  if (state.searchQuery) params.q = state.searchQuery;
  if (state.filter !== 'ALL' && state.filter !== 'FAVORITES') params.type = state.filter;
  if (state.filter === 'FAVORITES') params.favorites = 'true';
  if (state.selectedTag) params.tag = state.selectedTag;

  try {
    const items = await api.getItems(params);
    setState({ items });
  } catch (e) {
    console.error('Failed to fetch items', e);
  }
}

async function fetchTags() {
  try {
    const tags = await api.getTags();
    setState({ tags });
  } catch (e) {
    console.error('Failed to fetch tags', e);
  }
}

export async function refetch() {
  await Promise.all([fetchItems(), fetchTags()]);
}

setRefetch(refetch);
setOnSave(refetch);

// ── Sidebar navigation ──────────────────────────────────────────────────────
const FILTER_LABELS = { ALL: 'All Items', BOOKMARK: 'Bookmarks', SNIPPET: 'Snippets', NOTE: 'Notes', FAVORITES: 'Favorites' };
const NAV_ICONS     = { ALL: icons.layout, BOOKMARK: icons.bookmark, SNIPPET: icons.code, NOTE: icons.note, FAVORITES: icons.star };

function renderSidebar() {
  const navEl = document.getElementById('sidebar-nav');
  navEl.innerHTML = Object.entries(FILTER_LABELS).map(([type, label]) => {
    const count = type === 'ALL' ? state.items.length
      : type === 'FAVORITES' ? state.items.filter(i => i.isFavorite).length
      : state.items.filter(i => i.type === type).length;
    const isActive = state.filter === type && !state.selectedTag;
    return `<button class="nav-item ${isActive ? 'active' : ''}" data-filter="${type}">
      <span class="nav-item-left">${NAV_ICONS[type]} ${label}</span>
      ${count > 0 ? `<span class="nav-count">${count}</span>` : ''}
    </button>`;
  }).join('');

  navEl.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      setState({ filter: btn.dataset.filter, selectedTag: null });
      closeMobileSidebar();
    });
  });
}

function renderTagCloud() {
  if (!tagCloud) return;
  if (state.tags.length === 0) {
    tagCloud.innerHTML = '<span style="font-size:11px;color:var(--text-xmuted);padding:0 4px">No tags yet</span>';
    return;
  }
  tagCloud.innerHTML = state.tags.map(t => `
    <button class="tag-chip ${state.selectedTag === t.name ? 'active' : ''}" data-tag="${t.name}">
      #${t.name}<span class="tag-chip-count">${t.count}</span>
    </button>`).join('');
  tagCloud.querySelectorAll('.tag-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      setState({ selectedTag: state.selectedTag === btn.dataset.tag ? null : btn.dataset.tag });
      closeMobileSidebar();
    });
  });
}

export function filterByTag(tag) {
  setState({ selectedTag: tag });
}

// ── Canvas header ───────────────────────────────────────────────────────────
function renderCanvasHeader() {
  if (canvasTitle) canvasTitle.textContent = FILTER_LABELS[state.filter] || 'All Items';
  if (canvasCount) canvasCount.textContent = state.items.length;

  let sub = 'Organize and access your bookmarks, snippets, and notes';
  if (state.selectedTag) sub = `Filtered by tag #${state.selectedTag}`;
  else if (state.searchQuery) sub = `Results for "${state.searchQuery}"`;
  if (canvasSub) canvasSub.textContent = sub;

  // Filter pill for active tag
  if (filterPillContainer) {
    filterPillContainer.innerHTML = state.selectedTag
      ? `<button class="filter-pill" id="clear-tag-pill">${icons.x} Clear #${state.selectedTag}</button>`
      : '';
    document.getElementById('clear-tag-pill')?.addEventListener('click', () => setState({ selectedTag: null }));
  }
}

// ── Main render ─────────────────────────────────────────────────────────────
function render() {
  renderSidebar();
  renderTagCloud();
  renderCanvasHeader();

  if (state.items.length === 0) {
    canvasEl.innerHTML = '';
    emptyState?.classList.remove('hidden');
  } else {
    emptyState?.classList.add('hidden');
    renderCards(state.items, state.viewMode, canvasEl);
  }

  // View buttons
  viewGrid?.classList.toggle('active', state.viewMode === 'grid');
  viewList?.classList.toggle('active', state.viewMode === 'list');
}

onChange(render);

// ── Event Listeners ─────────────────────────────────────────────────────────

// Search
let searchTimer;
searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    setState({ searchQuery: searchInput.value.trim() });
    refetch();
  }, 300);
});
searchInput?.addEventListener('click', () => openCommandMenu());

// View toggle
viewGrid?.addEventListener('click', () => setState({ viewMode: 'grid' }));
viewList?.addEventListener('click', () => setState({ viewMode: 'list' }));

// Theme
themeBtn?.addEventListener('click', toggleTheme);

// Add item
addItemBtn?.addEventListener('click', () => openAddModal('BOOKMARK'));

// Quick action buttons in canvas header
document.getElementById('qa-bookmark')?.addEventListener('click', () => openAddModal('BOOKMARK'));
document.getElementById('qa-snippet')?.addEventListener('click',  () => openAddModal('SNIPPET'));
document.getElementById('qa-note')?.addEventListener('click',     () => openAddModal('NOTE'));

// Seed
seedBtn?.addEventListener('click', async () => {
  seedBtn.disabled = true;
  seedBtn.innerHTML = `${icons.sparkles} Seeding...`;
  try { await api.seed(); await refetch(); }
  finally { seedBtn.disabled = false; seedBtn.innerHTML = `${icons.sparkles} Load Sample Data`; }
});
document.getElementById('empty-seed')?.addEventListener('click', async () => {
  await api.seed(); await refetch();
});
document.getElementById('empty-add')?.addEventListener('click', () => openAddModal('BOOKMARK'));

// Mobile sidebar
function closeMobileSidebar() { sidebar?.classList.remove('open'); }
mobileMenu?.addEventListener('click', () => sidebar?.classList.toggle('open'));
document.addEventListener('click', (e) => {
  if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && e.target !== mobileMenu) {
    closeMobileSidebar();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCommandMenu(); }
  if (e.key === 'Escape') {
    ['add-overlay', 'edit-overlay', 'detail-overlay', 'cmd-overlay']
      .forEach(id => document.getElementById(id)?.classList.add('hidden'));
  }
});

// ── Init ────────────────────────────────────────────────────────────────────
(async () => {
  await refetch();
})();
