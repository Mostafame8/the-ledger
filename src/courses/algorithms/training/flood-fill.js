import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('flood-fill', {
  tier: 'C', xp: 130, requires: ['grid-bfs'], gates: ['islands'],
  tools: ['tool-table', 'tool-stack'],
  title: 'Ink on the floor plan', algo: 'Flood fill',
  steps: [
    explain([
      'The vault floor plan is flat on the table: steel where the walls are, air where a person fits. Marguerite knocks a pen over and the ink runs into one pocket of air, turns every corner it can, and stops dead at the steel.',
      'Dax: “Fine. I look at every air square and check whether it is in that pocket.”',
      '“Check how? Nothing about one square tells you. A square is in the pocket if a square touching it is in the pocket, which is a question about the whole pocket, not about the square.”',
    ], { move: 'brute force' }),
    explain([
      '“So do what the ink did. Stand on the square, paint it, then tell each of the four squares beside it to do exactly the same thing, and only if it is still the old colour.”',
      '“The paint is the memory. A square you have already painted no longer matches the old colour, so it turns the ink away by itself. No visited set, no queue, nothing to keep in step.”',
      '“And notice what happens if the old colour and the new colour are the same. Nothing turns anything away, and the ink runs until Python stops it. That case is a line at the top, not an afterthought.”',
    ], { move: 'pick the pattern', code:
`def fill(grid, r, c, new):
    old = grid[r][c]
    if old == new:
        return grid
    grid[r][c] = new
    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == old:
            fill(grid, nr, nc, new)
    return grid`, scene: { kind: 'grid', data: 'grid', init: [[0, 0], [0, 0]], cursor: ['r', 'c'],
        states: [{ r: 0, c: 0, grid: [[0, 0], [0, 0]] }, { r: 0, c: 0, grid: [[5, 0], [0, 0]] }, { r: 1, c: 0, grid: [[5, 0], [5, 0]] }, { r: 1, c: 1, grid: [[5, 0], [5, 5]] }, { r: 0, c: 1, grid: [[5, 5], [5, 5]] }] } }),
    trace(
`def fill(grid, r, c, new):
    old = grid[r][c]
    if old == new:
        return grid
    grid[r][c] = new
    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == old:
            fill(grid, nr, nc, new)
    return grid`,
      'fill([[0, 0], [0, 0]], 0, 0, 5)',
      [
        { line: 5, state: { r: 0, c: 0, old: 0, new: 5, grid: [[5, 0], [0, 0]] }, ask: 'grid', note: 'The first brushstroke, on the square you were handed. Every square in this plan is air, so the ink will reach all four, but only one has been painted so far.' },
        { line: 5, state: { r: 1, c: 0, old: 0, new: 5, grid: [[5, 0], [5, 0]] }, ask: 'grid', note: 'Up from (0, 0) was off the plan, so the first neighbour the ink actually reached was down. That call painted before it looked anywhere, and it is now four levels of paperwork deep inside the first one.' },
        { line: 5, state: { r: 1, c: 1, old: 0, new: 5, grid: [[5, 0], [5, 5]] }, ask: 'grid', note: 'From (1, 0) the ink tried up first, saw a 5 there, and was turned away by the paint. Then down and left were off the plan, so it went right. Nothing is remembering visited squares; the grid itself is.' },
        { line: 5, state: { r: 0, c: 1, old: 0, new: 5, grid: [[5, 5], [5, 5]] }, ask: 'grid', note: 'The fourth square, reached by going up from (1, 1) rather than right from (0, 0), because the ink ran to the far wall before it came back. Four paints for four squares, and the calls now unwind finding a 5 everywhere they look.' },
      ], { scene: { kind: 'grid', data: 'grid', init: [[0, 0], [0, 0]], cursor: ['r', 'c'] } }),
    spot('Dax wants to keep a list of squares the ink has already touched, the way the tunnel rings kept a dist box, so the paint does not go round in circles. Marguerite says he does not need one. Why not?',
      ['He does need one. Without it the four neighbours send the ink back and forth forever',
       'Painting the square is the mark: a painted square no longer holds the old colour, so the test at the top turns the next call away',
       'The floor plan is small enough that going round in circles does not cost anything',
       'Python already remembers which arguments a function has been called with and will not repeat a call'],
      1, 'It really would loop forever without a mark, so the first option has the right worry and the wrong conclusion. Small does not help: two squares beside each other are enough to bounce the ink forever. And Python remembers nothing of the sort; caching calls is something you have to write, and it would be the wrong tool for a grid you are mutating. The paint is the mark, which is why the old colour must not equal the new one.'),
    blank('“Write it. Paint the pocket of squares holding the same value as (r, c) with new, change the plan itself, and hand the plan back. Four directions, in bounds only.”',
`def fill(grid, r, c, new):
    old = grid[r][c]
    if ___:
        return grid
    grid[r][c] = new
    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and ___:
            fill(grid, nr, nc, new)
    return grid`,
`check("fill([[0, 0], [0, 0]], 0, 0, 5)", [[5, 5], [5, 5]])
check("fill([[0, 1], [1, 0]], 0, 0, 7)", [[7, 1], [1, 0]])
check("fill([[1, 1, 0], [0, 1, 0]], 0, 0, 2)", [[2, 2, 0], [0, 2, 0]])
check("fill([[1, 0], [0, 0]], 1, 1, 4)", [[1, 4], [4, 4]])
check("fill([[3, 3], [3, 3]], 1, 1, 3)", [[3, 3], [3, 3]])
check("fill([[0]], 0, 0, 9)", [[9]])`),
    mini('Write region_size(grid, r, c) that returns how many squares are in the connected pocket of equal values containing (r, c). Squares connect up, down, left and right. Leave the grid exactly as you found it.',
      'The same walk, but you cannot paint, because the plan has to survive. Keep the squares you have reached in a set instead and count them at the end.',
`_t_plan = [[1, 1, 0], [0, 1, 0]]
check("region_size(plan, 0, 0)", lambda: region_size(_t_plan, 0, 0), 3)
check("the plan is unchanged", lambda: _t_plan, [[1, 1, 0], [0, 1, 0]])
check("region_size(plan, 0, 2)", lambda: region_size(_t_plan, 0, 2), 2)
check("region_size([[1, 1], [1, 1]], 0, 0)", 4)
check("region_size([[1, 0], [0, 1]], 0, 0)", 1)
check("region_size([[2]], 0, 0)", 1)`),
  ],
})
