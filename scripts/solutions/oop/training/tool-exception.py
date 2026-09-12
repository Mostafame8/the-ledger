# Reference solutions for tool tool-exception. Blocks: "# === <tool-id>/<step-index>".

# === tool-exception/3
class Sealed(RuntimeError):
    pass

def add(bag, item):
    if bag['sealed']:
        raise Sealed('bag is sealed')
    bag['items'].append(item)

def safe_add(bag, item):
    try:
        add(bag, item)
        return True
    except Sealed:
        return False
