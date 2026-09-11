# Reference solutions for training node enumeration. Blocks: "# === <node-id>/<step-index>".

# === enumeration/4
def combos(items, k):
    if k == 0:
        return [[]]
    if len(items) < k:
        return []
    first, rest = items[0], items[1:]
    with_first = [[first] + c for c in combos(rest, k - 1)]
    without = combos(rest, k)
    return with_first + without

# === enumeration/5
def letter_cases(s):
    if not s:
        return ['']
    rest = letter_cases(s[1:])
    first = s[0].lower()
    return [first + r for r in rest] + [first.upper() + r for r in rest]
