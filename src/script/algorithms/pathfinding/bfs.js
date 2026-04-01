//Algo BFS (Breadth-First Search)
//Ce code implémente l'algorithme de recherche en largeur (BFS) pour trouver un chemin entre deux points dans une grille.

async function bfs(grid, start, end, diagonal = false){
    const openList = [start]; // Liste des nœuds à explorer
    const closedList = new Set(); // Ensemble des nœuds déjà explorés

    while(openList.length > 0){
        let current = openList.shift(); // Récupère le premier nœud de la liste

        if(current === end){
            return current; // Chemin trouvé
        }else{
            closedList.add(current); // Marque le nœud comme exploré
            if(current !== start) colorCell(current.x, current.y, "lightcoral"); // Colorie le nœud exploré

            // Vérifie les voisins (haut, bas, gauche, droite)
            const directions = diagonal ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]] : [[-1,0],[1,0],[0,-1],[0,1]];
            for(const [dy, dx] of directions){
                const nx = current.x + dx;
                const ny = current.y + dy;
                // Ignore les nœuds hors limites
                if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

                const neighbor = grid[ny][nx];

                // Ignore les murs et les nœuds déjà explorés
                if(neighbor.isWall || closedList.has(neighbor) || openList.includes(neighbor)) continue;

                neighbor.parent = current; // Définit le parent du voisin pour reconstruire le chemin

                openList.push(neighbor); // Ajoute le voisin à la liste des nœuds à explorer
            }
        }

        await sleep(50); // Pour visualiser l'algorithme en temps réel
    }

    return null; // Aucun chemin trouvé
}