# Reference solutions for Arc I. One block per gate, introduced by "# === <id>".
# Run with `npm test`. These exist to prove the tests, not to be shown to learners.

# === fizz
def radio_check(n):
    out = []
    for i in range(1, n + 1):
        words = []
        if i % 3 == 0:
            words.append("clear")
        if i % 5 == 0:
            words.append("hold")
        out.append(" ".join(words) if words else str(i))
    return out

# === zeros
def move_zeros(nums):
    w = 0
    for r in range(len(nums)):
        if nums[r] != 0:
            nums[w], nums[r] = nums[r], nums[w]
            w += 1

# === palin
def is_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        while i < j and not s[i].isalnum():
            i += 1
        while i < j and not s[j].isalnum():
            j -= 1
        if s[i].lower() != s[j].lower():
            return False
        i += 1
        j -= 1
    return True

# === reverse
def reverse_words(s):
    return " ".join(reversed(s.split()))

# === twosum
def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i

# === anagram
from collections import Counter, defaultdict

def is_anagram(a, b):
    return Counter(a) == Counter(b)

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        groups["".join(sorted(w))].append(w)
    return list(groups.values())

# === dupes
def has_duplicate(nums):
    return len(set(nums)) != len(nums)

def find_duplicates(nums):
    seen, dup = set(), set()
    for x in nums:
        if x in seen:
            dup.add(x)
        seen.add(x)
    return list(dup)

# === stocks
def max_profit(prices):
    best, low = 0, float("inf")
    for p in prices:
        low = min(low, p)
        best = max(best, p - low)
    return best

# === parens
def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in "([{":
            stack.append(c)
        elif not stack or stack.pop() != pairs[c]:
            return False
    return not stack

# === transpose
def transpose(grid):
    return [[grid[r][c] for r in range(len(grid))] for c in range(len(grid[0]))]

# === plusone
def plus_one(digits):
    out = digits[:]
    for i in range(len(out) - 1, -1, -1):
        if out[i] < 9:
            out[i] += 1
            return out
        out[i] = 0
    return [1] + out

# === rmdup
def remove_duplicates(nums):
    if not nums:
        return 0
    w = 1
    for r in range(1, len(nums)):
        if nums[r] != nums[w - 1]:
            nums[w] = nums[r]
            w += 1
    return w

# === xor
def single_number(nums):
    acc = 0
    for x in nums:
        acc ^= x
    return acc

# === squares
def sorted_squares(nums):
    out = [0] * len(nums)
    i, j = 0, len(nums) - 1
    for w in range(len(nums) - 1, -1, -1):
        if abs(nums[i]) > abs(nums[j]):
            out[w] = nums[i] ** 2
            i += 1
        else:
            out[w] = nums[j] ** 2
            j -= 1
    return out

# === majority
def majority_element(nums):
    cand, count = None, 0
    for x in nums:
        if count == 0:
            cand = x
        count += 1 if x == cand else -1
    return cand

# === firstuniq
from collections import Counter

def first_unique_char(s):
    counts = Counter(s)
    for i, c in enumerate(s):
        if counts[c] == 1:
            return i
    return -1
