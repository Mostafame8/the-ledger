# Reference solutions for armoury tool tool-heap. Blocks: "# === <tool-id>/<step-index>".

# === tool-heap/3
import heapq


def add_job(drawer, price):
    heapq.heappush(drawer, price)
    return drawer


def cheapest(drawer):
    if not drawer:
        return None
    return drawer[0]
