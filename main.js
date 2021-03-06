

let debug = false;
let tile_count = 20;

let canvas;
let path_found = false;
let playing = false;
let allow_diagonal = true;
let tile_size_x;
let tile_size_y;

let path_found_alpha = 0.15

const START = new Tile(new vec2(tile_count-2, tile_count-2))
const END = new Tile(new vec2(2, 2))
let OPEN = []
let CLOSED = []
let FINAL_PATH = []

OPEN.push(START)


let bounds = {
	min_x: 0,
	min_y: 0,
	max_x: tile_count,
	max_y: tile_count,
}

function setup() {
	canvas = createCanvas(640, 640)
	//canvas.mouseDragged(mousePressedEvent);
	disableRightClickContextMenu(canvas.canvas);
	

	tile_size_x = canvas.width / tile_count
	tile_size_y = canvas.height / tile_count

	/* Input */
	let clear_button = createButton('Replay');
	clear_button.size(undefined, 25)
	clear_button.position(canvas.canvas.offsetLeft-40, canvas.canvas.offsetTop);
	clear_button.mousePressed(clear_grid);

	play_pause_button = createButton('Pause');
	play_pause_button.size(undefined, 25)
	play_pause_button.position(canvas.canvas.offsetLeft-40, canvas.canvas.offsetTop+40);
	play_pause_button.mousePressed(pause);

	let reset_button = createButton('Clear All');
	reset_button.size(undefined, 25)
	reset_button.position(canvas.canvas.offsetLeft-40, canvas.canvas.offsetTop+80);
	reset_button.mousePressed(reset);

	let noisify_button_text = 'Noisify'
	let noisify_button = createButton(noisify_button_text);
	noisify_button.size(undefined, 25)
	noisify_button.position(canvas.canvas.offsetLeft+canvas.width+textWidth(noisify_button_text)+13, canvas.canvas.offsetTop+80);
	noisify_button.mousePressed(() => {
		reset();
		noisify_grid();
		updateTileMap();
	});

	let allow_diagonal_checkbox_text = "Allow Diagonal"
	let allow_diagonal_checkbox = createCheckbox(allow_diagonal_checkbox_text, allow_diagonal);
	allow_diagonal_checkbox.position(canvas.canvas.offsetLeft+canvas.width+textWidth(allow_diagonal_checkbox_text), canvas.canvas.offsetTop)
	allow_diagonal_checkbox.changed(() => {
		allow_diagonal = !allow_diagonal;
	});

	let debug_checkbox_text = "Debug"
	let debug_checkbox = createCheckbox(debug_checkbox_text, debug);
	debug_checkbox.position(canvas.canvas.offsetLeft+canvas.width+textWidth(debug_checkbox_text), canvas.canvas.offsetTop+canvas.height-debug_checkbox.height)
	debug_checkbox.changed(() => {
		debug = !debug;
	});

	let tile_count_slider = createSlider(10, 50, tile_count);
	tile_count_slider.position(canvas.canvas.offsetLeft+canvas.width+tile_count_slider.width/2+20, canvas.canvas.offsetTop+40);
	tile_count_slider.input(() => {
		updateTileMap(tile_count_slider.value())
	})

	let tile_count_slider_label_text = "Tile Count"
	let tile_count_slider_label = createP(tile_count_slider_label_text)
	tile_count_slider_label.position(canvas.canvas.offsetLeft+canvas.width+tile_count_slider.width/2+20+textWidth(tile_count_slider_label_text)*2, canvas.canvas.offsetTop+40-textLeading())

	let controls_help = ["<b>Controls</b>:", "<b>Left Mouse</b>: set <b><span style='color: rgb(100, 100, 100)'>WALL</span></b>", "<b>Right Mouse</b>: clear <b><span style='color: rgb(100, 100, 100)'>WALL</span></b>", "<b>S</b>: set <b><span style='color: rgb(245, 212, 0)'>START</span></b>", "<b>F</b>: set <b><span style='color: rgb(168, 0, 224)'>FINISH</span></b>"]
	for(let c = 0; c < controls_help.length; c++) {
		let text_content = controls_help[c]
		let text = createP(text_content)
		text.position(canvas.canvas.offsetLeft-100, canvas.canvas.offsetTop+canvas.height-controls_help.length*30+c*30)
	}
}

