# Reference solutions for lesson foreign-plug. Blocks: "# === <node-id>/<step-index>".

# === foreign-plug/4
class OldSafe:
    def crack(self, code_int):
        return code_int == 4417

class SafeAdapter:
    def __init__(self, old):
        self.old = old
    def open(self, code):
        try:
            number = int(code)
        except ValueError:
            return False
        return self.old.crack(number)

# === foreign-plug/5
class Celsius:
    def __init__(self, value):
        self.value = value
    def c(self):
        return self.value

class Fahrenheit:
    def __init__(self, value):
        self.value = value
    def f(self):
        return self.value

class AsCelsius:
    def __init__(self, reading):
        self.reading = reading
    def c(self):
        return round((self.reading.f() - 32) * 5 / 9, 1)

def coldest(readings):
    return min(r.c() for r in readings)
