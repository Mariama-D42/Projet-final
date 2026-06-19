/* =============================================
   CinéScope — Application Logic
   API : The Movie Database (TMDB) — v3
   ============================================= */

// ── CONFIG ──────────────────────────────────
// Note : Si l'écran affiche une erreur de chargement, c'est que cette clé de démo est invalide/expirée.
// Remplace-la par ta propre clé API générée sur le site de TMDB !
const API_KEY  = 'c63cf6f3fdbe9780fdfd5515a42aab46'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL  = 'https://image.tmdb.org/t/p';

const GENRE_NAMES = {
  28:'Action', 12:'Aventure', 16:'Animation', 35:'Comédie',
  80:'Crime', 99:'Documentaire', 18:'Drame', 10751:'Famille',
  14:'Fantaisie', 36:'Histoire', 27:'Horreur', 10402:'Musique',
  9648:'Mystère', 10749:'Romance', 878:'Science-Fiction',
  10770:'Téléfilm', 53:'Thriller', 10752:'Guerre', 37:'Western'
};

const SECTION_TITLES = {
  popular:    'Films Populaires',
  top_rated:  'Top Films',
  upcoming:   'Prochainement',
  now_playing: 'En Salle'
};

// ── STATE ────────────────────────────────────
let state = {
  category:    'popular',
  genre:       '',
  page:        1,
  totalPages:  1,
  movies:      [],
  searchQuery: '',
  searchMode:  false,
};

// ── DOM ──────────────────────────────────────
const grid         = document.getElementById('moviesGrid');
const loader       = document.getElementById('loader');
const loadMoreWrap = document.getElementById('loadMoreWrap');
const loadMoreBtn  = document.getElementById('loadMoreBtn');
const sectionTitle = document.getElementById('sectionTitle');
const sectionCount = document.getElementById('sectionCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose   = document.getElementById('modalClose');
const searchInput  = document.getElementById('searchInput');
const stripTrack   = document.getElementById('stripTrack');

// ── FETCH ────────────────────────────────────
async function fetchMovies(page = 1, reset = true) {
  setLoading(true);
  if (reset) {
    state.page = 1;
    state.movies = [];
    clearGrid();
  }

  try {
    let url;
    
    if (state.searchMode && state.searchQuery) {
      // 1. Mode Recherche
      url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(state.searchQuery)}&page=${page}&include_adult=false`;
    } else if (state.genre) {
      // 2. Mode Filtre par Genre (Oblige l'utilisation de /discover/movie)
      url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=fr-FR&page=${page}&with_genres=${state.genre}&sort_by=popularity.desc`;
    } else {
      // 3. Mode Catégorie Classique (popular, upcoming, etc.)
      url = `${BASE_URL}/movie/${state.category}?api_key=${API_KEY}&language=fr-FR&page=${page}`;
    }

    const res = await fetch(url);

    // Vérifie si la réponse HTTP est correcte (ex: bloque l'erreur 401 si clé API invalide)
    if (!res.ok) {
      throw new Error(`Erreur API TMDB : Statut ${res.status}`);
    }

    const data = await res.json();

    state.totalPages = data.total_pages || 1;
    state.page       = page;

    const newMovies = data.results || [];
    state.movies    = reset ? newMovies : [...state.movies, ...newMovies];

    renderMovies(newMovies, reset);
    updateCount(data.total_results);
    toggleLoadMore();
    buildFilmStrip(newMovies);
  } catch (err) {
    showError();
    console.error("Le chargement a échoué :", err);
  } finally {
    setLoading(false);
  }
}

async function fetchDetails(movieId) {
  try {
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`),
      fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=fr-FR`)
    ]);

    if (!detailsRes.ok || !creditsRes.ok) throw new Error("Erreur de récupération des détails");

    const details = await detailsRes.json();
    const credits = await creditsRes.json();
    
    return { details, credits };
  } catch { return null; }
}

