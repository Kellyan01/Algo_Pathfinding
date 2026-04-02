# Panel de contrôle — Implémentation

> Document décrivant la mise en place de l'interface de contrôle du visualiseur de pathfinding.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Création de la grille](#2-création-de-la-grille)
3. [Dungeon Generator BSP](#3-dungeon-generator-bsp)
4. [Sélecteur de builder (radio buttons)](#4-sélecteur-de-builder-radio-buttons)
5. [Clic sur la grille — dispatch par builder actif](#5-clic-sur-la-grille--dispatch-par-builder-actif)
6. [Toggles Difficulté et Diagonales](#6-toggles-difficulté-et-diagonales)
7. [Reset partiel](#7-reset-partiel)
8. [Reset total](#8-reset-total)
9. [Choix de l'algorithme](#9-choix-de-lalgorithme)
10. [Choix de l'heuristique](#10-choix-de-lheuristique)

---

## 1. Vue d'ensemble

Le panel est un `<aside>` dans le HTML contenant l'ensemble des contrôles. Côté JS, chaque contrôle est câblé dans `script.js` via des listeners sur les éléments du DOM.

Les variables d'état globales sont déclarées en haut de `script.js` :

```js
let gridRow = 20;
let gridCol = 20;
let difficulty = true;
let diagonal = true;
let selectedAlgo = selectAlgo.value;
let selectedHeuristique = heuristiques[selectHeuristique.value];
let start;
let end;
```

`start` et `end` sont initialement `undefined` — ils sont assignés via le builder (radio buttons + clic sur la grille).

---

## 2. Création de la grille

**Fichier HTML :**
```html
<h2>Génération de la Grille</h2>
<label><input type="number" id="gridWidth"> Largeur</label>
<label><input type="number" id="gridHeight"> Hauteur</label>
<button id="gridCreation">Générer la Grille</button>
```

**Fichier JS :** `script.js`

Au chargement, la grille est créée avec les valeurs par défaut (`20×20`) :
```js
container.style.width = gridCol * 42 + "px";
container.style.height = gridRow * 42 + "px";
let mainGrid = createGrid(gridRow, gridCol);
renderGrid(mainGrid, container, difficulty);
```

Le bouton recrée la grille avec les nouvelles dimensions saisies :
```js
gridCreationBtn.addEventListener("click", (event) => {
    gridRow = parseInt(gridHeight.value);
    gridCol = parseInt(gridWidth.value);

    if (!gridRow >= 5 || !gridCol >= 5) {
        alert("Vous devez entrer une Largeur et une Hauteur d'au moins 5 cases");
        return;
    }

    container.innerText = null; // vider le container
    container.style.width = gridCol * 42 + "px";
    container.style.height = gridRow * 42 + "px";
    mainGrid = createGrid(gridRow, gridCol);
    renderGrid(mainGrid, container, difficulty);
});
```

**`renderGrid`** accepte un troisième paramètre `colorDifficulty` — si `true`, chaque cellule est colorée dès le rendu selon la difficulté du node :

```js
function renderGrid(grid, container, colorDifficulty = false) {
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const div = document.createElement("div");
            if (colorDifficulty) {
                const d = grid[i][j].difficulty;
                div.style.backgroundColor = `hsl(30, ${d * 10}%, ${100 - d * 5}%)`;
            }
            div.setAttribute("data-x", j);
            div.setAttribute("data-y", i);
            container.append(div);
        }
    }
}
```

---

## 3. Dungeon Generator BSP

**Fichier HTML :**
```html
<h2>Dungeon Generator</h2>
<label><input type="number" id="roomMinSize"> Taille minimum d'une pièce</label>
<label><input type="number" id="roomMaxSize"> Taille maximum d'une pièce</label>
<button id="generateDungeonBSP">Générer Donjon BSP</button>
```

**Fichier JS :** `script.js`

```js
generateDungeonBSPBtn.addEventListener("click", () => {
    resetTotal(mainGrid, start, end, difficulty);

    const minSize = parseInt(document.getElementById("roomMinSize").value);
    const maxSize = parseInt(document.getElementById("roomMaxSize").value);

    if (minSize <= 2 || maxSize <= 2) {
        alert("Les tailles doivent toutes être supérieur à 2");
        return;
    }
    if (minSize > maxSize) {
        alert("la taille minimum doit être inférieur ou égale à la taille maximum");
        return;
    }

    generateBSP(mainGrid, minSize, maxSize);

    for (const row of mainGrid) {
        for (const node of row) {
            if (node === start || node === end) continue;
            if (node.isWall) {
                colorCell(node.x, node.y, "black");
            } else {
                difficulty
                    ? colorCell(node.x, node.y, `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`)
                    : colorCell(node.x, node.y, "");
            }
        }
    }
});
```

**Points clés :**
- Un `resetTotal` est appelé avant la génération pour repartir d'une grille propre
- Validation : `minSize` et `maxSize` doivent être > 2, et `minSize <= maxSize`
- Après génération, toute la grille est recolorée manuellement (murs en noir, sol selon mode difficulté)

---

## 4. Sélecteur de builder (radio buttons)

**Fichier HTML :**
```html
<h2>Sélectionnez votre Builder</h2>
<section>
    <label for="offRadio"><input type="radio" id="offRadio" name="builder" checked>Désactivé</label>
    <label for="wallRadio"><input type="radio" id="wallRadio" name="builder">Mur</label>
    <label for="startRadio"><input type="radio" id="startRadio" name="builder">Départ</label>
    <label for="endRadio"><input type="radio" id="endRadio" name="builder">Arrivé</label>
</section>
```

Le builder actif détermine ce que fait un clic sur la grille. Le radio `offRadio` est coché par défaut — les clics sont ignorés tant qu'aucun builder n'est sélectionné.

---

## 5. Clic sur la grille — dispatch par builder actif

**Fichier JS :** `script.js`

Le listener sur `#container` lit le radio button coché et dispatch vers la bonne fonction :

```js
container.addEventListener("click", (event) => {
    const wallRadio = document.getElementById("wallRadio");
    const startRadio = document.getElementById("startRadio");
    const endRadio = document.getElementById("endRadio");
    const offRadio = document.getElementById("offRadio");

    const x = parseInt(event.target.getAttribute("data-x"));
    const y = parseInt(event.target.getAttribute("data-y"));
    const node = mainGrid[y][x];

    switch (true) {
        case wallRadio.checked:
            buildWall(mainGrid, event.target, node, x, y, difficulty);
            break;
        case startRadio.checked:
            start = placeNode(mainGrid, x, y, start, difficulty, "green");
            break;
        case endRadio.checked:
            end = placeNode(mainGrid, x, y, end, difficulty, "red");
            break;
        case offRadio.checked:
            break;
        default:
            alert("Sélectionnez un builder");
            return;
    }
});
```

### `buildWall` — poser / supprimer un mur

**Fichier :** `functions.js`

```js
function buildWall(grid, target, node, x, y, difficultyMode) {
    if (node === start || node === end) return; // intouchables
    if (node.isWall) {
        grid[y][x].isWall = false;
        if (difficultyMode) {
            const d = node.difficulty;
            target.style.backgroundColor = `hsl(30, ${d * 10}%, ${100 - d * 5}%)`;
            return;
        }
        colorCell(x, y, "");
        return;
    }
    colorCell(x, y, "black");
    grid[y][x].isWall = true;
}
```

**Point clé :** quand un mur est supprimé, la couleur restaurée dépend de l'état du toggle difficulté.

### `placeNode` — placer / déplacer le départ ou l'arrivée

**Fichier :** `functions.js`

```js
function placeNode(grid, x, y, node, difficultyMode, color) {
    if (node) {
        // reset la couleur de l'ancien node
        difficultyMode
            ? colorCell(node.x, node.y, `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`)
            : colorCell(node.x, node.y, "");

        // si on reclique sur le même node → on l'efface (retourne undefined)
        if (node === grid[y][x]) return;
    }
    colorCell(x, y, color);
    return grid[y][x];
}
```

**Points clés :**
- Cliquer une deuxième fois sur le même node le supprime (retourne `undefined`)
- L'ancien node est toujours recoloré avant d'en placer un nouveau
- La valeur retournée est assignée à `start` ou `end` dans `script.js`

---

## 6. Toggles Difficulté et Diagonales

**Fichier HTML :**
```html
<label><input type="checkbox" id="toggleDifficulty" checked> Difficulté</label>
<label><input type="checkbox" id="toggleDiagonal"> Diagonales</label>
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

---

## 7. Reset partiel

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
            node.f = node.g + node.h;
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
- `parent` est remis à `null` — sinon la reconstruction du chemin peut remonter un ancien chemin résiduel
- Les murs sont skippés grâce à `!node.isWall`
- `start` et `end` gardent leur couleur

---

## 8. Reset total

**Objectif :** remettre la grille dans son état initial — supprime les murs, les données algo, et les points `start`/`end`.

**Fichier JS :** `functions.js`

```js
function resetTotal(grid, start, end, difficulty) {
    for (const row of grid) {
        for (const node of row) {
            node.g = 0;
            node.h = 0;
            node.f = node.g + node.h;
            node.parent = null;
            node.isWall = false; // ← seule différence avec resetPartial

            difficulty
                ? colorCell(node.x, node.y, `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`)
                : colorCell(node.x, node.y, "");
        }
    }
}
```

**Fichier JS :** `script.js`

Après l'appel à `resetTotal`, les variables `start` et `end` sont mises à `null` dans `script.js` :

```js
resetTotalBtn.addEventListener("click", (event) => {
    resetTotal(mainGrid, start, end, difficulty);
    start = null;
    end = null;
});
```

**Différences avec `resetPartial` :**
- `node.isWall = false` — tous les murs sont supprimés
- Toutes les cellules sont recolorées (pas de guard `!node.isWall`)
- `start` et `end` sont remis à `null` dans `script.js`

---

## 9. Choix de l'algorithme

**Fichier HTML :**
```html
<label for="algoSelect">Algorithme</label>
<select id="algoSelect">
    <optgroup label="Heuristique">
        <option value="astar">A*</option>
        <option value="greedy">Greedy - Best-First Search</option>
        <option value="biDirectionalAStar">Bidirectionnel A* (non Optimal)</option>
        <option value="biDirectionalAStarOpti">Bidirectionnel A* (Optimal)</option>
    </optgroup>
    <optgroup label="Non Heuristique">
        <option value="dijkstra">Dijkstra</option>
        <option value="bfs">BFS - Breadth-First Search</option>
        <option value="biDirectionalDijkstra">Bidirectionnel Dijkstra (non Optimal)</option>
        <option value="biDirectionalDijkstraOpti">Bidirectionnel Dijkstra (Optimal)</option>
    </optgroup>
</select>
```

Le dispatch est centralisé dans `algoLauncher` dans `functions.js` :

```js
async function algoLauncher(algorithm, grid, start, end, difficulty, diagonal, heuristique = distanceManhattan) {
    switch (algorithm) {
        case "dijkstra":
            return await dijkstra(grid, start, end, difficulty, diagonal);
        case "bfs":
            return await bfs(grid, start, end, diagonal);
        case "greedy":
            return await greedy(grid, start, end, diagonal, heuristique);
        case "biDirectionalAStar":
            return await biDirectionalAStar(grid, start, end, difficulty, diagonal, heuristique);
        case "biDirectionalAStarOpti":
            return await biDirectionalAStarOpti(grid, start, end, difficulty, diagonal, heuristique);
        case "biDirectionalDijkstra":
            return await biDirectionalDijkstra(grid, start, end, difficulty, diagonal);
        case "biDirectionalDijkstraOpti":
            return await biDirectionalDijkstraOpti(grid, start, end, difficulty, diagonal);
        case "astar":
        default:
            return await aStar(grid, start, end, difficulty, diagonal, heuristique);
    }
}
```

**Points clés :**
- Les `<optgroup>` séparent visuellement les algos heuristiques (A*, Greedy, bidirectionnel A*) des non-heuristiques (Dijkstra, BFS, bidirectionnel Dijkstra)
- BFS n'a pas de paramètre `difficulty`, Dijkstra et les bidirectionnels Dijkstra n'ont pas d'`heuristique` — le `switch` isole ces différences proprement

---

## 10. Choix de l'heuristique

**Fichier HTML :**
```html
<label for="heuristiqueSelect">heuristique</label>
<select id="heuristiqueSelect">
    <option value="manhattan">Distance de Manhattan</option>
    <option value="chebyshev">Distance de Chebyshev</option>
    <option value="euclidienne">Distance Euclidienne</option>
    <option value="octile">Distance d'Octile</option>
</select>
```

Les heuristiques sont des fonctions — un objet de correspondance mappe la valeur du select vers la bonne fonction :

```js
const heuristiques = {
    manhattan: distanceManhattan,
    chebyshev: distanceChebyshev,
    euclidienne: distanceEuclidienne,
    octile: distanceOctile
};

let selectedHeuristique = heuristiques[selectHeuristique.value];

selectHeuristique.addEventListener("change", (event) => {
    selectedHeuristique = heuristiques[event.target.value];
});
```

**Point clé :** stocker la **fonction elle-même** (pas son nom en string) permet de la passer directement à `algoLauncher` sans mapping supplémentaire.

### Contraintes à connaître

| Situation | Comportement |
|---|---|
| BFS ou Dijkstra sélectionné | L'heuristique choisie n'a aucun effet |
| Bidirectionnel Dijkstra sélectionné | L'heuristique choisie n'a aucun effet |
| Diagonales désactivées | Manhattan est forcé en interne par les algos |
| Le select heuristique est utile uniquement pour A*, Greedy et Bidirectionnel A* avec diagonales activées | |

---

*Voir aussi : [pathfinding.md](pathfinding.md)*
