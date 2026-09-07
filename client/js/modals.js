import { api } from './api.js';
import { state, setState } from './state.js';
import { icons, copyToClipboard, deleteItem } from './utils.js';
import { marked } from 'marked';
import Prism from 'prismjs';

marked.setOptions({ gfm: true, breaks: true });

let onSaveCallback = () => {};

export function setOnSave(fn) { onSaveCallback = fn; }

/* ── Tag input widget ─────────────────────────────────────────────── */
function createTagInput(initial = []) {
  let tags = [...initial];
  const wrap = document.createElement('div');
  wrap.className = 'tags-input-wrap';

  function render() {
    wrap.innerHTML = `
      <span style="display:flex;align-items:center;color:var(--text-xmuted)">${icons.tag}</span>
      ${tags.map(t => `
        <span class="tag-input-chip">#${t}
          <button type="button" data-tag="${t}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </span>`).join('')}
      <input class="tags-input" type="text" placeholder="${tags.length ? 'add tag...' : 'add tags (Enter to add)...'}" />
    `;
    wrap.querySelectorAll('[data-tag]').forEach((btn) => {
      btn.addEventListener('click', () => {
        tags = tags.filter((t) => t !== btn.dataset.tag);
        render();
      });
    });
    const input = wrap.querySelector('.tags-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = input.value.trim().toLowerCase().replace(/^[#,]/, '');
        if (val && !tags.includes(val)) { tags.push(val); render(); }
        else input.value = '';
      }
    });
    input.addEventListener('blur', () => {
      const val = input.value.trim().toLowerCase().replace(/^[#,]/, '');
      if (val && !tags.includes(val)) { tags.push(val); render(); }
    });
  }
  render();
  return { el: wrap, getTags: () => tags };
}

/* ── Favorite toggle button ───────────────────────────────────────── */
function createFavBtn(initial = false) {
  let fav = initial;
  const btn = document.createElement('button');
  btn.type = 'button';
  function update() {
    btn.className = `fav-toggle-btn ${fav ? 'on' : ''}`;
    btn.innerHTML = `${fav ? icons.starFill : icons.star} ${fav ? 'In Favorites' : 'Favorite'}`;
  }
  btn.addEventListener('click', () => { fav = !fav; update(); });
  update();
  return { el: btn, getFav: () => fav };
}

/* ══════════════════════════════════════════════════════════════════════
   ADD ITEM MODAL
══════════════════════════════════════════════════════════════════════ */
const addOverlay = document.getElementById('add-overlay');
const addModal   = document.getElementById('add-modal');

export function openAddModal(type = 'BOOKMARK') {
  buildAddModal(type);
  addOverlay.classList.remove('hidden');
}

function buildAddModal(activeType) {
  addModal.innerHTML = `
    <!-- Header: type tabs + close -->
    <div class="modal-header">
      <div class="type-tabs">
        ${['BOOKMARK','SNIPPET','NOTE'].map(t => `
          <button type="button" class="type-tab ${t === activeType ? 'active' : ''}" data-type="${t}">
            ${t === 'BOOKMARK' ? icons.bookmark : t === 'SNIPPET' ? icons.code : icons.note}
            ${t.charAt(0) + t.slice(1).toLowerCase()}
          </button>`).join('')}
      </div>
      <button type="button" id="add-close" class="btn-icon">${icons.x}</button>
    </div>
    <div id="add-body"></div>`;

  addModal.querySelector('#add-close').addEventListener('click', () => addOverlay.classList.add('hidden'));
  addOverlay.addEventListener('click', (e) => { if (e.target === addOverlay) addOverlay.classList.add('hidden'); });
  addModal.querySelectorAll('.type-tab').forEach((tab) => {
    tab.addEventListener('click', () => buildAddModal(tab.dataset.type));
  });

  buildAddForm(addModal.querySelector('#add-body'), activeType);
}

function buildAddForm(container, type) {
  const tagInput = createTagInput();
  const favBtn   = createFavBtn();

  let scrapePreviewEl;
  let scrapedOgImage = null;
  let scrapedFavicon = null;

  container.innerHTML = '';

  const body = document.createElement('div');
  body.className = 'modal-body';

  // ── Bookmark fields
  if (type === 'BOOKMARK') {
    const urlRow = document.createElement('div');
    urlRow.className = 'form-group';
    urlRow.innerHTML = `<label class="form-label">URL</label>
      <div class="form-row">
        <input id="f-url" class="form-input" type="text" placeholder="https://example.com" required />
        <button type="button" id="scrape-btn" class="scrape-btn">${icons.sparkles} Scrape</button>
      </div>
      <div id="scrape-preview" class="scrape-preview hidden"></div>`;
    body.appendChild(urlRow);

    scrapePreviewEl = urlRow.querySelector('#scrape-preview');

    const doScrape = async () => {
      const url = urlRow.querySelector('#f-url').value.trim();
      if (!url) return;
      urlRow.querySelector('#scrape-btn').innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Scraping...`;
      try {
        const data = await api.scrapeMetadata(url);
        if (data.title && !titleInput.value) titleInput.value = data.title;
        if (data.description && !descInput.value) descInput.value = data.description;
        if (data.ogImage) { scrapedOgImage = data.ogImage; }
        if (data.favicon) { scrapedFavicon = data.favicon; }
        if (data.ogImage || data.title) {
          scrapePreviewEl.innerHTML = `
            ${data.ogImage ? `<img class="scrape-thumb" src="${data.ogImage}" alt="" onerror="this.style.display='none'">` : ''}
            <div class="scrape-info">
              <div class="scrape-title">${data.title || url}</div>
              <div class="scrape-desc">${data.description || url}</div>
            </div>`;
          scrapePreviewEl.classList.remove('hidden');
        }
      } catch { /* ignore */ }
      urlRow.querySelector('#scrape-btn').innerHTML = `${icons.sparkles} Scrape`;
    };

    urlRow.querySelector('#scrape-btn').addEventListener('click', doScrape);
    urlRow.querySelector('#f-url').addEventListener('blur', () => {
      const url = urlRow.querySelector('#f-url').value.trim();
      if (url && !titleInput.value) doScrape();
    });
  }

  // ── Title (all types)
  const titleGroup = document.createElement('div');
  titleGroup.className = 'form-group';
  titleGroup.innerHTML = `<label class="form-label">Title</label><input id="f-title" class="form-input" type="text" placeholder="Title" required />`;
  body.appendChild(titleGroup);
  const titleInput = titleGroup.querySelector('#f-title');

  // ── Snippet: language + code
  if (type === 'SNIPPET') {
    const langGroup = document.createElement('div');
    langGroup.className = 'form-group';
    const LANGUAGES = ['typescript','javascript','python','rust','go','sql','html','css','json','bash','csharp','cpp','java','yaml','markdown'];
    langGroup.innerHTML = `<label class="form-label">Language</label>
      <select id="f-lang" class="form-select" style="font-family:monospace">
        ${LANGUAGES.map(l => `<option value="${l}">${l}</option>`).join('')}
      </select>`;
    body.appendChild(langGroup);

    const codeGroup = document.createElement('div');
    codeGroup.className = 'form-group';
    codeGroup.innerHTML = `<label class="form-label">Code</label>
      <textarea id="f-code" class="form-textarea code" rows="8" placeholder="// paste code here..." required></textarea>`;
    body.appendChild(codeGroup);
  }

  // ── Note: markdown editor
  if (type === 'NOTE') {
    const mdGroup = document.createElement('div');
    mdGroup.className = 'form-group';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:5px';
    header.innerHTML = `<label class="form-label">Content</label>
      <div class="md-tabs">
        <button type="button" class="md-tab active" data-tab="write">${icons.pen} Write</button>
        <button type="button" class="md-tab" data-tab="preview">${icons.eye} Preview</button>
      </div>`;
    mdGroup.appendChild(header);

    const textarea = document.createElement('textarea');
    textarea.id = 'f-content';
    textarea.className = 'form-textarea';
    textarea.rows = 8;
    textarea.placeholder = '# Heading\n\nWrite **markdown** notes here...';

    const preview = document.createElement('div');
    preview.className = 'md-preview hidden';

    mdGroup.appendChild(textarea);
    mdGroup.appendChild(preview);

    header.querySelectorAll('.md-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        header.querySelectorAll('.md-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (tab.dataset.tab === 'write') {
          textarea.classList.remove('hidden');
          preview.classList.add('hidden');
        } else {
          textarea.classList.add('hidden');
          preview.classList.remove('hidden');
          preview.innerHTML = marked(textarea.value || '*No content yet*');
        }
      });
    });

    body.appendChild(mdGroup);
  }

  // ── Description (Bookmark + Snippet)
  if (type !== 'NOTE') {
    const descGroup = document.createElement('div');
    descGroup.className = 'form-group';
    descGroup.innerHTML = `<label class="form-label">Description</label>
      <textarea id="f-desc" class="form-textarea" rows="2" placeholder="Optional description..."></textarea>`;
    body.appendChild(descGroup);
  }

  // ── Tags
  const tagsGroup = document.createElement('div');
  tagsGroup.className = 'form-group';
  const tagsLabel = document.createElement('label');
  tagsLabel.className = 'form-label';
  tagsLabel.textContent = 'Tags';
  tagsGroup.appendChild(tagsLabel);
  tagsGroup.appendChild(tagInput.el);
  body.appendChild(tagsGroup);

  // ── Favorite
  body.appendChild(favBtn.el);

  container.appendChild(body);

  // ── Footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  footer.innerHTML = `
    <button type="button" class="btn-cancel" id="add-cancel">Cancel</button>
    <button type="button" class="btn-save" id="add-save">Save</button>`;
  container.appendChild(footer);

  footer.querySelector('#add-cancel').addEventListener('click', () => addOverlay.classList.add('hidden'));
  footer.querySelector('#add-save').addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) { titleInput.focus(); return; }

    const payload = {
      type,
      title,
      description: container.querySelector('#f-desc')?.value.trim() || undefined,
      url:         type === 'BOOKMARK' ? container.querySelector('#f-url')?.value.trim() || undefined : undefined,
      content:     type !== 'BOOKMARK' ? (container.querySelector('#f-code') || container.querySelector('#f-content'))?.value || undefined : undefined,
      language:    type === 'SNIPPET'  ? container.querySelector('#f-lang')?.value || 'javascript' : undefined,
      ogImage:     scrapedOgImage || undefined,
      favicon:     scrapedFavicon || undefined,
      tags:        tagInput.getTags(),
      isFavorite:  favBtn.getFav(),
    };

    const saveBtn = footer.querySelector('#add-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
      await api.createItem(payload);
      addOverlay.classList.add('hidden');
      onSaveCallback();
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  });

  // Store descInput ref after DOM built
  var descInput = container.querySelector('#f-desc');
}

/* ══════════════════════════════════════════════════════════════════════
   EDIT ITEM MODAL
══════════════════════════════════════════════════════════════════════ */
const editOverlay = document.getElementById('edit-overlay');
const editModal   = document.getElementById('edit-modal');

export function openEditModal(item) {
  buildEditModal(item);
  editOverlay.classList.remove('hidden');
}

function buildEditModal(item) {
  const tagInput = createTagInput(item.tags || []);
  const favBtn   = createFavBtn(item.isFavorite);

  editModal.innerHTML = `
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:10px;font-family:monospace;text-transform:uppercase;padding:2px 6px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted)">${item.type}</span>
        <span style="font-size:13px;font-weight:500">Edit Item</span>
      </div>
      <button type="button" class="btn-icon" id="edit-close">${icons.x}</button>
    </div>
    <div class="modal-body" id="edit-body"></div>
    <div class="modal-footer">
      <button type="button" class="btn-cancel" id="edit-cancel">Cancel</button>
      <button type="button" class="btn-save" id="edit-save">Save</button>
    </div>`;

  const close = () => editOverlay.classList.add('hidden');
  editModal.querySelector('#edit-close').addEventListener('click', close);
  editModal.querySelector('#edit-cancel').addEventListener('click', close);
  editOverlay.addEventListener('click', (e) => { if (e.target === editOverlay) close(); });

  const body = editModal.querySelector('#edit-body');

  // Title
  body.innerHTML += `<div class="form-group"><label class="form-label">Title</label>
    <input id="e-title" class="form-input" value="${item.title.replace(/"/g,'&quot;')}" required /></div>`;

  if (item.type === 'BOOKMARK') {
    body.innerHTML += `<div class="form-group"><label class="form-label">URL</label>
      <input id="e-url" class="form-input" value="${(item.url || '').replace(/"/g,'&quot;')}" /></div>`;
  }

  if (item.type === 'SNIPPET') {
    const LANGUAGES = ['typescript','javascript','python','rust','go','sql','html','css','json','bash','csharp','cpp','java','yaml','markdown'];
    body.innerHTML += `<div class="form-group"><label class="form-label">Language</label>
      <select id="e-lang" class="form-select" style="font-family:monospace">
        ${LANGUAGES.map(l => `<option value="${l}" ${l === item.language ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div>`;
    body.innerHTML += `<div class="form-group"><label class="form-label">Code</label>
      <textarea id="e-code" class="form-textarea code" rows="8">${item.content || ''}</textarea></div>`;
  }

  if (item.type === 'NOTE') {
    body.innerHTML += `<div class="form-group"><label class="form-label">Markdown Content</label>
      <textarea id="e-content" class="form-textarea" rows="8">${item.content || ''}</textarea></div>`;
  }

  if (item.type !== 'NOTE') {
    body.innerHTML += `<div class="form-group"><label class="form-label">Description</label>
      <textarea id="e-desc" class="form-textarea" rows="2">${item.description || ''}</textarea></div>`;
  }

  const tagsWrap = document.createElement('div');
  tagsWrap.className = 'form-group';
  tagsWrap.innerHTML = '<label class="form-label">Tags</label>';
  tagsWrap.appendChild(tagInput.el);
  body.appendChild(tagsWrap);
  body.appendChild(favBtn.el);

  editModal.querySelector('#edit-save').addEventListener('click', async () => {
    const saveBtn = editModal.querySelector('#edit-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const payload = {
        title:       body.querySelector('#e-title').value.trim(),
        url:         body.querySelector('#e-url')?.value.trim(),
        description: body.querySelector('#e-desc')?.value.trim(),
        content:     (body.querySelector('#e-code') || body.querySelector('#e-content'))?.value,
        language:    body.querySelector('#e-lang')?.value,
        tags:        tagInput.getTags(),
        isFavorite:  favBtn.getFav(),
      };
      await api.updateItem(item.id, payload);
      editOverlay.classList.add('hidden');
      onSaveCallback();
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════
   DETAIL MODAL
══════════════════════════════════════════════════════════════════════ */
const detailOverlay = document.getElementById('detail-overlay');
const detailModal   = document.getElementById('detail-modal');

export function openDetailModal(item) {
  buildDetailModal(item);
  detailOverlay.classList.remove('hidden');
}

function buildDetailModal(item) {
  const lang = (item.language || 'javascript').toLowerCase();
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const code = item.content || '';
  const highlighted = item.type === 'SNIPPET' && Prism.languages[lang]
    ? Prism.highlight(code, Prism.languages[lang], lang)
    : code;

  detailModal.innerHTML = `
    <div class="modal-header">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:10px;font-family:monospace;text-transform:uppercase;padding:2px 6px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted)">${item.type === 'SNIPPET' ? lang : item.type}</span>
          <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text-xmuted)">${icons.calendar} ${date}</span>
        </div>
        <div style="font-size:16px;font-weight:600;color:var(--text);line-height:1.3">${item.title}</div>
        ${item.description ? `<div style="font-size:12px;color:var(--text-muted);margin-top:3px">${item.description}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
        <button type="button" class="btn-icon" id="detail-edit" title="Edit">${icons.edit}</button>
        <button type="button" class="btn-icon" id="detail-close">${icons.x}</button>
      </div>
    </div>
    <div class="modal-body" style="gap:14px">
      ${item.type === 'BOOKMARK' ? `
        ${item.ogImage ? `<img src="${item.ogImage}" class="detail-og" onerror="this.classList.add('hidden')">` : ''}
        ${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer" class="detail-url">
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.url}</span>
          ${icons.link}
        </a>` : ''}` : ''}
      ${item.type === 'SNIPPET' ? `
        <div class="detail-code">
          <div class="detail-code-toolbar">
            <span>${lang}</span>
            <button type="button" class="copy-btn" id="detail-copy">${icons.copy} Copy Code</button>
          </div>
          <pre><code class="language-${lang}">${highlighted}</code></pre>
        </div>` : ''}
      ${item.type === 'NOTE' ? `
        <div class="detail-note">${marked(item.content || '*Empty note*')}</div>` : ''}
      ${item.tags?.length ? `
        <div>
          <div class="detail-tag-label">${icons.tag} Tags</div>
          <div class="detail-tags">${item.tags.map(t => `<button class="card-tag detail-tag">#${t}</button>`).join('')}</div>
        </div>` : ''}
    </div>`;

  const close = () => detailOverlay.classList.add('hidden');
  detailModal.querySelector('#detail-close').addEventListener('click', close);
  detailOverlay.addEventListener('click', (e) => { if (e.target === detailOverlay) close(); });
  detailModal.querySelector('#detail-edit').addEventListener('click', () => {
    close();
    openEditModal(item);
  });
  detailModal.querySelector('#detail-copy')?.addEventListener('click', (e) => {
    copyToClipboard(code, e.currentTarget);
  });
  detailModal.querySelectorAll('.detail-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      close();
      import('./app.js').then(({ filterByTag }) => filterByTag(btn.textContent.replace(/^#/, '')));
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════
   CMD+K COMMAND PALETTE
══════════════════════════════════════════════════════════════════════ */
const cmdOverlay = document.getElementById('cmd-overlay');
const cmdInput   = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');

let selectedIdx = 0;
let filteredItems = [];

export function openCommandMenu() {
  cmdInput.value = '';
  selectedIdx = 0;
  renderCmdResults('');
  cmdOverlay.classList.remove('hidden');
  setTimeout(() => cmdInput.focus(), 50);
}

export function closeCommandMenu() {
  cmdOverlay.classList.add('hidden');
}

function renderCmdResults(q) {
  const all = state.items;
  filteredItems = q
    ? all.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.url?.toLowerCase().includes(q) ||
        item.content?.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q)))
    : all;
  filteredItems = filteredItems.slice(0, 8);

  cmdResults.innerHTML = filteredItems.length === 0
    ? `<div style="padding:24px;text-align:center;font-size:12px;color:var(--text-muted)">No results found</div>`
    : filteredItems.map((item, i) => `
      <div class="cmd-result ${i === selectedIdx ? 'selected' : ''}" data-idx="${i}">
        <div class="cmd-result-icon">
          ${item.type === 'BOOKMARK' ? icons.bookmark : item.type === 'SNIPPET' ? icons.code : icons.note}
        </div>
        <div class="cmd-result-body">
          <div class="cmd-result-title">${item.title}</div>
          <div class="cmd-result-sub">${item.description || item.url || (item.content || '').slice(0, 50)}</div>
        </div>
        ${item.tags?.[0] ? `<span class="cmd-result-tag">#${item.tags[0]}</span>` : ''}
        ${icons.arrow}
      </div>`).join('');

  cmdResults.querySelectorAll('.cmd-result').forEach((el, i) => {
    el.addEventListener('mouseenter', () => { selectedIdx = i; updateSelection(); });
    el.addEventListener('click', () => {
      closeCommandMenu();
      openDetailModal(filteredItems[i]);
    });
  });
}

function updateSelection() {
  cmdResults.querySelectorAll('.cmd-result').forEach((el, i) => {
    el.classList.toggle('selected', i === selectedIdx);
  });
}

cmdInput?.addEventListener('input', () => {
  selectedIdx = 0;
  renderCmdResults(cmdInput.value.toLowerCase().trim());
});

cmdInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeCommandMenu(); return; }
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = (selectedIdx + 1) % (filteredItems.length || 1); updateSelection(); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); selectedIdx = (selectedIdx - 1 + filteredItems.length) % (filteredItems.length || 1); updateSelection(); }
  if (e.key === 'Enter' && filteredItems[selectedIdx]) {
    closeCommandMenu();
    openDetailModal(filteredItems[selectedIdx]);
  }
});

cmdOverlay?.addEventListener('click', (e) => { if (e.target === cmdOverlay) closeCommandMenu(); });

// Quick action buttons in command palette
document.querySelector('[data-cmd-bookmark]')?.addEventListener('click', () => { closeCommandMenu(); openAddModal('BOOKMARK'); });
document.querySelector('[data-cmd-snippet]')?.addEventListener('click',  () => { closeCommandMenu(); openAddModal('SNIPPET'); });
document.querySelector('[data-cmd-note]')?.addEventListener('click',     () => { closeCommandMenu(); openAddModal('NOTE'); });
document.querySelector('[data-cmd-theme]')?.addEventListener('click',    () => { import('./app.js').then(({ toggleTheme }) => { toggleTheme(); closeCommandMenu(); }); });
