# Reference solutions for training node sets. Blocks: "# === <node-id>/<step-index>".

# === sets/4
def unique_in_order(nums):
    seen = set()
    out = []
    for n in nums:
        if n not in seen:
            out.append(n)
            seen.add(n)
    return out

# === sets/5
def common(a, b):
    return sorted(set(a) & set(b))
