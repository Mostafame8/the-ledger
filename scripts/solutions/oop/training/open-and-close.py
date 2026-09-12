# Reference solutions for lesson open-and-close. Blocks: "# === <node-id>/<step-index>".

# === open-and-close/4
class Bag:
    def __init__(self):
        self.items = []
        self.sealed = False
    def add(self, item):
        if self.sealed:
            raise RuntimeError('bag is sealed')
        self.items.append(item)
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        self.sealed = True
        return False

# === open-and-close/5
import time

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.start
        return False

class Muted:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        return exc_type is ValueError
