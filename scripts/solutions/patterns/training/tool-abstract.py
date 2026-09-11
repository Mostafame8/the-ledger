# Reference solutions for tool tool-abstract. Blocks: "# === <tool-id>/<step-index>".

# === tool-abstract/3
from abc import ABC, abstractmethod

class Rig(ABC):
    @abstractmethod
    def use(self):
        ...

class Torch(Rig):
    def use(self):
        return 'burning'
