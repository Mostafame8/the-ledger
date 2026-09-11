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
{ name:'Arc III — The disguise', sub:'You cannot change what the fence sold you. You can dress it.', gates:[
  g('foreignplug','D',90,'structure','The wrong-shaped plug','Adapter',
    ['The fence\'s old safes take a number: crack(4417). The crew\'s hands, every one of them, speak strings: open("4417").',
     'Dax wants to rewrite the hands. “Forty places,” Marguerite says. “Or one plug.”',
     '“Wrap the old safe in something that answers open(code) the way the crew expects and turns the string into the number the safe wants. The safe never changes. The hands never know.”'],
    'Write class OldSafe with crack(code_int) returning True when code_int == 4417. Then class SafeAdapter built with an OldSafe, exposing open(code) that converts the string to an int and delegates to crack, returning False for a string that is not a number. Then open_all(safes, code) returning how many objects in the list opened, calling only open. Stretch: adapt a second old class with a different method name through the same open_all.',
    'The adapter holds the old safe and translates in one place: int(code) inside a try, then crack. open_all does not know an adapter from a native safe.',
`old = OldSafe()
old.crack(4417)                        # True
SafeAdapter(old).open('4417')          # True
SafeAdapter(old).open('abcd')          # False
open_all([SafeAdapter(old)], '4417')   # 1`),
  g('layers','D',100,'structure','Lining and plates','Decorator',
    ['One coat for the night. A lining sewn in if the wind is up. Plates strapped on if the guard is the kind who shoots first.',
     'Dax has LinedCoat, ArmouredCoat, LinedArmouredCoat and ArmouredLinedCoat. “I need a matrix,” he says.',
     '“You need layers,” Marguerite says. “Each layer takes any coat, adds its bit to the warmth and its word to the description, and is itself a coat. Stack them in any order.”'],
    'Write class Coat with warmth() returning 1 and describe() returning "coat". Then Lined(coat) and Armoured(coat), each built around any coat-like object: Lined adds 2 to the inner warmth and describes as "lined " + the inner description; Armoured adds 1 and "armoured " + inner. Stretch: add a third layer without touching the first two.',
    'Each wrapper stores the inner coat and answers both methods by asking the inner one and adjusting. Because the wrapper has the same two methods, it fits inside another wrapper.'),
  g('frontdesk','C',120,'structure','One desk, many doors','Facade',
    ['Three things happen when Marguerite says go: the camera loops, the guard gets a phone call, the vault hears the right code. Three systems, three manuals.',
     'Dax\'s go() is forty lines of calling into all three, in an order he has to look up each time.',
     '“One desk,” Marguerite says. “Job.run() knows the order and the manuals. The person who says go knows one word.”'],
    'Write three small classes: Vault with unlock() returning "vault open", Guard with distract() returning "guard busy", Camera with loop() returning "camera looping". Then class Job whose run() does the three in the order camera, guard, vault and returns their three strings as a list. Stretch: add a fourth step to run() without changing anyone who calls it.',
    'Job builds or is handed the three systems, and run() calls them in order, collecting the strings. Callers never touch a subsystem.'),
  g('wrappedhand','C',130,'structure','The wrapped hand','Function wrappers',
    ['Every function on the job needs a line in the log, and the flaky ones need a retry. Dax has typed log.append into thirty functions and got the name wrong in six.',
     '“Wrap the hand,” Marguerite says. “A wrapper takes a function and hands back a function that does the extra thing and then calls the original. The original never knows.”',
     '“Two wrappers. One writes the call to the log. One tries again until something comes back.”'],
    'Write logged(log), which returns a decorator: the decorated function appends "<name>(<args>)" to log, with the positional arguments joined by "," (so cut(3, 4) logs "cut(3,4)"), then calls the original and returns its result. Write retry(times), which returns a decorator: the decorated function is called up to times times and the first result that is not None is returned; if every try gives None, return None. Stretch: keep the wrapped function\'s __name__ with functools.wraps.',
    'A decorator factory has three layers: the outer takes the setting, the middle takes the function, the inner takes the call\'s arguments and does the work. fn.__name__ gives the log line its name.'),
]},
{ name:'Arc IV — The play', sub:'The plan changes at nine. Nobody rewrites the crew.', gates:[
  g('threeways','C',130,'behaviour','Three ways out','Strategy',
    ['The plan has three ways out of the bank: the sewer, the rooftops, a cab that is already paid for. Which one depends on what the street looks like at nine.',
     'Dax\'s Escape has an if for each route and a fourth branch he is not sure about. Every change to the sewer plan means reopening Escape.',
     '“The crew does not change at nine,” Marguerite says. “The route does. Hand Escape a route. Swap the route. Escape only ever says go.”'],
    'Write route classes Sewer, Rooftop and Cab, each with path(start) returning "<start> -> sewer", "<start> -> rooftop" and "<start> -> cab". Then class Escape built with a route, with go(start) returning route.path(start) and switch(route) replacing the route. Stretch: Escape must not name any route class.',
    'Escape stores whatever route it was handed and delegates go to it. switch replaces the stored route. Three classes with one method each is the whole trick.'),
  g('hearthewire','C',140,'behaviour','Everyone hears the wire','Observer',
    ['One tripwire on the back fence. When it goes, the driver needs to know, the lookout needs to know, and the fence needs to know to stop counting.',
     'Dax has the wire call each of them by name. Add a fourth ear and the wire changes again.',
     '“The wire does not know who is listening,” Marguerite says. “It keeps a list. Anyone can subscribe. When it trips, it tells the list, in the order they signed up.”'],
    'Write class Tripwire with subscribe(fn) that adds a callback and returns it, unsubscribe(fn) that removes it (safe to call for an unknown fn), and trip(where) that calls every subscriber with where, in subscription order, and returns how many were called. Stretch: a subscriber that raises must not stop the others.',
    'A list of callbacks. subscribe appends, unsubscribe removes if present, trip loops and counts. The wire never knows what a subscriber does with the news.'),
  g('takeitback','B',160,'behaviour','Take it back','Command',
    ['Dax is on the floor plan with the drill cart, moving it square by square. Three moves in he wants the second one back and cannot say what it was.',
     '“A move you cannot take back is not a move, it is a mistake,” Marguerite says. “Make each move an object that knows how to do itself and how to undo itself. Keep them on a stack.”',
     '“Then undo is pop and reverse. Redo is the same stack, the other way.”'],
    'Write class Move built with dx and dy, with do(pos) returning the new (x, y) tuple and undo(pos) returning the position before it. Then class Recorder with run(cmd, pos) that applies cmd and remembers it, returning the new position; undo(pos) that reverses the most recent command and returns the result (pos unchanged when there is nothing to undo); and redo(pos) that re-applies the most recently undone command (pos unchanged when there is nothing to redo). A new run after an undo clears the redo history. Stretch: a Say(text) command whose undo removes the text from a log.',
    'Two stacks: done and undone. run pushes onto done and clears undone. undo pops done, applies the command\'s undo, pushes onto undone. redo is the mirror.'),
  g('wireboard','B',170,'behaviour','The wire board','Event bus',
    ['The safehouse wire board has labelled channels: door, vault, street. The tripwire only talked about one thing. The board talks about everything, and nobody wants every message.',
     'Dax builds one Tripwire per channel and a dict to find them. Then he needs a channel that did not exist yesterday.',
     '“One board, many labels,” Marguerite says. “on(kind, fn) signs up for a label. emit(kind, payload) tells only that label\'s list. A label nobody asked for is not an error, it is silence.”'],
    'Write class Bus with on(kind, fn) that subscribes fn to kind, off(kind, fn) that removes it, and emit(kind, payload) that calls the subscribers of that kind only, in order, each with payload, returning how many were called (0 for a kind nobody subscribed to). Stretch: on("*", fn) hears every kind.',
    'A dict from kind to a list of callbacks. emit looks the kind up with an empty list as the default. Everything else is the tripwire again, once per label.'),
]},
];
export const ARCS_DATA = ARCS;
