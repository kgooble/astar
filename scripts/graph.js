define(['priorityqueue'], function (priorityqueue) {
	var DEFAULT_NODE_PIXEL_DISTANCE = 10;

	var Node = function (x, y) {
		this.x = x;
		this.y = y;
		this.marked = false;
		this.wall = false;
	};
	Node.prototype.toggleMarked = function () {
		this.marked = !this.marked;
	};
	Node.prototype.toggleWall = function () {
		this.wall = !this.wall;
	};
	Node.prototype.toString = function () {
		return "(" + this.x + ", " + this.y + ")";
	};

	var Path = function (nodeList) {
		this.nodeList = nodeList;
		this.length = nodeList.length;
	};

	Path.prototype.getDirection = function () {
		if (this.nodeList.length < 2) {
			return {x:0, y:0};
		}
		return {x: (this.nodeList[this.length-2].x - this.nodeList[this.length-1].x), 
				y: (this.nodeList[this.length-2].y - this.nodeList[this.length-1].y)};
	};

	var PixelGraph = function (width, height, pixelDistance) {
		this.width = width;
		this.height = height;
		if (pixelDistance === undefined) {
			pixelDistance = DEFAULT_NODE_PIXEL_DISTANCE;
		}
		this.pixelDistance = pixelDistance;
		this.firstMarkedNode = null;
		this.secondMarkedNode = null;
		this.markedFirstLast = false;
		this.nodes = {};
	    for (var x = 0; x < this.width; x += this.pixelDistance) {
	        for (var y = 0; y < this.height; y += this.pixelDistance) {
	        	this.nodes[[x, y]] = new Node(x, y);
	        }
	    }
	};

	PixelGraph.prototype.draw = function (ctx) {
		for (var n in this.nodes) {
			var node = this.nodes[n];
	        if (node.marked) {
	        	ctx.fillStyle = "red";
	        	ctx.fillRect(node.x - 2, node.y - 2, 6, 6);
	        } else if (node.nextToMarked) {
	        	ctx.fillStyle = "blue";
	        	ctx.fillRect(node.x - 2, node.y - 2, 6, 6);
	        } else if (node.wall) {
	        	ctx.fillStyle = "gray";
	        	ctx.fillRect(node.x - 2, node.y - 2, 6, 6);
	        }
	        ctx.fillStyle = "black";
	        ctx.fillRect(node.x, node.y, 2, 2);
	    }

	    if (this.path) {
	    	ctx.strokeStyle = "green";
	    	for (var i = 0; i < this.path.length - 1; i++) {
				ctx.beginPath();
				ctx.moveTo(this.path[i].x, this.path[i].y);
				ctx.lineTo(this.path[i+1].x, this.path[i+1].y);
				ctx.stroke();
	    	}
		}
	};

	PixelGraph.prototype.findNearestNode = function (x, y) {
        if (y === undefined) {
            y = x.y;
            x = x.x;
        }
		var nearestTenX = Math.floor(x / this.pixelDistance) * this.pixelDistance;
		var nearestTenY = Math.floor(y / this.pixelDistance) * this.pixelDistance;
		if (x % this.pixelDistance > (this.pixelDistance / 2) && x < this.width) {
			nearestTenX += this.pixelDistance;
		}
		if (y % this.pixelDistance > (this.pixelDistance / 2) && y < this.height) {
			nearestTenY += this.pixelDistance;
		}

		if (nearestTenX < 0) {
			nearestTenX = 0;
		}
		if (nearestTenX >= this.width){
			nearestTenX = this.width - this.pixelDistance;
		}
		if (nearestTenY < 0) {
			nearestTenY = 0;
		}
		if (nearestTenY >= this.height){
			nearestTenY = this.height - this.pixelDistance;
		}

		return this.nodes[[nearestTenX, nearestTenY]];
	};

	PixelGraph.prototype.findNeighbours = function (node) {
		var neighbours = [];
		var maxHeight = this.height - this.pixelDistance;
		var maxWidth = this.width - this.pixelDistance;
		if (node.y - this.pixelDistance >= 0) {
			var y = node.y - this.pixelDistance;
			if (node.x - this.pixelDistance >= 0) {
				neighbours.push(this.nodes[
					[node.x - this.pixelDistance, y]
				]);
			}
			neighbours.push(this.nodes[
				[node.x, y]
			]);
			if (node.x + this.pixelDistance <= maxWidth) {
				neighbours.push(this.nodes[
					[node.x + this.pixelDistance, y]
				]);
			}
		}
		var y = node.y;
		if (node.x - this.pixelDistance >= 0) {
			neighbours.push(this.nodes[
				[node.x - this.pixelDistance, y]
			]);
		}
		if (node.x + this.pixelDistance <= maxWidth) {
			neighbours.push(this.nodes[
				[node.x + this.pixelDistance, y]
			]);
		}
		if (node.y + this.pixelDistance <= maxHeight) {
			var y = node.y + this.pixelDistance;
			if (node.x - this.pixelDistance >= 0) {
				neighbours.push(this.nodes[
					[node.x - this.pixelDistance, y]
				]);
			}
			neighbours.push(this.nodes[
				[node.x, y]
			]);
			if (node.x + this.pixelDistance <= maxWidth) {
				neighbours.push(this.nodes[
					[node.x + this.pixelDistance, y]
				]);
			}
		}
		return neighbours;
	};

	PixelGraph.prototype.markNearestNode = function (x, y) {
		var n = this.findNearestNode(x, y);
		n.toggleMarked();
		if (n.marked) {
			if (!this.markedFirstLast || this.firstMarkedNode === null) {
				if (this.firstMarkedNode !== null) {
					this.firstMarkedNode.toggleMarked();
				}
				this.firstMarkedNode = n;
				this.markedFirstLast = true;
			} else {
				if (this.secondMarkedNode !== null) {
					this.secondMarkedNode.toggleMarked();
				}
				this.secondMarkedNode = n;
				this.markedFirstLast = false;
			}
		} else {
			if (this.firstMarkedNode == n) {
				this.firstMarkedNode = null;
			} else if (this.secondMarkedNode == n) {
				this.secondMarkedNode = null;
			}
		}
	};
	PixelGraph.prototype.markNearestNodeAsWall = function (x, y) {
		var n = this.findNearestNode(x, y);
		n.toggleWall();
	};

	PixelGraph.prototype.heuristic = function (start, goal) {
		return Math.sqrt(Math.pow(Math.abs(goal.x - start.x), 2) + Math.pow(Math.abs(goal.y - start.y), 2));
	};

	PixelGraph.prototype.reconstructPath = function (cameFrom, current) {
		var path = [current];
		while (cameFrom.has(current)) {
			current = cameFrom.get(current);
			path.push(current);
		}
		return path;
	};
	PixelGraph.prototype.distanceBetween = function (start, end) {
		if (end.wall) {
			return Number.POSITIVE_INFINITY;
		}
		return this.heuristic(start, end);
	};

	PixelGraph.prototype.calculatePath = function (start, goal) {
		if (start === undefined || goal === undefined) {
			start = this.firstMarkedNode;
			goal = this.secondMarkedNode;
		}

		// Begin A* Search Algorithm
		var openSet = new priorityqueue.PriorityQueue();
		var closedSet = new Map();
		var cameFrom = new Map();

		var gScores = new Map();
		var fScores = new Map();

		gScores.set(start, 0);
		fScores.set(start, gScores.get(start) + this.heuristic(start, goal));
		openSet.enqueue(start, fScores.get(start));

		while (!openSet.isEmpty()) {
			var current = openSet.dequeue();
			if (current == goal) {
				var path = this.reconstructPath(cameFrom, goal);
				this.path = path;
				return null;
			}

			closedSet.set(current, true);
			var neighbours = this.findNeighbours(current);
			for (var i = 0; i < neighbours.length; i++) {
				var neighbour = neighbours[i];
				if (neighbour === undefined || closedSet.has(neighbour)) {
					continue;
				}
				var tentativeGScore = gScores.get(current) + this.distanceBetween(current, neighbour);
				if (tentativeGScore < Number.POSITIVE_INFINITY && (!openSet.contains(neighbour) || tentativeGScore < gScores.get(neighbour))) {
					cameFrom.set(neighbour, current);
					gScores.set(neighbour, tentativeGScore);
					fScores.set(neighbour, gScores.get(neighbour) + this.heuristic(neighbour, goal));
					if (!openSet.contains(neighbour)) {
						openSet.enqueue(neighbour, fScores.get(neighbour));
					}
				}
			}
		}
		return "FAILED to find path between " + start + " and " + goal;
	};

	return {
		Graph: PixelGraph
	};
});