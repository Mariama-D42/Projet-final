# 🎬 CinéScope

CinéScope est une application web front-end permettant de découvrir, rechercher et explorer des milliers de films en utilisant l'API de The Movie Database (TMDB). 

L'interface est conçue pour être moderne, réactive (responsive) et intuitive, offrant une expérience fluide inspirée des grandes plateformes de streaming.

---

## ✨ Fonctionnalités

* **Exploration par catégories** : Parcourez les films Populaires, les Mieux Notés (Top Rated), À venir, et En salle.
* **Filtres par genres** : Affinez votre recherche en un clic (Action, Comédie, Horreur, Sci-Fi, etc.).
* **Recherche instantanée** : Barre de recherche dynamique avec un délai (debounce) pour trouver des films par leur titre.
* **Modale de détails** : Cliquez sur un film pour afficher sa bande-annonce visuelle (backdrop), son synopsis complet, son casting, son réalisateur, sa durée et sa note globale.
* **Pagination (Voir plus)** : Chargez facilement la suite des résultats de votre recherche ou de votre catégorie.
* **Design "Dark Mode" natif** : Interface élégante avec effets de survol au format "Spotlight".

---

## 🛠️ Technologies Utilisées

Ce projet est construit de manière légère et sans dépendances lourdes (Vanilla) :

* **HTML5** : Structure sémantique.
* **CSS3** : Variables CSS, Flexbox, CSS Grid, animations fluides et responsive design.
* **JavaScript (ES6+)** : Manipulation du DOM, gestion de l'état local (State), requêtes asynchrones (`Fetch`, `Async/Await`).
* **API** : [The Movie Database (TMDB) API v3](https://developer.themoviedb.org/docs)

---

## 🚀 Installation & Lancement

Le projet ne nécessite ni serveur complexe ni bundler (comme Webpack ou Vite) pour fonctionner.

### 1. Cloner ou télécharger le projet
Récupérez les trois fichiers essentiels : `index.html`, `style.css` et `app.js` dans le même dossier.

### 2. Obtenir