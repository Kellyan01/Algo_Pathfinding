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

//Ciblage paramétrage taille de grille
const gridCreationBtn = document.getElementById("gridCreation");

//paramètre de la grille
let gridRow = 20;
let gridCol = 20;
let difficulty = true;
let diagonal = true;
let selectedAlgo = selectAlgo.value;
let selectedHeuristique = heuristiques[selectHeuristique.value];

//largeur du container
container.style.width = gridCol*42+"px";
container.style.height = gridRow*42+"px";

//Création de la grille de div
let mainGrid = createGrid(gridRow,gridCol);
renderGrid(mainGrid, container, difficulty);

//Point de départ et d'arrivé
let start;
let end;

//Coloration du point de départ et d'arrivé
// colorCell(start.x, start.y,"green");
// colorCell(end.x, end.y,"red");

//Re-création de la grille de div
gridCreationBtn.addEventListener("click",(event)=>{
    //récupérer les paramètre de la grille
    const gridWidth = document.getElementById("gridWidth");
    const gridHeight = document.getElementById("gridHeight");

    gridRow = parseInt(gridHeight.value);
    gridCol = parseInt(gridWidth.value);

    if(!gridRow >= 5 || !gridCol >= 5){
        alert("Vous devez entrer une Largeur et une Hauteur d'au moins 5 cases");
        return;
    }

    //reset total de la grille
    container.innerText = null;

    //largeur du container
    container.style.width = gridCol*42+"px";
    container.style.height = gridRow*42+"px";

    //Création de la grille de div
    mainGrid = createGrid(gridRow,gridCol);
    renderGrid(mainGrid, container, difficulty);
})

//Création des murs, placement point de départ et point d'arrivé
container.addEventListener("click", (event)=>{
    //ciblage des boutons radios
    const wallRadio = document.getElementById("wallRadio");
    const startRadio = document.getElementById("startRadio");
    const endRadio = document.getElementById("endRadio");
    const offRadio = document.getElementById("offRadio");
    //récupération de la case cliquée
    const x = parseInt(event.target.getAttribute("data-x"));
    const y = parseInt(event.target.getAttribute("data-y"));
    //récupération du node concerné
    const node = mainGrid[y][x];
    //lancement des fonctions de build
    switch(true){
        case wallRadio.checked :
            buildWall(mainGrid, event.target, node, x, y, difficulty);
            break;
        case startRadio.checked :
            start = placeNode(mainGrid, x, y, start, difficulty, "green");
            break;
        case endRadio.checked :
            end = placeNode(mainGrid, x, y, end, difficulty, "red");
            break;
        case offRadio.checked :
            break;
        default :
            alert("Sélectionnez un builder");
            return;
    }
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
    //effacement des points de départ et d'arrivé
    start = null;
    end = null;
})

//Choix Algo
selectAlgo.addEventListener("change",(event)=>{
    selectedAlgo = event.target.value;
})

//Choix Heuristique
selectHeuristique.addEventListener("change",(event)=>{
    selectedHeuristique = heuristiques[event.target.value];
})

//Lancement de l'algorithme de Pathfinding
pathfinderBtn.addEventListener("click", async ()=>{
    //Vérifier s'il y a un point de départ et d'arrivé
    if(!start || !end){
        alert("Placez d'abord un point de départ et un point d'arrivé");
        return;
    }
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
    //Récupération de minSize et maxSize
    const minSize = parseInt(document.getElementById("roomMinSize").value);
    const maxSize = parseInt(document.getElementById("roomMaxSize").value);

    //Vérifier si minSize et maxSize sont supérieur à 2
    if(!minSize > 2 || !maxSize > 2){
        alert("Les tailles doivent toutes être supérieur à 2");
        return;
    }

    //Vérifier si minSize est inférieur à maxSize
    if(minSize > maxSize){
        alert("la taille minimum doit être inférieur ou égale à la taille maximum");
        return;
    }
    generateBSP(mainGrid, minSize, maxSize);

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