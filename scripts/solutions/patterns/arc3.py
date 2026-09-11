# Reference solutions for Arc III of the patterns course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === foreignplug
class OldSafe:
    def crack(self, code_int):
        return code_int == 4417

class SafeAdapter:
    def __init__(self, old):
        self.old = old
    def open(self, code):
        try:
            return self.old.crack(int(code))
        except ValueError:
            return False

def open_all(safes, code):
    return sum(1 for s in safes if s.open(code))

# === layers
class Coat:
    def warmth(self):
        return 1
    def describe(self):
        return 'coat'

class Lined:
    def __init__(self, coat):
        self.coat = coat
    def warmth(self):
        return self.coat.warmth() + 2
    def describe(self):
        return 'lined ' + self.coat.describe()

class Armoured:
    def __init__(self, coat):
        self.coat = coat
    def warmth(self):
        return self.coat.warmth() + 1
    def describe(self):
        return 'armoured ' + self.coat.describe()

# === frontdesk
class Vault:
    def unlock(self):
        return 'vault open'

class Guard:
    def distract(self):
        return 'guard busy'

class Camera:
    def loop(self):
        return 'camera looping'

class Job:
    def __init__(self):
        self.camera = Camera()
        self.guard = Guard()
        self.vault = Vault()
    def run(self):
        return [self.camera.loop(), self.guard.distract(), self.vault.unlock()]

# === wrappedhand
def logged(log):
    def wrap(fn):
        def inner(*args):
            log.append(f"{fn.__name__}({','.join(str(a) for a in args)})")
            return fn(*args)
        return inner
    return wrap

def retry(times):
    def wrap(fn):
        def inner(*args):
            for _ in range(times):
                result = fn(*args)
                if result is not None:
                    return result
            return None
        return inner
    return wrap
