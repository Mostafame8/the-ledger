# Reference solutions for armoury tool tool-queue. Blocks: "# === <tool-id>/<step-index>".

# === tool-queue/3
from collections import deque


def join_line(line, name):
    line.append(name)
    return list(line)


def next_up(line):
    if not line:
        return None
    return line[0]
