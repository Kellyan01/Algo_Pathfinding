class Node {
    constructor(x,y,difficulty = 0,g = 0,h = 0, isWall = false, parent = null){
        this.x = x;
        this.y = y;
        this.difficulty = difficulty;
        this.g = g;
        this.h = h;
        this.f = g+h;
        this.isWall = isWall;
        this.parent = parent;
    }
}