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
];
export const ARCS_DATA = ARCS;
