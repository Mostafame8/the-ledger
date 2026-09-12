# Reference solutions for lesson one-radio. Blocks: "# === <node-id>/<step-index>".

# === one-radio/4
class Config:
    _instance = None

    def __init__(self):
        self.values = {}

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset(cls):
        cls._instance = None

# === one-radio/5
class Counter:
    _shared = None

    def __init__(self):
        self.count = 0

    def bump(self):
        self.count += 1
        return self.count

    @classmethod
    def shared(cls):
        if cls._shared is None:
            cls._shared = cls()
        return cls._shared

    @classmethod
    def reset(cls):
        cls._shared = None
