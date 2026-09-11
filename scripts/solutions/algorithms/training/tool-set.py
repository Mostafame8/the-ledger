# Reference solutions for armoury tool tool-set. Blocks: "# === <tool-id>/<step-index>".

# === tool-set/3
def is_banned(banned, plate):
    return plate in banned


def ban(banned, plate):
    banned.add(plate)
    return banned
