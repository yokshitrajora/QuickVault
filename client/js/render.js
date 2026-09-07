import { icons, copyToClipboard, toggleFavorite, deleteItem } from './utils.js';
import { openDetailModal, openEditModal } from './modals.js';

// Prism for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/themes/prism-tomorrow.css';

// marked for markdown
import { marked } from 'marked';
marked.setOptions({ gfm: true, breaks: true });

let refetchFn = () => {};

export function setRefetch(fn) { refetchFn = fn; }

/* ── Domain helper ───────────────────────────────────────────────────── */
function getDomain(url) {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

/* ── Bookmark Card ───────────────────────────────────────────────────── */
function bookmarkCard(item, viewMode) {
  const domain = item.url ? getDomain(item.url) : 'web';
  const tags = (item.tags || []);

  if (viewMode === 'list') {
    const el = document.createElement('div');
    el.className = 'card-list';
    el.innerHTML = `
      <div class="card-list-icon">
        ${item.favicon
          ? `<img src="${item.favicon}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">${icons.globe}`
          : icons.globe}
      </div>
      <div class="card-list-body">
        <div class="card-list-title">
          <a href="${item.url || '#'}" target="_blank" rel="noreferrer">${item.title}</a>
          <span style="font-size:10px;margin-left:6px;font-family:monospace;color:var(--text-xmuted);background:var(--bg-hover);padding:1px 5px;border-radius:3px;">${domain}</span>
        </div>
        ${item.description ? `<div class="card-list-sub">${item.description}</div>` : ''}
        <div class="card-list-tags">${tags.map(t => `<button class="card-tag">#${t}</button>`).join('')}</div>
      </div>
      <div class="card-actions">
        <button class="action-btn fav-btn ${item.isFavorite ? 'fav on' : 'fav'}" title="Favorite">${item.isFavorite ? icons.starFill : icons.star}</button>
        <button class="action-btn edit-btn" title="Edit">${icons.edit}</button>
        <button class="action-btn danger del-btn" title="Delete">${icons.trash}</button>
      </div>`;
    bindCardActions(el, item, null);
    return el;
  }

  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    ${item.ogImage ? `<img class="card-og" src="${item.ogImage}" alt="" onerror="this.classList.add('hidden')">` : ''}
    <div class="card-body">
      <div class="card-meta">
        ${item.favicon
          ? `<img class="card-favicon" src="${item.favicon}" alt="" onerror="this.style.display='none'">`
          : `<span style="width:16px;height:16px;display:flex;align-items:center;color:var(--text-xmuted)">${icons.globe}</span>`}
        <span class="card-domain">${domain}</span>
        <div style="margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .15s" class="card-actions">
          <button class="action-btn fav-btn ${item.isFavorite ? 'fav on' : 'fav'}" title="Favorite">${item.isFavorite ? icons.starFill : icons.star}</button>
          <button class="action-btn edit-btn" title="Edit">${icons.edit}</button>
          <button class="action-btn danger del-btn" title="Delete">${icons.trash}</button>
        </div>
      </div>
      <div class="card-title">
        <a href="${item.url || '#'}" target="_blank" rel="noreferrer">${item.title}</a>
      </div>
      ${item.description ? `<div class="card-desc">${item.description}</div>` : ''}
    </div>
    <div class="card-footer">
      <div class="card-tags">${tags.map(t => `<button class="card-tag">#${t}</button>`).join('')}</div>
      <button class="action-btn copy-link-btn" title="Copy link">${icons.copy}</button>
    </div>`;

  el.addEventListener('mouseenter', () => el.querySelector('.card-actions').style.opacity = '1');
  el.addEventListener('mouseleave', () => el.querySelector('.card-actions').style.opacity = '0');

  el.querySelector('.copy-link-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (item.url) copyToClipboard(item.url, e.currentTarget);
  });

  bindCardActions(el, item, null);
  return el;
}

/* ── Snippet Card ───────────────────────────────────────────────────── */
function snippetCard(item, viewMode) {
  const lang = (item.language || 'javascript').toLowerCase();
  const tags = item.tags || [];
  const code = item.content || '// empty';
  const highlighted = Prism.languages[lang]
    ? Prism.highlight(code, Prism.languages[lang], lang)
    : code;

  if (viewMode === 'list') {
    const el = document.createElement('div');
    el.className = 'card-list';
    el.innerHTML = `
      <div class="card-list-icon">${icons.code}</div>
      <div class="card-list-body">
        <div class="card-list-title">
          ${item.title}
          <span style="font-size:10px;margin-left:6px;font-family:monospace;color:var(--text-xmuted);background:var(--bg-hover);padding:1px 5px;border-radius:3px;">${lang}</span>
        </div>
        ${item.description ? `<div class="card-list-sub">${item.description}</div>` : ''}
        <div class="card-list-tags">${tags.map(t => `<button class="card-tag">#${t}</button>`).join('')}</div>
      </div>
      <div class="card-list-right">
        <button class="copy-btn list-copy-btn" title="Copy code">${icons.copy} Copy</button>
        <div class="card-actions">
          <button class="action-btn fav-btn ${item.isFavorite ? 'fav on' : 'fav'}">${item.isFavorite ? icons.starFill : icons.star}</button>
          <button class="action-btn edit-btn">${icons.edit}</button>
          <button class="action-btn danger del-btn">${icons.trash}</button>
        </div>
      </div>`;
    el.querySelector('.list-copy-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(code, e.currentTarget);
    });
    bindCardActions(el, item, () => openDetailModal(item));
    return el;
  }

  const el = document.createElement('div');
  el.className = 'card';
  el.style.cursor = 'pointer';
  el.innerHTML = `
    <div class="card-body" style="padding-bottom:6px">
      <div class="card-meta">
        <span class="snippet-lang">${lang}</span>
        <div style="margin-left:auto;display:flex;gap:2px;" class="card-actions">
          <button class="action-btn fav-btn ${item.isFavorite ? 'fav on' : 'fav'}">${item.isFavorite ? icons.starFill : icons.star}</button>
          <button class="action-btn edit-btn">${icons.edit}</button>
          <button class="action-btn danger del-btn">${icons.trash}</button>
        </div>
      </div>
      <div class="card-title" style="margin-top:6px">${item.title}</div>
      ${item.description ? `<div class="card-desc">${item.description}</div>` : ''}
    </div>
    <div class="code-preview">
      <div class="code-preview-toolbar">
        <span>${lang}</span>
        <button class="copy-btn code-copy-btn">${icons.copy} Copy</button>
      </div>
      <pre><code class="language-${lang} language-out">${highlighted}</code></pre>
    </div>
    <div class="card-footer">
      <div class="card-tags">${tags.map(t => `<button class="card-tag">#${t}</button>`).join('')}</div>
      <button class="action-btn expand-btn" title="Expand">${icons.expand}</button>
    </div>`;

  el.querySelector('.code-copy-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard(code, e.currentTarget);
  });
  el.querySelector('.expand-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openDetailModal(item);
  });
  el.addEventListener('click', () => openDetailModal(item));

  el.addEventListener('mouseenter', () => el.querySelector('.card-actions').style.opacity = '1');
  el.addEventListener('mouseleave', () => el.querySelector('.card-actions').style.opacity = '0');

  bindCardActions(el, item, () => openDetailModal(item));
  return el;
}

/* ── Note Card ───────────────────────────────────────────────────── */
function noteCard(item, viewMode) {
  const tags = item.tags || [];
  const preview = marked(item.content || '*Empty note*').slice(0, 400);

  if (viewMode === 'list') {
    const el = document.createElement('div');
    el.className = 'card-list';
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <div class="card-list-icon">${icons.note}</div>
      <div class="card-list-body">
        <div class="card-list-title">${item.title} <span style="font-size:10px;margin-left:6px;font-family:monospace;color:var(--text-xmuted);background:var(--bg-hover);padding:1px 5px;border-radius:3px;">NOTE</span></div>
        <div class="card-list-sub">${(item.content || '').replace(/[#*`_>]/g, '').slice(0, 60)}...</div>
        <div class="card-list-tags">${tags.map(t => `<button class="card-tag">#${t}</button>`).join('')}</div>
      </div>
      <div class="card-actions">
        <button class="action-btn fav-btn ${item.isFavorite ? 'fav on' : 'fav'}">${item.isFavorite ? icons.starFill : icons.star}</button>
        <button class="action-btn edit-btn">${icons.edit}</button>
        <button class="action-btn danger del-btn">${icons.trash}</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('button')) openDetailModal(item); });
    bindCardActions(el, item, () => openDetailModal(item));
    return el;
  }

  const el = document.createElement('div');
  el.className = 'card';
  el.style.cursor = 'pointer';
  el.innerHTML = `
    <div class="card-body" style="padding-bottom:6px">
      <div class="card-meta">
        <span class="card-type-badge">MARKDOWN</span>
        <div style="margin-left:auto;display:flex;gap:2px;" class="card-actions">
          <button class="action-btn fav-btn ${item.isFavorite ? 'fav on' : 'fav'}">${item.isFavorite ? icons.starFill : icons.star}</button>
          <button class="action-btn edit-btn">${icons.edit}</button>
          <button class="action-btn danger del-btn">${icons.trash}</button>
        </div>
      </div>
      <div class="card-title" style="margin-top:6px">${item.title}</div>
    </div>
    <div class="note-preview">${preview}</div>
    <div class="card-footer">
      <div class="card-tags">${tags.map(t => `<button class="card-tag">#${t}</button>`).join('')}</div>
      <button class="action-btn expand-btn">${icons.expand}</button>
    </div>`;

  el.addEventListener('click', (e) => { if (!e.target.closest('button')) openDetailModal(item); });
  el.querySelector('.expand-btn').addEventListener('click', (e) => { e.stopPropagation(); openDetailModal(item); });

  el.addEventListener('mouseenter', () => el.querySelector('.card-actions').style.opacity = '1');
  el.addEventListener('mouseleave', () => el.querySelector('.card-actions').style.opacity = '0');

  bindCardActions(el, item, () => openDetailModal(item));
  return el;
}

/* ── Shared card action binding ────────────────────────────────────── */
function bindCardActions(el, item, onView) {
  el.querySelector('.fav-btn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleFavorite(item);
  });
  el.querySelector('.edit-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(item);
  });
  el.querySelector('.del-btn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await deleteItem(item, refetchFn);
  });
  el.querySelectorAll('.card-tag').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      import('./app.js').then(({ filterByTag }) => filterByTag(btn.textContent.replace(/^#/, '')));
    });
  });
}

/* ── Main render function ───────────────────────────────────────────── */
export function renderCards(items, viewMode, container) {
  container.innerHTML = '';
  container.className = viewMode === 'list' ? 'cards-list' : 'cards-grid';

  items.forEach((item) => {
    let card;
    if      (item.type === 'BOOKMARK') card = bookmarkCard(item, viewMode);
    else if (item.type === 'SNIPPET')  card = snippetCard(item, viewMode);
    else                               card = noteCard(item, viewMode);
    container.appendChild(card);
  });
}
