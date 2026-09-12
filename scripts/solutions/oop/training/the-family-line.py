# Reference solutions for lesson the-family-line. Blocks: "# === <node-id>/<step-index>".

# === the-family-line/4
class Guard:
    def __init__(self, name):
        self.name = name
    def greet(self):
        return f"{self.name}: {self.describe()}"
    def describe(self):
        return 'stands'

class Runner(Guard):
    def describe(self):
        return 'runs'

class Watcher(Guard):
    def describe(self):
        return 'watches'

# === the-family-line/5
class Fee:
    def __init__(self, amount):
        self.amount = amount
    def charge(self, total):
        return total + self.amount

class Percent(Fee):
    def charge(self, total):
        return total + total * self.amount // 100

def apply(fees, total):
    for fee in fees:
        total = fee.charge(total)
    return total
