# Reference solutions for Arc I of the patterns course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === onejob
class Tally:
    def __init__(self):
        self.lines = []
    def add(self, item, price):
        self.lines.append((item, price))
    def total(self):
        return sum(p for _, p in self.lines)

def receipt(tally):
    out = [f"{item}  {price}" for item, price in tally.lines]
    out.append(f"total  {tally.total()}")
    return out

# === bolton
class Alarm:
    def __init__(self):
        self.sensors = []
    def add(self, name, check):
        self.sensors.append((name, check))
    def trip(self, event):
        return [name for name, check in self.sensors if check(event)]

# === standin
class Lock:
    def open(self, key):
        return False

class KeyLock(Lock):
    def __init__(self, key):
        self.key = key
    def open(self, key):
        return key == self.key

class CodeLock(Lock):
    def __init__(self, code):
        self.code = code
    def open(self, key):
        return str(key) == self.code

def open_all(locks, key):
    return sum(1 for lock in locks if lock.open(key))

# === socket
class Dispatcher:
    def __init__(self, channel):
        self.channel = channel
    def alert(self, text):
        msg = "ALERT: " + text
        self.channel.send(msg)
        return msg

class Log:
    def __init__(self):
        self.sent = []
    def send(self, text):
        self.sent.append(text)
