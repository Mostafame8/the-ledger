# Reference solutions for Arc III. One block per gate, introduced by "# === <id>".

# === sewers
from collections import deque

def shortest_path(grid, start, exit):
    if start == exit:
        return 0
    rows, cols = len(grid), len(grid[0])
    seen = {start}
    q = deque([(start, 0)])
    while q:
        (r, c), d = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                if (nr, nc) == exit:
                    return d + 1
                seen.add((nr, nc))
                q.append(((nr, nc), d + 1))
    return -1

# === islands
def _regions(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    sizes = []
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in seen:
                stack, size = [(r, c)], 0
                seen.add((r, c))
                while stack:
                    y, x = stack.pop()
                    size += 1
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == 1 and (ny, nx) not in seen:
                            seen.add((ny, nx))
                            stack.append((ny, nx))
                sizes.append(size)
    return sizes

def count_regions(grid):
    return len(_regions(grid))

def largest_region(grid):
    return max(_regions(grid), default=0)

# === oranges
from collections import deque

def minutes_to_fill(grid):
    rows, cols = len(grid), len(grid[0])
    q = deque((r, c, 0) for r in range(rows) for c in range(cols) if grid[r][c] == 2)
    open_cells = sum(row.count(1) for row in grid)
    seen = {(r, c) for r, c, _ in q}
    minutes = 0
    while q:
        r, c, t = q.popleft()
        minutes = max(minutes, t)
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:
                seen.add((nr, nc))
                open_cells -= 1
                q.append((nr, nc, t + 1))
    return minutes if open_cells == 0 else -1

# === clone
class Node:
    def __init__(self, val, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def clone_graph(node):
    if node is None:
        return None
    copies = {}
    def go(n):
        if n in copies:
            return copies[n]
        c = Node(n.val)
        copies[n] = c
        c.neighbors = [go(m) for m in n.neighbors]
        return c
    return go(node)

# === topo
from collections import deque

def task_order(n, edges):
    indeg = [0] * n
    out = [[] for _ in range(n)]
    for a, b in edges:
        out[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        t = q.popleft()
        order.append(t)
        for b in out[t]:
            indeg[b] -= 1
            if indeg[b] == 0:
                q.append(b)
    return order if len(order) == n else []

# === timetable
def merge_intervals(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

def largest_gap(intervals):
    m = merge_intervals(intervals)
    return max((m[i + 1][0] - m[i][1] for i in range(len(m) - 1)), default=0)

# === letters
def letter_combinations(digits):
    if not digits:
        return []
    keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    out = [""]
    for d in digits:
        out = [w + c for w in out for c in keys[d]]
    return out

# === heap
import heapq

def k_largest(nums, k):
    return heapq.nlargest(k, nums)

class TopK:
    def __init__(self, k):
        self.k, self.h = k, []

    def add(self, value):
        if len(self.h) < self.k:
            heapq.heappush(self.h, value)
        elif value > self.h[0]:
            heapq.heapreplace(self.h, value)

    def top(self):
        return sorted(self.h, reverse=True)

# === counting
def counting_sort(nums, max_value):
    counts = [0] * (max_value + 1)
    for x in nums:
        counts[x] += 1
    out = []
    for v, c in enumerate(counts):
        out.extend([v] * c)
    return out

def bucket_sort(values):
    n = len(values)
    if n == 0:
        return []
    buckets = [[] for _ in range(n)]
    for v in values:
        buckets[min(int(v * n), n - 1)].append(v)
    out = []
    for b in buckets:
        # insertion sort inside each bucket
        for i in range(1, len(b)):
            j = i
            while j > 0 and b[j - 1] > b[j]:
                b[j - 1], b[j] = b[j], b[j - 1]
                j -= 1
        out.extend(b)
    return out

# === meetings
import heapq

def max_concurrent(intervals):
    ends, best = [], 0
    for s, e in sorted(intervals):
        while ends and ends[0] <= s:
            heapq.heappop(ends)
        heapq.heappush(ends, e)
        best = max(best, len(ends))
    return best

# === sorts
def merge_sort(nums):
    if len(nums) <= 1:
        return list(nums)
    mid = len(nums) // 2
    a, b = merge_sort(nums[:mid]), merge_sort(nums[mid:])
    out, i, j = [], 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    return out + a[i:] + b[j:]

def quick_sort(nums):
    if len(nums) <= 1:
        return list(nums)
    pivot = nums[len(nums) // 2]
    less = [x for x in nums if x < pivot]
    equal = [x for x in nums if x == pivot]
    more = [x for x in nums if x > pivot]
    return quick_sort(less) + equal + quick_sort(more)

# === quickselect
import random

def kth_largest(nums, k):
    nums = list(nums)
    target = len(nums) - k          # index in ascending order
    lo, hi = 0, len(nums) - 1
    while True:
        p = random.randint(lo, hi)
        nums[p], nums[hi] = nums[hi], nums[p]
        pivot, store = nums[hi], lo
        for i in range(lo, hi):
            if nums[i] < pivot:
                nums[i], nums[store] = nums[store], nums[i]
                store += 1
        nums[store], nums[hi] = nums[hi], nums[store]
        if store == target:
            return nums[store]
        if store < target:
            lo = store + 1
        else:
            hi = store - 1

# === perms
def permutations(items):
    items = list(items)
    if len(items) <= 1:
        return [items]
    out = []
    for i, x in enumerate(items):
        for rest in permutations(items[:i] + items[i + 1:]):
            out.append([x] + rest)
    return out

def subsets(items):
    items = list(items)
    if not items:
        return [[]]
    rest = subsets(items[1:])
    return rest + [[items[0]] + s for s in rest]

# === safe
def safe_codes():
    primes = {2, 3, 5, 7, 11, 13, 17}
    out = []
    def go(code, used):
        if len(code) == 6:
            out.append(code)
            return
        for d in "0123456789":
            if d in used:
                continue
            if code and int(code[-1]) + int(d) not in primes:
                continue
            go(code + d, used | {d})
    go("", frozenset())
    return out

def n_queens(n):
    count = 0
    cols, d1, d2 = set(), set(), set()
    def place(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c)
            place(r + 1)
            cols.discard(c); d1.discard(r - c); d2.discard(r + c)
    place(0)
    return count

# === task
from collections import Counter
import heapq

def least_interval(tasks, n):
    heap = [-c for c in Counter(tasks).values()]
    heapq.heapify(heap)
    time = 0
    while heap:
        batch, survivors = 0, []
        for _ in range(n + 1):
            if heap:
                c = heapq.heappop(heap) + 1
                if c < 0:
                    survivors.append(c)
                batch += 1
        for c in survivors:
            heapq.heappush(heap, c)
        time += n + 1 if heap else batch
    return time

# === wordsearch
def exist(board, word):
    rows, cols = len(board), len(board[0])
    def go(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[i]:
            return False
        saved, board[r][c] = board[r][c], None
        found = go(r + 1, c, i + 1) or go(r - 1, c, i + 1) or go(r, c + 1, i + 1) or go(r, c - 1, i + 1)
        board[r][c] = saved
        return found
    return any(go(r, c, 0) for r in range(rows) for c in range(cols))
