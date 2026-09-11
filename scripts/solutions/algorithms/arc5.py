# Reference solutions for Arc V. One block per gate, introduced by "# === <id>".

# === knap
def knapsack(weights, values, capacity):
    best = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):
            if best[c - w] + v > best[c]:
                best[c] = best[c - w] + v
    return best[capacity]

# === rain
def trap(height):
    lo, hi = 0, len(height) - 1
    left_max = right_max = 0
    total = 0
    while lo < hi:
        if height[lo] < height[hi]:
            left_max = max(left_max, height[lo])
            total += left_max - height[lo]
            lo += 1
        else:
            right_max = max(right_max, height[hi])
            total += right_max - height[hi]
            hi -= 1
    return total

# === edit
def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j - 1], prev[j], cur[j - 1])
        prev = cur
    return prev[len(b)]

# === deque
from collections import deque

def max_sliding_window(nums, k):
    out = []
    dq = deque()
    for i, x in enumerate(nums):
        while dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] < x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out

# === lcs
def lcs(a, b):
    prev = [0] * (len(b) + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = max(prev[j], cur[j - 1])
        prev = cur
    return prev[len(b)]

# === lru
class _Node:
    __slots__ = ("key", "val", "prev", "next")

    def __init__(self, key=None, val=None):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = _Node(), _Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return -1
        self._unlink(node)
        self._push_front(node)
        return node.val

    def put(self, key, value):
        node = self.map.get(key)
        if node is not None:
            node.val = value
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.map) >= self.cap:
            lru = self.tail.prev
            self._unlink(lru)
            del self.map[lru.key]
        node = _Node(key, value)
        self.map[key] = node
        self._push_front(node)

# === trie
class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def _walk(self, prefix):
        node = self.root
        for ch in prefix:
            node = node.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def words_with_prefix(self, prefix):
        node = self._walk(prefix)
        out = []
        if node is None:
            return out

        def collect(n, acc):
            if "$" in n:
                out.append(acc)
            for ch in sorted(k for k in n if k != "$"):
                collect(n[ch], acc + ch)

        collect(node, prefix)
        return out

# === kmp
def find_all(text, pattern):
    if not pattern:
        return list(range(len(text) + 1))
    fail = [0] * len(pattern)
    k = 0
    for i in range(1, len(pattern)):
        while k and pattern[i] != pattern[k]:
            k = fail[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        fail[i] = k
    out = []
    k = 0
    for i, ch in enumerate(text):
        while k and ch != pattern[k]:
            k = fail[k - 1]
        if ch == pattern[k]:
            k += 1
        if k == len(pattern):
            out.append(i - k + 1)
            k = fail[k - 1]
    return out

# === palsub
def longest_palindrome(s):
    if not s:
        return ""
    best_lo, best_hi = 0, 0
    for centre in range(len(s)):
        for lo, hi in ((centre, centre), (centre, centre + 1)):
            while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
                lo -= 1
                hi += 1
            if hi - lo - 1 > best_hi - best_lo:
                best_lo, best_hi = lo + 1, hi
    return s[best_lo:best_hi]

# === ladder
from collections import deque as _dq

def ladder_length(begin, end, word_list):
    words = set(word_list)
    if end not in words:
        return 0
    buckets = {}
    for w in words | {begin}:
        for i in range(len(w)):
            buckets.setdefault(w[:i] + "*" + w[i + 1:], []).append(w)
    seen = {begin}
    q = _dq([(begin, 1)])
    while q:
        w, d = q.popleft()
        if w == end:
            return d
        for i in range(len(w)):
            for nxt in buckets.get(w[:i] + "*" + w[i + 1:], ()):
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, d + 1))
    return 0

# === alien
from collections import deque as _adq

def alien_order(words):
    letters = {ch for w in words for ch in w}
    after = {ch: set() for ch in letters}
    indeg = {ch: 0 for ch in letters}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in after[x]:
                    after[x].add(y)
                    indeg[y] += 1
                break
        else:
            if len(a) > len(b):
                return ""
    q = _adq(sorted(ch for ch in letters if indeg[ch] == 0))
    out = []
    while q:
        ch = q.popleft()
        out.append(ch)
        for nxt in sorted(after[ch]):
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return "".join(out) if len(out) == len(letters) else ""

# === median
def find_median_sorted_arrays(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    INF = float("inf")
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else -INF
        a_right = a[i] if i < m else INF
        b_left = b[j - 1] if j > 0 else -INF
        b_right = b[j] if j < n else INF
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2:
                return max(a_left, b_left)
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1
    raise ValueError("inputs not sorted")

# === regex
def is_match(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(2, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i][j - 2]
                if p[j - 2] == "." or p[j - 2] == s[i - 1]:
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
            elif p[j - 1] == "." or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]

# === balloons
def max_coins(nums):
    vals = [1] + list(nums) + [1]
    n = len(vals)
    best = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for lo in range(0, n - length):
            hi = lo + length
            for k in range(lo + 1, hi):
                score = best[lo][k] + vals[lo] * vals[k] * vals[hi] + best[k][hi]
                if score > best[lo][hi]:
                    best[lo][hi] = score
    return best[0][n - 1]

# === ledger
def subset_sum(values, target):
    n = len(values)
    can = [[False] * (target + 1) for _ in range(n + 1)]
    can[0][0] = True
    for i in range(1, n + 1):
        v = values[i - 1]
        for t in range(target + 1):
            can[i][t] = can[i - 1][t] or (t >= v and can[i - 1][t - v])
    if not can[n][target]:
        return None
    chosen = []
    t = target
    for i in range(n, 0, -1):
        if not can[i - 1][t]:
            chosen.append(i - 1)
            t -= values[i - 1]
    return chosen[::-1]

# === epilogue
def split_array(nums, k):
    def couriers_needed(limit):
        count, load = 1, 0
        for x in nums:
            if load + x > limit:
                count += 1
                load = x
            else:
                load += x
        return count

    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if couriers_needed(mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo
