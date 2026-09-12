# Reference solutions for lesson run-sheet. Blocks: "# === <node-id>/<step-index>".

# === run-sheet/4
class Report:
    def render(self):
        return ['== report ==', self.body(), '== end ==']
    def body(self):
        raise NotImplementedError

class Daily(Report):
    def body(self):
        return 'nothing happened'

# === run-sheet/5
class Drill:
    def run(self):
        return [self.warmup(), self.main(), self.cooldown()]
    def warmup(self):
        return 'stretch'
    def main(self):
        raise NotImplementedError
    def cooldown(self):
        return 'water'

class Sprint(Drill):
    def main(self):
        return 'sprint 400'

class Lift(Drill):
    def warmup(self):
        return 'bands'
    def main(self):
        return 'lift heavy'
