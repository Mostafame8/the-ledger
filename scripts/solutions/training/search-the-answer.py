# Reference solutions for training node search-the-answer. Blocks: "# === <node-id>/<step-index>".

# === search-the-answer/4
def feasible(nums, k, limit):
    pieces = 1
    load = 0
    for x in nums:
        if x > limit:
            return False
        if load + x > limit:
            pieces += 1
            load = x
        else:
            load += x
    return pieces <= k

# === search-the-answer/5
def sqrt_floor(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo
