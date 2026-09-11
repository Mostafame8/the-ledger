# Reference solutions for tool tool-dunder. Blocks: "# === <tool-id>/<step-index>".

# === tool-dunder/3
class Crew:
    def __init__(self, names):
        self.names = list(names)
    def __repr__(self):
        return f"Crew({self.names!r})"
    def __len__(self):
        return len(self.names)
    def __eq__(self, other):
        return isinstance(other, Crew) and self.names == other.names
    def __iter__(self):
        return iter(self.names)
