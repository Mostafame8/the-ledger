# Reference solutions for training node dp-line. Blocks: "# === <node-id>/<step-index>".

# === dp-line/4
def climb(n):
    if n < 2:
        return 1
    ways = [0] * (n + 1)
    ways[0], ways[1] = 1, 1
    for i in range(2, n + 1):
        ways[i] = ways[i - 1] + ways[i - 2]
    return ways[n]

# === dp-line/5
def min_cost_climb(cost):
    n = len(cost)
    best = [0] * (n + 1)
    for i in range(2, n + 1):
        best[i] = min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2])
    return best[n]
