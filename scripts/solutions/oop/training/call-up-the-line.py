# Reference solutions for lesson call-up-the-line. Blocks: "# === <node-id>/<step-index>".

# === call-up-the-line/4
class Member:
    def __init__(self, name):
        self.name = name
        self.jobs = []
    def log(self, job):
        self.jobs.append(job)
        return len(self.jobs)

class Driver(Member):
    def __init__(self, name, vehicle):
        super().__init__(name)
        self.vehicle = vehicle
    def log(self, job):
        return super().log(f"{job}:{self.vehicle}")

# === call-up-the-line/5
class Role:
    def __init__(self, name):
        self.name = name
    def describe(self):
        raise NotImplementedError

class Lookout(Role):
    def __init__(self, name, post):
        super().__init__(name)
        self.post = post
    def describe(self):
        return f"watches {self.post}"

def roster(roles):
    return [r.describe() for r in roles]
