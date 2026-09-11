# Reference solutions for training node stacks. Blocks: "# === <node-id>/<step-index>".

# === stacks/4
def matching(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c not in pairs:
            stack.append(c)
        else:
            if not stack or stack.pop() != pairs[c]:
                return False
    return not stack

# === stacks/5
def undo_sequence(ops):
    kept = []
    for c in ops:
        if c == '#':
            if kept:
                kept.pop()
        else:
            kept.append(c)
    return ''.join(kept)
