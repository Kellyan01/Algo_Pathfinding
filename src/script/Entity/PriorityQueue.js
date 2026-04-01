class PriorityQueue {
    constructor() {
        this.heap = []; // stocke des entrées {f, node} — f est figé à l'insertion
    }

    push(node) {
        this.heap.push({f: node.f, node: node}); // f sauvegardé indépendamment de l'objet
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        const min = this.heap[0].node;
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return min;
    }

    has(node) {
        return this.heap.some(entry => entry.node === node);
    }

    get size() {
        return this.heap.length;
    }

    peek(){
        return this.heap[0]?.f ?? Infinity; // retourne le f minimum, Infinity si vide
    }


    _bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[parent].f <= this.heap[i].f) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }

    _sinkDown(i) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.heap[left].f < this.heap[smallest].f) smallest = left;
            if (right < n && this.heap[right].f < this.heap[smallest].f) smallest = right;
            if (smallest === i) break;
            [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
            i = smallest;
        }
    }
}
