import { useEffect, useState } from "react";

import "./App.css";

const IMG_URL = "https://image.tmdb.org/t/p";

const SECTION_TITLES = {

  popular: "Films Populaires",

  top_rated: "Top Films",

  upcoming: "Prochainement",

  now_playing: "En Salle",

};

const GENRES = [

  ["", "Tous"],

  ["28", "Action"],

  ["35", "Comédie"],

  ["18", "Drame"],

  ["27", "Horreur"],

  ["878", "Sci-Fi"],

  ["10749", "Romance"],

  ["16", "Animation"],

];

function App() {

  const [category, setCategory] = useState("popular");

  const [genre, setGenre] = useState("");

  const [movies, setMovies] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState(null);

  // ================= CHARGER LES FILMS =================

  async function loadMovies() {

    setLoading(true);

    try {

      let url;

      if (search.trim()) {

        url = `/api/search?query=${encodeURIComponent(search)}`;

      } else if (genre) {

        url = `/api/genre/${genre}`;

      } else {

        url = `/api/movies/${category}`;

      }

      const response = await fetch(url);

      if (!response.ok) {

        throw new Error("Erreur serveur");

      }

      const data = await response.json();

      setMovies(data.results || []);

    } catch (error) {

      console.error("Erreur :", error);

      setMovies([]);

    } finally {

      setLoading(false);

    }

  }

  // ================= DETAILS FILM =================

  async function showMovieDetails(id) {

    try {

      const response = await fetch(`/api/movies/details/${id}`);

      if (!response.ok) {

        throw new Error("Erreur lors du chargement");

      }

      const data = await response.json();

      setSelectedMovie(data);

    } catch (error) {

      console.error("Erreur :", error);

    }

  }

  // ================= CHARGEMENT =================

  useEffect(() => {

    loadMovies();

  }, [category, genre]);

  // ================= RECHERCHE =================

  function handleSearch(event) {

    if (event.key === "Enter") {

      loadMovies();

    }

  }

  return (

    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="header-inner">

          <div className="logo">

            <span className="logo-icon">🎬</span>

            <span className="logo-text">CinéScope</span>

          </div>

          <nav className="nav">

            {Object.keys(SECTION_TITLES).map((item) => (

              <button

                key={item}

                className={`nav-btn ${

                  category === item && !search ? "active" : ""

                }`}

                onClick={() => {

                  setCategory(item);

                  setGenre("");

                  setSearch("");

                }}

              >

                {item === "popular" && "Populaires"}

                {item === "top_rated" && "Top Rated"}

                {item === "upcoming" && "À venir"}

                {item === "now_playing" && "En salle"}

              </button>

            ))}

          </nav>

          <div className="search-wrap">

            <input

              type="text"

              className="search-input"

              placeholder="Rechercher un film…"

              value={search}

              onChange={(e) => setSearch(e.target.value)}

              onKeyDown={handleSearch}

            />

            <span className="search-icon">⌕</span>

          </div>

        </div>

      </header>

      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-content">

          <p className="hero-eyebrow">

            Votre univers cinéma

          </p>

          <h1 className="hero-title">

            Explorez

            <br />

            le 7<sup>e</sup> art

          </h1>

          <p className="hero-sub">

            Des milliers de films, des critiques, des tendances —

            tout en un seul regard.

          </p>

        </div>

        <div className="hero-gradient"></div>

      </section>

      {/* ================= MAIN ================= */}

      <main className="main">

        <div className="section-header">

          <h2 className="section-title">

            {search

              ? `Résultats pour "${search}"`

              : SECTION_TITLES[category]}

          </h2>

          <p className="section-count">

            {movies.length > 0

              ? `${movies.length} films`

              : ""}

          </p>

        </div>

        {/* ================= FILTRES ================= */}

        <div className="filters">

          {GENRES.map(([id, name]) => (

            <button

              key={id}

              className={`filter-btn ${

                genre === id ? "active" : ""

              }`}

              onClick={() => {

                setGenre(id);

                setSearch("");

              }}

            >

              {name}

            </button>

          ))}

        </div>

        {/* ================= CHARGEMENT ================= */}

        {loading && (

          <div className="loader">

            <div className="reel">

              <div className="reel-hole"></div>

              <div className="reel-hole"></div>

              <div className="reel-hole"></div>

            </div>

            <p>Chargement…</p>

          </div>

        )}

        {/* ================= FILMS ================= */}

        {!loading && (

          <div className="movies-grid">

            {movies.length === 0 ? (

              <div className="empty-state">

                <span className="emoji">🎬</span>

                <p>Aucun film trouvé.</p>

              </div>

            ) : (

              movies.map((movie) => {

                const poster = movie.poster_path

                  ? `${IMG_URL}/w342${movie.poster_path}`

                  : null;

                const year = movie.release_date

                  ? movie.release_date.slice(0, 4)

                  : "—";

                const score = movie.vote_average

                  ? movie.vote_average.toFixed(1)

                  : "N/A";

                return (

                  <div

                    className="movie-card"

                    key={movie.id}

                    onClick={() => showMovieDetails(movie.id)}

                  >

                    {movie.vote_average >= 8 && (

                      <span className="card-badge">

                        ★ Coup de cœur

                      </span>

                    )}

                    {poster ? (

                      <img

                        className="card-poster"

                        src={poster}

                        alt={movie.title}

                        loading="lazy"

                      />

                    ) : (

                      <div className="card-poster-placeholder">

                        🎬

                        <span>Aucune image</span>

                      </div>

                    )}

                    <div className="card-body">

                      <div className="card-rating">

                        <span className="rating-star">

                          ★

                        </span>

                        <span className="rating-score">

                          {score}

                        </span>

                      </div>

                      <div className="card-title">

                        {movie.title}

                      </div>

                      <div className="card-year">

                        {year}

                      </div>

                    </div>

                  </div>

                );

              })

            )}

          </div>

        )}

      </main>
      {/* ================= MODAL ================= */}

      {selectedMovie && (

        <div

          className="modal-overlay open"

          onClick={(e) => {

            if (e.target === e.currentTarget) {

              setSelectedMovie(null);

            }

          }}

        >

          <div className="modal">

            {/* BOUTON FERMER */}

            <button

              className="modal-close"

              onClick={() => setSelectedMovie(null)}

            >

              ✕

            </button>

            <div className="modal-content">

              {/* IMAGE DE FOND */}

              {selectedMovie.details?.backdrop_path && (

                <img

                  className="modal-backdrop"

                  src={`${IMG_URL}/w1280${selectedMovie.details.backdrop_path}`}

                  alt=""

                />

              )}

              <div className="modal-body">

                {/* POSTER DU FILM */}

                <div className="modal-poster">

                  {selectedMovie.details?.poster_path && (

                    <img

                      src={`${IMG_URL}/w342${selectedMovie.details.poster_path}`}

                      alt={selectedMovie.details.title}

                    />

                  )}

                </div>

                {/* INFORMATIONS DU FILM */}

                <div className="modal-info">

                  <h2 className="modal-title">

                    {selectedMovie.details?.title}

                  </h2>

                  {/* NOTE */}

                  <div className="modal-score">

                    ⭐{" "}

                    {selectedMovie.details?.vote_average

                      ? selectedMovie.details.vote_average.toFixed(1)

                      : "N/A"}

                    /10

                  </div>

                  {/* ANNÉE */}

                  <p>

                    📅{" "}

                    {selectedMovie.details?.release_date

                      ? selectedMovie.details.release_date.slice(0, 4)

                      : "—"}

                  </p>

                  {/* GENRES */}

                  <div className="modal-genres">

                    {selectedMovie.details?.genres?.map((g) => (

                      <span

                        className="genre-tag"

                        key={g.id}

                      >

                        {g.name}

                      </span>

                    ))}

                  </div>

                  {/* SYNOPSIS */}

                  <div className="modal-overview">

                    <strong>

                      Synopsis

                    </strong>

                    <p>

                      {selectedMovie.details?.overview ||

                        "Aucun synopsis disponible."}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <p>

          Données fournies par{" "}

          <a

            href="https://www.themoviedb.org"

            target="_blank"

            rel="noopener noreferrer"

          >

            TMDB

          </a>

          {" "}· CinéScope ©️ 2025

        </p>

      </footer>

    </div>

  );

}

export default App;