// Algo de Pathfinding biDirectionnel -> basé sur A*
async function biDirectionalDijkstra(grid, start, end, difficultyMode, diagonal){
    // Map() pour le stockage des données des Node
    const gForward = new Map(); // node -> g calculé par Forward
    const gBackward = new Map(); // node -> g calculé par Backward
    const parentsForward = new Map(); // node -> son parent dans la direction Forward
    const parentsBackward = new Map(); // node -> son parent dans la direction Backward

    // Priority Queue pour les 2 openList
    const openListForward = new PriorityQueue();
    const openListBackward = new PriorityQueue();

    // Set pour les closedList
    const closedListForward = new Set();
    const closedListBackward = new Set();

    // Initialisation de Start et End dans les Queues
    start.f = 0;
    end.f = 0;
    openListForward.push(start);
    openListBackward.push(end);

    // Initialisation des Map
    gForward.set(start,0);
    gBackward.set(end,0);
    parentsForward.set(start, null);
    parentsBackward.set(end, null);

    //Boucle principale -> Tant que les 2 openList ont un node
    while(openListForward.size > 0 && openListBackward.size > 0){
        // 1. Un pas Forward = une étape de l'algo A*
            // Pop du node avec le f le plus bas
            let currentForward = openListForward.pop();

            // Vérifier si current est dans closedList, si oui l'ignorer
            if(closedListForward.has(currentForward)) continue;

            // ajout du current à closedListForward
            closedListForward.add(currentForward);

            // coloration de la case en bleu clair
            if(currentForward !== start && currentForward !== end){
                colorCell(currentForward.x, currentForward.y, "lightblue");
            }

            // Vérification des voisins
            const directionsForward = diagonal ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]] : [[-1,0],[1,0],[0,-1],[0,1]];
            for(const [dy, dx] of directionsForward){
            
                // Vérifier que le node n'est pas hors-limite
                const nx = currentForward.x + dx;
                const ny = currentForward.y + dy;

                // ignorer si hors limites
                if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

                const neighbor = grid[ny][nx];

                // ignorer si c'est un mur ou déjà exploré
                if(neighbor.isWall || closedListForward.has(neighbor)) continue;

                // Calcul de newG
                //coût réel du déplacement (1 pour cardinal, √2 pour diagonal)
                const moveCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
                // coût de la difficulté de la case si la difficulté est activée
                const difficulty = difficultyMode ? neighbor.difficulty : 0;
                // coût du chemin actuel + difficulté du voisin + difficulté du node
                const newG = gForward.get(currentForward) + moveCost + difficulty;

                // Si le voisin n'est pas encore dans gForward ou si newG est meilleur
                if(!openListForward.has(neighbor) || newG < gForward.get(neighbor)){
                    // on conserver le g du voisin dans gForward
                    gForward.set(neighbor, newG);

                    // on conserve le parent du voisin dans parentsForward
                    parentsForward.set(neighbor, currentForward);

                    // calculer le nouveau f du voisin
                    neighbor.f = newG;

                    // conserve le voisin dans la liste ouverte de Forward
                    openListForward.push(neighbor);

                }  
            }

        // 2. Vérifier si le node sorti est dans closedListBackward -> rencontre !
        if(closedListBackward.has(currentForward)){
            return buildPath(currentForward, parentsForward, parentsBackward);
        }

        // 3. Un pas Backward
            // Pop du node avec le f le plus bas
            let currentBackward = openListBackward.pop();

            // Vérifier si current est dans closedList, si oui l'ignorer
            if(closedListBackward.has(currentBackward)) continue;

            // ajout du current à closedListBackward
            closedListBackward.add(currentBackward);

            // coloration de la case en corail
            if(currentBackward !== start && currentBackward !== end){
                colorCell(currentBackward.x, currentBackward.y, "lightcoral");
            }

            // Vérification des voisins
            const directionsBackward = diagonal ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,1],[1,-1]] : [[-1,0],[1,0],[0,-1],[0,1]];
            for(const [dy, dx] of directionsBackward){
            
                // Vérifier que le node n'est pas hors-limite
                const nx = currentBackward.x + dx;
                const ny = currentBackward.y + dy;

                // ignorer si hors limites
                if(nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

                const neighbor = grid[ny][nx];

                // ignorer si c'est un mur ou déjà exploré
                if(neighbor.isWall || closedListBackward.has(neighbor)) continue;

                // Calcul de newG
                //coût réel du déplacement (1 pour cardinal, √2 pour diagonal)
                const moveCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
                // coût de la difficulté de la case si la difficulté est activée
                const difficulty = difficultyMode ? neighbor.difficulty : 0;
                // coût du chemin actuel + difficulté du voisin + difficulté du node
                const newG = gBackward.get(currentBackward) + moveCost + difficulty;

                // Si le voisin n'est pas encore dans gBackward ou si newG est meilleur
                if(!openListBackward.has(neighbor) || newG < gBackward.get(neighbor)){
                    // on conserver le g du voisin dans gBackward
                    gBackward.set(neighbor, newG);

                    // on conserve le parent du voisin dans parentsBackward
                    parentsBackward.set(neighbor, currentBackward);

                    // calculer le nouveau f du voisin
                    neighbor.f = newG;

                    // conserve le voisin dans la liste ouverte de Backward
                    openListBackward.push(neighbor);

                }  
            }

        // 4. Vérifier si le node sorti est dans closedListForward -> rencontre !
        if(closedListForward.has(currentBackward)){
            return buildPath(currentBackward, parentsForward, parentsBackward);
        }

        // Visualition étape par étape
        await sleep(50);
    }

    return null;
}