# Reference solutions for Arc V of the patterns course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === readtheroom
class Calm:
    name = 'calm'
    def talk(self):
        return 'small talk'
    def next(self):
        return Wary()

class Wary:
    name = 'wary'
    def talk(self):
        return 'short answers'
    def next(self):
        return Alarmed()

class Alarmed:
    name = 'alarmed'
    def talk(self):
        return 'calls it in'
    def next(self):
        return Alarmed()

class Mark:
    def __init__(self):
        self.state = Calm()
    def nudge(self):
        self.state = self.state.next()
    def talk(self):
        return self.state.talk()
    @property
    def mood(self):
        return self.state.name

# === runsheet
class Job:
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

class SafehouseJob(Job):
    def prepare(self):
        return 'keys copied'
    def execute(self):
        return 'files copied'

# === roombyroom
class Vault:
    def __init__(self, rooms):
        self.rooms = list(rooms)
    def __iter__(self):
        for name, _locked in self.rooms:
            yield name

def open_rooms(vault):
    for name, locked in vault.rooms:
        if not locked:
            yield name

def first_locked(vault):
    for name, locked in vault.rooms:
        if locked:
            return name
    return None

# === wholerig
class Crew:
    def __init__(self):
        self.roles = {}
        self.ears = {}
        self.route = None
    def register(self, role, cls):
        self.roles[role] = cls
    def hire(self, role):
        member = self.roles[role]()
        self.emit('hired', member)
        return member
    def on(self, event, fn):
        self.ears.setdefault(event, []).append(fn)
    def emit(self, event, payload):
        fns = list(self.ears.get(event, []))
        for fn in fns:
            fn(payload)
        return len(fns)
    def plan(self, strategy):
        self.route = strategy
    def go(self, city):
        return self.route.path(city)
