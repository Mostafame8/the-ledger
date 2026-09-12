# Reference solutions for tool tool-type. Blocks: "# === <tool-id>/<step-index>".

# === tool-type/3
def sort_out(things):
    out = {'int': [], 'str': [], 'other': []}
    for x in things:
        if isinstance(x, int):
            out['int'].append(x)
        elif isinstance(x, str):
            out['str'].append(x)
        else:
            out['other'].append(x)
    return out
