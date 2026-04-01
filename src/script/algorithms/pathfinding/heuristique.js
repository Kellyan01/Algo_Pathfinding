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