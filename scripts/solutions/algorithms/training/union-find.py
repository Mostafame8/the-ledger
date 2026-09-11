# Reference solutions for training node union-find. Blocks: "# === <node-id>/<step-index>".

# === union-find/4
def find(parent, x):
    root = x
    while parent[root] != root:
        root = parent[root]
    while x != root:
        nxt = parent[x]
        parent[x] = root
        x = nxt
    return root

# === union-find/5
def count_groups(n, pairs):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    groups = n
    for a, b in pairs:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra
            groups -= 1
    return groups
