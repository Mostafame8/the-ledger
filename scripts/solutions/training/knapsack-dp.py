# Reference solutions for training node knapsack-dp. Blocks: "# === <node-id>/<step-index>".

# === knapsack-dp/4
def knap(weights, values, cap):
    row = [0] * (cap + 1)
    for i in range(len(weights)):
        w, v = weights[i], values[i]
        for c in range(cap, w - 1, -1):
            row[c] = max(row[c], v + row[c - w])
    return row[cap]

# === knapsack-dp/5
def subset_exists(nums, target):
    reach = [False] * (target + 1)
    reach[0] = True
    for x in nums:
        for t in range(target, x - 1, -1):
            if reach[t - x]:
                reach[t] = True
    return reach[target]
