//Algorithme Greedy Best-First Search
async function greedy(grid, start, end, diagonal = false, heuristique = distanceManhattan){
    const  closedList = new Set();
    const openQueue = new PriorityQueue();
    openQueue.push(start);

    // Si diagonal est false, Manhattan est toujours la bonne heuristique
    const h = diagonal ? heuristique : distanceManhattan;

    //tant que la liste ouverte n'est pas vide
    while(openQueue.size > 0){
        //trouver le noeud avec le f le plus bas
        let current = openQueue.pop();

        //si le noeud courant est le point d'arrivé, retourner le chemin
        if(current === end){
            return end; // chemin trouvé
        }else{
            //ajouter le noeud courant à la liste fermée
            closedList.add(current);
            //coloration pour visualiser l'algorithme en temps réel
            if(current !== start) colorCell(current.x, current.y, "lightblue");
        }

        //vérifier les voisins
        const directions = diagonal ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]] : [[-1,0],[1,0],[0,-1],[0,1]];
        for(const [dy, dx] of directions){
            // coordonnées du voisin
            const nx = current.x + dx;
            const ny = current.y + dy;

            // ignorer si hors limites
            if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

            // voisin
            const neighbor = grid[ny][nx];

            // ignorer murs et noeuds déjà explorés
            if(neighbor.isWall || closedList.has(neighbor)) continue;

            // si le voisin n'est pas dans la liste ouverte, ou si un chemin plus court est trouvé
            if(!openQueue.has(neighbor)){
                // nouveau noeud : h, f et définir son parent
                neighbor.h = h(neighbor, end);
                neighbor.f = neighbor.h;
                neighbor.parent = current;

                // ajouter à la liste ouverte
                openQueue.push(neighbor);

            }
        }
        // pour visualiser l'algorithme en temps réel
        await sleep(50);
    }

    return null; // aucun chemin trouvé
}