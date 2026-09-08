# Reference solutions for training node two-pointers. Blocks: "# === <node-id>/<step-index>".

# === two-pointers/4
def is_mirror(s):
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return False
        i += 1
        j -= 1
    return True

# === two-pointers/5
def reverse_in_place(nums):
    i, j = 0, len(nums) - 1
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1
