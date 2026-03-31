//Créer une grille de Node
function createGrid(row,cols){
    const grid = [];
    for(let i = 0; i<row; i++){
        const tabCols = [];
        for(let j = 0; j<cols; j++){
            tabCols.push(new Node(j, i, Math.floor(Math.random()*10)));
        }
        grid.push(tabCols);
    }
    return grid;
}

//Conversion de la grille de Node en div
function renderGrid(grid, container, colorDifficulty = false){
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat("+grid[0].length+", 1fr)";

    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            const div = document.createElement("div");
            //Coloration en fonction de la difficulté
            if(colorDifficulty){
                const d = grid[i][j].difficulty;
                div.style.backgroundColor = `hsl(30, ${d * 10}%, ${100 - d * 5}%)`;
            }

            div.setAttribute("data-x", j);
            div.setAttribute("data-y", i);
            container.append(div);
        }
    }
}

//Colorisation des case
function colorCell(x,y,color){
    const cell = document.querySelector(`div[data-x="${x}"][data-y="${y}"]`);
    cell.style.backgroundColor = color;
}

//Crée une pause de ms millisecondes
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Calcul de la distance entre deux points (heurstique de Manhattan) -> on ne prend pas en compte les diagonales
function distanceManhattan(nodeA, nodeB){
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}

//Calcul de la distance entre deux points (heurstique de Chebyshev) -> les diagonales ont un coût de 1
function distanceChebyshev(nodeA, nodeB){
    return Math.max(Math.abs(nodeA.x - nodeB.x), Math.abs(nodeA.y - nodeB.y));
}

//Calcul de la distance entre deux points (heurstique Euclidienne) -> les diagonales ont un coût de 1.414
function distanceEuclidienne(nodeA, nodeB){
    return Math.sqrt((nodeA.x - nodeB.x)*(nodeA.x - nodeB.x) + (nodeA.y - nodeB.y)*(nodeA.y - nodeB.y));
}

//Calcul de la distance entre deux points (heurstique d'Octile) -> les diagonales ont un coût de 1.414, mais ne surestime pas la distance réelle. Heuristique standard pour les grille à 8 directions.
function distanceOctile(nodeA, nodeB){
    return Math.max(Math.abs(nodeA.x - nodeB.x), Math.abs(nodeA.y - nodeB.y)) + (Math.sqrt(2) - 1)*Math.min(Math.abs(nodeA.x - nodeB.x), Math.abs(nodeA.y - nodeB.y));
}

//Algo a* pour trouver le chemin le plus court entre deux points
async function aStar(grid, start, end, difficultyMode = false, diagonal = false, heuristique = distanceManhattan){
    // version Tableau
    // const openList = [];
    // const closedList = [];
    // openList.push(start);

    // version optimisé avec Set
    //const  openList = new Set();
    const  closedList = new Set();
    // openList.add(start);

    // optimisation avec Priority Queue
    const openQueue = new PriorityQueue();
    openQueue.push(start);

    // Si diagonal est false, Manhattan est toujours la bonne heuristique
    const h = diagonal ? heuristique : distanceManhattan;

    //tant que la liste ouverte n'est pas vide
    //while(openList.length > 0){ -> version tableau
    //while(openList.size > 0){ // -> version Set
    while(openQueue.size > 0){ // -> version Priority Queue
        //trouver le noeud avec le f le plus bas
        //let current = openList.reduce((min,node) => node.f < min.f ? node : min, openList[0]); -> version Tableau
        //let current = [...openList].reduce((min,node) => node.f < min.f ? node : min); // -> version Set

        let current = openQueue.pop(); // -> version Priority Queue : O(log n) au lieu de O(n)

        if(closedList.has(current)) continue; // doublon obsolète → ignorer

        //si le noeud courant est le point d'arrivé, retourner le chemin
        if(current === end){
            return end;
        }else{
            //closedList.push(current) -> version tableau;
            closedList.add(current); // -> version Set
            //openList.splice(openList.indexOf(current), 1); -> version tableau
            //openList.delete(current) // -> version Set
            if(current !== start) colorCell(current.x, current.y, "lightblue");
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
            //if(neighbor.isWall || closedList.includes(neighbor)) continue; -> version tableau
            if(neighbor.isWall || closedList.has(neighbor)) continue // -> version Set

            // calculer g pour le voisin
            //coût réel du déplacement (1 pour cardinal, √2 pour diagonal)
            const moveCost = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
            const difficulty = difficultyMode ? neighbor.difficulty : 0;
            const newG = current.g + moveCost + difficulty // coût du chemin actuel + difficulté du voisin + difficulté du node

            // si le voisin n'est pas dans la liste ouverte, ou si un chemin plus court est trouvé
            //if(!openList.includes(neighbor)){ -> version Tableau
            //if(!openList.has(neighbor)){ // -> version Set
            if(!openQueue.has(neighbor)){ // -> version Priority Queue
                // nouveau noeud : calculer g, h, f et définir son parent
                neighbor.g = newG;
                neighbor.h = h(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                //openList.push(neighbor);
                //openList.add(neighbor); // -> version Set
                openQueue.push(neighbor); // -> version Priority Queue
            } else if(newG < neighbor.g){
                // chemin plus court trouvé : mettre à jour
                neighbor.g = newG;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;

                // Priority Queue : forcer le réordonnancement
                //openQueue.heap.splice(openQueue.heap.indexOf(neighbor), 1);
                openQueue.push(neighbor);
            }

        }
        // pour visualiser l'algorithme en temps réel
        await sleep(50);
    }

    return null; // aucun chemin trouvé
}

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