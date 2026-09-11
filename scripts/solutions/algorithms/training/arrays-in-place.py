# Reference solutions for training node arrays-in-place. Blocks: "# === <node-id>/<step-index>".

# === arrays-in-place/4
def swap_ends(nums):
    if len(nums) < 2:
        return None
    nums[0], nums[-1] = nums[-1], nums[0]
    return None

# === arrays-in-place/5
def move_negatives_back(nums):
    negatives = [n for n in nums if n < 0]
    w = 0
    for n in nums:
        if n >= 0:
            nums[w] = n
            w += 1
    for n in negatives:
        nums[w] = n
        w += 1
