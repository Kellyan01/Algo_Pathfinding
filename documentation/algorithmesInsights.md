# Réflexions sur les Algorithmes — Insights de la semaine

> Document de synthèse issu d'une session de réflexion sur les algorithmes de pathfinding et de génération procédurale.
> Complément aux documents techniques : `aStarLesson.md`, `labyrinthGenerator.md`, `dungeonGenerator.md`, `pathfinding.md`

---

## Table des matières

1. [Un principe fondateur, des paramètres ajustables](#1-un-principe-fondateur-des-paramètres-ajustables)
2. [La famille des algorithmes de pathfinding](#2-la-famille-des-algorithmes-de-pathfinding)
3. [BSP — un cadre, pas une stratégie](#3-bsp--un-cadre-pas-une-stratégie)
4. [La fonction de coût — le vrai levier d'A*](#4-la-fonction-de-coût--le-vrai-levier-da)
5. [Vers de nouveaux algorithmes](#5-vers-de-nouveaux-algorithmes)
6. [La démarche générale](#6-la-démarche-générale)

---

## 1. Un principe fondateur, des paramètres ajustables

La semaine d'apprentissage a fait émerger un pattern transversal, valable bien au-delà des algorithmes étudiés :

> **Un algorithme = un mécanisme qui décrit comment les données circulent + des paramètres injectés qui décident quoi en faire.**

Ce n'est pas propre aux algorithmes de pathfinding. C'est un principe général :

- `sort()` est un mécanisme. La fonction de comparaison est le paramètre — `sort` ne sait pas ce qu'est "plus grand que", on le lui dit.
- `map()` et `filter()` sont des mécanismes. La fonction de transformation ou de sélection est le paramètre.
- **A\*** est un mécanisme. L'heuristique et la fonction de coût sont les paramètres.
- **BSP** est un mécanisme. La stratégie de découpe est le paramètre.

La vraie compétence n'est pas de mémoriser des algorithmes — c'est d'identifier les *degrés de liberté* d'un système, et de se demander : **"qu'est-ce que je peux y brancher ?"**

---

## 2. La famille des algorithmes de pathfinding

### Le mécanisme commun

Tous les algorithmes de pathfinding étudiés partagent le même mécanisme fondateur :

```
1. Maintenir une liste ouverte (nœuds à explorer)
2. Maintenir une liste fermée (nœuds déjà traités)
3. À chaque itération : sélectionner le meilleur nœud de la liste ouverte
4. Explorer ses voisins
5. Répéter jusqu'à atteindre l'arrivée
```

Ce qui varie entre les algorithmes, c'est **le critère de sélection** à l'étape 3 — c'est-à-dire ce qu'on entend par "meilleur".

### La formule unificatrice

```
f = g + h

g = coût réel depuis le départ       (connu, mesuré)
h = estimation du coût vers l'arrivée (estimé, ou ignoré)
```

### Les quatre variantes comme un seul espace de paramètres

| Algorithme | g pris en compte | h pris en compte | Arrivée connue | Comportement |
|---|---|---|---|---|
| **BFS** | ✗ | ✗ | non requis | Explore en cercles, optimal en nombre de pas |
| **Dijkstra** | ✓ | ✗ | non requis | Optimal avec coûts variables, explore dans toutes les directions |
| **Greedy** | ✗ | ✓ | requise | Fonce vers l'arrivée, rapide mais non optimal |
| **A\*** | ✓ | ✓ | requise | Optimal et efficace, combine le meilleur des deux |

> A\* sans heuristique (h = 0) **devient** Dijkstra.
> A\* sans coût réel (g ignoré) **devient** Greedy.

Ce ne sont pas quatre algorithmes différents — c'est **un seul cadre avec deux paramètres booléens**.

### Ce que ça implique pour le choix

Le bon algorithme n'est pas celui qu'on "connaît le mieux" — c'est celui dont les paramètres activés correspondent au problème :

- Destination inconnue → pas de h possible → **Dijkstra**
- Terrain uniforme, connexité seule → g inutile → **BFS**
- Rapidité > optimalité → **Greedy**
- Optimalité sur terrain variable avec destination connue → **A\***

---

## 3. BSP — un cadre, pas une stratégie

### Ce que BSP spécifie

Binary Space Partitioning est une **structure de données**, pas un algorithme avec une stratégie intégrée. Il décrit *comment organiser* les résultats d'une découpe récursive :

```
1. Prendre un espace
2. Le couper en deux avec un hyperplan
3. Récurser sur chaque moitié
4. Stocker le résultat dans un arbre binaire
```

La question *"où placer le plan de coupe ?"* est entièrement extérieure à BSP. C'est le paramètre injectable.

### Les stratégies de découpe selon l'usage

| Usage | Stratégie de découpe | Pourquoi |
|---|---|---|
| Génération procédurale | Aléatoire | L'aléatoire crée de la variété — c'est le but |
| Détection de collision | Médiane des obstacles | Équilibre l'arbre pour minimiser les vérifications |
| Moteur 3D | Plans des polygones existants | Les murs du niveau *sont* les plans naturels |
| Mode interactif | L'opérateur choisit après visualisation | Contrôle humain sur la partition |

### Ce que ça change selon le contexte

En génération procédurale, l'aléatoire est une *fonctionnalité* — il produit des salles variées. En détection de collision, l'aléatoire serait un *problème* — une mauvaise coupe crée des zones déséquilibrées qui annulent le gain de performance.

> **Même outil, critère de découpe opposé selon l'objectif.**

### Application concrète : drone et détection de collision

Sans BSP, un drone vérifie sa collision avec chaque obstacle à chaque milliseconde — coût O(n).

Avec BSP, l'espace est partitionné une seule fois avant le vol. Au moment critique, le drone interroge uniquement la zone qui le contient — coût O(log n) pour descendre l'arbre, puis vérification sur un sous-ensemble réduit.

```
Coût initial (offline) : construction de l'arbre BSP  → accepté une fois
Coût en vol (realtime) : vérification dans une zone    → très rapide
```

---

## 4. La fonction de coût — le vrai levier d'A*

### L'insight de l'adaptation

En intégrant la difficulté de terrain dans A\*, on ne modifie pas l'algorithme — on change uniquement ce que `g` représente :

```js
// Version basique (terrain uniforme)
newG = current.g + 1

// Terrain non uniforme (première adaptation)
newG = current.g + node.difficulty
```

Le mécanisme A\* reste identique. Seule la définition du coût évolue.

### Les extensions possibles

La fonction de coût peut absorber n'importe quelle réalité physique ou économique :

```js
// Rendement d'un véhicule
newG = current.g + (node.difficulty / vehicle.efficiency)

// Direction du vent (favorise ou pénalise)
newG = current.g + node.difficulty + windCost(direction, windVector)

// Combinaison multi-facteurs
newG = current.g + node.difficulty * fuelCost(vehicle, wind, altitude)
```

### Des "nouveaux algorithmes" qui existent déjà

| Idée intuitive | Forme établie | Usage réel |
|---|---|---|
| Vent + déplacement | Navigation maritime/aérienne | Routes océaniques optimisant carburant + courants + météo |
| Rendement variable | Planification d'énergie | Calcul de trajectoire minimisant la consommation (GPS EV) |
| Coût dynamique en temps réel | **D\* Lite** | Robots, véhicules autonomes, obstacles mouvants |
| Plusieurs critères simultanés | **Algorithmes de Pareto** | GPS "rapide vs économique" |

### Le cas multi-critères

Dans A\* classique, tous les coûts sont ramenés à un seul nombre. Mais certains critères sont incomparables :

> *Quel chemin choisir — le plus rapide, ou celui qui consomme le moins ?*

Il n'y a pas une seule bonne réponse. Il existe un **front de Pareto** — un ensemble de solutions où améliorer un critère dégrade nécessairement l'autre. Les GPS qui proposent plusieurs modes de calcul résolvent exactement ce problème.

---

## 5. Vers de nouveaux algorithmes

### La démarche de création

La plupart des variantes d'algorithmes existants sont nées d'une question simple :

> *"Qu'est-ce que je peux injecter de différent dans ce mécanisme ?"*

C'est exactement ce qui a produit :
- **D\* Lite** : A\* avec une fonction de coût qui se recalcule dynamiquement
- **JPS** : A\* avec une stratégie de sélection des voisins optimisée pour les grilles uniformes
- **HPA\*** : A\* appliqué à deux niveaux de granularité (zones puis cases)
- **Theta\*** : A\* avec une heuristique intégrant la ligne de vue

Dans chaque cas : **même mécanisme fondateur, paramètre différent**.

### Ce que ça signifie en pratique

Quand on rencontre un nouveau problème de pathfinding ou de partition, les bonnes questions sont :

1. Quel est le mécanisme de base applicable ?
2. Quels sont ses paramètres injectables ?
3. Quelle valeur de ces paramètres correspond à mon problème ?
4. Existe-t-il déjà un algorithme qui a répondu à cette question ?

---

## 6. La démarche générale

Ce que cette semaine a révélé, au-delà des algorithmes spécifiques :

**Comprendre un algorithme**, c'est identifier :
- Son **invariant** — ce qui ne change jamais (la structure de données, la boucle principale)
- Ses **paramètres libres** — ce qu'on injecte pour l'adapter
- Ses **garanties** — ce qu'il promet si les paramètres respectent certaines conditions (ex : admissibilité de l'heuristique pour A\*)

**Créer ou adapter un algorithme**, c'est :
- Conserver l'invariant
- Modifier un paramètre libre
- Vérifier que les garanties tiennent encore

C'est précisément ce qui s'est passé avec l'adaptation d'A\* pour le terrain non uniforme : l'invariant (la boucle, les listes) est resté intact, le paramètre `g` a été enrichi, et la garantie d'optimalité a tenu car la fonction de coût reste positive.

---

*Document vivant — à enrichir au fil des apprentissages.*
*Voir aussi : `aStarLesson.md` | `labyrinthGenerator.md` | `dungeonGenerator.md` | `gameDesignDocument.md`*
