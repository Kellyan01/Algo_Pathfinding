//ciblage de #container
const container = document.getElementById("container");

//ciblage du bouton de pathfinding
const pathfinderBtn = document.getElementById("pathfinder");

//paramètre de la grille
const gridRow = 20;
const gridCol = 20;

//largeur du container
container.style.width = gridCol*42+"px";

//Création de la grille de div
const mainGrid = createGrid(gridRow,gridCol);
renderGrid(mainGrid, container,true);

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
    if(node.isWall || node === start || node === end) return;
    colorCell(x,y,"black");
    mainGrid[parseInt(y)][parseInt(x)].isWall = true;
})

//Lancement de l'algorithme A*
pathfinderBtn.addEventListener("click", ()=>{
    const path = aStar(mainGrid, start, end, true, true, distanceEuclidienne);

    if(!path){
        alert("Aucun chemin trouvé !");
        return;
    }

    //colorisation du chemin trouvé
    let current = path.parent;
    while(current.parent){
        colorCell(current.x, current.y, "yellow");
        current = current.parent;
    }
});