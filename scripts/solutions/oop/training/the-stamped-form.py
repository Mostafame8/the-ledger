# Reference solutions for lesson the-stamped-form. Blocks: "# === <node-id>/<step-index>".

# === the-stamped-form/4
from dataclasses import dataclass, field

@dataclass(frozen=True, order=True)
class Entry:
    price: int
    name: str
    tags: tuple = field(default_factory=tuple)

def total(entries):
    return sum(e.price for e in entries)

# === the-stamped-form/5
from dataclasses import dataclass, field

@dataclass(order=True)
class Job:
    priority: int
    name: str = field(compare=False)
    done: bool = field(default=False, compare=False)

def next_up(jobs):
    open_jobs = [j for j in jobs if not j.done]
    return min(open_jobs).name if open_jobs else None
