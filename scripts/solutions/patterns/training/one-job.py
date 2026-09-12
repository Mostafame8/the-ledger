# Reference solutions for lesson one-job. Blocks: "# === <node-id>/<step-index>".

# === one-job/4
class Stock:
    def __init__(self):
        self.counts = {}
    def add(self, item, n):
        self.counts[item] = self.counts.get(item, 0) + n
    def count(self, item):
        return self.counts.get(item, 0)

def low_report(stock, threshold):
    return [item for item, n in stock.counts.items() if n < threshold]

# === one-job/5
class Roster:
    def __init__(self):
        self.people = []
    def add(self, name, role):
        self.people.append((name, role))
    def by_role(self, role):
        return [name for name, r in self.people if r == role]

def headcount(roster):
    out = {}
    for _name, role in roster.people:
        out[role] = out.get(role, 0) + 1
    return out
