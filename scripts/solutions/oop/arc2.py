# Reference solutions for Arc II of the oop course. One block per gate, introduced by "# === <id>".
# Run with npm test. These exist to prove the tests, not to be shown to learners.

# === roles
class Member:
    def __init__(self, name):
        self.name = name
    def rate(self):
        return 10
    def cut(self, total):
        return total * self.rate() // 100

class Driver(Member):
    def rate(self):
        return 15

class Lookout(Member):
    def rate(self):
        return 5

def payout(members, total):
    return [(m.name, m.cut(total)) for m in members]

# === upline
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

# === stub
class Role:
    def describe(self):
        raise NotImplementedError

class Driver(Role):
    def describe(self):
        return 'drives'

class Lookout(Role):
    def describe(self):
        return 'watches'

def roster(roles):
    return [r.describe() for r in roles]

def count_roles(things):
    return sum(1 for t in things if isinstance(t, Role))

# === twoparents
class Member:
    def __init__(self, name):
        self.name = name
    def who(self):
        return self.name

class Wheels:
    def who(self):
        return super().who() + ', wheels'

class Armed:
    def who(self):
        return super().who() + ', armed'

class Driver(Wheels, Member):
    pass

class Heavy(Armed, Wheels, Member):
    pass
