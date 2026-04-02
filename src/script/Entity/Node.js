class Node {
    constructor(x,y,difficulty = 0,g = 0,h = 0){
        this.x = x;
        this.y = y;
        this.difficulty = difficulty;
        this.imgUrl = "";
        this.g = g;
        this.h = h;
        this.f = g+h;
        this.isWall = false;
        this.parent = null;
    }
}