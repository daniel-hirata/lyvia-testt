/* ═══════════════════════════════════════════════════════════
   LYVIA — ADMIN.JS
   ═══════════════════════════════════════════════════════════ */

let artworks = [];
let texts    = [];
let editingArtId  = null;
let editingTextId = null;

const titles = { artworks: 'Ilustrações', texts: 'Textos', site: 'Configurações do Site' };

// ── TABS ─────────────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.snav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.remove('hidden');
  document.querySelectorAll('.snav-btn').forEach(b => {
    if (b.getAttribute('onclick').includes(name)) b.classList.add('active');
  });
  document.getElementById('tabTitle').textContent = titles[name] || name;

  if (name === 'artworks') loadArtworks();
  if (name === 'texts')    loadTexts();
  if (name === 'site')     loadSiteSettings();
}

function setStatus(msg, ok=true) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.style.color = ok ? '#8b001a' : '#ff4444';
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// ── ARTWORKS ─────────────────────────────────────────────────
async function loadArtworks() {
  const res = await fetch('/api/admin/artworks');
  if (!res.ok) return;
  artworks = await res.json();
  renderArtworks();
}

function renderArtworks() {
  const list = document.getElementById('artworksList');
  if (artworks.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);font-size:0.7rem;padding:2rem 0">Nenhuma ilustração ainda.</div>';
    return;
  }
  list.innerHTML = artworks.map(a => `
    <div class="item-row">
      ${a.image_url ? `<img class="item-thumb" src="${esc(a.image_url)}" alt="">` : '<div class="item-thumb" style="background:#1a0008"></div>'}
      <div class="item-info">
        <div class="item-title">${esc(a.title)}</div>
        <div class="item-meta">${esc(a.description || '')} · ${a.created_at ? a.created_at.slice(0,10) : ''}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openArtModal('${esc(a.id)}')">Editar</button>
        <button class="btn-del"  onclick="deleteArtwork('${esc(a.id)}')">Del</button>
      </div>
    </div>
  `).join('');
}

function openArtModal(id=null) {
  editingArtId = id;
  document.getElementById('artModalTitle').textContent = id ? 'Editar Ilustração' : 'Nova Ilustração';
  document.getElementById('artId').value    = id || '';
  document.getElementById('artTitle').value = '';
  document.getElementById('artDesc').value  = '';
  document.getElementById('artUrl').value   = '';
  document.getElementById('artFile').value  = '';
  document.getElementById('artPreview').classList.add('hidden');

  if (id) {
    const a = artworks.find(x => x.id === id);
    if (a) {
      document.getElementById('artTitle').value = a.title || '';
      document.getElementById('artDesc').value  = a.description || '';
      document.getElementById('artUrl').value   = a.image_url || '';
      if (a.image_url) {
        const prev = document.getElementById('artPreview');
        prev.src = a.image_url;
        prev.classList.remove('hidden');
      }
    }
  }
  document.getElementById('artModal').classList.remove('hidden');
}

