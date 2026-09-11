# Reference solutions for armoury tool tool-tree-node. Blocks: "# === <tool-id>/<step-index>".
# The block defines Node the same guarded way the drill's tests do, so it runs standalone.

# === tool-tree-node/3
if 'Node' not in globals():
    class Node:
        def __init__(self, val, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right


def is_leaf(node):
    return node.left is None and node.right is None


def under(node):
    out = []
    if node.left is not None:
        out.append(node.left.val)
    if node.right is not None:
        out.append(node.right.val)
    return out
