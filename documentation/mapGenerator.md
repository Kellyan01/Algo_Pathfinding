# Génération de Carte Naturelle

> Document pédagogique sur les algorithmes de génération procédurale de cartes naturelles.
> Une carte naturelle se distingue d'un labyrinthe ou d'un donjon par l'absence de murs — elle est définie par des **valeurs continues** (altitude, humidité, température) qui déterminent les biomes et les coûts de traversée.

---

## Table des matières

1. [Labyrinthe / Donjon vs Carte naturelle](#1-labyrinthe--donjon-vs-carte-naturelle)
2. [Bruit de Perlin / Simplex Noise](#2-bruit-de-perlin--simplex-noise-)
3. [Voronoi — Diagramme de Thiessen](#3-voronoi--diagramme-de-thiessen)
4. [Diamond-Square — Terrain fractal](#4-diamond-square--terrain-fractal)
5. [Érosion hydraulique](#5-érosion-hydraulique)
6. [Cellular Automata — Variation naturelle](#6-cellular-automata--variation-naturelle)
7. [Comparaison et recommandations](#7-comparaison-et-recommandations)
8. [Lien avec le Pathfinding](#8-lien-avec-le-pathfinding)

---

## 1. Labyrinthe / Donjon vs Carte naturelle

Les algorithmes de génération de labyrinthes et de donjons (DFS, BSP, etc.) partagent tous le même paradigme : un espace découpé en **cases sol/mur**. Les murs définissent des limites binaires — une case est soit franchissable, soit non.

Une **carte naturelle** fonctionne différemment. Il n'y a pas de murs, il y a de la **continuité**. Une montagne n'est pas un mur, c'est une zone à haute altitude. Une forêt n'est pas un obstacle, c'est une zone avec un coût de traversée plus élevé.

| | Labyrinthe / Donjon | Carte naturelle |
|--|---------------------|-----------------|
| **Unité de base** | Case sol/mur (binaire) | Case avec une valeur continue (altitude, humidité...) |
| **Contrainte** | Connexité, absence de zones isolées | Continuité, cohérence des biomes |
| **Pathfinding** | Éviter les murs (`isWall`) | Préférer les cases à faible coût (`difficulty`) |
| **Algos principaux** | DFS, BSP, Cellular Automata | Perlin, Voronoi, Diamond-Square |

> **Lien direct avec ce projet :** le champ `difficulty` de la classe `Node` est exactement ce qui modélise un terrain naturel — tous les noeuds sont traversables, mais avec un coût variable selon le biome.

---

## 2. Bruit de Perlin / Simplex Noise ⭐

> L'algorithme de référence pour toute génération de terrain naturel. Utilisé dans Minecraft, No Man's Sky, et la grande majorité des jeux procéduraux.

### Principe

Générer une fonction de bruit **continu** qui produit des valeurs entre -1 et 1. Contrairement au bruit aléatoire pur, les valeurs voisines sont **corrélées** — les transitions sont douces, les formes naturelles.

```
Bruit aléatoire pur :    Bruit de Perlin :
0.1  0.9  0.2  0.7       0.1  0.2  0.3  0.4
0.6  0.3  0.8  0.1   →   0.2  0.3  0.5  0.6
0.4  0.7  0.1  0.5       0.3  0.5  0.7  0.7
0.9  0.2  0.6  0.3       0.4  0.6  0.7  0.6

Chaotique                Doux, montagneux
```

### Seuils de biomes

Une fois la valeur d'altitude obtenue pour chaque case, on applique des seuils pour assigner un biome :

```js
function getBiome(altitude) {
    if (altitude < 0.2) return 'eau profonde';
    if (altitude < 0.3) return 'eau peu profonde';
    if (altitude < 0.4) return 'plage / prairie basse';
    if (altitude < 0.6) return 'forêt / plaine';
    if (altitude < 0.8) return 'colline / forêt dense';
    if (altitude < 0.9) return 'montagne';
    return 'sommet enneigé';
}
```

### Octaves — superposer les détails

Le vrai Perlin superpose plusieurs couches de bruit à **fréquences et amplitudes différentes** (grandes formes + petits détails) :

```
Octave 1 (basse fréquence, haute amplitude)  → continents, grandes vallées
Octave 2 (fréquence × 2, amplitude / 2)      → collines, reliefs moyens
Octave 3 (fréquence × 4, amplitude / 4)      → rochers, irrégularités
...

altitude_finale = octave1 + octave2 + octave3 + ...
```

Plus il y a d'octaves, plus le terrain est détaillé — mais plus c'est coûteux à calculer.

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Résultat très naturel et continu | Implémentation de base non triviale |
| Paramétrable (échelle, octaves, seuils) | Peut nécessiter une lib JS (simplex-noise) |
| Standard industriel | |

**Cas d'usage :** Minecraft (biomes, relief), No Man's Sky (planètes), la quasi-totalité des jeux open world procéduraux.

---

## 3. Voronoi — Diagramme de Thiessen

> Idéal pour délimiter des zones géographiques distinctes (biomes, régions, territoires).

### Principe

Placer des **graines** (points) aléatoirement sur la carte, puis assigner chaque case à la graine la plus proche. Chaque région prend un biome.

```
Graines placées :         Régions Voronoi :
· · A · · B ·             a a a B B B b
· · · · · · ·    →        a a a a B B b
· C · · · · ·             c c c a a B b
· · · · D · ·             c c c c D D d
```

Chaque région est **convexe** et représente le "territoire" naturel de sa graine.

### Utilisation avec des biomes

```js
const seeds = [
    { x: 3,  y: 2,  biome: 'forêt',  difficulty: 2 },
    { x: 15, y: 8,  biome: 'désert', difficulty: 3 },
    { x: 8,  y: 15, biome: 'marais', difficulty: 4 },
    { x: 18, y: 18, biome: 'plaine', difficulty: 1 },
];

function getClosestSeed(x, y, seeds) {
    let closest = null;
    let minDist = Infinity;
    for (const seed of seeds) {
        const dist = Math.hypot(x - seed.x, y - seed.y);
        if (dist < minDist) { minDist = dist; closest = seed; }
    }
    return closest;
}
```

### Voronoi + Perlin combinés

Une technique courante : utiliser Voronoi pour définir les **grandes régions** (biomes) et Perlin pour ajouter du **détail** à l'intérieur de chaque région (relief, variation locale).

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Transitions nettes entre biomes | Frontières trop droites si non lissées |
| Simple à implémenter | Peu de continuité entre régions |
| Très visuel et lisible | |

**Cas d'usage :** Minecraft (biomes larges), Civilization (zones géographiques), génération de cartes de jeux de stratégie.

---

## 4. Diamond-Square — Terrain fractal

> Le prédécesseur du Perlin. Simple à implémenter, donne des terrains fractals naturels.

### Principe

Partir de 4 coins avec des altitudes initiales, calculer le centre par **moyenne + décalage aléatoire**, puis répéter récursivement sur chaque sous-carré.

```
Étape Diamond :          Étape Square :
A · · · B                A · M · B
· · · · ·                · D · D ·
· · M · ·   →            M · C · M
· · · · ·                · D · D ·
C · · · D                C · M · D

M = moyenne(A,B,C,D) + aléatoire
```

À chaque itération, le décalage aléatoire est réduit — ce qui crée une structure **auto-similaire** (fractalité).

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Très simple à implémenter | Artefacts visibles aux bords |
| Résultat fractal naturel | Moins réaliste que Perlin |
| Rapide | Grille doit être de taille 2^n + 1 |

**Cas d'usage :** génération de terrains 3D ancienne génération, démos et apprentissage.

---

## 5. Érosion hydraulique

> La technique pour obtenir des terrains ultra-réalistes. Coûteuse mais impressionnante.

### Principe

Simuler des **gouttes de pluie** qui descendent la pente, emportent de la matière (érosion) et la déposent plus bas (sédimentation). Appliquée sur un terrain Perlin, elle creuse des vallées, arrondit les pics et crée des deltas naturels.

```
Terrain Perlin brut :     Après érosion hydraulique :
▲▲▲▲▲▲▲▲▲                ▲▲△△▲▲▲△▲
▲▲▲▲▲▲▲▲▲    →            ▲△△△▲△▲▲▲
▲▲▲▲▲▲▲▲▲                ▲▲△▼▼△▲▲▲
                           ▲▲▲▼▼▼△▲▲   ← vallée creusée
```

### Avantages / Limites

| ✅ Avantages | ❌ Limites |
|------------|----------|
| Résultat extrêmement réaliste | Très coûteux (milliers d'itérations) |
| Vallées, berges, deltas naturels | Complexe à implémenter |
| Utilisé dans les AAA | |

**Cas d'usage :** Dwarf Fortress, générateurs de monde réalistes, outils de création de cartes de jeux.

---

## 6. Cellular Automata — Variation naturelle

Les Cellular Automata sont déjà couverts dans le contexte des donjons (grottes). Avec des **règles différentes**, le même principe génère des structures naturelles très différentes.

### Règles pour les côtes et îles

```
Règle "île" :
  Densité initiale eau : 60%
  Si une case a ≥ 5 voisins eau → devient eau
  Sinon → devient terre
  Résultat : archipels, îles, côtes irrégulières
```

### Règles pour les forêts

```
Règle "forêt" :
  Densité initiale arbre : 50%
  Si une case a ≥ 4 voisins arbres → reste / devient forêt
  Sinon → devient prairie
  Résultat : massifs forestiers avec clairières naturelles
```

La même mécanique de base s'adapte à n'importe quel type de terrain en changeant simplement les seuils et la densité initiale.

---

## 7. Comparaison et recommandations

| Algorithme | Organicité | Contrôle | Complexité | Cas d'usage |
|-----------|-----------|---------|-----------|-------------|
| **Perlin / Simplex** | ✅✅ Très naturel | ✅ Bon | Moyenne | Terrain général, relief |
| **Voronoi** | ✅ Régions nettes | ✅✅ Fort | Faible | Biomes, zones distinctes |
| **Diamond-Square** | ✅ Fractal | ✅ Moyen | Faible | Terrain simple, apprentissage |
| **Érosion hydraulique** | ✅✅✅ Réaliste | ❌ Faible | Très élevée | Terrain ultra-réaliste |
| **Cellular Automata** | ✅ Organique | ❌ Faible | Faible | Côtes, forêts, îles |

### Recommandation selon le projet

| Objectif | Algorithme recommandé |
|----------|----------------------|
| Première carte naturelle jouable | **Voronoi** (rapide, lisible) |
| Terrain avec relief réaliste | **Perlin Noise** |
| Carte avec biomes distincts | **Voronoi + Perlin** combinés |
| Îles / côtes organiques | **Cellular Automata** |
| Maximum de réalisme | **Perlin + Érosion hydraulique** |

> **Pour un premier projet :** Voronoi est le meilleur point de départ — simple à implémenter, résultat immédiatement lisible, et directement connecté au système de `difficulty` déjà en place.

---

## 8. Lien avec le Pathfinding

La génération de carte naturelle et le pathfinding sont intimement liés — encore plus que pour les donjons.

| Biome | `difficulty` suggéré | Impact A* |
|-------|---------------------|-----------|
| Eau profonde | `Infinity` (ou `isWall`) | Infranchissable |
| Eau peu profonde | 5 | Très évité |
| Plage / route | 1 | Préféré |
| Plaine | 1-2 | Neutre |
| Forêt | 3-4 | Contourné si possible |
| Colline | 4-5 | Fortement contourné |
| Montagne | 8-10 | Quasi infranchissable |

### Ce que ça met en valeur dans A*

Sur une carte naturelle, A* doit arbitrer entre **longueur du chemin** et **coût du terrain** :

- **Dijkstra** : trouve le chemin de coût minimal, explore beaucoup
- **A\*** : utilise l'heuristique pour s'orienter vers la destination, explore moins
- **Greedy** : fonce vers la destination, ignore les coûts — mauvais sur terrain varié

> La **vraie puissance d'A*** se révèle sur les cartes naturelles : l'heuristique guide l'exploration tout en respectant les coûts de terrain, là où Dijkstra brute-force et Greedy se trompe de route.

### Génération + Pathfinding : flux typique

```
1. Générer les altitudes (Perlin / Voronoi / Diamond-Square)
2. Assigner les biomes selon les seuils
3. Traduire chaque biome en difficulty sur les nodes
4. Lancer A* → le chemin évite naturellement les zones coûteuses
```

---

*Voir aussi : [pathfinding.md](pathfinding.md) | [labyrinthGenerator.md](labyrinthGenerator.md) | [dungeonGenerator.md](dungeonGenerator.md)*
