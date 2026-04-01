# Leçon — Algorithmes de Pathfinding

## 1. L'algorithme A*

### Principe
A* est un algorithme de recherche de chemin optimal. Il maintient deux listes :
- **Open list** : nœuds découverts mais pas encore explorés
- **Closed list** : nœuds déjà explorés

À chaque itération, il sélectionne le nœud avec le **f le plus bas** :

```
f = g + h

g = coût réel du chemin depuis le départ
h = estimation du coût restant jusqu'à l'arrivée (heuristique)
```

### Garantie
A* garantit le chemin optimal **si et seulement si l'heuristique est admissible** (elle ne surestime jamais le coût réel restant).

---

## 2. Les heuristiques

### Manhattan — 4 directions uniquement
```js
h = |dx| + |dy|
```
À utiliser quand les déplacements diagonaux sont interdits.

### Chebyshev — 8 directions, diagonale coût 1
```js
h = max(|dx|, |dy|)
```
À utiliser quand les déplacements diagonaux coûtent la même chose que les cardinaux.

### Euclidienne — mouvement libre
```js
h = sqrt(dx² + dy²)
```
À utiliser pour les espaces continus sans contraintes de grille.

### Octile — 8 directions, diagonale coût √2 (standard recommandé)
```js
h = max(|dx|, |dy|) + (√2 - 1) * min(|dx|, |dy|)
```
Meilleur compromis pour les grilles 8 directions. Admissible et précise.

### Tableau récapitulatif

| Mouvements autorisés | Heuristique recommandée |
|---|---|
| 4 directions | Manhattan |
| 8 directions, diagonale = 1 | Chebyshev |
| 8 directions, diagonale = √2 | Octile |
| Mouvement libre | Euclidienne |

---

## 3. Coût des diagonales

Avec 8 directions, le coût de déplacement doit distinguer cardinal et diagonal :

```js
const moveCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
const newG = current.g + moveCost + difficulty;
```

### Corner cutting
Traverser un coin diagonal entre deux murs est souvent indésirable. Pour l'interdire :

```js
if (dx !== 0 && dy !== 0) {
    if (grid[current.y][nx].isWall || grid[ny][current.x].isWall) continue;
}
```

---

## 4. Les autres algorithmes de pathfinding

### Non-informés (sans heuristique)

| Algorithme | Force | Limite | Utiliser quand |
|---|---|---|---|
| **BFS** | Optimal en nombre de pas | Ignore les coûts différents | Grille uniforme |
| **DFS** | Peu de mémoire | Non optimal, peut boucler | Détecter si un chemin existe |
| **Dijkstra** | Optimal avec coûts variables | Explore dans toutes les directions | Destination inconnue/multiple |

> A* = Dijkstra + heuristique. Sans heuristique (h = 0), A* **devient** Dijkstra.

### Informés (avec heuristique)

| Algorithme | Force | Limite | Utiliser quand |
|---|---|---|---|
| **A*** | Optimal et efficace | Recalcule tout si graphe change | Pathfinding statique |
| **Greedy Best-First** | Très rapide | Non optimal | Rapidité > optimalité |
| **Bidirectionnel A*** | Réduit l'espace exploré de moitié | Plus complexe | Graphe connu des deux côtés |

### Pour grands espaces / graphes dynamiques

| Algorithme | Force | Limite | Utiliser quand |
|---|---|---|---|
| **D* Lite** | Recalcul efficace si graphe change | Complexe à implémenter | Environnement dynamique |
| **JPS** | A* beaucoup plus rapide sur grilles uniformes | Mal adapté aux coûts variables | Grande grille sans variation de coût |
| **Theta*** | Chemins any-angle, plus naturels | Nécessite test de ligne de vue | Chemins visuellement fluides |
| **HPA*** | Efficace sur très grandes cartes | Complexe | Jeux RTS, grandes cartes |

---

## 5. Quand préférer Dijkstra à A* ?

| Situation | Algorithme |
|---|---|
| Destination connue + espace géométrique | **A*** |
| Destination inconnue ou multiple | **Dijkstra** |
| Précalcul de distances pour toute la carte | **Dijkstra** |
| Graphe non géométrique (réseau social...) | **Dijkstra** |
| Coûts négatifs | **Bellman-Ford** |

