# Reference solutions for lesson pick-the-play. Blocks: "# === <node-id>/<step-index>".

# === pick-the-play/4
class Sorter:
    def __init__(self, rule):
        self.rule = rule
    def run(self, items):
        return sorted(items, key=self.rule)

def by_len(s):
    return len(s)

def by_last(s):
    return s[-1]

# === pick-the-play/5
class Pricer:
    def __init__(self, policy):
        self.policy = policy
    def charge(self, price):
        return self.policy(price)
    def set_policy(self, fn):
        self.policy = fn

def half(p):
    return p / 2

def plus_tax(p):
    return round(p * 1.2, 2)
