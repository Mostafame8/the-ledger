-- Reference solutions for Arc III of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === perdept
SELECT dept, COUNT(*) AS n
FROM staff
WHERE dept IS NOT NULL
GROUP BY dept

-- === heavyhitters
SELECT from_acct, SUM(amount) AS total
FROM transfers
GROUP BY from_acct
HAVING SUM(amount) > 500000
ORDER BY total DESC

-- === busiestdoor
SELECT door, COUNT(*) AS n
FROM badges
GROUP BY door
ORDER BY n DESC
LIMIT 1

-- === byday
SELECT date(at) AS day, COUNT(*) AS n
FROM transfers
GROUP BY date(at)
ORDER BY day
