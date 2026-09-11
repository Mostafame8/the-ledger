# Reference solutions for armoury tool tool-graph. Blocks: "# === <tool-id>/<step-index>".

# === tool-graph/3
def add_road(adj, u, v):
    adj[u].append(v)
    adj[v].append(u)
    return adj


def neighbours(adj, u):
    return adj[u]
