# Reference solutions for training node interval-dp. Blocks: "# === <node-id>/<step-index>".

# === interval-dp/4
def count_pal_substrings(s):
    n = len(s)
    table = [[False] * n for _ in range(n)]
    total = 0
    for i in range(n):
        table[i][i] = True
        total += 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 2:
                table[i][j] = s[i] == s[j]
            else:
                table[i][j] = s[i] == s[j] and table[i + 1][j - 1]
            if table[i][j]:
                total += 1
    return total

# === interval-dp/5
def longest_pal_len(s):
    n = len(s)
    table = [[False] * n for _ in range(n)]
    best = 0
    for i in range(n):
        table[i][i] = True
        best = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 2:
                table[i][j] = s[i] == s[j]
            else:
                table[i][j] = s[i] == s[j] and table[i + 1][j - 1]
            if table[i][j] and length > best:
                best = length
    return best
