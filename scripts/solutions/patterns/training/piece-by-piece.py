# Reference solutions for lesson piece-by-piece. Blocks: "# === <node-id>/<step-index>".

# === piece-by-piece/4
class OrderBuilder:
    def __init__(self):
        self._item, self._qty = None, 1
    def item(self, name):
        self._item = name
        return self
    def qty(self, n):
        self._qty = n
        return self
    def build(self):
        return {'item': self._item, 'qty': self._qty}

# === piece-by-piece/5
class LetterBuilder:
    def __init__(self):
        self._to = 'whoever'
        self._lines = []
        self._signed = 'nobody'
    def to(self, name):
        self._to = name
        return self
    def line(self, text):
        self._lines.append(text)
        return self
    def signed(self, name):
        self._signed = name
        return self
    def build(self):
        return '\n'.join([f"Dear {self._to},"] + self._lines + [f"— {self._signed}"])
