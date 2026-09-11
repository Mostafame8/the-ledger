# Reference solutions for tool tool-closure. Blocks: "# === <tool-id>/<step-index>".

# === tool-closure/3
def make_counter():
    count = 0
    def bump():
        nonlocal count
        count += 1
        return count
    return bump

def make_adder(n):
    def add(x):
        return x + n
    return add
