# Reference solutions for lesson the-stamped-tag. Blocks: "# === <node-id>/<step-index>".

# === the-stamped-tag/4
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

# === the-stamped-tag/5
class Route:
    def __init__(self, start, end, minutes):
        self.start = start
        self.end = end
        self.minutes = minutes

def longest(routes):
    return max(routes, key=lambda r: r.minutes)
