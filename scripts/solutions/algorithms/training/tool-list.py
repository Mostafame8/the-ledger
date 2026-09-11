# Reference solutions for armoury tool tool-list. Blocks: "# === <tool-id>/<step-index>".

# === tool-list/3
def stow(crate, item):
    crate.append(item)
    return crate


def newest(crate):
    if not crate:
        return None
    return crate[-1]
