# Reference solutions for training node string-search. Blocks: "# === <node-id>/<step-index>".

# === string-search/4
def expand(s, lo, hi):
    while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
        lo -= 1
        hi += 1
    return (lo + 1, hi - 1)

# === string-search/5
def count_occurrences(text, pat):
    total = 0
    for i in range(len(text) - len(pat) + 1):
        if text[i:i + len(pat)] == pat:
            total += 1
    return total
