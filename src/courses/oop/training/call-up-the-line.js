import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('call-up-the-line', {
  tier: 'E', xp: 70, requires: ['the-family-line'], gates: ['upline', 'stub'],
  tools: ['tool-function'],
  title: 'Call up the line', algo: 'super()',
  steps: [
    explain([
      'Driver needs everything Member has, plus a vehicle. Dax\'s Driver.__init__ re-does every line of Member.__init__ and adds one. Then Member gains jobs = [], and every Driver crashes on .jobs.',
      'Dax: “I will copy the new line into Driver too.” Marguerite: “And into Lookout, and into the two you write next month.”',
      '“Do your part. For the rest, call up the line.”',
    ], { move: 'brute force' }),
    explain([
      '“super().__init__(name) runs the parent\'s __init__ on this same self. Whatever the parent writes lands on the child. It works for any method: do your bit, hand the rest up.”',
      '“And a parent can leave a chair empty on purpose. describe raises NotImplementedError, so a child that forgets to fill it is told the moment someone asks.”',
    ], { move: 'pick the pattern', code:
`class Member:
    def __init__(self, name):
        self.name = name
        self.jobs = []
    def log(self, job):
        self.jobs.append(job)
        return len(self.jobs)
    def describe(self):
        raise NotImplementedError

class Driver(Member):
    def __init__(self, name, vehicle):
        super().__init__(name)
        self.vehicle = vehicle
    def log(self, job):
        return super().log(f"{job}:{self.vehicle}")
    def describe(self):
        return 'drives'

d = Driver('dax', 'van')
d.jobs                 # [] — the parent wrote it
d.log('run')           # 1
d.jobs                 # ['run:van']
Member('m').describe() # NotImplementedError` }),
    trace(
`class Member:
    def __init__(self, name):
        self.name = name
        self.jobs = []
    def log(self, job):
        self.jobs.append(job)
        return len(self.jobs)
    def describe(self):
        raise NotImplementedError

class Driver(Member):
    def __init__(self, name, vehicle):
        super().__init__(name)
        self.vehicle = vehicle
    def log(self, job):
        return super().log(f"{job}:{self.vehicle}")
    def describe(self):
        return 'drives'

n = Driver('dax', 'van').log('run')`,
      'n',
      [
        { line: 3, state: { name: 'dax' }, ask: 'name', note: 'super().__init__(name) jumped up to Member.__init__ with the same self. The name lands on the Driver.' },
        { line: 14, state: { name: 'dax', vehicle: 'van' }, ask: 'vehicle', note: 'Back in Driver.__init__ for the one line that is the child\'s own.' },
        { line: 6, state: { name: 'dax', vehicle: 'van', jobs: ['run:van'] }, ask: 'jobs', note: 'Driver.log dressed the job with the vehicle, then handed it up. Member.log appends to this object\'s list.' },
        { line: 20, state: { name: 'dax', vehicle: 'van', jobs: ['run:van'], n: 1 }, ask: 'n', note: 'The parent returned the count; the child returned what the parent returned.' },
      ]),
    spot('Dax writes Member.__init__(name) inside Driver.__init__ instead of super().__init__(name). Result?',
      ['Works the same',
       'TypeError: a missing argument. Calling through the class hands nothing in, so you would have to write Member.__init__(self, name), which is exactly what super() does for you',
       'Infinite recursion',
       'The Driver gets two names'],
      1, 'super() binds the parent\'s method to this instance before calling it. Member.__init__ is the bare function, and it needs self spelled out. super() is the shorter, safer spelling of the same call.'),
    blank('“Extend __init__ and log. One super() call in each, and the child writes only its own line.”',
`class Member:
    def __init__(self, name):
        self.name = name
        self.jobs = []
    def log(self, job):
        self.jobs.append(job)
        return len(self.jobs)

class Driver(Member):
    def __init__(self, name, vehicle):
        ___
        self.vehicle = vehicle
    def log(self, job):
        return ___`,
`_t_d = Driver('d', 'van')
check("the parent sets the name", _t_d.name, 'd')
check("the child sets the vehicle", _t_d.vehicle, 'van')
check("jobs start empty", _t_d.jobs, [])
check("log returns the count", _t_d.log('run'), 1)
check("the driver's log carries the vehicle", _t_d.jobs, ['run:van'])
check("second log", _t_d.log('wait'), 2)`),
    mini('Write class Role(name) storing name, with describe() raising NotImplementedError. Then class Lookout(Role) taking (name, post): call up the line for name, store post, and make describe() return f"watches {post}". Then roster(roles) returning the list of descriptions.',
      'super().__init__(name) then self.post = post. roster is a list comprehension over r.describe().',
`def _t_raises(fn):
    try: fn()
    except Exception as e: return type(e).__name__
    return None
check("Lookout('v', 'door').name", 'v')
check("Lookout('v', 'door').describe()", 'watches door')
check("roster([Lookout('a', 'roof'), Lookout('b', 'gate')])", ['watches roof', 'watches gate'])
check("the empty chair shouts", _t_raises(lambda: Role('r').describe()), 'NotImplementedError')
check("isinstance(Lookout('v', 'd'), Role)", True)
check("roster([])", [])`),
  ],
})
