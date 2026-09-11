// Gate content for the patterns course. One object per gate; see CLAUDE.md for the voice and schema.
const g = (id, rank, xp, stat, title, algo, story, mission, hint, code) => ({ id, rank, xp, stat, title, algo, story, mission, hint, code });

const ARCS = [
{ name:'Arc I — The workbench', sub:'Money in the bag, no kit on the bench. Marguerite wants parts, not a lump.', gates:[
  g('onejob','F',40,'structure','The overloaded crate','Single responsibility',
    ['The room above the laundromat has a new bench, a new kettle, and one crate of stock the fence wants counted, priced and receipted by morning.',
     'Dax slides a laptop across. One class, two hundred lines, called Crate. It counts, it prices, it prints, and somewhere in the middle it makes the coffee.',
     '“When the receipt format changes,” Marguerite says, “why does the stock count get nervous? One job per part. Split it.”'],
    'Write class Tally with add(item, price) and total(), and a separate function receipt(tally) that returns a list of strings: one "<item>  <price>" line per add, in order (two spaces between), then a last line "total  <sum>". Stretch: change the receipt format without touching Tally.',
    'Tally only remembers pairs and sums prices. receipt only reads a Tally and formats lines. Neither knows more about the other than that.',
`t = Tally()
t.add('torch', 5)
t.add('cutter', 10)
t.total()        # 15
receipt(t)       # ['torch  5', 'cutter  10', 'total  15']`),
  g('bolton','F',45,'structure','Bolt-on sensors','Open/closed',
    ['The safehouse alarm is a metal box with a lid. Every time Dax adds a sensor he opens the box, finds the one function that checks everything, and adds another branch.',
     '“Every reopening is a chance to break the sensors already in there,” Marguerite says. “Build a rail. New sensors bolt on. The box stays shut.”',
     'Dax: “And when the rail needs a new kind of bolt?” “Then the rail is the thing you open. Not the sensors.”'],
    'Write class Alarm with add(name, check), where check is a function that takes an event and returns True or False, and trip(event) returning the list of names whose check fired, in the order they were added. Stretch: bolt a third sensor on from outside the class without editing trip.',
    'Keep the sensors as a list of (name, check) pairs. trip walks the list and asks each check about the event. It never knows what any sensor is looking for.'),
  g('standin','F',45,'structure','Any lock, same hand','Substitutable parts',
    ['The fence sends over a duffel bag: a dozen locks of three makes, all off the same Halden floor. The crew needs to know how many one key still opens.',
     'Dax writes open_all with an if for each make. “Key lock, code lock, and the one with the dial I have not met yet.”',
     '“The hand that tries a lock should not care what make it is,” Marguerite says. “Every lock answers open(key). Give them one shape and let each fill it in.”'],
    'Write class Lock with open(key) returning False; class KeyLock(Lock) built with a key, whose open(key) is True when the key matches; class CodeLock(Lock) built with a code string, whose open(key) is True when str(key) equals the code. Then open_all(locks, key) returns how many locks in the list opened. Stretch: open_all must not mention any subclass by name.',
    'open_all only ever calls lock.open(key) and counts the Trues. Which class answers is the lock\'s business, not the hand\'s.',
`locks = [KeyLock('A7'), CodeLock('4417'), Lock()]
KeyLock('A7').open('A7')       # True
CodeLock('4417').open(4417)    # True, str(4417) == '4417'
open_all(locks, 'A7')          # 1`),
  g('socket','F',50,'structure','The socket','Depend on the socket',
    ['Halden went sideways the moment the burner phone died, because every alert in Dax\'s code dialled the phone directly.',
     '“The dispatcher should not own a phone,” Marguerite says. “It should own a socket. Phone, radio, a notebook for rehearsals: anything with send() plugs in.”',
     'Dax: “So on the night we plug the radio in and nothing else changes.” “Nothing else changes.”'],
    'Write class Dispatcher built with a channel, any object that has send(text). Its alert(text) sends "ALERT: " + text through the channel and returns the string it sent. Also write class Log with a sent list and a send(text) that appends to it. Stretch: write a channel that only counts sends and plug it in without touching Dispatcher.',
    'Dispatcher stores the channel it was handed and calls channel.send. It never builds a channel itself. The tests plug in a fake, so keep the shape exact.'),
]},
{ name:'Arc II — The forge', sub:'Rigs get made here. Nobody says the rig\'s name at the window.', gates:[
  g('rigfactory','E',60,'creation','Three rigs, one window','Factory',
    ['The fence runs her shop through one window. You say cutter, torch or jammer. You do not say how it gets made, and she does not tell you.',
     'Dax has three constructors scattered through the plan and a comment that reads: if you add a rig, grep for these.',
     '“One window,” Marguerite says. “Everyone asks it by name. Whoever adds a rig changes the window once, and nobody who asks ever knows.”'],
    'Write classes Cutter, Torch and Jammer, each with use() returning "cutting", "burning" and "jamming". Then class RigFactory whose make(kind) returns a new instance for "cutter", "torch" or "jammer" and raises ValueError for anything else. Stretch: add register(kind, cls) so a fourth rig needs no edit to make.',
    'A dict from kind to class is the window. make looks the kind up and calls whatever it finds; a miss raises. No chain of ifs.',
`f = RigFactory()
f.make('torch').use()               # 'burning'
type(f.make('cutter')).__name__     # 'Cutter'
f.make('drill')                     # ValueError`),
  g('rigbuilder','E',70,'creation','Piece by piece','Builder',
    ['The rig for the next job gets ordered over three phone calls. Battery on Monday. Blade on Wednesday. Silent running, maybe, if the budget stretches.',
     'Dax\'s Rig takes eleven arguments, and every caller passes ten Nones to set the eleventh.',
     '“Take the order piece by piece,” Marguerite says. “Each call adds one thing and hands the order back. build() at the end turns the order into a rig. Nobody counts Nones.”'],
    'Write class Rig with battery (default 20), blade (default "steel") and silent (default False), and describe() returning "<blade> blade, <battery>Ah, silent" or "<blade> blade, <battery>Ah, loud". Then class RigBuilder with battery(n), blade(name) and silent(), each setting one thing and returning self, and build() returning a Rig. Stretch: two builders must never share state.',
    'The builder holds the three choices as fields. Each setter writes one field and returns self so the calls chain. build() hands the fields to Rig.'),
  g('oneradio','D',90,'creation','The only channel','Singleton',
    ['On the Halden job two radios came up on the same channel and talked over each other for eleven seconds. Eleven seconds is a guard.',
     'Dax: “So we pass the one radio to everybody.” “Through forty functions? No. There is one radio. Anyone who asks for it gets that one.”',
     '“Radio.get() hands back the same object every time. Build it on the first ask, remember it, never build another. And give the tests a way to put it back in the box.”'],
    'Write class Radio with an attribute freq (None to start), a method tune(freq) that stores it, a class method get() that returns the one shared instance (creating it on the first call), and a class method reset() that forgets the instance so the next get() builds a fresh one. Stretch: make Radio() itself return the shared instance.',
    'Keep the instance in a class attribute, not on any one object. get() checks it, builds once if it is empty, and returns it. reset() puts None back.',
`Radio.get() is Radio.get()   # True
Radio.get().tune(446.0)
Radio.get().freq             # 446.0
Radio.reset()
Radio.get().freq             # None`),
  g('catalogue','D',100,'creation','The parts catalogue','Factory with a registry',
    ['The fence\'s parts catalogue is a ring binder. New pages get pasted in. The clerk at the counter never changes; she reads the page for the name you say.',
     'Dax wants the factory to know every part. “Then the factory changes every week,” Marguerite says, “and the clerk is the one who breaks.”',
     '“Let the parts register themselves. A decorator on the class pastes its page in. build(kind, ...) reads the binder and calls what it finds.”'],
    'Write class Catalogue with register(kind), usable as a decorator on a class (@cat.register("cutter")), that records the class under kind and returns the class unchanged; kinds() returning the registered kinds sorted; and build(kind, **kw) constructing the registered class with the keyword arguments, raising KeyError for an unknown kind. Stretch: let register accept a plain function as a maker too.',
    'register(kind) returns a function that takes the class, stores it in a dict under kind, and returns it. That returned function is what the decorator syntax calls.'),
]},
];
export const ARCS_DATA = ARCS;
