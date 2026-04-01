// BSP Dungeon Generator
function splitBSP(node, minSize){
    // Si la pièce est trop petite, on arrête de la diviser (condition de sortie de la récursion)
    if(node.width < minSize * 2 && node.height < minSize * 2) return;

    // Décider de diviser horizontalement ou verticalement
    const splitHorizontal = Math.random() > 0.5;

    if(splitHorizontal && node.height >= minSize * 2){
        // Diviser horizontalement à une position aléatoire
        const split = minSize + Math.floor(Math.random() * (node.height - minSize * 2));
        // Créer les 2 nodes left et right
        node.left = new BSPNode(node.x, node.y, node.width, split);
        node.right = new BSPNode(node.x, node.y + split, node.width, node.height - split);
    }else if(node.width >= minSize * 2){
        // Diviser verticalement à une position aléatoire
        const split = minSize + Math.floor(Math.random() * (node.width - minSize * 2));
        // Créer les 2 nodes left et right
        node.left = new BSPNode(node.x, node.y, split, node.height);
        node.right = new BSPNode(node.x + split, node.y, node.width - split, node.height);
    }

    // Appeler récursivement la fonction sur les 2 nodes
    if(node.left) splitBSP(node.left, minSize);
    if(node.right) splitBSP(node.right, minSize);

}

// Fonction pour créer une salle dans une feuille de l'arbre BSP
function placeRooms(node, minSize, maxSize){
    // Si la feuille (node) n'a pas d'enfant (left ou right), on place une salle aléatoire
    if(!node.left || !node.right){
        // taille de la sallé aléatoire entre (minSize -1 ) et (node.width - 2)
        const roomWidth = Math.min((minSize - 1) + Math.floor(Math.random() * (node.width - minSize)), node.width - 2, maxSize);
        const roomHeight = Math.min((minSize - 1) + Math.floor(Math.random() * (node.height - minSize)), node.height - 2, maxSize);

        // position de la salle aléatoire dans la feuille avec une marge de 1 case
        const roomX = node.x + 1 + Math.floor(Math.random() * (node.width - roomWidth - 1));
        const roomY = node.y + 1 + Math.floor(Math.random() * (node.height - roomHeight - 1));

        // Créer la salle et l'assigner à la node
        node.room = {x: roomX, y: roomY, width: roomWidth, height: roomHeight};
    }else{
        // Sinon, on appelle récursivement la fonction sur les enfants
        if(node.left) placeRooms(node.left, minSize, maxSize);
        if(node.right) placeRooms(node.right, minSize, maxSize);

    }
}

// fonction pour applier les salles sur la grille
function applyRooms(node, grid){
    // Si le node a une salle (room), on l'applique sur la grille
    if(node.room){
        for(let i = node.room.x; i < node.room.x + node.room.width; i++){
            for(let j = node.room.y; j < node.room.y + node.room.height; j++){
                grid[j][i].isWall = false; // on rend les cases de la salle non murales
            }
        }
    }
    // Sinon on appelle récursivement la fonction sur les enfants
    else{
        if(node.left) applyRooms(node.left, grid);
        if(node.right) applyRooms(node.right, grid);
    }
}

// fonction pour trouver une salle dans un node (récursive)
function getRoom(node){
    if(node.room) return node.room; // si le node a une salle, on la retourne

    // sinon on cherche dans les enfants
    return getRoom(node.left) || getRoom(node.right); // on retourne la première salle trouvée dans les enfants
}

// fonction pour connecter les salles entre elles
function connectRooms(node, grid){
    //Récurser sur les enfants pour connecter les salles de chaque côté
    if(node.left) connectRooms(node.left, grid);
    if(node.right) connectRooms(node.right, grid);

    // Si le node a des enfants, on connecte les salles de ses enfants
    if(node.left && node.right){
        // Trouver les centres des salles des enfants
        const leftRoom = getRoom(node.left);
        const rightRoom = getRoom(node.right);
        if(leftRoom && rightRoom){
            const leftCenterX = leftRoom.x + Math.floor(leftRoom.width / 2);
            const leftCenterY = leftRoom.y + Math.floor(leftRoom.height / 2);
            const rightCenterX = rightRoom.x + Math.floor(rightRoom.width / 2);
            const rightCenterY = rightRoom.y + Math.floor(rightRoom.height / 2);

            
                // Couloir horizontal puis vertical
                for(let i = Math.min(leftCenterX, rightCenterX); i <= Math.max(leftCenterX, rightCenterX); i++){
                    grid[leftCenterY][i].isWall = false; // rendre le couloir non mural
                }
                for(let j = Math.min(leftCenterY, rightCenterY); j <= Math.max(leftCenterY, rightCenterY); j++){
                    grid[j][rightCenterX].isWall = false; // rendre le couloir non mural
                }
            
        }
    }
}

// Fonction principale pour générer un donjon avec BSP
function generateBSP(grid, minSize = 5, maxSize = 8){
    //1. Remplit toute la grille de murs (isWall = true)
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            grid[i][j].isWall = true;
        }
    }

    //2. Crée le nœud racine BSP couvrant toute la grille
    const root = new BSPNode(0, 0, grid[0].length, grid.length);

    //3. Appelle splitBSP avec minSize = 5
    splitBSP(root, minSize);

    //4. Appelle placeRooms
    placeRooms(root, minSize, maxSize);

    //5. Appelle applyRooms
    applyRooms(root, grid);

    //6. Appelle connectRooms
    connectRooms(root, grid);

    return root; // retourne le nœud racine pour pouvoir accéder aux salles et les connecter
}