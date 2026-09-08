# Reference solutions for training node rotation. Blocks: "# === <node-id>/<step-index>".

# === rotation/4
def reverse_range(nums, i, j):
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1

def rotate_right(nums, k):
    n = len(nums)
    if n == 0:
        return None
    k = k % n
    reverse_range(nums, 0, n - 1)
    reverse_range(nums, 0, k - 1)
    reverse_range(nums, k, n - 1)
    return None

# === rotation/5
def rotate_left_string(s, k):
    if not s:
        return s
    k = k % len(s)
    return s[k:] + s[:k]
