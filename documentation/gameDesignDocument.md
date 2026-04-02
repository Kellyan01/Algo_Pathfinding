# Game Design Document — Hacktiviste (Titre provisoire)

> Deckbuilding roguelite cyberpunk en JavaScript Vanilla.
> Document évolutif — état au début du projet.

---

## Table des matières

1. [Vision du jeu](#1-vision-du-jeu)
2. [Piliers de design](#2-piliers-de-design)
3. [Univers et thème](#3-univers-et-thème)
4. [Structure d'une run](#4-structure-dune-run)
5. [Mécanique signature — La Reconnaissance](#5-mécanique-signature--la-reconnaissance)
6. [Le système de combat](#6-le-système-de-combat)
7. [Les cartes](#7-les-cartes)
8. [Les ennemis](#8-les-ennemis)
9. [Rejouabilité](#9-rejouabilité)
10. [Scope du premier prototype](#10-scope-du-premier-prototype)

---

## 1. Vision du jeu

**En une phrase :**
> *Un deckbuilder où préparer son coup est aussi important que l'exécuter.*

**En un paragraphe :**
Le joueur incarne un hacktiviste infiltrant les installations d'une MégaCorporation dans une mégapole cyberpunk. Avant chaque confrontation, il dispose d'un temps limité pour explorer la Matrice et découvrir les failles de ses adversaires. Ces informations ouvrent des options de résolution alternatives à la confrontation directe. La tension entre la discrétion et le besoin d'information est le cœur du jeu.

---

## 2. Piliers de design

| Pilier | Description |
|--------|-------------|
| **Préparation récompensée** | Explorer avant d'agir ouvre des options que le joueur pressé n'aura pas |
| **Information asymétrique** | Les ennemis ont des vulnérabilités cachées à découvrir avant de les exploiter |
| **Décisions sans bonne réponse** | Chaque choix a un coût — time, énergie, défense |
| **Rejouabilité par la variété** | Vulnérabilités, rencontres et deck différents à chaque run |

---

## 3. Univers et thème

**Contexte :** Une mégapole cyberpunk dominée par une MégaCorporation sans nom (à définir). Le joueur est un hacktiviste cherchant à exposer ou stopper ses méfaits.

**Les deux types d'obstacles :**

| Type | Exemples | Failles typiques |
|------|----------|-----------------|
| **Physique** | Gardes, drones, tourelles automatiques | Dettes, chantage, angle mort de patrouille |
| **Numérique** | Firewalls, nœuds de surveillance, Glace Noire | Patch obsolète, identifiants compromis, backdoor oubliée |

**Principe d'unification :** Tous les obstacles — physiques ou numériques — sont des **couches de sécurité**. Le verbe du joueur est toujours le même : *trouver la faille, l'exploiter ou la contourner*.

---

## 4. Structure d'une run

```
DÉPART
  │
  ▼
CARTE DU NIVEAU (générée procéduralement — BSP)
  │
  ├─ Nœud Combat      → rencontre ennemie avec les deux phases
  ├─ Nœud Événement   → choix narratif, conséquences mécaniques
  ├─ Nœud Marchand    → acheter / supprimer des cartes
  └─ Nœud Repos       → soigner ou améliorer une carte
  │
  ▼
BOSS D'ACTE
  │
  ▼
(Acte suivant — 3 actes au total)
  │
  ▼
FIN DE RUN (victoire ou défaite)
```

**Scope v1 :** 1 acte, 1 boss, ~8 nœuds.

---

## 5. Mécanique signature — La Reconnaissance

La mécanique centrale qui distingue ce jeu des autres deckbuilders.

### Les deux phases de chaque combat

```
MODE FANTÔME  ──────────────────────────────────────────►  ALERTE ROUGE
(phase de préparation)                                      (confrontation)

Jauge Détection [██████░░░░] 60%
+X% par tour (base + actions risquées)

Tant que la jauge n'est pas pleine :            Une fois la jauge pleine :
→ Matrice accessible librement                 → Combat ouvert
→ Exploration des failles ennemies             → Matrice disponible MAIS
→ Actions de sabotage discret                    coûte de l'énergie de défense
→ Repositionnement                             → Les failles découvertes
                                                 restent exploitables
```

### La Matrice

Explorer la Matrice en Mode Fantôme révèle la **vulnérabilité unique** de chaque ennemi.

**Structure d'un ennemi :**

```
[ FAÇADE ]         Ce que le joueur voit au départ
                   ex: "Garde — 3 PV, attaque chaque tour"

[ VULNÉRABILITÉ ]  Révélée par scan Matrice
                   ex: "Dettes de jeu importantes"

[ RÉSOLUTION ]     La carte ou combo qui exploite la faille
                   ex: carte "Virement Anonyme" → neutralisé sans combat
```

### La tension centrale

**En Mode Fantôme :**
> *J'ai trouvé la vulnérabilité du garde. Est-ce que je cherche encore pour couvrir le firewall derrière, ou je déclenche maintenant avec ce que j'ai ?*

**En Alerte Rouge :**
> *Je suis à 3 PV. Est-ce que je joue mes cartes défensives, ou je prends un coup pour scanner et trouver la faille qui termine le combat en un tour ?*

### Pourquoi un compteur visible

Le joueur a une **sensation de contrôle** sur ses choix. La profondeur vient des décisions, pas de la chance subie. Cohérent avec les inspirations Slay the Spire et Magic.

---

## 6. Le système de combat

### Ressources du joueur

| Ressource | Description |
|-----------|-------------|
| **PV** | Points de vie — si 0, fin de run |
| **Énergie** | Ressource par tour pour jouer des cartes (ex: 3 par tour) |
| **Discrétion** | Jauge de détection — pleine = Alerte Rouge |
| **Données** | Ressource Matrice — accumulée en scannant, dépensée pour révéler des failles |

### Déroulement d'un tour

```
1. Piocher X cartes
2. Recevoir Y énergie
3. Jouer des cartes (dépensent de l'énergie)
4. Fin de tour :
     → En Mode Fantôme : jauge détection +base%
     → En Alerte Rouge : les ennemis attaquent
5. Défausser la main
```

---

## 7. Les cartes

### Familles de cartes

| Famille | Thème | Effet type |
|---------|-------|-----------|
| **Matrice** | Hack, scan, exploit | Révèle failles, génère Données, exploite vulnérabilités |
| **Terrain** | Déplacement, discrétion | Réduit la jauge, repositionne, sabote discrètement |
| **Confrontation** | Armes, implants | Dégâts, bouclier, effets de status |
| **Social Engineering** | Manipulation, chantage | Exploite les failles humaines |

### Exemples de cartes

**Scan Basique** *(Matrice — Coût 1)*
> Génère 2 Données. Si utilisé en Mode Fantôme : +8% Détection.

**Exploit Zero-Day** *(Matrice — Coût 3)*
> Exploite la vulnérabilité numérique d'une cible révélée. Contourne le combat.

**Virement Anonyme** *(Social Engineering — Coût 2)*
> Exploite la vulnérabilité humaine d'une cible révélée (type Financier). Neutralise sans combat.

**Brouilleur** *(Terrain — Coût 1)*
> Réduit la jauge de Détection de 15%. Ne peut pas être joué en Alerte Rouge.

**Firewall Personnel** *(Confrontation — Coût 1)*
> Gagne 5 points de Bouclier.

**Malware Ciblé** *(Matrice — Coût 2)*
> Inflige 6 dégâts à une cible numérique. Double contre les cibles dont la vulnérabilité est révélée.

---

## 8. Les ennemis

### Exemples d'ennemis — Acte 1

| Ennemi | Type | Façade | Vulnérabilité possible |
|--------|------|--------|----------------------|
| Garde de Nuit | Physique | 12 PV, attaque toutes les 2 tours | Dettes / Famille malade |
| Drone de Surveillance | Numérique | Intouchable, détecte en 3 tours | Firmware obsolète |
| Firewall Corp | Numérique | Bloque le passage, riposte | Clé admin sur photo leaked |
| Vigile Corrompu | Physique | 8 PV, attaque fort | Dossier compromettant |

### Pattern d'intention

Comme dans Slay the Spire, les ennemis affichent leur **intention du prochain tour** (attaque, défense, scan...) pour que le joueur puisse anticiper.

---

## 9. Rejouabilité

| Levier | Implémentation |
|--------|---------------|
| **Génération aléatoire** | Carte BSP différente à chaque run |
| **Vulnérabilités variables** | Chaque ennemi pioche sa vulnérabilité dans un pool |
| **Embranchements** | Choix de nœuds sur la carte |
| **Construction de deck** | Cartes différentes proposées à chaque récompense |
| **Méta-progression** | Nouvelles cartes et reliques débloquées entre les runs |

---

## 10. Scope du premier prototype

**Objectif :** faire tourner la mécanique centrale dans le navigateur.

**Contenu :**
- 1 ennemi avec 1 vulnérabilité
- 5 cartes jouables
- La jauge de détection fonctionnelle
- Le basculement Mode Fantôme → Alerte Rouge
- Pas d'art, pas de carte BSP — juste la mécanique

**Stack :** JavaScript Vanilla, rendu dans le navigateur.

**Étapes suivantes après le prototype :**
1. Ajouter 2-3 ennemis avec des vulnérabilités variées
2. Construire la carte BSP entre les combats
3. Implémenter la récompense de cartes après combat
4. Équilibrage des coûts et de la jauge

---

*Document vivant — à mettre à jour au fil du développement.*
