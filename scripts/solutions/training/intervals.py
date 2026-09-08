# Reference solutions for training node intervals. Blocks: "# === <node-id>/<step-index>".

# === intervals/4
def total_covered(intervals):
    blocks = []
    for start, end in sorted(intervals):
        if blocks and start <= blocks[-1][1]:
            blocks[-1][1] = max(blocks[-1][1], end)
        else:
            blocks.append([start, end])
    return sum(end - start for start, end in blocks)

# === intervals/5
def has_overlap(intervals):
    order = sorted(intervals)
    for i in range(1, len(order)):
        if order[i][0] < order[i - 1][1]:
            return True
    return False
