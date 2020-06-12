


function getIndexOfK(arr, k) {
	for (var i = 0; i < arr.length; i++) {
		var index = arr[i].indexOf(k);
		if (index > -1) {
			return [i, index];
		}
	}
}

function disableRightClickContextMenu(element) {
	element.addEventListener('contextmenu', function(e) {
	  if (e.button == 2) {
		// Block right-click menu thru preventing default action.
		e.preventDefault();
	  }
	});
  }