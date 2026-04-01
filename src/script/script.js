//Objet d'heuristiques
const heuristiques = {
    manhattan: distanceManhattan,
    chebyshev: distanceChebyshev,
    euclidienne: distanceEuclidienne,
    octile: distanceOctile
};

//ciblage de #container
const container = document.getElementById("container");

//ciblage du bouton de pathfinding
const pathfinderBtn = document.getElementById("pathfinder");

//ciblage des toggles
const difficultyToggle = document.getElementById("toggleDifficulty");
const diagonnalToggle = document.getElementById("toggleDiagonal");

//ciblage des boutons
const resetPartialBtn = document.getElementById("resetPartial");
const resetTotalBtn = document.getElementById("resetTotal");
const selectAlgo = document.getElementById("algoSelect");
const selectHeuristique = document.getElementById("heuristiqueSelect");
const generateDungeonBSPBtn = document.getElementById("generateDungeonBSP");

//paramètre de la grille
const gridRow = 20;
const gridCol = 20;
let difficulty = true;
let diagonal = true;
let selectedAlgo = selectAlgo.value;
let selectedHeuristique = heuristiques[selectHeuristique.value];

//largeur du container
container.style.width = gridCol*42+"px";

//Création de la grille de div
const mainGrid = createGrid(gridRow,gridCol);
renderGrid(mainGrid, container, difficulty);

//Point de départ et d'arrivé
const start = mainGrid[0][0];
const end = mainGrid[gridRow - 1][gridCol -1];

//Coloration du point de départ et d'arrivé
colorCell(start.x, start.y,"green");
colorCell(end.x, end.y,"red");

//Création des murs
container.addEventListener("click", (event)=>{
    const x = event.target.getAttribute("data-x");
    const y = event.target.getAttribute("data-y");
    const node = mainGrid[parseInt(y)][parseInt(x)];
    if(node === start || node === end) return;
    if(node.isWall){
        mainGrid[parseInt(y)][parseInt(x)].isWall = false;
        if(difficulty){
            const d = node.difficulty;
            event.target.style.backgroundColor = `hsl(30, ${d * 10}%, ${100 - d * 5}%)`;
            return;
        }
        colorCell(x,y,"");
        return;
    }
    colorCell(x,y,"black");
    mainGrid[parseInt(y)][parseInt(x)].isWall = true;
})

//Toggle de la Difficulté
difficultyToggle.addEventListener("change", (event)=>{
    difficulty = event.target.checked;
    for(const row of mainGrid){
        for(const node of row){
            if(node !== start && node !== end && !node.isWall){
                difficulty ? colorCell(node.x, node.y,  `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`) : colorCell(node.x, node.y,  "");
            }
        }
    }
})

//Toggle des Diagonal
diagonnalToggle.addEventListener("change", (event)=>{
    diagonal = event.target.checked;
})

//Reset Partiel
resetPartialBtn.addEventListener("click",(event)=>{
    resetPartial(mainGrid, start, end, difficulty);
})

//Reset Total
resetTotalBtn.addEventListener("click",(event)=>{
    resetTotal(mainGrid, start, end, difficulty);
})

//Choix Algo
selectAlgo.addEventListener("change",(event)=>{
    selectedAlgo = event.target.value;
})

//Choix Heuristique
selectHeuristique.addEventListener("change",(event)=>{
    selectedHeuristique = heuristiques[event.target.value];
})

//Lancement de l'algorithme A*
pathfinderBtn.addEventListener("click", async ()=>{
    const path = await algoLauncher(selectedAlgo, mainGrid, start, end, difficulty,diagonal,selectedHeuristique);

    if(!path){
        alert("Aucun chemin trouvé !");
        return;
    }

    //colorisation du chemin trouvé
    let current = path.parent;
    while(current.parent){
        colorCell(current.x, current.y, "yellow");
        await sleep(30); // pour visualiser le chemin en temps réel
        current = current.parent;
    }
});

// Lancement de la génération de donjon avec BSP
generateDungeonBSPBtn.addEventListener("click", ()=>{
    // Réinitialiser la grille
    resetTotal(mainGrid, start, end, difficulty);

    // Générer le donjon avec BSP
    generateBSP(mainGrid, 5, 10);

    // Mettre à jour les couleurs des cases en fonction de la difficulté
    for(const row of mainGrid){
        for(const node of row){
            if(node === start || node === end) continue; // ne pas recolorier le start et end
            if(node.isWall){
                colorCell(node.x, node.y, "black"); // colorier les murs en noir
            } else { // colorier les cases non murales en fonction de la difficulté
                difficulty ? colorCell(node.x, node.y,  `hsl(30, ${node.difficulty * 10}%, ${100 - node.difficulty * 5}%)`) : colorCell(node.x, node.y,  "");
            }
        }
    }
});