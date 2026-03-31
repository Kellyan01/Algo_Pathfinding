# Génération de Donjon

> Document pédagogique sur les algorithmes de génération procédurale de donjons.
> Un donjon se distingue d'un labyrinthe par la présence de **salles** reliées par des **couloirs**.

---

## Table des matières

1. [Labyrinthe vs Donjon](#1-labyrinthe-vs-donjon)
2. [BSP — Binary Space Partitioning](#2-bsp--binary-space-partitioning)
3. [Placement aléatoire + Delaunay + MST](#3-placement-aléatoire--delaunay--mst)
4. [Cellular Automata — Grottes organiques](#4-cellular-automata--grottes-organiques)
5. [Wave Function Collapse](#5-wave-function-collapse)
6. [Comparaison et recommandations](#6-comparaison-et-recommandations)
7. [Lien avec le Pathfinding](#7-lien-avec-le-pathfinding)

---

## 1. Labyrinthe vs Donjon

| | Labyrinthe | Donjon |
|--|-----------|--------|
| Structure | Passages uniformes | Salles + couloirs |
| Connexité | Un seul chemin entre deux points | Plusieurs chemins possibles |
| Boucles | Non (labyrinthe parfait) | Oui (intentionnelles) |
| Exemples | Maze, puzzle | Roguelike, RPG, FPS |

Un donjon est pensé pour être **exploré librement** — pas résolu comme un puzzle. Les boucles sont donc souhaitables pour éviter les culs-de-sac et offrir plusieurs routes au joueur.

---

## 2. BSP — Binary Space Partitioning ⭐

> L'approche la plus populaire pour les roguelikes classiques.

### Principe

Diviser récursivement l'espace en deux jusqu'à obtenir des zones assez petites pour y placer une salle, puis relier les salles en remontant l'arbre.

```
Étape 1 — Découpage :         Étape 2 — Salles :          Étape 3 — Couloirs :
┌─────────────────┐           ┌────────┬────────┐          ┌────────┬────────┐
│                 │           │  ┌──┐  │  ┌─┐   │          │  ┌──┐  │  ┌─┐   │
│   Espace vide   │    →      │  │  │  │  │ │   │    →     │  │  ├──┤  │ │   │
│                 │           │  └──┘  │  └─┘   │          │  └──┘  │  └─┘   │
└─────────────────┘           └────────┴────────┘          └────────┴────────┘
```

### L'algorithme

```
1. Créer un noeud racine = espace entier
2. Tant que les feuilles sont trop grandes :
   a. Choisir une feuille
   b. La couper en deux (vertical ou horizontal) à une position aléatoire
   c. Créer deux enfants (gauche/droite ou haut/bas)
3. Dans chaque feuille, placer une salle aléatoire (plus petite que la feuille)
4. Remonter l'arbre : relier chaque paire de salles frères par un couloir en L
```

### Implémentation simplifiée

```js
class BSPNode {
    constructor(x, y, width, height){
        this.x = x; this.y = y;
        this.width = width; this.height = height;
        this.left = null; this.right = null;
        this.room = null; // salle placée dans cette feuille
    }
}

function splitBSP(node, minSize){
    if(node.width < minSize * 2 && node.height < minSize * 2) return; // trop petit

    const splitHorizontal = Math.random() > 0.5;

    if(splitHorizontal && node.height >= minSize * 2){
        const split = minSize + Math.floor(Math.random() * (node.height - minSize * 2));
        node.left  = new BSPNode(node.x, node.y, node.width, split);
        node.right = new BSPNode(node.x, node.y + split, node.width, node.height - split);
    } else if(node.width >= minSize * 2) {
        const split = minSize + Math.floor(Math.random() * (node.width - minSize * 2));
        node.left  = new BSPNode(node.x, node.y, split, node.height);
        node.right = new BSPNode(node.x + split, node.y, node.width - split, node.height);
    }

    if(node.left)  splitBSP(node.left, minSize);
    if(node.right) splitBSP(node.right, minSize);
}
```

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Salles jamais superposées | Disposition parfois trop régulière |
| Couloirs logiques entre voisins | Manque d'organicité |
| Contrôle facile de la densité | Peu adapté aux grottes |

**Cas d'usage :** Binding of Isaac, Nethack, la majorité des roguelikes classiques.

---

## 3. Placement aléatoire + Delaunay + MST

> L'approche des jeux AAA modernes — plus organique que BSP.

### Principe en 4 étapes

```
Étape 1 : Placer les salles aléatoirement (résoudre les collisions)
Étape 2 : Calculer la triangulation de Delaunay entre les centres des salles
Étape 3 : Extraire l'arbre couvrant minimal (MST) → connexité garantie
Étape 4 : Réintroduire ~15% des arêtes supprimées → créer des boucles
```

### Détail de chaque étape

**Triangulation de Delaunay :** relie chaque salle à ses voisines les plus proches sans que les triangles se croisent. Garantit que chaque salle est connectée à ses voisines naturelles.

**MST (Minimum Spanning Tree) :** extrait le sous-ensemble d'arêtes qui connecte toutes les salles avec le coût total minimal (algorithme de Kruskal ou Prim). Résultat : toutes les salles accessibles, aucune boucle.

**Réintroduction d'arêtes :** ajouter quelques arêtes supprimées crée des boucles — le joueur peut prendre plusieurs routes, ce qui rend l'exploration plus intéressante.

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Disposition organique, naturelle | Plus complexe à implémenter |
| Boucles contrôlées | Nécessite plusieurs algorithmes |
| Très utilisé en production | |

**Cas d'usage :** Spelunky, Dead Cells, Hades.

---

## 4. Cellular Automata — Grottes organiques

> Idéal pour les niveaux naturels : grottes, mines, donjons souterrains.

### Principe

Générer du bruit aléatoire puis appliquer des **règles d'évolution** répétées pour créer des formes organiques.

```
Règle standard :
  Si une cellule a ≥ 5 voisins murs parmi ses 8 voisins → elle devient mur
  Sinon → elle devient sol
```

### Visualisation

```
Bruit initial :    Après 1 itération :    Après 4 itérations :
■ · ■ · ■ ·        ■ ■ · · ■ ■             ■ ■ ■ · · ■
· ■ · ■ · ■        ■ ■ · · · ■             ■ ■ · · · ■
■ · · ■ ■ ·   →   ■ · · · · ·      →      ■ · · · · ·
· ■ ■ · · ■        · · · · · ·             · · · · · ·
■ · ■ ■ · ■        ■ · · · ■ ■             ■ ■ · · ■ ■

Aléatoire          Début de formes         Grottes naturelles
```

### Paramètres ajustables

- **Densité initiale** (% de murs au départ) : 40-55% donne de bons résultats
- **Nombre d'itérations** : 4-5 suffisent généralement
- **Seuil de la règle** : 4 → plus de sol ouvert, 5 → plus de murs

### Problème : zones isolées

Les cellular automata peuvent créer des zones inaccessibles. Solution : utiliser **BFS** pour identifier toutes les zones connexes et relier les plus grandes entre elles.

```js
// Après génération, vérifier la connexité :
function floodFill(grid, startX, startY){ /* BFS pour marquer une zone */ }
// Si plusieurs zones → créer des tunnels entre elles
```

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Résultat très organique et naturel | Peut créer des zones isolées |
| Simple à implémenter | Peu de contrôle sur la forme finale |
| Paramétrable facilement | Pas adapté aux donjons structurés |

**Cas d'usage :** Terraria (grottes), Dwarf Fortress, niveaux naturels.

---

## 5. Wave Function Collapse

> L'approche la plus avancée — génère des niveaux visuellement cohérents à partir de règles.

### Principe

Chaque case observe ses voisines et choisit une **tuile compatible** avec elles, en propageant les contraintes comme en sudoku.

```
1. Chaque case commence avec toutes les tuiles possibles (état superposé)
2. Choisir la case avec le moins de possibilités (entropie minimale)
3. Lui assigner une tuile aléatoire parmi ses possibilités
4. Propager la contrainte aux voisins (éliminer les tuiles incompatibles)
5. Répéter jusqu'à ce que toutes les cases soient résolues
6. En cas de contradiction → backtrack
```

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Résultats visuellement cohérents | Complexe à implémenter |
| Très varié tout en respectant les règles | Peut échouer (backtrack nécessaire) |
| Fonctionne avec n'importe quel tileset | Lent sur grandes grilles |

**Cas d'usage :** Caves of Qud, Noita, génération de niveaux thématiques.

---

## 6. Comparaison et recommandations

### Tableau récapitulatif

| Algorithme | Structure | Organicité | Contrôle | Complexité |
|-----------|-----------|-----------|---------|-----------|
| **BSP** | Salles + couloirs | ❌ Régulier | ✅ Fort | Faible |
| **Delaunay + MST** | Salles + couloirs | ✅ Naturel | ✅ Moyen | Élevée |
| **Cellular Automata** | Grottes ouvertes | ✅✅ Très naturel | ❌ Faible | Faible |
| **Wave Function Collapse** | Thématique | ✅ Cohérent | ✅ Fort | Très élevée |

### Recommandation selon le projet

| Type de donjon | Algorithme recommandé |
|---------------|----------------------|
| Roguelike classique (salles + couloirs) | **BSP** |
| Donjon organique avec boucles | **Delaunay + MST** |
| Grottes naturelles | **Cellular Automata** |
| Niveaux thématiques cohérents | **Wave Function Collapse** |
| Hybride (grottes + salles) | **Cellular Automata + BSP** |

> **Pour un premier projet :** BSP est le meilleur point de départ — structure claire, résultat prévisible, implémentation accessible.

---

## 7. Lien avec le Pathfinding

La génération et le pathfinding sont intimement liés dans un jeu :

| Étape | Algorithme |
|-------|-----------|
| Vérifier que toutes les salles sont accessibles | **BFS** |
| Relier les zones isolées (Cellular Automata) | **BFS** flood fill |
| Navigation des ennemis dans le donjon | **A\*** |
| IA ennemie simple (fonce vers le joueur) | **Greedy** |
| Donjon avec obstacles dynamiques | **D\* Lite** |

> Un donjon généré par BSP est particulièrement bien adapté à A* : les couloirs en L créent des situations où l'heuristique doit arbitrer entre plusieurs routes, rendant la différence entre A* et Dijkstra visible.

---

*Voir aussi : [pathfinding.md](pathfinding.md) | [labyrinthGenerator.md](labyrinthGenerator.md)*
