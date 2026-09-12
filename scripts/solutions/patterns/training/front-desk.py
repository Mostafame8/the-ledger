# Reference solutions for lesson front-desk. Blocks: "# === <node-id>/<step-index>".

# === front-desk/4
class Kettle:
    def boil(self): return 'kettle on'
class Toaster:
    def pop(self): return 'toast up'
class Door:
    def unlock(self): return 'door open'

class Morning:
    def __init__(self):
        self.kettle, self.toaster, self.door = Kettle(), Toaster(), Door()
    def run(self):
        return [self.kettle.boil(), self.toaster.pop(), self.door.unlock()]

# === front-desk/5
class Lights:
    def off(self): return 'lights off'
class Alarm:
    def arm(self): return 'armed'
class Door:
    def lock(self): return 'locked'

class Shutdown:
    def __init__(self):
        self.lights, self.alarm, self.door = Lights(), Alarm(), Door()
    def run(self):
        return [self.lights.off(), self.alarm.arm(), self.door.lock()]

def quick(shutdown):
    return shutdown.run()[-1]
