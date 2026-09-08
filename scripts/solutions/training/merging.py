# Reference solutions for training node merging. Blocks: "# === <node-id>/<step-index>".

# === merging/4
def merge_sorted(a, b):
    i, j = 0, 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:] + b[j:])
    return out

# === merging/5
def merge_three(a, b, c):
    def two(x, y):
        i, j = 0, 0
        out = []
        while i < len(x) and j < len(y):
            if x[i] <= y[j]:
                out.append(x[i])
                i += 1
            else:
                out.append(y[j])
                j += 1
        out.extend(x[i:] + y[j:])
        return out
    return two(two(a, b), c)
