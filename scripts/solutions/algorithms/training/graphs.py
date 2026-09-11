# Reference solutions for training node graphs. Blocks: "# === <node-id>/<step-index>".

# === graphs/4
def build_adj(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    return adj

# === graphs/5
def hops(adj, s, t):
    if s == t:
        return 0
    dist = {s: 0}
    queue = [s]
    while queue:
        node = queue.pop(0)
        for nxt in adj[node]:
            if nxt not in dist:
                dist[nxt] = dist[node] + 1
                if nxt == t:
                    return dist[nxt]
                queue.append(nxt)
    return -1
