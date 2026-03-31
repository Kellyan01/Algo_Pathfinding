# Génération de Labyrinthe

> Document pédagogique sur les algorithmes de génération procédurale de labyrinthes.

---

## Table des matières

1. [Qu'est-ce qu'un labyrinthe parfait ?](#1-quest-ce-quun-labyrinthe-parfait-)
2. [DFS — Génération par creusement](#2-dfs--génération-par-creusement)
3. [Autres algorithmes de génération](#3-autres-algorithmes-de-génération)
4. [Comparaison des approches](#4-comparaison-des-approches)
5. [Lien avec le Pathfinding](#5-lien-avec-le-pathfinding)

---

## 1. Qu'est-ce qu'un labyrinthe parfait ?

Un **labyrinthe parfait** respecte trois propriétés :
- **Exactement un chemin** entre deux cases quelconques
- **Aucune boucle** (pas de cycle)
- **Aucune zone isolée** (toutes les cases sont accessibles)

C'est la forme de labyrinthe la plus classique. Les algorithmes DFS, Prim et Kruskal génèrent tous des labyrinthes parfaits.

Un labyrinthe **imparfait** (généré aléatoirement) peut contenir des boucles et des zones isolées — moins intéressant pour un puzzle, mais utile pour des niveaux ouverts.

---

## 2. DFS — Génération par creusement

### Principe

On part d'une **grille entièrement remplie de murs** et on creuse des passages. DFS est parfait pour ça : sa nature profonde crée naturellement de longs couloirs sinueux avant de revenir en arrière (backtrack).

> **Analogie :** un mineur qui creuse toujours droit devant lui jusqu'au bout, puis revient sur ses pas pour explorer les embranchements qu'il a ignorés.

### L'algorithme

```
1. Partir d'une cellule de départ
2. La marquer comme visitée
3. Mélanger aléatoirement la liste de ses voisins non-visités
4. Pour chaque voisin non-visité :
   a. Supprimer le mur entre la cellule courante et ce voisin
   b. Récurser sur ce voisin (DFS)
5. Quand tous les voisins sont visités → backtrack automatique
```

### Visualisation étape par étape

```
Départ :         Creusage DFS :             Labyrinthe final :
■ ■ ■ ■ ■        ■ · ■ ■ ■                 ■ · ■ · ■
■ ■ ■ ■ ■        ■ · ■ ■ ■                 ■ · · · ■
■ ■ ■ ■ ■   →   ■ · · · ■         →        ■ ■ ■ · ■
■ ■ ■ ■ ■        ■ ■ ■ · ■                 ■ · · · ■
■ ■ ■ ■ ■        ■ ■ ■ · ■                 ■ · ■ · ■
```

DFS creuse un long couloir jusqu'au fond, remonte (backtrack), puis explore les embranchements non visités.

### Implémentation (version itérative avec pile)

La version récursive peut provoquer un stack overflow sur de grandes grilles. La version itérative avec une pile explicite est préférable :

```js
function generateMazeDFS(grid){
    const stack = [];
    const visited = new Set();

    const startCell = grid[0][0];
    stack.push(startCell);
    visited.add(startCell);
    startCell.isWall = false;

    while(stack.length > 0){
        const current = stack[stack.length - 1]; // peek (sans dépiler)

        // Voisins non-visités à distance 2 (pour sauter les murs intermédiaires)
        const neighbors = getUnvisitedNeighbors(current, grid, visited);

        if(neighbors.length > 0){
            // Choisir un voisin aléatoire
            const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Supprimer le mur entre current et chosen
            const wallX = (current.x + chosen.x) / 2;
            const wallY = (current.y + chosen.y) / 2;
            grid[wallY][wallX].isWall = false;
            chosen.isWall = false;

            visited.add(chosen);
            stack.push(chosen);
        } else {
            stack.pop(); // backtrack
        }
    }
}
```

> **Clé :** on travaille avec des voisins à **distance 2** (pas 1) pour que chaque cellule "sol" soit séparée par un mur potentiel. La grille doit avoir des dimensions **impaires** (ex: 21×21).

### Caractéristiques visuelles

- **Longs couloirs** sinueux avant les embranchements
- **Peu de jonctions** (carrefours rares)
- **Facile à résoudre pour un humain** : on voit loin devant soi
- **Intéressant pour A\*** : peu d'alternatives, met en valeur l'heuristique

---

## 3. Autres algorithmes de génération

### Algorithme de Prim (BFS-like)

**Principe :** partir d'une cellule et ajouter les murs adjacents à une liste. Choisir un mur aléatoire dans cette liste, l'ouvrir si une seule des deux cellules est déjà visitée.

```
Résultat : labyrinthe très ramifié, beaucoup de jonctions courtes
Usage    : labyrinthes "buissonnants", style puzzle dense
```

### Algorithme de Kruskal

**Principe :** considérer chaque cellule comme un ensemble indépendant. Choisir un mur aléatoire et l'ouvrir si les deux cellules appartiennent à des ensembles différents (structure Union-Find).

```
Résultat : distribution très uniforme et aléatoire
Usage    : quand on veut une répartition équilibrée sans biais directionnel
```

### Recursive Division

**Principe :** diviser l'espace avec des murs, laisser un passage aléatoire dans chaque mur, puis récurser sur chaque sous-espace.

```
Résultat : grandes zones séparées par des couloirs étroits
Usage    : labyrinthes avec salles distinctes et passages uniques
```

---

## 4. Comparaison des approches

| Algorithme | Longueur des couloirs | Nombre de jonctions | Complexité |
|-----------|----------------------|--------------------|-----------|
| **DFS** | Longs et sinueux | Peu | Faible |
| **Prim** | Courts et variés | Nombreux | Faible |
| **Kruskal** | Aléatoire uniforme | Moyen | Moyenne |
| **Recursive Division** | Variables | Peu | Faible |

```
DFS :              Prim :             Kruskal :
■ · ■ · · ·        · · · · · ·        · · ■ · · ·
■ · ■ · ■ ■        · ■ ■ · ■ ·        · ■ · · ■ ·
■ · · · ■ ·        · · · · · ·        · · · ■ · ·
■ ■ ■ · ■ ·        ■ · ■ · ■ ·        ■ · ■ · · ·
■ · · · · ·        · · · · · ·        · · · · ■ ·

Longs corridors    Très ramifié       Uniforme
```

---

## 5. Lien avec le Pathfinding

Une fois le labyrinthe généré, les algorithmes de pathfinding interviennent naturellement :

| Rôle | Algorithme recommandé |
|------|----------------------|
| Vérifier que tout est accessible | **BFS** (connexité) |
| Trouver la sortie (terrain uniforme) | **BFS** ou **A\*** Manhattan |
| Trouver la sortie (terrain avec coûts) | **A\*** |
| IA ennemie qui cherche le joueur | **A\*** ou **Greedy** |

> Un labyrinthe DFS est particulièrement intéressant à résoudre avec A* : le chemin unique force l'algorithme à explorer beaucoup de noeuds, ce qui met en valeur l'importance de la qualité de l'heuristique.

---

*Voir aussi : [pathfinding.md](pathfinding.md) | [dungeonGenerator.md](dungeonGenerator.md)*
