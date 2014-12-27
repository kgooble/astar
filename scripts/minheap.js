define([], function () {

	var MinHeapElement = function (value, priority) {
		this.value = value;
		this.priority = priority;
	};

	var MinHeap = function () {
		this.items = [];
	};

	MinHeap.prototype.parent = function (i) {
		if (i === 0) {
			return null;
		}
		return Math.floor((i - 1) / 2);
	};
	MinHeap.prototype.leftChild = function (i) {
		var c = 2 * i + 1;
		if (c >= this.items.length) {
			return null;
		}
		return c;
	};
	MinHeap.prototype.rightChild = function (i) {
		var c = 2 * i + 2;
		if (c >= this.items.length) {
			return null;
		}
		return c;
	};

	MinHeap.prototype.contains = function (item) {
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i].value == item) {
				return true;
			}
		}
		return false;
	};

	MinHeap.prototype.insert = function (item, priority) {
		this.items.push(new MinHeapElement(item, priority));

		var i = this.items.length - 1;

		while (i > 0 && this.items[i].priority < this.items[this.parent(i)].priority) {
			var temp = this.items[this.parent(i)];
			this.items[this.parent(i)] = this.items[i];
			this.items[i] = temp;
			i = this.parent(i);
		}
	};

	MinHeap.prototype.pop = function () {
		var minItem = this.items[0];

		if (this.items.length === 1) {
			this.items = [];
		} else {
			var lastItem = this.items[this.items.length - 1];
			this.items[this.items.length - 1] = minItem;
			this.items[0] = lastItem;
			this.items.splice(this.items.length - 1, 1);

			var i = 0;
			while (i < this.items.length && 
				(this.leftChild(i) !== null && this.items[this.leftChild(i)].priority < this.items[i].priority) || 
				(this.rightChild(i) !== null && this.items[this.rightChild(i)].priority < this.items[i].priority)) {

				var left = this.leftChild(i);
				var right = this.rightChild(i);
				if (right === null || this.items[left].priority < this.items[right].priority) {
					var tmp = this.items[left];
					this.items[left] = this.items[i];
					this.items[i] = tmp;
					i = left;
				} else {
					var tmp = this.items[right];
					this.items[right] = this.items[i];
					this.items[i] = tmp;
					i = right;
				}
			}
		}
		return minItem.value;
	};

	MinHeap.prototype.isEmpty = function () {
		return this.size() === 0;
	};

	MinHeap.prototype.size = function () {
		return this.items.length;
	};

	return {
		MinHeap: MinHeap
	};
});