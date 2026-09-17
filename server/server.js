const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());

// MongoDB

mongoose

  .connect(process.env.MONGO_URI)

  .then(() => console.log("MongoDB connecté"))

  .catch((error) => console.log("Erreur MongoDB :", error));

// Route de test

app.get("/", (req, res) => {

  res.json({

    message: "Bienvenue sur l'API Cinéscope 🎬",

  });

});

// Configuration TMDB

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const TMDB_URL = "https://api.themoviedb.org/3";

// Films par catégorie

app.get("/api/movies/:category", async (req, res) => {

  try {

    const { category } = req.params;

    const page = req.query.page || 1;

    const allowedCategories = [

      "popular",

      "top_rated",

      "upcoming",

      "now_playing",

    ];

    if (!allowedCategories.includes(category)) {

      return res.status(400).json({

        message: "Catégorie invalide",

      });

    }

    const url =

      `${TMDB_URL}/movie/${category}` +

      `?api_key=${TMDB_API_KEY}` +

      `&language=fr-FR` +

      `&page=${page}`;

    const response = await fetch(url);

    if (!response.ok) {

      throw new Error(`TMDB erreur ${response.status}`);

    }

    const data = await response.json();

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Erreur lors du chargement des films",

    });

  }

});

// Recherche de films

app.get("/api/search", async (req, res) => {

  try {

    const query = req.query.query;

    const page = req.query.page || 1;

    if (!query) {

      return res.status(400).json({

        message: "Recherche vide",

      });

    }

    const url =

      `${TMDB_URL}/search/movie` +

      `?api_key=${TMDB_API_KEY}` +

      `&language=fr-FR` +

      `&query=${encodeURIComponent(query)}` +

      `&page=${page}` +

      `&include_adult=false`;

    const response = await fetch(url);

    if (!response.ok) {

      throw new Error(`TMDB erreur ${response.status}`);

    }

    const data = await response.json();

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Erreur lors de la recherche",

    });

  }

});

// Films par genre

app.get("/api/genre/:genre", async (req, res) => {

  try {

    const { genre } = req.params;

    const page = req.query.page || 1;

    const url =

      `${TMDB_URL}/discover/movie` +

      `?api_key=${TMDB_API_KEY}` +

      `&language=fr-FR` +

      `&page=${page}` +

      `&with_genres=${genre}` +

      `&sort_by=popularity.desc`;

    const response = await fetch(url);

    if (!response.ok) {

      throw new Error(`TMDB erreur ${response.status}`);

    }

    const data = await response.json();

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Erreur lors du chargement du genre",

    });

  }

});

// Détails d'un film

app.get("/api/movies/details/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const detailsUrl =

      `${TMDB_URL}/movie/${id}` +

      `?api_key=${TMDB_API_KEY}` +

      `&language=fr-FR`;

    const creditsUrl =

      `${TMDB_URL}/movie/${id}/credits` +

      `?api_key=${TMDB_API_KEY}` +

      `&language=fr-FR`;

    const [detailsResponse, creditsResponse] = await Promise.all([

      fetch(detailsUrl),

      fetch(creditsUrl),

    ]);

    if (!detailsResponse.ok || !creditsResponse.ok) {

      throw new Error("Erreur TMDB");

    }

    const details = await detailsResponse.json();

    const credits = await creditsResponse.json();

    res.json({

      details,

      credits,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Erreur lors du chargement des détails",

    });

  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Serveur démarré sur le port ${PORT}`);

});