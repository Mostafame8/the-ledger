# Reference solutions for training node two-strings. Blocks: "# === <node-id>/<step-index>".

# === two-strings/4
def edit(a, b):
    rows, cols = len(a) + 1, len(b) + 1
    table = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        table[i][0] = i
    for j in range(cols):
        table[0][j] = j
    for i in range(1, rows):
        for j in range(1, cols):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1]
            else:
                table[i][j] = 1 + min(table[i - 1][j - 1], table[i - 1][j], table[i][j - 1])
    return table[rows - 1][cols - 1]

# === two-strings/5
def min_deletions_to_equal(a, b):
    rows, cols = len(a) + 1, len(b) + 1
    table = [[0] * cols for _ in range(rows)]
    for i in range(1, rows):
        for j in range(1, cols):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1] + 1
            else:
                table[i][j] = max(table[i - 1][j], table[i][j - 1])
    return len(a) + len(b) - 2 * table[rows - 1][cols - 1]
