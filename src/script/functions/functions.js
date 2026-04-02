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

//Reset Partiel
function resetPartial(grid, start, end, difficulty){
    for(const row of grid){
        // remise à 0 des coûts
        for(const node of row){
            node.g = 0;
            node.h = 0;
            node.f = node.g + node.h;
            node.parent = null;

            // remise de la couleur d'origine
            if(node !== start && node !== end && !node.isWall){
                difficulty ? colorCell(node.x, node.y,  `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`) : colorCell(node.x, node.y,  "");
            }
        }
    }
}

//Reset Total
function resetTotal(grid, start, end, difficulty){
    for(const row of grid){
        // remise à 0 des coûts
        for(const node of row){
            node.g = 0;
            node.h = 0;
            node.f = node.g + node.h;
            node.parent = null;
            node.isWall = false;

            // remise de la couleur d'origine
            //if(node !== start && node !== end){
                difficulty ? colorCell(node.x, node.y,  `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`) : colorCell(node.x, node.y,  "");
            //}
        }
    }
}

//choix de l'algo
async function algoLauncher(algorithm,grid, start, end, difficulty,diagonal,heuristique = distanceManhattan){
    switch(algorithm){
        case "dijkstra" :
            return await dijkstra(grid, start, end, difficulty, diagonal);
        case "bfs" :
            return await bfs(grid, start, end, diagonal);
        case "greedy" :
            return await greedy(grid,start,end, diagonal, heuristique);
        case "biDirectionalAStar" :
            return await biDirectionalAStar(grid, start, end, difficulty, diagonal, heuristique);
        case "biDirectionalAStarOpti" :
            return await biDirectionalAStarOpti(grid, start, end, difficulty, diagonal, heuristique);
        case "biDirectionalDijkstra" :
            return await biDirectionalDijkstra(grid, start, end, difficulty, diagonal);
        case "biDirectionalDijkstraOpti" :
            return await biDirectionalDijkstraOpti(grid, start, end, difficulty, diagonal);
        case "astar" :
        default :
            return await aStar(grid, start, end, difficulty, diagonal, heuristique);
    }
}

//reconstruire un chemin à partir de 2 demi-chemin (utile pour l'algo biDirectionnel) -> Attention : parentsForward et parentsBackward sont des Map
function buildPath(meeting, parentsForward, parentsBackward){
    // 1. Construire le demi-chemin forward dans un tableau
    //    en remontant parentsForward depuis meeting jusqu'à null
    //    → [meeting, ..., start]
    const forwardPath = [];
    let node = meeting;
    while(node !== null){
        forwardPath.push(node);
        node = parentsForward.get(node);
    }

    // 2. Inverser ce tableau → [start, ..., meeting]
    forwardPath.reverse();

    // 3. Construire le demi-chemin backward dans un tableau
    //    en remontant parentsBackward depuis meeting jusqu'à null
    //    mais en skippant meeting lui-même (déjà dans le forward)
    //    → [nextAfterMeeting, ..., end]
    const backwardPath = [];
    node = parentsBackward.get(meeting)
    while(node !== null){
        backwardPath.push(node);
        node = parentsBackward.get(node);
    }

    // 4. Fusionner les deux tableaux → fullPath = [...forward, ...backward]
    const fullPath = [...forwardPath, ...backwardPath];

    // 5. Reconstruire la chaîne parent :
    //    fullPath[0].parent = null
    //    fullPath[i].parent = fullPath[i-1]
    fullPath[0].parent = null
    for(let i = 1; i < fullPath.length; i++){
        fullPath[i].parent = fullPath[i-1]
    }

    // 6. Retourner le dernier nœud
    return fullPath.pop();
}

//placer / supprimer un mur
function buildWall(grid, target, node, x, y, difficultyMode){
    if(node === start || node === end) return;
    if(node.isWall){
        grid[y][x].isWall = false;
        if(difficultyMode){
            const d = node.difficulty;
            target.style.backgroundColor = `hsl(30, ${d * 10}%, ${100 - d * 5}%)`;
            return;
        }
        colorCell(x,y,"");
        return;
    }
    colorCell(x,y,"black");
    grid[y][x].isWall = true;
}

//placer le point de départ ou d'arrivé
function placeNode(grid, x, y, node, difficultyMode, color){
    //si le point de départ existe déjà
    if(node){
        //on reset sa couleur
        difficultyMode ? colorCell(node.x, node.y, `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`) : colorCell(node.x,node.y,"");

        //et qu'il est le même que la cible de mon clique, je l'efface
        if(node === grid[y][x]) return;
    }
    //je colore le nouveau node et le retourne
    colorCell(x,y,color);
    return grid[y][x];
}