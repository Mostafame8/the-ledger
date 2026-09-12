import { node, explain, trace, spot, blank, mini } from '../../../training/node.js'

export default node('front-desk', {
  tier: 'D', xp: 100, requires: ['foreign-plug'], gates: ['frontdesk'],
  tools: ['tool-class'],
  title: 'The front desk', algo: 'Facade',
  steps: [
    explain([
      'When Marguerite says go, three systems move: the camera loops, the guard gets a call, the vault hears the code. Dax\'s go() is forty lines calling all three, and the order is in his head.',
      'Dax: “I know the order.” “Then only you can say go.”',
    ], { move: 'brute force' }),
    explain([
      '“One desk in front of the three systems. Job.run() knows the order and the manuals; it calls each system and collects what happened. The person who says go learns one word.”',
      '“The systems stay reachable behind the desk for anyone who needs the detail. The desk is a convenience, not a wall.”',
    ], { move: 'pick the pattern', code:
`class Camera:
    def loop(self): return 'camera looping'
class Guard:
    def distract(self): return 'guard busy'
class Vault:
    def unlock(self): return 'vault open'

class Job:
    def __init__(self):
        self.camera, self.guard, self.vault = Camera(), Guard(), Vault()
    def run(self):
        steps = [self.camera.loop()]
        steps.append(self.guard.distract())
        steps.append(self.vault.unlock())
        return steps

Job().run()   # ['camera looping', 'guard busy', 'vault open']` }),
    trace(
`class Camera:
    def loop(self): return 'camera looping'
class Guard:
    def distract(self): return 'guard busy'
class Vault:
    def unlock(self): return 'vault open'

class Job:
    def __init__(self):
        self.camera, self.guard, self.vault = Camera(), Guard(), Vault()
    def run(self):
        steps = [self.camera.loop()]
        steps.append(self.guard.distract())
        steps.append(self.vault.unlock())
        return steps`,
      'Job().run()',
      [
        { line: 12, state: { steps: ['camera looping'] }, ask: 'steps', note: 'The desk starts the sheet: camera first. The caller said run and nothing else.' },
        { line: 13, state: { steps: ['camera looping', 'guard busy'] }, ask: 'steps', note: 'Second system, second line. The order lives here and only here.' },
        { line: 14, state: { steps: ['camera looping', 'guard busy', 'vault open'] }, ask: 'steps', note: 'Vault last. Anyone who needs the vault alone can still reach job.vault; the desk did not hide it.' },
        { line: 15, state: { steps: ['camera looping', 'guard busy', 'vault open'], returns: ['camera looping', 'guard busy', 'vault open'] }, ask: 'returns', note: 'Add a fourth step tomorrow and every caller of run() gets it for free, without learning a fourth manual.' },
      ]),
    spot('go() is forty lines that call three systems in an order only Dax knows. Who else has to know the order?',
      ['Nobody, once the order lives in one run() behind a desk and callers only say go',
       'Every caller, forever',
       'The camera',
       'The fence'],
      0, 'Put the order in one place with one name. Callers stop needing the manuals, and the systems behind the desk stay untouched. That is a facade: a simple front for a busy back room.'),
    blank('“Morning at the safehouse: kettle, toaster, door, in that order, behind one word.”',
`class Kettle:
    def boil(self): return 'kettle on'
class Toaster:
    def pop(self): return 'toast up'
class Door:
    def unlock(self): return 'door open'

class Morning:
    def __init__(self):
        self.kettle, self.toaster, self.door = Kettle(), Toaster(), Door()
    def run(self):
        return [___, ___, self.door.unlock()]`,
`check("Morning().run()", ['kettle on', 'toast up', 'door open'])
check("Kettle().boil()", 'kettle on')
check("Toaster().pop()", 'toast up')
_t_m = Morning()
check("run twice, same morning", _t_m.run() == _t_m.run(), True)
check("the systems stay reachable", _t_m.door.unlock(), 'door open')`),
    mini('Write Lights with off() returning "lights off", Alarm with arm() returning "armed", Door with lock() returning "locked", and class Shutdown whose run() calls them in that order and returns the three strings as a list. Then quick(shutdown) returning only the last step of shutdown.run().',
      'Shutdown builds its three systems in __init__ and run() lists the calls in order. quick is one line: shutdown.run()[-1].',
`check("Shutdown().run()", ['lights off', 'armed', 'locked'])
check("quick(Shutdown())", 'locked')
check("Lights().off()", 'lights off')
check("Alarm().arm()", 'armed')
check("Door().lock()", 'locked')
_t_s = Shutdown()
check("run is repeatable", _t_s.run() == _t_s.run(), True)`),
  ],
})
