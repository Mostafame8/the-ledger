# Reference solutions for training node monotonic. Blocks: "# === <node-id>/<step-index>".

# === monotonic/4
def next_greater(nums):
    out = [-1] * len(nums)
    stack = []
    for i in range(len(nums)):
        while stack and nums[stack[-1]] < nums[i]:
            out[stack.pop()] = nums[i]
        stack.append(i)
    return out

# === monotonic/5
def days_until_warmer(temps):
    out = [0] * len(temps)
    stack = []
    for i in range(len(temps)):
        while stack and temps[stack[-1]] < temps[i]:
            j = stack.pop()
            out[j] = i - j
        stack.append(i)
    return out
