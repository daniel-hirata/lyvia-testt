/* ═══════════════════════════════════════════════════════════
   LYVIA — MAIN.JS
   ═══════════════════════════════════════════════════════════ */

// ── CURSOR ───────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursor-trail');
let mx=0, my=0, tx=0, ty=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animTrail() {
  tx += (mx - tx - 18) * 0.1;
  ty += (my - ty - 18) * 0.1;
  trail.style.left = tx + 'px';
  trail.style.top  = ty + 'px';
  requestAnimationFrame(animTrail);
})();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.transform='translate(-50%,-50%) scale(2.5)'; });
  el.addEventListener('mouseleave', () => { cursor.style.transform='translate(-50%,-50%) scale(1)'; });
});

// ── NAVBAR SCROLL ────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── PARTICLES ────────────────────────────────────────────────
const particleContainer = document.getElementById('particles');
if (particleContainer) {
  for (let i=0; i<18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random()*3+1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*15+10}s;
      animation-delay:${Math.random()*10}s;
    `;
    particleContainer.appendChild(p);
  }
}

// ── 3D HERO CARD TILT ────────────────────────────────────────
const heroCard = document.getElementById('heroCard');
if (heroCard) {
  document.addEventListener('mousemove', e => {
    const rect = heroCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (window.innerWidth  * 0.5);
    const dy = (e.clientY - cy) / (window.innerHeight * 0.5);
    heroCard.style.transform = `perspective(800px) rotateY(${dx*12}deg) rotateX(${-dy*8}deg)`;
    const bigL = document.querySelector('.hero-big-letter');
    if (bigL) bigL.style.transform = `translate(${dx*20}px, ${dy*10}px)`;
  });
}

// ── MUSIC ────────────────────────────────────────────────────
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('music-toggle');
let musicPlaying = false;

musicBtn && musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    music.pause();
    musicBtn.classList.remove('playing');
    musicBtn.querySelector('.music-label').textContent = 'MÚSICA';
  } else {
    music.play().catch(()=>{});
    musicBtn.classList.add('playing');
    musicBtn.querySelector('.music-label').textContent = 'TOCANDO';
  }
  musicPlaying = !musicPlaying;
});

// ── SCROLL REVEAL ────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // skill bars
      if (entry.target.classList.contains('about-right')) {
        document.querySelectorAll('.skill-bar').forEach((bar, i) => {
          setTimeout(() => {
            bar.querySelector('.skill-fill').style.width = bar.dataset.pct + '%';
          }, i * 120);
        });
      }

      // count-up
      if (entry.target.classList.contains('about-left')) {
        document.querySelectorAll('[data-target]').forEach(el => {
          const target = +el.dataset.target;
          let count = 0;
          const step = target / 40;
          const iv = setInterval(() => {
            count = Math.min(count + step, target);
            el.textContent = Math.round(count);
            if (count >= target) clearInterval(iv);
          }, 30);
        });
      }
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── CAT INTERACTION ──────────────────────────────────────────
const catContainer = document.getElementById('catContainer');
const catTongue    = document.getElementById('catTongue');
const catMenu      = document.getElementById('catMenu');
const btnTextos    = document.getElementById('btnTextos');
const btnIlustras  = document.getElementById('btnIlustras');
let catOpen = false;

catContainer && catContainer.addEventListener('click', () => {
  catOpen = !catOpen;
  catTongue.classList.toggle('show', catOpen);
  catMenu.classList.toggle('open', catOpen);
});

btnTextos && btnTextos.addEventListener('click', e => {
  e.stopPropagation();
  showSection('textos');
});
btnIlustras && btnIlustras.addEventListener('click', e => {
  e.stopPropagation();
  showSection('ilustras');
});

function showSection(which) {
  catOpen = false;
  catTongue.classList.remove('show');
  catMenu.classList.remove('open');

  document.getElementById('textosSection').classList.add('hidden');
  document.getElementById('ilustrasSection').classList.add('hidden');

  const section = which === 'textos'
    ? document.getElementById('textosSection')
    : document.getElementById('ilustrasSection');

  section.classList.remove('hidden');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeSection() {
  document.getElementById('textosSection').classList.add('hidden');
  document.getElementById('ilustrasSection').classList.add('hidden');
  document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
}

// ── LOAD CONTENT ─────────────────────────────────────────────
async function loadContent() {
  try {
    const res  = await fetch('/api/content');
    const data = await res.json();

    // update site settings
    if (data.site) {
      const s = data.site;
      if (document.getElementById('heroTitle'))    document.getElementById('heroTitle').textContent = s.hero_title || 'LYVIA';
      if (document.getElementById('heroSubtitle')) document.getElementById('heroSubtitle').textContent = s.hero_subtitle || '';
      if (document.getElementById('aboutText'))    document.getElementById('aboutText').textContent = s.about_text || '';
      if (document.getElementById('contactEmail')) {
        const el = document.getElementById('contactEmail');
        el.textContent = s.email || 'lyvia@arte.com';
        el.href = 'mailto:' + (s.email || 'lyvia@arte.com');
      }
      if (s.instagram && document.getElementById('socialIG')) document.getElementById('socialIG').href = s.instagram;
      if (s.tiktok    && document.getElementById('socialTT')) document.getElementById('socialTT').href = s.tiktok;
      if (s.pinterest && document.getElementById('socialPT')) document.getElementById('socialPT').href = s.pinterest;
    }

    // render texts
    const textsGrid = document.getElementById('textsGrid');
    if (textsGrid && data.texts && data.texts.length > 0) {
      textsGrid.innerHTML = data.texts.map(t => `
        <article class="text-card">
          <h3 class="text-card-title">${escHtml(t.title)}</h3>
          <p class="text-card-body">${escHtml(t.content)}</p>
          <span class="text-card-tag">${escHtml(t.tag || '')}</span>
        </article>
      `).join('');
    }

    // render artworks
    const artsGrid = document.getElementById('artsGrid');
    if (artsGrid && data.artworks && data.artworks.length > 0) {
      artsGrid.innerHTML = data.artworks.map(a => `
        <div class="art-card" onclick="openLightbox('${escAttr(a.image_url)}','${escAttr(a.title)}','${escAttr(a.description||'')}')">
          <img src="${escAttr(a.image_url)}" alt="${escAttr(a.title)}" loading="lazy">
          <div class="art-card-info">
            <div class="art-card-title">${escHtml(a.title)}</div>
            <div class="art-card-desc">${escHtml(a.description || '')}</div>
          </div>
        </div>
      `).join('');
    }
  } catch(e) { console.error('loadContent error', e); }
}

// ── LIGHTBOX ─────────────────────────────────────────────────
function openLightbox(src, title, desc) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxTitle').textContent = title;
  document.getElementById('lightboxDesc').textContent = desc;
  document.getElementById('lightbox').classList.remove('hidden');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.getElementById('lightboxImg').src = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ── UTILS ─────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s) {
  return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// INIT
loadContent();
