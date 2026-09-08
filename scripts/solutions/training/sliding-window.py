# Reference solutions for training node sliding-window. Blocks: "# === <node-id>/<step-index>".

# === sliding-window/4
def longest_no_repeat(s):
    seen = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        best = max(best, right - left + 1)
    return best

# === sliding-window/5
def count_windows_over(nums, k, limit):
    if k <= 0 or len(nums) < k:
        return 0
    s = sum(nums[:k])
    count = 1 if s > limit else 0
    for r in range(k, len(nums)):
        s += nums[r] - nums[r - k]
        if s > limit:
            count += 1
    return count
