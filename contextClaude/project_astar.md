---
name: Projet Algo A Star
description: Session d'apprentissage pathfinding — état d'avancement et fichiers produits
type: project
---

Projet d'apprentissage du pathfinding en JavaScript vanilla avec visualisation HTML/CSS (divs, pas canvas).
Dossier : d:\Projet_Dev_Yoann\Javascript\Algo_A_Star\

## Structure
```
src/
  script/
    Entity/       → Node.js, PriorityQueue.js
    algorithms/   → aStar.js, dijkstra.js, bfs.js, greedy.js, heuristique.js,
                     biDirectionalAStar.js, biDirectionalAStarOpti.js,
                     biDirectionalDijkstra.js, biDirectionalDijkstraOpti.js
    functions/    → functions.js
    script.js
  style/
    style.css
documentation/    → tous les .md pédagogiques
contextClaude/    → mémoire Claude
index.html
```

## Fichiers produits
- src/script/Entity/Node.js — classe Node (x, y, difficulty, g, h, f, isWall, parent)
- src/script/Entity/PriorityQueue.js — tas binaire min-heap avec lazy deletion + peek()
- src/script/functions/functions.js — createGrid, renderGrid, colorCell, sleep, resetPartial, resetTotal, algoLauncher, buildPath
- src/script/algorithms/heuristique.js — distanceManhattan, distanceChebyshev, distanceEuclidienne, distanceOctile
- src/script/algorithms/aStar.js — algorithme A* async avec PriorityQueue
- src/script/algorithms/dijkstra.js — algorithme Dijkstra async
- src/script/algorithms/bfs.js — algorithme BFS async (FIFO, sans g/h/f)
- src/script/algorithms/greedy.js — algorithme Greedy async (f = h uniquement)
- src/script/algorithms/biDirectionalAStar.js — A* bidirectionnel simplifié (arrêt à la première rencontre)
- src/script/algorithms/biDirectionalAStarOpti.js — A* bidirectionnel optimal (bestCost/bestMeeting, condition d'arrêt via peek())
- src/script/algorithms/biDirectionalDijkstra.js — Dijkstra bidirectionnel simplifié
- src/script/algorithms/biDirectionalDijkstraOpti.js — Dijkstra bidirectionnel optimal (bestCost/bestMeeting, condition d'arrêt exacte via g réels)
- src/script/script.js — point d'entrée, grille 20x20, start/end, listeners, panel de contrôle
- index.html — interface avec aside de contrôle (boutons, selects, checkboxes)
- documentation/pathfinding.md — guide pédagogique complet (14 sections)
- documentation/labyrinthGenerator.md — génération de labyrinthes (DFS, Prim, Kruskal...)
- documentation/dungeonGenerator.md — génération de donjons (BSP, Delaunay+MST, Cellular Automata, WFC)
- documentation/panelAdmin.md — documentation de l'implémentation du panel de contrôle

## Ce qui a été couvert
- A* complet (Node, grille, heuristiques, PQ, lazy deletion, async animation)
- Dijkstra, BFS, Greedy — implémentés et animés
- Priority Queue (tas binaire, bubble up, sink down)
- Heuristiques : Manhattan, Chebyshev, Euclidienne, Octile
- Terrain avec difficulté variable (difficulty par node)
- Admissibilité des heuristiques
- Choix de structure : tableau vs Set vs PQ
- Génération de labyrinthes (DFS) et donjons (BSP, etc.) — théorie documentée
- Bidirectionnel (principe général) — applicable à tout algo, combinaisons cohérentes vs problématiques
- A* Bidirectionnel simplifié — deux fronts (Forward bleu, Backward corail), Maps séparées pour g/parents, fusion via buildPath()
- A* Bidirectionnel optimal — même principe + bestCost/bestMeeting, condition d'arrêt via peek() (f figé, conservative mais correcte)
- Dijkstra Bidirectionnel simplifié et optimal — version optimale : condition d'arrêt exacte via g réels (pas de peek() nécessaire)
- peek() ajouté à PriorityQueue — retourne le f minimum sans pop, Infinity si vide
- Pourquoi la différence simplifiée/optimale est rarement visible sur petite grille
- Panel de contrôle complet :
  - Toggle mur au clic (ajouter / supprimer)
  - Toggle difficulté (avec mise à jour visuelle immédiate)
  - Toggle diagonales
  - Reset partiel (efface la visualisation algo, garde les murs)
  - Reset total (remet tout à zéro, supprime les murs)
  - Choix de l'algorithme via select (A*, Dijkstra, BFS, Greedy, Bidirectionnel A*, Bidirectionnel A* Optimal, Dijkstra Bidirectionnel, Dijkstra Bidirectionnel Optimal) — dispatch via algoLauncher()
  - Choix de l'heuristique via select (Manhattan, Chebyshev, Euclidienne, Octile) — stockage de la fonction via objet de correspondance

## Prochaines étapes possibles (non faites)
- Option C : mode comparaison côte à côte entre algos
- Option D : PQ + Set miroir (structure idéale)
- Theta* (any-angle pathfinding — chemins naturels via line-of-sight)
- Implémenter la génération de labyrinthe DFS
- Implémenter la génération de donjon BSP

**Why:** session d'apprentissage guidée, l'utilisateur code lui-même avec guidance de Claude.
**How to apply:** reprendre avec les "Prochaines étapes" si l'utilisateur veut continuer.
