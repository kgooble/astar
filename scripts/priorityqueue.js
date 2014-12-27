define(['minheap'], function (minheap) {
	var PriorityQueue = function () {
		this.minheap = new minheap.MinHeap();
	};

	PriorityQueue.prototype.enqueue = function (item, priority) {
		this.minheap.insert(item, priority);
	};

	PriorityQueue.prototype.contains = function (item) {
		return this.minheap.contains(item);
	};

	PriorityQueue.prototype.dequeue = function () {
		return this.minheap.pop();
	};

	PriorityQueue.prototype.size = function () {
		return this.minheap.size();
	};

	PriorityQueue.prototype.isEmpty = function () {
		return this.minheap.isEmpty();
	};

	return {
		PriorityQueue: PriorityQueue
	};
});