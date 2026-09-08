# Reference solutions for training node linked-lists. Blocks: "# === <node-id>/<step-index>".
# Each block defines Node the same guarded way the drill's tests do, so it runs standalone.

# === linked-lists/4
if 'Node' not in globals():
    class Node:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next


def has_cycle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

# === linked-lists/5
if 'Node' not in globals():
    class Node:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next


def reverse_list(head):
    prev = None
    while head is not None:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev
