# Reference solutions for training node backtracking. Blocks: "# === <node-id>/<step-index>".

# === backtracking/4
def safe_col(cols, row, col):
    for r in range(row):
        if cols[r] == col:
            return False
        if abs(cols[r] - col) == row - r:
            return False
    return True

# === backtracking/5
def count_subsets(nums, target):
    def walk(i, total):
        if total == target:
            return 1
        if i == len(nums) or total > target:
            return 0
        return walk(i + 1, total + nums[i]) + walk(i + 1, total)

    return walk(0, 0)
