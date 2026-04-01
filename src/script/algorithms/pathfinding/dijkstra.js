//Algo dijkstra pour trouver le chemin le plus court entre deux points
async function dijkstra(grid, start, end, difficultyMode = false, diagonal = false){
    const openList = [];
    const closedList = [];
    openList.push(start);

    //tant que la liste ouverte n'est pas vide
    while(openList.length > 0){
        //trouver le noeud avec le f le plus bas
        let current = openList.reduce((min,node) => node.f < min.f ? node : min, openList[0]);

        //si le noeud courant est le point d'arrivé, retourner le chemin
        if(current === end){
            return end;
        }else{
            closedList.push(current);
            openList.splice(openList.indexOf(current), 1);
            if(current !== start) colorCell(current.x, current.y, "lightcoral");
        }

        //vérifier les voisins
        //Sans prise en compte des diagonales (Manathan)
        //const directions = [[-1,0],[1,0],[0,-1],[0,1]];
        //Si prise en compte des diagonales (avec les 3 autres heuristiques) : [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]]
        const directions = diagonal ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]] : [[-1,0],[1,0],[0,-1],[0,1]];
        for(const [dy, dx] of directions){

            const nx = current.x + dx;
            const ny = current.y + dy;

            // ignorer si hors limites
            if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

            const neighbor = grid[ny][nx];

            // ignorer murs et noeuds déjà explorés
            if(neighbor.isWall || closedList.includes(neighbor)) continue;

            // calculer g pour le voisin
            //coût réel du déplacement (1 pour cardinal, √2 pour diagonal)
            const moveCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
            const difficulty = difficultyMode ? neighbor.difficulty : 0;
            const newG = current.g + moveCost + difficulty // coût du chemin actuel + difficulté du voisin + difficulté du node

            // si le voisin n'est pas dans la liste ouverte, ou si un chemin plus court est trouvé
            if(!openList.includes(neighbor)){
                // nouveau noeud : calculer g, h, f et définir son parent
                neighbor.g = newG;
                neighbor.f = neighbor.g;
                neighbor.parent = current;
                openList.push(neighbor);
            } else if(newG < neighbor.g){
                // chemin plus court trouvé : mettre à jour
                neighbor.g = newG;
                neighbor.f = neighbor.g;
                neighbor.parent = current;
            }
        }
        // pause de 50ms pour visualiser l'algorithme en temps réel
        await sleep(50);
    }

    return null; // aucun chemin trouvé
}