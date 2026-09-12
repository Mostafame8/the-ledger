# Reference solutions for lesson parts-not-bloodlines. Blocks: "# === <node-id>/<step-index>".

# === parts-not-bloodlines/4
from dataclasses import dataclass

@dataclass
class Wheel:
    size: int

class Cart:
    def __init__(self):
        self.wheels = []
    def add(self, wheel):
        self.wheels.append(wheel)
        return self
    def width(self):
        return sum(w.size for w in self.wheels)

# === parts-not-bloodlines/5
class Engine:
    def __init__(self, power):
        self.power = power

class Radio:
    def __init__(self, band):
        self.band = band

class Van:
    def __init__(self, engine, radio):
        self.engine = engine
        self.radio = radio
    def spec(self):
        return f"{self.engine.power}hp, {self.radio.band}"

def swap_radio(van, radio):
    return Van(van.engine, radio)
