---
name: Projet Algo A Star
description: Session d'apprentissage pathfinding — état d'avancement et fichiers produits
type: project
---

Projet d'apprentissage du pathfinding en JavaScript vanilla avec visualisation HTML/CSS (divs, pas canvas).
Dossier : c:\Users\depri\Desktop\Javascript\Algo_A_Star\

## Fichiers produits
- Node.js — classe Node (x, y, difficulty, g, h, f, isWall, parent)
- PriorityQueue.js — tas binaire min-heap avec lazy deletion
- functions.js — createGrid, renderGrid, colorCell, sleep, heuristiques (Manhattan, Chebyshev, Euclidienne, Octile)
- aStar.js — algorithme A* async avec PriorityQueue
- dijkstra.js — algorithme Dijkstra async
- bfs.js — algorithme BFS async (FIFO, sans g/h/f)
- greedy.js — algorithme Greedy async (f = h uniquement)
- script.js — point d'entrée, grille 20x20, start/end, listeners
- pathfinding.md — guide pédagogique complet (13 sections)
- labyrinthGenerator.md — génération de labyrinthes (DFS, Prim, Kruskal...)
- dungeonGenerator.md — génération de donjons (BSP, Delaunay+MST, Cellular Automata, WFC)

## Ce qui a été couvert
- A* complet (Node, grille, heuristiques, PQ, lazy deletion, async animation)
- Dijkstra, BFS, Greedy — implémentés et animés
- Priority Queue (tas binaire, bubble up, sink down)
- Heuristiques : Manhattan, Chebyshev, Euclidienne, Octile
- Terrain avec difficulté variable (difficulty par node)
- Admissibilité des heuristiques
- Choix de structure : tableau vs Set vs PQ
- Génération de labyrinthes (DFS) et donjons (BSP, etc.)

## Prochaines étapes possibles (non faites)
- Option C : mode comparaison côte à côte entre algos
- Option D : PQ + Set miroir (structure idéale)
- Implémenter la génération de labyrinthe DFS
- Implémenter la génération de donjon BSP
- Réinitialisation de la grille sans recharger la page

**Why:** session d'apprentissage guidée, l'utilisateur code lui-même avec guidance de Claude.
**How to apply:** reprendre avec les "Prochaines étapes" si l'utilisateur veut continuer.
