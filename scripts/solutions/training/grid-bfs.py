# Reference solutions for training node grid-bfs. Blocks: "# === <node-id>/<step-index>".

# === grid-bfs/4
def neighbours(grid, r, c):
    out = []
    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
            continue
        if grid[nr][nc] == 0:
            out.append((nr, nc))
    return out

# === grid-bfs/5
def count_reachable(grid, start):
    queue = [start]
    seen = {start}
    while queue:
        r, c = queue.pop(0)
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                continue
            if grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc))
    return len(seen)
