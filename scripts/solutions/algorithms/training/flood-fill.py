# Reference solutions for training node flood-fill. Blocks: "# === <node-id>/<step-index>".

# === flood-fill/4
def fill(grid, r, c, new):
    old = grid[r][c]
    if old == new:
        return grid
    grid[r][c] = new
    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == old:
            fill(grid, nr, nc, new)
    return grid

# === flood-fill/5
def region_size(grid, r, c):
    target = grid[r][c]
    seen = {(r, c)}
    stack = [(r, c)]
    while stack:
        cr, cc = stack.pop()
        for nr, nc in ((cr - 1, cc), (cr + 1, cc), (cr, cc - 1), (cr, cc + 1)):
            if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                continue
            if grid[nr][nc] == target and (nr, nc) not in seen:
                seen.add((nr, nc))
                stack.append((nr, nc))
    return len(seen)
