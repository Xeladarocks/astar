
let neighbor_directions = [ 
	[-1, 0], [0, 1], [1, 0], [0, -1],
	[-1, 1], [1, 1], [1, -1], [-1, -1] 
]

class Tile {
	constructor(xy, parent, f_cost, wall) {
		this.xy = xy
		if(f_cost === undefined) f_cost = 0
		this.f_cost = f_cost
		this.g_cost = 0
		this.h_cost = 0
		if(wall === undefined) wall = false
		this.wall = wall
		this.parent = parent
	}

	getNeighbours(bounds) {
		let neighbor_arr = []

		for(let nd = 0; nd < (allow_diagonal? 8 : 4); nd++) {
			let new_xy = this.xy.add(neighbor_directions[nd])
			if(new_xy.x < bounds.min_x || new_xy.x >= bounds.max_x || new_xy.y < bounds.min_y || new_xy.y >= bounds.max_y) continue;
			
			let idx = vec2.getArrIndex(OPEN, new_xy)
			if(idx !== -1) neighbor_arr.push(OPEN[idx])
			else neighbor_arr.push(new Tile(new_xy, this))

		}
		return neighbor_arr
	}


	static getLowestF(arr) {
		var lowest = new Tile(new vec2(8, 0), undefined, Infinity)
		var lowest_idx = -1
		for (let i = 0; i < arr.length; i++) {
			let tmp = arr[i]
			if (tmp.f_cost < lowest.f_cost && !tmp.wall) {
				lowest = tmp
				lowest_idx = i
			}
		}
		return [lowest, lowest_idx]
	}
}