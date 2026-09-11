# Reference solutions for training node bits. Blocks: "# === <node-id>/<step-index>".

# === bits/4
def is_odd(n):
    return (n & 1) == 1

# === bits/5
def count_ones(n):
    total = 0
    while n:
        total += n & 1
        n >>= 1
    return total
