# Reference solutions for lesson shared-ink-own-name. Blocks: "# === <node-id>/<step-index>".

# === shared-ink-own-name/4
class Tag:
    made = 0
    prefix = 'HB'
    def __init__(self, name):
        self.name = name
        Tag.made += 1
        self.serial = f"{self.prefix}{Tag.made:03d}"

# === shared-ink-own-name/5
class Radio:
    channels = {}
    def __init__(self, freq):
        self.freq = freq
        Radio.channels[freq] = self
    def clear(self):
        Radio.channels.clear()

def on_air():
    return sorted(Radio.channels)
