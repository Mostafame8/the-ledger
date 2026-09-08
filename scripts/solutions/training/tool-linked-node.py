# Reference solutions for armoury tool tool-linked-node. Blocks: "# === <tool-id>/<step-index>".
# The block defines Node the same guarded way the drill's tests do, so it runs standalone.

# === tool-linked-node/3
if 'Node' not in globals():
    class Node:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next


def link(a, b):
    a.next = b
    return a


def value_after(node):
    if node.next is None:
        return None
    return node.next.val
