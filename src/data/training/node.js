// Constructors for training content. One node per technique, each an ordered list of steps.
// See docs/superpowers/specs/2026-09-08-training-room-design.md for the schema.
export const MOVES = ['restate', 'examples', 'brute force', 'name the waste', 'pick the pattern', 'verify']

export const node = (id, fields) => ({ id, ...fields })

// Armoury tool: a data-structure drill unlocked independently of the rank ladder.
export const tool = (id, fields) => ({ id, ...fields })

// explain(lines, { move?, code?, scene? })   read, then Next
export const explain = (lines, opts = {}) => ({ type: 'explain', lines, ...opts })
// trace(code, input, frames, { scene? })   frames: [{ line, state, ask, note }]
export const trace = (code, input, frames, opts = {}) => ({ type: 'trace', code, input, frames, ...opts })
// spot(problem, options, answer, why) answer is an index into options
export const spot = (problem, options, answer, why) => ({ type: 'spot', problem, options, answer, why })
// blank(intro, template, tests)      template contains ___ markers
export const blank = (intro, template, tests) => ({ type: 'blank', intro, template, tests })
// mini(mission, hint, tests)         full solution from scratch
export const mini = (mission, hint, tests) => ({ type: 'mini', mission, hint, tests })
