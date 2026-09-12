# Reference solutions for tool tool-decorator. Blocks: "# === <tool-id>/<step-index>".

# === tool-decorator/3
LOG = []

def logged(fn):
    def inner(*args, **kwargs):
        LOG.append(fn.__name__)
        return fn(*args, **kwargs)
    return inner