function previewArt(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById('artPreview');
      prev.src = e.target.result;
      prev.classList.remove('hidden');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function saveArtwork() {
  const id    = document.getElementById('artId').value;
  const title = document.getElementById('artTitle').value.trim();
  const desc  = document.getElementById('artDesc').value.trim();
  const url   = document.getElementById('artUrl').value.trim();
  const file  = document.getElementById('artFile').files[0];

  if (!title) { alert('Informe o título.'); return; }

  if (id) {
    // editing — only update fields, not re-upload file here for simplicity
    const body = { title, description: desc };
    if (url) body.image_url = url;
    const res = await fetch(`/api/admin/artworks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) { setStatus('Ilustração atualizada!'); closeModal('artModal'); loadArtworks(); }
    else setStatus('Erro ao atualizar.', false);
  } else {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', desc);
    if (file) fd.append('image', file);
    else if (url) fd.append('image_url', url);

    const res = await fetch('/api/admin/artworks', { method: 'POST', body: fd });
    if (res.ok) { setStatus('Ilustração adicionada!'); closeModal('artModal'); loadArtworks(); }
    else setStatus('Erro ao adicionar.', false);
  }
}

async function deleteArtwork(id) {
  if (!confirm('Remover esta ilustração?')) return;
  const res = await fetch(`/api/admin/artworks/${id}`, { method: 'DELETE' });
  if (res.ok) { setStatus('Removida!'); loadArtworks(); }
  else setStatus('Erro ao remover.', false);
}

// ── TEXTS ─────────────────────────────────────────────────────
async function loadTexts() {
  const res = await fetch('/api/admin/texts');
  if (!res.ok) return;
  texts = await res.json();
  renderTexts();
}

function renderTexts() {
  const list = document.getElementById('textsList');
  if (texts.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);font-size:0.7rem;padding:2rem 0">Nenhum texto ainda.</div>';
    return;
  }
  list.innerHTML = texts.map(t => `
    <div class="item-row">
      <div class="item-info">
        <div class="item-title">${esc(t.title)}</div>
        <div class="item-meta">${esc(t.tag || '')} · ${t.created_at ? t.created_at.slice(0,10) : ''}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openTextModal('${esc(t.id)}')">Editar</button>
        <button class="btn-del"  onclick="deleteText('${esc(t.id)}')">Del</button>
      </div>
    </div>
  `).join('');
}

function openTextModal(id=null) {
  editingTextId = id;
  document.getElementById('textModalTitle').textContent = id ? 'Editar Texto' : 'Novo Texto';
  document.getElementById('textId').value      = id || '';
  document.getElementById('textTitle').value   = '';
  document.getElementById('textContent').value = '';
  document.getElementById('textTag').value     = '#poesia';

  if (id) {
    const t = texts.find(x => x.id === id);
    if (t) {
      document.getElementById('textTitle').value   = t.title   || '';
      document.getElementById('textContent').value = t.content || '';
      document.getElementById('textTag').value     = t.tag     || '#poesia';
    }
  }
  document.getElementById('textModal').classList.remove('hidden');
}

async function saveText() {
  const id      = document.getElementById('textId').value;
  const title   = document.getElementById('textTitle').value.trim();
  const content = document.getElementById('textContent').value.trim();
  const tag     = document.getElementById('textTag').value.trim();

  if (!title || !content) { alert('Preencha título e conteúdo.'); return; }

  const method = id ? 'PUT' : 'POST';
  const url    = id ? `/api/admin/texts/${id}` : '/api/admin/texts';

  const res = await fetch(url, {
    method, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, tag })
  });
  if (res.ok) {
    setStatus(id ? 'Texto atualizado!' : 'Texto adicionado!');
    closeModal('textModal'); loadTexts();
  } else setStatus('Erro ao salvar.', false);
}

async function deleteText(id) {
  if (!confirm('Remover este texto?')) return;
  const res = await fetch(`/api/admin/texts/${id}`, { method: 'DELETE' });
  if (res.ok) { setStatus('Removido!'); loadTexts(); }
  else setStatus('Erro ao remover.', false);
}

// ── SITE SETTINGS ─────────────────────────────────────────────
async function loadSiteSettings() {
  const res = await fetch('/api/admin/site');
  if (!res.ok) return;
  const s = await res.json();
  document.getElementById('s_hero_title').value    = s.hero_title    || '';
  document.getElementById('s_hero_subtitle').value = s.hero_subtitle || '';
  document.getElementById('s_about_text').value    = s.about_text    || '';
  document.getElementById('s_instagram').value     = s.instagram     || '';
  document.getElementById('s_tiktok').value        = s.tiktok        || '';
  document.getElementById('s_pinterest').value     = s.pinterest     || '';
  document.getElementById('s_email').value         = s.email         || '';
}

async function saveSiteSettings() {
  const body = {
    hero_title:    document.getElementById('s_hero_title').value,
    hero_subtitle: document.getElementById('s_hero_subtitle').value,
    about_text:    document.getElementById('s_about_text').value,
    instagram:     document.getElementById('s_instagram').value,
    tiktok:        document.getElementById('s_tiktok').value,
    pinterest:     document.getElementById('s_pinterest').value,
    email:         document.getElementById('s_email').value,
  };
  const res = await fetch('/api/admin/site', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) setStatus('Configurações salvas!');
  else setStatus('Erro ao salvar.', false);
}

// ── MODAL ────────────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
  }
});

// ── UTILS ─────────────────────────────────────────────────────
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// INIT
loadArtworks();
