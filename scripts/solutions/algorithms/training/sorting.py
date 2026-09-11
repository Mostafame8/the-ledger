# Reference solutions for training node sorting. Blocks: "# === <node-id>/<step-index>".

# === sorting/4
def partition(nums, lo, hi):
    pivot = nums[hi]
    i = lo
    for j in range(lo, hi):
        if nums[j] <= pivot:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
    nums[i], nums[hi] = nums[hi], nums[i]
    return i

# === sorting/5
def sort_012(nums):
    low = 0
    mid = 0
    high = len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[high], nums[mid] = nums[mid], nums[high]
            high -= 1
        else:
            mid += 1
    return None
