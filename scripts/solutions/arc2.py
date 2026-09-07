# Reference solutions for Arc II. One block per gate, introduced by "# === <id>".

# === halden
def find_key(rack, target):
    lo, hi = 0, len(rack) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = rack[mid]
        if v == target:
            return mid
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# === rotate
def rotate(nums, k):
    n = len(nums)
    if n == 0:
        return
    k %= n
    def rev(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1
    rev(0, n - 1)
    rev(0, k - 1)
    rev(k, n - 1)

# === merge
def merge(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out

# === firstbad
def first_bad_version(n, is_bad):
    lo, hi = 1, n
    while lo < hi:
        mid = (lo + hi) // 2
        if is_bad(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

# === window
def longest_unique_substring(s):
    last, start, best = {}, 0, 0
    for i, c in enumerate(s):
        if c in last and last[c] >= start:
            start = last[c] + 1
        last[c] = i
        best = max(best, i - start + 1)
    return best

# === prefix
class RangeSum:
    def __init__(self, nums):
        self.pre = [0]
        for x in nums:
            self.pre.append(self.pre[-1] + x)

    def sum_range(self, i, j):
        return self.pre[j + 1] - self.pre[i]

# === minsub
def min_subarray_len(target, nums):
    best, total, left = 0, 0, 0
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            size = right - left + 1
            best = size if best == 0 else min(best, size)
            total -= nums[left]
            left += 1
    return best

# === kadane
def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

# === product
def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    acc = 1
    for i in range(n):
        out[i] = acc
        acc *= nums[i]
    acc = 1
    for i in range(n - 1, -1, -1):
        out[i] *= acc
        acc *= nums[i]
    return out

# === twoptr
def pair_with_diff(nums, d):
    i, j = 0, 1
    while j < len(nums):
        diff = nums[j] - nums[i]
        if i != j and diff == d:
            return [nums[i], nums[j]]
        if diff < d:
            j += 1
        else:
            i += 1
            if i == j:
                j += 1
    return None

def three_sum(nums):
    nums = sorted(nums)
    out = []
    for i in range(len(nums) - 2):
        if i and nums[i] == nums[i - 1]:
            continue
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                out.append([nums[i], nums[lo], nums[hi]])
                lo += 1
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1
                hi -= 1
            elif s < 0:
                lo += 1
            else:
                hi -= 1
    return out

# === linked
def reverse_list(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

# === rotsearch
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

# === mergell
class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def merge_lists(a, b):
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next

# === tree
from collections import deque

def preorder(root):
    return [] if root is None else [root.val] + preorder(root.left) + preorder(root.right)

def inorder(root):
    return [] if root is None else inorder(root.left) + [root.val] + inorder(root.right)

def postorder(root):
    return [] if root is None else postorder(root.left) + postorder(root.right) + [root.val]

def max_depth(root):
    return 0 if root is None else 1 + max(max_depth(root.left), max_depth(root.right))

def level_order(root):
    out, q = [], deque([root] if root else [])
    while q:
        out.append([n.val for n in q])
        q = deque(c for n in q for c in (n.left, n.right) if c)
    return out

# === bst
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def search(root, val):
    while root:
        if val == root.val:
            return True
        root = root.left if val < root.val else root.right
    return False

def is_valid_bst(root, lo=float("-inf"), hi=float("inf")):
    if root is None:
        return True
    return lo < root.val < hi and is_valid_bst(root.left, lo, root.val) and is_valid_bst(root.right, root.val, hi)

def kth_smallest(root, k):
    stack, node = [], root
    while True:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right

# === lca
def lowest_common_ancestor(root, p, q):
    if root is None or root is p or root is q:
        return root
    l = lowest_common_ancestor(root.left, p, q)
    r = lowest_common_ancestor(root.right, p, q)
    return root if l and r else l or r

def lca_bst(root, p, q):
    lo, hi = min(p.val, q.val), max(p.val, q.val)
    while root:
        if hi < root.val:
            root = root.left
        elif lo > root.val:
            root = root.right
        else:
            return root
