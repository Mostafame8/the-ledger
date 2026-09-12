# Reference solutions for lesson the-attribute-trap. Blocks: "# === <node-id>/<step-index>".

# === the-attribute-trap/4
class Record:
    def __init__(self, **fields):
        object.__setattr__(self, '_data', dict(fields))
        object.__setattr__(self, '_log', [])
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"no field {name!r}") from None
    def __setattr__(self, name, value):
        self._data[name] = value
        self._log.append((name, value))
    def changes(self):
        return list(self._log)

# === the-attribute-trap/5
class Frozen:
    def __init__(self, **fields):
        object.__setattr__(self, '_data', dict(fields))
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"no field {name!r}") from None
    def __setattr__(self, name, value):
        raise TypeError('frozen')

def thaw(frozen):
    return dict(frozen._data)