Dijkstra est plus gourmand que A* **uniquement quand la destination est connue**. Sans destination unique, l'heuristique d'A* n'apporte aucun avantage.

---

## 6. Combiner des algorithmes

La combinaison suit souvent le principe **grossier → précis** :

### HPA* (Hierarchical Pathfinding A*)
Divise la carte en zones. A* sur le graphe de zones (rapide), puis A* local dans chaque zone (précis). Utilisé dans les jeux RTS.

### D* Lite + A* local
D* gère la carte globale dynamique, A* gère les micro-décisions locales. Utilisé en robotique et véhicules autonomes.

### Recommandation pour grande carte dynamique (1000×1000)
```
HPA*    → structure globale, découpage en chunks
D* Lite → recalcul local quand un obstacle bouge ou un coût change
```

---

## 7. Optimisations de A*

### Problème des structures naïves

| Opération | Array | Optimisé |
|---|---|---|
| Trouver le minimum (open list) | O(n) avec reduce | O(log n) avec Priority Queue |
| Vérifier appartenance (closed list) | O(n) avec includes | O(1) avec Set |

### Pourquoi Set.has() est O(1)
Un `Set` utilise une **table de hachage** : chaque élément est converti en une clé numérique (hash) qui indique directement sa position en mémoire. Pas de parcours séquentiel.

Un `Array.includes()` parcourt case par case : O(n) dans le pire cas.

### Priority Queue (tas binaire / min-heap)
Structure d'arbre où chaque parent a un `f` inférieur à ses enfants :

```
        f=2
       /    \
     f=5    f=7
    /   \
  f=9  f=11

Tableau : [2, 5, 7, 9, 11]
```

- **push** : ajouter en fin + `_bubbleUp` → O(log n)
- **pop** : retirer la racine + `_sinkDown` → O(log n)

### Point critique : stocker f dans les entrées du heap
Les nœuds étant des **objets (références)**, muter `node.f` affecte toutes les entrées du heap pointant vers ce nœud. Il faut stocker le `f` au moment de l'insertion pour éviter de corrompre l'ordre du heap :

```js
push(node) {
    this.heap.push({ f: node.f, node: node }); // f figé à l'insertion
    this._bubbleUp(this.heap.length - 1);
}
```

### Lazy deletion (mise à jour d'un nœud dans la queue)
Plutôt que de supprimer et réinsérer un nœud au milieu du heap (ce qui casse sa structure), on push un doublon et on ignore les entrées obsolètes via la closed list :

```js
// Quand un meilleur chemin est trouvé
} else if (newG < neighbor.g) {
    neighbor.g = newG;
    neighbor.f = neighbor.g + neighbor.h;
    neighbor.parent = current;
    openQueue.push(neighbor); // doublon — sera ignoré quand popped
}

// En début de boucle, ignorer les doublons déjà traités
let current = openQueue.pop();
if (closedList.has(current)) continue;
```

---

## 8. Effet de la difficulté sur le comportement de A*

Quand les coûts de déplacement sont bien supérieurs à 1 (difficulté élevée), l'heuristique sous-estime fortement le coût réel. Le `g` domine `f`, et A* se comporte comme Dijkstra.

```
Sans difficulté :           Avec difficulté moyenne 4.5 :
  g après 5 pas ≈ 5           g après 5 pas ≈ 27
  h ≈ 33                      h ≈ 33
  h domine → dirigé           g domine → ressemble à Dijkstra
```

Pour corriger ce comportement, l'heuristique peut intégrer le coût minimum de déplacement :

```js
h = distanceManhattan(nodeA, nodeB) * (1 + minDifficulty);
```

---

## 9. Progression recommandée

```
Étape 1  Optimiser A* existant       Priority Queue + Set (fait)
Étape 2  Nouveaux algorithmes        BFS → Greedy Best-First → Bidirectionnel A*
Étape 3  Graphes non-grilles         Navmesh, waypoints
Étape 4  Pathfinding avancé          HPA*, D* Lite, Flowfields, Theta*
```
