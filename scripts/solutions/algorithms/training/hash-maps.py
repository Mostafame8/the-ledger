# Reference solutions for training node hash-maps. Blocks: "# === <node-id>/<step-index>".

# === hash-maps/4
def pair_with_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        need = target - n
        if need in seen:
            return (seen[need], i)
        seen[n] = i
    return None

# === hash-maps/5
def first_repeat(nums):
    seen = {}
    for n in nums:
        if n in seen:
            return n
        seen[n] = True
    return None
