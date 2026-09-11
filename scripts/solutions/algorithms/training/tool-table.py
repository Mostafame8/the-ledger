# Reference solutions for armoury tool tool-table. Blocks: "# === <tool-id>/<step-index>".

# === tool-table/3
def new_page(rows, cols):
    return [[0] * cols for _ in range(rows)]


def write(t, r, c, figure):
    t[r][c] = figure
    return t
