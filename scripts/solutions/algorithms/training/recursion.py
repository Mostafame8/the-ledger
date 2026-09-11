# Reference solutions for training node recursion. Blocks: "# === <node-id>/<step-index>".

# === recursion/4
def power(b, e):
    if e == 0:
        return 1
    return b * power(b, e - 1)

# === recursion/5
def binary_strings(n):
    if n == 0:
        return ['']
    shorter = binary_strings(n - 1)
    return ['0' + s for s in shorter] + ['1' + s for s in shorter]
