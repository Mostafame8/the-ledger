# Reference solutions for training node binary-search. Blocks: "# === <node-id>/<step-index>".

# === binary-search/4
def first_true(flags):
    lo, hi = 0, len(flags) - 1
    ans = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if flags[mid]:
            ans = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return ans

# === binary-search/5
def insert_position(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
