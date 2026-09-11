# Reference solutions for Arc II of the patterns course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === rigfactory
class Cutter:
    def use(self):
        return 'cutting'

class Torch:
    def use(self):
        return 'burning'

class Jammer:
    def use(self):
        return 'jamming'

class RigFactory:
    def __init__(self):
        self.kinds = {'cutter': Cutter, 'torch': Torch, 'jammer': Jammer}
    def register(self, kind, cls):
        self.kinds[kind] = cls
    def make(self, kind):
        if kind not in self.kinds:
            raise ValueError(f"no rig called {kind!r}")
        return self.kinds[kind]()

# === rigbuilder
class Rig:
    def __init__(self, battery=20, blade='steel', silent=False):
        self.battery = battery
        self.blade = blade
        self.silent = silent
    def describe(self):
        noise = 'silent' if self.silent else 'loud'
        return f"{self.blade} blade, {self.battery}Ah, {noise}"

class RigBuilder:
    def __init__(self):
        self._battery = 20
        self._blade = 'steel'
        self._silent = False
    def battery(self, n):
        self._battery = n
        return self
    def blade(self, name):
        self._blade = name
        return self
    def silent(self):
        self._silent = True
        return self
    def build(self):
        return Rig(self._battery, self._blade, self._silent)

# === oneradio
class Radio:
    _instance = None

    def __init__(self):
        self.freq = None

    def tune(self, freq):
        self.freq = freq

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset(cls):
        cls._instance = None

# === catalogue
class Catalogue:
    def __init__(self):
        self.pages = {}
    def register(self, kind):
        def paste(cls):
            self.pages[kind] = cls
            return cls
        return paste
    def kinds(self):
        return sorted(self.pages)
    def build(self, kind, **kw):
        return self.pages[kind](**kw)
