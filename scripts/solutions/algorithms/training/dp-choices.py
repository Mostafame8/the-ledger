# Reference solutions for training node dp-choices. Blocks: "# === <node-id>/<step-index>".

# === dp-choices/4
def can_make(coins, amount):
    reach = [False] * (amount + 1)
    reach[0] = True
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and reach[a - c]:
                reach[a] = True
                break
    return reach[amount]

# === dp-choices/5
def count_combinations(coins, amount):
    table = [0] * (amount + 1)
    table[0] = 1
    for c in coins:
        for a in range(c, amount + 1):
            table[a] += table[a - c]
    return table[amount]
