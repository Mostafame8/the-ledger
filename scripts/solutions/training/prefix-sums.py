# Reference solutions for training node prefix-sums. Blocks: "# === <node-id>/<step-index>".

# === prefix-sums/4
def range_sum_query(nums, queries):
    pre = [0]
    for n in nums:
        pre.append(pre[-1] + n)
    out = []
    for i, j in queries:
        out.append(pre[j + 1] - pre[i])
    return out

# === prefix-sums/5
def equilibrium_index(nums):
    total = sum(nums)
    left = 0
    for i, n in enumerate(nums):
        if left == total - left - n:
            return i
        left += n
    return -1
