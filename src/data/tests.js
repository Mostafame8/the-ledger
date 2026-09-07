// Python tests per gate, keyed by gate id. Each string runs after the learner's code and
// src/harness.py in the same namespace. Use check(...) from the harness:
//   check("expr", expected)               evaluates expr, compares
//   check(label, thunk_or_value, expected) for in-place work, helpers, or multi-step setups
// Only the main mission is tested, never the stretch. Helper names start with _t_ so they
// cannot collide with a learner's own names. Run `npm test` to prove the tests against
// scripts/solutions/*.py.
export const TESTS = {

// ─── Arc I — Recruitment ───────────────────────────────────────────────────────
fizz: `
check("radio_check(15)", ['1', '2', 'clear', '4', 'hold', 'clear', '7', '8', 'clear', 'hold', '11', 'clear', '13', '14', 'clear hold'])
check("radio_check(0)", [])
check("radio_check(1)", ['1'])
check("radio_check(30)[29]", 'clear hold')
check("len(radio_check(100))", 100)
`,
zeros: `
check("move_zeros([0, 1, 0, 3, 12])", lambda: inplace(move_zeros, [0, 1, 0, 3, 12]), [1, 3, 12, 0, 0])
check("move_zeros([0])", lambda: inplace(move_zeros, [0]), [0])
check("move_zeros([1, 2, 3])", lambda: inplace(move_zeros, [1, 2, 3]), [1, 2, 3])
check("move_zeros([0, 0, 1])", lambda: inplace(move_zeros, [0, 0, 1]), [1, 0, 0])
check("move_zeros([4, 0, 5, 0, 0, 6])", lambda: inplace(move_zeros, [4, 0, 5, 0, 0, 6]), [4, 5, 6, 0, 0, 0])
`,
palin: `
check("is_palindrome('A man, a plan, a canal: Panama')", True)
check("is_palindrome('race a car')", False)
check("is_palindrome('')", True)
check("is_palindrome('0P')", False)
check("is_palindrome('Was it a car or a cat I saw?')", True)
check("is_palindrome('ab')", False)
`,
reverse: `
check("reverse_words('the sky is blue')", 'blue is sky the')
check("reverse_words('  hello world  ')", 'world hello')
check("reverse_words('a good   example')", 'example good a')
check("reverse_words('single')", 'single')
`,
twosum: `
check("sorted(two_sum([2, 7, 11, 15], 9))", [0, 1])
check("sorted(two_sum([3, 2, 4], 6))", [1, 2])
check("sorted(two_sum([3, 3], 6))", [0, 1])
check("sorted(two_sum([-1, 4, 10, 6], 9))", [0, 2])
check("sorted(two_sum([500, 20, 750, 1250], 1270))", [1, 3])
`,
anagram: `
check("is_anagram('anagram', 'nagaram')", True)
check("is_anagram('rat', 'car')", False)
check("is_anagram('a', 'ab')", False)
check("is_anagram('', '')", True)
check("sorted(sorted(g) for g in group_anagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']))", [['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']])
check("sorted(sorted(g) for g in group_anagrams(['x']))", [['x']])
`,
dupes: `
check("has_duplicate([1, 2, 3, 1])", True)
check("has_duplicate([1, 2, 3, 4])", False)
check("has_duplicate([])", False)
check("sorted(find_duplicates([4, 3, 2, 7, 8, 2, 3, 1]))", [2, 3])
check("sorted(find_duplicates([1, 2, 3]))", [])
check("sorted(find_duplicates([5, 5, 5]))", [5])
`,
stocks: `
check("max_profit([7, 1, 5, 3, 6, 4])", 5)
check("max_profit([7, 6, 4, 3, 1])", 0)
check("max_profit([2, 4, 1])", 2)
check("max_profit([1])", 0)
check("max_profit([3, 8, 1, 9])", 8)
`,
parens: `
check("is_valid('()')", True)
check("is_valid('()[]{}')", True)
check("is_valid('(]')", False)
check("is_valid('([)]')", False)
check("is_valid('{[]}')", True)
check("is_valid('')", True)
check("is_valid('((')", False)
check("is_valid('))')", False)
`,
transpose: `
check("[list(r) for r in transpose([[1, 2, 3], [4, 5, 6]])]", [[1, 4], [2, 5], [3, 6]])
check("[list(r) for r in transpose([[1, 2], [3, 4]])]", [[1, 3], [2, 4]])
check("[list(r) for r in transpose([[1]])]", [[1]])
check("[list(r) for r in transpose([[1, 2, 3]])]", [[1], [2], [3]])
check("[list(r) for r in transpose([[1], [2], [3]])]", [[1, 2, 3]])
`,
plusone: `
check("plus_one([1, 2, 3])", [1, 2, 4])
check("plus_one([1, 9, 9])", [2, 0, 0])
check("plus_one([9, 9])", [1, 0, 0])
check("plus_one([0])", [1])
check("plus_one([9])", [1, 0])
check("plus_one([4, 3, 2, 1])", [4, 3, 2, 2])
`,
rmdup: `
def _t_front(nums):
    k = remove_duplicates(nums)
    return nums[:k]
check("remove_duplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]) -> first k entries", lambda: _t_front([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]), [0, 1, 2, 3, 4])
check("remove_duplicates([1, 1, 2]) -> first k entries", lambda: _t_front([1, 1, 2]), [1, 2])
check("remove_duplicates([1, 2, 3]) -> first k entries", lambda: _t_front([1, 2, 3]), [1, 2, 3])
check("remove_duplicates([5, 5, 5, 5]) -> first k entries", lambda: _t_front([5, 5, 5, 5]), [5])
check("remove_duplicates([1, 1, 2, 2]) returns k", lambda: remove_duplicates([1, 1, 2, 2]), 2)
check("remove_duplicates([])", lambda: remove_duplicates([]), 0)
`,
xor: `
check("single_number([4, 1, 2, 1, 2])", 4)
check("single_number([2, 2, 1])", 1)
check("single_number([1])", 1)
check("single_number([7, 3, 5, 3, 7])", 5)
check("single_number([0, 9, 0])", 9)
`,
squares: `
check("sorted_squares([-4, -1, 0, 3, 10])", [0, 1, 9, 16, 100])
check("sorted_squares([-7, -3, 2, 3, 11])", [4, 9, 9, 49, 121])
check("sorted_squares([1, 2, 3])", [1, 4, 9])
check("sorted_squares([-3, -2, -1])", [1, 4, 9])
check("sorted_squares([])", [])
check("sorted_squares([-5])", [25])
`,
majority: `
check("majority_element([3, 2, 3])", 3)
check("majority_element([2, 2, 1, 1, 1, 2, 2])", 2)
check("majority_element([1])", 1)
check("majority_element([6, 5, 5])", 5)
check("majority_element([9, 9, 4, 9, 4, 9, 4])", 9)
`,
firstuniq: `
check("first_unique_char('halden')", 0)
check("first_unique_char('aabbcdd')", 4)
check("first_unique_char('aabb')", -1)
check("first_unique_char('z')", 0)
check("first_unique_char('swiss')", 1)
check("first_unique_char('')", -1)
`,

// ─── Arc II — Casing the bank ──────────────────────────────────────────────────
halden: `
class _t_Rack(list):
    # A rack that counts how many keys you read. Iterating, slicing, index() and 'in' all count.
    reads = 0
    def __getitem__(self, i):
        _t_Rack.reads += len(range(*i.indices(len(self)))) if isinstance(i, slice) else 1
        return list.__getitem__(self, i)
    def __iter__(self):
        for i in range(len(self)):
            yield self[i]
    def __contains__(self, x):
        _t_Rack.reads += len(self)
        return list.__contains__(self, x)
    def index(self, *a):
        _t_Rack.reads += len(self)
        return list.index(self, *a)
_t_rack = _t_Rack(range(1, 2_000_001, 2))   # one million sorted odd keys
def _t_big():
    _t_Rack.reads = 0
    idx = find_key(_t_rack, 1_468_439)
    return idx, _t_Rack.reads <= 22
check("find_key([1, 3, 5, 7, 9, 11], 7)", 3)
check("find_key([1, 3, 5, 7, 9, 11], 1)", 0)
check("find_key([1, 3, 5, 7, 9, 11], 11)", 5)
check("find_key([4], 4)", 0)
check("find_key on a million-key rack -> (index, used at most 22 reads)", _t_big, (734_219, True))
`,
rotate: `
check("rotate([1, 2, 3, 4, 5, 6, 7], 3)", lambda: inplace(rotate, [1, 2, 3, 4, 5, 6, 7], 3), [5, 6, 7, 1, 2, 3, 4])
check("rotate([-1, -100, 3, 99], 2)", lambda: inplace(rotate, [-1, -100, 3, 99], 2), [3, 99, -1, -100])
check("rotate([1, 2, 3], 0)", lambda: inplace(rotate, [1, 2, 3], 0), [1, 2, 3])
check("rotate([1, 2, 3], 1)", lambda: inplace(rotate, [1, 2, 3], 1), [3, 1, 2])
check("rotate([1, 2, 3], 3)", lambda: inplace(rotate, [1, 2, 3], 3), [1, 2, 3])
check("rotate([1], 0)", lambda: inplace(rotate, [1], 0), [1])
`,
merge: `
check("merge([1, 3, 5], [2, 4, 6])", [1, 2, 3, 4, 5, 6])
check("merge([], [1, 2])", [1, 2])
check("merge([1, 1], [1])", [1, 1, 1])
check("merge([5], [1, 2, 3])", [1, 2, 3, 5])
check("merge([], [])", [])
check("merge([1, 4, 9], [2, 3, 10, 11])", [1, 2, 3, 4, 9, 10, 11])
`,
firstbad: `
def _t_run(n, first, limit):
    calls = [0]
    def is_bad(v):
        calls[0] += 1
        return v >= first
    v = first_bad_version(n, is_bad)
    return v, calls[0] <= limit
check("first_bad_version(5000, is_bad) with first bad 1702 -> (version, at most 22 checks)", lambda: _t_run(5000, 1702, 22), (1702, True))
check("first_bad_version(1, is_bad), the only version is bad", lambda: _t_run(1, 1, 3), (1, True))
check("first_bad_version(10, is_bad), only the last version is bad", lambda: _t_run(10, 10, 8), (10, True))
check("first_bad_version(10, is_bad), every version is bad", lambda: _t_run(10, 1, 8), (1, True))
check("first_bad_version(1_000_000_000, is_bad) first bad 987_654_321 -> at most 34 checks", lambda: _t_run(1_000_000_000, 987_654_321, 34), (987_654_321, True))
`,
window: `
check("longest_unique_substring('abcabcbb')", 3)
check("longest_unique_substring('bbbbb')", 1)
check("longest_unique_substring('pwwkew')", 3)
check("longest_unique_substring('')", 0)
check("longest_unique_substring('abcdef')", 6)
check("longest_unique_substring('dvdf')", 3)
check("longest_unique_substring('X.X..XX.')", 2)
`,
prefix: `
_t_rs = RangeSum([3, -1, 4, 1, 5, 9, 2])
check("RangeSum([3, -1, 4, 1, 5, 9, 2]).sum_range(0, 6)", lambda: _t_rs.sum_range(0, 6), 23)
check("RangeSum([3, -1, 4, 1, 5, 9, 2]).sum_range(2, 4)", lambda: _t_rs.sum_range(2, 4), 10)
check("RangeSum([3, -1, 4, 1, 5, 9, 2]).sum_range(3, 3)", lambda: _t_rs.sum_range(3, 3), 1)
check("RangeSum([3, -1, 4, 1, 5, 9, 2]).sum_range(0, 0)", lambda: _t_rs.sum_range(0, 0), 3)
check("RangeSum([3, -1, 4, 1, 5, 9, 2]).sum_range(5, 6)", lambda: _t_rs.sum_range(5, 6), 11)
check("RangeSum([5]).sum_range(0, 0)", lambda: RangeSum([5]).sum_range(0, 0), 5)
`,
minsub: `
check("min_subarray_len(7, [2, 3, 1, 2, 4, 3])", 2)
check("min_subarray_len(4, [1, 4, 4])", 1)
check("min_subarray_len(11, [1, 1, 1, 1])", 0)
check("min_subarray_len(15, [1, 2, 3, 4, 5])", 5)
check("min_subarray_len(6, [10, 2, 3])", 1)
check("min_subarray_len(5, [])", 0)
`,
kadane: `
check("max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4])", 6)
check("max_subarray([1])", 1)
check("max_subarray([5, 4, -1, 7, 8])", 23)
check("max_subarray([-3, -1, -2])", -1)
check("max_subarray([2, -1, 2, -1, 2])", 4)
`,
product: `
check("product_except_self([1, 2, 3, 4])", [24, 12, 8, 6])
check("product_except_self([2, 0, 3])", [0, 6, 0])
check("product_except_self([0, 0])", [0, 0])
check("product_except_self([-1, 1, 0, -3, 3])", [0, 0, 9, 0, 0])
check("product_except_self([5, 2])", [2, 5])
`,
twoptr: `
check("pair_with_diff([1, 3, 6, 10, 15], 4)", [6, 10])
check("pair_with_diff([1, 2, 3, 4], 3)", [1, 4])
check("pair_with_diff([1, 5, 9], 3)", None)
check("pair_with_diff([2, 7, 11, 15], 8)", [7, 15])
check("sorted(sorted(t) for t in three_sum([-1, 0, 1, 2, -1, -4]))", [[-1, -1, 2], [-1, 0, 1]])
check("three_sum([0, 1, 1])", [])
check("sorted(sorted(t) for t in three_sum([0, 0, 0, 0]))", [[0, 0, 0]])
check("sorted(sorted(t) for t in three_sum([-2, 0, 1, 1, 2]))", [[-2, 0, 2], [-2, 1, 1]])
`,
linked: `
if 'ListNode' not in globals():
    class ListNode:
        def __init__(self, val, next=None):
            self.val, self.next = val, next
def _t_make(xs):
    head = None
    for x in reversed(xs):
        head = ListNode(x, head)
    return head
def _t_vals(node, limit=50):
    out = []
    while node is not None and len(out) < limit:
        out.append(node.val)
        node = node.next
    return out
def _t_cycle():
    a = _t_make([3, 2, 0, -4])
    a.next.next.next.next = a.next
    return a
def _t_self_loop():
    n = ListNode(1)
    n.next = n
    return n
check("reverse_list(1 -> 2 -> 3 -> 4 -> 5)", lambda: _t_vals(reverse_list(_t_make([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1])
check("reverse_list(1 -> 2)", lambda: _t_vals(reverse_list(_t_make([1, 2]))), [2, 1])
check("reverse_list(7)", lambda: _t_vals(reverse_list(_t_make([7]))), [7])
check("reverse_list(None)", lambda: reverse_list(None), None)
check("has_cycle(3 -> 2 -> 0 -> -4 -> back to 2)", lambda: has_cycle(_t_cycle()), True)
check("has_cycle(1 -> 2 -> 3)", lambda: has_cycle(_t_make([1, 2, 3])), False)
check("has_cycle(node pointing to itself)", lambda: has_cycle(_t_self_loop()), True)
check("has_cycle(None)", lambda: has_cycle(None), False)
`,
rotsearch: `
check("search_rotated([4, 5, 6, 7, 0, 1, 2], 0)", 4)
check("search_rotated([4, 5, 6, 7, 0, 1, 2], 3)", -1)
check("search_rotated([4, 5, 6, 7, 0, 1, 2], 4)", 0)
check("search_rotated([1], 0)", -1)
check("search_rotated([1], 1)", 0)
check("search_rotated([3, 1], 1)", 1)
check("search_rotated([5, 1, 2, 3, 4], 5)", 0)
check("search_rotated([1, 2, 3, 4, 5], 4)", 3)
`,
mergell: `
if 'ListNode' not in globals():
    class ListNode:
        def __init__(self, val, next=None):
            self.val, self.next = val, next
def _t_make(xs):
    head = None
    for x in reversed(xs):
        head = ListNode(x, head)
    return head
def _t_vals(node, limit=50):
    out = []
    while node is not None and len(out) < limit:
        out.append(node.val)
        node = node.next
    return out
check("merge_lists(1 -> 2 -> 4, 1 -> 3 -> 4)", lambda: _t_vals(merge_lists(_t_make([1, 2, 4]), _t_make([1, 3, 4]))), [1, 1, 2, 3, 4, 4])
check("merge_lists(None, None)", lambda: _t_vals(merge_lists(None, None)), [])
check("merge_lists(None, 0)", lambda: _t_vals(merge_lists(None, _t_make([0]))), [0])
check("merge_lists(2, 1)", lambda: _t_vals(merge_lists(_t_make([2]), _t_make([1]))), [1, 2])
check("merge_lists(1 -> 5 -> 9, 2 -> 3)", lambda: _t_vals(merge_lists(_t_make([1, 5, 9]), _t_make([2, 3]))), [1, 2, 3, 5, 9])
`,
tree: `
if 'TreeNode' not in globals():
    class TreeNode:
        def __init__(self, val, left=None, right=None):
            self.val, self.left, self.right = val, left, right
def _t_build(vals):
    # level-order list, None for a missing child (missing children have no entries of their own)
    if not vals or vals[0] is None:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in vals]
    kids = iter(nodes[1:])
    for node in nodes:
        if node is not None:
            node.left = next(kids, None)
            node.right = next(kids, None)
    return nodes[0]
_t_a = _t_build([3, 9, 20, None, None, 15, 7])
_t_b = _t_build([1, None, 2, 3])
check("preorder of [3, 9, 20, None, None, 15, 7]", lambda: list(preorder(_t_a)), [3, 9, 20, 15, 7])
check("inorder of [3, 9, 20, None, None, 15, 7]", lambda: list(inorder(_t_a)), [9, 3, 15, 20, 7])
check("postorder of [3, 9, 20, None, None, 15, 7]", lambda: list(postorder(_t_a)), [9, 15, 7, 20, 3])
check("max_depth of [3, 9, 20, None, None, 15, 7]", lambda: max_depth(_t_a), 3)
check("level_order of [3, 9, 20, None, None, 15, 7]", lambda: [list(l) for l in level_order(_t_a)], [[3], [9, 20], [15, 7]])
check("preorder of [1, None, 2, 3]", lambda: list(preorder(_t_b)), [1, 2, 3])
check("inorder of [1, None, 2, 3]", lambda: list(inorder(_t_b)), [1, 3, 2])
check("max_depth of [1, None, 2, 3]", lambda: max_depth(_t_b), 3)
check("max_depth(None)", lambda: max_depth(None), 0)
check("level_order(None)", lambda: list(level_order(None)), [])
`,
bst: `
if 'TreeNode' not in globals():
    class TreeNode:
        def __init__(self, val, left=None, right=None):
            self.val, self.left, self.right = val, left, right
def _t_inorder(n):
    return [] if n is None else _t_inorder(n.left) + [n.val] + _t_inorder(n.right)
def _t_bst(vals):
    root = None
    for v in vals:
        root = insert(root, v)
    return root
_t_root = _t_bst([8, 3, 10, 1, 6, 14, 4, 7, 13])
_t_bad1 = TreeNode(5, TreeNode(1), TreeNode(4, TreeNode(3), TreeNode(6)))
_t_bad2 = TreeNode(5, TreeNode(4), TreeNode(6, TreeNode(3), TreeNode(7)))
check("insert(None, 5).val", lambda: insert(None, 5).val, 5)
check("inorder after inserting [8, 3, 10, 1, 6, 14, 4, 7, 13]", lambda: _t_inorder(_t_root), [1, 3, 4, 6, 7, 8, 10, 13, 14])
check("root stays 8", lambda: _t_root.val, 8)
check("search(root, 6)", lambda: search(_t_root, 6), True)
check("search(root, 5)", lambda: search(_t_root, 5), False)
check("search(None, 1)", lambda: search(None, 1), False)
check("is_valid_bst(root)", lambda: is_valid_bst(_t_root), True)
check("is_valid_bst(5 with left 1, right 4)", lambda: is_valid_bst(_t_bad1), False)
check("is_valid_bst(5 with a 3 hidden deep in the right subtree)", lambda: is_valid_bst(_t_bad2), False)
check("is_valid_bst(None)", lambda: is_valid_bst(None), True)
check("kth_smallest(root, 1)", lambda: kth_smallest(_t_root, 1), 1)
check("kth_smallest(root, 4)", lambda: kth_smallest(_t_root, 4), 6)
check("kth_smallest(root, 9)", lambda: kth_smallest(_t_root, 9), 14)
`,
lca: `
if 'TreeNode' not in globals():
    class TreeNode:
        def __init__(self, val, left=None, right=None):
            self.val, self.left, self.right = val, left, right
def _t_build(vals):
    if not vals or vals[0] is None:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in vals]
    kids = iter(nodes[1:])
    for node in nodes:
        if node is not None:
            node.left = next(kids, None)
            node.right = next(kids, None)
    return nodes[0]
def _t_find(root, v):
    if root is None:
        return None
    if root.val == v:
        return root
    return _t_find(root.left, v) or _t_find(root.right, v)
_t_t = _t_build([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
_t_s = _t_build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])
def _t_lca(root, a, b):
    return lowest_common_ancestor(root, _t_find(root, a), _t_find(root, b)).val
def _t_lca_bst(root, a, b):
    return lca_bst(root, _t_find(root, a), _t_find(root, b)).val
check("lowest_common_ancestor(tree, 5, 1)", lambda: _t_lca(_t_t, 5, 1), 3)
check("lowest_common_ancestor(tree, 5, 4)", lambda: _t_lca(_t_t, 5, 4), 5)
check("lowest_common_ancestor(tree, 6, 7)", lambda: _t_lca(_t_t, 6, 7), 5)
check("lowest_common_ancestor(tree, 7, 8)", lambda: _t_lca(_t_t, 7, 8), 3)
check("lowest_common_ancestor(tree, 4, 4)", lambda: _t_lca(_t_t, 4, 4), 4)
check("lca_bst(bst, 2, 8)", lambda: _t_lca_bst(_t_s, 2, 8), 6)
check("lca_bst(bst, 2, 4)", lambda: _t_lca_bst(_t_s, 2, 4), 2)
check("lca_bst(bst, 3, 5)", lambda: _t_lca_bst(_t_s, 3, 5), 4)
check("lca_bst(bst, 0, 5)", lambda: _t_lca_bst(_t_s, 0, 5), 2)
`,

// ─── Arc III — The job ─────────────────────────────────────────────────────────
sewers: `
_t_g = [
    [0, 0, 1, 0],
    [1, 0, 1, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 0],
]
check("shortest_path(grid, (0, 0), (0, 3))", lambda: shortest_path(_t_g, (0, 0), (0, 3)), 7)
check("shortest_path(grid, (0, 0), (3, 3))", lambda: shortest_path(_t_g, (0, 0), (3, 3)), 6)
check("shortest_path(grid, (0, 0), (0, 0))", lambda: shortest_path(_t_g, (0, 0), (0, 0)), 0)
check("shortest_path([[0, 1], [1, 0]], (0, 0), (1, 1)) is cut off", lambda: shortest_path([[0, 1], [1, 0]], (0, 0), (1, 1)), -1)
check("shortest_path([[0, 0, 0]], (0, 0), (0, 2))", lambda: shortest_path([[0, 0, 0]], (0, 0), (0, 2)), 2)
check("shortest_path(grid, (2, 0), (0, 3))", lambda: shortest_path(_t_g, (2, 0), (0, 3)), 5)
`,
islands: `
_t_g = [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 1],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1],
]
check("count_regions(grid)", lambda: count_regions(_t_g), 5)
check("largest_region(grid)", lambda: largest_region(_t_g), 4)
check("count_regions([[0]])", lambda: count_regions([[0]]), 0)
check("largest_region([[0, 0]])", lambda: largest_region([[0, 0]]), 0)
check("count_regions([[1]])", lambda: count_regions([[1]]), 1)
check("count_regions(3x3 of air)", lambda: count_regions([[1] * 3 for _ in range(3)]), 1)
check("largest_region(3x3 of air)", lambda: largest_region([[1] * 3 for _ in range(3)]), 9)
check("count_regions(diagonal cells do not touch)", lambda: count_regions([[1, 0], [0, 1]]), 2)
`,
oranges: `
check("minutes_to_fill([[2, 1, 1], [1, 1, 0], [0, 1, 1]])", 4)
check("minutes_to_fill([[2, 1, 1], [0, 1, 1], [1, 0, 1]])", -1)
check("minutes_to_fill([[0, 2]])", 0)
check("minutes_to_fill([[2, 1, 1], [1, 1, 1], [0, 1, 2]]) two sources", lambda: minutes_to_fill([[2, 1, 1], [1, 1, 1], [0, 1, 2]]), 2)
check("minutes_to_fill([[1]]) no source", lambda: minutes_to_fill([[1]]), -1)
check("minutes_to_fill([[0]])", 0)
check("minutes_to_fill([[2, 0, 1]]) walled off", lambda: minutes_to_fill([[2, 0, 1]]), -1)
`,
clone: `
if 'Node' not in globals():
    class Node:
        def __init__(self, val, neighbors=None):
            self.val = val
            self.neighbors = neighbors if neighbors is not None else []
def _t_graph(adj):
    nodes = {v: Node(v) for v in adj}
    for v, ns in adj.items():
        nodes[v].neighbors = [nodes[u] for u in ns]
    return nodes
def _t_reach(start):
    seen, q = {id(start): start}, [start]
    while q:
        n = q.pop()
        for m in n.neighbors:
            if id(m) not in seen:
                seen[id(m)] = m
                q.append(m)
    return list(seen.values())
def _t_shape(start):
    return sorted((n.val, sorted(m.val for m in n.neighbors)) for n in _t_reach(start))
_t_adj = {1: [2, 4], 2: [1, 3], 3: [2, 4], 4: [1, 3]}
_t_orig = _t_graph(_t_adj)
_t_copy = clone_graph(_t_orig[1])
check("clone_graph(square 1-2-3-4) has the same shape", lambda: _t_shape(_t_copy), [(1, [2, 4]), (2, [1, 3]), (3, [2, 4]), (4, [1, 3])])
check("the copy contains no original node", lambda: any(id(n) in {id(o) for o in _t_orig.values()} for n in _t_reach(_t_copy)), False)
check("each node copied exactly once", lambda: len(_t_reach(_t_copy)), 4)
check("original left intact", lambda: _t_shape(_t_orig[1]), [(1, [2, 4]), (2, [1, 3]), (3, [2, 4]), (4, [1, 3])])
check("clone_graph(single node) -> (val, neighbours, is a new object)", lambda: (lambda o, c: (c.val, list(c.neighbors), c is not o))(Node(1), clone_graph(Node(1))), (1, [], True))
check("clone_graph(None)", lambda: clone_graph(None), None)
`,
topo: `
def _t_valid(n, edges):
    order = list(task_order(n, edges))
    pos = {t: i for i, t in enumerate(order)}
    return sorted(order) == list(range(n)) and all(pos[a] < pos[b] for a, b in edges)
check("task_order(4, [(0, 1), (1, 2), (0, 3), (3, 2)]) is a valid order", lambda: _t_valid(4, [(0, 1), (1, 2), (0, 3), (3, 2)]), True)
check("task_order(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]) is a valid order", lambda: _t_valid(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]), True)
check("task_order(3, []) lists every task", lambda: sorted(task_order(3, [])), [0, 1, 2])
check("task_order(1, [])", lambda: list(task_order(1, [])), [0])
check("task_order(2, [(0, 1), (1, 0)]) contradiction", lambda: list(task_order(2, [(0, 1), (1, 0)])), [])
check("task_order(4, [(0, 1), (1, 2), (2, 1), (2, 3)]) hidden cycle", lambda: list(task_order(4, [(0, 1), (1, 2), (2, 1), (2, 3)])), [])
`,
timetable: `
def _t_m(iv):
    return [list(i) for i in merge_intervals(iv)]
check("merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]])", lambda: _t_m([[1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 10], [15, 18]])
check("merge_intervals([[1, 4], [4, 5]]) touching shifts merge", lambda: _t_m([[1, 4], [4, 5]]), [[1, 5]])
check("merge_intervals([[5, 7], [1, 3]]) sorted by start", lambda: _t_m([[5, 7], [1, 3]]), [[1, 3], [5, 7]])
check("merge_intervals([[1, 10], [2, 3], [4, 5]])", lambda: _t_m([[1, 10], [2, 3], [4, 5]]), [[1, 10]])
check("merge_intervals([])", lambda: _t_m([]), [])
check("largest_gap([[1, 3], [2, 6], [8, 10], [15, 18]])", 5)
check("largest_gap([[1, 4], [4, 5]])", 0)
check("largest_gap([[0, 2]])", 0)
check("largest_gap([[5, 7], [1, 3]])", 2)
check("largest_gap([[22, 23], [0, 1], [10, 12]])", 10)
`,
letters: `
check("sorted(letter_combinations('23'))", ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'])
check("letter_combinations('')", [])
check("sorted(letter_combinations('2'))", ['a', 'b', 'c'])
check("len(letter_combinations('79'))", 16)
check("len(letter_combinations('234'))", 27)
check("sorted(letter_combinations('9'))", ['w', 'x', 'y', 'z'])
`,
heap: `
def _t_stream(k, xs):
    t = TopK(k)
    out = []
    for x in xs:
        t.add(x)
        out.append(list(t.top()))
    return out
check("k_largest([3, 1, 5, 12, 2, 11], 3)", [12, 11, 5])
check("k_largest([1, 1, 1], 2)", [1, 1])
check("k_largest([4], 1)", [4])
check("k_largest([5, 3, 9, 1], 4)", [9, 5, 3, 1])
check("k_largest(list(range(1000)), 3)", [999, 998, 997])
check("TopK(2): top() after each of add(5), add(1), add(9), add(3), add(7)", lambda: _t_stream(2, [5, 1, 9, 3, 7]), [[5], [5, 1], [9, 5], [9, 5], [9, 7]])
check("TopK(3): top() after adding 4, 4, 4, 4", lambda: _t_stream(3, [4, 4, 4, 4])[-1], [4, 4, 4])
`,
counting: `
check("counting_sort([4, 2, 2, 8, 3, 3, 1], 8)", [1, 2, 2, 3, 3, 4, 8])
check("counting_sort([], 5)", [])
check("counting_sort([0, 0, 0], 0)", [0, 0, 0])
check("counting_sort([9, 0, 9, 0], 9)", [0, 0, 9, 9])
check("counting_sort([3, 7, 3, 7, 1], 7)", [1, 3, 3, 7, 7])
check("bucket_sort([0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51])", [0.23, 0.25, 0.32, 0.42, 0.47, 0.51, 0.52])
check("bucket_sort([])", [])
check("bucket_sort([0.5])", [0.5])
check("bucket_sort([0.9, 0.1, 0.1, 0.0])", [0.0, 0.1, 0.1, 0.9])
`,
meetings: `
check("max_concurrent([[0, 30], [5, 10], [15, 20]])", 2)
check("max_concurrent([[7, 10], [2, 4]])", 1)
check("max_concurrent([])", 0)
check("max_concurrent([[1, 5], [2, 6], [3, 7], [4, 8]])", 4)
check("max_concurrent([[1, 3], [3, 5], [5, 7]]) touching shifts do not overlap", lambda: max_concurrent([[1, 3], [3, 5], [5, 7]]), 1)
check("max_concurrent([[1, 10], [2, 3], [4, 5], [6, 7]])", 2)
check("max_concurrent([[6, 7], [2, 4], [8, 12]])", 1)
`,
sorts: `
def sorted(*args, **kwargs):
    raise RuntimeError("sorted() is not available tonight; the jury is watching")
import random as _t_random
_t_xs = list(range(300))
_t_random.shuffle(_t_xs)
check("merge_sort([5, 2, 4, 6, 1, 3])", [1, 2, 3, 4, 5, 6])
check("merge_sort([])", [])
check("merge_sort([1])", [1])
check("merge_sort([3, 3, 1, 2, 2])", [1, 2, 2, 3, 3])
check("merge_sort(shuffled 0..299)", lambda: merge_sort(list(_t_xs)), list(range(300)))
check("quick_sort([5, 2, 4, 6, 1, 3])", [1, 2, 3, 4, 5, 6])
check("quick_sort([])", [])
check("quick_sort([1])", [1])
check("quick_sort([3, 3, 1, 2, 2])", [1, 2, 2, 3, 3])
check("quick_sort(shuffled 0..299)", lambda: quick_sort(list(_t_xs)), list(range(300)))
check("quick_sort(already sorted 0..299)", lambda: quick_sort(list(range(300))), list(range(300)))
`,
quickselect: `
import random as _t_random
_t_xs = list(range(500))
_t_random.shuffle(_t_xs)
check("kth_largest([3, 2, 1, 5, 6, 4], 2)", 5)
check("kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)", 4)
check("kth_largest([1], 1)", 1)
check("kth_largest([7, 7, 7], 2)", 7)
check("kth_largest([2, 1], 1)", 2)
check("kth_largest([2, 1], 2)", 1)
check("kth_largest(shuffled 0..499, 17)", lambda: kth_largest(list(_t_xs), 17), 483)
check("kth_largest(shuffled 0..499, 500)", lambda: kth_largest(list(_t_xs), 500), 0)
`,
perms: `
check("sorted(list(p) for p in permutations([1, 2, 3]))", [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]])
check("len(permutations([1, 2, 3, 4]))", 24)
check("[list(p) for p in permutations([7])]", [[7]])
check("sorted(list(p) for p in permutations(['a', 'b']))", [['a', 'b'], ['b', 'a']])
check("sorted(sorted(s) for s in subsets([1, 2, 3]))", [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]])
check("len(subsets([1, 2, 3, 4]))", 16)
check("[list(s) for s in subsets([])]", [[]])
check("sorted(sorted(s) for s in subsets([5]))", [[], [5]])
`,
safe: `
from itertools import permutations as _t_perm
_t_primes = {2, 3, 5, 7, 11, 13, 17}
_t_expected = sorted("".join(p) for p in _t_perm("0123456789", 6) if all(int(p[i]) + int(p[i + 1]) in _t_primes for i in range(5)))
check("len(safe_codes())", len(_t_expected))
check("every safe code is valid and none is missing", lambda: sorted(safe_codes()) == _t_expected, True)
check("safe_codes() has no repeats", lambda: len(set(safe_codes())) == len(list(safe_codes())), True)
check("n_queens(1)", 1)
check("n_queens(4)", 2)
check("n_queens(5)", 10)
check("n_queens(6)", 4)
check("n_queens(8)", 92)
`,
task: `
check("least_interval(['A', 'A', 'A', 'B', 'B', 'B'], 2)", 8)
check("least_interval(['A', 'A', 'A', 'B', 'B', 'B'], 0)", 6)
check("least_interval(['A', 'A', 'A', 'B', 'B', 'B'], 50)", 104)
check("least_interval(['A', 'C', 'A', 'B', 'D', 'B'], 1)", 6)
check("least_interval(['A'], 3)", 1)
check("least_interval(['A', 'A'], 3)", 5)
check("least_interval(['A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2)", 10)
`,
wordsearch: `
_t_board = [
    ["A", "B", "C", "E"],
    ["S", "F", "C", "S"],
    ["A", "D", "E", "E"],
]
check("exist(board, 'ABCCED')", lambda: exist(_t_board, "ABCCED"), True)
check("exist(board, 'SEE')", lambda: exist(_t_board, "SEE"), True)
check("exist(board, 'ABCB') would reuse a cell", lambda: exist(_t_board, "ABCB"), False)
check("exist([['a']], 'a')", lambda: exist([["a"]], "a"), True)
check("exist([['a', 'b'], ['c', 'd']], 'abdc')", lambda: exist([["a", "b"], ["c", "d"]], "abdc"), True)
check("exist([['a', 'a']], 'aaa')", lambda: exist([["a", "a"]], "aaa"), False)
check("exist([['a', 'b'], ['c', 'd']], 'ad') diagonals do not touch", lambda: exist([["a", "b"], ["c", "d"]], "ad"), False)
`,

// ─── Arc IV — The escape ───────────────────────────────────────────────────────
bipartite: `
check("is_bipartite([[1, 3], [0, 2], [1, 3], [0, 2]])", True)
check("is_bipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]) triangle", lambda: is_bipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]), False)
check("is_bipartite([[], [], []]) no edges", lambda: is_bipartite([[], [], []]), True)
check("is_bipartite([[1], [0], [3], [2]]) two components", lambda: is_bipartite([[1], [0], [3], [2]]), True)
check("is_bipartite([[1], [0], [3, 4], [2, 4], [2, 3]]) odd cycle in second component", lambda: is_bipartite([[1], [0], [3, 4], [2, 4], [2, 3]]), False)
check("is_bipartite([[1, 2], [0, 3], [0, 3], [1, 2]]) square", lambda: is_bipartite([[1, 2], [0, 3], [0, 3], [1, 2]]), True)
check("is_bipartite([[1], [0, 2], [1, 3], [2, 4], [3]]) path", lambda: is_bipartite([[1], [0, 2], [1, 3], [2, 4], [3]]), True)
`,
routes: `
_t_e = [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3), (4, 5, 2)]
check("cheapest_route(6, edges, 0, [4])", lambda: cheapest_route(6, _t_e, 0, [4]), 7)
check("cheapest_route(6, edges, 0, [4, 5])", lambda: cheapest_route(6, _t_e, 0, [4, 5]), 7)
check("cheapest_route(6, edges, 0, [5, 3, 2]) nearest of three", lambda: cheapest_route(6, _t_e, 0, [5, 3, 2]), 1)
check("cheapest_route(6, edges, 0, [0]) already there", lambda: cheapest_route(6, _t_e, 0, [0]), 0)
check("cheapest_route(7, edges, 0, [6]) unreachable", lambda: cheapest_route(7, _t_e, 0, [6]), -1)
check("cheapest_route(6, edges, 5, [0]) undirected", lambda: cheapest_route(6, _t_e, 5, [0]), 9)
check("cheapest_route(3, [(0, 1, 10), (0, 2, 1), (2, 1, 1)], 0, [1]) direct road is not cheapest", lambda: cheapest_route(3, [(0, 1, 10), (0, 2, 1), (2, 1, 1)], 0, [1]), 2)
`,
union: `
_t_u = UnionFind(6)
check("union(0, 1) first time", lambda: _t_u.union(0, 1), True)
check("union(1, 2)", lambda: _t_u.union(1, 2), True)
check("union(0, 2) already joined", lambda: _t_u.union(0, 2), False)
check("connected(0, 2)", lambda: _t_u.connected(0, 2), True)
check("connected(0, 3)", lambda: _t_u.connected(0, 3), False)
check("find(0) == find(2)", lambda: _t_u.find(0) == _t_u.find(2), True)
check("find(3) == find(4)", lambda: _t_u.find(3) == _t_u.find(4), False)
check("count_networks(6, [(0, 1), (1, 2), (3, 4)])", 3)
check("count_networks(4, [])", 4)
check("count_networks(5, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 0)]) one ring", lambda: count_networks(5, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 0)]), 1)
check("count_networks(1, [])", 1)
`,
mst: `
_t_e = [(0, 1, 4), (0, 2, 3), (1, 2, 1), (1, 3, 2), (2, 3, 4), (3, 4, 2), (4, 5, 6)]
check("min_wiring_cost(6, edges)", lambda: min_wiring_cost(6, _t_e), 14)
check("min_wiring_cost(3, [(0, 1, 5)]) disconnected", lambda: min_wiring_cost(3, [(0, 1, 5)]), -1)
check("min_wiring_cost(1, [])", 0)
check("min_wiring_cost(2, [(0, 1, 7), (0, 1, 3)]) parallel lines", lambda: min_wiring_cost(2, [(0, 1, 7), (0, 1, 3)]), 3)
check("min_wiring_cost(4, [(0, 1, 1), (1, 2, 1), (2, 3, 1), (0, 3, 1), (0, 2, 10)])", 3)
check("min_wiring_cost(4, [(0, 1, 1), (1, 2, 2), (2, 0, 3), (2, 3, 4), (3, 1, 5)])", 7)
`,
bellman: `
check("bellman_ford(4, [(0, 1, 4), (0, 2, 5), (1, 2, -3), (2, 3, 4)], 0)", [0, 4, 1, 5])
check("bellman_ford(4, [(0, 1, 4), (0, 2, 5), (1, 2, -3), (2, 3, 4), (3, 1, -2)], 0) negative cycle", lambda: bellman_ford(4, [(0, 1, 4), (0, 2, 5), (1, 2, -3), (2, 3, 4), (3, 1, -2)], 0), None)
check("bellman_ford(3, [(1, 2, -1), (2, 1, -1)], 0) unreachable negative cycle is harmless", lambda: bellman_ford(3, [(1, 2, -1), (2, 1, -1)], 0), [0, float('inf'), float('inf')])
check("bellman_ford(1, [], 0)", [0])
check("bellman_ford(3, [(0, 1, 2), (1, 2, 2), (0, 2, 5)], 0)", [0, 2, 4])
check("bellman_ford(3, [(0, 1, 5), (1, 2, -5), (0, 2, 1)], 0) negative edge, no cycle", lambda: bellman_ford(3, [(0, 1, 5), (1, 2, -5), (0, 2, 1)], 0), [0, 5, 0])
check("bellman_ford(3, [(0, 1, 1), (1, 0, 1)], 2) source isolated", lambda: bellman_ford(3, [(0, 1, 1), (1, 0, 1)], 2), [float('inf'), float('inf'), 0])
`,
stairs: `
check("climb_stairs(0)", 1)
check("climb_stairs(1)", 1)
check("climb_stairs(2)", 2)
check("climb_stairs(3)", 3)
check("climb_stairs(10)", 89)
check("climb_stairs(100)", 573147844013817084101)
`,
robber: `
check("rob([1, 2, 3, 1])", 4)
check("rob([2, 7, 9, 3, 1])", 12)
check("rob([])", 0)
check("rob([5])", 5)
check("rob([2, 1])", 2)
check("rob([2, 1, 1, 2])", 4)
check("rob([6, 3, 10, 8, 2, 10, 3, 5, 10, 5, 3])", 39)
`,
jump: `
check("can_jump([2, 3, 1, 1, 4])", True)
check("can_jump([3, 2, 1, 0, 4])", False)
check("can_jump([0])", True)
check("can_jump([0, 1])", False)
check("can_jump([1, 0])", True)
check("can_jump([2, 0, 0])", True)
check("can_jump([1, 1, 0, 1])", False)
check("can_jump([5, 0, 0, 0, 0, 0])", True)
`,
paths: `
check("unique_paths(3, 7)", 28)
check("unique_paths(3, 2)", 3)
check("unique_paths(1, 1)", 1)
check("unique_paths(1, 9)", 1)
check("unique_paths(10, 10)", 48620)
check("unique_paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])", 2)
check("unique_paths_with_obstacles([[0, 1], [0, 0]])", 1)
check("unique_paths_with_obstacles([[0, 0], [0, 0]])", 2)
check("unique_paths_with_obstacles([[1]]) start blocked", lambda: unique_paths_with_obstacles([[1]]), 0)
check("unique_paths_with_obstacles([[0, 0], [1, 1], [0, 0]]) wall", lambda: unique_paths_with_obstacles([[0, 0], [1, 1], [0, 0]]), 0)
`,
coins: `
check("coin_change([1, 2, 5], 11)", 3)
check("coin_change([2], 3)", -1)
check("coin_change([1], 0)", 0)
check("coin_change([1], 2)", 2)
check("coin_change([1, 3, 4], 6) greedy would say 3", lambda: coin_change([1, 3, 4], 6), 2)
check("coin_change([186, 419, 83, 408], 6249)", 20)
check("coin_change([5, 10], 3)", -1)
`,
minpath: `
check("min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])", 7)
check("min_path_sum([[1, 2, 3], [4, 5, 6]])", 12)
check("min_path_sum([[5]])", 5)
check("min_path_sum([[1, 2], [1, 1]])", 3)
check("min_path_sum([[9, 1, 1], [9, 9, 1], [9, 9, 1]]) hug the top", lambda: min_path_sum([[9, 1, 1], [9, 9, 1], [9, 9, 1]]), 13)
check("min_path_sum([[1], [2], [3]]) single column", lambda: min_path_sum([[1], [2], [3]]), 6)
`,
decode: `
check("num_decodings('12')", 2)
check("num_decodings('226')", 3)
check("num_decodings('0')", 0)
check("num_decodings('06')", 0)
check("num_decodings('10')", 1)
check("num_decodings('27')", 1)
check("num_decodings('100')", 0)
check("num_decodings('1')", 1)
check("num_decodings('11106')", 2)
check("num_decodings('111111111111111111111111111111111111111111111')", 1836311903)
`,
lis: `
check("longest_increasing([10, 9, 2, 5, 3, 7, 101, 18])", 4)
check("longest_increasing([0, 1, 0, 3, 2, 3])", 4)
check("longest_increasing([7, 7, 7, 7]) strictly increasing", lambda: longest_increasing([7, 7, 7, 7]), 1)
check("longest_increasing([])", 0)
check("longest_increasing([5])", 1)
check("longest_increasing([5, 4, 3, 2, 1])", 1)
check("longest_increasing([1, 2, 3, 4, 5])", 5)
check("longest_increasing([3, 1, 2])", 2)
check("longest_increasing(range(2000) + range(1000)) large", lambda: longest_increasing(list(range(2000)) + list(range(1000))), 2000)
`,
wordbreak: `
check("word_break('vaultdoor', ['vault', 'door'])", True)
check("word_break('cashvancash', ['cash', 'van'])", True)
check("word_break('guardsandog', ['guards', 'dog', 'sand', 'and', 'guard'])", False)
check("word_break('', ['a'])", True)
check("word_break('a', ['b'])", False)
check("word_break('applepenapple', ['apple', 'pen'])", True)
check("word_break('catsandog', ['cats', 'dog', 'sand', 'and', 'cat'])", False)
_t_long = 'a' * 90 + 'b'
check("word_break('a' * 90 + 'b', ['a', 'aa', 'aaa', 'aaaa', 'aaaaa']) must not blow up", lambda: word_break(_t_long, ['a', 'aa', 'aaa', 'aaaa', 'aaaaa']), False)
`,

}
