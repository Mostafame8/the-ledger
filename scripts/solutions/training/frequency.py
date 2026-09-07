# Reference solutions for training node frequency. Blocks: "# === <node-id>/<step-index>".

# === frequency/4
def is_anagram(a, b):
    def tally(s):
        t = {}
        for ch in s:
            t[ch] = t.get(ch, 0) + 1
        return t
    return tally(a) == tally(b)

# === frequency/5
def most_common(nums):
    tally = {}
    for n in nums:
        tally[n] = tally.get(n, 0) + 1
    best = None
    for n in sorted(tally):
        if best is None or tally[n] > tally[best]:
            best = n
    return best
