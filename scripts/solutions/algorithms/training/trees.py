# Reference solutions for training node trees. Blocks: "# === <node-id>/<step-index>".
# Each block defines Node the same guarded way the drill's tests do, so it runs standalone.

# === trees/4
if 'Node' not in globals():
    class Node:
        def __init__(self, val, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right


def inorder(root):
    if root is None:
        return []
    out = []
    out.extend(inorder(root.left))
    out.append(root.val)
    out.extend(inorder(root.right))
    return out

# === trees/5
if 'Node' not in globals():
    class Node:
        def __init__(self, val, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right


def bst_contains(root, x):
    while root is not None:
        if root.val == x:
            return True
        root = root.left if x < root.val else root.right
    return False
