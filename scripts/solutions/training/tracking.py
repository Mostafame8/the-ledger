# Reference solutions for training node tracking. Blocks: "# === <node-id>/<step-index>".

# === tracking/4
def running_max(nums):
    if not nums:
        return []
    best = nums[0]
    out = []
    for n in nums:
        best = max(best, n)
        out.append(best)
    return out

# === tracking/5
def longest_run(nums):
    best = 0
    run = 0
    for i, n in enumerate(nums):
        if i > 0 and n == nums[i - 1]:
            run += 1
        else:
            run = 1
        if run > best:
            best = run
    return best
