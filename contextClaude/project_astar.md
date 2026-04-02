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
    Entity/       → Node.js, PriorityQueue.js, BSPNode.js
    algorithms/
      pathfinding/ → aStar.js, dijkstra.js, bfs.js, greedy.js, heuristique.js,
                      biDirectionalAStar.js, biDirectionalAStarOpti.js,
                      biDirectionalDijkstra.js, biDirectionalDijkstraOpti.js
      generators/
        dungeon/  → bspDungeon.js
        map/      → voronoiMap.js
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
- src/script/functions/functions.js — createGrid, renderGrid(colorDifficulty), colorCell, sleep, resetPartial, resetTotal, algoLauncher, buildPath, buildWall, placeNode
- src/script/Entity/BSPNode.js — classe BSPNode (x, y, width, height, left, right, room)
- src/script/algorithms/pathfinding/heuristique.js — distanceManhattan, distanceChebyshev, distanceEuclidienne, distanceOctile
- src/script/algorithms/pathfinding/aStar.js — algorithme A* async avec PriorityQueue
- src/script/algorithms/pathfinding/dijkstra.js — algorithme Dijkstra async
- src/script/algorithms/pathfinding/bfs.js — algorithme BFS async (FIFO, sans g/h/f)
- src/script/algorithms/pathfinding/greedy.js — algorithme Greedy async (f = h uniquement)
- src/script/algorithms/pathfinding/biDirectionalAStar.js — A* bidirectionnel simplifié
- src/script/algorithms/pathfinding/biDirectionalAStarOpti.js — A* bidirectionnel optimal
- src/script/algorithms/pathfinding/biDirectionalDijkstra.js — Dijkstra bidirectionnel simplifié
- src/script/algorithms/pathfinding/biDirectionalDijkstraOpti.js — Dijkstra bidirectionnel optimal
- src/script/algorithms/generators/dungeon/bspDungeon.js — splitBSP, placeRooms(minSize, maxSize), applyRooms, getRoom, connectRooms, generateBSP(minSize=5, maxSize=8)
- src/script/script.js — point d'entrée, grille dynamique (défaut 20x20), listeners, panel de contrôle complet
- index.html — interface avec aside de contrôle (boutons, selects, checkboxes, radio builders, inputs grille/BSP)
- documentation/pathfinding.md — guide pédagogique complet (14 sections)
- documentation/labyrinthGenerator.md — génération de labyrinthes (DFS, Prim, Kruskal...)
- documentation/dungeonGenerator.md — génération de donjons (BSP, Delaunay+MST, Cellular Automata, WFC)
- documentation/panelAdmin.md — documentation de l'implémentation du panel de contrôle
- src/script/algorithms/generators/map/voronoiMap.js — generateSeeds(count, gridCols, gridRows, biomes, jitter), generateVoronoi(grid, seeds, jitter), generateVoronoiJitter, generateVoronoiBlending, nodeTileUrl(node, tileSet)
- documentation/mapGenerator.md — génération de cartes naturelles (Perlin, Voronoi, Diamond-Square, Érosion hydraulique, Cellular Automata)

## Ce qui a été couvert
- A* complet (Node, grille, heuristiques, PQ, lazy deletion, async animation)
- Dijkstra, BFS, Greedy — implémentés et animés
- Priority Queue (tas binaire, bubble up, sink down)
- Heuristiques : Manhattan, Chebyshev, Euclidienne, Octile
- Terrain avec difficulté variable (difficulty par node)
- Admissibilité des heuristiques
- Choix de structure : tableau vs Set vs PQ
- Génération de labyrinthes (DFS) et donjons (BSP, etc.) — théorie documentée
- Génération de donjon BSP — implémentée (splitBSP, placeRooms, applyRooms, connectRooms)
- Génération de cartes naturelles — théorie documentée (Perlin, Voronoi, Diamond-Square, Érosion, Cellular Automata)
- Bidirectionnel (principe général) — applicable à tout algo, combinaisons cohérentes vs problématiques
- A* Bidirectionnel simplifié — deux fronts (Forward bleu, Backward corail), Maps séparées pour g/parents, fusion via buildPath()
- A* Bidirectionnel optimal — même principe + bestCost/bestMeeting, condition d'arrêt via peek() (f figé, conservative mais correcte)
- Dijkstra Bidirectionnel simplifié et optimal — version optimale : condition d'arrêt exacte via g réels (pas de peek() nécessaire)
- peek() ajouté à PriorityQueue — retourne le f minimum sans pop, Infinity si vide
- Pourquoi la différence simplifiée/optimale est rarement visible sur petite grille
- Panel de contrôle complet :
  - Création de grille dynamique (inputs largeur/hauteur + bouton)
  - Dungeon Generator BSP (inputs minSize/maxSize + bouton + validation)
  - Système de radio buttons builder (Désactivé / Mur / Départ / Arrivé)
  - Placement/déplacement de start et end via le builder
  - buildWall() — toggle mur au clic, recolorie selon mode difficulté
  - placeNode() — place ou supprime start/end, reset couleur de l'ancien node
  - Toggle difficulté (avec mise à jour visuelle immédiate)
  - Toggle diagonales
  - Reset partiel (efface la visualisation algo, garde les murs, garde start/end)
  - Reset total (remet tout à zéro, supprime les murs, reset start/end à null)
  - Choix de l'algorithme via select avec optgroup (Heuristique / Non Heuristique) — dispatch via algoLauncher()
  - Choix de l'heuristique via select (Manhattan, Chebyshev, Euclidienne, Octile) — stockage de la fonction via objet de correspondance

- Génération de carte Voronoi — implémentée (generateSeeds + generateVoronoi, graines aléatoires, 5 biomes, recoloration dans le listener)
- Jitter Voronoi — deux niveaux combinés : jitter par graine (déforme les tailles des régions) + jitter par comparaison (brise les frontières case par case)
- Blending Voronoi — interpolation par inverse des distances entre les 2 graines les plus proches, combiné avec le jitter dans generateVoronoi(grid, seeds, jitter)
- Trois versions conservées dans voronoiMap.js : generateVoronoiJitter, generateVoronoiBlending, generateVoronoi (jitter + blending)
- biomesList dans script.js — tableau d'objets {type, difficulty, imgUrl} remplace le simple tableau de difficultés numériques
- nodeTileUrl(node, tileSet) — assigne type et imgUrl au node via reduce sur la difficulté la plus proche (prévu pour affichage tiles, imgUrl vides pour l'instant)
- Bouton "Générer Carte Voronoi" dans le panel (section Map Generator dans index.html)
- `biomesList` déclaré en global dans script.js — tableau d'objets `{type, difficulty, imgUrl}` avec 7 biomes (Route=1, Plaine=2, Forêt=4, Marais=6, Colline=7, Montagne=8, Eau Profonde=10)

## Prochaines étapes possibles (non faites)
- Option C : mode comparaison côte à côte entre algos
- Option D : PQ + Set miroir (structure idéale)
- Theta* (any-angle pathfinding — chemins naturels via line-of-sight)
- Implémenter la génération de labyrinthe DFS
- ~~Implémenter la génération de donjon BSP~~ ✅ fait
- ~~Génération de carte Voronoi~~ ✅ fait (jitter + blending)

**Why:** session d'apprentissage guidée, l'utilisateur code lui-même avec guidance de Claude.
**How to apply:** reprendre avec les "Prochaines étapes" si l'utilisateur veut continuer.
