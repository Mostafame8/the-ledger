# Reference solutions for training node heaps. Blocks: "# === <node-id>/<step-index>".

# === heaps/4
import heapq


def k_smallest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, -x)
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(-v for v in heap)

# === heaps/5
import heapq


def k_closest(nums, x, k):
    heap = []
    for v in nums:
        heapq.heappush(heap, (-abs(v - x), -v, v))
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(v for _, _, v in heap)
