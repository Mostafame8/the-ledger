# Reference solutions for lesson reading-it-back. Blocks: "# === <node-id>/<step-index>".

# === reading-it-back/4
class Tag:
    def __init__(self, name, serial):
        self.name = name
        self.serial = serial
    def __repr__(self):
        return f"Tag({self.name!r}, {self.serial!r})"
    def __str__(self):
        return f"{self.serial} {self.name}"

# === reading-it-back/5
class Money:
    def __init__(self, pence):
        self.pence = pence
    def __repr__(self):
        return f"Money({self.pence})"
    def __str__(self):
        return f"£{self.pence // 100}.{self.pence % 100:02d}"
    def add(self, other):
        return Money(self.pence + other.pence)
