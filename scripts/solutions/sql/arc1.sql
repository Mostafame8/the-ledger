-- Reference solutions for Arc I of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === pullnames
SELECT name, dept FROM staff WHERE dept = 'vault' ORDER BY name

-- === bigmoves
SELECT id, amount FROM transfers ORDER BY amount DESC LIMIT 5

-- === nightdoors
SELECT DISTINCT door FROM badges WHERE time(at) >= '22:00' OR time(at) < '06:00'

-- === howmany
SELECT COUNT(*) AS n FROM accounts WHERE kind = 'personal'
