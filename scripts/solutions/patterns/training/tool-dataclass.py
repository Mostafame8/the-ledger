# Reference solutions for tool tool-dataclass. Blocks: "# === <tool-id>/<step-index>".

# === tool-dataclass/3
from dataclasses import dataclass, field

@dataclass
class Part:
    name: str
    cost: int = 0
    tags: list = field(default_factory=list)
