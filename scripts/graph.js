define(['priorityqueue'], function (priorityqueue) {
	var NODE_PIXEL_DISTANCE = 10;

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

	var MyMap = function () {
		this.props = {};
		this.length = 0;
	};

	MyMap.prototype.get = function (key) {
		return this.props[key];
	};

	MyMap.prototype.put = function (key, val) {
		this.props[key] = val;
		this.length++;
	};

	MyMap.prototype.contains = function (key) {
		return this.props[key] !== undefined;
	};

	MyMap.prototype.delete = function (key) {
		if (this.contains(key)) {
			delete this.props[key];
			this.length--;
		}
	};

	var PixelGraph = function (width, height) {
		this.width = width;
		this.height = height;
		this.firstMarkedNode = null;
		this.secondMarkedNode = null;
		this.markedFirstLast = false;
	};

	PixelGraph.prototype.initialize = function () {
		this.nodes = {};
	    for (var x = 0; x < this.width; x += NODE_PIXEL_DISTANCE) {
	        for (var y = 0; y < this.height; y += NODE_PIXEL_DISTANCE) {
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
		var nearestTenX = Math.floor(x / NODE_PIXEL_DISTANCE) * NODE_PIXEL_DISTANCE;
		var nearestTenY = Math.floor(y / NODE_PIXEL_DISTANCE) * NODE_PIXEL_DISTANCE;
		if (x % NODE_PIXEL_DISTANCE > (NODE_PIXEL_DISTANCE / 2) && x < this.width) {
			nearestTenX += NODE_PIXEL_DISTANCE;
		}
		if (y % NODE_PIXEL_DISTANCE > (NODE_PIXEL_DISTANCE / 2) && y < this.height) {
			nearestTenY += NODE_PIXEL_DISTANCE;
		}

		return this.nodes[[nearestTenX, nearestTenY]];
	};

	PixelGraph.prototype.findNeighbours = function (node) {
		var neighbours = [];
		if (node.y - NODE_PIXEL_DISTANCE > 0) {
			var y = node.y - NODE_PIXEL_DISTANCE;
			if (node.x - NODE_PIXEL_DISTANCE > 0) {
				neighbours.push(this.nodes[
					[node.x - NODE_PIXEL_DISTANCE, y]
				]);
			}
			neighbours.push(this.nodes[
				[node.x, y]
			]);
			if (node.x + NODE_PIXEL_DISTANCE > 0) {
				neighbours.push(this.nodes[
					[node.x + NODE_PIXEL_DISTANCE, y]
				]);
			}
		}
		var y = node.y;
		if (node.x - NODE_PIXEL_DISTANCE > 0) {
			neighbours.push(this.nodes[
				[node.x - NODE_PIXEL_DISTANCE, y]
			]);
		}
		if (node.x + NODE_PIXEL_DISTANCE > 0) {
			neighbours.push(this.nodes[
				[node.x + NODE_PIXEL_DISTANCE, y]
			]);
		}
		if (node.y + NODE_PIXEL_DISTANCE < this.height) {
			var y = node.y + NODE_PIXEL_DISTANCE;
			if (node.x - NODE_PIXEL_DISTANCE > 0) {
				neighbours.push(this.nodes[
					[node.x - NODE_PIXEL_DISTANCE, y]
				]);
			}
			neighbours.push(this.nodes[
				[node.x, y]
			]);
			if (node.x + NODE_PIXEL_DISTANCE > 0) {
				neighbours.push(this.nodes[
					[node.x + NODE_PIXEL_DISTANCE, y]
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
		while (cameFrom.contains(current)) {
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
		var closedSet = new MyMap();
		var cameFrom = new MyMap();

		var gScores = new MyMap();
		var fScores = new MyMap();

		gScores.put(start, 0);
		fScores.put(start, gScores.get(start) + this.heuristic(start, goal));
		openSet.enqueue(start, fScores.get(start));

		while (!openSet.isEmpty()) {
			var current = openSet.dequeue();
			if (current == goal) {
				var path = this.reconstructPath(cameFrom, goal);
				this.path = path;		    
				return null;
			}

			closedSet.put(current, true);
			var neighbours = this.findNeighbours(current);
			for (var i = 0; i < neighbours.length; i++) {
				var neighbour = neighbours[i];
				if (neighbour === undefined || closedSet.contains(neighbour)) {
					continue;
				}
				var tentativeGScore = gScores.get(current) + this.distanceBetween(current, neighbour);
				if (tentativeGScore < Number.POSITIVE_INFINITY && (!openSet.contains(neighbour) || tentativeGScore < gScores.get(neighbour))) {
					cameFrom.put(neighbour, current);
					gScores.put(neighbour, tentativeGScore);
					fScores.put(neighbour, gScores.get(neighbour) + this.heuristic(neighbour, goal));
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