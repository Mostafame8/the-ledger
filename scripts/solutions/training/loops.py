# Reference solutions for training node loops. Blocks: "# === <node-id>/<step-index>".

# === loops/4
def every_third(n):
    out = []
    for i in range(1, n + 1):
        if i % 3 == 0:
            out.append('clear')
        else:
            out.append(str(i))
    return out

# === loops/5
def count_between(nums, lo, hi):
    count = 0
    for n in nums:
        if lo <= n <= hi:
            count += 1
    return count
