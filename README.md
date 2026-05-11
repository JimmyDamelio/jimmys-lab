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

## Git et GitHub

Le projet est publie ici:

```text
https://github.com/JimmyDamelio/jimmys-lab
```

Dans cet environnement, le dossier `.git` classique est reserve en lecture seule. Le depot Git local utilise donc `.git-store` comme repertoire Git alternatif.

Utilise cette forme pour les commandes Git:

```bash
git --git-dir=.git-store --work-tree=. status
git --git-dir=.git-store --work-tree=. log --oneline
git --git-dir=.git-store --work-tree=. diff
```

Pour enregistrer une modification:

```bash
git --git-dir=.git-store --work-tree=. add .
git --git-dir=.git-store --work-tree=. commit -m "Description courte du changement"
```

Pour pousser vers GitHub avec la cle SSH locale dediee:

```bash
GIT_SSH_COMMAND='ssh -F /dev/null -i ~/.ssh/id_ed25519_github -o IdentitiesOnly=yes' git --git-dir=.git-store --work-tree=. push
```

Le remote configure est:

```text
git@github.com:JimmyDamelio/jimmys-lab.git
```

Les fichiers lourds ou locaux sont ignores par `.gitignore`, notamment `node_modules/`, `frontend/dist/`, la base SQLite locale, les fichiers `.env` et les fichiers TypeScript generes.

## Notes de securite

Les exercices pentest sont des simulations locales et doivent rester dans un cadre autorise. L'application ne lance pas d'outils offensifs reels contre des systemes externes.
