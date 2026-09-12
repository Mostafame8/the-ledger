# Reference solutions for tool tool-function. Blocks: "# === <tool-id>/<step-index>".

# === tool-function/3
def bind(fn, *pre):
    def inner(*rest):
        return fn(*pre, *rest)
    return inner
