class vec2 {
    constructor(x, y) {
        if(x === undefined) x = 0;
        if(y === undefined) y = 0;
        this.x = x;
        this.y = y;
	}
	
	add(val) {
		if(val.length !== undefined) return new vec2(this.x + val[0], this.y + val[1])
		else return new vec2(this.x + val.x, this.y + val.y)
	}
	sub(val) {
		if(val.length !== undefined) return new vec2(this.x - val[0], this.y - val[1])
		else return new vec2(this.x - val.x, this.y - val.y)
	}

	distance(vec2) {
		return Math.sqrt(Math.pow(vec2.x - this.x, 2) + Math.pow(vec2.y - this.y, 2))
	}

	equal(vec2) {
		if(this.x === vec2.x && this.y === vec2.y) return true
		else return false
	}

	static getArrIndex(arr, val) {
		for(let i = 0; i < arr.length; i++) {
			if(arr[i].xy.equal(val)) return i;
		}
		return -1;
	}
}