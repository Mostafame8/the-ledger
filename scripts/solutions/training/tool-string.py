# Reference solutions for armoury tool tool-string. Blocks: "# === <tool-id>/<step-index>".

# === tool-string/3
def head_char(tape):
    if not tape:
        return None
    return tape[0]


def stitch(pieces):
    return ''.join(pieces)
