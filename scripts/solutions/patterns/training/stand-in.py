# Reference solutions for lesson stand-in. Blocks: "# === <node-id>/<step-index>".

# === stand-in/4
class Sensor:
    def read(self):
        return 0

class Thermo(Sensor):
    def __init__(self, value):
        self.value = value
    def read(self):
        return self.value

def hottest(sensors):
    return max(s.read() for s in sensors)

# === stand-in/5
class Note:
    def __init__(self, text):
        self._text = text
    def text(self):
        return self._text

class Shout(Note):
    def text(self):
        return self._text.upper()

def read_all(notes):
    return ' / '.join(n.text() for n in notes)
