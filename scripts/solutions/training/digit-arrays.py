# Reference solutions for training node digit-arrays. Blocks: "# === <node-id>/<step-index>".

# === digit-arrays/4
def to_number(digits):
    n = 0
    for d in digits:
        n = n * 10 + d
    return n

# === digit-arrays/5
def to_digits(n):
    if n == 0:
        return [0]
    out = []
    while n > 0:
        out.append(n % 10)
        n //= 10
    out.reverse()
    return out
