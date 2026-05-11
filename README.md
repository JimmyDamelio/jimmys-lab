# Jimmy's Lab

Application web locale d'apprentissage des reseaux informatiques, du niveau debutant a une pratique pentest encadree.

## Lancer le projet

```bash
npm run install:all
npm run dev
```

Le backend Express ecoute sur `http://localhost:4000` et sert automatiquement le frontend Vite sur `http://localhost:5173` en mode developpement.

## Fonctionnalites

- Parcours progressif: fondamentaux, adressage, routage, services, securite, pentest ethique.
- Lecons structurees avec objectifs, theorie, commandes, exercices et ressources.
- Quiz interactifs avec scoring local.
- Visualisation D3 des topologies reseau.
- Diagrammes Mermaid pour les flux et modeles.
- Lab pratique avec Monaco Editor et terminal xterm.js simule.
- Persistance SQLite locale pour progression, notes et resultats de quiz.
- Export JSON de progression via `http://localhost:4000/api/progress/export`.

## Structure

```text
jimmys-lab/
  frontend/   React + TypeScript + Tailwind + Vite
  backend/    Node.js + Express + SQLite
```

## Notes de securite

Les exercices pentest sont des simulations locales et doivent rester dans un cadre autorise. L'application ne lance pas d'outils offensifs reels contre des systemes externes.
