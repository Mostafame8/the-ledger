# Reference solutions for armoury tool tool-recursion. Blocks: "# === <tool-id>/<step-index>".

# === tool-recursion/3
def unwind(tape):
    if tape == '':
        return ''
    return unwind(tape[1:]) + tape[0]