function draw() {
	clear()
	background(235)

	if(!path_found && !playing) {
		let [current, current_idx] = Tile.getLowestF(OPEN);
		if(current_idx === -1) 
			console.log("OPEN empty")
		else {
			let closed_idx = vec2.getArrIndex(CLOSED, current.xy)
			if (current_idx > -1) {
				OPEN.splice(current_idx, 1);
			} else console.log("OPEN empty")
			if(closed_idx === -1) {
				CLOSED.push(current)
			}

			if(current.xy.equal(END.xy)) {
				let curr = current;
				let depth = 0;
				while(curr !== undefined && depth < Infinity) {
					FINAL_PATH.push(curr);
					curr = curr.parent;
					depth++;
				}
				path_found = true;
			}

			let neighbor_arr = current.getNeighbours(bounds)
			for(let n = 0; n < neighbor_arr.length; n++) {
				let neighbor = neighbor_arr[n];
				let n_idx = vec2.getArrIndex(OPEN, neighbor.xy);

				if(vec2.getArrIndex(CLOSED, neighbor.xy) !== -1) continue;

				let new_g = current.g_cost + current.xy.distance(neighbor.xy)
				if(n_idx !== -1) { // pre-existing
					if(new_g < OPEN[n_idx].g_cost) { // better path!
						OPEN[n_idx].g_cost = new_g
						OPEN[n_idx].h_cost = neighbor.xy.distance(END.xy)
						OPEN[n_idx].f_cost = neighbor.g_cost + neighbor.h_cost
						OPEN[n_idx].parent = current
					}
				} else { // new
					neighbor.g_cost = new_g
					neighbor.h_cost = neighbor.xy.distance(END.xy)
					neighbor.f_cost = neighbor.g_cost + neighbor.h_cost
					neighbor.parent = current
					if(vec2.getArrIndex(OPEN, neighbor.xy) === -1) OPEN.push(neighbor)
				}
			}
		}
	}

	drawGridContent();
	drawGrid();
}
function mouseDragged() {
	let idx = vec2.getArrIndex(OPEN, new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y)));
	if(mouseButton === "left") {
		if(idx !== -1 && !OPEN[idx].wall) {
			OPEN[idx] = new Tile(new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y)), undefined, Infinity, true);
		} else 
			OPEN.push(new Tile(new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y)), undefined, Infinity, true))
	} else if(mouseButton === "right") {
		if(idx !== -1 && OPEN[idx].wall) {
			OPEN.splice(idx, 1)
		}
	}
}
function keyPressed() {
	if(keyCode === 83) { // s
		START.xy = new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y));
	} else if(keyCode === 70) { // f
		END.xy = new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y));
	}
}
function play() {
	playing = false
	play_pause_button.mousePressed(pause);
	play_pause_button.elt.innerHTML = "Pause"
}
function pause() {
	playing = true
	play_pause_button.mousePressed(play);
	play_pause_button.elt.innerHTML = "Play"
}
function clear_grid() {
	path_found = false
	OPEN = OPEN.filter(i => i.wall === true)
	OPEN.push(START);
	CLOSED = []
	FINAL_PATH = []
}
function reset() {
	path_found = false
	OPEN = []
	OPEN.push(START);
	CLOSED = []
	FINAL_PATH = []
}
function updateTileMap(tc) {
	if(tc !== undefined) {
		tile_count = tc
		tile_size_x = canvas.width / tile_count
		tile_size_y = canvas.height / tile_count
	}
	bounds.max_x = bounds.max_y = tile_count
}
function noisify_grid() {
	let d = new Date();
	noiseSeed(d.getTime())
	for(let x = 0; x < tile_count; x++) {
		for(let y = 0; y < tile_count; y++) {
			let new_xy = new vec2(x, y)
			if(noise(int(x/1.5), int(y/1.5)) > 0.6 && !new_xy.equal(START.xy) && !new_xy.equal(END.xy)) OPEN.push(new Tile(new vec2(x, y), undefined, Infinity, true))
		}
	}
}
function drawGridContent() {
	strokeWeight(0)

	// open
	drawGridContentArr(OPEN.filter(i => i.wall !== true), true);
	if(debug)drawGridContentArrText(OPEN);

	// closed
	fill("rgba(255, 0, 0, "+(path_found?path_found_alpha:1)+")")
	drawGridContentArr(CLOSED);
	if(debug)drawGridContentArrText(CLOSED);


	// final_path
	fill(64, 105, 224)
	drawGridContentArr(FINAL_PATH);
	if(debug)drawGridContentArrText(FINAL_PATH);

	// start
	fill(245, 212, 0)
	drawTile(START.xy)

	// finish
	fill(168, 0, 224)
	drawTile(END.xy)

	// walls
	drawGridContentArr(OPEN.filter(i => i.wall === true), true);
	if(debug)drawGridContentArrText(OPEN);

}
function drawGridContentArr(arr, open_custom) {
	for(let i = 0; i < arr.length; i++) {
		if(open_custom) {
			if(arr[i].wall) fill(100, 100, 100) // wall
			else fill("rgba(0, 255, 0, "+(path_found?path_found_alpha:1)+")")
		}
		drawTile(arr[i].xy)
	}
}
function drawGridContentArrText(arr) {
	for(let i = 0; i < arr.length; i++) {
		if(!arr[i].wall)
			drawText(round(arr[i].f_cost, 1), color(100, 100, 100), arr[i].xy.x * tile_size_x + tile_size_x/2, arr[i].xy.y*tile_size_y + tile_size_y, 12)
	}
}
function drawTile(vec2) {
	rect(vec2.x*tile_size_x, vec2.y*tile_size_y, tile_size_x, tile_size_y)
}
function drawGrid() {
	stroke(0);	
	strokeWeight(1);

	for (let x = tile_size_x; x < width; x += tile_size_x) {
		line(x, 0, x, height);
	}
	for (let y = tile_size_y; y < height; y += tile_size_y) {
		line(0, y, width, y);
	}
}
function drawText(txt, color, left, top, size) {
	fill(color);
	strokeWeight(0);
	textStyle(BOLD);
	if(size === undefined) size = 20
	textSize(size);
	textFont('Arial');
	text(txt, left - textWidth(txt)/2, top-size/2);
}