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
            if(node !== start && node !== end){
                difficulty ? colorCell(node.x, node.y,  `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`) : colorCell(node.x, node.y,  "");
            }
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
        case "geedy" :
            return await greedy(grid,start,end, diagonal, heuristique);
        case "astar" :
        default :
            return await aStar(grid, start, end, difficulty, diagonal, heuristique);
    }
}