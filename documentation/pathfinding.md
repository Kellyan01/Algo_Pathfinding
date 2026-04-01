# Guide du Pathfinding — Algorithme A* et au-delà

> Document pédagogique rédigé à l'issue d'une session d'apprentissage pratique.
> Implémentation réalisée en JavaScript vanilla avec visualisation HTML/CSS.

---

## Table des matières

1. [Qu'est-ce que le Pathfinding ?](#1-quest-ce-que-le-pathfinding-)
2. [L'algorithme A*](#2-lalgorithme-a)
3. [Implémentation pas à pas](#3-implémentation-pas-à-pas)
4. [Les heuristiques](#4-les-heuristiques)
5. [Extensions et améliorations](#5-extensions-et-améliorations)
6. [La Priority Queue — Tas Binaire](#6-la-priority-queue--tas-binaire)
7. [Choix de la structure de données pour l'open list](#7-choix-de-la-structure-de-données-pour-lopen-list)
8. [Heuristique et difficulté variable](#8-heuristique-et-difficulté-variable)
9. [Autres algorithmes de pathfinding](#9-autres-algorithmes-de-pathfinding)
10. [Combinaison d'algorithmes](#10-combinaison-dalgorithmes)
11. [Notions avancées](#11-notions-avancées)
12. [Domaines d'application](#12-domaines-dapplication)
13. [Limites de A*](#13-limites-de-a)

---

## 1. Qu'est-ce que le Pathfinding ?

Le **pathfinding** consiste à trouver le chemin optimal entre deux points dans un espace, en évitant les obstacles. On modélise cet espace comme un **graphe** : un ensemble de **noeuds** reliés par des **arêtes** avec des coûts associés.

Exemples d'espaces : grille 2D, carte routière, réseau informatique, arbre de décisions.

---

## 2. L'algorithme A*

> **Analogie :** une personne qui avance vers l'objectif en scannant ce qu'il y a devant elle, tout en se souvenant de l'effort déjà fourni. Elle choisit toujours le chemin qui minimise l'effort total — passé + futur estimé.

> En une phrase : **BFS** minimise les pas. **Greedy** minimise la réflexion. **A\*** minimise l'effort total.

A* (prononcé "A-star") est l'algorithme de pathfinding le plus populaire. Il combine :
- **Dijkstra** : explore les chemins les moins coûteux depuis le départ
- **Greedy Best-First Search** : se dirige vers la destination via une heuristique

### La formule clé

```
f(n) = g(n) + h(n)
```

| Variable | Signification |
|----------|--------------|
| `f(n)` | Coût total estimé du noeud `n` |
| `g(n)` | Coût réel depuis le départ jusqu'à `n` |
| `h(n)` | Heuristique : coût estimé de `n` jusqu'à l'arrivée |

### Fonctionnement

```
1. Ajouter le noeud de départ à openList
2. Tant que openList n'est pas vide :
   a. Prendre le noeud avec le f le plus bas → "current"
   b. Si current === end → chemin trouvé, retourner end
   c. Sinon, déplacer current vers closedList
   d. Pour chaque voisin de current :
      - Ignorer si c'est un mur ou déjà dans closedList
      - Calculer g = current.g + coût de déplacement
      - Calculer h = heuristique(voisin, end)
      - Calculer f = g + h
      - Si pas dans openList → l'ajouter
      - Si déjà dans openList mais nouveau g plus petit → mettre à jour
      - Dans les deux cas, définir parent = current
3. Si openList vide et end jamais atteint → retourner null (pas de chemin)
```

### Reconstruction du chemin

Une fois `end` atteint, on remonte la chaîne de `parent` jusqu'au départ :

```js
let current = end.parent;
while(current.parent){
    colorCell(current.x, current.y, "yellow");
    current = current.parent;
}
```

---

## 3. Implémentation pas à pas

### Étape 1 — La classe Node

Chaque cellule de la grille est un noeud avec ces propriétés :

```js
class Node {
    constructor(x, y, difficulty = 0, g = 0, h = 0, isWall = false, parent = null){
        this.x = x;
        this.y = y;
        this.difficulty = difficulty; // coût de traversée du terrain
        this.g = g;                   // coût réel depuis le départ
        this.h = h;                   // heuristique vers l'arrivée
        this.f = g + h;               // coût total estimé
        this.isWall = isWall;         // obstacle infranchissable
        this.parent = parent;         // noeud précédent dans le chemin
    }
}
```

### Étape 2 — Créer la grille

Convention importante : `grid[y][x]` — la ligne (y) en premier, la colonne (x) ensuite.

```js
function createGrid(rows, cols){
    const grid = [];
    for(let y = 0; y < rows; y++){
        const row = [];
        for(let x = 0; x < cols; x++){
            row.push(new Node(x, y));
        }
        grid.push(row);
    }
    return grid;
}
```

### Étape 3 — Visualiser la grille

Chaque `Node` devient une `<div>`. On utilise CSS Grid pour la mise en page, et les attributs `data-x`/`data-y` pour lier le DOM aux noeuds.

```js
function renderGrid(grid, container){
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;

    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            const div = document.createElement("div");
            div.setAttribute("data-x", j);
            div.setAttribute("data-y", i);
            container.append(div);
        }
    }
}
```

Pour colorier une cellule par ses coordonnées :

```js
function colorCell(x, y, color){
    const cell = document.querySelector(`div[data-x="${x}"][data-y="${y}"]`);
    cell.style.backgroundColor = color;
}
```

### Étape 4 — L'algorithme complet

```js
function aStar(grid, start, end){
    const openQueue = new PriorityQueue(); // tri automatique par f
    const closedList = new Set();
    openQueue.push(start);

    while(openQueue.size > 0){
        let current = openQueue.pop(); // noeud avec le f le plus bas

        if(closedList.has(current)) continue; // doublon obsolète

        if(current === end) return end; // chemin trouvé !

        closedList.add(current);

        const directions = [[-1,0],[1,0],[0,-1],[0,1]]; // haut, bas, gauche, droite
        for(const [dy, dx] of directions){
            const nx = current.x + dx;
            const ny = current.y + dy;

            // hors limites
            if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

            const neighbor = grid[ny][nx];

            // mur ou déjà exploré
            if(neighbor.isWall || closedList.has(neighbor)) continue;

            const newG = current.g + 1 + neighbor.difficulty;

            if(!openQueue.has(neighbor)){
                neighbor.g = newG;
                neighbor.h = distanceManhattan(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                openQueue.push(neighbor);
            } else if(newG < neighbor.g){
                neighbor.g = newG;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                openQueue.push(neighbor); // réinsertion pour réordonnancement
            }
        }
    }

    return null; // aucun chemin trouvé
}
```

---

## 4. Les heuristiques

L'heuristique `h(n)` estime la distance entre un noeud et l'arrivée **sans connaître les obstacles**.

### Règles fondamentales

- **Admissible** : `h(n)` ne doit jamais surestimer le vrai coût → garantit un résultat optimal
- **Consistante** : `h(n) ≤ coût(n → voisin) + h(voisin)` → garantit qu'un noeud en closedList n'a plus besoin d'être rouvert

### Les 4 heuristiques courantes

**Distance de Manhattan** — grille sans diagonales
```js
function distanceManhattan(nodeA, nodeB){
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}
```

**Distance de Chebyshev** — grille avec diagonales (coût diagonal = 1)
```js
function distanceChebyshev(nodeA, nodeB){
    return Math.max(Math.abs(nodeA.x - nodeB.x), Math.abs(nodeA.y - nodeB.y));
}
```

**Distance Euclidienne** — déplacement libre (coût diagonal = √2)
```js
function distanceEuclidienne(nodeA, nodeB){
    return Math.sqrt((nodeA.x - nodeB.x)**2 + (nodeA.y - nodeB.y)**2);
}
```

**Distance Octile** — heuristique standard pour les grilles à 8 directions (admissible + précise)
```js
function distanceOctile(nodeA, nodeB){
    const dx = Math.abs(nodeA.x - nodeB.x);
    const dy = Math.abs(nodeA.y - nodeB.y);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}
```

### Quel choix selon le contexte ?

| Mouvements autorisés | Heuristique recommandée |
|----------------------|------------------------|
| 4 directions (haut/bas/gauche/droite) | Manhattan |
| 8 directions, coût diagonal = 1 | Chebyshev |
| 8 directions, coût diagonal = √2 | Octile |
| Déplacement libre | Euclidienne |

---

## 5. Extensions et améliorations

### Terrain avec difficulté variable

Chaque noeud peut avoir un coût de traversée (`difficulty`) pour simuler un terrain non uniforme (boue, montagne, route...) :

```js
const newG = current.g + moveCost + neighbor.difficulty;
```

L'heuristique Manhattan reste **admissible** car elle ignore les difficultés restantes — elle sous-estime donc toujours le vrai coût.

### Diagonales

Activer les 8 directions avec un coût diagonal de √2 :

```js
const directions = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]];
const moveCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
```

Utiliser alors **distanceOctile** comme heuristique.

### Tie-breaking (départage des égalités)

Quand plusieurs noeuds ont le même `f`, A* choisit arbitrairement, pouvant produire des chemins en zigzag. Solution : micro-biais vers l'arrivée :

```js
neighbor.h = distanceManhattan(neighbor, end) * 1.001;
```

### Priority Queue (optimisation des performances)

Remplacer le tableau + `reduce` (O(n)) par un **tas binaire min-heap** (O(log n)) pour la sélection du meilleur noeud. Indispensable sur de grandes grilles.

```
Tableau + reduce :   O(n)     par itération
Priority Queue :     O(log n) par itération
```

### Animation pas-à-pas (async / await)

Par défaut, l'algorithme s'exécute de manière **synchrone** — le navigateur ne redessine l'écran qu'une fois la fonction terminée. Pour animer l'exploration case par case, on utilise `async/await` pour céder le contrôle au navigateur entre chaque itération.

**Fonction sleep :**
```js
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Rendre l'algorithme async :**
```js
async function aStar(grid, start, end){
    while(openQueue.size > 0){
        // ... logique habituelle ...
        await sleep(50); // pause → le navigateur redessine
    }
}
```

**Adapter l'appel :** une fonction `async` retourne une Promise, l'appelant doit aussi être `async` :
```js
pathfinderBtn.addEventListener("click", async () => {
    pathfinderBtn.disabled = true;          // éviter les doubles clics
    const path = await aStar(grid, start, end);
    pathfinderBtn.disabled = false;

    if(!path){ alert("Aucun chemin trouvé !"); return; }

    // animer aussi la reconstruction du chemin
    let current = path.parent;
    while(current.parent){
        colorCell(current.x, current.y, "yellow");
        await sleep(30);
        current = current.parent;
    }
});
```

---

## 6. La Priority Queue — Tas Binaire

### Qu'est-ce qu'une Priority Queue ?

C'est une structure de données où chaque élément a une **priorité**. Au lieu de sortir le premier arrivé (FIFO), on sort toujours **l'élément avec la priorité la plus basse** (le `f` le plus petit).

```
Tableau classique :  [push 5, push 2, push 8, push 1] → pop = 5  (premier entré)
Priority Queue :     [push 5, push 2, push 8, push 1] → pop = 1  (f le plus bas)
```

### La structure interne : le Tas Binaire (Min-Heap)

Un arbre binaire avec une règle simple : **chaque noeud a une valeur inférieure ou égale à ses enfants**.

```
        1          ← racine = toujours le minimum
       / \
      2   5
     / \ / \
    8  3 7  9
```

#### Stockage en tableau plat

L'arbre est aplati dans un tableau. Les relations parent/enfant se calculent par formules :

```
Index :  0   1   2   3   4   5   6
Valeur : 1   2   5   8   3   7   9

Parent de i    : Math.floor((i - 1) / 2)
Enfant gauche  : 2 * i + 1
Enfant droit   : 2 * i + 2
```

### Opération 1 — push : Bubble Up (remonter)

On ajoute en fin de tableau, puis on remonte tant que l'élément est plus petit que son parent :

```
Ajout de 1 :   [2, 5, 8, 9, 1]
                             ↑ < parent(5) → swap
               [2, 1, 8, 9, 5]
                   ↑ < parent(2) → swap
               [1, 2, 8, 9, 5] ✓
```

```js
_bubbleUp(i) {
    while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        if (this.heap[parent].f <= this.heap[i].f) break;
        [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
        i = parent;
    }
}
```

### Opération 2 — pop : Sink Down (descendre)

On retire la racine (minimum), on place le dernier élément à sa place, puis on le fait descendre :

```
Pop sur [1, 2, 5, 8, 3, 7, 9] → min = 1
Dernier à la racine : [9, 2, 5, 8, 3, 7]
                       ↑ > enfant min(2) → swap
                      [2, 9, 5, 8, 3, 7]
                          ↑ > enfant min(3) → swap
                      [2, 3, 5, 8, 9, 7] ✓
```

```js
_sinkDown(i) {
    const n = this.heap.length;
    while (true) {
        let smallest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && this.heap[left].f < this.heap[smallest].f) smallest = left;
        if (right < n && this.heap[right].f < this.heap[smallest].f) smallest = right;
        if (smallest === i) break;
        [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
        i = smallest;
    }
}
```

### Lazy Deletion (suppression paresseuse)

Dans A*, le `f` d'un noeud peut changer (chemin plus court trouvé). Au lieu de mettre à jour l'entrée dans le heap (coûteux), on **pousse une nouvelle entrée** avec le nouveau `f` — en figeant `f` à l'insertion :

```js
push(node) {
    this.heap.push({f: node.f, node: node}); // f figé au moment du push
}
```

Le heap peut contenir deux entrées pour le même noeud. La nouvelle (f plus bas) sort en premier et est traitée. L'ancienne sort plus tard et est ignorée :

```js
if(closedList.has(current)) continue; // doublon obsolète → ignorer
```

### Complexité

| Opération | Tableau + reduce | Priority Queue |
|-----------|-----------------|----------------|
| `push`    | O(1)            | O(log n)       |
| `pop min` | O(n)            | O(log n)       |
| `has`     | O(n)            | O(n)           |

Sur 1000 noeuds : `reduce` fait 1000 comparaisons, le tas en fait ~10 (`log₂(1000) ≈ 10`).

---

## 7. Choix de la structure de données pour l'open list

La vraie question n'est pas la taille de la grille, mais le **nombre de noeuds simultanément dans l'open list**.

| Approche | `find min` | `insert` | `has()` |
|----------|-----------|---------|---------|
| Tableau + reduce | O(n) | O(1) | O(n) |
| Set + reduce | O(n) | O(1) | **O(1)** |
| Priority Queue | **O(log n)** | O(log n) | O(n) |

- Le **Set** améliore uniquement la vérification `has()`
- La **PQ** améliore uniquement la sélection du minimum
- Aucune n'est parfaite sur tous les fronts

### Règle de choix

```
Open list petite (peu de candidats)  → Tableau ou Set suffisent
Open list grande (beaucoup de candidats) → Priority Queue
```

Ce qui détermine la taille de l'open list : la taille de la grille, le nombre d'obstacles, et la qualité de l'heuristique (meilleure h = open list plus petite).

### La solution idéale : PQ + Set

Combiner les deux structures en miroir :

```js
const openQueue = new PriorityQueue(); // pour find min en O(log n)
const openSet = new Set();             // pour has() en O(1)

// à chaque push → openQueue.push(node) + openSet.add(node)
// à chaque pop  → openQueue.pop()      + openSet.delete(node)
```

C'est l'implémentation utilisée dans les moteurs de jeu professionnels.

### Attention aux doublons avec la PQ

La lazy deletion peut faire paraître A* moins efficace sur petites grilles :
- Le heap contient des entrées obsolètes qui gonflent sa taille
- L'ordre d'exploration change (tie-breaking différent du tableau)
- Sur petite grille : différence visible mais négligeable
- Sur grande grille (500x500+) : le gain en vitesse par itération compense largement

---

## 8. Heuristique et difficulté variable

### L'admissibilité concerne l'heuristique, pas les coûts

> `h(n)` est **admissible** si elle ne surestime **jamais** le vrai coût restant.

Les coûts (`g`, `difficulty`) sont des valeurs — ils n'ont pas de propriété d'admissibilité. C'est `h` qui doit correctement les estimer.

### Pourquoi A* ressemble à Dijkstra avec une forte difficulté

Avec `difficulty ∈ [0, 9]`, le coût réel d'un pas peut atteindre 10. Mais l'heuristique Octile suppose un coût de 1 par pas — elle sous-estime massivement :

```
Coût réel restant :             ~100  (20 cases × coût moyen 5)
Estimation Octile :             ~20   (20 cases × 1)

f = g + h  →  f = 87 + 4   ← h est négligeable
```

Quand `h` contribue peu à `f`, tous les noeuds ont des `f` proches dominés par `g`. A* trie essentiellement par `g` — **ce qui est la définition de Dijkstra**.

```
h = 0            → A* == Dijkstra  (explore tout)
h ≈ vrai coût   → A* optimal      (explore peu)
h > vrai coût   → rapide mais pas optimal (inadmissible)
```

### Impact de la borne de difficulté

L'heuristique reste **admissible** quelle que soit la borne (tant que `difficulty ≥ 0`), car elle suppose toujours 0 de difficulté pour les cases restantes. Ce que la borne améliore, c'est la **précision** :

| Borne difficulty | Admissible ? | Efficace ? |
|-----------------|-------------|------------|
| [0, 9]          | ✅           | ❌ (≈ Dijkstra) |
| [0, 1]          | ✅           | ✅ bien mieux |
| [-1, x]         | ❌           | ❌ (h peut surestimer) |

En pratique, les jeux utilisent des difficultés **prévisibles et bornées** (pas aléatoires) pour que l'heuristique reste précise.

---

## 9. Autres algorithmes de pathfinding

### BFS — Breadth-First Search

> **Analogie :** une personne qui envoie des éclaireurs dans toutes les directions simultanément, couche par couche, et s'arrête dès que l'un d'eux atteint l'objectif. Elle minimise le nombre de pas, mais ignore l'effort à fournir pour traverser chaque case.

Explore la grille **couche par couche** via une **file FIFO** (premier entré, premier sorti). Pas de `g`, `h`, ni `f`.

| ✅ Points forts | ❌ Limites |
|----------------|-----------|
| Chemin optimal en nombre de cases | Ignore les coûts (`difficulty`) |
| Simple à implémenter | Lent sur grandes grilles |
| Garantit de trouver un chemin s'il existe | Gourmand en mémoire |

**Usage :** terrain uniforme, labyrinthe, réseaux sociaux (degrés de séparation), crawlers web.

**Implémentation :**
```js
async function bfs(grid, start, end, diagonal = false){
    const openList = [start];         // file FIFO — shift() pour dépiler
    const closedList = new Set();

    while(openList.length > 0){
        let current = openList.shift(); // premier entré, premier sorti

        if(current === end) return current;

        closedList.add(current);
        if(current !== start) colorCell(current.x, current.y, "lightcoral");

        const directions = diagonal
            ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]]
            : [[-1,0],[1,0],[0,-1],[0,1]];

        for(const [dy, dx] of directions){
            const nx = current.x + dx;
            const ny = current.y + dy;
            if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

            const neighbor = grid[ny][nx];
            if(neighbor.isWall || closedList.has(neighbor) || openList.includes(neighbor)) continue;

            neighbor.parent = current; // pas de g/h/f — juste le parent
            openList.push(neighbor);
        }
        await sleep(50);
    }
    return null;
}
```

> **Clé :** BFS n'a pas besoin de Priority Queue — `shift()` suffit car tous les noeuds d'une même couche sont équivalents.

---

### DFS — Depth-First Search

Suit un chemin jusqu'au bout avant de revenir en arrière.

| ✅ Points forts | ❌ Limites |
|----------------|-----------|
| Très peu de mémoire | Pas de chemin optimal |
| Rapide pour trouver *un* chemin | Peut explorer des chemins absurdes |

**Usage :** génération de labyrinthes, exploration exhaustive.

---

### Dijkstra

Comme A* mais sans heuristique (`h = 0`). Explore en priorité les noeuds les moins coûteux.

> A* avec `h = 0` **devient** Dijkstra.

| ✅ Points forts | ❌ Limites |
|----------------|-----------|
| Optimal avec coûts variables | Explore dans toutes les directions |
| Pas besoin d'heuristique | Plus lent que A* |

**Usage :** quand aucune heuristique n'est disponible, GPS (OSPF).

---

### Greedy Best-First Search

> **Analogie :** un coureur aveugle qui *sent* la direction de l'objectif et fonce vers lui sans voir les murs. Très rapide, mais se retrouve souvent bloqué dans des culs-de-sac.

Utilise **uniquement `h`**, ignore totalement `g` :

```
f(n) = h(n)   ← g absent
```

| ✅ Points forts | ❌ Limites |
|----------------|-----------|
| Très rapide | Pas de chemin optimal |
| Peu de noeuds explorés en terrain ouvert | Se piège dans les culs-de-sac |
| | Ignore les coûts de traversée |

**Usage :** IA ennemie basique (RPG, FPS), suggestions en temps réel, quand la vitesse prime sur l'optimalité.

**Cas piège typique :**
```
S · · · · E
· ■ ■ ■ ■ ·     Greedy fonce vers E, se bloque contre le mur,
· ■ · · · ·     doit faire un long détour imprévu.
· ■ · · · ·     A* l'aurait anticipé grâce à g.
```

**Implémentation :** identique à A* avec une seule différence — `f = h` (pas de `g`) :
```js
async function greedy(grid, start, end, diagonal = false, heuristique = distanceManhattan){
    const closedList = new Set();
    const openQueue = new PriorityQueue();
    openQueue.push(start);
    const h = diagonal ? heuristique : distanceManhattan;

    while(openQueue.size > 0){
        let current = openQueue.pop();
        if(closedList.has(current)) continue;
        if(current === end) return end;

        closedList.add(current);
        if(current !== start) colorCell(current.x, current.y, "lightblue");

        const directions = diagonal
            ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]]
            : [[-1,0],[1,0],[0,-1],[0,1]];

        for(const [dy, dx] of directions){
            const nx = current.x + dx;
            const ny = current.y + dy;
            if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

            const neighbor = grid[ny][nx];
            if(neighbor.isWall || closedList.has(neighbor)) continue;

            if(!openQueue.has(neighbor)){
                neighbor.h = h(neighbor, end);
                neighbor.f = neighbor.h; // ← seule différence avec A*
                neighbor.parent = current;
                openQueue.push(neighbor);
            }
            // pas de else if : sans g, on ne peut pas comparer des chemins alternatifs
        }
        await sleep(50);
    }
    return null;
}
```

---

### D* Lite — Dynamic A*

A* qui se recalcule localement quand l'environnement change.

| ✅ Points forts | ❌ Limites |
|----------------|-----------|
| Gère les obstacles dynamiques | Plus complexe à implémenter |
| Recalcul partiel seulement | |

**Usage :** robots autonomes, obstacles mobiles.

---

### JPS — Jump Point Search

Optimisation de A* sur grilles uniformes — saute les noeuds symétriques inutiles.

| ✅ Points forts | ❌ Limites |
|----------------|-----------|
| Jusqu'à 10x plus rapide que A* | Coûts uniformes uniquement |
| Même résultat optimal | Incompatible avec `difficulty` |

**Usage :** grandes grilles uniformes (RTS type StarCraft).

---

### Comparaison générale

```
             Optimal ?   Rapide ?   Coûts variables ?   Dynamique ?
BFS             ✅*         ❌            ❌                 ❌
DFS             ❌          ✅            ❌                 ❌
Dijkstra        ✅          ❌            ✅                 ❌
Greedy          ❌          ✅            ❌                 ❌
A*              ✅          ✅            ✅                 ❌
D* Lite         ✅          ✅            ✅                 ✅
JPS             ✅          ✅✅           ❌                 ❌
```
*optimal en nombre de cases, pas en coût

---

## 10. Combinaison d'algorithmes

Les systèmes réels combinent souvent plusieurs algorithmes. La logique générale :

> **Algo rapide/simple** pour filtrer → **Algo optimal** pour le résultat final

### A* + JPS

JPS est une optimisation interne de A* — même logique `f = g + h`, mais saute les noeuds inutiles. Incompatible avec les coûts variables.

### HPA* — Hierarchical Pathfinding A*

Deux niveaux de recherche :
1. **Macro** : A* sur une carte simplifiée (zones/clusters)
2. **Micro** : A* dans chaque zone pour relier les points

Utilisé dans les grands jeux (Warcraft) et Google Maps (autoroutes d'abord, routes locales ensuite).

### BFS + A* (deux passes)

- BFS vérifie d'abord *si* un chemin existe (peu coûteux)
- A* calcule le chemin optimal *seulement si* BFS le confirme

Évite de lancer A* inutilement quand les murs bloquent tout.

### A* bidirectionnel (A* + Dijkstra)

Deux recherches simultanées depuis le départ et l'arrivée. Elles se rejoignent au milieu. Jusqu'à 2x moins de noeuds explorés. Utilisé dans les GPS longue distance.

### A* + D* Lite

- A* pour le premier calcul
- D* Lite uniquement pour les recalculs partiels si l'environnement change

robot qui navigue dans une pièce où des personnes se déplacent
---

## 11. Notions avancées

### Représentation en graphe

A* s'applique à n'importe quel problème modélisable comme un graphe. La définition de "noeud" et "coût" change selon le domaine :

| Domaine | Noeud | Coût |
|---------|-------|------|
| Jeu vidéo | Case de grille | Terrain, distance |
| GPS | Intersection | Temps de trajet |
| Réseau | Routeur | Latence, bande passante |
| Puzzle | État du jeu | Nombre de mouvements |

### Navigation Mesh (NavMesh)

Pour les jeux 3D, on remplace la grille par des **polygones** qui épousent la géométrie du terrain. A* s'applique sur ces polygones. Utilisé dans Unity, Unreal Engine.

### Flow Fields (champs de flux)

Utilisé dans les RTS quand des centaines d'unités doivent atteindre la même destination. Au lieu de lancer A* pour chaque unité, on calcule **une seule fois** un champ de vecteurs depuis chaque case vers l'arrivée.

---

## 12. Domaines d'application

| Domaine | Application |
|---------|-------------|
| Navigation | GPS, Google Maps, drones |
| Jeux vidéo | Déplacement des personnages, IA ennemie |
| Robotique | Bras industriels, robots autonomes |
| Réseaux | Routage de paquets (OSPF) |
| IA | Résolution de puzzles, planification de tâches |
| Bioinformatique | Alignement de séquences ADN |
| Logistique | Tournées de livraison |

---

## 13. Limites de A*

| Problème | Cause | Solution |
|----------|-------|----------|
| Consommation mémoire | Stocke tous les noeuds explorés | IDA* |
| Lent sans bonne heuristique | h trop faible → comme Dijkstra | Choisir h adaptée |
| Chemin sous-optimal | h qui surestime | Garantir l'admissibilité |
| Environnement dynamique | Recalcul complet à chaque changement | D* Lite |
| Haute dimension | Explosion exponentielle | RRT, autres algos |
| Grandes grilles uniformes | Explore trop de noeuds | JPS |

---

*Document rédigé le 31/03/2026 — Implémentation disponible dans les fichiers `Node.js`, `functions.js`, `script.js`.*
