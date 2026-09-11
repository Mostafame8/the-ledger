# Reference solutions for tool tool-generator. Blocks: "# === <tool-id>/<step-index>".

# === tool-generator/3
def tickets(n):
    k = 1
    while k <= n:
        yield k
        k += 1

def evens(limit):
    for k in range(0, limit + 1, 2):
        yield k
