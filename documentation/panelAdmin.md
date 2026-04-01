# Panel de contrôle — Implémentation

> Document décrivant la mise en place de l'interface de contrôle du visualiseur de pathfinding.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Toggle mur au clic](#2-toggle-mur-au-clic)
3. [Toggles Difficulté et Diagonales](#3-toggles-difficulté-et-diagonales)
4. [Reset partiel](#4-reset-partiel)
5. [Reset total](#5-reset-total)
6. [Choix de l'algorithme](#6-choix-de-lalgorithme)
7. [Choix de l'heuristique](#7-choix-de-lheuristique)

---

## 1. Vue d'ensemble

Le panel est un `<aside>` dans le HTML contenant l'ensemble des contrôles. Côté JS, chaque contrôle est câblé dans `script.js` via des listeners sur les éléments du DOM.

Les variables d'état globales sont déclarées en haut de `script.js` et passées aux fonctions et algorithmes au moment du lancement :

```js
let difficulty = true;
let diagonal = true;
let selectedAlgo = selectAlgo.value;
let selectedHeuristique = heuristiques[selectHeuristique.value];
```

---

## 2. Toggle mur au clic

**Fichier :** `script.js`

Le listener sur `#container` intercepte les clics sur les cellules. La logique est un toggle : un clic ajoute un mur, un second clic le supprime.

```js
container.addEventListener("click", (event) => {
    const x = event.target.getAttribute("data-x");
    const y = event.target.getAttribute("data-y");
    const node = mainGrid[parseInt(y)][parseInt(x)];

    if (node === start || node === end) return; // intouchables

    if (node.isWall) {
        node.isWall = false;
        // restaure la couleur selon le mode difficulté
        if (difficulty) {
            const d = node.difficulty;
            event.target.style.backgroundColor = `hsl(30, ${d * 10}%, ${100 - d * 5}%)`;
        } else {
            colorCell(x, y, "");
        }
        return;
    }

    colorCell(x, y, "black");
    node.isWall = true;
});
```

**Point clé :** quand un mur est supprimé, la couleur restaurée dépend de l'état actuel du toggle difficulté.

---

## 3. Toggles Difficulté et Diagonales

**Fichier HTML :**
```html
<label>
    <input type="checkbox" id="toggleDifficulty" checked> Difficulté
</label>
<label>
    <input type="checkbox" id="toggleDiagonal" checked> Diagonales
</label>
```

**Fichier JS :** `script.js`

Le toggle difficulté met à jour la variable `difficulty` et recolorie immédiatement toutes les cellules non-mur :

```js
difficultyToggle.addEventListener("change", (event) => {
    difficulty = event.target.checked;
    for (const row of mainGrid) {
        for (const node of row) {
            if (node !== start && node !== end && !node.isWall) {
                difficulty
                    ? colorCell(node.x, node.y, `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`)
                    : colorCell(node.x, node.y, "");
            }
        }
    }
});
```

Le toggle diagonal met à jour uniquement la variable — l'effet est appliqué au prochain lancement d'algo :

```js
diagonnalToggle.addEventListener("change", (event) => {
    diagonal = event.target.checked;
});
```

**Point clé :** utiliser `const` dans les boucles `for...of` pour éviter la création de variables globales implicites.

---

## 4. Reset partiel

**Objectif :** effacer la visualisation de l'algo (couleurs bleu/jaune) et réinitialiser les données des nodes, sans toucher aux murs ni à `start`/`end`.

**Fichier HTML :**
```html
<button id="resetPartial">Reset Partiel</button>
```

**Fichier JS :** `functions.js`

```js
function resetPartial(grid, start, end, difficulty) {
    for (const row of grid) {
        for (const node of row) {
            node.g = 0;
            node.h = 0;
            node.f = 0;
            node.parent = null;

            if (node !== start && node !== end && !node.isWall) {
                difficulty
                    ? colorCell(node.x, node.y, `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`)
                    : colorCell(node.x, node.y, "");
            }
        }
    }
}
```

**Points clés :**
- `parent` doit être remis à `null` — sinon la reconstruction du chemin peut remonter un ancien chemin résiduel
- Les murs sont skippés grâce à `!node.isWall`

---

## 5. Reset total

**Objectif :** remettre la grille dans son état initial — supprime aussi tous les murs.

**Fichier JS :** `functions.js`

```js
function resetTotal(grid, start, end, difficulty) {
    for (const row of grid) {
        for (const node of row) {
            node.g = 0;
            node.h = 0;
            node.f = 0;
            node.parent = null;
            node.isWall = false; // ← seule différence avec resetPartial

            if (node !== start && node !== end) {
                difficulty
                    ? colorCell(node.x, node.y, `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`)
                    : colorCell(node.x, node.y, "");
            }
        }
    }
}
```

**Différence avec `resetPartial` :** le guard `!node.isWall` est supprimé — toutes les cellules (y compris les anciens murs) sont recolorées.

---

## 6. Choix de l'algorithme

**Fichier HTML :**
```html
<label for="algoSelect">Algorithme</label>
<select id="algoSelect">
    <option value="astar">A*</option>
    <option value="dijkstra">Dijkstra</option>
    <option value="bfs">BFS - Breadth-First Search</option>
    <option value="greedy">Greedy - Best-First Search</option>
</select>
```

Le dispatch est centralisé dans une fonction `algoLauncher` dans `functions.js`. Elle gère les différences de signatures entre les algos :

```js
async function algoLauncher(algorithm, grid, start, end, difficulty, diagonal, heuristique = distanceManhattan) {
    switch (algorithm) {
        case "dijkstra":
            return await dijkstra(grid, start, end, difficulty, diagonal);
        case "bfs":
            return await bfs(grid, start, end, diagonal);
        case "greedy":
            return await greedy(grid, start, end, diagonal, heuristique);
        case "astar":
        default:
            return await aStar(grid, start, end, difficulty, diagonal, heuristique);
    }
}
```

**Point clé :** chaque algo a une signature différente — BFS n'a pas de `difficulty`, Dijkstra n'a pas d'`heuristique`. Le `switch` isole ces différences proprement.

---

## 7. Choix de l'heuristique

**Fichier HTML :**
```html
<label for="heuristiqueSelect">Heuristique</label>
<select id="heuristiqueSelect">
    <option value="manhattan">Distance de Manhattan</option>
    <option value="chebyshev">Distance de Chebyshev</option>
    <option value="euclidienne">Distance Euclidienne</option>
    <option value="octile">Distance d'Octile</option>
</select>
```

Les heuristiques sont des fonctions — un objet de correspondance permet de mapper la valeur du select vers la bonne fonction :

```js
const heuristiques = {
    manhattan: distanceManhattan,
    chebyshev: distanceChebyshev,
    euclidienne: distanceEuclidienne,
    octile: distanceOctile
};

let selectedHeuristique = heuristiques[selectHeuristique.value]; // initialisation

selectHeuristique.addEventListener("change", (event) => {
    selectedHeuristique = heuristiques[event.target.value]; // mise à jour
});
```

**Point clé :** stocker la **fonction elle-même** (pas son nom en string) permet de la passer directement à `algoLauncher` sans mapping supplémentaire.

### Contraintes à connaître

| Situation | Comportement |
|---|---|
| BFS ou Dijkstra sélectionné | L'heuristique choisie n'a aucun effet |
| Diagonales désactivées | Manhattan est forcé en interne par les algos |
| Le select heuristique est utile uniquement pour A* et Greedy avec diagonales activées | |

---

*Voir aussi : [pathfinding.md](pathfinding.md)*
