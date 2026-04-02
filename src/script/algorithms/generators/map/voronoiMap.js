//Generator de map selon l'algo Voronoi
function generateVoronoi(grid, seeds){
    //1. Parcourt toutes les cases de la grille
    for(const row of grid){
        for(const node of row){
            //2. Trouver la graine la plus proche
            const seed = seeds.reduce((seed,current)=>{
                if(Math.hypot(node.x - current.x, node.y - current.y) < Math.hypot(node.x - seed.x, node.y - seed.y)){
                    return current;
                }else{
                    return seed;
                }
            },seeds[0])

            //3. Assigner la difficulté au node
            node.difficulty = seed.difficulty;
        }
    }
}

//Fonction pour générer aléatoire des seeds
function generateSeeds(count, gridCols, gridRows,biomes){
    const seeds = []
    for(let i = 0; i<count; i++){
        const x = Math.floor(Math.random()*gridCols);
        const y = Math.floor(Math.random()*gridRows);
        const index = Math.floor(Math.random()*biomes.length);

        const seed = {
            x: x,
            y: y,
            difficulty: biomes[index]
        }
        seeds.push(seed);
    }
    return seeds;
}