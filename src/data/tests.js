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

}
