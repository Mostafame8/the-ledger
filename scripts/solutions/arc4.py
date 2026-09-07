# Reference solutions for Arc IV. One block per gate, introduced by "# === <id>".

# === bipartite
from collections import deque

def is_bipartite(graph):
    colour = [-1] * len(graph)
    for s in range(len(graph)):
        if colour[s] != -1:
            continue
        colour[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if colour[v] == -1:
                    colour[v] = 1 - colour[u]
                    q.append(v)
                elif colour[v] == colour[u]:
                    return False
    return True

# === routes
import heapq

def cheapest_route(n, edges, src, targets):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    targets = set(targets)
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        if u in targets:
            return d
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return -1

# === union
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)

def count_networks(n, pairs):
    uf = UnionFind(n)
    count = n
    for a, b in pairs:
        if uf.union(a, b):
            count -= 1
    return count

# === mst
def min_wiring_cost(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total, taken = 0, 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            taken += 1
            if taken == n - 1:
                break
    return total if taken == n - 1 else -1

# === bellman
def bellman_ford(n, edges, src):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    for u, v, w in edges:
        if dist[u] != INF and dist[u] + w < dist[v]:
            return None
    return dist

# === stairs
def climb_stairs(n):
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a

# === robber
def rob(nums):
    skip = take = 0
    for x in nums:
        skip, take = max(skip, take), skip + x
    return max(skip, take)

# === jump
def can_jump(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + step)
    return True

# === paths
def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]
    return row[-1]

def unique_paths_with_obstacles(grid):
    rows, cols = len(grid), len(grid[0])
    row = [0] * cols
    row[0] = 0 if grid[0][0] else 1
    for r in range(rows):
        for c in range(cols):
            if grid[r][c]:
                row[c] = 0
            elif c > 0:
                row[c] += row[c - 1]
    return row[-1]

# === coins
def coin_change(coins, amount):
    INF = amount + 1
    best = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return best[amount] if best[amount] != INF else -1

# === minpath
def min_path_sum(grid):
    cols = len(grid[0])
    row = [0] * cols
    for r, line in enumerate(grid):
        for c, v in enumerate(line):
            if r == 0 and c == 0:
                row[c] = v
            elif r == 0:
                row[c] = row[c - 1] + v
            elif c == 0:
                row[c] = row[c] + v
            else:
                row[c] = min(row[c], row[c - 1]) + v
    return row[-1]

# === decode
def num_decodings(s):
    if not s or s[0] == '0':
        return 0
    prev, cur = 1, 1
    for i in range(1, len(s)):
        nxt = 0
        if s[i] != '0':
            nxt += cur
        if 10 <= int(s[i - 1:i + 1]) <= 26:
            nxt += prev
        prev, cur = cur, nxt
    return cur

# === lis
from bisect import bisect_left

def longest_increasing(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)

# === wordbreak
def word_break(s, word_dict):
    words = set(word_dict)
    can = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(i):
            if can[j] and s[j:i] in words:
                can[i] = True
                break
    return can[-1]
