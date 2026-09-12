# Reference solutions for lesson two-parents. Blocks: "# === <node-id>/<step-index>".

# === two-parents/4
class Member:
    def __init__(self, name): self.name = name
    def who(self): return self.name

class Wheels:
    def who(self): return super().who() + ', wheels'

class Armed:
    def who(self): return super().who() + ', armed'

class Heavy(Armed, Wheels, Member): pass

# === two-parents/5
class Base:
    def tags(self):
        return []

class Loud:
    def tags(self):
        return super().tags() + ['loud']

class Fast:
    def tags(self):
        return super().tags() + ['fast']

class Quiet:
    def tags(self):
        return super().tags() + ['quiet']

def build(*parts):
    return type('Rig', parts + (Base,), {})().tags()
