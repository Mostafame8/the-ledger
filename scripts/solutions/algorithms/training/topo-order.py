# Reference solutions for training node topo-order. Blocks: "# === <node-id>/<step-index>".

# === topo-order/4
def topo(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    queue = [i for i in range(n) if indeg[i] == 0]
    out = []
    while queue:
        node = queue.pop(0)
        out.append(node)
        for nxt in adj[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    return out if len(out) == n else []

# === topo-order/5
def can_finish(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    queue = [i for i in range(n) if indeg[i] == 0]
    done = 0
    while queue:
        node = queue.pop(0)
        done += 1
        for nxt in adj[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    return done == n
