# Reference solutions for tool tool-tuple. Blocks: "# === <tool-id>/<step-index>".

# === tool-tuple/3
def index(items):
    return {(name, price): i for i, (name, price) in enumerate(items)}
