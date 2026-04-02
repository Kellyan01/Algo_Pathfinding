//Generator de map selon l'algo Voronoi + jitter
function generateVoronoiJitter(grid, seeds, jitter){
    //1. Parcourt toutes les cases de la grille
    for(const row of grid){
        for(const node of row){
            //2. Trouver la graine la plus proche
            const seed = seeds.reduce((seed,current)=>{
                if(Math.hypot(node.x - current.x, node.y - current.y) + current.jitter + Math.random() * jitter < Math.hypot(node.x - seed.x, node.y - seed.y) + seed.jitter + Math.random() * jitter){
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

//Generator de map selon l'algo Voronoi + blending
function generateVoronoiBlending(grid, seeds){
    //1. Parcourt toutes les cases de la grille
    for(const row of grid){
        for(const node of row){
            //Copie du tableau seeds
            let seedsTab = [...seeds];
            //2. Trouver les 2 graines les plus proche
            const seedMinA = seedsTab.reduce((seed,current)=>{
                if(Math.hypot(node.x - current.x, node.y - current.y)  < Math.hypot(node.x - seed.x, node.y - seed.y)){
                    return current;
                }else{
                    return seed;
                }
            },seedsTab[0])

            // Supprimer la première graine de la liste
            seedsTab.splice(seedsTab.indexOf(seedMinA),1);

            // Chercher la seconde graine la plus proche
            const seedMinB = seedsTab.reduce((seed,current)=>{
                if(Math.hypot(node.x - current.x, node.y - current.y) < Math.hypot(node.x - seed.x, node.y - seed.y)){
                    return current;
                }else{
                    return seed;
                }
            },seedsTab[0])

            //3. Assigner la difficulté au node
            //Calcul des poids de chaque seed
            const weightA = 1 / Math.max(Math.hypot(node.x - seedMinA.x, node.y - seedMinA.y), 0.0001);

            const weightB = 1 / Math.max(Math.hypot(node.x - seedMinB.x, node.y - seedMinB.y), 0.0001);

            node.difficulty = (seedMinA.difficulty * weightA + seedMinB.difficulty * weightB)/(weightA + weightB);
        }
    }
}

//Generator de map selon l'algo Voronoi + jitter + blending
function generateVoronoi(grid, seeds, jitter){
    //1. Parcourt toutes les cases de la grille
    for(const row of grid){
        for(const node of row){
            //Copie du tableau seeds
            let seedsTab = [...seeds];
            //2. Trouver les 2 graines les plus proche
            const seedMinA = seedsTab.reduce((seed,current)=>{
                if(Math.hypot(node.x - current.x, node.y - current.y)+ current.jitter + Math.random() * jitter   < Math.hypot(node.x - seed.x, node.y - seed.y) + seed.jitter + Math.random() * jitter ){
                    return current;
                }else{
                    return seed;
                }
            },seedsTab[0])

            // Supprimer la première graine de la liste
            seedsTab.splice(seedsTab.indexOf(seedMinA),1);

            // Chercher la seconde graine la plus proche
            const seedMinB = seedsTab.reduce((seed,current)=>{
                if(Math.hypot(node.x - current.x, node.y - current.y) + current.jitter + Math.random() * jitter < Math.hypot(node.x - seed.x, node.y - seed.y) + seed.jitter + Math.random() * jitter ){
                    return current;
                }else{
                    return seed;
                }
            },seedsTab[0])

            //3. Assigner la difficulté au node
            //Calcul des poids de chaque seed
            const weightA = 1 / Math.max(Math.hypot(node.x - seedMinA.x, node.y - seedMinA.y), 0.0001);

            const weightB = 1 / Math.max(Math.hypot(node.x - seedMinB.x, node.y - seedMinB.y), 0.0001);

            node.difficulty = (seedMinA.difficulty * weightA + seedMinB.difficulty * weightB)/(weightA + weightB);
        }
    }
}

//Fonction pour générer aléatoire des seeds
function generateSeeds(count, gridCols, gridRows,biomes, jitter){
    const seeds = []
    for(let i = 0; i<count; i++){
        const x = Math.floor(Math.random()*gridCols);
        const y = Math.floor(Math.random()*gridRows);
        const index = Math.floor(Math.random()*biomes.length);
        const seedJitter = Math.random() * jitter;

        const seed = {
            type:biomes[index].type,
            x: x,
            y: y,
            difficulty: biomes[index].difficulty,
            jitter : seedJitter,
            imgUrl: biomes[index].imgUrl
        }
        seeds.push(seed);
    }
    return seeds;
}