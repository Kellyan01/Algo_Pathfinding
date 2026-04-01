// class BSPNode
class BSPNode {
    constructor(x, y, width, height){
        this.x = x; this.y = y;
        this.width = width; this.height = height;
        this.left = null; this.right = null;
        this.room = null; // salle placée dans cette feuille
    }
}