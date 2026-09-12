import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('run-sheet', {
  tier: 'A', xp: 200, requires: ['front-desk'], gates: ['runsheet'],
  tools: ['tool-abstract'],
  title: 'The run sheet', algo: 'Template method',
  steps: [
    explain([
      'Every job runs the same sheet: check the gear, do the thing, wipe the place down. Dax has three copies of the sheet with three different middles, and last week the vault copy forgot to wipe.',
      'Dax: “Three jobs, three sheets.” “One sheet. Three middles.”',
    ], { move: 'brute force' }),
    explain([
      '“The base owns run() and the order: prepare, execute, cleanup. Each job fills in the steps it does differently, usually just the middle. The order is written once and cannot be forgotten by a copy.”',
      '“A step the base cannot fill raises. Better a loud crash at rehearsal than a quiet job that did nothing.”',
    ], { move: 'pick the pattern', code:
`class Job:
    def run(self):
        return [self.prepare(), self.execute(), self.cleanup()]
    def prepare(self):
        return 'gear checked'
    def execute(self):
        raise NotImplementedError
    def cleanup(self):
        return 'wiped down'

class VaultJob(Job):
    def execute(self):
        return 'vault emptied'

VaultJob().run()   # ['gear checked', 'vault emptied', 'wiped down']` }),
    trace(
`class Job:
    def run(self):
        return [self.prepare(), self.execute(), self.cleanup()]
    def prepare(self):
        return 'gear checked'
    def execute(self):
        raise NotImplementedError
    def cleanup(self):
        return 'wiped down'

class VaultJob(Job):
    def execute(self):
        return 'vault emptied'`,
      'VaultJob().run()',
      [
        { line: 5, state: { steps: ['gear checked'] }, ask: 'steps', note: 'run() on the base starts the sheet with prepare, which VaultJob never touched, so the base version answers.' },
        { line: 13, state: { steps: ['gear checked', 'vault emptied'] }, ask: 'steps', note: 'self.execute() from inside the base finds the subclass\'s version. That lookup is the whole trick: the base calls, the child answers.' },
        { line: 9, state: { steps: ['gear checked', 'vault emptied', 'wiped down'] }, ask: 'steps', note: 'cleanup comes from the base again. No copy of the sheet can forget it, because there is only one sheet.' },
        { line: 3, state: { steps: ['gear checked', 'vault emptied', 'wiped down'], returns: ['gear checked', 'vault emptied', 'wiped down'] }, ask: 'returns', note: 'Three steps in the base\'s order, one of them filled in by the job. A safehouse job overrides a different step and the order still holds.' },
      ]),
    spot('Three copies of the run sheet with three middles, and one copy forgot to wipe down. Where should the order of steps live?',
      ['In each copy, carefully',
       'Once, in a base run() that calls the steps in order, with each job overriding only the step it does differently',
       'In a comment',
       'In the fence\'s notebook'],
      1, 'One run() owns the skeleton; subclasses fill the holes. A copy cannot forget a step it never had to write. That is the template method.'),
    blank('“A report: header, body, footer. Daily fills in the body and nothing else.”',
`class Report:
    def render(self):
        return ['== report ==', ___, '== end ==']
    def body(self):
        raise NotImplementedError

class Daily(Report):
    def ___(self):
        return 'nothing happened'`,
`check("Daily().render()", ['== report ==', 'nothing happened', '== end =='])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("the bare report cannot render", _t_raises(lambda: Report().render()), 'NotImplementedError')
class _t_Weekly(Report):
    def body(self): return 'seven quiet days'
check("another body, same frame", _t_Weekly().render(), ['== report ==', 'seven quiet days', '== end =='])
check("render lives on the base only", 'render' in Report.__dict__ and 'render' not in Daily.__dict__, True)
check("Daily().body()", 'nothing happened')`),
    mini('Write class Drill with run() returning [self.warmup(), self.main(), self.cooldown()], where warmup() returns "stretch", cooldown() returns "water", and main() raises NotImplementedError. Then class Sprint(Drill) with main() returning "sprint 400", and class Lift(Drill) with main() returning "lift heavy" and warmup() returning "bands".',
      'run() is written once in Drill. Sprint overrides one method; Lift overrides two. Neither touches run().',
`check("Sprint().run()", ['stretch', 'sprint 400', 'water'])
check("Lift().run()", ['bands', 'lift heavy', 'water'])
def _t_raises(thunk):
    try:
        thunk()
    except Exception as e:
        return type(e).__name__
    return None
check("Drill().run() raises", _t_raises(lambda: Drill().run()), 'NotImplementedError')
check("cooldown is shared", Sprint().cooldown() == Lift().cooldown(), True)
class _t_Swim(Drill):
    def main(self): return 'laps'
check("a new drill writes only its middle", _t_Swim().run(), ['stretch', 'laps', 'water'])`),
  ],
})