// ── RENDER ───────────────────────────────────
function renderMovies(movies, reset) {
  if (!movies.length && reset) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="emoji">🎬</span>
        <p>Aucun film trouvé pour cette recherche.</p>
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  movies.forEach(movie => {
    const card = createCard(movie);
    fragment.appendChild(card);
  });
  if (reset) grid.innerHTML = '';
  grid.appendChild(fragment);
}

function createCard(movie) {
  const card   = document.createElement('div');
  card.className = 'movie-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', movie.title);

  const posterPath = movie.poster_path
    ? `${IMG_URL}/w342${movie.poster_path}`
    : null;

  const year  = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const score = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const votes = movie.vote_count   ? `${(movie.vote_count / 1000).toFixed(1)}k votes` : '';

  // Badge popularité
  const badge = movie.vote_average >= 8
    ? '<span class="card-badge">★ Coup de cœur</span>'
    : movie.release_date >= new Date().toISOString().slice(0,10)
      ? '<span class="card-badge">À venir</span>'
      : '';

  card.innerHTML = `
    ${badge}
    ${posterPath
      ? `<img class="card-poster" src="${posterPath}" alt="${escHtml(movie.title)}" loading="lazy"/>`
      : `<div class="card-poster-placeholder">🎬<span>Aucune image</span></div>`
    }
    <div class="card-body">
      <div class="card-rating">
        <span class="rating-star">★</span>
        <span class="rating-score">${score}</span>
        <span class="rating-count">${votes}</span>
      </div>
      <div class="card-title">${escHtml(movie.title)}</div>
      <div class="card-year">${year}</div>
    </div>
  `;

  // Spotlight mouse effect
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${((e.clientY - r.top)  / r.height * 100).toFixed(1)}%`);
  });

  card.addEventListener('click', () => openModal(movie.id));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(movie.id); });

  return card;
}

// ── FILM STRIP (hero) ────────────────────────
function buildFilmStrip(movies) {
  if (stripTrack.children.length > 10) return; // déjà construit
  const posters = movies.filter(m => m.backdrop_path).slice(0, 10);
  if (!posters.length) return;

  // Dupliquer pour boucle infinie
  const all = [...posters, ...posters];
  stripTrack.innerHTML = '';
  all.forEach(m => {
    const frame = document.createElement('div');
    frame.className = 'strip-frame';
    const img = document.createElement('img');
    img.src = `${IMG_URL}/w500${m.backdrop_path}`;
    img.alt = '';
    img.loading = 'lazy';
    frame.appendChild(img);
    stripTrack.appendChild(frame);
  });
}

// ── MODAL ────────────────────────────────────
async function openModal(id) {
  modalOverlay.setAttribute('aria-hidden', 'false');
  modalOverlay.classList.add('open');
  modalContent.innerHTML = `<div class="loader" style="padding:60px 0"><div class="reel"><div class="reel-hole"></div><div class="reel-hole"></div><div class="reel-hole"></div></div><p>Chargement…</p></div>`;

  document.body.style.overflow = 'hidden';
  modalClose.focus();

  const result = await fetchDetails(id);
  if (!result) {
    modalContent.innerHTML = `<p style="padding:40px;color:var(--muted)">Impossible de charger les détails.</p>`;
    return;
  }

  const { details: d, credits: c } = result;

  const backdropHTML = d.backdrop_path
    ? `<img class="modal-backdrop" src="${IMG_URL}/w1280${d.backdrop_path}" alt="" loading="lazy"/>`
    : `<div class="modal-backdrop-placeholder">🎬</div>`;

  const posterHTML = d.poster_path
    ? `<img src="${IMG_URL}/w342${d.poster_path}" alt="${escHtml(d.title)}" style="width:100%;display:block;border-radius:8px;"/>`
    : `<div style="width:100%;aspect-ratio:2/3;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:32px;border-radius:8px;">🎬</div>`;

  const genres = (d.genres || []).map(g => `<span class="genre-tag">${escHtml(g.name)}</span>`).join('');
  const runtime = d.runtime ? `${Math.floor(d.runtime / 60)}h${(d.runtime % 60).toString().padStart(2,'0')}` : '—';
  const year    = d.release_date ? d.release_date.slice(0,4) : '—';
  const score   = d.vote_average ? d.vote_average.toFixed(1) : 'N/A';

  const director = (c.crew || []).find(p => p.job === 'Director');
  const cast      = (c.cast || []).slice(0, 5).map(p => p.name).join(', ');

  modalContent.innerHTML = `
    ${backdropHTML}
    <div class="modal-body">
      <div class="modal-poster">${posterHTML}</div>
      <div class="modal-info">
        <h2 class="modal-title">${escHtml(d.title)}</h2>
        ${d.tagline ? `<p style="font-style:italic;color:var(--muted);font-size:13px;margin-bottom:12px;">"${escHtml(d.tagline)}"</p>` : ''}
        <div class="modal-score">
          <span class="star">★</span>
          <span class="score">${score}</span>
          <span class="total">/10</span>
        </div>
        <div class="modal-meta">
          <span class="meta-item">📅 <strong>${year}</strong></span>
          <span class="meta-item">⏱ <strong>${runtime}</strong></span>
          ${director ? `<span class="meta-item">🎬 <strong>${escHtml(director.name)}</strong></span>` : ''}
          ${d.original_language ? `<span class="meta-item">🌐 <strong>${d.original_language.toUpperCase()}</strong></span>` : ''}
        </div>
        <div class="modal-genres">${genres}</div>
        ${cast ? `<p style="font-size:12px;color:var(--muted);margin-bottom:16px;">🎭 ${escHtml(cast)}</p>` : ''}
        <div class="modal-overview">
          <strong>Synopsis</strong>
          ${escHtml(d.overview || 'Aucun synopsis disponible.')}
        </div>
      </div>
    </div>
  `;
}

function closeModal() {
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ── UI HELPERS ───────────────────────────────
function setLoading(on) {
  loader.style.display = on ? 'flex' : 'none';
  loadMoreWrap.style.display = on ? 'none' : (loadMoreWrap.style.display === 'none' ? 'none' : 'block');
}

function clearGrid() {
  grid.innerHTML = '';
}

function toggleLoadMore() {
  const show = state.page < state.totalPages;
  loadMoreWrap.style.display = show ? 'block' : 'none';
}

function updateCount(total) {
  if (total) sectionCount.textContent = `${total.toLocaleString('fr-FR')} films`;
  else sectionCount.textContent = '';
}

function showError() {
  grid.innerHTML = `
    <div class="empty-state">
      <span class="emoji">⚠️</span>
      <p>Erreur de chargement. Vérifiez votre connexion ou votre clé API.</p>
    </div>`;
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── EVENTS ───────────────────────────────────

// Nav category buttons
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.category   = btn.dataset.category;
    state.searchMode = false;
    searchInput.value = '';
    sectionTitle.textContent = SECTION_TITLES[state.category] || 'Films';
    resetGenreFilter();
    fetchMovies(1, true);
  });
});

// Genre filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.genre = btn.dataset.genre;
    fetchMovies(1, true);
  });
});

// Load more
loadMoreBtn.addEventListener('click', () => {
  fetchMovies(state.page + 1, false);
});

// Modal close
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Search
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = searchInput.value.trim();
  searchTimer = setTimeout(() => {
    if (q.length > 1) {
      state.searchMode  = true;
      state.searchQuery = q;
      sectionTitle.textContent = `Résultats pour "${q}"`;
      resetGenreFilter();
      fetchMovies(1, true);
    } else if (!q) {
      state.searchMode = false;
      sectionTitle.textContent = SECTION_TITLES[state.category];
      fetchMovies(1, true);
    }
  }, 420);
});

function resetGenreFilter() {
  state.genre = '';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-genre=""]').classList.add('active');
}

// ── INIT ─────────────────────────────────────
fetchMovies(1, true);