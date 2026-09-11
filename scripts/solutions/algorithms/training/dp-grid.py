# Reference solutions for training node dp-grid. Blocks: "# === <node-id>/<step-index>".

# === dp-grid/4
def min_path(grid):
    rows, cols = len(grid), len(grid[0])
    best = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                best[r][c] = grid[r][c]
            elif r == 0:
                best[r][c] = best[r][c - 1] + grid[r][c]
            elif c == 0:
                best[r][c] = best[r - 1][c] + grid[r][c]
            else:
                best[r][c] = min(best[r - 1][c], best[r][c - 1]) + grid[r][c]
    return best[rows - 1][cols - 1]

# === dp-grid/5
def max_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    best = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                best[r][c] = grid[r][c]
            elif r == 0:
                best[r][c] = best[r][c - 1] + grid[r][c]
            elif c == 0:
                best[r][c] = best[r - 1][c] + grid[r][c]
            else:
                best[r][c] = max(best[r - 1][c], best[r][c - 1]) + grid[r][c]
    return best[rows - 1][cols - 1]
