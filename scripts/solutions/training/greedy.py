# Reference solutions for training node greedy. Blocks: "# === <node-id>/<step-index>".

# === greedy/4
def min_coins_greedy(amount, coins):
    used = 0
    for c in coins:
        take = amount // c
        used += take
        amount = amount - take * c
    return used

# === greedy/5
def kept_shifts(intervals):
    kept = []
    end = 0
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        if s >= end:
            kept.append([s, e])
            end = e
    return kept
