# Reference solutions for lesson walk-the-vault. Blocks: "# === <node-id>/<step-index>".

# === walk-the-vault/4
class Deck:
    def __init__(self, cards):
        self.cards = cards
    def __iter__(self):
        for card in self.cards:
            yield card

def firsts(deck, n):
    out = []
    for card in deck:
        if len(out) == n:
            break
        out.append(card)
    return out

# === walk-the-vault/5
class Log:
    def __init__(self, entries):
        self.entries = list(entries)
    def __iter__(self):
        for _level, text in self.entries:
            yield text

def errors(log):
    for level, text in log.entries:
        if level == 'error':
            yield text

def first_error(log):
    for text in errors(log):
        return text
    return None

def count_levels(log):
    counts = {}
    for level, _text in log.entries:
        counts[level] = counts.get(level, 0) + 1
    return counts
