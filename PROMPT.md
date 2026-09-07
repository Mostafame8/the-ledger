# Prompt to paste into Claude Code (run from the project root)

Read CLAUDE.md first, then src/data/gates.js.

Expand the course so that every arc has between 12 and 16 gates (currently 8, 9, 8, 5, 4).
Keep every existing gate exactly as it is and insert new ones in difficulty order.

Coverage to add, by arc:
- Arc I (F–E): FizzBuzz-style loops, max/min in a list, count vowels, first unique character,
  remove duplicates from sorted array, squares of a sorted array, majority element, Pascal's
  triangle row, plus-one on a digit array, missing number, single number (XOR), matrix transpose.
- Arc II (E–C): rotate array, container with most water, minimum size subarray sum, product of
  array except self, longest consecutive sequence, group by frequency (top-k frequent), search in
  rotated sorted array, first bad version (binary search on answer), find peak element, middle of
  linked list, merge two linked lists, invert a binary tree, lowest common ancestor, symmetric tree.
- Arc III (C–A): rotting oranges (multi-source BFS), number of provinces, clone graph, course
  schedule, word search (backtracking on grid), combination sum, letter combinations, subsets with
  duplicates, kth largest via quickselect, counting sort / bucket sort, meeting rooms (heap),
  task scheduler (greedy + heap).
- Arc IV (A): Bellman-Ford, Prim or Kruskal MST, bipartite check, house robber, unique paths,
  minimum path sum, decode ways, word break, partition equal subset sum, jump game.
- Arc V (S): longest common subsequence, longest palindromic substring, regular expression
  matching, burst balloons or matrix chain, word ladder, alien dictionary, sliding window maximum
  (monotonic deque), LRU cache, KMP or Rabin-Karp, median of two sorted arrays, trapping rain water,
  N-Queens count (if not already covered), a final "epilogue" gate that combines two techniques.

Rules:
1. Follow the schema, XP bands, stat rotation, and story voice in CLAUDE.md. Every gate gets its
   own scene tied to the heist; Marguerite gives the mission, Dax occasionally proposes brute force.
2. Give roughly half of the Arc I and Arc II gates a `code` block with example calls and expected
   output. Later arcs may have one where it clarifies the input format.
3. Update the title thresholds in src/data/index.js so titles are spread evenly across the new total.
4. Run `npm run check` and fix everything it reports. Then run `npm run dev`, open the site, and
   click through at least one new gate in each arc to make sure the quest window renders properly.
5. Finish with a short summary: gates per arc, total gates, and any problem you deliberately left out
   and why.

Work arc by arc and commit after each arc with a message like "content: expand Arc II to 14 gates".
