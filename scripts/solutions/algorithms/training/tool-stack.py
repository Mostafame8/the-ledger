# Reference solutions for armoury tool tool-stack. Blocks: "# === <tool-id>/<step-index>".

# === tool-stack/3
def peek(tray):
    if not tray:
        return None
    return tray[-1]


def put(tray, sheet):
    tray.append(sheet)
    return tray
