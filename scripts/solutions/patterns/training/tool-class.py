# Reference solutions for tool tool-class. Blocks: "# === <tool-id>/<step-index>".

# === tool-class/3
class Badge:
    def __init__(self, name, clearance):
        self.name = name
        self.clearance = clearance
    def can_enter(self, level):
        return self.clearance >= level
