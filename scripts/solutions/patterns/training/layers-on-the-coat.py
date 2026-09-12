# Reference solutions for lesson layers-on-the-coat. Blocks: "# === <node-id>/<step-index>".

# === layers-on-the-coat/4
def counted(fn):
    def inner(*args):
        inner.calls += 1
        return fn(*args)
    inner.calls = 0
    return inner

# === layers-on-the-coat/5
def shout(fn):
    def inner(*args):
        return fn(*args).upper()
    return inner

def twice(fn):
    def inner(*args):
        fn(*args)
        return fn(*args)
    return inner
