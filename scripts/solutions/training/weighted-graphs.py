# Reference solutions for training node weighted-graphs. Blocks: "# === <node-id>/<step-index>".

# === weighted-graphs/4
import heapq


def dijkstra(n, adj, src):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nxt, w in adj[node]:
            if d + w < dist[nxt]:
                dist[nxt] = d + w
                heapq.heappush(heap, (dist[nxt], nxt))
    return dist

# === weighted-graphs/5
import heapq


def cheapest(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    best = [float('inf')] * n
    best[s] = 0
    heap = [(0, s)]
    while heap:
        d, node = heapq.heappop(heap)
        if node == t:
            return d
        if d > best[node]:
            continue
        for nxt, w in adj[node]:
            if d + w < best[nxt]:
                best[nxt] = d + w
                heapq.heappush(heap, (best[nxt], nxt))
    return -1
