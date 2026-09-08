# Reference solutions for training node grids. Blocks: "# === <node-id>/<step-index>".

# === grids/4
def column(grid, c):
    out = []
    for r in range(len(grid)):
        out.append(grid[r][c])
    return out

# === grids/5
def diagonal(grid):
    out = []
    for i in range(len(grid)):
        out.append(grid[i][i])
    return out
